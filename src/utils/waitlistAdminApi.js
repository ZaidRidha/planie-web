/* Staff waitlist API. Every endpoint re-checks users/{uid}.isAdmin
   server-side on every call, so nothing here is a security boundary; the
   client-side gate exists only to render a sensible screen. */

import { callFunction } from "./api";

/* GET -> { consumer: [...], business: [...], counts: {...}, limit }
   Newest first. `counts` are the true collection totals, so the page can say
   "showing 500 of 1,342" rather than implying it has everything. */
export const listWaitlist = (limit = 500) =>
  callFunction(`adminListWaitlist?limit=${encodeURIComponent(limit)}`, null, { method: "GET" });

/* Broadcast. Recipients are sent as document IDs, never addresses — the
   backend resolves them from Firestore, so the endpoint can't be used to mail
   an arbitrary address.

   { list, ids, all?, subject, body, test? }
   With test: true, one copy goes to the calling admin (rendered with the first
   selected recipient's data) and nothing goes to the list. */
export const sendWaitlistEmail = (payload) =>
  callFunction("adminSendWaitlistEmail", payload);

/* Flags (or unflags) signups as beta testers.
   { list, ids, betaTester } -> { updated }
   `updated` can be lower than ids.length — rows deleted since the page loaded
   are skipped rather than failing the whole call. */
export const setBetaTesters = ({ list, ids, betaTester }) =>
  callFunction("adminSetBetaTester", { list, ids, betaTester });
