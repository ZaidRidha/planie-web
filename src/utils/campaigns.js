/* Mock campaigns inventory + purchase API.
   In production all pricing/inventory would come from the backend
   with server-side tier checks and an optimistic lock on purchase. */

const INVENTORY_KEY = "planie:campaign-inventory";
const OWNED_KEY = "planie:campaign-owned";
const SCHEMA_VERSION = 2;
const INVENTORY_EVENT = "planie:campaign-inventory-changed";
const OWNED_EVENT = "planie:campaign-owned-changed";

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
   so we never display a window whose end date has already passed. */
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

/* Find the next instance of a window template whose end date is >= now.
   Considers the prior calendar year first to handle windows that wrap
   year-end (e.g. New Year: Dec 28 → Jan 11). */
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
  /* Target year — for windows that span year-end (New Year), the
     "celebration" year is the end year; for everything else it's the start. */
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
  "London",
  "Manchester",
  "Edinburgh",
  "Bristol",
  "Birmingham",
  "Glasgow",
  "Leeds",
  "Liverpool",
  "Newcastle",
  "Nottingham",
  "Sheffield",
  "Cardiff",
  "Belfast",
  "Brighton",
  "Cambridge",
  "Oxford",
  "Bath",
  "York",
  "Aberdeen",
  "Dundee",
  "Southampton",
  "Portsmouth",
  "Leicester",
  "Coventry",
  "Norwich",
  "Reading",
  "Plymouth",
  "Hull",
  "Exeter",
  "Inverness",
];
export const OCCASIONS = ["Date Night", "Groups", "Families", "Experiences"];

const safeParse = (raw, fallback) => {
  try {
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

/* Deterministic 32-bit hash (xfnv1a-ish) so seeded inventory is reproducible. */
const hashString = (str) => {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h >>> 0;
};

const seededRemaining = (capacity, ...parts) => {
  const h = hashString(parts.join("|"));
  // ~70% of slots stay close to full, ~20% mid, ~10% sold out
  const r = (h % 100) / 100;
  if (r < 0.10) return 0;
  if (r < 0.30) return Math.max(1, Math.floor(capacity * 0.4));
  if (r < 0.60) return Math.max(1, Math.floor(capacity * 0.7));
  return capacity;
};

const buildSlotId = ({ windowId, surfaceId, city, occasion }) =>
  occasion
    ? `${windowId}__${surfaceId}__${city}__${occasion}`.toLowerCase().replace(/\s+/g, "-")
    : `${windowId}__${surfaceId}__${city}`.toLowerCase().replace(/\s+/g, "-");

const buildInitialInventory = () => {
  const slots = {};
  for (const w of WINDOWS) {
    for (const surface of SURFACES) {
      const occasions = surface.perOccasion ? OCCASIONS : [null];
      for (const city of CITIES) {
        for (const occasion of occasions) {
          const id = buildSlotId({ windowId: w.id, surfaceId: surface.id, city, occasion });
          slots[id] = {
            id,
            windowId: w.id,
            surfaceId: surface.id,
            city,
            occasion,
            capacity: surface.capacity,
            remaining: seededRemaining(surface.capacity, w.id, surface.id, city, occasion || ""),
          };
        }
      }
    }
  }
  return { schemaVersion: SCHEMA_VERSION, slots };
};

const readInventory = () => {
  if (typeof window === "undefined") return buildInitialInventory();
  const raw = window.localStorage.getItem(INVENTORY_KEY);
  const parsed = raw ? safeParse(raw, null) : null;
  if (!parsed || parsed.schemaVersion !== SCHEMA_VERSION || !parsed.slots) {
    const fresh = buildInitialInventory();
    window.localStorage.setItem(INVENTORY_KEY, JSON.stringify(fresh));
    return fresh;
  }
  return parsed;
};

const writeInventory = (inv) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(INVENTORY_KEY, JSON.stringify(inv));
  window.dispatchEvent(new Event(INVENTORY_EVENT));
};

const readOwned = () => {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(OWNED_KEY);
  return Array.isArray(safeParse(raw, [])) ? safeParse(raw, []) : [];
};

const writeOwned = (owned) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(OWNED_KEY, JSON.stringify(owned));
  window.dispatchEvent(new Event(OWNED_EVENT));
};

