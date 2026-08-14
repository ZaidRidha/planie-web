/* Partner auth — combined sign-in + multi-step sign-up onboarding wizard.
   Design visual (ink promise panel for sign-in, ink progress rail for the
   wizard) over our REAL auth: email+password, Google, forgot-password,
   SendGrid email verification.

   Sign-up flow (owner spec 2026-07-26):
     1. Business — business name + email
     2. Your details — password + confirm (strength-checked) + full name + role
        → creates the account (onboarding fields stashed → persisted on the
        partner doc via registerPartnerAccount)
     3. Verify email — auto-sends, POLLS for the click (no button), shows token
        expiry, AUTO-advances when verified
     4. First venue — name/category/city, with Skip (straight into the portal)
        or Continue (starts a listing draft and opens the full form)
   No step advances while its fields are empty/invalid. */

import React, { useEffect, useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth, googleProvider } from "../utils/firebaseClient";
import { usePartnerAuth } from "../Context/PartnerAuthContext";
import { requestPasswordReset, sendPartnerVerificationEmail, confirmPartnerEmailCode } from "../utils/partnerAccount";
import { saveDraft } from "../utils/listingDrafts";
import PlanieLogo from "../Assets/Images/PlanieLogoNew.svg";

const AUTH_ERRORS = {
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/wrong-password": "Incorrect email or password.",
  "auth/user-not-found": "No account found with this email. Create one instead.",
  "auth/email-already-in-use": "An account with this email already exists — sign in instead.",
  "auth/weak-password": "Password must be at least 8 characters.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
  "auth/popup-closed-by-user": null,
};

const INK = "#1C1114", CREAM = "#FAF7F1", RED = "#FF4040";
const head = { fontFamily: "'Gabarito', sans-serif" };
const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.trim());

/* High-confidence fat-finger typos we can safely suggest a fix for. Structural
   validEmail() passes ".con"/".cmo" (any 2+ char TLD), so we catch the common
   ones here and offer a one-click correction rather than silently accepting a
   dead address. Only near-certain typos are listed to avoid false positives
   (e.g. ".co" is a real TLD and is intentionally NOT flagged). */
const TLD_FIX = { con: "com", cno: "com", cmo: "com", ocm: "com", vom: "com", xom: "com", comm: "com", coom: "com", cok: "com", cim: "com", c0m: "com", "com.": "com", nte: "net", ne: "net", orgg: "org", og: "org" };
const DOMAIN_FIX = { "gmial.com": "gmail.com", "gmai.com": "gmail.com", "gmal.com": "gmail.com", "gmil.com": "gmail.com", "gnail.com": "gmail.com", "hotnail.com": "hotmail.com", "hotmial.com": "hotmail.com", "hotmai.com": "hotmail.com", "yaho.com": "yahoo.com", "yahooo.com": "yahoo.com", "outlok.com": "outlook.com", "outloo.com": "outlook.com", "iclod.com": "icloud.com" };
function emailSuggestion(raw) {
  const e = (raw || "").trim().toLowerCase();
  const at = e.lastIndexOf("@");
  if (at < 1) return null;
  const local = e.slice(0, at);
  const domain = e.slice(at + 1);
  if (!domain) return null;
  if (DOMAIN_FIX[domain]) return `${local}@${DOMAIN_FIX[domain]}`;
  const dot = domain.lastIndexOf(".");
  if (dot > 0) {
    const tld = domain.slice(dot + 1);
    if (TLD_FIX[tld]) return `${local}@${domain.slice(0, dot + 1)}${TLD_FIX[tld]}`;
  }
  return null;
}
const pwChecks = (p) => ({ len: p.length >= 8, letter: /[a-zA-Z]/.test(p), num: /[0-9]/.test(p) });
const pwStrong = (p) => { const c = pwChecks(p); return c.len && c.letter && c.num; };

const CATEGORIES = ["Restaurant & Bar", "Activity & Tour", "Wellness & Spa", "Hotel & Resort", "Shopping & Market", "Nightlife & Entertainment"];

