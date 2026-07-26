/* Campaigns — real API (Phase 5). The localStorage mock is gone.

   Split of responsibilities:
   - The CATALOG (surfaces, windows, cities, occasions, display pricing) is
     mirrored here for instant rendering. The backend keeps the same constants
     (functions/src/website/partnerCampaigns.ts) and is authoritative — it
     recomputes prices at purchase time and rejects unknown combinations, so
     drift can never change what a partner is charged.
   - INVENTORY and PURCHASES live in Firestore behind partner endpoints. This
     module keeps a small cache so the page's original sync accessors
     (listInventoryForWindow / listOwned / getBundleSlots) still work; call
     the async refresh* functions to (re)populate, and subscribe* fires after
     every refresh exactly like the mock's storage events did.
   - Purchases now go through Stripe Checkout (one-off payment). purchaseSlot
     and purchaseBundle return { ok: true, url } — redirect the browser to
     `url`; the backend holds the slot for 30 minutes, and the webhook marks
     it paid. Cancelling returns to /partners/campaigns?campaign=cancelled,
     where releaseCancelledCheckout frees the hold. */

import { callFunction } from "./api";

export const SURFACES = [
  {
    id: "homepage",
    label: "Homepage Strip",
    short: "Homepage",
    blurb: "Featured placement on the Planie home screen for every user opening the app in your city during your campaign window.",
    price: 149,
    perOccasion: false,
    capacity: 8,
  },
  {
    id: "category",
    label: "Category Page",
    short: "Category",
    blurb: "Top-of-page placement in the occasion category that matches your venue.",
    price: 99,
    perOccasion: true,
    capacity: 5,
  },
  {
    id: "guide",
    label: "AI Guide Placement",
    short: "AI Guide",
    blurb: "Featured in Planie's AI-generated local guides for your occasion type.",
    price: 79,
    perOccasion: true,
    capacity: 4,
  },
];

export const BUNDLE_PRICE = 279;
export const BUNDLE_LIST_PRICE = 149 + 99 + 79; // 327
export const BUNDLE_SAVING = BUNDLE_LIST_PRICE - BUNDLE_PRICE; // 48
export const MULTI_SLOT_DISCOUNT_PCT = 10;
export const MULTI_SLOT_THRESHOLD = 3;

/* Window templates — months/days only; the actual year rolls forward
   so we never display a window whose end date has already passed.
   (Must stay in sync with WINDOW_TEMPLATES in partnerCampaigns.ts.) */
const WINDOW_TEMPLATES = [
  { id: "new-year",   label: "New Year",    startMonth: 11, startDay: 28, endMonth: 0,  endDay: 11, durationLabel: "2-week", durationDays: 14 },
  { id: "valentines", label: "Valentine's", startMonth: 1,  startDay: 8,  endMonth: 1,  endDay: 15, durationLabel: "1-week", durationDays: 7  },
  { id: "spring",     label: "Spring",      startMonth: 2,  startDay: 16, endMonth: 2,  endDay: 30, durationLabel: "2-week", durationDays: 14 },
  { id: "summer",     label: "Summer",      startMonth: 5,  startDay: 22, endMonth: 6,  endDay: 6,  durationLabel: "2-week", durationDays: 14 },
  { id: "halloween",  label: "Halloween",   startMonth: 9,  startDay: 19, endMonth: 10, endDay: 2,  durationLabel: "2-week", durationDays: 14 },
  { id: "christmas",  label: "Christmas",   startMonth: 11, startDay: 14, endMonth: 11, endDay: 28, durationLabel: "2-week", durationDays: 14 },
];

