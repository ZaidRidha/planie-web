/* Mock subscription/tier context for the partner portal.
   In production this would be backed by an auth/subscription service —
   the page treats it as the source of truth for tier-gated UI.

   Tiers: "Listed" | "Partner" | "Featured" */

const STORAGE_KEY = "planie:subscription-tier";
const EVENT = "planie:subscription-changed";
const DEFAULT_TIER = "Listed";

export const TIERS = ["Listed", "Partner", "Featured"];

const isValid = (t) => TIERS.includes(t);

export const getTier = () => {
  if (typeof window === "undefined") return DEFAULT_TIER;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return isValid(stored) ? stored : DEFAULT_TIER;
};

export const setTier = (tier) => {
  if (typeof window === "undefined") return;
  if (!isValid(tier)) return;
  window.localStorage.setItem(STORAGE_KEY, tier);
  window.dispatchEvent(new Event(EVENT));
};

export const isFeatured = (tier = getTier()) => tier === "Featured";

export const subscribeTier = (callback) => {
  if (typeof window === "undefined") return () => {};
  const handler = () => callback(getTier());
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", handler);
  };
};
