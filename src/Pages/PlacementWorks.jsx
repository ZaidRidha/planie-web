/* PlacementWorks — public "How placement works" page, ported from
   "Planie Placement Works.dc.html". Static marketing content; the design's
   step copy was template data, so the four moments describe our real
   partner flow (listing → match → tiers & campaigns → the proof), with the
   fit rule called out on its own strip. */

import { useEffect } from "react";
import { Link } from "react-router-dom";
import { MARKETING_NAV_HEIGHT } from "../Components/MarketingHeader";

const head = { fontFamily: "var(--nu-font-head)", fontWeight: 700, letterSpacing: "-0.02em" };

const card = {
  borderRadius: 22,
  background: "rgba(255,255,255,0.66)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  boxShadow: "0 1px 0 rgba(255,255,255,0.9) inset, 0 20px 60px rgba(28,17,20,0.06)",
  padding: "30px 32px",
};

const microlabel = { margin: "0 0 6px", fontSize: 13, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.45 };

const Tick = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--nu-red)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

/* --- Step visuals -------------------------------------------------- */

function ListingVisual() {
  const chip = (t) => (
    <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 16px", borderRadius: 100, fontSize: 14, fontWeight: 500, border: "1px solid rgba(28,17,20,0.15)" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--nu-red)" }} />
      {t}
    </span>
  );
  return (
    <div style={card}>
      <p style={{ ...head, margin: "0 0 4px", fontSize: 20 }}>Casa Fofó</p>
      <p style={{ margin: "0 0 20px", fontSize: 14, color: "var(--nu-red)", fontWeight: 500 }}>Reviewed by a human, then live →</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {["Photos", "Story", "Occasions", "Opening hours", "Price range"].map(chip)}
      </div>
      <div style={{ marginTop: 22, paddingTop: 18, borderTop: "1px solid rgba(28,17,20,0.07)", display: "flex", alignItems: "center", gap: 10, fontSize: 15 }}>
        <Tick />
        <span>Approved — showing in Featured</span>
      </div>
    </div>
  );
}

function MatchVisual() {
  const row = (name, score, pick) => (
    <div key={name} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderTop: "1px solid rgba(28,17,20,0.07)" }}>
      <div style={{ flex: 1 }}>
        <div style={{ ...head, fontSize: 16, color: pick ? "var(--nu-red)" : "var(--nu-ink)" }}>{name}</div>
        <div style={{ height: 5, marginTop: 8, borderRadius: 100, background: "rgba(28,17,20,0.08)" }}>
          <div style={{ width: `${score}%`, height: "100%", borderRadius: 100, background: pick ? "var(--nu-red)" : "rgba(28,17,20,0.35)" }} />
        </div>
      </div>
      <span style={{ ...head, fontSize: 15, color: pick ? "var(--nu-red)" : "rgba(28,17,20,0.5)", minWidth: 36, textAlign: "right" }}>{score}</span>
      {pick && <span style={{ fontSize: 12, fontWeight: 600, color: "var(--nu-red)" }}>picked</span>}
    </div>
  );
  return (
    <div style={{ ...card, padding: "26px 28px" }}>
      <p style={microlabel}>“Date night, around £60” · scored</p>
      {row("Casa Fofó", 94, true)}
      {row("Levan", 72, false)}
      {row("Perilla", 58, false)}
      {row("The Chain Bistro", 29, false)}
    </div>
  );
}

function BoostVisual() {
  return (
    <div style={card}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 20 }}>
        <span style={{ ...head, fontSize: 18 }}>Your slot in the plan</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--nu-red)", display: "inline-flex", alignItems: "center", gap: 7 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--nu-red)" }} />
          Featured tier
        </span>
      </div>
      {["Top of the evening shortlist", "Homepage & category campaign slots", "Limited inventory per city per window"].map((t, i) => (
        <div key={t} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderTop: i ? "1px solid rgba(28,17,20,0.07)" : "none", fontSize: 15.5 }}>
          <Tick />
          {t}
        </div>
      ))}
    </div>
  );
}

