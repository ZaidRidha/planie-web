import React from "react";

/*
  Pending state for the GEO score, shown while the API reports
  pendingReveal: true (score not yet calculated).

  Intentionally propless — PartnerGeo renders <PendingReveal /> in place of
  the live score + cards. Mirrors the ScoreRing / geo-cards markup so the
  layout doesn't shift when the real score arrives, but shows a neutral grey
  ring and shimmer skeleton cards instead of data.

  Styles live in PartnerGeo.css (.geo-pending-*, .geo-card--skeleton, .geo-skeleton).
*/

const RING_SIZE = 180;
const RING_SW = 16;
const TRACK = "#F3F4F6";

/* Grey ring — track only, no progress arc, neutral center. */
function PendingRing() {
  const r = (RING_SIZE - RING_SW) / 2;

  return (
    <div className="geo-ring">
      <svg
        width={RING_SIZE}
        height={RING_SIZE}
        role="img"
        aria-label="AI visibility score is being calculated"
      >
        <circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={r}
          fill="none"
          stroke={TRACK}
          strokeWidth={RING_SW}
        />
      </svg>
      <div className="geo-ring-center">
        <span className="geo-ring-score geo-ring-score--pending" aria-hidden="true">
          —
        </span>
        <span className="geo-ring-total">/ 100</span>
      </div>
    </div>
  );
}

/* Shimmer placeholder card matching .geo-card layout. */
function SkeletonCard({ lines }) {
  return (
    <article className="pd-card geo-card geo-card--skeleton" aria-hidden="true">
      <div className="geo-skeleton geo-skeleton--title" />
      <div className="geo-skeleton geo-skeleton--metric" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="geo-skeleton geo-skeleton--line" />
      ))}
    </article>
  );
}

export default function PendingReveal() {
  return (
    <>
      <section className="geo-score pd-anim pd-a2" role="status" aria-live="polite">
        <PendingRing />
        <div className="geo-pending-copy">
          <p className="geo-pending-title">Your GEO score is being calculated</p>
          <p className="geo-pending-sub">
            This usually takes 24-48 hours after your listing goes live
          </p>
        </div>
      </section>

      <section className="geo-cards pd-anim pd-a3" aria-hidden="true">
        <SkeletonCard lines={2} />
        <SkeletonCard lines={3} />
      </section>
    </>
  );
}
