/* PlacementWorks — public "How placement works" page, ported from
   "Planie Placement Works.dc.html". Static marketing content; the design's
   step copy was template data, so the four moments describe our real
   partner flow (listing → approval → tiers → campaigns → the fit rule). */

import { useEffect } from "react";
import { Link } from "react-router-dom";

const head = { fontFamily: "var(--nu-font-head)", fontWeight: 700, letterSpacing: "-0.02em" };

const STEPS = [
  {
    n: 1,
    kicker: "The listing",
    title: "You tell us what you are.",
    body: "Photos, story, occasions, opening hours — your venue, described once, properly. Our team reviews every listing before it goes live, so everything on Planie is real and current.",
    points: ["Live in the app's Featured section once approved", "Edits re-checked so quality never drifts", "No listing fee to exist"],
  },
  {
    n: 2,
    kicker: "The match",
    title: "Planie learns who you're for.",
    body: "Every plan starts from a person: their vibe, their group, their moment. Planie matches venues to plans — not banners to eyeballs. You appear when you genuinely fit.",
    points: ["Matched by occasion, vibe, time and distance", "Promotions surface at the moment of choosing", "No spray-and-pray advertising"],
  },
  {
    n: 3,
    kicker: "The boost",
    title: "Tiers and campaigns move you up.",
    body: "Partner and Featured tiers raise your baseline visibility. Seasonal campaign slots — homepage, category, AI guide — put you in front of a city for the moments that matter.",
    points: ["Limited inventory per city per window — real scarcity", "Transparent pricing, cancel any time", "Every placement measurable"],
  },
  {
    n: 4,
    kicker: "The rule",
    title: "Fit decides. Always.",
    body: "A boosted venue still has to clear the bar. If you don't belong in someone's plan, no budget forces you in — which is exactly why being picked means something.",
    points: null,
  },
];

const STATS = [
  { value: "100%", label: "of listings human-reviewed before they go live." },
  { value: "4", label: "surfaces where partners can appear — Featured, homepage, category, AI guide." },
  { value: "0", label: "placements sold into plans where a venue doesn't fit." },
];

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

  return (
    <div style={{ background: "var(--nu-bg)", color: "var(--nu-ink)", fontFamily: "var(--nu-font-body)", paddingTop: 72 }}>
      {/* Hero */}
      <header style={{ maxWidth: 1180, margin: "0 auto", padding: "110px 40px 90px", textAlign: "left" }}>
        <p className="nu-microlabel" style={{ marginBottom: 24, letterSpacing: "0.16em" }}>How placement works</p>
        <h1 style={{ ...head, margin: 0, maxWidth: "15ch", fontSize: "clamp(48px, 7.5vw, 108px)", lineHeight: 0.98, letterSpacing: "-0.025em" }}>
          You don't buy ads. You get <span style={{ color: "var(--nu-red)" }}>chosen</span>.
        </h1>
        <div style={{ marginTop: 60, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10 }}>
          <span style={{ fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.45 }}>The four moments</span>
          <div style={{ width: 1, height: 40, background: "var(--nu-ink)" }} />
        </div>
      </header>

      {/* The four moments */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "0 40px 120px" }}>
        {STEPS.map((st, i) => (
          <div key={st.n} data-reveal style={{ ...reveal, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 380px), 1fr))", gap: "clamp(40px, 6vw, 100px)", alignItems: "center", padding: "70px 0", borderTop: "1px solid rgba(28,17,20,0.08)" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                <span style={{ ...head, fontSize: 15, color: "var(--nu-cream)", background: "var(--nu-ink)", width: 30, height: 30, borderRadius: "50%", display: "grid", placeItems: "center" }}>{st.n}</span>
                <span style={{ fontSize: 13, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.45 }}>{st.kicker}</span>
              </div>
              <h2 style={{ ...head, margin: "0 0 18px", fontSize: "clamp(30px, 3.6vw, 48px)", lineHeight: 1.05 }}>{st.title}</h2>
              <p style={{ margin: 0, fontSize: 17, lineHeight: 1.65, opacity: 0.65, maxWidth: "46ch" }}>{st.body}</p>
              {st.points && (
                <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 12 }}>
                  {st.points.map((p) => (
                    <div key={p} style={{ display: "flex", alignItems: "baseline", gap: 12, fontSize: 15.5, lineHeight: 1.5 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--nu-red)", flexShrink: 0, transform: "translateY(-2px)" }} />
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ ...head, fontSize: "clamp(90px, 14vw, 200px)", lineHeight: 1, color: "rgba(28,17,20,0.06)", textAlign: i % 2 ? "left" : "right", userSelect: "none" }} aria-hidden="true">
              0{st.n}
            </div>
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
          <p style={{ margin: "0 0 16px", fontSize: 12.5, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(250,247,241,0.4)" }}>Coming soon</p>
          <h2 style={{ ...head, margin: "0 0 20px", fontSize: "clamp(30px, 3.6vw, 50px)", lineHeight: 1.04 }}>GEO: get picked by every AI, not just Planie.</h2>
          <p style={{ margin: "0 0 28px", fontSize: 17, lineHeight: 1.65, color: "rgba(250,247,241,0.68)", maxWidth: "48ch" }}>
            Generative Engine Optimisation is our next partner layer. As people plan through
            ChatGPT, Gemini and every AI assistant, Planie will structure your venue so those
            engines understand it and recommend it — the same way SEO once did for search.
          </p>
          <Link to="/partners/login" className="nu-btn nu-btn--red">Become a partner first</Link>
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "40px 40px 150px", textAlign: "center" }}>
        <h2 data-reveal style={{ ...reveal, ...head, margin: 0, fontSize: "clamp(44px, 6.5vw, 100px)", letterSpacing: "-0.025em", lineHeight: 1 }}>Ready to be picked?</h2>
        <div data-reveal style={{ ...reveal, marginTop: 40, display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/partners/login" className="nu-btn nu-btn--fill" style={{ fontSize: 16, padding: "14px 30px" }}>Create your listing</Link>
          <Link to="/partners" className="nu-btn nu-btn--outline" style={{ fontSize: 16, padding: "14px 30px" }}>See partner plans</Link>
        </div>
      </section>
    </div>
  );
}
