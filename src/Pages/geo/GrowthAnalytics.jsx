import React, { useEffect, useState } from "react";
import { Lock, ArrowRight, X } from "lucide-react";
import "./GrowthAnalytics.css";

/* ═══════════════════════════════════════════════════════
   Growth analytics — "Coming soon" locked teaser cards
   ───────────────────────────────────────────────────────
   Upsell teasers for GEO features that aren't live yet.

   ⚠ SECURITY: every `placeholder` below is a HARD-CODED, MADE-UP
   constant. These metrics are locked, so their real values must
   NEVER be sent to the client — anything shipped to the browser
   is trivially readable in devtools / the network tab, blur or
   not. The CSS blur is purely cosmetic; the genuine figures live
   only on the server and are intentionally absent from this
   bundle. Do NOT wire these cards to a real data endpoint.
   ═══════════════════════════════════════════════════════ */
const LOCKED_METRICS = [
  { key: "claude_score",         name: "Claude visibility score",  placeholder: "58",        teaser: "See how often Claude recommends you" },
  { key: "chatgpt_score",        name: "ChatGPT visibility score", placeholder: "63",        teaser: "See how often ChatGPT recommends you" },
  { key: "keyword_alignment",    name: "Keyword suggestions",      placeholder: "12 words",  teaser: "The exact words to add to your profile" },
  { key: "competitor_benchmark", name: "Competitor benchmark",     placeholder: "3rd of 6",  teaser: "How you rank against similar venues nearby" },
  { key: "fix_list",             name: "Fix list",                 placeholder: "5 fixes",   teaser: "A prioritised to-do list to raise your score" },
  { key: "occasion_fit",         name: "Occasion fit",             placeholder: "Date night", teaser: "Which occasions you win - and which you're missing" },
];

const INTEREST_URL = "/api/partner/geo/interest";
const isDev = process.env.NODE_ENV === "development";

const TOTAL_FEATURES = LOCKED_METRICS.length;

/* Once the partner is on the early-access list we show a one-off banner; its
   dismissal is remembered across visits. localStorage access is wrapped so a
   blocked/unavailable store (private mode, etc.) just falls back to showing it. */
const BANNER_DISMISS_KEY = "geo_early_access_banner_dismissed";

function readBannerDismissed() {
  try {
    return window.localStorage.getItem(BANNER_DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

function writeBannerDismissed() {
  try {
    window.localStorage.setItem(BANNER_DISMISS_KEY, "1");
  } catch {
    /* ignore */
  }
}

/* The GET response shape isn't pinned down yet, so accept the likely
   variants (array, {interested:[...]}, {registered:[...]}, or a
   key→bool map) and normalise to a flat list of registered keys. */
function normalizeInterest(json) {
  if (Array.isArray(json)) return json;
  if (json && Array.isArray(json.interested)) return json.interested;
  if (json && Array.isArray(json.registered)) return json.registered;
  if (json && typeof json === "object") {
    return Object.keys(json).filter((k) => json[k] === true);
  }
  return [];
}

export default function GrowthAnalytics() {
  const [registered, setRegistered] = useState(() => new Set());
  const [submitting, setSubmitting] = useState(() => new Set());
  const [errored, setErrored] = useState(() => new Set());
  const [bannerDismissed, setBannerDismissed] = useState(readBannerDismissed);

  const registeredCount = registered.size;

  const dismissBanner = () => {
    setBannerDismissed(true);
    writeBannerDismissed();
  };

  // On load, hydrate which teasers this partner already registered for.
  useEffect(() => {
    let cancelled = false;

    fetch(INTEREST_URL, { headers: { Accept: "application/json" } })
      .then((res) => {
        if (!res.ok) throw new Error(`Interest lookup failed (${res.status}).`);
        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          throw new Error("Interest service returned a non-JSON response.");
        }
        return res.json();
      })
      .then((json) => {
        if (cancelled) return;
        setRegistered(new Set(normalizeInterest(json)));
      })
      .catch(() => {
        // Registered-state is a non-critical enhancement: if the service is
        // unreachable (e.g. no backend in local dev) fall back to the default
        // "not registered" state rather than blocking the whole upsell.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const registerInterest = async (key) => {
    if (registered.has(key) || submitting.has(key)) return;

    setSubmitting((prev) => new Set(prev).add(key));
    setErrored((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });

    try {
      const res = await fetch(INTEREST_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ metric: key }),
      });
      if (!res.ok) throw new Error(`Interest sign-up failed (${res.status}).`);
      setRegistered((prev) => new Set(prev).add(key));
    } catch (err) {
      // In local dev there's no backend, so optimistically confirm the
      // sign-up (mirrors PartnerGeo's SAMPLE_GEO dev-fallback). In production
      // a real failure surfaces an inline, retryable error — never silent.
      if (isDev) {
        setRegistered((prev) => new Set(prev).add(key));
      } else {
        setErrored((prev) => new Set(prev).add(key));
      }
    } finally {
      setSubmitting((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  return (
    <section className="geo-locked pd-anim pd-a3" aria-labelledby="geo-locked-title">
      {registeredCount >= 1 && !bannerDismissed && (
        <div className="geo-early-banner" role="status">
          <span className="geo-early-banner-text">
            You're on the early access list. Growth analytics is coming soon - we'll
            email you when it's live.
          </span>
          <button
            type="button"
            className="geo-early-banner-close"
            onClick={dismissBanner}
            aria-label="Dismiss early access notice"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>
      )}

      <div className="geo-locked-head">
        <h2 id="geo-locked-title" className="geo-locked-title">
          Coming soon — Growth analytics
        </h2>
        <p className="geo-locked-sub">
          Deeper insight into your AI visibility. Register interest to get early access.
        </p>
        {registeredCount > 1 && (
          <p className="geo-locked-count">
            You've registered for {registeredCount} of {TOTAL_FEATURES} upcoming
            features.
          </p>
        )}
      </div>

      <div className="geo-locked-grid">
        {LOCKED_METRICS.map((metric) => {
          const isRegistered = registered.has(metric.key);
          const isSubmitting = submitting.has(metric.key);
          const isErrored = errored.has(metric.key);

          return (
            <article
              key={metric.key}
              className="pd-card geo-card geo-locked-card"
            >
              <div className="geo-locked-card-top">
                <h3 className="geo-locked-name">{metric.name}</h3>
                <span className="geo-locked-lock" aria-hidden="true">
                  <Lock size={14} strokeWidth={1.9} />
                </span>
              </div>

              {/* Fake, blurred placeholder — see file header: locked metric
                  values are never fetched or shipped to the client. */}
              <div className="geo-locked-value" aria-hidden="true">
                {metric.placeholder}
              </div>

              <p className="geo-locked-teaser">{metric.teaser}</p>

              {isRegistered ? (
                <div className="geo-locked-done" role="status">
                  You're on the list ✓
                </div>
              ) : (
                <button
                  type="button"
                  className="pd-btn pd-btn--fill geo-locked-btn"
                  onClick={() => registerInterest(metric.key)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Adding…" : "Get early access"}
                  {!isSubmitting && <ArrowRight size={15} strokeWidth={2} />}
                </button>
              )}

              {isErrored && (
                <p className="geo-locked-err" role="alert">
                  Couldn't register interest. Please try again.
                </p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
