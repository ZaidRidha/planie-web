/* GeoPage — static preview of the future GEO (Generative Engine
   Optimization) feature, ported from "Planie Partner GEO.dc.html".
   DEMO DATA ONLY (owner decision 2026-07-24): the feature doesn't exist in
   the backend; numbers are deterministic fakes per listing so the page
   feels alive. Only real data used: the partner's listing names. */

import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { LayoutDashboard, Store, Megaphone, Crown, TrendingUp, Globe2, CreditCard, Settings, LogOut } from "lucide-react";
import { fetchMyListings } from "../utils/listings";
import { getTier, isFeatured, subscribeTier } from "../utils/subscription";
import PlanieLogo from "../Assets/Images/PlanieLogoNew.svg";

/* Same portal sidebar as Dashboard/Campaigns so GEO is visually consistent. */
function GeoSidebar() {
  const [tier, setTier] = useState(() => getTier());
  useEffect(() => subscribeTier(setTier), []);
  const items = [
    { icon: LayoutDashboard, label: "Overview", path: "/partners/dashboard#dashboard" },
    { icon: Store, label: "Listings", path: "/partners/dashboard#listings" },
    { icon: Megaphone, label: "Promotions", path: "/partners/dashboard#promotions" },
    { icon: Crown, label: "Campaigns", path: "/partners/campaigns", badge: !isFeatured(tier) ? "Featured" : null },
    { icon: TrendingUp, label: "Insights", path: "/partners/dashboard#analytics" },
    { icon: Globe2, label: "GEO", path: "/partners/geo", active: true },
    { icon: CreditCard, label: "Billing", path: "/partners/dashboard#billing" },
    { icon: Settings, label: "Settings", path: "/partners/dashboard#settings" },
  ];
  return (
    <aside className="pd-sidebar">
      <div>
        <Link to="/" className="pd-logo"><img src={PlanieLogo} alt="Planie" /></Link>
        <nav className="pd-nav">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.label} to={item.path} className={`pd-nav-btn${item.active ? " pd-nav-btn--on" : ""}`}>
                <Icon size={18} strokeWidth={1.7} />
                <span>{item.label}</span>
                {item.badge && <span className="pd-nav-badge">{item.badge}</span>}
              </Link>
            );
          })}
        </nav>
      </div>
      <Link to="/partners/login" className="pd-nav-btn pd-nav-btn--out">
        <LogOut size={18} strokeWidth={1.7} />
        <span>Sign Out</span>
      </Link>
    </aside>
  );
}

const glass = {
  borderRadius: 22,
  background: "rgba(255, 255, 255, 0.66)",
  boxShadow: "0 1px 0 rgba(255,255,255,0.9) inset, 0 16px 48px rgba(28,17,20,0.05)",
  padding: "24px 26px",
};

/* Deterministic pseudo-score from a name so demo numbers are stable. */
const hashScore = (str, lo, hi) => {
  let h = 2166136261;
  for (let i = 0; i < (str || "").length; i++) { h ^= str.charCodeAt(i); h = (h * 16777619) >>> 0; }
  return lo + (h % (hi - lo + 1));
};

const bandOf = (score) =>
  score >= 75 ? { label: "Strong", color: "#3BAF6A" } :
  score >= 50 ? { label: "Building", color: "#E8A13A" } :
  { label: "Needs work", color: "#FF4040" };

