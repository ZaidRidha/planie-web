/* ContactPage — public contact form, ported from "Planie Contact.dc.html".
   Submits to the /contact Express route (backend contactForm.ts). Renders
   inside the public Header/Footer layout. */

import { useState } from "react";
import { Link } from "react-router-dom";
import { callApiRoute } from "../utils/api";

const TOPICS = ["General", "Partnerships", "Press", "Support"];
const CHANNELS = [
  { label: "General", value: "hello@planie.app", href: "mailto:hello@planie.app", note: "Anything about the app or your account." },
  { label: "Partnerships", value: "partners@planie.app", href: "mailto:partners@planie.app", note: "Listing your venue, placements and campaigns." },
  { label: "Press", value: "press@planie.app", href: "mailto:press@planie.app", note: "Media, brand assets and interviews." },
];

const glass = {
  borderRadius: 18,
  background: "rgba(255,255,255,0.62)",
  boxShadow: "0 1px 0 rgba(255,255,255,0.9) inset, 0 12px 36px rgba(28,17,20,0.04)",
  padding: "22px 24px",
};
const validEmail = (e) => /.+@.+\..+/.test(e);
const inputStyle = {
  width: "100%", boxSizing: "border-box", fontSize: 15, padding: "13px 16px",
  borderRadius: 13, border: "1px solid rgba(28,17,20,0.14)",
  background: "rgba(255,255,255,0.7)", color: "var(--nu-ink)", fontFamily: "var(--nu-font-body)",
};

export default function ContactPage() {
  const [topic, setTopic] = useState("General");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const ready = name.trim().length > 1 && validEmail(email) && message.trim().length > 3;
  const head = { fontFamily: "var(--nu-font-head)", fontWeight: 700 };

  const submit = async () => {
    if (!ready || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await callApiRoute("/contact", { topic, name, email, message });
      setSent(true);
    } catch (err) {
      setError(err.message || "Could not send your message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ background: "var(--nu-bg)", color: "var(--nu-ink)", fontFamily: "var(--nu-font-body)", paddingTop: 72, minHeight: "100vh" }}>
      <main style={{ maxWidth: 1180, margin: "0 auto", padding: "80px 40px 100px" }}>
        <header style={{ marginBottom: 44 }}>
          <p className="nu-microlabel" style={{ marginBottom: 16 }}>Contact</p>
          <h1 style={{ ...head, margin: 0, fontSize: "clamp(40px, 6vw, 68px)", letterSpacing: "-0.025em", lineHeight: 1.02 }}>
            Let's talk.
          </h1>
          <p style={{ margin: "18px 0 0", fontSize: 17, lineHeight: 1.6, opacity: 0.6, maxWidth: "52ch" }}>
            Questions, partnerships or press — pick a topic and we'll route it to the right team.
          </p>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: 28, alignItems: "start" }}>
          {/* Form / confirmation */}
          <div style={{ ...glass, padding: "30px 32px" }}>
            {sent ? (
              <div style={{ textAlign: "center", padding: "30px 10px" }}>
                <div style={{ width: 54, height: 54, margin: "0 auto 18px", borderRadius: "50%", background: "var(--nu-ink)", color: "var(--nu-cream)", display: "grid", placeItems: "center" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                </div>
                <h2 style={{ ...head, margin: 0, fontSize: 24 }}>Message sent</h2>
                <p style={{ margin: "12px 0 22px", fontSize: 15, lineHeight: 1.6, opacity: 0.6 }}>
                  Thanks{name.trim() ? `, ${name.trim().split(" ")[0]}` : ""} — it reached the {topic} team. We'll reply by email.
                </p>
                <button className="nu-btn nu-btn--outline" onClick={() => { setSent(false); setName(""); setEmail(""); setMessage(""); setTopic("General"); }}>
                  Send another
                </button>
              </div>
            ) : (
              <>
                <p style={{ ...head, margin: "0 0 6px", fontSize: 20 }}>Send us a message</p>
                <p style={{ margin: "0 0 22px", fontSize: 13.5, opacity: 0.55 }}>Pick a topic so it reaches the right team.</p>

                <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.45 }}>Topic</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 }}>
                  {TOPICS.map((t) => {
                    const on = t === topic;
                    return (
                      <button key={t} onClick={() => setTopic(t)} style={{
                        fontFamily: "var(--nu-font-body)", fontSize: 13.5, fontWeight: 600, cursor: "pointer",
                        padding: "9px 16px", borderRadius: 100, transition: "all 0.2s",
                        border: `1px solid ${on ? "var(--nu-ink)" : "rgba(28,17,20,0.16)"}`,
                        background: on ? "var(--nu-ink)" : "transparent",
                        color: on ? "var(--nu-cream)" : "var(--nu-ink)",
                      }}>{t}</button>
                    );
                  })}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, opacity: 0.7, marginBottom: 7 }}>Your name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, opacity: 0.7, marginBottom: 7 }}>Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={inputStyle} />
                  </div>
                </div>

                <div style={{ marginTop: 14 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, opacity: 0.7, marginBottom: 7 }}>Message</label>
                  <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="How can we help?" style={{ ...inputStyle, minHeight: 130, resize: "vertical", lineHeight: 1.5 }} />
                </div>

                {error && <p style={{ margin: "14px 0 0", fontSize: 13.5, color: "var(--nu-red)" }}>{error}</p>}

                <div style={{ marginTop: 22, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
                  <p style={{ margin: 0, fontSize: 12.5, opacity: 0.45, maxWidth: "26ch" }}>
                    {ready ? `Goes to the ${topic} team.` : "Add your name, a valid email and a message."}
                  </p>
                  <button className="nu-btn nu-btn--fill" onClick={submit} disabled={!ready || submitting} style={{ fontSize: 15, padding: "14px 30px" }}>
                    {submitting ? "Sending…" : "Send message"}
                    {!submitting && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h13" /><path d="M12 5l7 7-7 7" /></svg>}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Contact details */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {CHANNELS.map((c) => (
              <div key={c.label} style={glass}>
                <p style={{ margin: 0, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.45 }}>{c.label}</p>
                <a href={c.href} style={{ display: "inline-block", margin: "8px 0 0", ...head, fontSize: 18, color: "var(--nu-red)" }}>{c.value}</a>
                <p style={{ margin: "6px 0 0", fontSize: 13.5, lineHeight: 1.5, opacity: 0.55 }}>{c.note}</p>
              </div>
            ))}
            <div style={{ borderRadius: 18, background: "var(--nu-ink)", color: "var(--nu-cream)", padding: "22px 24px" }}>
              <p style={{ ...head, margin: 0, fontSize: 16 }}>Own a place people should find?</p>
              <p style={{ margin: "8px 0 14px", fontSize: 13.5, lineHeight: 1.55, color: "rgba(250,247,241,0.62)" }}>
                Join Planie and get placed inside itineraries the moment someone nearby is deciding.
              </p>
              <Link to="/partners" style={{ fontSize: 14, fontWeight: 600, color: "var(--nu-red)" }}>Become a partner →</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