const newPurchaseId = () =>
  `cp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

export const getWindow = (id) => WINDOWS.find((w) => w.id === id) || null;
export const getSurface = (id) => SURFACES.find((s) => s.id === id) || null;

/* Prices scale with window duration — base prices are for a 2-week slot. */
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

export const listInventoryForWindow = (windowId) => {
  const inv = readInventory();
  return Object.values(inv.slots).filter((s) => s.windowId === windowId);
};

export const listOwned = () => {
  const owned = readOwned();
  const now = Date.now();
  return owned
    .map((p) => ({ ...p, status: deriveStatus(p, now) }))
    .sort((a, b) => (b.purchasedAt || 0) - (a.purchasedAt || 0));
};

const deriveStatus = (purchase, now) => {
  /* Read dates the purchase was recorded with — not the current rolled window —
     so a purchase made for a 2026 instance still reads as Expired even after
     the WINDOWS array has rolled forward to 2027. */
  const start = new Date(purchase.windowStart).getTime();
  const end = new Date(purchase.windowEnd).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return "Upcoming";
  if (now < start) return "Upcoming";
  if (now > end) return "Expired";
  return "Active";
};

/* Look up the 3 slots that make up a bundle for a given window/city/occasion. */
export const getBundleSlots = ({ windowId, city, occasion }) => {
  const inv = readInventory();
  const ids = [
    buildSlotId({ windowId, surfaceId: "homepage", city, occasion: null }),
    buildSlotId({ windowId, surfaceId: "category", city, occasion }),
    buildSlotId({ windowId, surfaceId: "guide",    city, occasion }),
  ];
  return ids.map((id) => inv.slots[id] || null);
};

/* Atomic 3-slot bundle purchase. All-or-nothing — fails if any leg is sold out. */
export const purchaseBundle = ({ windowId, city, occasion }) => {
  const inv = readInventory();
  const slots = getBundleSlots({ windowId, city, occasion });
  if (slots.some((s) => !s)) return { ok: false, reason: "not_found" };
  const soldOut = slots.find((s) => s.remaining <= 0);
  if (soldOut) return { ok: false, reason: "sold_out", soldOutSurfaceId: soldOut.surfaceId };

  const updatedSlots = { ...inv.slots };
  for (const slot of slots) {
    updatedSlots[slot.id] = { ...slot, remaining: slot.remaining - 1 };
  }
  writeInventory({ ...inv, slots: updatedSlots });

  const now = Date.now();
  const w = getWindow(windowId);
  const pricing = windowPricing(windowId);
  const bundleId = `cb_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  const newPurchases = slots.map((slot) => ({
    id: newPurchaseId(),
    bundleId,
    slotId: slot.id,
    windowId: slot.windowId,
    surfaceId: slot.surfaceId,
    city: slot.city,
    occasion: slot.occasion,
    price: pricing.surfacePrices[slot.surfaceId] ?? 0,
    windowStart: w?.start || "",
    windowEnd: w?.end || "",
    purchasedAt: now,
    listingSlugs: [],
  }));
  const owned = readOwned();
  writeOwned([...newPurchases, ...owned]);
  return { ok: true, bundleId, purchases: newPurchases };
};

/* Optimistic-lock-style purchase: re-reads inventory at commit time and
   refuses if the slot is now sold out. */
export const purchaseSlot = (slotId) => {
  const inv = readInventory();
  const slot = inv.slots[slotId];
  if (!slot) return { ok: false, reason: "not_found" };
  if (slot.remaining <= 0) return { ok: false, reason: "sold_out" };

  const updated = {
    ...inv,
    slots: {
      ...inv.slots,
      [slotId]: { ...slot, remaining: slot.remaining - 1 },
    },
  };
  writeInventory(updated);

  const now = Date.now();
  const w = getWindow(slot.windowId);
  const pricing = windowPricing(slot.windowId);
  const purchase = {
    id: newPurchaseId(),
    slotId,
    windowId: slot.windowId,
    surfaceId: slot.surfaceId,
    city: slot.city,
    occasion: slot.occasion,
    price: pricing.surfacePrices[slot.surfaceId] ?? 0,
    windowStart: w?.start || "",
    windowEnd: w?.end || "",
    purchasedAt: now,
    listingSlugs: [],
  };
  const owned = readOwned();
  writeOwned([purchase, ...owned]);
  return { ok: true, purchase };
};

/* Assign listings to a campaign purchase. If the purchase is part of a bundle
   the assignment propagates to all bundle members so the venue's listing
   selection stays consistent across the 3 surfaces. */
export const assignListingsToPurchase = (purchaseId, slugs) => {
  const owned = readOwned();
  const target = owned.find((p) => p.id === purchaseId);
  if (!target) return { ok: false, reason: "not_found" };
  const list = Array.isArray(slugs) ? [...new Set(slugs)] : [];
  const updated = owned.map((p) => {
    const matchBundle = target.bundleId && p.bundleId === target.bundleId;
    if (matchBundle || p.id === purchaseId) return { ...p, listingSlugs: list };
    return p;
  });
  writeOwned(updated);
  return { ok: true };
};

export const subscribeInventory = (callback) => {
  if (typeof window === "undefined") return () => {};
  const handler = () => callback(readInventory());
  window.addEventListener(INVENTORY_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(INVENTORY_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
};

export const subscribeOwned = (callback) => {
  if (typeof window === "undefined") return () => {};
  const handler = () => callback(listOwned());
  window.addEventListener(OWNED_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(OWNED_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
};
