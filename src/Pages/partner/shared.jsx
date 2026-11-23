import { useState, useEffect, useCallback } from "react";
import { Sparkles, Tag, Percent, Gift } from "lucide-react";
import { fetchMyPromotions } from "../../utils/promotions";
import { fetchMyListings, toCardShape } from "../../utils/listings";
import "../PartnerDashboard.css";

/* ─── Helpers ─── */
/* Loads the signed-in partner's real listings; null while loading. */
export function useMyListings() {
  const [items, setItems] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const reload = useCallback(async () => {
    try {
      const { items: raw } = await fetchMyListings();
      setItems((raw ?? []).map(toCardShape));
      setLoadError(null);
    } catch (err) {
      setItems([]);
      setLoadError(err.message || "Could not load listings.");
    }
  }, []);
  useEffect(() => { reload(); }, [reload]);
  return { items, loadError, reload };
}

/* Loads the signed-in partner's real promotions; null while loading.
   Pass enabled=false when the data arrives via props instead. */
export function useMyPromotions(enabled = true) {
  const [items, setItems] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const reload = useCallback(async () => {
    if (!enabled) return;
    try {
      const { items: raw } = await fetchMyPromotions();
      setItems(raw ?? []);
      setLoadError(null);
    } catch (err) {
      setItems([]);
      setLoadError(err.message || "Could not load promotions.");
    }
  }, [enabled]);
  useEffect(() => { reload(); }, [reload]);
  return { items, loadError, reload };
}

/* The form fields a promotion round-trips through partnerUpdatePromotion.
   Needed because "submit for review" resends content alongside the flag. */
export const promoFormFields = (p) => ({
  title: p.title || "",
  offerType: p.offerType || "",
  discountValue: p.discountValue || "",
  discountCode: p.discountCode || "",
  applicableOccasions: p.applicableOccasions || [],
  validityType: p.validityType || "always",
  validityFrom: p.validityFrom || "",
  validityTo: p.validityTo || "",
  validityDays: p.validityDays || [],
  validityTimeFrom: p.validityTimeFrom || "",
  validityTimeTo: p.validityTimeTo || "",
  minBookingSize: p.minBookingSize || "",
  internalNote: p.internalNote || "",
});


/* ─── Billing: tier catalog copy (prices come live from Stripe) ─── */
export const TIER_PLANS = [
  {
    tier: "Listed",
    features: ["Listings in the Planie app", "Promotions on your listings", "Staff-reviewed publishing", "Email support"],
  },
  {
    tier: "Partner",
    popular: true,
    features: ["Everything in Listed", "Priority placement in Featured", "Priority listing review", "Priority support"],
  },
  {
    tier: "Featured",
    features: ["Everything in Partner", "Access to Campaigns", "Top placement in Featured", "Dedicated support"],
  },
];

export const fmtMoney = (amount, currency) =>
  amount == null
    ? null
    : new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: (currency || "eur").toUpperCase(),
      }).format(amount / 100);

export const fmtUnixDate = (unix) =>
  unix
    ? new Date(unix * 1000).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
    : null;


/* ─── Promotions Tab ─── */
export const offerTypeMeta = {
  percentage: { icon: Percent, label: "% off" },
  fixed: { icon: Tag, label: "£ off" },
  free_item: { icon: Gift, label: "Free item" },
  custom: { icon: Sparkles, label: "Custom" },
};

export const promoStatusLabel = {
  draft: "Draft",
  pending: "In review",
  active: "Live",
  denied: "Denied",
  inactive: "Paused",
};

export function formatPromoValue(p) {
  if (!p.offerType) return "";
  if (p.offerType === "percentage") return p.discountValue ? `${p.discountValue}% off` : "—";
  if (p.offerType === "fixed") return p.discountValue ? `£${p.discountValue} off` : "—";
  return p.discountValue || "—";
}

export function formatValidity(p) {
  if (p.validityType === "always") return "Always on";
  if (
    p.validityType === "custom" ||
    p.validityType === "days_of_week" ||
    p.validityType === "date_range"
  ) {
    const days = (p.validityDays || []).join(", ");
    const hasTimes = p.validityTimeFrom || p.validityTimeTo;
    const hasRange = p.validityFrom || p.validityTo;
    if (!days && !hasTimes && !hasRange) return "Custom — not set";
    const parts = [];
    if (hasRange) parts.push(`${p.validityFrom || "?"} → ${p.validityTo || "?"}`);
    if (days || hasTimes) {
      const dayPart = days || "Any day";
      const timePart = hasTimes
        ? `${p.validityTimeFrom || "00:00"}–${p.validityTimeTo || "23:59"}`
        : "";
      parts.push(timePart ? `${dayPart}, ${timePart}` : dayPart);
    }
    return parts.join(" · ");
  }
  return "";
}

/* Relative "edited N ago" label for draft cards. */
export function formatDraftTimestamp(ms) {
  if (!ms) return "just now";
  const mins = Math.floor((Date.now() - ms) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(ms).toLocaleDateString();
}
