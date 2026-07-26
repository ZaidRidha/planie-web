/* Email-verification step of account creation — reskinned to the design's
   Onboarding look (ink progress rail + step panel). All logic unchanged:
   sends the SendGrid verification mail on first render, offers resend, and
   re-checks the profile on "I've verified".

   <RequireVerifiedEmail> is the route-guard wrapper used in App.js — kept in
   this file so the context module doesn't need to import UI. */

import { useEffect, useRef, useState } from "react";
import { MailCheck, LogOut, RefreshCw } from "lucide-react";
import { usePartnerAuth } from "../Context/PartnerAuthContext";
import { sendPartnerVerificationEmail } from "../utils/partnerAccount";

const INK = "#1C1114", CREAM = "#FAF7F1", RED = "#FF4040";
const head = { fontFamily: "'Gabarito', sans-serif" };

export function RequireVerifiedEmail({ children }) {
  const { profile } = usePartnerAuth();
  if (profile && profile.emailVerified !== true) return <VerifyEmailScreen />;
  return children;
}

const STEPS = [
  { label: "Create your account", state: "done" },
  { label: "Verify your email", state: "current" },
  { label: "Verify your business", state: "todo" },
  { label: "Add your first venue", state: "todo" },
];

export default function VerifyEmailScreen() {
  const { user, refreshProfile, logout } = usePartnerAuth();
  const [status, setStatus] = useState("sending"); // sending | sent | error
  const [error, setError] = useState(null);
  const [checking, setChecking] = useState(false);
  const [notYet, setNotYet] = useState(false);
  const sentOnce = useRef(false);

  const send = async () => {
    setStatus("sending");
    setError(null);
    try {
      await sendPartnerVerificationEmail();
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(err.message || "Could not send the verification email.");
    }
  };

  useEffect(() => {
    if (sentOnce.current) return;
    sentOnce.current = true;
    send();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleContinue = async () => {
    setChecking(true);
    setNotYet(false);
    await refreshProfile();
    setChecking(false);
    setNotYet(true);
  };

  return (
    <div style={{ fontFamily: "'Instrument Sans', sans-serif", color: INK, minHeight: "100vh", background: CREAM }}>
      <style>{`
        .vo-grid { display: grid; grid-template-columns: minmax(360px, 40%) 1fr; min-height: 100vh; }
        @keyframes voDraw { from { stroke-dashoffset: 640; } to { stroke-dashoffset: 0; } }
        @keyframes voRise { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .vo-rise { animation: voRise 0.6s cubic-bezier(0.22,1,0.36,1) both; }
        .vo-btn-dark:hover { background: ${RED} !important; }
        .vo-btn-out:hover { border-color: ${INK} !important; }
        @media (max-width: 900px) { .vo-grid { grid-template-columns: 1fr; } .vo-aside { min-height: auto !important; padding: 32px 28px !important; } .vo-steps { display: none; } }
      `}</style>

      <div className="vo-grid">
        {/* Left — progress (ink) */}
        <aside className="vo-aside" style={{ background: INK, color: CREAM, padding: "44px 52px", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", boxSizing: "border-box", overflow: "hidden" }}>
          <span style={{ color: "rgba(250,247,241,0.6)", fontSize: 15, fontWeight: 500 }}>Planie</span>
          <div style={{ margin: "40px 0 auto" }}>
            <svg viewBox="0 0 360 150" style={{ width: "min(280px,80%)", display: "block", marginBottom: 36 }}>
              <g stroke={CREAM} strokeOpacity="0.08" strokeWidth="1.5" fill="none">
                <path d="M -10 50 C 110 34, 230 84, 380 56" /><path d="M -10 120 C 130 104, 250 150, 380 128" />
              </g>
              <path d="M 40 36 C 150 66, 130 120, 250 128 C 290 131, 300 120, 312 110" fill="none" stroke={RED} strokeWidth="3" strokeLinecap="round" strokeDasharray="640" style={{ animation: "voDraw 2s cubic-bezier(0.4,0,0.2,1) 0.3s both" }} />
              <circle cx="313" cy="108" r="9" fill={RED} />
            </svg>
            <p style={{ margin: "0 0 6px", fontSize: 12.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(250,247,241,0.4)" }}>Getting set up</p>
            <h1 style={{ ...head, margin: "0 0 36px", fontWeight: 700, fontSize: "clamp(28px,3vw,40px)", letterSpacing: "-0.02em", lineHeight: 1.05 }}>Confirm your email to continue.</h1>
            <div className="vo-steps" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {STEPS.map((s, i) => {
                const done = s.state === "done", cur = s.state === "current";
                return (
                  <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 0", opacity: done ? 0.6 : cur ? 1 : 0.4 }}>
                    <span style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", ...head, fontWeight: 700, fontSize: 13, border: `1.5px solid ${done || cur ? RED : "rgba(250,247,241,0.3)"}`, background: done ? RED : "transparent", color: done ? CREAM : cur ? RED : "rgba(250,247,241,0.6)" }}>{done ? "✓" : i + 1}</span>
                    <span style={{ fontSize: 14.5, fontWeight: cur ? 700 : 500 }}>{s.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div>
            <div style={{ height: 4, borderRadius: 2, background: "rgba(250,247,241,0.12)", overflow: "hidden" }}><div style={{ width: "50%", height: "100%", borderRadius: 2, background: RED }} /></div>
            <p style={{ margin: "12px 0 0", fontSize: 12.5, color: "rgba(250,247,241,0.4)" }}>Takes about 3 minutes. You can finish later.</p>
          </div>
        </aside>

        {/* Right — the email step */}
        <main style={{ display: "flex", flexDirection: "column", padding: "56px 56px 40px", boxSizing: "border-box", minHeight: "100vh", justifyContent: "center" }}>
          <div className="vo-rise" style={{ width: "100%", maxWidth: 480, margin: "0 auto" }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(28,17,20,0.05)", display: "grid", placeItems: "center", marginBottom: 22 }}>
              <MailCheck size={26} color={RED} />
            </div>
            <h2 style={{ ...head, margin: "0 0 8px", fontWeight: 700, fontSize: 30, letterSpacing: "-0.02em" }}>Confirm your email.</h2>
            <p style={{ margin: "0 0 6px", fontSize: 15, opacity: 0.6, lineHeight: 1.6 }}>
              {status === "sending" && "Sending a verification link to"}
              {status === "sent" && "We've sent a verification link to"}
              {status === "error" && "We tried to send a verification link to"}
            </p>
            <p style={{ margin: "0 0 24px", fontSize: 15, fontWeight: 600, wordBreak: "break-all" }}>{user?.email}</p>

            {error && <div role="alert" style={{ marginBottom: 16, borderRadius: 12, border: "1px solid #FECACA", background: "#FEF2F2", padding: "10px 14px", fontSize: 14, color: "#B91C1C" }}>{error}</div>}
            {notYet && !error && <div role="alert" style={{ marginBottom: 16, borderRadius: 12, border: "1px solid #FDE68A", background: "#FFFBEB", padding: "10px 14px", fontSize: 14, color: "#92400E" }}>Not verified yet — click the link in the email first, then try again.</div>}

            <p style={{ fontSize: 13, opacity: 0.5, marginBottom: 24 }}>Click the link in the email, then come back here. It expires after 15 minutes (check spam too).</p>

            <button className="vo-btn-dark" onClick={handleContinue} disabled={checking || status === "sending"} style={{ width: "100%", boxSizing: "border-box", borderRadius: 100, background: INK, color: CREAM, border: "none", padding: 15, fontSize: 15, fontWeight: 600, cursor: "pointer", marginBottom: 12, opacity: (checking || status === "sending") ? 0.6 : 1, transition: "background 0.25s" }}>
              {checking ? "Checking…" : "I've verified my email"}
            </button>
            <button className="vo-btn-out" onClick={send} disabled={status === "sending"} style={{ width: "100%", boxSizing: "border-box", borderRadius: 100, background: "transparent", color: INK, border: "1px solid rgba(28,17,20,0.16)", padding: 15, fontSize: 15, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "border-color 0.2s" }}>
              <RefreshCw size={15} /> {status === "sending" ? "Sending…" : "Resend email"}
            </button>

            <button onClick={logout} style={{ marginTop: 24, display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, color: "rgba(28,17,20,0.5)", background: "none", border: "none", cursor: "pointer" }}>
              <LogOut size={15} /> Sign out and use a different account
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
