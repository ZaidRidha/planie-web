/* Partner account API — thin wrappers over the backend partner endpoints.
   Verification states: unverified → pending → verified | denied. */

import { callFunction } from "./api";

/* Idempotent: ensures the signed-in account is a partner account and returns
   its profile. Backend rejects mobile-app accounts with code APP_ACCOUNT.

   Picks up onboarding details (businessName / fullName / role) stashed at
   signup so the partner doc is created WITH them (the backend only writes them
   on first creation — idempotent). Cleared after a successful call. */
const ONBOARDING_KEY = "planie:onboarding";
export const registerPartnerAccount = (extra) => {
  let stashed = {};
  try {
    const raw = window.localStorage.getItem(ONBOARDING_KEY);
    if (raw) stashed = JSON.parse(raw) || {};
  } catch { /* ignore */ }
  const body = {
    ...stashed,
    ...(typeof extra === "string" ? { businessName: extra } : extra || {}),
  };
  return callFunction("partnerRegisterAccount", body).then((r) => {
    try { window.localStorage.removeItem(ONBOARDING_KEY); } catch { /* ignore */ }
    return r;
  });
};

export const getPartnerProfile = () =>
  callFunction("partnerGetProfile", null, { method: "GET" });

/* Submits the Verify Business form → status "pending" for staff review.
   Fields: businessName, registrationNumber, country, address,
   websiteOrInstagram, contactName, contactEmail. */
export const submitBusinessVerification = (data) =>
  callFunction("partnerSubmitVerification", data);

/* Emails a 6-digit verification code (from no-reply@mail.useplanie.com) — same
   model as the app. Confirm it with confirmPartnerEmailCode below. */
export const sendPartnerVerificationEmail = () =>
  callFunction("partnerVerifyEmail", {});

/* Confirms the 6-digit code → flips partners/{uid}.emailVerified. */
export const confirmPartnerEmailCode = (code) =>
  callFunction("partnerConfirmEmailCode", { code });

/* Public: emails a password-reset link (no enumeration — always "success"). */
export const requestPasswordReset = (email) =>
  callFunction("partnerRequestPasswordReset", { email }, { requireUser: false });