function ProofVisual() {
  const funnel = [["Appeared in plans", "12,480", 100], ["Tapped through", "3,120", 62], ["Saved the plan", "1,540", 40], ["Walked in", "486", 22]];
  return (
    <div style={{ ...card, background: "var(--nu-ink)", color: "var(--nu-cream)", boxShadow: "0 20px 60px rgba(28,17,20,0.12)" }}>
      <p style={{ ...microlabel, opacity: 1, color: "rgba(250,247,241,0.4)", marginBottom: 22 }}>Dashboard preview · one week</p>
      {funnel.map(([label, val, w]) => (
        <div key={label} style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14.5, marginBottom: 7 }}>
            <span style={{ color: "rgba(250,247,241,0.7)" }}>{label}</span>
            <span style={{ ...head, color: "var(--nu-cream)" }}>{val}</span>
          </div>
          <div style={{ height: 8, borderRadius: 100, background: "rgba(250,247,241,0.1)" }}>
            <div style={{ width: `${w}%`, height: "100%", borderRadius: 100, background: "var(--nu-red)" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

const STEPS = [
  {
    n: 1,
    kicker: "The listing",
    title: "You tell us what you are.",
    body: "Photos, story, occasions, opening hours — your venue, described once, properly. Our team reviews every listing before it goes live, so everything on Planie is real and current.",
    points: ["Live in the app's Featured section once approved", "Edits re-checked so quality never drifts", "No listing fee to exist"],
    visual: <ListingVisual />,
    flip: false,
  },
  {
    n: 2,
    kicker: "The match",
    title: "Planie learns who you're for.",
    body: "Every plan starts from a person: their vibe, their group, their moment. Planie matches venues to plans — not banners to eyeballs. You appear when you genuinely fit.",
    points: ["Matched by occasion, vibe, time and distance", "Promotions surface at the moment of choosing", "No spray-and-pray advertising"],
    visual: <MatchVisual />,
    flip: true,
  },
  {
    n: 3,
    kicker: "The boost",
    title: "Tiers and campaigns move you up.",
    body: "Partner and Featured tiers raise your baseline visibility. Seasonal campaign slots — homepage, category, AI guide — put you in front of a city for the moments that matter.",
    points: ["Limited inventory per city per window — real scarcity", "Transparent pricing, cancel any time", "Every placement measurable"],
    visual: <BoostVisual />,
    flip: false,
  },
  {
    n: 4,
    kicker: "The proof",
    title: "Then you watch it turn into footfall.",
    body: "Every appearance, tap and save is tracked back to the plans that produced it. You see the whole funnel in your dashboard — outcomes, not impressions.",
    points: null,
    visual: <ProofVisual />,
    flip: true,
  },
];

const STATS = [
  { value: "100%", label: "of listings human-reviewed before they go live." },
  { value: "4", label: "surfaces where partners can appear — Featured, homepage, category, AI guide." },
  { value: "0", label: "placements sold into plans where a venue doesn't fit." },
];

const GEO_POINTS = [
  "AI-readable profiles that assistants can quote and cite",
  "A visibility score showing how often engines surface you",
  "Guidance on what to fix to get recommended more",
];

const GEO_ENGINES = [["ChatGPT", "Strong", 82], ["Gemini", "Good", 71], ["Perplexity", "Building", 54]];

const PAGE_CSS = `
.pw-row { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(40px, 6vw, 100px); align-items: center; }
.pw-geo { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: clamp(32px, 5vw, 72px); align-items: center; }
@media (max-width: 900px) {
  .pw-row, .pw-geo { grid-template-columns: 1fr; }
  .pw-row > * { order: 0 !important; }
}

/* Hero scroll cue - lifted verbatim from home.html so the two heroes read as
   one system: chevrons falling in sequence, whole cue breathing. */
@keyframes pwScrollChev { 0% { opacity: 0; transform: translateY(-7px); } 22% { opacity: 1; } 55% { opacity: 1; } 100% { opacity: 0; transform: translateY(9px); } }
@keyframes pwScrollBob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(5px); } }
.pw-cue { position: relative; width: 22px; height: 26px; animation: pwScrollBob 2.6s cubic-bezier(0.45, 0, 0.55, 1) infinite; }
.pw-cue .chev { position: absolute; left: 0; top: 0; opacity: 0; animation: pwScrollChev 2.6s cubic-bezier(0.45, 0, 0.55, 1) infinite; }
.pw-cue .chev:nth-child(2) { top: 10px; animation-delay: 0.42s; }
@media (prefers-reduced-motion: reduce) {
  .pw-cue, .pw-cue .chev { animation: none; }
  .pw-cue .chev { opacity: 1; }
  .pw-cue .chev:nth-child(2) { display: none; }
}
`;

export default function PlacementWorks() {
  /* Scroll reveal, same as the design's data-reveal behavior. */
  useEffect(() => {
    const els = document.querySelectorAll("[data-reveal]");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.style.opacity = 1; e.target.style.transform = "translateY(0)"; io.unobserve(e.target); }
      }),
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const reveal = {
    opacity: 0,
    transform: "translateY(26px)",
    transition: "opacity 0.8s ease, transform 0.8s var(--nu-ease)",
  };

  const bullet = (p, light) => (
    <div key={p} style={{ display: "flex", alignItems: "baseline", gap: 12, fontSize: 15.5, lineHeight: 1.5, color: light ? "rgba(250,247,241,0.82)" : undefined }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--nu-red)", flexShrink: 0, transform: "translateY(-2px)" }} />
      <span>{p}</span>
    </div>
  );

  return (
    <div style={{ background: "var(--nu-bg)", color: "var(--nu-ink)", fontFamily: "var(--nu-font-body)", paddingTop: MARKETING_NAV_HEIGHT, overflowX: "clip" }}>
      <style>{PAGE_CSS}</style>

      {/* Hero */}
      <header style={{ minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "120px 24px 80px" }}>
        <p className="nu-microlabel" style={{ marginBottom: 24, letterSpacing: "0.16em" }}>How placement works</p>
        <h1 style={{ ...head, margin: 0, maxWidth: "15ch", fontSize: "clamp(48px, 7.5vw, 108px)", lineHeight: 0.98, letterSpacing: "-0.025em" }}>
          You don't buy ads. You get <span style={{ color: "var(--nu-red)" }}>chosen</span>.
        </h1>
        <p style={{ margin: "34px 0 0", maxWidth: "56ch", fontSize: 19, lineHeight: 1.6, opacity: 0.6 }}>
          Planie doesn't sell banners into a feed. It builds one person's day, then decides which
          few places belong in it. Here's exactly how your venue gets into that decision.
        </p>
        <div style={{ marginTop: 44, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: 0.4 }}>
          <span style={{ fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase" }}>The four moments</span>
          <div className="pw-cue" aria-hidden="true">
            <svg className="chev" width="22" height="14" viewBox="0 0 22 14" fill="none">
              <path d="M2 2 L11 11 L20 2" stroke="var(--nu-ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <svg className="chev" width="22" height="14" viewBox="0 0 22 14" fill="none">
              <path d="M2 2 L11 11 L20 2" stroke="var(--nu-ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </header>

      {/* The four moments */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "0 40px 120px" }}>
        {STEPS.map((st) => (
          <div key={st.n} data-reveal className="pw-row" style={{ ...reveal, padding: "70px 0", borderTop: "1px solid rgba(28,17,20,0.08)" }}>
            <div style={{ order: st.flip ? 1 : 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                <span style={{ ...head, fontSize: 15, color: "var(--nu-cream)", background: "var(--nu-ink)", width: 30, height: 30, borderRadius: "50%", display: "grid", placeItems: "center" }}>{st.n}</span>
                <span style={{ fontSize: 13, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.45 }}>{st.kicker}</span>
              </div>
              <h2 style={{ ...head, margin: "0 0 18px", fontSize: "clamp(30px, 3.6vw, 48px)", lineHeight: 1.05 }}>{st.title}</h2>
              <p style={{ margin: 0, fontSize: 17, lineHeight: 1.65, opacity: 0.65, maxWidth: "46ch" }}>{st.body}</p>
              {st.points && (
                <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 12 }}>
                  {st.points.map((p) => bullet(p))}
                </div>
              )}
            </div>
            <div style={{ order: st.flip ? 0 : 1 }}>{st.visual}</div>
          </div>
        ))}
      </section>

      {/* Fairness strip */}
      <section style={{ background: "var(--nu-ink)", padding: "130px 40px", textAlign: "center" }}>
        <p data-reveal style={{ ...reveal, margin: "0 0 22px", fontSize: 13, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(250,247,241,0.4)" }}>The rule we won't break</p>
        <h2 data-reveal style={{ ...reveal, ...head, margin: "0 auto", maxWidth: "18ch", fontSize: "clamp(34px, 4.6vw, 66px)", lineHeight: 1.05, color: "var(--nu-cream)" }}>
          Money can move you up. It can't put you somewhere you don't fit.
        </h2>
        <p data-reveal style={{ ...reveal, margin: "32px auto 0", maxWidth: "58ch", fontSize: 18, lineHeight: 1.65, color: "rgba(250,247,241,0.6)" }}>
          A boosted listing still has to clear the bar: right vibe, right time, right distance,
          real reviews. If it doesn't belong in someone's plan, no budget forces it in. That's
          what keeps travellers trusting the pick — and why being picked actually means something.
        </p>
      </section>

      {/* Proof */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "130px 40px" }}>
        <h2 data-reveal style={{ ...reveal, ...head, margin: "0 0 60px", maxWidth: "20ch", fontSize: "clamp(32px, 4vw, 56px)", lineHeight: 1.05 }}>
          And you see every step of it.
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 250px), 1fr))", gap: 28 }}>
          {STATS.map((s) => (
            <div key={s.label} data-reveal style={{ ...reveal, padding: "34px 32px", borderRadius: 22, background: "rgba(255,255,255,0.62)", boxShadow: "0 1px 0 rgba(255,255,255,0.9) inset, 0 16px 50px rgba(28,17,20,0.05)" }}>
              <div style={{ ...head, fontSize: "clamp(40px, 4.4vw, 58px)", color: "var(--nu-red)", lineHeight: 1 }}>{s.value}</div>
              <p style={{ margin: "16px 0 0", fontSize: 16, lineHeight: 1.55, opacity: 0.7 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* GEO coming soon */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "40px 40px 120px" }}>
        <div data-reveal style={{ ...reveal, position: "relative", overflow: "hidden", borderRadius: 28, background: "var(--nu-ink)", color: "var(--nu-cream)", padding: "clamp(40px, 5vw, 72px)" }}>
          <div style={{ position: "absolute", top: 0, right: 0, width: 320, height: 320, background: "radial-gradient(circle at 70% 30%, rgba(255,64,64,0.28), transparent 70%)", pointerEvents: "none" }} />
          <div className="pw-geo" style={{ position: "relative" }}>
            <div>
              <h2 style={{ ...head, margin: "0 0 20px", fontSize: "clamp(30px, 3.6vw, 50px)", lineHeight: 1.04 }}>GEO: get picked by every AI, not just Planie.</h2>
              <p style={{ margin: "0 0 18px", fontSize: 17, lineHeight: 1.65, color: "rgba(250,247,241,0.68)", maxWidth: "48ch" }}>
                Generative Engine Optimisation is our next partner layer. As people plan through
                ChatGPT, Gemini and every AI assistant, Planie will structure your venue so those
                engines understand it and recommend it — the same way SEO once did for search.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 22, marginBottom: 28 }}>
                {GEO_POINTS.map((p) => bullet(p, true))}
              </div>
              <Link to="/partners/login" className="nu-btn nu-btn--red">Become a partner first</Link>
            </div>

            <div style={{ position: "relative", borderRadius: 20, background: "rgba(250,247,241,0.05)", border: "1px solid rgba(250,247,241,0.1)", padding: "30px 32px" }}>
              <div>
                <p style={{ margin: "0 0 18px", fontSize: 12.5, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(250,247,241,0.4)" }}>GEO visibility score</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 24 }}>
                  <span style={{ ...head, fontSize: 64, lineHeight: 1, color: "var(--nu-red)" }}>78</span>
                  <span style={{ fontSize: 16, color: "rgba(250,247,241,0.5)" }}>/ 100</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {GEO_ENGINES.map(([name, state, w]) => (
                    <div key={name}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, marginBottom: 6, color: "rgba(250,247,241,0.7)" }}>
                        <span>{name}</span><span>{state}</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 100, background: "rgba(250,247,241,0.1)" }}>
                        <div style={{ width: `${w}%`, height: "100%", borderRadius: 100, background: "var(--nu-red)" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "40px 40px 150px", textAlign: "center" }}>
        <h2 data-reveal style={{ ...reveal, ...head, margin: 0, fontSize: "clamp(44px, 6.5vw, 100px)", letterSpacing: "-0.025em", lineHeight: 1 }}>Ready to be picked?</h2>
        <p data-reveal style={{ ...reveal, margin: "26px auto 0", maxWidth: "48ch", fontSize: 18, lineHeight: 1.6, opacity: 0.6 }}>
          Claim your venue in minutes. There's no fee to be listed — only to be lifted.
        </p>
        <div data-reveal style={{ ...reveal, marginTop: 40, display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/partners/login" className="nu-btn nu-btn--fill" style={{ fontSize: 16, padding: "14px 30px" }}>Create your listing</Link>
          <Link to="/partners" className="nu-btn nu-btn--outline" style={{ fontSize: 16, padding: "14px 30px" }}>See partner plans</Link>
        </div>
      </section>
    </div>
  );
}
