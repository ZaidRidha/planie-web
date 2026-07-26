/* Tier + billing service for the partner portal.

   Billing is PER-LISTING (rework 2026-07-25): each listing has its own tier
   and Stripe subscription. partners/{uid}.tier is a DERIVED value = the
   highest tier across the partner's listings, written by the backend webhook.
   PartnerAuthContext pushes each loaded profile into syncTierFromProfile(), so
   the account-level helpers below (used by the sidebar + campaigns gate) keep
   working: getTier() = account max, isFeatured() = "has a Featured listing".

   Tiers: "Listed" (free) | "Partner" | "Featured" */

import { callFunction } from "./api";

const EVENT = "planie:subscription-changed";
const DEFAULT_TIER = "Listed";

export const TIERS = ["Listed", "Partner", "Featured"];

let currentTier = DEFAULT_TIER;

export const getTier = () => currentTier;

export const isFeatured = (tier = getTier()) => tier === "Featured";

/* Called by PartnerAuthContext whenever the partner profile (re)loads or the
   user signs out (profile = null). */
export const syncTierFromProfile = (profile) => {
  const next = TIERS.includes(profile?.tier) ? profile.tier : DEFAULT_TIER;
  if (next === currentTier) return;
  currentTier = next;
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENT));
};

export const subscribeTier = (callback) => {
  if (typeof window === "undefined") return () => {};
  const handler = () => callback(getTier());
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
};

/* ── Billing API (Billing tab) — per-listing ── */

/* Returns:
   { tier (account max), listings: [{listingId, name, tier, status,
     currentPeriodEnd, cancelAtPeriodEnd, amount}],
     plans: [{tier, amount, currency, interval, lookupKey}],
     stripeConfigured, summary: {counts, currency, grossMonthly,
     discountMonthly, netMonthly, volumePct}, invoices: [...] } */
export const fetchBilling = () =>
  callFunction("partnerGetBilling", null, { method: "GET" });

/* Redirects to Stripe Checkout to put ONE listing on a paid tier. */
export const startListingCheckout = async (listingId, tier) => {
  const { url } = await callFunction("partnerCreateCheckoutSession", { listingId, tier });
  window.location.assign(url);
};

/* Change an already-subscribed listing's plan (Partner<->Featured, or ->Listed
   to cancel at period end). Does NOT redirect — refresh billing after. */
export const changeListingPlan = (listingId, tier) =>
  callFunction("partnerChangeListingPlan", { listingId, tier });

/* Redirects to the Stripe Customer Portal (cards, invoices, cancel). */
export const openBillingPortal = async () => {
  const { url } = await callFunction("partnerCreatePortalSession", {});
  window.location.assign(url);
};
