/* Staff waitlist panel — /admin.
   Read-only view of the consumer (`waitlist`) and business (`businessWaitlist`)
   signups, with search and CSV export.

   Deliberately standalone: it carries its own Firebase sign-in and sits
   OUTSIDE PartnerAuthProvider (see App.js). Admins are ordinary app accounts
   flagged users/{uid}.isAdmin, and the partner provider signs those out on
   sight — sharing it would log every admin straight back out.

   The client-side admin state is presentation only. adminListWaitlist re-reads
   the isAdmin flag server-side on every request; a user who flips a local
   variable sees the same 403 either way. */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  RecaptchaVerifier,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  ArrowLeft, Download, Eye, FlaskConical, LogOut, Mail, Pencil, Phone, RefreshCw, Search, Send,
  Trash2, Users, Store, X,
} from "lucide-react";
import { auth, appleProvider, googleProvider } from "../utils/firebaseClient";
import { listWaitlist, sendWaitlistEmail, setBetaTesters, deleteWaitlistRows } from "../utils/waitlistAdminApi";
import { applyMergeTags, buildBroadcastEmail, renderParts } from "../utils/broadcastEmailTemplate";
import PlanieLogo from "../Assets/Images/PlanieLogoNew.svg";

const PAGE_LIMIT = 1000;

/* The default TestFlight invite link. REACT_APP_TESTFLIGHT_URL sets it without
   a code edit, and the last link actually sent is remembered below — either way
   it stays editable in the composer, because it changes per build. */
const TESTFLIGHT_URL_DEFAULT = process.env.REACT_APP_TESTFLIGHT_URL || "";
const TESTFLIGHT_URL_KEY = "planie.admin.testflightUrl";

const readTestFlightUrl = () => {
  try {
    return localStorage.getItem(TESTFLIGHT_URL_KEY) || TESTFLIGHT_URL_DEFAULT;
  } catch {
    return TESTFLIGHT_URL_DEFAULT; // private mode / storage disabled
  }
};
const rememberTestFlightUrl = (url) => {
  try { localStorage.setItem(TESTFLIGHT_URL_KEY, url); } catch { /* not worth failing a send over */ }
};

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

/* RFC 4180 quoting. A leading =, +, - or @ is prefixed with a single quote:
   spreadsheets treat those as formulas, and a "city" of =HYPERLINK(...) would
   execute when a colleague opens the export. */
function csvCell(value) {
  const s = value === null || value === undefined ? "" : String(value);
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
}

