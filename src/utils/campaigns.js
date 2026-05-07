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

export const WINDOWS = [
  { id: "new-year",   label: "New Year",     start: "Dec 28, 2026", end: "Jan 11, 2027", durationLabel: "2-week", durationDays: 14 },
  { id: "valentines", label: "Valentine's",  start: "Feb 8, 2026",  end: "Feb 15, 2026",  durationLabel: "1-week", durationDays: 7  },
  { id: "spring",     label: "Spring",       start: "Mar 16, 2026", end: "Mar 30, 2026", durationLabel: "2-week", durationDays: 14 },
  { id: "summer",     label: "Summer",       start: "Jun 22, 2026", end: "Jul 6, 2026",  durationLabel: "2-week", durationDays: 14 },
  { id: "halloween",  label: "Halloween",    start: "Oct 19, 2026", end: "Nov 2, 2026",  durationLabel: "2-week", durationDays: 14 },
  { id: "christmas",  label: "Christmas",    start: "Dec 14, 2026", end: "Dec 28, 2026", durationLabel: "2-week", durationDays: 14 },
];

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
  const w = getWindow(purchase.windowId);
  if (!w) return "Upcoming";
  const start = new Date(w.start).getTime();
  const end = new Date(w.end).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return "Upcoming";
  if (now < start) return "Upcoming";
  if (now > end) return "Expired";
  return "Active";
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
  const surface = getSurface(slot.surfaceId);
  const purchase = {
    id: newPurchaseId(),
    slotId,
    windowId: slot.windowId,
    surfaceId: slot.surfaceId,
    city: slot.city,
    occasion: slot.occasion,
    price: surface?.price ?? 0,
    windowStart: w?.start || "",
    windowEnd: w?.end || "",
    purchasedAt: now,
  };
  const owned = readOwned();
  writeOwned([purchase, ...owned]);
  return { ok: true, purchase };
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
