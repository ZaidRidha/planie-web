/* Staff/admin API — review queues for business verifications, listings and
   promotions. Every endpoint re-checks the admin role server-side. */

import { callFunction } from "./api";

export const listPendingVerifications = () =>
  callFunction("adminListVerifications", null, { method: "GET" });

/* decision: "verified" | "denied" (reason required when denying) */
export const reviewVerification = (uid, decision, reason) =>
  callFunction("adminReviewVerification", { uid, decision, reason });

export const listPendingListings = () =>
  callFunction("adminListPendingListings", null, { method: "GET" });

/* decision: "active" | "denied" (reason required when denying) */
export const reviewListing = (id, decision, reason) =>
  callFunction("adminReviewListing", { id, decision, reason });

export const listPendingPromotions = () =>
  callFunction("adminListPendingPromotions", null, { method: "GET" });

/* decision: "active" | "denied" (reason required when denying) */
export const reviewPromotion = (id, decision, reason) =>
  callFunction("adminReviewPromotion", { id, decision, reason });
