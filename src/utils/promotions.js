const STORAGE_KEY = "planie:promotions";

const safeParse = (raw) => {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const read = () => {
  if (typeof window === "undefined") return [];
  return safeParse(window.localStorage.getItem(STORAGE_KEY));
};

const write = (promos) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(promos));
  window.dispatchEvent(new Event("planie:promotions-changed"));
};

const newId = () =>
  `pm_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

export const emptyPromotion = () => ({
  id: "",
  listingSlug: "",
  offerType: "",
  discountValue: "",
  discountCode: "",
  applicableOccasions: [],
  validityType: "always",
  validityFrom: "",
  validityTo: "",
  validityDays: [],
  minBookingSize: "",
  title: "",
  internalNote: "",
  status: "draft",
  createdAt: 0,
  updatedAt: 0,
});

export const listPromotions = () =>
  read().sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

export const listPromotionsForListing = (slug) =>
  listPromotions().filter((p) => p.listingSlug === slug);

export const getPromotion = (id) => read().find((p) => p.id === id) || null;

export const getActivePromotionForListing = (slug) =>
  read().find((p) => p.listingSlug === slug && p.status === "active") || null;

export const savePromotion = (promo) => {
  const all = read();
  const now = Date.now();
  const existing = promo.id ? all.find((p) => p.id === promo.id) : null;
  const next = {
    ...promo,
    id: promo.id || newId(),
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };
  const idx = all.findIndex((p) => p.id === next.id);
  if (idx >= 0) all[idx] = next;
  else all.push(next);
  write(all);
  return next;
};

export const publishPromotion = (id) => {
  const all = read();
  const target = all.find((p) => p.id === id);
  if (!target) return { ok: false, reason: "not_found" };

  const conflict = all.find(
    (p) => p.id !== id && p.listingSlug === target.listingSlug && p.status === "active"
  );
  if (conflict) return { ok: false, reason: "conflict", conflict };

  const now = Date.now();
  const updated = all.map((p) =>
    p.id === id ? { ...p, status: "active", updatedAt: now } : p
  );
  write(updated);
  return { ok: true, promotion: updated.find((p) => p.id === id) };
};

export const deactivatePromotion = (id) => {
  const all = read();
  const now = Date.now();
  const updated = all.map((p) =>
    p.id === id ? { ...p, status: "draft", updatedAt: now } : p
  );
  write(updated);
};

export const deletePromotion = (id) => {
  write(read().filter((p) => p.id !== id));
};

export const subscribePromotions = (callback) => {
  if (typeof window === "undefined") return () => {};
  const handler = () => callback(listPromotions());
  window.addEventListener("planie:promotions-changed", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("planie:promotions-changed", handler);
    window.removeEventListener("storage", handler);
  };
};

