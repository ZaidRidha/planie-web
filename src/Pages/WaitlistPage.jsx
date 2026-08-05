/* WaitlistPage - consumer waitlist for the app launch (/waitlist). UI only:
   nothing is sent anywhere yet, so the submit fakes its round trip and every
   field lives in useState, ready to hand to a real endpoint. Mirrors
   ContactPage's shape (fields -> `ready` gate -> success state) and the newUi
   cream/ink tokens; Waitlist.css carries keyframes, states and media queries.

   Source is deliberately ASCII-only (this repo has documented CP1252/UTF-8
   damage - see the mojibake in Footer.jsx). */

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { MARKETING_NAV_HEIGHT } from "../Components/MarketingHeader";
import { callApiRoute } from "../utils/api";
import "./Waitlist.css";

/* Name of the backend's hidden honeypot field (formGuard.ts HONEYPOT_FIELD).
   It must render, and must stay empty: a bot that fills every input trips it
   and its submission is silently dropped. Renamed only in lockstep with the
   backend, or every real signup starts looking legitimate to a bot again. */
const HONEYPOT_FIELD = "company_website_hp";

const PLATFORMS = ["iOS", "Android", "Either"];

/* The occasions Planie is for, in the app's own words - drawn from the
   marketing page's marquee and plan labels (public/marketing/home.html).
   Nothing invented here: no numbers, no dates, no claims. */
const OCCASIONS = ["date night", "a rainy Sunday", "48 hours in Lisbon", "a group trip", "an anniversary"];

const validEmail = (e) => /.+@.+\..+/.test(e);

const glass = {
  borderRadius: 18,
  background: "rgba(255,255,255,0.62)",
  boxShadow: "0 1px 0 rgba(255,255,255,0.9) inset, 0 12px 36px rgba(28,17,20,0.04)",
  padding: "22px 24px",
};
const inputStyle = {
  width: "100%", boxSizing: "border-box", fontSize: 15, padding: "13px 16px",
  borderRadius: 13, border: "1px solid rgba(28,17,20,0.14)",
  background: "rgba(255,255,255,0.7)", color: "var(--nu-ink)", fontFamily: "var(--nu-font-body)",
};
const head = { fontFamily: "var(--nu-font-head)", fontWeight: 700 };
const fieldLabel = { display: "block", fontSize: 13, fontWeight: 600, opacity: 0.7, marginBottom: 7 };
const legendLabel = {
  padding: 0, marginBottom: 10, fontSize: 12, fontWeight: 600,
  letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.45,
};

