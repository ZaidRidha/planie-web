/* Staff sign-in screen, shared by every /admin surface. Split out of
   AdminWaitlist so a dashboard shell with multiple tabs (Home, Waitlist, …)
   can gate all of them with one sign-in flow instead of duplicating it. */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  RecaptchaVerifier,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithPopup,
} from "firebase/auth";
import { ArrowLeft, Phone } from "lucide-react";
import { auth, appleProvider, googleProvider } from "../utils/firebaseClient";
import PlanieLogo from "../Assets/Images/PlanieLogoNew.svg";

/* Only codes worth a specific message. Everything else collapses into one
   generic line: for email+password in particular, telling an anonymous visitor
   which half was wrong turns this form into an account-existence oracle.
   A null value means "say nothing" — the user cancelled, which is not an error. */
const AUTH_ERRORS = {
  "auth/popup-closed-by-user": null,
  "auth/cancelled-popup-request": null,
  "auth/popup-blocked": "Your browser blocked the sign-in popup. Allow popups and retry.",
  "auth/too-many-requests": "Too many attempts. Wait a moment and try again.",
  "auth/invalid-phone-number": "Enter the number in full international form, e.g. +447700900123.",
  "auth/invalid-verification-code": "That code isn't right.",
  "auth/code-expired": "That code expired. Send a new one.",
  // Apple/phone are per-project sign-in methods; both fail this way when the
  // method was never switched on in the Firebase console.
  "auth/operation-not-allowed": "That sign-in method isn't enabled for this Firebase project yet.",
  "auth/unauthorized-domain": "This domain isn't in the Firebase authorised domains list.",
  // App Check is enforced on Auth for this project. Without a valid token the
  // Identity Toolkit returns 401 and the SDK reports it as "internal", which
  // sends you hunting through provider settings for hours. Name it instead.
  "auth/internal-error": "Sign-in was rejected — usually a missing or invalid App Check token. Check REACT_APP_APPCHECK_SITE_KEY and the App Check debug token.",
  "auth/firebase-app-check-token-is-invalid": "The App Check token was rejected. Register this app's reCAPTCHA key (and debug token in dev).",
};
const hasMessage = (code) => Object.prototype.hasOwnProperty.call(AUTH_ERRORS, code);

/* Codes that would let an anonymous visitor probe which emails have accounts.
   These stay deliberately vague; everything else shows its raw code, because
   this is a staff panel and "auth/configuration-not-found" is a fixable
   instruction while "That didn't work" is a dead end. */
const VAGUE_CODES = new Set([
  "auth/invalid-credential", "auth/wrong-password", "auth/user-not-found", "auth/invalid-email",
]);

function authMessage(err) {
  const code = err?.code;
  // The full error object, always — the code alone hides Firebase's own
  // (usually very specific) message text.
  console.error("[admin sign-in]", code, err?.message, err);
  if (hasMessage(code)) return AUTH_ERRORS[code];
  if (VAGUE_CODES.has(code)) return "Those details didn't work.";
  return `Sign-in failed: ${code || err?.message || "unknown error"}`;
}

const GoogleMark = () => (
  <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#4285F4" d="M45.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h11.8c-.5 2.7-2 5-4.4 6.6v5.5h7.1c4.1-3.8 6.6-9.4 6.6-16.1z" />
    <path fill="#34A853" d="M24 46c5.9 0 10.9-2 14.5-5.4l-7.1-5.5c-2 1.3-4.5 2.1-7.4 2.1-5.7 0-10.5-3.8-12.2-9H4.5v5.7C8.1 41.1 15.5 46 24 46z" />
    <path fill="#FBBC05" d="M11.8 28.2c-.4-1.3-.7-2.7-.7-4.2s.3-2.9.7-4.2v-5.7H4.5C2.9 17.3 2 20.5 2 24s.9 6.7 2.5 9.9l7.3-5.7z" />
    <path fill="#EA4335" d="M24 10.8c3.2 0 6.1 1.1 8.4 3.3l6.3-6.3C34.9 4.2 29.9 2 24 2 15.5 2 8.1 6.9 4.5 14.1l7.3 5.7c1.7-5.2 6.5-9 12.2-9z" />
  </svg>
);

