/* Staff waitlist API — read-only. The endpoint re-checks users/{uid}.isAdmin
   server-side on every call, so nothing here is a security boundary; the
   client-side gate exists only to render a sensible screen. */

import { callFunction } from "./api";

/* GET -> { consumer: [...], business: [...], counts: {...}, limit }
   Newest first. `counts` are the true collection totals, so the page can say
   "showing 500 of 1,342" rather than implying it has everything. */
export const listWaitlist = (limit = 500) =>
  callFunction(`adminListWaitlist?limit=${encodeURIComponent(limit)}`, null, { method: "GET" });