const STEPS = [
  { title: "You join", body: "Email now. Everything else is optional." },
  { title: "We build", body: "Plans, places and timings, city by city." },
  { title: "You get one email", body: "The day Planie goes live. Nothing before it." },
];

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [platform, setPlatform] = useState("Either");
  const [city, setCity] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | loading | done
  const [error, setError] = useState(null);
  const [honeypot, setHoneypot] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [cityTouched, setCityTouched] = useState(false);
  const [occasion, setOccasion] = useState(0);
  const doneHeadingRef = useRef(null);

  /* Success replaces the form, so send focus to its heading. The aria-live
     region alone would be unreliable (it mounts at the same moment its content
     appears), so this focus move is what makes it announce - do not remove it. */
  useEffect(() => {
    if (status === "done") doneHeadingRef.current?.focus();
  }, [status]);

  /* Rotate the hero's occasion line. Reduced motion stops the rotation
     outright rather than just dropping the transition - a phrase swapping
     under you is motion whether or not it animates. Nothing here writes an
     inline opacity, so no element can be stranded invisible. */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const id = setInterval(() => setOccasion((i) => (i + 1) % OCCASIONS.length), 2600);
    return () => clearInterval(id);
  }, []);

  const emailOk = validEmail(email);
  const cityOk = city.trim().length >= 2;
  const ready = emailOk && cityOk && consent;
  const loading = status === "loading";
  const showEmailError = emailTouched && !emailOk;
  const showCityError = cityTouched && !cityOk;

  const submit = async (e) => {
    e.preventDefault();
    setEmailTouched(true);
    setCityTouched(true);
    if (!ready || loading) return;
    setStatus("loading");
    setError(null);
    try {
      await callApiRoute("/waitlist", {
        email: email.trim(),
        city: city.trim(),
        platform,
        consent,
        [HONEYPOT_FIELD]: honeypot,
      });
      setStatus("done");
    } catch (err) {
      /* Back to the form with the fields intact - the one thing a failed
         signup must not do is make the user retype it. */
      setStatus("idle");
      setError(err.message || "Could not add you to the list. Please try again.");
    }
  };

  const startOver = () => {
    setStatus("idle");
    setError(null);
    setEmailTouched(false);
    setCityTouched(false);
    setEmail("");
    setPlatform("Either");
    setCity("");
    setConsent(false);
  };

  return (
    <div className="wl-page" style={{ background: "var(--nu-bg)", color: "var(--nu-ink)", fontFamily: "var(--nu-font-body)", paddingTop: MARKETING_NAV_HEIGHT, minHeight: "100vh" }}>
      {/* A plain div, not <main>: App.js already wraps this route in one, and
          two main landmarks would confuse screen-reader navigation. */}
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "clamp(48px, 8vw, 80px) clamp(20px, 5vw, 40px) clamp(72px, 10vw, 100px)" }}>
        {/* Centered hero: every child that carries a ch-based maxWidth also needs
            `margin: 0 auto`, or textAlign alone leaves the box hugging the left. */}
        <header style={{ marginBottom: 44, textAlign: "center" }}>
          <p className="nu-microlabel wl-reveal" style={{ marginBottom: 16 }}>The waitlist</p>
          {/* Two deliberate lines rather than one reflowing sentence: the second
              clause is the actual ask, so it gets its own line and the accent.
              display:block on the spans keeps the break at every width. */}
          <h1 className="wl-reveal" style={{ ...head, "--wl-d": "0.07s", margin: "0 auto", fontSize: "clamp(38px, 6vw, 68px)", letterSpacing: "-0.025em", lineHeight: 1.04, maxWidth: "16ch" }}>
            <span style={{ display: "block" }}>Planie isn't out yet.</span>
            <span style={{ display: "block" }}>
              Be <span style={{ color: "var(--nu-red)" }}>first</span> when it is.
            </span>
          </h1>

          {/* Signature line: what the app is for, in its own vernacular. The
              rotator is decorative motion, so it is hidden from assistive tech
              and the whole list is read out instead. */}
          <p className="wl-reveal" style={{ "--wl-d": "0.15s", margin: "24px 0 0", fontFamily: "var(--nu-font-head)", fontWeight: 600, fontSize: "clamp(19px, 2.4vw, 26px)", letterSpacing: "-0.015em" }}>
            <span aria-hidden="true">
              Built for <span className="wl-rotator" key={occasion}>{OCCASIONS[occasion]}</span>.
            </span>
            {/* Derived from OCCASIONS, never retyped: if the list changes, the
                screen-reader sentence changes with it. A hardcoded copy would
                drift silently, since nothing on screen would look wrong. */}
            <span className="wl-sr">Built for {OCCASIONS.join(", ")}.</span>
          </p>

          <p className="wl-reveal" style={{ "--wl-d": "0.22s", margin: "16px auto 0", fontSize: 17, lineHeight: 1.6, opacity: 0.6, maxWidth: "50ch" }}>
            Tell Planie the day you've got and it builds the whole thing: where to eat, what to do,
            in the order that actually works.
          </p>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: 28, alignItems: "start" }}>
          {/* Form / confirmation */}
          <div className="wl-reveal" style={{ ...glass, "--wl-d": "0.3s", padding: "clamp(24px, 4vw, 30px) clamp(20px, 4vw, 32px)" }}>
            <div>
              {status === "done" ? (
                <div aria-live="polite" style={{ textAlign: "center", padding: "22px 0 10px" }}>
                  <div className="wl-badge" style={{ width: 54, height: 54, margin: "0 auto 18px", borderRadius: "50%", background: "var(--nu-ink)", color: "var(--nu-cream)", display: "grid", placeItems: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path className="wl-check-path" d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                  {/* scrollMarginTop clears the fixed 100px marketing nav AND the badge
                      above this heading (54px + margin): focusing scrolls the
                      heading to the top of the viewport, which would otherwise
                      hide both the header-lapped title and the tick animation
                      that is the point of the moment. Found by rendering. */}
                  <h2 ref={doneHeadingRef} tabIndex={-1} className="wl-done-line" style={{ ...head, "--wl-d": "0.12s", margin: 0, fontSize: 26, outline: "none", scrollMarginTop: 198 }}>
                    You're in.
                  </h2>
                  <p className="wl-done-line" style={{ "--wl-d": "0.2s", margin: "12px auto 0", fontSize: 15, lineHeight: 1.6, opacity: 0.6, maxWidth: "36ch" }}>
                    We'll email <strong style={{ fontWeight: 600, opacity: 0.85 }}>{email}</strong> the day Planie goes live
                    {platform === "Either" ? "" : ` on ${platform}`}. Nothing before then.
                  </p>
                  <p className="wl-done-line" style={{ "--wl-d": "0.28s", margin: "22px auto 0", fontSize: 14, lineHeight: 1.6, opacity: 0.6, maxWidth: "40ch" }}>
                    Run a place people should find?{" "}
                    <Link className="wl-link" to="/waitlist/business" style={{ fontWeight: 600, color: "var(--nu-red)" }}>
                      Get early access for businesses -&gt;
                    </Link>
                  </p>
                  <button type="button" className="nu-btn nu-btn--outline wl-btn wl-done-line" onClick={startOver} style={{ "--wl-d": "0.34s", marginTop: 24 }}>
                    Add another email
                  </button>
                </div>
              ) : (
                <form onSubmit={submit} noValidate>
                  {/* Honeypot. Hidden from sight AND from assistive tech, and
                      taken out of the tab order, so no human can reach it -
                      only a bot filling every field. Not display:none: some
                      bots skip those. tabIndex on an input is legitimate here. */}
                  <input
                    type="text"
                    name={HONEYPOT_FIELD}
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
                  />
                  <p style={{ ...head, margin: "0 0 6px", fontSize: 20 }}>One email, the day it lands.</p>
                  <p style={{ margin: "0 0 22px", fontSize: 13.5, opacity: 0.55 }}>
                    Your email is all we need. The rest just helps.
                  </p>

                  <div>
                    <label htmlFor="wl-email" style={fieldLabel}>Email</label>
                    <input
                      id="wl-email"
                      className="wl-input"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => setEmailTouched(true)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                      aria-invalid={showEmailError ? "true" : "false"}
                      aria-describedby={showEmailError ? "wl-email-error" : undefined}
                      style={{ ...inputStyle, borderColor: showEmailError ? "var(--nu-red)" : "rgba(28,17,20,0.14)" }}
                    />
                    {showEmailError && (
                      <p id="wl-email-error" style={{ margin: "8px 0 0", fontSize: 13, color: "var(--nu-red)" }}>
                        Add an email we can reach you on.
                      </p>
                    )}
                  </div>

                  <fieldset style={{ border: 0, padding: 0, margin: "20px 0 0", minWidth: 0 }}>
                    <legend style={legendLabel}>Which phone are you on?</legend>
                    <div className="wl-pills" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {PLATFORMS.map((p) => (
                        <label key={p} className="wl-pill-wrap">
                          <input
                            className="wl-pill-input"
                            type="radio"
                            name="wl-platform"
                            value={p}
                            checked={platform === p}
                            onChange={() => setPlatform(p)}
                          />
                          <span className="wl-pill">
                            <svg className="wl-pill-tick" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                            {p}
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <div style={{ marginTop: 20 }}>
                    <label htmlFor="wl-city" style={fieldLabel}>City</label>
                    <input
                      id="wl-city"
                      className="wl-input"
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      onBlur={() => setCityTouched(true)}
                      placeholder="London"
                      autoComplete="address-level2"
                      required
                      aria-invalid={showCityError ? "true" : "false"}
                      aria-describedby={showCityError ? "wl-city-error" : "wl-city-hint"}
                      style={{ ...inputStyle, borderColor: showCityError ? "var(--nu-red)" : "rgba(28,17,20,0.14)" }}
                    />
                    {showCityError ? (
                      <p id="wl-city-error" style={{ margin: "8px 0 0", fontSize: 13, color: "var(--nu-red)" }}>
                        Add the city you're in.
                      </p>
                    ) : (
                      <p id="wl-city-hint" style={{ margin: "8px 0 0", fontSize: 12.5, opacity: 0.45 }}>
                        So we know which cities to cover first.
                      </p>
                    )}
                  </div>

                  <label htmlFor="wl-consent" style={{ display: "flex", alignItems: "flex-start", gap: 11, marginTop: 22, fontSize: 13.5, lineHeight: 1.5, cursor: "pointer" }}>
                    <input
                      id="wl-consent"
                      className="wl-check"
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                    />
                    <span style={{ opacity: 0.7 }}>
                      Email me updates about Planie. See our{" "}
                      <Link className="wl-link" to="/privacy" style={{ color: "var(--nu-red)", fontWeight: 600 }}>privacy policy</Link>.
                    </span>
                  </label>

                  {/* role="alert" so a failure is announced: it appears after
                      the button was pressed, when focus is still on the button
                      and the user may not be looking here. */}
                  {error && (
                    <p role="alert" style={{ margin: "18px 0 0", fontSize: 13, lineHeight: 1.5, color: "var(--nu-red)" }}>
                      {error}
                    </p>
                  )}

                  <div className="wl-submit-row" style={{ marginTop: 24, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
                    <p id="wl-submit-hint" aria-live="polite" style={{ margin: 0, fontSize: 12.5, opacity: 0.45, maxWidth: "24ch" }}>
                      {loading
                        ? "Adding you to the list."
                        : ready
                          ? "We'll only email you about the launch."
                          : "Add your email and city, then tick the box."}
                    </p>
                    <button type="submit" className="nu-btn nu-btn--fill wl-btn wl-submit" disabled={!ready || loading} aria-describedby="wl-submit-hint" style={{ fontSize: 15, padding: "14px 30px" }}>
                      {loading ? (
                        <>
                          Adding you
                          <span className="wl-dots" aria-hidden="true"><i /><i /><i /></span>
                        </>
                      ) : (
                        <>
                          Join the waitlist
                          <svg className="wl-arrow" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M5 12h13" /><path d="M12 5l7 7-7 7" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Side column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="wl-reveal" style={{ ...glass, "--wl-d": "0.38s" }}>
              <p style={{ margin: 0, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.45 }}>What happens next</p>
              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 15 }}>
                {STEPS.map((s) => (
                  <div key={s.title} style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--nu-red)", flexShrink: 0, transform: "translateY(-2px)" }} aria-hidden="true" />
                    <span style={{ fontSize: 14.5, lineHeight: 1.55 }}>
                      <strong style={{ fontWeight: 600 }}>{s.title}.</strong>{" "}
                      <span style={{ opacity: 0.6 }}>{s.body}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="wl-reveal" style={{ "--wl-d": "0.46s", borderRadius: 18, background: "var(--nu-ink)", color: "var(--nu-cream)", padding: "22px 24px" }}>
              <p style={{ ...head, margin: 0, fontSize: 16 }}>Own a place people should find?</p>
              <p style={{ margin: "8px 0 14px", fontSize: 13.5, lineHeight: 1.55, color: "rgba(250,247,241,0.62)" }}>
                Join Planie and get placed inside itineraries the moment someone nearby is deciding.
              </p>
              <Link className="wl-link" to="/waitlist/business" style={{ fontSize: 14, fontWeight: 600, color: "var(--nu-red)" }}>
                Early access for businesses -&gt;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
