/* Listings API — real backend calls for the partner portal.

   Status flow: pending → active | denied (+ inactive toggle). New listings and
   edits both wait for staff approval in the admin review queue.

   The legacy mock exports at the bottom are kept ONLY for Campaigns.jsx and
   die with Phase 5 — do not use them in new code. */

import { callFunction } from "./api";

export const fetchMyListings = () =>
  callFunction("partnerListListings", null, { method: "GET" });

export const fetchListing = (id) =>
  callFunction(`partnerGetListing?id=${encodeURIComponent(id)}`, null, { method: "GET" });

/* Creates and submits for review → status "pending". */
export const createListing = (form) => callFunction("partnerCreateListing", form);

/* Content edits send the listing back to review → "pending". */
export const updateListing = (id, form) =>
  callFunction("partnerUpdateListing", { id, ...form });

/* Pause/resume an approved listing without re-review. */
export const deactivateListing = (id) =>
  callFunction("partnerUpdateListing", { id, action: "deactivate" });
export const reactivateListing = (id) =>
  callFunction("partnerUpdateListing", { id, action: "reactivate" });

export const deleteListing = (id) => callFunction("partnerDeleteListing", { id });

/* UI-friendly shape used by the dashboard cards. Analytics numbers are 0
   until the data platform (Phase 6) exists. */
export const toCardShape = (l) => ({
  id: l.id,
  name: l.name || "Untitled",
  category: l.category || "—",
  location: [l.city, l.country].filter(Boolean).join(", ") || "—",
  description: l.description || "",
  status: l.status,
  denialReason: l.denialReason || null,
  createdISO: l.createdAt,
  created: l.createdAt
    ? new Date(l.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
    : "—",
  rating: "–",
  views: 0,
  clicks: 0,
  bookings: 0,
  conversionRate: 0,
});
