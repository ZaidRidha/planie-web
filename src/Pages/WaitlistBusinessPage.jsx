/* WaitlistBusinessPage - "/waitlist/business", early access for venues that
   want to be placed inside Planie itineraries. UI only: the submit fakes a
   short delay and shows a success state; nothing is persisted yet.

   The value prop leads and is reused verbatim from the copy that already
   exists on the site - the "For the places" coda in
   public/marketing/home.html (lines 619-627) and the partner CTA card in
   src/Pages/ContactPage.jsx (lines 145-151). The two sanctioned sentences are
   character-for-character; the headline even keeps home.html's own line break.
   No claims about reach, pricing or user numbers are invented here, and there
   is deliberately no social proof: the real number can go in once there is one.

   Motion lives in WaitlistBusiness.css and is pure CSS with `both` fill, so
   nothing can strand invisible - see the motion policy in that file. */

import { useState } from "react";
import { Link } from "react-router-dom";
import "./WaitlistBusiness.css";

const VENUE_TYPES = ["Restaurant", "Bar", "Cafe", "Attraction", "Hotel", "Experience", "Other"];

/* Three words lifted from the home.html value prop. They are three attributes
   of one offer, NOT a sequence - so they get a plain stack that reveals in
   order, never a numbered or stepped device that would imply an order which
   is not true. */
const HOW_PARTNERS_APPEAR = ["Prioritised", "Matched to intent", "Measured"];

/* This one IS a real sequence, so it is numbered. Steps 2 and 3 are verbatim
   from PlacementWorks.jsx; step 1 states only what the form itself does. No
   timeline is claimed, because none exists. */
const NEXT_STEPS = [
  "You join the early access list.",
  "Our team reviews every listing before it goes live.",
  "You appear when you genuinely fit.",
];

const head = { fontFamily: "var(--nu-font-head)", fontWeight: 700, letterSpacing: "-0.02em" };

const glass = {
  borderRadius: 18,
  background: "rgba(255,255,255,0.62)",
  boxShadow: "0 1px 0 rgba(255,255,255,0.9) inset, 0 12px 36px rgba(28,17,20,0.04)",
  padding: "30px 32px",
};

/* Both grids reflow on their own via auto-fit + minmax(min(100%, ...)) - the
   min(100%) is what keeps them from overflowing at 360px - so neither needs a
   media query, and both can stay inline. */
const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 330px), 1fr))",
  gap: 28,
  alignItems: "start",
};
const rowStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 190px), 1fr))",
  gap: 14,
};
const chipRow = { display: "flex", flexWrap: "wrap", gap: 8, listStyle: "none", margin: 0, padding: 0 };
/* minWidth 0 - without it a fieldset refuses to shrink below its content. */
const fieldsetStyle = { border: 0, margin: 0, padding: 0, minWidth: 0 };

const labelStyle = { display: "block", fontSize: 13, fontWeight: 600, opacity: 0.7, marginBottom: 7 };
const errorStyle = { margin: "7px 0 0", fontSize: 12.5, fontWeight: 600, color: "var(--nu-red)" };
const srOnly = {
  position: "absolute", width: 1, height: 1, padding: 0, margin: -1,
  overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", border: 0,
};

const Arrow = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h13" />
    <path d="M12 5l7 7-7 7" />
  </svg>
);

/* Same regex as ContactPage, so validation behaves consistently site-wide. */
const validEmail = (e) => /.+@.+\..+/.test(e);