function downloadCsv(filename, columns, rows) {
  const body = [
    columns.map((c) => csvCell(c.label)).join(","),
    ...rows.map((r) => columns.map((c) => csvCell(c.get(r))).join(",")),
  ].join("\r\n");
  // BOM so Excel reads it as UTF-8 rather than the local codepage.
  const url = URL.createObjectURL(new Blob([`﻿${body}`], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* Unsubscribed rows stay visible — they're still signups and still count —
   but they're marked, and the backend refuses to mail them regardless of what
   this page thinks. */
const emailCell = (r) => (
  <span className={r.unsubscribed ? "text-[#1C1114]/40" : undefined}>
    {r.email}
    {r.unsubscribed && (
      <span className="ml-2 rounded-full bg-[#1C1114]/8 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#1C1114]/50">
        unsubscribed
      </span>
    )}
  </span>
);

/* Two states in one column, because "flagged" and "actually has the link" are
   different questions and the second is the one you ask when somebody says
   they never got it. */
const BETA_COLUMN = {
  label: "Beta",
  get: (r) => (r.betaTester ? (r.betaInviteSentAt ? `invited ${r.betaInviteSentAt}` : "flagged") : ""),
  render: (r) =>
    r.betaTester ? (
      <span
        className="inline-flex items-center gap-1 rounded-full bg-[#FF4040]/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#FF4040] whitespace-nowrap"
        title={r.betaInviteSentAt ? `TestFlight invite sent ${fmtDate(r.betaInviteSentAt)}` : "Not invited yet"}
      >
        <FlaskConical size={11} /> {r.betaInviteSentAt ? "invited" : "beta"}
      </span>
    ) : (
      <span className="text-[#1C1114]/25">—</span>
    ),
};

const CONSUMER_COLUMNS = [
  { label: "Email", get: (r) => r.email, render: emailCell },
  { label: "City", get: (r) => r.city },
  { label: "Platform", get: (r) => r.platform },
  BETA_COLUMN,
  { label: "Consent", get: (r) => (r.consent ? "yes" : "no") },
  { label: "Confirmation sent", get: (r) => (r.confirmationSent ? "yes" : "no") },
  { label: "Joined", get: (r) => r.joinedAt ?? "" },
];

const BUSINESS_COLUMNS = [
  { label: "Business", get: (r) => r.business },
  { label: "Contact", get: (r) => r.contact },
  { label: "Email", get: (r) => r.email, render: emailCell },
  { label: "City", get: (r) => r.city },
  { label: "Venue type", get: (r) => r.venueType },
  BETA_COLUMN,
  { label: "Consent", get: (r) => (r.consent ? "yes" : "no") },
  { label: "Confirmation sent", get: (r) => (r.confirmationSent ? "yes" : "no") },
  { label: "Joined", get: (r) => r.joinedAt ?? "" },
];

/* ── Sign-in ─────────────────────────────────────────────────────────── */

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
function SignIn({ denied }) {
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
        <p className="text-sm text-[#1C1114]/50 mt-1 mb-6">Waitlist panel. Admin accounts only.</p>

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

/* ── Table ───────────────────────────────────────────────────────────── */

function Table({ columns, rows, emptyLabel, selected, onToggle, onToggleAll }) {
  if (rows.length === 0) {
    return (
      <p className="text-sm text-[#1C1114]/50 bg-white border border-[#1C1114]/10 rounded-2xl px-4 py-10 text-center">
        {emptyLabel}
      </p>
    );
  }
  const allShown = rows.every((r) => selected.has(r.id));
  const someShown = !allShown && rows.some((r) => selected.has(r.id));
  return (
    // The table sets its own min width and scrolls inside this box, so a long
    // business name can never push the page itself sideways on mobile.
    <div className="bg-white border border-[#1C1114]/10 rounded-2xl overflow-x-auto">
      <table className="w-full min-w-[680px] text-sm">
        <thead>
          <tr className="border-b border-[#1C1114]/10">
            <th className="w-10 px-4 py-3">
              <input
                type="checkbox"
                className="h-4 w-4 accent-[#FF4040] cursor-pointer"
                checked={allShown}
                // Header box reflects the CURRENTLY VISIBLE rows, so with a
                // search active it selects the matches rather than the world.
                ref={(el) => { if (el) el.indeterminate = someShown; }}
                onChange={() => onToggleAll(rows, !allShown)}
                aria-label={allShown ? "Deselect all shown" : "Select all shown"}
              />
            </th>
            {columns.map((c) => (
              <th key={c.label} className="text-left font-semibold text-[#1C1114]/50 text-xs uppercase tracking-wide px-4 py-3 whitespace-nowrap">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const isOn = selected.has(r.id);
            return (
              <tr
                key={r.id}
                className={`border-b border-[#1C1114]/5 last:border-0 cursor-pointer ${isOn ? "bg-[#FF4040]/[0.045]" : "hover:bg-[#FAF7F1]/60"}`}
                // Whole row toggles: with a checkbox column this is what
                // everyone tries first.
                onClick={() => onToggle(r.id)}
              >
                <td className="px-4 py-3 align-top">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-[#FF4040] cursor-pointer"
                    checked={isOn}
                    onChange={() => onToggle(r.id)}
                    onClick={(e) => e.stopPropagation()} // row handler would undo it
                    aria-label={`Select ${r.email}`}
                  />
                </td>
                {columns.map((c) => (
                  <td key={c.label} className="px-4 py-3 text-[#1C1114] align-top">
                    {c.render
                      ? c.render(r)
                      : c.label === "Joined" ? fmtDate(r.joinedAt) : c.get(r) || "—"}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ── Composer ────────────────────────────────────────────────────────── */

const MERGE_TAGS = {
  consumer: ["email", "city", "platform"],
  business: ["email", "city", "business", "contact", "venueType"],
};

/* `betaInvite` switches the composer to the DESIGNED TestFlight-invite email
   (template `tester_invite`, rendered server-side — the "Getting Planie onto
   your phone" walkthrough) instead of a typed message. The backend stamps
   betaTester/betaInviteSentAt on everyone the mail actually reached, so a row
   only ever reads "invited" if a mail left for it. */
function Composer({ list, recipients, betaInvite, onClose, onSent, onDropRecipients }) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [testflightUrl, setTestflightUrl] = useState(betaInvite ? readTestFlightUrl() : "");
  const [pane, setPane] = useState("write"); // "write" | "preview"
  const [busy, setBusy] = useState(null); // null | "test" | "send"
  const [armed, setArmed] = useState(false); // second press actually sends
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const bodyRef = useRef(null);

  // Unsubscribed rows can be selected (they're normal rows) but are never
  // recipients. Counting them in "Send to N" would overstate the reach and
  // then mismatch the result, so they're removed from the count everywhere.
  const unsubscribed = recipients.filter((r) => r.unsubscribed);
  const sendable = recipients.filter((r) => !r.unsubscribed);
  const noConsent = sendable.filter((r) => !r.consent);

  /* Mirrors the backend's validation exactly — it only accepts a public
     TestFlight join link, and finding that out after pressing send twice is
     the wrong time. */
  const linkOk = /^https:\/\/testflight\.apple\.com\/join\/[A-Za-z0-9]+$/.test(testflightUrl.trim());
  const ready = sendable.length > 0 && (
    betaInvite ? linkOk : subject.trim().length > 0 && body.trim().length > 0
  );

  // Arming is per-body: editing after arming must re-arm, or you can send a
  // half-finished edit with a press you thought was aimed at the old text.
  useEffect(() => setArmed(false), [subject, body, testflightUrl, sendable.length]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && !busy) onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, busy]);

  const insertTag = (tag) => {
    const el = bodyRef.current;
    const token = `{{${tag}}}`;
    if (!el) { setBody((b) => b + token); return; }
    const { selectionStart: s, selectionEnd: e } = el;
    setBody((b) => b.slice(0, s) + token + b.slice(e));
    // Restore the caret after React re-renders, or the next tag lands at 0.
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + token.length, s + token.length);
    });
  };

  /* The custom broadcast's fields, built once so the preview cannot drift
     from the send. The beta invite doesn't use this: its email is a fixed
     designed template rendered server-side. */
  const parts = useMemo(() => ({ message: body.trim() }), [body]);

  /* Rendered against the first recipient, the same row the backend uses for a
     test send — so merge tags show real values rather than {{city}}.
     The unsubscribe link is drawn but left dead: this is a preview. */
  const sample = sendable[0];
  const previewHtml = useMemo(
    () => buildBroadcastEmail(renderParts(parts, sample ?? {}), "#"),
    [parts, sample],
  );
  const previewSubject = applyMergeTags(subject.trim(), sample ?? {});

  const submit = async (test) => {
    setBusy(test ? "test" : "send");
    setError(null);
    try {
      const res = await sendWaitlistEmail({
        list,
        ids: sendable.map((r) => r.id),
        test,
        ...(betaInvite
          ? { template: "tester_invite", testflightUrl: testflightUrl.trim() }
          : { subject: subject.trim(), body: body.trim() }),
      });
      setResult(res);
      // Remembered on any successful send including a test — a link that
      // rendered correctly in a preview is the one worth keeping.
      if (betaInvite) rememberTestFlightUrl(testflightUrl.trim());
      if (!test) onSent();
    } catch (err) {
      setError(err.message || "Could not send.");
    } finally {
      setBusy(null);
      setArmed(false);
    }
  };

  const preview = sendable.slice(0, 3).map((r) => r.email).join(", ");

  return (
    <div className="fixed inset-0 z-50 bg-[#1C1114]/40 flex items-start sm:items-center justify-center p-4 overflow-y-auto">
      <div role="dialog" aria-modal="true" aria-label="Compose email" className="w-full max-w-2xl bg-white rounded-2xl border border-[#1C1114]/10 my-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1C1114]/10">
          <h2 className="font-bold text-[#1C1114] text-lg" style={{ fontFamily: "var(--nu-font-head)", letterSpacing: "-0.02em" }}>
            {result && !result.test
              ? "Sent"
              : betaInvite
                ? `TestFlight invite · ${sendable.length}`
                : `Email ${sendable.length} ${sendable.length === 1 ? "person" : "people"}`}
          </h2>
          <button onClick={onClose} className="text-[#1C1114]/40 hover:text-[#1C1114]" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {result && !result.test ? (
          <div className="px-6 py-6">
            <p className="text-sm text-[#1C1114]">
              Sent to <strong>{result.sent}</strong> of {result.recipientCount}.
              {result.failed > 0 && <> <span className="text-red-600">{result.failed} failed.</span></>}
            </p>
            {result.failures?.length > 0 && (
              <ul className="mt-3 text-xs text-[#1C1114]/60 space-y-1 max-h-40 overflow-y-auto">
                {result.failures.map((f) => <li key={f.email}>{f.email} — {f.error}</li>)}
              </ul>
            )}
            <button onClick={onClose} className="mt-6 w-full rounded-full bg-[#1C1114] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90">
              Done
            </button>
          </div>
        ) : (
          <div className="px-6 py-5">
            <div className="rounded-xl bg-[#FAF7F1] px-4 py-3 text-sm text-[#1C1114]/70">
              <span className="font-semibold text-[#1C1114]">To:</span> {preview}
              {sendable.length > 3 && <> and {sendable.length - 3} more</>}
            </div>

            {/* Consent is the tickbox they agreed to at signup. Sending anyway
                is the admin's call, but it must be a decision, not an
                accident — hence the one-click way out. */}
            {unsubscribed.length > 0 && (
              <div className="mt-3 rounded-xl border border-[#1C1114]/10 bg-[#FAF7F1] px-4 py-3 text-sm text-[#1C1114]/70">
                <strong>{unsubscribed.length}</strong> of the rows you selected have unsubscribed and
                will not be emailed.
              </div>
            )}

            {betaInvite && (
              <div className="mt-3 rounded-xl border border-[#1C1114]/10 bg-[#FAF7F1] px-4 py-3 text-sm text-[#1C1114]/70">
                Everyone this reaches is marked as a beta tester and stamped with today's date.
              </div>
            )}

            {noConsent.length > 0 && (
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <strong>{noConsent.length}</strong> of these did not tick the marketing consent box.
                <button
                  className="ml-2 underline font-semibold"
                  onClick={() => onDropRecipients(noConsent.map((r) => r.id))}
                >
                  Remove them
                </button>
              </div>
            )}

            {betaInvite ? (
              <>
                {/* Fixed designed template — nothing to write. The email is
                    rendered server-side; "Send test to me" is the preview. */}
                <div className="mt-4 rounded-xl border border-[#1C1114]/10 bg-[#FAF7F1] px-4 py-3 text-sm text-[#1C1114]/70">
                  <p><span className="font-semibold text-[#1C1114]">Subject:</span> How to install Planie</p>
                  <p className="mt-1.5">
                    The designed install walkthrough — five steps, a troubleshooting card, and your
                    TestFlight link as the button. Send a test to yourself to see it in your inbox.
                  </p>
                </div>
                <label htmlFor="bc-testflight" className="block text-sm font-semibold text-[#1C1114] mt-4 mb-1.5">
                  TestFlight link
                </label>
                <input
                  id="bc-testflight" type="url" inputMode="url" autoFocus
                  value={testflightUrl} onChange={(e) => setTestflightUrl(e.target.value)}
                  placeholder="https://testflight.apple.com/join/…"
                  className={fieldClass}
                />
                <p className={`mt-2 text-xs ${testflightUrl.trim() && !linkOk ? "text-red-600" : "text-[#1C1114]/45"}`}>
                  {testflightUrl.trim() && !linkOk
                    ? "Needs to be a public TestFlight link: https://testflight.apple.com/join/…"
                    : "Becomes the button in the email. Remembered for next time."}
                </p>
              </>
            ) : (
            <>
            {/* Preview is a pane, not a second dialog: the email is 560px of
                cream and the fields are 560px of form, so they can't sit side
                by side at this width without shrinking both. */}
            <div className="mt-5 inline-flex rounded-full border border-[#1C1114]/15 p-0.5">
              {[
                { key: "write", label: "Write", icon: Pencil },
                { key: "preview", label: "Preview", icon: Eye },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key} type="button" onClick={() => setPane(key)}
                  aria-pressed={pane === key}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold ${
                    pane === key ? "bg-[#1C1114] text-white" : "text-[#1C1114]/60 hover:text-[#1C1114]"
                  }`}
                >
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>

            {pane === "preview" ? (
              <div className="mt-4">
                <div className="rounded-t-xl border border-b-0 border-[#1C1114]/10 bg-[#FAF7F1] px-4 py-2.5">
                  <p className="text-xs text-[#1C1114]/45">Subject</p>
                  <p className="text-sm font-semibold text-[#1C1114] break-words">
                    {previewSubject || <span className="text-[#1C1114]/35">No subject yet</span>}
                  </p>
                </div>
                {/* sandbox with no allow-* tokens: the preview must not run
                    scripts or navigate the panel away mid-compose. */}
                <iframe
                  title="Email preview"
                  sandbox=""
                  srcDoc={previewHtml}
                  className="w-full h-[520px] rounded-b-xl border border-[#1C1114]/10 bg-[#EFE7DD]"
                />
                <p className="mt-2 text-xs text-[#1C1114]/45">
                  {sample
                    ? <>Rendered with {sample.email}'s details, the same row a test send uses. </>
                    : null}
                  Links and the unsubscribe footer are inert here. Send a test to yourself to check
                  it in a real inbox.
                </p>
              </div>
            ) : (
            <>
            <label htmlFor="bc-subject" className="block text-sm font-semibold text-[#1C1114] mt-5 mb-1.5">Subject</label>
            <input
              id="bc-subject" type="text" maxLength={200} autoFocus
              value={subject} onChange={(e) => setSubject(e.target.value)}
              placeholder="Planie is live in {{city}}"
              className={fieldClass}
            />

            <div className="flex items-baseline justify-between mt-4 mb-1.5">
              <label htmlFor="bc-body" className="block text-sm font-semibold text-[#1C1114]">Message</label>
              <span className="text-xs text-[#1C1114]/40">{body.length}/20000</span>
            </div>
            <textarea
              id="bc-body" ref={bodyRef} rows={9} maxLength={20000}
              value={body} onChange={(e) => setBody(e.target.value)}
              placeholder={"Hi,\n\nPlanie is now live in {{city}}…"}
              className={`${fieldClass} resize-y leading-relaxed`}
            />

            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-[#1C1114]/40 mr-1">Insert:</span>
              {MERGE_TAGS[list].map((tag) => (
                <button
                  key={tag} type="button" onClick={() => insertTag(tag)}
                  className="rounded-full border border-[#1C1114]/15 px-2.5 py-1 text-xs font-mono text-[#1C1114]/70 hover:bg-[#FAF7F1]"
                >
                  {`{{${tag}}}`}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-[#1C1114]/45">
              Plain text — blank lines become paragraphs and links are made clickable. Merge tags
              resolve per recipient, and empty ones become nothing.
            </p>
            </>
            )}
            </>
            )}

            {result?.test && (
              <p className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-800">
                Test sent to {result.sentTo}. Nothing went to the list.
              </p>
            )}
            {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button" disabled={!ready || busy !== null} onClick={() => submit(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#1C1114]/15 px-4 py-2 text-sm font-semibold text-[#1C1114] hover:bg-[#FAF7F1] disabled:opacity-50"
              >
                <Send size={14} /> {busy === "test" ? "Sending…" : "Send test to me"}
              </button>
              <button
                type="button" disabled={!ready || busy !== null}
                onClick={() => (armed ? submit(false) : setArmed(true))}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50 ${armed ? "bg-[#1C1114]" : "bg-[#FF4040] hover:opacity-90"}`}
              >
                {busy === "send"
                  ? "Sending…"
                  : armed
                    ? `Confirm — send to ${sendable.length}`
                    : `Send to ${sendable.length}`}
              </button>
            </div>
            {armed && (
              <p className="mt-2 text-right text-xs text-[#1C1114]/50">
                This cannot be undone. Press again to send.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Panel ───────────────────────────────────────────────────────────── */

export default function AdminWaitlist() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [denied, setDenied] = useState(null); // { uid, label } of a rejected account
  const [tab, setTab] = useState("consumer");
  const [query, setQuery] = useState("");
  const [betaFilter, setBetaFilter] = useState("all"); // "all" | "beta" | "notBeta"
  const [flagging, setFlagging] = useState(false);
  // Deleting is two-press (arm, then confirm) like sending — and the armed
  // state dies whenever the selection changes, so the press can never land on
  // different rows than the ones it was aimed at.
  const [deleting, setDeleting] = useState(false);
  const [deleteArmed, setDeleteArmed] = useState(false);
  // Per-tab, because a selection of people and a selection of businesses go to
  // different endpoints' worth of merge tags — mixing them would be nonsense.
  const [selection, setSelection] = useState({ consumer: new Set(), business: new Set() });
  const [composing, setComposing] = useState(null); // null | "email" | "beta"

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
      // NOT clearing `denied` here: the 403 path signs the user out, which
      // fires this listener — resetting it would wipe the explanation before
      // the sign-in screen could render it. It is cleared on the next
      // successful load instead.
      if (!u) setData(null);
    });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await listWaitlist(PAGE_LIMIT));
      setDenied(null);
    } catch (err) {
      // A non-admin gets the sign-in screen back with an explanation rather
      // than an empty panel that looks broken.
      if (err.status === 403) {
        // Captured BEFORE signOut, which clears auth.currentUser.
        const u = auth.currentUser;
        setDenied({
          uid: u?.uid ?? "unknown",
          label: u?.email || u?.phoneNumber || u?.uid || "this account",
        });
        await signOut(auth);
      } else {
        setError(err.message || "Could not load the waitlist.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  // Memoised because the filter below depends on them: a fresh [] each render
  // would re-run the filter on every keystroke elsewhere in the tree.
  const rows = useMemo(
    () => (data ? (tab === "consumer" ? data.consumer : data.business) : []),
    [data, tab],
  );
  const columns = tab === "consumer" ? CONSUMER_COLUMNS : BUSINESS_COLUMNS;

  /* Search spans every displayed column, so "London", "iOS" and a partial
     email all work without the user picking a field first. */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (betaFilter === "beta" && !r.betaTester) return false;
      if (betaFilter === "notBeta" && r.betaTester) return false;
      if (!q) return true;
      return columns.some((c) => String(c.get(r) ?? "").toLowerCase().includes(q));
    });
  }, [rows, columns, query, betaFilter]);

  const selected = selection[tab];
  const selectedRows = useMemo(() => rows.filter((r) => selected.has(r.id)), [rows, selected]);

  const mutateSelection = useCallback((fn) => {
    setSelection((prev) => {
      const next = new Set(prev[tab]);
      fn(next);
      return { ...prev, [tab]: next };
    });
  }, [tab]);

  const toggleRow = useCallback((id) => {
    mutateSelection((s) => (s.has(id) ? s.delete(id) : s.add(id)));
  }, [mutateSelection]);

  const toggleShown = useCallback((shown, on) => {
    mutateSelection((s) => shown.forEach((r) => (on ? s.add(r.id) : s.delete(r.id))));
  }, [mutateSelection]);

  const clearSelection = useCallback(() => {
    mutateSelection((s) => s.clear());
  }, [mutateSelection]);

  const dropRecipients = useCallback((ids) => {
    mutateSelection((s) => ids.forEach((id) => s.delete(id)));
  }, [mutateSelection]);

  /* Flags the selection, then patches the loaded rows in place rather than
     re-fetching: the whole list is a second-long round trip and the only thing
     that changed is a boolean we already know the value of. The selection is
     kept so "mark these, now email these" is one continuous action. */
  const markBeta = useCallback(async (on) => {
    const ids = selectedRows.map((r) => r.id);
    if (ids.length === 0 || flagging) return;
    setFlagging(true);
    setError(null);
    try {
      await setBetaTesters({ list: tab, ids, betaTester: on });
      const touched = new Set(ids);
      setData((prev) => (prev ? {
        ...prev,
        [tab]: prev[tab].map((r) => (touched.has(r.id) ? { ...r, betaTester: on } : r)),
      } : prev));
    } catch (err) {
      setError(err.message || "Could not update the beta flag.");
    } finally {
      setFlagging(false);
    }
  }, [selectedRows, flagging, tab]);

  /* Permanent removal. The rows vanish from the loaded data on success —
     no refetch needed, the backend confirmed exactly what was deleted. */
  const deleteSelected = useCallback(async () => {
    const ids = selectedRows.map((r) => r.id);
    if (ids.length === 0 || deleting) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteWaitlistRows({ list: tab, ids });
      const gone = new Set(ids);
      setData((prev) => (prev ? {
        ...prev,
        [tab]: prev[tab].filter((r) => !gone.has(r.id)),
        counts: prev.counts
          ? { ...prev.counts, [tab]: Math.max(0, (prev.counts[tab] ?? 0) - gone.size) }
          : prev.counts,
      } : prev));
      mutateSelection((sel) => ids.forEach((id) => sel.delete(id)));
    } catch (err) {
      setError(err.message || "Could not delete.");
    } finally {
      setDeleting(false);
      setDeleteArmed(false);
    }
  }, [selectedRows, deleting, tab, mutateSelection]);

  // Selection changed → any armed delete was aimed at different rows.
  useEffect(() => setDeleteArmed(false), [selectedRows.length, tab]);

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F1]">
        <div className="w-10 h-10 border-4 border-[#FF4040]/20 border-t-[#FF4040] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <SignIn denied={denied} />;
  }

  const total = data?.counts?.[tab] ?? 0;
  const truncated = data && rows.length < total;
  // Counted over the loaded rows, not the collection — there is no aggregation
  // query behind it, so it means "of the ones on this page".
  const betaCount = rows.filter((r) => r.betaTester).length;
  // Drives which of mark/unmark the action bar offers. A mixed selection shows
  // "Mark as beta", so one press always ends with everything flagged.
  const allSelectedAreBeta = selectedRows.length > 0 && selectedRows.every((r) => r.betaTester);

  return (
    <div className="min-h-screen bg-[#FAF7F1]">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <img src={PlanieLogo} alt="Planie" className="h-8 w-auto" />
            <div>
              <h1 className="text-2xl font-bold text-[#1C1114]" style={{ fontFamily: "var(--nu-font-head)", letterSpacing: "-0.02em" }}>
                Waitlist
              </h1>
              <p className="text-sm text-[#1C1114]/50">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="inline-flex items-center gap-1.5 rounded-full border border-[#1C1114]/15 bg-white px-4 py-1.5 text-sm font-semibold text-[#1C1114] hover:bg-[#FAFAFA] disabled:opacity-50"
              onClick={load}
              disabled={loading}
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : undefined} /> Refresh
            </button>
            <button
              className="inline-flex items-center gap-1.5 text-sm text-[#1C1114]/50 hover:text-[#1C1114]"
              onClick={() => signOut(auth)}
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700" role="alert">
            {error}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 mb-5">
          {[
            { key: "consumer", label: "People", icon: Users },
            { key: "business", label: "Businesses", icon: Store },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold border ${
                tab === key
                  ? "bg-[#1C1114] text-white border-[#1C1114]"
                  : "bg-white text-[#1C1114] border-[#1C1114]/15 hover:bg-[#FAFAFA]"
              }`}
            >
              <Icon size={14} /> {label}
              <span className={tab === key ? "opacity-60" : "opacity-45"}>
                ({data?.counts?.[key] ?? "—"})
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1C1114]/35" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search email, city, platform…"
              aria-label="Search the waitlist"
              className="w-full rounded-full border border-[#1C1114]/15 bg-white pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#FF4040]/25"
            />
          </div>
          {/* Segmented, not a checkbox: "not beta" is the view you want when
              picking the next round of testers, and it isn't reachable from a
              single on/off. */}
          <div className="inline-flex rounded-full border border-[#1C1114]/15 bg-white p-0.5">
            {[
              { key: "all", label: "All" },
              { key: "beta", label: "Beta testers" },
              { key: "notBeta", label: "Not beta" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setBetaFilter(key)}
                aria-pressed={betaFilter === key}
                className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${
                  betaFilter === key ? "bg-[#1C1114] text-white" : "text-[#1C1114]/60 hover:text-[#1C1114]"
                }`}
              >
                {label}
                {key === "beta" && betaCount > 0 && (
                  <span className={betaFilter === key ? "opacity-60" : "opacity-45"}> ({betaCount})</span>
                )}
              </button>
            ))}
          </div>
          <button
            className="inline-flex items-center gap-1.5 rounded-full border border-[#1C1114]/15 bg-white px-4 py-2 text-sm font-semibold text-[#1C1114] hover:bg-[#FAFAFA] disabled:opacity-50"
            onClick={() => downloadCsv(`planie-${tab}-waitlist.csv`, columns, filtered)}
            disabled={filtered.length === 0}
          >
            <Download size={14} /> Export CSV ({filtered.length})
          </button>
        </div>

        <p className="text-sm text-[#1C1114]/50 mb-3" aria-live="polite">
          {loading
            ? "Loading…"
            : `Showing ${filtered.length}${query ? ` of ${rows.length} loaded` : ""}${
                truncated ? ` · ${total} total, newest ${rows.length} loaded` : ""
              }`}
        </p>

        {!loading && (
          <Table
            columns={columns}
            rows={filtered}
            emptyLabel={query ? "Nothing matches that search." : "No signups yet."}
            selected={selected}
            onToggle={toggleRow}
            onToggleAll={toggleShown}
          />
        )}

        {/* Bottom sheet rather than a toolbar above the table: it only exists
            once something is selected, and appearing at the thumb end of the
            screen keeps it reachable on a phone. pb-safe-ish padding keeps it
            clear of the iOS home indicator. */}
        {selectedRows.length > 0 && !composing && (
          <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-5 pt-3 pointer-events-none">
            <div className="pointer-events-auto mx-auto max-w-2xl flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#1C1114] px-5 py-3 text-white shadow-lg">
              <span className="text-sm">
                <strong>{selectedRows.length}</strong> selected
                {selectedRows.length < selected.size && (
                  <span className="opacity-60"> ({selected.size - selectedRows.length} not in view)</span>
                )}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  className="text-sm text-white/60 hover:text-white px-2"
                  onClick={clearSelection}
                >
                  Clear
                </button>
                {/* Unmark only offered when the selection actually contains
                    testers, so the common case stays a single button. */}
                {allSelectedAreBeta ? (
                  <button
                    className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 disabled:opacity-50"
                    onClick={() => markBeta(false)}
                    disabled={flagging}
                  >
                    {flagging ? "Saving…" : "Unmark beta"}
                  </button>
                ) : (
                  <button
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/10 disabled:opacity-50"
                    onClick={() => markBeta(true)}
                    disabled={flagging}
                  >
                    <FlaskConical size={15} /> {flagging ? "Saving…" : "Mark as beta"}
                  </button>
                )}
                <button
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-50 ${
                    deleteArmed
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "border border-white/20 text-white/80 hover:bg-white/10"
                  }`}
                  onClick={() => (deleteArmed ? deleteSelected() : setDeleteArmed(true))}
                  disabled={deleting}
                >
                  <Trash2 size={15} />
                  {deleting
                    ? "Deleting…"
                    : deleteArmed
                      ? `Confirm — delete ${selectedRows.length}`
                      : "Delete"}
                </button>
                <button
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/10"
                  onClick={() => setComposing("email")}
                >
                  <Mail size={15} /> Write email
                </button>
                <button
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#FF4040] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                  onClick={() => setComposing("beta")}
                >
                  <Send size={15} /> TestFlight invite
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {composing && (
        <Composer
          list={tab}
          recipients={selectedRows}
          betaInvite={composing === "beta"}
          onClose={() => setComposing(null)}
          // A beta invite writes betaInviteSentAt server-side, so the row data
          // this page holds is now stale — reload rather than guess at it.
          onSent={() => { clearSelection(); if (composing === "beta") load(); }}
          onDropRecipients={dropRecipients}
        />
      )}
    </div>
  );
}
