import { useEffect, useRef, useState } from "react";

/* ═══════════════════════════════════════════════════════
   useScoreReveal — first-visit GEO score reveal animation
   ───────────────────────────────────────────────────────
   All of the reveal behaviour (rAF loop, per-venue "already
   seen" localStorage flag, and prefers-reduced-motion
   handling) lives in this hook so PartnerGeo's view
   components stay presentational and its data-fetch effect
   stays untangled from animation state.

   Returns the score to render *right now*: it counts up from
   0 → targetScore over ~1.2s on the very first visit, and
   returns targetScore instantly on every later visit, when
   the venue id is unknown, or when the user prefers reduced
   motion.
   ═══════════════════════════════════════════════════════ */

const DURATION = 1200; // ms — the ~1.2s reveal called for by the spec

/* Cubic ease-out: fast start, gentle settle onto the final score. */
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

const revealKey = (venueId) => `geo_score_revealed_${venueId}`;

/* Every browser-API touch is guarded — private mode, storage
   quota, or a missing matchMedia must never break the page. */
const prefersReducedMotion = () => {
  try {
    return (
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  } catch {
    return false;
  }
};

const hasBeenRevealed = (venueId) => {
  try {
    return !!window.localStorage.getItem(revealKey(venueId));
  } catch {
    return false;
  }
};

const markRevealed = (venueId) => {
  try {
    window.localStorage.setItem(revealKey(venueId), "1");
  } catch {
    /* storage unavailable — reveal just replays next time, non-fatal */
  }
};

const hasVenue = (venueId) => venueId != null && venueId !== "";

export default function useScoreReveal(targetScore, venueId) {
  // Decide up front whether this mount should animate. A missing venue id,
  // an already-seen score, or reduced-motion all mean "render instantly".
  const shouldAnimate =
    hasVenue(venueId) && !hasBeenRevealed(venueId) && !prefersReducedMotion();

  // Seed state so the very first paint is already correct (no flash of 0
  // on instant renders, starts at 0 for the count-up).
  const [displayScore, setDisplayScore] = useState(
    shouldAnimate ? 0 : targetScore
  );

  const rafRef = useRef(0);

  useEffect(() => {
    if (!shouldAnimate) {
      // Instant path: pin to the real score. Still record the reveal so a
      // later visit (even with motion enabled) won't re-animate.
      setDisplayScore(targetScore);
      if (hasVenue(venueId)) markRevealed(venueId);
      return undefined;
    }

    let start = null;
    const step = (ts) => {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / DURATION, 1);
      setDisplayScore(targetScore * easeOut(progress));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setDisplayScore(targetScore);
        markRevealed(venueId);
      }
    };

    setDisplayScore(0);
    rafRef.current = requestAnimationFrame(step);

    return () => cancelAnimationFrame(rafRef.current);
    // shouldAnimate is derived from targetScore + venueId (+ one-time env
    // reads), so those two deps fully capture when the effect must re-run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetScore, venueId]);

  return displayScore;
}