const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const fmtDate = (d) => `${MONTH_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;

const nextOccurrence = (template, now) => {
  const tryYear = (y) => {
    const start = new Date(y, template.startMonth, template.startDay);
    const endYear = template.endMonth < template.startMonth ? y + 1 : y;
    const end = new Date(endYear, template.endMonth, template.endDay, 23, 59, 59, 999);
    return { start, end };
  };
  const year = now.getFullYear();
  for (const y of [year - 1, year, year + 1, year + 2]) {
    const occ = tryYear(y);
    if (occ.end >= now) return occ;
  }
  return tryYear(year + 1);
};

const buildWindow = (template, now = new Date()) => {
  const { start, end } = nextOccurrence(template, now);
  const targetYear = template.endMonth < template.startMonth
    ? end.getFullYear()
    : start.getFullYear();
  return {
    id: template.id,
    label: template.label,
    start: fmtDate(start),
    end: fmtDate(end),
    startTs: start.getTime(),
    endTs: end.getTime(),
    year: targetYear,
    durationLabel: template.durationLabel,
    durationDays: template.durationDays,
  };
};

export const WINDOWS = WINDOW_TEMPLATES
  .map((t) => buildWindow(t))
  .sort((a, b) => a.startTs - b.startTs);

export const CITIES = [
  "London", "Manchester", "Edinburgh", "Bristol", "Birmingham", "Glasgow",
  "Leeds", "Liverpool", "Newcastle", "Nottingham", "Sheffield", "Cardiff",
  "Belfast", "Brighton", "Cambridge", "Oxford", "Bath", "York", "Aberdeen",
  "Dundee", "Southampton", "Portsmouth", "Leicester", "Coventry", "Norwich",
  "Reading", "Plymouth", "Hull", "Exeter", "Inverness",
];
export const OCCASIONS = ["Date Night", "Groups", "Families", "Experiences"];

export const getWindow = (id) => WINDOWS.find((w) => w.id === id) || null;
export const getSurface = (id) => SURFACES.find((s) => s.id === id) || null;

/* Prices scale with window duration — base prices are for a 2-week slot.
   Display only; the backend recomputes the amount actually charged. */
export const windowPricing = (windowId) => {
  const w = getWindow(windowId);
  const ratio = (w?.durationDays ?? 14) / 14;
  const surfacePrices = {};
  for (const s of SURFACES) surfacePrices[s.id] = Math.round(s.price * ratio);
  const bundlePrice = Math.round(BUNDLE_PRICE * ratio);
  const bundleListPrice = Math.round(BUNDLE_LIST_PRICE * ratio);
  return {
    durationLabel: w?.durationLabel ?? "2-week",
    durationDays: w?.durationDays ?? 14,
    surfacePrices,
    bundlePrice,
    bundleListPrice,
    bundleSaving: bundleListPrice - bundlePrice,
  };
};

/* ————— cache + events (same subscribe API the mock had) ————— */

const INVENTORY_EVENT = "planie:campaign-inventory-changed";
const OWNED_EVENT = "planie:campaign-owned-changed";

const inventoryCache = {}; // windowId → slots[]
let ownedCache = [];

const emit = (name) => window.dispatchEvent(new Event(name));

export const refreshInventory = async (windowId) => {
  const { slots } = await callFunction(
    `partnerListCampaignInventory?windowId=${encodeURIComponent(windowId)}`,
    null,
    { method: "GET" }
  );
  inventoryCache[windowId] = slots;
  emit(INVENTORY_EVENT);
  return slots;
};

export const refreshOwned = async () => {
  const { items } = await callFunction("partnerListCampaignPurchases", null, { method: "GET" });
  ownedCache = items;
  emit(OWNED_EVENT);
  return listOwned();
};

export const listInventoryForWindow = (windowId) => inventoryCache[windowId] || [];

const deriveStatus = (purchase, now) => {
  if (purchase.status === "pending_payment") return "Processing";
  const start = new Date(purchase.windowStart).getTime();
  const end = new Date(purchase.windowEnd).setHours(23, 59, 59, 999);
  if (Number.isNaN(start) || Number.isNaN(end)) return "Upcoming";
  if (now < start) return "Upcoming";
  if (now > end) return "Expired";
  return "Active";
};

export const listOwned = () => {
  const now = Date.now();
  return ownedCache
    .map((p) => ({ ...p, status: deriveStatus(p, now) }))
    .sort((a, b) => (b.purchasedAt || 0) - (a.purchasedAt || 0));
};

/* The 3 slots that make up a bundle, out of the cached inventory. */
export const getBundleSlots = ({ windowId, city, occasion }) => {
  const slots = listInventoryForWindow(windowId);
  const find = (surfaceId, occ) =>
    slots.find((s) => s.surfaceId === surfaceId && s.city === city && s.occasion === occ) || null;
  return [find("homepage", null), find("category", occasion), find("guide", occasion)];
};

/* ————— purchases (Stripe Checkout redirects) ————— */

const purchaseErrorShape = (err) => ({
  ok: false,
  reason:
    err?.code === "SOLD_OUT" ? "sold_out" :
    err?.code === "PAYMENTS_NOT_CONFIGURED" ? "payments_not_configured" :
    err?.code === "FEATURED_REQUIRED" ? "featured_required" :
    err?.code === "LISTING_REQUIRED" ? "listing_required" : "error",
  soldOutSurfaceId: err?.data?.soldOutSurfaceId ?? null,
});

/* { ok: true, url } on success — send the browser to `url` (Stripe Checkout).
   listingId (a Featured-tier listing) is required: a campaign is bought FOR
   one venue since billing went per-listing. */
export const purchaseSlot = async (slot, listingId) => {
  try {
    const { url } = await callFunction("partnerPurchaseCampaign", {
      listingId,
      windowId: slot.windowId,
      city: slot.city,
      surfaceId: slot.surfaceId,
      occasion: slot.occasion ?? null,
    });
    return { ok: true, url };
  } catch (err) {
    return purchaseErrorShape(err);
  }
};

export const purchaseBundle = async ({ windowId, city, occasion, listingId }) => {
  try {
    const { url } = await callFunction("partnerPurchaseCampaign", {
      listingId,
      windowId,
      city,
      occasion,
      bundle: true,
    });
    return { ok: true, url };
  } catch (err) {
    return purchaseErrorShape(err);
  }
};

/* Frees the hold after a cancelled checkout (plus any expired holds). */
export const releaseCancelledCheckout = async (sessionId) => {
  try {
    await callFunction("partnerReleaseCampaignCheckout", { sessionId: sessionId || null });
  } catch {
    /* Non-fatal — expired holds are also released server-side on later calls. */
  }
};

/* Assign listings (by id) to a paid campaign; bundles stay in sync server-side. */
export const assignListingsToPurchase = async (purchaseId, listingIds) => {
  try {
    await callFunction("partnerAssignCampaignListings", { purchaseId, listingIds });
    await refreshOwned();
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: err?.code === "NOT_PAID" ? "not_paid" : "error" };
  }
};

export const subscribeInventory = (callback) => {
  if (typeof window === "undefined") return () => {};
  const handler = () => callback(inventoryCache);
  window.addEventListener(INVENTORY_EVENT, handler);
  return () => window.removeEventListener(INVENTORY_EVENT, handler);
};

export const subscribeOwned = (callback) => {
  if (typeof window === "undefined") return () => {};
  const handler = () => callback(listOwned());
  window.addEventListener(OWNED_EVENT, handler);
  return () => window.removeEventListener(OWNED_EVENT, handler);
};