const AppleMark = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M16.365 1.43c0 1.14-.417 2.2-1.25 3.03-.87.87-1.9 1.37-3.02 1.28-.03-1.09.42-2.19 1.24-3 .82-.83 1.98-1.36 3.03-1.31zM20.5 17.1c-.55 1.27-.81 1.84-1.52 2.96-.99 1.56-2.39 3.5-4.12 3.51-1.54.02-1.94-1-4.03-.99-2.09.01-2.53 1.01-4.07.99-1.73-.02-3.05-1.77-4.04-3.33C.03 15.86-.26 10.72 1.44 8c1.21-1.94 3.12-3.07 4.92-3.07 1.83 0 2.98 1 4.5 1 1.47 0 2.36-1 4.48-1 1.6 0 3.3.87 4.51 2.38-3.96 2.17-3.32 7.83.65 9.79z" />
  </svg>
);

const providerButton =
  "w-full inline-flex items-center justify-center gap-2 rounded-full border border-[#1C1114]/15 bg-white px-5 py-2.5 text-sm font-semibold text-[#1C1114] hover:bg-[#FAFAFA] disabled:opacity-50";
const fieldClass =
  "w-full rounded-xl border border-[#1C1114]/15 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#FF4040]/25";

/* `denied` is the identity that just failed the admin check, or null. Naming
   the exact Firestore document is the whole point: the fix is a one-field edit
   and the doc id is otherwise invisible from the browser. */
