import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Store,
  Megaphone,
  Crown,
  TrendingUp,
  CreditCard,
  Settings,
  LogOut,
  Sparkles,
  CheckCircle,
  Circle,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Info,
} from "lucide-react";
import PlanieLogo from "../Assets/Images/PlanieLogo2.png";
import useScoreReveal from "./geo/useScoreReveal";
import PendingReveal from "./geo/PendingReveal";
import GrowthAnalytics from "./geo/GrowthAnalytics";
import "./PartnerDashboard.css";
import "./PartnerGeo.css";

/* Sidebar items — AI visibility is highlighted */
const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard",   path: "/partners/dashboard#dashboard" },
  { icon: Store,           label: "My Listings", path: "/partners/dashboard#listings" },
  { icon: Megaphone,       label: "Promotions",  path: "/partners/dashboard#promotions" },
  { icon: Crown,           label: "Campaigns",   path: "/partners/campaigns" },
  { icon: Sparkles,        label: "AI visibility", path: "/partners/geo", active: true },
  { icon: TrendingUp,      label: "Analytics",   path: "/partners/dashboard#analytics" },
  { icon: CreditCard,      label: "Billing",     path: "/partners/dashboard#billing" },
  { icon: Settings,        label: "Settings",    path: "/partners/dashboard#settings" },
];

/* Score band colours (design-system hexes) */
const TRACK = "#F3F4F6";
const bandColor = (score) => {
  if (score >= 80) return "#10B981"; // green
  if (score >= 50) return "#F59E0B"; // amber
  return "#FF4040";                  // red
};
const bandLabel = (score) => {
  if (score >= 80) return "Strong";
  if (score >= 50) return "Building";
  return "Needs work";
};

const clamp = (n) => Math.max(0, Math.min(100, Number(n) || 0));

/* Dev-only fallback so the page is viewable without a backend running. */
const SAMPLE_GEO = {
  venueId: "sample",
  pendingReveal: false,
  score: 72,
  mentionRate: 38,
  profileCompleteness: 60,
  missingFields: ["Add cover photo", "Add opening hours", "Add booking link"],
};

export default function PartnerGeo() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingSample, setUsingSample] = useState(false);
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setUsingSample(false);

    fetch("/api/partner/geo", { headers: { Accept: "application/json" } })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`The AI visibility service returned an error (${res.status}).`);
        }
        // Guard against non-JSON responses (e.g. an HTML fallback page when the
        // API isn't wired up) so the raw parser error never reaches the user.
        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          throw new Error("The AI visibility service is unavailable right now.");
        }
        return res.json();
      })
      .then((json) => {
        if (cancelled) return;
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        // In local dev there is no backend, so show sample data (clearly
        // badged) instead of an error to keep the page previewable.
        if (process.env.NODE_ENV === "development") {
          setData(SAMPLE_GEO);
          setUsingSample(true);
          setLoading(false);
          return;
        }
        const isNetwork = err instanceof TypeError;
        setError(
          isNetwork
            ? "Couldn't reach the AI visibility service. Check your connection and try again."
            : err.message || "Something went wrong loading your AI visibility."
        );
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadTick]);

  return (
    <div className="pd-layout">
      <Sidebar />
      <main className="pd-main">
        <header className="pd-head pd-anim pd-a1">
          <div>
            <h1 className="pd-title">GEO - AI visibility</h1>
            <p className="pd-subtitle">How visible your venue is to AI recommendations</p>
          </div>
        </header>

        {loading && <LoadingState />}
        {!loading && error && (
          <ErrorState message={error} onRetry={() => setReloadTick((t) => t + 1)} />
        )}
        {!loading && !error && data && (
          <>
            {usingSample && (
              <div className="geo-sample-badge pd-anim pd-a1" role="status">
                <Info size={14} strokeWidth={1.8} />
                <span>Showing sample data — API not connected</span>
              </div>
            )}
            <GeoContent data={data} />
          </>
        )}
      </main>
    </div>
  );
}