const WIZARD_STEPS = [
  { n: 1, label: "Your business" },
  { n: 2, label: "Your details" },
  { n: 3, label: "Verify email" },
  { n: 4, label: "Your first venue" },
];

export default function PartnerLoginPage() {
  const [mode, setMode] = useState("signup"); // "signup" | "signin"
  const [step, setStep] = useState(1);
  const [signingUp, setSigningUp] = useState(false);

  // fields
  const [bizName, setBizName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("");
  const [venueName, setVenueName] = useState("");
  const [venueCat, setVenueCat] = useState("");
  const [venueCity, setVenueCity] = useState("");

  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState(null);
  const [resetNotice, setResetNotice] = useState(null);
  const [verifyResent, setVerifyResent] = useState(false);
  const verifySent = useRef(false);
  const [verifyCode, setVerifyCode] = useState("");
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [codeError, setCodeError] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, loading, error: authError, refreshProfile, logout } = usePartnerAuth();
  const destination = location.state?.from || "/partners/dashboard";

  // Step 3: send once the partner doc exists (the context creates it async
  // after signup), then poll for verification and auto-advance. (Hooks must run
  // before any conditional return below.)
  useEffect(() => {
    if (step !== 3 || !profile) return undefined;
    if (!verifySent.current) { verifySent.current = true; sendPartnerVerificationEmail().catch(() => {}); }
    const t = setInterval(() => { refreshProfile().catch(() => {}); }, 4000);
    return () => clearInterval(t);
  }, [step, profile, refreshProfile]);
  useEffect(() => {
    if (step === 3 && profile?.emailVerified === true) setStep(4);
  }, [step, profile]);

  // Redirect an already-signed-in (returning) user — but NEVER during the
  // signup wizard (signingUp is set before createUser, so the auto-redirect
  // can't fire between account creation and the verify/venue steps).
  if (!loading && user && !signingUp) return <Navigate to={destination} replace />;

  const fail = (err) => {
    const msg = Object.prototype.hasOwnProperty.call(AUTH_ERRORS, err.code)
      ? AUTH_ERRORS[err.code] : err.message || "Something went wrong. Please try again.";
    if (msg) setFormError(msg);
  };

  /* ── sign-in ── */
  const handleSignIn = async () => {
    setFormError(null);
    if (!email.trim()) return setFormError("Please enter your email address.");
    if (!password) return setFormError("Please enter your password.");
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigate(destination, { replace: true });
    } catch (err) { fail(err); } finally { setBusy(false); }
  };
  const handleGoogle = async () => {
    setFormError(null);
    setBusy(true);
    try {
      await signInWithPopup(auth, googleProvider);
      navigate(destination, { replace: true });
    } catch (err) { fail(err); } finally { setBusy(false); }
  };
  const handleForgot = async () => {
    setFormError(null); setResetNotice(null);
    if (!email.trim()) return setFormError("Enter your email above first, then click Forgot?");
    setBusy(true);
    try {
      await requestPasswordReset(email.trim());
      setResetNotice("If an account exists for that email, a reset link is on its way. Check your inbox.");
    } catch (err) { setFormError(err.message || "Could not send the reset email."); } finally { setBusy(false); }
  };

  /* ── wizard ── */
  const emailFix = emailSuggestion(email);
  const step1Valid = bizName.trim().length > 1 && validEmail(email) && !emailFix;
  const step2Valid = pwStrong(password) && password === confirm && fullName.trim().length > 1 && role.trim().length > 0;
  const step4Valid = venueName.trim().length > 1 && venueCat && venueCity.trim().length > 1;

  const handleCreateAccount = async () => {
    if (!step2Valid) return;
    setFormError(null);
    setSigningUp(true);
    setBusy(true);
    try {
      // Stash onboarding details so the partner doc is created WITH them.
      window.localStorage.setItem("planie:onboarding", JSON.stringify({
        businessName: bizName.trim(), fullName: fullName.trim(), role: role.trim(),
      }));
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      setStep(3); // stay on this page; verify + first-venue happen here
    } catch (err) {
      setSigningUp(false);
      try { window.localStorage.removeItem("planie:onboarding"); } catch { /* ignore */ }
      fail(err);
    } finally { setBusy(false); }
  };

  const resendVerify = async () => {
    setCodeError(null); setVerifyCode("");
    try { await sendPartnerVerificationEmail(); setVerifyResent(true); setTimeout(() => setVerifyResent(false), 4000); } catch { /* ignore */ }
  };

  const handleVerifyCode = async () => {
    if (!/^\d{6}$/.test(verifyCode)) { setCodeError("Enter the 6-digit code."); return; }
    setCodeError(null); setVerifyingCode(true);
    try {
      await confirmPartnerEmailCode(verifyCode);
      await refreshProfile().catch(() => {});
      setStep(4); // verified — the emailVerified effect would also advance us
    } catch (err) {
      setCodeError(err.message || "Could not verify the code. Please try again.");
    } finally { setVerifyingCode(false); }
  };

  const skipListing = () => navigate(destination, { replace: true });
  const continueListing = () => {
    if (!step4Valid) return;
    const draft = saveDraft({ form: { name: venueName.trim(), category: venueCat, city: venueCity.trim() }, imageNames: [] });
    navigate(`/partners/add-listing?draft=${draft.id}`, { replace: true });
  };

  /* ── shared field styles ── */
  const inputStyle = {
    width: "100%", boxSizing: "border-box", fontFamily: "'Instrument Sans', sans-serif", fontSize: 16,
    padding: "15px 18px", borderRadius: 14, border: "1px solid rgba(28,17,20,0.14)",
    background: "rgba(255,255,255,0.7)", color: INK, transition: "border-color 0.2s, box-shadow 0.2s", outline: "none",
  };
  const label = { display: "block", fontSize: 13, fontWeight: 600, opacity: 0.7, marginBottom: 8 };
  const pill = (active) => ({
    fontFamily: "'Instrument Sans', sans-serif", fontSize: 14, fontWeight: 600, cursor: "pointer",
    border: "none", padding: "9px 20px", borderRadius: 100,
    background: active ? INK : "transparent", color: active ? CREAM : INK,
    boxShadow: active ? "0 4px 14px rgba(28,17,20,0.2)" : "none", transition: "all 0.25s cubic-bezier(0.22,1,0.36,1)",
  });
  const primaryBtn = { display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", boxSizing: "border-box", fontFamily: "'Instrument Sans', sans-serif", fontSize: 16, fontWeight: 600, cursor: "pointer", padding: 16, borderRadius: 100, border: "none", background: INK, color: CREAM, transition: "background 0.25s" };
  const arrow = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h13" /><path d="M12 5l7 7-7 7" /></svg>;
  const c = pwChecks(password);

  const errorBox = (formError || authError) && (
    <div role="alert" style={{ margin: "0 0 16px", background: "#FEF2F2", border: "1px solid #FECACA", color: "#B91C1C", borderRadius: 12, padding: "10px 14px", fontSize: 14 }}>{formError || authError}</div>
  );

  return (
    <div style={{ fontFamily: "'Instrument Sans', sans-serif", color: INK, minHeight: "100vh", background: CREAM }}>
      <style>{`
        .pla-grid { display: grid; grid-template-columns: minmax(380px, 44%) 1fr; min-height: 100vh; }
        .pla-input:focus { border-color: ${INK}; box-shadow: 0 0 0 3px rgba(255,64,64,0.12); }
        .pla-btn:hover:not(:disabled) { background: ${RED} !important; }
        .pla-out:hover { border-color: ${INK} !important; }
        .pla-link:hover { color: ${RED}; }
        @keyframes plaDraw { from { stroke-dashoffset: 640; } to { stroke-dashoffset: 0; } }
        @keyframes plaRise { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes plaSpin { to { transform: rotate(360deg); } }
        .pla-rise { animation: plaRise 0.5s cubic-bezier(0.22,1,0.36,1) both; }
        @media (max-width: 900px) { .pla-grid { grid-template-columns: 1fr; } .pla-aside { min-height: auto !important; padding: 32px 28px !important; } .pla-steps { display: none; } }
      `}</style>

      <div className="pla-grid">
        {/* LEFT */}
        <aside className="pla-aside" style={{ background: INK, color: CREAM, padding: "44px 52px", display: "flex", flexDirection: "column", justifyContent: mode === "signin" ? "space-between" : "flex-start", position: "sticky", top: 0, height: "100vh", boxSizing: "border-box", overflow: "hidden" }}>
          <Link to="/" className="pla-link" style={{ display: "inline-flex", alignItems: "center", gap: 10, color: "rgba(250,247,241,0.6)", fontSize: 15, fontWeight: 500 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H6" /><path d="M12 5l-7 7 7 7" /></svg> Planie
          </Link>

          {mode === "signin" ? (
            <>
              <div>
                <h1 style={{ ...head, margin: 0, fontWeight: 700, fontSize: "clamp(34px, 3.4vw, 52px)", letterSpacing: "-0.025em", lineHeight: 1.02 }}>Be the place<br />it picks<span style={{ color: RED }}>.</span></h1>
                <p style={{ margin: "22px 0 0", maxWidth: "42ch", fontSize: 16, lineHeight: 1.65, color: "rgba(250,247,241,0.6)" }}>Sign in to manage listings, placements and performance.</p>
              </div>
              <p style={{ margin: 0, fontSize: 15, color: "rgba(250,247,241,0.85)", fontStyle: "italic", lineHeight: 1.6 }}>"Planie sends us people who were already on their way."</p>
            </>
          ) : (
            <div style={{ margin: "40px 0 auto" }}>
              <p style={{ margin: "0 0 6px", fontSize: 12.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(250,247,241,0.4)" }}>Getting set up · step {step} of 4</p>
              <h1 style={{ ...head, margin: "0 0 36px", fontWeight: 700, fontSize: "clamp(26px, 2.8vw, 38px)", letterSpacing: "-0.02em", lineHeight: 1.05 }}>Put your place on the map.</h1>
              <div className="pla-steps" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {WIZARD_STEPS.map((s) => {
                  const done = step > s.n, cur = step === s.n;
                  return (
                    <div key={s.n} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 0", opacity: done ? 0.6 : cur ? 1 : 0.4 }}>
                      <span style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", ...head, fontWeight: 700, fontSize: 13, border: `1.5px solid ${done || cur ? RED : "rgba(250,247,241,0.3)"}`, background: done ? RED : "transparent", color: done ? CREAM : cur ? RED : "rgba(250,247,241,0.6)" }}>{done ? "✓" : s.n}</span>
                      <span style={{ fontSize: 14.5, fontWeight: cur ? 700 : 500 }}>{s.label}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 28, height: 4, borderRadius: 2, background: "rgba(250,247,241,0.12)", overflow: "hidden", maxWidth: 260 }}><div style={{ width: `${(step / 4) * 100}%`, height: "100%", borderRadius: 2, background: RED, transition: "width 0.4s cubic-bezier(0.22,1,0.36,1)" }} /></div>
            </div>
          )}
        </aside>

        {/* RIGHT */}
        <main style={{ display: "grid", placeItems: "center", padding: "56px 40px" }}>
          <div className="pla-rise" key={mode + step} style={{ width: "min(440px, 100%)" }}>
            <img src={PlanieLogo} alt="Planie" style={{ height: 28, display: "block", marginBottom: 28 }} />

            {/* mode toggle only before account creation */}
            {!signingUp && (
              <div style={{ display: "inline-flex", padding: 4, borderRadius: 100, background: "rgba(28,17,20,0.05)", marginBottom: 28 }}>
                <button style={pill(mode === "signup")} onClick={() => { setMode("signup"); setStep(1); setFormError(null); }}>New partner</button>
                <button style={pill(mode === "signin")} onClick={() => { setMode("signin"); setFormError(null); }}>Sign in</button>
              </div>
            )}

            {errorBox}

            {/* ───────── SIGN IN ───────── */}
            {mode === "signin" && (
              <>
                <h2 style={{ ...head, margin: "0 0 8px", fontWeight: 700, fontSize: 30, letterSpacing: "-0.02em" }}>Welcome back.</h2>
                <p style={{ margin: "0 0 24px", fontSize: 15, opacity: 0.6 }}>Sign in to your partner account.</p>
                {resetNotice && <div role="status" style={{ margin: "0 0 16px", background: "#F0FDF4", border: "1px solid #BBF7D0", color: "#15803D", borderRadius: 12, padding: "10px 14px", fontSize: 14 }}>{resetNotice}</div>}
                <label style={label}>Work email</label>
                <input className="pla-input" type="email" autoComplete="email" placeholder="you@yourplace.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={busy} style={{ ...inputStyle, marginBottom: 14 }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <label style={label}>Password</label>
                  <button type="button" className="pla-link" onClick={handleForgot} disabled={busy} style={{ fontSize: 13, opacity: 0.55, background: "none", border: "none", cursor: "pointer", padding: 0, color: INK, marginBottom: 8 }}>Forgot password?</button>
                </div>
                <input className="pla-input" type="password" autoComplete="current-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !busy && handleSignIn()} disabled={busy} style={{ ...inputStyle, marginBottom: 18 }} />
                <button className="pla-btn" onClick={handleSignIn} disabled={busy} style={primaryBtn}>{busy ? <>Signing in<span className="busy-dots" /></> : "Sign in"}{!busy && arrow}</button>
                <Divider />
                <GoogleBtn onClick={handleGoogle} busy={busy} />
              </>
            )}

            {/* ───────── STEP 1: business ───────── */}
            {mode === "signup" && step === 1 && (
              <>
                <h2 style={{ ...head, margin: "0 0 8px", fontWeight: 700, fontSize: 30, letterSpacing: "-0.02em" }}>First, your business.</h2>
                <p style={{ margin: "0 0 28px", fontSize: 15, opacity: 0.6, lineHeight: 1.6 }}>This is your Business Profile — the account every venue sits under.</p>
                <label style={label}>Business name</label>
                <input className="pla-input" type="text" placeholder="e.g. Sunset Hospitality Group" value={bizName} onChange={(e) => setBizName(e.target.value)} style={{ ...inputStyle, marginBottom: 16 }} />
                <label style={label}>Work email</label>
                <input className="pla-input" type="email" autoComplete="email" placeholder="you@yourplace.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ ...inputStyle, marginBottom: emailFix ? 8 : 20 }} />
                {emailFix && (
                  <p style={{ margin: "0 0 20px", fontSize: 13.5, color: "#9a3412" }}>
                    Did you mean{" "}
                    <button type="button" onClick={() => setEmail(emailFix)} style={{ background: "none", border: "none", padding: 0, color: RED, fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}>{emailFix}</button>
                    ?
                  </p>
                )}
                <button className="pla-btn" onClick={() => step1Valid && setStep(2)} disabled={!step1Valid} style={{ ...primaryBtn, opacity: step1Valid ? 1 : 0.5, cursor: step1Valid ? "pointer" : "not-allowed" }}>Continue{arrow}</button>
                <Divider />
                <GoogleBtn onClick={handleGoogle} busy={busy} label="Sign up with Google" />
              </>
            )}

            {/* ───────── STEP 2: details + password ───────── */}
            {mode === "signup" && step === 2 && (
              <>
                <h2 style={{ ...head, margin: "0 0 8px", fontWeight: 700, fontSize: 30, letterSpacing: "-0.02em" }}>Secure your account.</h2>
                <p style={{ margin: "0 0 24px", fontSize: 15, opacity: 0.6, lineHeight: 1.6 }}>Set a password and tell us who you are.</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                  <div><label style={label}>Full name</label><input className="pla-input" type="text" placeholder="Your name" value={fullName} onChange={(e) => setFullName(e.target.value)} style={inputStyle} /></div>
                  <div><label style={label}>Your role</label><input className="pla-input" type="text" placeholder="e.g. Owner" value={role} onChange={(e) => setRole(e.target.value)} style={inputStyle} /></div>
                </div>
                <label style={label}>Password</label>
                <input className="pla-input" type="password" autoComplete="new-password" placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ ...inputStyle, marginBottom: 10 }} />
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 14, fontSize: 12.5 }}>
                  {[["8+ characters", c.len], ["A letter", c.letter], ["A number", c.num]].map(([t, ok]) => (
                    <span key={t} style={{ display: "flex", alignItems: "center", gap: 5, color: ok ? "#15803D" : "rgba(28,17,20,0.45)" }}>
                      <span style={{ width: 14, height: 14, borderRadius: "50%", display: "grid", placeItems: "center", background: ok ? "#15803D" : "rgba(28,17,20,0.12)", color: "#fff", fontSize: 9, fontWeight: 700 }}>{ok ? "✓" : ""}</span>{t}
                    </span>
                  ))}
                </div>
                <label style={label}>Confirm password</label>
                <input className="pla-input" type="password" autoComplete="new-password" placeholder="Re-enter password" value={confirm} onChange={(e) => setConfirm(e.target.value)} style={{ ...inputStyle, marginBottom: confirm && confirm !== password ? 6 : 20 }} />
                {confirm && confirm !== password && <p style={{ margin: "0 0 16px", fontSize: 13, color: RED }}>Passwords don't match.</p>}
                <button className="pla-btn" onClick={handleCreateAccount} disabled={!step2Valid || busy} style={{ ...primaryBtn, opacity: (step2Valid && !busy) ? 1 : 0.5, cursor: (step2Valid && !busy) ? "pointer" : "not-allowed" }}>{busy ? <>Creating<span className="busy-dots" /></> : "Create account"}{!busy && arrow}</button>
                <button type="button" className="pla-link" onClick={() => setStep(1)} disabled={busy} style={{ marginTop: 14, fontSize: 14, opacity: 0.55, background: "none", border: "none", cursor: "pointer", color: INK }}>← Back</button>
              </>
            )}

            {/* ───────── STEP 3: verify email (auto) ───────── */}
            {mode === "signup" && step === 3 && (
              <>
                <h2 style={{ ...head, margin: "0 0 8px", fontWeight: 700, fontSize: 30, letterSpacing: "-0.02em" }}>Confirm your email.</h2>
                <p style={{ margin: "0 0 6px", fontSize: 15, opacity: 0.6, lineHeight: 1.6 }}>Enter the 6-digit code we emailed to</p>
                <p style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 600, wordBreak: "break-all" }}>{email}</p>
                <input
                  className="pla-input"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="••••••"
                  value={verifyCode}
                  onChange={(e) => { setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6)); setCodeError(null); }}
                  onKeyDown={(e) => { if (e.key === "Enter") handleVerifyCode(); }}
                  style={{ ...inputStyle, marginBottom: 12, letterSpacing: "0.5em", textAlign: "center", fontSize: 22, fontWeight: 700 }}
                />
                {codeError && <p style={{ margin: "0 0 12px", fontSize: 13.5, color: "#DC2626" }}>{codeError}</p>}
                <button className="pla-btn" onClick={handleVerifyCode} disabled={verifyingCode || verifyCode.length !== 6} style={{ ...primaryBtn, marginBottom: 14, opacity: (verifyCode.length === 6 && !verifyingCode) ? 1 : 0.5, cursor: (verifyCode.length === 6 && !verifyingCode) ? "pointer" : "not-allowed" }}>{verifyingCode ? <>Verifying<span className="busy-dots" /></> : "Verify email"}</button>
                <p style={{ fontSize: 13.5, opacity: 0.6, lineHeight: 1.6, marginBottom: 14 }}>The code expires after 15 minutes (check spam too).</p>
                {verifyResent && <p style={{ margin: "0 0 12px", fontSize: 13.5, color: "#15803D" }}>New code sent — check your inbox.</p>}
                <button type="button" className="pla-link" onClick={resendVerify} style={{ fontSize: 14, fontWeight: 600, background: "none", border: "none", cursor: "pointer", color: INK }}>Resend code</button>
                <button type="button" onClick={logout} style={{ display: "block", marginTop: 20, fontSize: 13.5, color: "rgba(28,17,20,0.5)", background: "none", border: "none", cursor: "pointer" }}>Use a different email</button>
              </>
            )}

            {/* ───────── STEP 4: first venue (skippable) ───────── */}
            {mode === "signup" && step === 4 && (
              <>
                <p className="nu-microlabel" style={{ marginBottom: 6, color: "#15803D", opacity: 1 }}>✓ Account created</p>
                <h2 style={{ ...head, margin: "0 0 8px", fontWeight: 700, fontSize: 30, letterSpacing: "-0.02em" }}>Add your first venue.</h2>
                <p style={{ margin: "0 0 24px", fontSize: 15, opacity: 0.6, lineHeight: 1.6 }}>Each location is its own listing — or skip and do it later from the portal.</p>
                <label style={label}>Venue name</label>
                <input className="pla-input" type="text" placeholder="e.g. Sunset Rooftop Bar" value={venueName} onChange={(e) => setVenueName(e.target.value)} style={{ ...inputStyle, marginBottom: 16 }} />
                <label style={label}>Category</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                  {CATEGORIES.map((cat) => {
                    const on = cat === venueCat;
                    return <button key={cat} onClick={() => setVenueCat(cat)} style={{ fontSize: 13.5, fontWeight: 500, cursor: "pointer", padding: "9px 14px", borderRadius: 100, border: `1px solid ${on ? INK : "rgba(28,17,20,0.16)"}`, background: on ? INK : "transparent", color: on ? CREAM : INK, transition: "all 0.2s" }}>{cat}</button>;
                  })}
                </div>
                <label style={label}>City</label>
                <input className="pla-input" type="text" placeholder="e.g. your city" value={venueCity} onChange={(e) => setVenueCity(e.target.value)} style={{ ...inputStyle, marginBottom: 22 }} />
                <div style={{ display: "flex", gap: 12 }}>
                  <button type="button" className="pla-out" onClick={skipListing} style={{ flex: 1, boxSizing: "border-box", fontFamily: "'Instrument Sans', sans-serif", fontSize: 15, fontWeight: 600, cursor: "pointer", padding: 15, borderRadius: 100, border: "1px solid rgba(28,17,20,0.16)", background: "transparent", color: INK, transition: "border-color 0.2s" }}>Skip for now</button>
                  <button className="pla-btn" onClick={continueListing} disabled={!step4Valid} style={{ ...primaryBtn, flex: 1, opacity: step4Valid ? 1 : 0.5, cursor: step4Valid ? "pointer" : "not-allowed" }}>Continue{arrow}</button>
                </div>
              </>
            )}

            {mode === "signup" && step <= 2 && (
              <p style={{ margin: "28px 0 0", fontSize: 13, lineHeight: 1.6, opacity: 0.45 }}>By continuing you agree to Planie's <Link to="/terms" style={{ textDecoration: "underline", color: "inherit" }}>Partner Terms</Link> and <Link to="/privacy" style={{ textDecoration: "underline", color: "inherit" }}>Privacy Policy</Link>.</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function Divider() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "24px 0" }}>
      <div style={{ flex: 1, height: 1, background: "rgba(28,17,20,0.1)" }} />
      <span style={{ fontSize: 13, opacity: 0.45 }}>or</span>
      <div style={{ flex: 1, height: 1, background: "rgba(28,17,20,0.1)" }} />
    </div>
  );
}

function GoogleBtn({ onClick, busy, label = "Continue with Google" }) {
  return (
    <button className="pla-out" onClick={onClick} disabled={busy} style={{ width: "100%", boxSizing: "border-box", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9, fontFamily: "'Instrument Sans', sans-serif", fontSize: 15, fontWeight: 600, cursor: "pointer", padding: 14, borderRadius: 100, border: "1px solid rgba(28,17,20,0.16)", background: "transparent", color: "#1C1114", transition: "border-color 0.2s, background 0.2s" }}>
      <svg width="17" height="17" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.24 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" /><path fill="#FBBC05" d="M5.84 14.09a6.6 6.6 0 0 1 0-4.18V7.07H2.18a11 11 0 0 0 0 9.86l3.66-2.84Z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" /></svg>
      {label}
    </button>
  );
}