export default function GeoPage() {
  const [listings, setListings] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [waitlisted, setWaitlisted] = useState(
    () => window.localStorage.getItem("planie:geo-waitlist") === "1"
  );

  useEffect(() => {
    let cancelled = false;
    fetchMyListings()
      .then(({ items }) => {
        if (cancelled) return;
        const list = items || [];
        setListings(list);
        if (list.length) setSelectedId(list[0].id);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const selected = listings.find((l) => l.id === selectedId) || null;
  const selName = selected?.name || "Your listing";
  const score = useMemo(() => hashScore(selName, 34, 88), [selName]);
  const band = bandOf(score);
  const platforms = useMemo(() => ([
    { name: "Planie", score: Math.min(96, score + 9), delta: "+4", up: true },
    { name: "Claude", score: Math.max(20, score - 7), delta: "+2", up: true },
    { name: "ChatGPT", score: Math.max(15, score - 12), delta: "-1", up: false },
  ]), [score]);

  const joinWaitlist = () => {
    setWaitlisted(true);
    window.localStorage.setItem("planie:geo-waitlist", "1");
  };

  const R = 52, CIRC = 2 * Math.PI * R;

  return (
    <div className="pd-layout">
      <GeoSidebar />
      <main className="pd-main" data-screen-label="GEO">
      {/* Header */}
      <header className="nu-rise" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
        <div>
          <p className="nu-microlabel" style={{ marginBottom: 6 }}>GEO · Generative Engine Optimization</p>
          <h1 className="nu-title">Be the answer AI gives.</h1>
        </div>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", background: "var(--nu-red)", color: "var(--nu-cream)", padding: "8px 16px", borderRadius: 100 }}>
          <span className="nu-nav-dot" style={{ background: "var(--nu-cream)" }} />
          Coming soon
        </span>
      </header>

      {/* Listing picker — real listings */}
      {listings.length > 0 && (
        <section className="nu-rise nu-rise-d1" style={{ marginTop: 22, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, fontWeight: 600, opacity: 0.5 }}>GEO readiness for</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {listings.map((l) => {
              const on = l.id === selectedId;
              return (
                <button
                  key={l.id}
                  onClick={() => setSelectedId(l.id)}
                  style={{
                    fontFamily: "var(--nu-font-body)", fontSize: 13, fontWeight: 600, cursor: "pointer",
                    padding: "9px 16px", borderRadius: 100, transition: "all 0.2s",
                    border: `1px solid ${on ? "var(--nu-ink)" : "var(--nu-hairline)"}`,
                    background: on ? "var(--nu-ink)" : "transparent",
                    color: on ? "var(--nu-cream)" : "var(--nu-ink)",
                  }}
                >
                  {l.name}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Coming-soon banner */}
      <section className="nu-rise nu-rise-d1" style={{ marginTop: 24, borderRadius: 18, background: "var(--nu-ink)", color: "var(--nu-cream)", padding: "22px 28px", display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 260 }}>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6 }}>
            <strong style={{ fontWeight: 600 }}>GEO lands after our MVP.</strong>{" "}
            <span style={{ color: "rgba(250,247,241,0.6)" }}>
              This is a live preview of what your team will get — how visible you are when
              Planie, Claude and ChatGPT recommend places, and exactly how to climb.
              Numbers below are a sample.
            </span>
          </p>
        </div>
        <button
          onClick={joinWaitlist}
          disabled={waitlisted}
          style={{
            fontFamily: "var(--nu-font-body)", fontSize: 14, fontWeight: 600,
            cursor: waitlisted ? "default" : "pointer", padding: "13px 26px", borderRadius: 100,
            border: "none", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 9,
            transition: "all 0.3s var(--nu-ease)",
            background: waitlisted ? "rgba(250,247,241,0.14)" : "var(--nu-red)",
            color: "var(--nu-cream)",
          }}
        >
          {waitlisted && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
          )}
          {waitlisted ? "You're on the list" : "Join the waitlist"}
        </button>
      </section>

      {/* Preview board */}
      <div className="nu-rise nu-rise-d2" style={{ marginTop: 28 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: 18, alignItems: "stretch" }}>
          {/* Score ring */}
          <div style={{ ...glass, padding: 28, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
            <p style={{ margin: "0 0 16px", fontFamily: "var(--nu-font-head)", fontWeight: 700, fontSize: 15, letterSpacing: "0.02em" }}>GEO score</p>
            <div style={{ position: "relative", width: 150, height: 150 }}>
              <svg viewBox="0 0 120 120" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
                <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(28,17,20,0.09)" strokeWidth="12" />
                <circle cx="60" cy="60" r={R} fill="none" stroke={band.color} strokeWidth="12" strokeLinecap="round"
                  strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - score / 100)}
                  style={{ transition: "stroke-dashoffset 1.6s cubic-bezier(0.4,0,0.2,1) 0.3s, stroke 0.4s ease" }} />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: "var(--nu-font-head)", fontWeight: 700, fontSize: 46, letterSpacing: "-0.02em", lineHeight: 1, color: band.color }}>{score}</span>
                <span style={{ fontSize: 12.5, opacity: 0.45 }}>of 100</span>
              </div>
            </div>
            <span style={{ margin: "16px 0 0", display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12.5, fontWeight: 700, letterSpacing: "0.04em", padding: "6px 14px", borderRadius: 100, background: band.color, color: "var(--nu-cream)" }}>{band.label}</span>
            <div style={{ margin: "16px 0 0", width: "100%", display: "flex", flexDirection: "column", gap: 7 }}>
              {[["#FF4040", "0–49 · Needs work"], ["#E8A13A", "50–74 · Building"], ["#3BAF6A", "75–100 · Strong"]].map(([c, t]) => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 12, opacity: 0.6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />{t}
                </div>
              ))}
            </div>
          </div>

          {/* Early estimate */}
          <div style={{ ...glass, gridColumn: "span 2", minWidth: 0, padding: "30px 34px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <p style={{ margin: "0 0 8px", fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.45 }}>Early estimate</p>
            <p style={{ margin: 0, fontFamily: "var(--nu-font-head)", fontWeight: 700, fontSize: 24, letterSpacing: "-0.015em" }}>{selName}</p>
            <p style={{ margin: "12px 0 0", fontSize: 14.5, lineHeight: 1.65, opacity: 0.6, maxWidth: "52ch" }}>
              This is an early readiness estimate — not your live score yet. The full breakdown
              (engine-by-engine visibility, mention rate, fix list and competitor benchmarks)
              unlocks for this listing when GEO launches.
            </p>
            <div style={{ marginTop: 18, display: "inline-flex", alignItems: "center", gap: 9, fontSize: 13, fontWeight: 600, color: "var(--nu-red)" }}>
              <span className="nu-nav-dot" />Detailed metrics arrive post-launch
            </div>
          </div>
        </div>

        {/* Locked region — blurred sample */}
        <div style={{ position: "relative", marginTop: 18 }}>
          <div style={{ filter: "blur(7px)", pointerEvents: "none", userSelect: "none" }} aria-hidden="true">
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={glass}>
                <p style={{ margin: "0 0 16px", fontFamily: "var(--nu-font-head)", fontWeight: 700, fontSize: 15 }}>Cross-platform visibility</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 14 }}>
                  {platforms.map((p) => (
                    <div key={p.name} style={{ padding: "16px 18px", borderRadius: 14, background: "rgba(28,17,20,0.04)" }}>
                      <p style={{ margin: 0, fontSize: 13, opacity: 0.55 }}>{p.name}</p>
                      <p style={{ margin: "8px 0 0", fontFamily: "var(--nu-font-head)", fontWeight: 700, fontSize: 30, letterSpacing: "-0.02em" }}>{p.score}</p>
                      <p style={{ margin: "4px 0 0", fontSize: 12.5, fontWeight: 600, color: p.up ? "#3BAF6A" : "var(--nu-red)" }}>{p.delta} <span style={{ opacity: 0.5, fontWeight: 400, color: "var(--nu-ink)" }}>30d</span></p>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ ...glass, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 24, alignItems: "center" }}>
                <div>
                  <p style={{ margin: 0, fontSize: 13, opacity: 0.55 }}>Planie mention rate</p>
                  <p style={{ margin: "6px 0 0", fontFamily: "var(--nu-font-head)", fontWeight: 700, fontSize: 30, letterSpacing: "-0.02em" }}>18%</p>
                  <p style={{ margin: "4px 0 0", fontSize: 12, opacity: 0.45 }}>of relevant itineraries include you</p>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
                    <p style={{ margin: 0, fontSize: 13, opacity: 0.55 }}>Profile completeness</p>
                    <span style={{ fontFamily: "var(--nu-font-head)", fontWeight: 700, fontSize: 16 }}>82%</span>
                  </div>
                  <div style={{ marginTop: 10, height: 6, borderRadius: 3, background: "rgba(28,17,20,0.08)", overflow: "hidden" }}>
                    <div style={{ width: "82%", height: "100%", borderRadius: 3, background: "#3BAF6A" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Unlock overlay */}
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ textAlign: "center", background: "rgba(250,247,241,0.82)", borderRadius: 18, padding: "26px 34px", border: "1px solid var(--nu-hairline-soft)" }}>
              <p style={{ margin: 0, fontFamily: "var(--nu-font-head)", fontWeight: 700, fontSize: 19 }}>Unlocks when GEO launches</p>
              <p style={{ margin: "8px 0 0", fontSize: 13.5, color: "var(--nu-muted)" }}>Sample data shown — join the waitlist above to get access first.</p>
            </div>
          </div>
        </div>
      </div>
      </main>
    </div>
  );
}
