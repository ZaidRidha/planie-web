/* Promotions API — real backend calls for the partner portal.

   Same review model as listings (owner decision 2026-07-11): a promotion is
   drafted, then submitted into the staff review queue before going live.
   Status flow: draft → pending → active | denied (+ inactive toggle).

   Rule: at most ONE active promotion per listing. The backend enforces it and
   answers 409 with code "PROMO_CONFLICT" and `data.conflict = { id, title }`
   so the UI can offer "deactivate the old one & submit". */

import { callFunction } from "./api";

export const emptyPromotion = () => ({
  id: "",
  listingId: "",
  offerType: "",
  discountValue: "",
  discountCode: "",
  applicableOccasions: [],
  validityType: "always",
  validityFrom: "",
  validityTo: "",
  validityDays: [],
  validityTimeFrom: "",
  validityTimeTo: "",
  minBookingSize: "",
  title: "",
  internalNote: "",
  status: "draft",
});

export const fetchMyPromotions = () =>
  callFunction("partnerListPromotions", null, { method: "GET" });

export const fetchPromotion = (id) =>
  callFunction(`partnerGetPromotion?id=${encodeURIComponent(id)}`, null, { method: "GET" });

/* submit: false → saved as draft; true → straight into the review queue. */
export const createPromotion = (form, { submit = false } = {}) =>
  callFunction("partnerCreatePromotion", { ...form, submit });

/* Content edits land in "draft" (submit: false) or "pending" (submit: true). */
export const updatePromotion = (id, form, { submit = false } = {}) =>
  callFunction("partnerUpdatePromotion", { id, ...form, submit });

/* Pause/resume an approved promotion without re-review. */
export const deactivatePromotion = (id) =>
  callFunction("partnerUpdatePromotion", { id, action: "deactivate" });
export const reactivatePromotion = (id) =>
  callFunction("partnerUpdatePromotion", { id, action: "reactivate" });

export const deletePromotion = (id) => callFunction("partnerDeletePromotion", { id });