export default function AdminSignIn({ denied }) {
  const [mode, setMode] = useState("email"); // "email" | "phone"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const [busy, setBusy] = useState(null); // null | "email" | "google" | "apple" | "phone"
  const [error, setError] = useState(null);
  const verifierRef = useRef(null);

  /* A used or failed reCAPTCHA can't be re-submitted, so every phone attempt
     tears the old widget down and builds a fresh one. Skipping this is why a
     second "Send code" silently does nothing. */
  const resetVerifier = useCallback(() => {
    try { verifierRef.current?.clear(); } catch { /* already gone */ }
    verifierRef.current = null;
  }, []);

  useEffect(() => resetVerifier, [resetVerifier]);

  // Success unmounts this component (onAuthStateChanged swaps the screen), so
  // the busy flag is only ever cleared on the failure path.
  const run = async (key, fn) => {
    if (busy) return;
    setBusy(key);
    setError(null);
    try {
      await fn();
    } catch (err) {
      setError(authMessage(err));
      setBusy(null);
    }
  };

  const submitEmail = (e) => {
    e.preventDefault();
    run("email", () => signInWithEmailAndPassword(auth, email.trim(), password));
  };

  const sendCode = (e) => {
    e.preventDefault();
    run("phone", async () => {
      resetVerifier();
      verifierRef.current = new RecaptchaVerifier(auth, "admin-recaptcha", { size: "invisible" });
      try {
        setConfirmation(await signInWithPhoneNumber(auth, phone.trim(), verifierRef.current));
        setBusy(null); // still on screen — now collecting the code
      } catch (err) {
        resetVerifier();
        throw err;
      }
    });
  };

  const confirmCode = (e) => {
    e.preventDefault();
    run("phone", () => confirmation.confirm(code.trim()));
  };

  return (
    <div className="min-h-screen bg-[#FAF7F1] flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm bg-white border border-[#1C1114]/10 rounded-2xl p-7">
        <img src={PlanieLogo} alt="Planie" className="h-8 w-auto mb-6" />
        <h1 className="text-xl font-bold text-[#1C1114]" style={{ fontFamily: "var(--nu-font-head)", letterSpacing: "-0.02em" }}>
          Staff sign in
        </h1>
        <p className="text-sm text-[#1C1114]/50 mt-1 mb-6">Admin dashboard. Admin accounts only.</p>

        {denied && (
          <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900" role="alert">
            <p>
              Signed in as <strong>{denied.label}</strong>, but that account isn't a Planie admin.
            </p>
            <p className="mt-2">Set <code className="font-mono">isAdmin: true</code> on this Firestore document:</p>
            <code className="mt-1 block font-mono text-xs break-all bg-white/70 rounded-lg px-2 py-1.5">
              users/{denied.uid}
            </code>
            <p className="mt-2 text-xs text-amber-800/80">
              If no such document exists, this identity has never signed into the Planie app —
              sign in with the account that owns your existing user document instead.
            </p>
          </div>
        )}

        {mode === "email" ? (
          <>
            <form onSubmit={submitEmail}>
              <label htmlFor="admin-email" className="block text-sm font-semibold text-[#1C1114] mb-1.5">Email</label>
              <input
                id="admin-email" type="email" autoComplete="username" required
                value={email} onChange={(e) => setEmail(e.target.value)} className={fieldClass}
              />
              <label htmlFor="admin-password" className="block text-sm font-semibold text-[#1C1114] mt-4 mb-1.5">Password</label>
              <input
                id="admin-password" type="password" autoComplete="current-password" required
                value={password} onChange={(e) => setPassword(e.target.value)} className={fieldClass}
              />
              <button
                type="submit"
                disabled={busy !== null}
                className="mt-5 w-full rounded-full bg-[#FF4040] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {busy === "email" ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <div className="flex items-center gap-3 my-5" aria-hidden="true">
              <span className="h-px flex-1 bg-[#1C1114]/10" />
              <span className="text-xs uppercase tracking-wide text-[#1C1114]/35">or</span>
              <span className="h-px flex-1 bg-[#1C1114]/10" />
            </div>

            <div className="space-y-2.5">
              <button type="button" className={providerButton} disabled={busy !== null}
                onClick={() => run("google", () => signInWithPopup(auth, googleProvider))}>
                <GoogleMark /> {busy === "google" ? "Signing in…" : "Continue with Google"}
              </button>
              <button type="button" className={providerButton} disabled={busy !== null}
                onClick={() => run("apple", () => signInWithPopup(auth, appleProvider))}>
                <AppleMark /> {busy === "apple" ? "Signing in…" : "Continue with Apple"}
              </button>
              <button type="button" className={providerButton} disabled={busy !== null}
                onClick={() => { setMode("phone"); setError(null); }}>
                <Phone size={16} /> Continue with phone
              </button>
            </div>
          </>
        ) : (
          <>
            <form onSubmit={confirmation ? confirmCode : sendCode}>
              {confirmation ? (
                <>
                  <label htmlFor="admin-code" className="block text-sm font-semibold text-[#1C1114] mb-1.5">Verification code</label>
                  <input
                    id="admin-code" type="text" inputMode="numeric" autoComplete="one-time-code"
                    required autoFocus placeholder="123456"
                    value={code} onChange={(e) => setCode(e.target.value)} className={fieldClass}
                  />
                  <p className="mt-2 text-xs text-[#1C1114]/45">Sent to {phone}.</p>
                </>
              ) : (
                <>
                  <label htmlFor="admin-phone" className="block text-sm font-semibold text-[#1C1114] mb-1.5">Phone number</label>
                  <input
                    id="admin-phone" type="tel" autoComplete="tel" required autoFocus
                    placeholder="+447700900123"
                    value={phone} onChange={(e) => setPhone(e.target.value)} className={fieldClass}
                  />
                  {/* Firebase rejects anything that isn't E.164, and the error it
                      returns is opaque — say the rule up front. */}
                  <p className="mt-2 text-xs text-[#1C1114]/45">Include the country code, e.g. +44.</p>
                </>
              )}
              <button
                type="submit"
                disabled={busy !== null}
                className="mt-5 w-full rounded-full bg-[#FF4040] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {busy === "phone" ? "Working…" : confirmation ? "Verify and sign in" : "Send code"}
              </button>
            </form>

            <button
              type="button"
              className="mt-4 inline-flex items-center gap-1.5 text-sm text-[#1C1114]/50 hover:text-[#1C1114]"
              onClick={() => {
                setMode("email");
                setConfirmation(null);
                setCode("");
                setError(null);
                resetVerifier();
              }}
            >
              <ArrowLeft size={14} /> Other sign-in options
            </button>
          </>
        )}

        {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}

        {/* Invisible reCAPTCHA host for phone auth. Must be in the DOM before
            RecaptchaVerifier is constructed, so it is always rendered. */}
        <div id="admin-recaptcha" />
      </div>
    </div>
  );
}