export default function WaitlistBusinessPage() {
  const [business, setBusiness] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [venueType, setVenueType] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | loading | done

  const loading = status === "loading";
  const done = status === "done";
  /* The gate the brief asks for: a valid work email plus consent. The name
     fields are checked on submit so the button never sits dead with no
     explanation of why. */
  const ready = validEmail(email) && consent;

  /* Errors are raised on submit, but cleared the moment a field becomes valid -
     otherwise the aria-live region keeps announcing a problem the user has
     already fixed. */
  const clearError = (key) =>
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });

  const submit = async (event) => {
    event.preventDefault();
    if (!ready || loading) return;

    const found = {};
    if (business.trim().length < 2) found.business = "Add the name of your place.";
    if (contact.trim().length < 2) found.contact = "Add your name so we know who to reply to.";
    /* Canonical on BOTH waitlist pages. It DIRECTS rather than diagnoses, to
       match the neighbouring "Add ..." prompts in this same form - keep that
       shape if it is ever reworded. */
    if (!validEmail(email)) found.email = "Add an email we can reach you on.";
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setStatus("loading");
    // TODO(backend): POST to waitlist endpoint. UI-only for now.
    await new Promise((resolve) => setTimeout(resolve, 700));
    setStatus("done");
  };

  const reset = () => {
    setBusiness("");
    setContact("");
    setEmail("");
    setCity("");
    setVenueType("");
    setConsent(false);
    setErrors({});
    setStatus("idle");
  };

  /* Says exactly what is missing rather than restating the whole rule. */
  const hint = !validEmail(email)
    ? "Add your work email to continue."
    : !consent
      ? "Tick the box and you are good to go."
      : "Ready when you are.";

  const liveMessage = loading
    ? "Sending your request."
    : done
      ? "Request received. We will email you when partner early access opens."
      : Object.keys(errors).length > 0
        ? "There is a problem with the form. Check the highlighted fields."
        : "";

  return (
    <div
      className="wlb-page"
      style={{
        background: "var(--nu-bg)",
        color: "var(--nu-ink)",
        fontFamily: "var(--nu-font-body)",
        paddingTop: 72,
        minHeight: "100vh",
      }}
    >
      <main className="wlb-shell">
        {/* ---- The hero moment: two masked lines, red full stop lands last.
                Line break is home.html's own. ---- */}
        {/* No max-width here on purpose. A ch value on this wrapper would
            resolve against the wrapper's own inherited ~16px font-size, not
            against the h1's clamp(38px, 7vw, 84px) - so "20ch" was ~180px and
            forced one word per line at desktop. The two lines are already
            fixed by the .wlb-line spans, so no width constraint is needed at
            all. If one is ever wanted, put it on the h1, where ch resolves
            against the clamped size, and check 1280 AND 520 before settling. */}
        <header style={{ marginBottom: 52 }}>
          <p className="nu-microlabel wlb-in" style={{ marginBottom: 20, letterSpacing: "0.16em" }}>
            For the places
          </p>
          {/* maxWidth belongs HERE, not on the header: this element sets its own
              font-size, so ch resolves against the clamped headline size. It is a
              ceiling for very wide viewports only - the break itself is fixed by
              the .wlb-line spans, and at 84px this holds ~540px against a rendered
              line of ~437px, so it does not alter the intended two lines. */}
          <h1 style={{ ...head, margin: 0, fontSize: "clamp(38px, 7vw, 84px)", lineHeight: 1.02, letterSpacing: "-0.025em", maxWidth: "12ch" }}>
            <span className="wlb-line"><span className="wlb-d1">Be the place</span></span>
            <span className="wlb-line">
              <span className="wlb-d2">it picks<span className="wlb-stop">.</span></span>
            </span>
          </h1>
        </header>

        <div style={gridStyle}>
          {/* ---- Left: the offer, in the site's own words ---- */}
          <aside style={{ display: "flex", flexDirection: "column", gap: 30 }}>
            <p className="wlb-in wlb-d3" style={{ margin: 0, fontSize: 18, lineHeight: 1.65, opacity: 0.62, maxWidth: "48ch" }}>
              Every plan Planie builds sends real people through real doors. Partners get placed
              inside itineraries at the exact moment someone nearby is deciding - prioritised,
              matched to intent, measured.
            </p>

            <div>
              <p className="nu-microlabel wlb-in wlb-d3" style={{ marginBottom: 12 }}>How partners appear</p>
              <ul style={chipRow}>
                {/* Clamped at d5, the last delay class that exists: if this
                    list ever grows past three, the extra chips share the final
                    delay instead of getting an undefined class and no stagger. */}
                {HOW_PARTNERS_APPEAR.map((item, i) => (
                  <li key={item} className={`wlb-chip wlb-in wlb-d${Math.min(i + 3, 5)}`}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="wlb-in wlb-d4">
              <p className="nu-microlabel" style={{ marginBottom: 6 }}>What happens next</p>
              <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {NEXT_STEPS.map((step, i) => (
                  <li key={step} className="wlb-step">
                    <span className="wlb-stepnum" aria-hidden="true">{i + 1}</span>
                    <span style={{ fontSize: 14.5, lineHeight: 1.5, opacity: 0.7 }}>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Partner CTA copy, reused from ContactPage.jsx */}
            <div className="wlb-in wlb-d5" style={{ borderRadius: 18, background: "var(--nu-ink)", color: "var(--nu-cream)", padding: "24px 26px" }}>
              <p style={{ ...head, margin: 0, fontSize: 17 }}>Own a place people should find?</p>
              <p style={{ margin: "9px 0 16px", fontSize: 14, lineHeight: 1.55, color: "rgba(250,247,241,0.62)" }}>
                Join Planie and get placed inside itineraries the moment someone nearby is deciding.
              </p>
              <Link
                to="/placements"
                className="wlb-arrowlink"
                style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 14, fontWeight: 600, color: "var(--nu-red)" }}
              >
                See how placement works <Arrow />
              </Link>
            </div>
          </aside>

          {/* ---- Right: the form ---- */}
          <div className="wlb-in wlb-d3" style={glass}>
            {/* Outside the ternary on purpose: moving it inside would remount it
                on every state change and it would stop announcing. */}
            <p aria-live="polite" style={srOnly}>{liveMessage}</p>

            {done ? (
              <div className="wlb-in" style={{ textAlign: "center", padding: "26px 4px" }}>
                <div
                  className="wlb-successicon"
                  aria-hidden="true"
                  style={{
                    width: 54, height: 54, margin: "0 auto 18px", borderRadius: "50%",
                    background: "var(--nu-ink)", color: "var(--nu-cream)", display: "grid", placeItems: "center",
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path className="wlb-check" d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <h2 style={{ ...head, margin: 0, fontSize: 23 }}>Request received</h2>
                <p style={{ margin: "12px 0 22px", fontSize: 15, lineHeight: 1.6, opacity: 0.6 }}>
                  Thanks{business.trim() ? `, ${business.trim()}` : ""} - we will email {email.trim()} when
                  partner early access opens.
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
                  <Link to="/waitlist" className="nu-btn nu-btn--fill">Get notified when the app launches</Link>
                  <button type="button" className="nu-btn nu-btn--outline" onClick={reset}>
                    Add another place
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} noValidate>
                <h2 style={{ ...head, margin: "0 0 6px", fontSize: 20 }}>Early access for your place</h2>
                <p style={{ margin: "0 0 24px", fontSize: 13.5, lineHeight: 1.55, opacity: 0.55 }}>
                  Tell us about your place. We will email you when partner early access opens.
                </p>

                <div style={rowStyle}>
                  <div>
                    <label htmlFor="wlb-business" style={labelStyle}>Business name</label>
                    <input
                      id="wlb-business"
                      className="wlb-input"
                      type="text"
                      value={business}
                      autoComplete="organization"
                      placeholder="The name above the door"
                      aria-invalid={errors.business ? "true" : undefined}
                      aria-describedby={errors.business ? "wlb-business-error" : undefined}
                      onChange={(e) => {
                        setBusiness(e.target.value);
                        if (e.target.value.trim().length >= 2) clearError("business");
                      }}
                    />
                    {errors.business && <p id="wlb-business-error" style={errorStyle}>{errors.business}</p>}
                  </div>

                  <div>
                    <label htmlFor="wlb-contact" style={labelStyle}>Your name</label>
                    <input
                      id="wlb-contact"
                      className="wlb-input"
                      type="text"
                      value={contact}
                      autoComplete="name"
                      placeholder="Full name"
                      aria-invalid={errors.contact ? "true" : undefined}
                      aria-describedby={errors.contact ? "wlb-contact-error" : undefined}
                      onChange={(e) => {
                        setContact(e.target.value);
                        if (e.target.value.trim().length >= 2) clearError("contact");
                      }}
                    />
                    {errors.contact && <p id="wlb-contact-error" style={errorStyle}>{errors.contact}</p>}
                  </div>
                </div>

                <div style={{ ...rowStyle, marginTop: 14 }}>
                  <div>
                    <label htmlFor="wlb-email" style={labelStyle}>Work email</label>
                    <input
                      id="wlb-email"
                      className="wlb-input"
                      type="email"
                      value={email}
                      autoComplete="email"
                      placeholder="you@yourplace.com"
                      aria-invalid={errors.email ? "true" : undefined}
                      aria-describedby={errors.email ? "wlb-email-error" : undefined}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (validEmail(e.target.value)) clearError("email");
                      }}
                    />
                    {errors.email && <p id="wlb-email-error" style={errorStyle}>{errors.email}</p>}
                  </div>

                  <div>
                    <label htmlFor="wlb-city" style={labelStyle}>City</label>
                    <input
                      id="wlb-city"
                      className="wlb-input"
                      type="text"
                      value={city}
                      autoComplete="address-level2"
                      placeholder="City or town"
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                </div>

                {/* The fieldset stays a block box - a flex fieldset renders its
                    legend inconsistently across browsers - so the pills wrap in
                    a child row instead. */}
                <fieldset style={{ ...fieldsetStyle, marginTop: 22 }}>
                  <legend style={{ ...labelStyle, marginBottom: 11, padding: 0 }}>What kind of place is it?</legend>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {VENUE_TYPES.map((type) => (
                      <label key={type} className="wlb-pill">
                        <input
                          type="radio"
                          name="wlb-venue-type"
                          value={type}
                          checked={venueType === type}
                          onChange={() => setVenueType(type)}
                        />
                        <span>{type}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                {/* The privacy link sits outside the <label> on purpose: inside it,
                    clicking (or ctrl-clicking) the link would also toggle the box. */}
                <div className="wlb-consent" style={{ marginTop: 24, display: "flex", alignItems: "flex-start", gap: 11 }}>
                  <input
                    id="wlb-consent"
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                  />
                  <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, opacity: 0.7 }}>
                    <label htmlFor="wlb-consent">Email me updates about Planie.</label>{" "}
                    See our{" "}
                    <Link to="/privacy" style={{ color: "var(--nu-red)", fontWeight: 600 }}>privacy policy</Link>.
                  </p>
                </div>

                <div style={{ marginTop: 24, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
                  <p style={{ margin: 0, fontSize: 12.5, opacity: 0.45, maxWidth: "28ch" }}>{hint}</p>
                  <button
                    type="submit"
                    className="nu-btn nu-btn--fill wlb-submit"
                    disabled={!ready || loading}
                    style={{ fontSize: 15, padding: "14px 30px" }}
                  >
                    {loading ? (
                      <>
                        <span className="wlb-spinner" aria-hidden="true" />
                        Sending
                      </>
                    ) : (
                      <>
                        Request early access
                        <Arrow />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
