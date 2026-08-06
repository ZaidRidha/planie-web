/* Partner analytics (Phase 6) — reads the real listingStats rollups via
   partnerGetAnalyticsSummary. Returns { totals, series, age[], origin[],
   party[], surface[], asks[], recent[], suppressed, cohort, minCohort }. */

import { callFunction } from "./api";

export const fetchAnalytics = (listingId = "all", range = 30) =>
  callFunction(
    `partnerGetAnalyticsSummary?listingId=${encodeURIComponent(listingId)}&range=${range}`,
    null,
    { method: "GET" },
  );