/* ─────────────────────────  Sidebar  ───────────────────────── */
function Sidebar() {
  return (
    <aside className="pd-sidebar">
      <div>
        <Link to="/" className="pd-logo">
          <img src={PlanieLogo} alt="Planie" />
        </Link>
        <nav className="pd-nav">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const cls = `pd-nav-btn${item.active ? " pd-nav-btn--on" : ""}`;
            return (
              <Link key={item.label} to={item.path} className={cls}>
                <Icon size={18} strokeWidth={1.7} />
                <span>{item.label}</span>
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

/* ─────────────────────────  Loading / Error  ───────────────────────── */
function LoadingState() {
  return (
    <div className="geo-state pd-anim pd-a2" role="status" aria-live="polite">
      <div className="geo-spinner" aria-hidden="true" />
      <p className="geo-state-text">Loading your AI visibility…</p>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="geo-state pd-anim pd-a2" role="alert">
      <AlertCircle size={26} strokeWidth={1.6} className="geo-state-icon" />
      <h4 className="geo-state-title">Couldn't load your AI visibility</h4>
      <p className="geo-state-text">{message}</p>
      <button type="button" className="pd-btn pd-btn--fill" onClick={onRetry}>
        <RefreshCw size={15} strokeWidth={2} />
        Try again
      </button>
    </div>
  );
}

/* ─────────────────────────  Content  ───────────────────────── */
function GeoContent({ data }) {
  // Score not ready yet → hand the whole score-and-cards region over to the
  // pending placeholder (grey ring + skeleton cards, owned by PendingReveal).
  if (data.pendingReveal) {
    return <PendingReveal />;
  }

  const score = clamp(data.score);
  const mentionRate = clamp(data.mentionRate);
  const profileCompleteness = clamp(data.profileCompleteness);
  const missingFields = Array.isArray(data.missingFields) ? data.missingFields : [];

  return (
    <>
      {/* Score ring */}
      <section className="geo-score pd-anim pd-a2">
        <ScoreRing score={score} venueId={data.venueId} />
        <p className="geo-score-caption">Top venues score 80+</p>
      </section>

      {/* Two cards */}
      <section className="geo-cards pd-anim pd-a3">
        <article className="pd-card geo-card">
          <div className="pd-card-top">
            <h3>Planie mention rate</h3>
          </div>
          <div className="geo-metric">{Math.round(mentionRate)}%</div>
          <p className="geo-card-note">
            % of relevant Planie itineraries that feature you
          </p>
        </article>

        <article className="pd-card geo-card">
          <div className="pd-card-top">
            <h3>Profile completeness</h3>
            <span className="geo-metric-inline">{Math.round(profileCompleteness)}%</span>
          </div>

          <div
            className="geo-progress"
            role="progressbar"
            aria-valuenow={Math.round(profileCompleteness)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Profile completeness"
          >
            <div className="geo-progress-fill" style={{ width: `${profileCompleteness}%` }} />
          </div>

          {missingFields.length > 0 ? (
            <ul className="geo-checklist">
              {missingFields.map((field) => (
                <li key={field} className="geo-checklist-item">
                  <Circle size={16} strokeWidth={1.8} className="geo-checklist-icon" />
                  <span>{field}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="geo-checklist-done">
              <CheckCircle size={16} strokeWidth={1.8} />
              <span>Your profile is complete</span>
            </div>
          )}

          <Link
            to="/partners/dashboard#settings"
            className="pd-btn pd-btn--fill geo-card-btn"
          >
            Complete your profile
            <ArrowRight size={15} strokeWidth={2} />
          </Link>
        </article>
      </section>

      {/* Locked "coming soon" upsell teasers — self-contained, fetches its
          own interest state so it doesn't tangle with the score data flow. */}
      <GrowthAnalytics />
    </>
  );
}

/* ─────────────────────────  Score ring (SVG)  ───────────────────────── */
function ScoreRing({ score, venueId, size = 180 }) {
  // The hook owns all the reveal behaviour; here we just render whatever score
  // it hands back this frame. On first visit that counts up 0 → score; on
  // later visits (or reduced-motion) it's the final score from frame one.
  const displayScore = useScoreReveal(score, venueId);

  const sw = 16;
  const r = (size - sw) / 2;
  const c = 2 * Math.PI * r;
  const dash = (displayScore / 100) * c;
  // Colour/label track the *final* score so the ring doesn't flicker through
  // red→amber→green as the number counts up.
  const color = bandColor(score);
  const shown = Math.round(displayScore);

  return (
    <div className="geo-ring">
      <svg
        width={size}
        height={size}
        role="img"
        aria-label={`AI visibility score ${Math.round(score)} out of 100`}
      >
        {/* background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={TRACK}
          strokeWidth={sw}
        />
        {/* progress arc — rotate -90° so the fill starts at 12 o'clock and sweeps clockwise */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          className="geo-ring-arc"
          // requestAnimationFrame drives the fill frame-by-frame, so disable the
          // stylesheet's stroke transition here to avoid it smearing each step.
          style={{ transition: "none" }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="geo-ring-center">
        <span className="geo-ring-score" style={{ color }}>{shown}</span>
        <span className="geo-ring-total">/ 100</span>
        <span className="geo-ring-band" style={{ color }}>{bandLabel(score)}</span>
      </div>
    </div>
  );
}
