import React, { useState, useEffect, useCallback } from "react";
import {
  Store,
  CreditCard,
  CheckCircle,
  Download,
  Crown,
  Calendar,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { fetchBilling, startListingCheckout, changeListingPlan, openBillingPortal } from "../../utils/subscription";
import { usePartnerAuth } from "../../Context/PartnerAuthContext";
import { TIER_PLANS, fmtMoney, fmtUnixDate } from "./shared";
import "../PartnerDashboard.css";
import "./BillingTab.css";

/* ─── Billing Tab ───
   PER-LISTING Stripe billing (rework 2026-07-25). Each venue has its own
   Listed/Partner/Featured plan. Upgrading a Listed venue → Stripe Checkout;
   switching between paid tiers or cancelling → partnerChangeListingPlan (no
   redirect). Cards/invoices/cancel also available via the Customer Portal.
   Tiers only change when the backend webhook writes them. */
export function BillingTab() {
  const { refreshProfile } = usePartnerAuth();
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [notice, setNotice] = useState(null); // "success" | "cancelled"
  const [busyId, setBusyId] = useState(null); // listingId being changed, or "portal"
  const [actionError, setActionError] = useState(null);
  const [comparing, setComparing] = useState(false);

  const reload = useCallback(async () => {
    try {
      setData(await fetchBilling());
      setLoadError(null);
    } catch (err) {
      setLoadError(err.message || "Could not load billing information.");
    }
  }, []);
  useEffect(() => { reload(); }, [reload]);

  /* Returning from Stripe Checkout (?billing=success|cancelled). */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const flag = params.get("billing");
    if (!flag) return undefined;
    params.delete("billing");
    const qs = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`);
    if (flag === "cancelled") { setNotice("cancelled"); return undefined; }
    setNotice("success");
    const t = setTimeout(() => { refreshProfile(); reload(); }, 2500);
    return () => clearTimeout(t);
  }, [refreshProfile, reload]);

  const portal = async () => {
    setBusyId("portal");
    setActionError(null);
    try {
      await openBillingPortal(); // redirects away
    } catch (err) {
      setActionError(err.message || "Could not open the billing portal.");
      setBusyId(null);
    }
  };

  /* Set a listing to a tier. Listed→paid opens Checkout (redirect); any change
     on a listing that already has a subscription goes through changeListingPlan. */
  const setListingTier = async (listing, nextTier) => {
    if (nextTier === listing.tier) return;
    setBusyId(listing.listingId);
    setActionError(null);
    try {
      const hasSub = ["active", "trialing", "past_due"].includes(listing.status);
      if (!hasSub && nextTier !== "Listed") {
        await startListingCheckout(listing.listingId, nextTier); // redirects
        return;
      }
      await changeListingPlan(listing.listingId, nextTier);
      // Give the webhook a moment, then refresh.
      setTimeout(() => { refreshProfile(); reload(); setBusyId(null); }, 2000);
    } catch (err) {
      setActionError(err.message || "Could not change this listing's plan.");
      setBusyId(null);
    }
  };

  const listings = data?.listings ?? [];
  const plans = data?.plans ?? [];
  const summary = data?.summary;
  const currency = summary?.currency ?? "gbp";
  const anySub = listings.some((l) => ["active", "trialing", "past_due"].includes(l.status));
  const priceOf = (t) => (t === "Listed" ? 0 : plans.find((p) => p.tier === t)?.amount ?? null);
  const compositionParts = summary
    ? ["Featured", "Partner", "Listed"].filter((t) => summary.counts[t] > 0).map((t) => `${summary.counts[t]} ${t}`)
    : [];

  /* Display-only derivations (no billing logic): loading flag, earliest
     renewal across subscribed listings, and listings per tier. */
  const loading = data == null && !loadError;
  const renewEnds = listings
    .filter((l) => ["active", "trialing", "past_due"].includes(l.status) && l.currentPeriodEnd && !l.cancelAtPeriodEnd)
    .map((l) => l.currentPeriodEnd);
  const nextRenewal = renewEnds.length ? fmtUnixDate(Math.min(...renewEnds)) : null;
  const tierCount = (t) => summary?.counts?.[t] ?? listings.filter((l) => l.tier === t).length;
  const invoices = data?.invoices ?? [];
  const volumePct = summary?.volumePct ?? 20;

  return (
    <div className="pb-page">
      <header className="pb-header pb-rise">
        <div>
          <p className="nu-microlabel" style={{ marginBottom: 6 }}>Billing</p>
          <h1 className="pb-title">Plans, per venue.</h1>
        </div>
      </header>

      {(notice || loadError || actionError) && (
        <div className="pb-notices">
          {notice === "success" && (
            <div className="pb-notice pb-notice--ok pb-rise">
              <span className="pb-notice-icon"><CheckCircle size={16} strokeWidth={2} /></span>
              <p>Payment received — the venue's plan updates as soon as Stripe confirms it (usually seconds).</p>
            </div>
          )}
          {notice === "cancelled" && (
            <div className="pb-notice pb-rise">
              <span className="pb-notice-icon"><AlertCircle size={16} strokeWidth={2} /></span>
              <p>Checkout was cancelled — no changes were made.</p>
            </div>
          )}
          {(loadError || actionError) && (
            <div className="pb-notice pb-notice--error pb-rise" role="alert">
              <span className="pb-notice-icon"><AlertCircle size={16} strokeWidth={2} /></span>
              <p>{loadError || actionError}</p>
            </div>
          )}
        </div>
      )}

      <div className="pb-layout">
        <div className="pb-col">
          {/* ── Hero: subscription total + plan composition ── */}
          <section className="pb-hero pb-rise pb-d1">
            <div className="pb-hero-main">
              <span className="pb-chip">
                <Calendar size={13} strokeWidth={2} /> Monthly billing
              </span>
              <p className="pb-hero-total">
                <span className="pb-hero-amt">
                  {summary ? (fmtMoney(summary.netMonthly, currency) ?? "—") : "—"}
                </span>
                <span className="pb-hero-per">/month total</span>
              </p>
              <p className="pb-hero-comp">
                <Crown size={14} strokeWidth={2} />
                <span>
                  {listings.length} {listings.length === 1 ? "listing" : "listings"}
                  {compositionParts.length > 0 && <> · {compositionParts.join(" · ")}</>}
                </span>
              </p>
              {nextRenewal && (
                <p className="pb-hero-line">
                  Next renewal <strong>{nextRenewal}</strong> · monthly rolling
                </p>
              )}
              {summary?.discountMonthly > 0 && (
                <p className="pb-hero-line pb-hero-line--red">
                  <CheckCircle size={13} strokeWidth={2.2} /> Includes {summary.volumePct}% volume discount
                  (−{fmtMoney(summary.discountMonthly, currency)})
                </p>
              )}
            </div>

            <div className="pb-hero-dark">
              <p className="pb-eyebrow pb-eyebrow--dark">Volume discount</p>
              <p className="pb-hero-dark-big">
                {summary?.discountMonthly > 0
                  ? `−${fmtMoney(summary.discountMonthly, currency)}`
                  : `${volumePct}% off`}
              </p>
              <p className="pb-hero-dark-sub">
                {summary?.discountMonthly > 0 ? "saved on this month's total" : "when 2–5 venues share a paid tier"}
              </p>
              <div className="pb-hero-dark-foot">
                <span>Applied automatically</span>
                <strong>{volumePct}%</strong>
              </div>
            </div>
          </section>

          {/* ── How billing works ── */}
          <section className="pb-strip pb-rise pb-d2">
            <span className="pb-strip-dot" />
            <p>
              <strong>Your bill = the sum of each listing's plan.</strong>{" "}
              <span>Every venue can run a different tier, and prices come straight from Stripe. Listed venues are always free.</span>
            </p>
          </section>

          {/* ── Listings & plans ── */}
          <section className="pb-card pb-rise pb-d2">
            <div className="pb-card-head">
              <h2 className="pb-h2 pb-h2--sm">Listings &amp; plans</h2>
              <p className="pb-card-lede">
                Each venue runs on its own plan — mix and match. When 2–5 of your venues share a paid tier, each gets {volumePct}% off automatically.
              </p>
            </div>

            {loading ? (
              <div className="pb-rows" aria-busy="true">
                <p className="pb-sr">Loading your listings…</p>
                {[0, 1].map((i) => (
                  <div key={i} className="pb-row pb-row--skeleton">
                    <span className="pb-skel pb-skel--name" />
                    <span className="pb-skel pb-skel--seg" />
                  </div>
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div className="pb-empty">
                <span className="pb-empty-icon"><Store size={18} strokeWidth={1.8} /></span>
                <p className="pb-empty-title">No listings yet</p>
                <p className="pb-empty-sub">Add a listing first, then choose its plan here.</p>
              </div>
            ) : (
              <div className="pb-rows">
                {listings.map((l) => {
                  const busy = busyId === l.listingId;
                  const renew = fmtUnixDate(l.currentPeriodEnd);
                  const currentPrice = priceOf(l.tier);
                  return (
                    <div key={l.listingId} className={`pb-row${busy ? " pb-row--busy" : ""}`}>
                      <div className="pb-row-info">
                        <p className="pb-row-name">
                          <Store size={15} strokeWidth={1.8} />
                          <span>{l.name}</span>
                        </p>
                        <p className="pb-row-sub">
                          {l.tier} plan
                          {["active", "trialing", "past_due"].includes(l.status) && renew && (
                            <>
                              {" · "}
                              {l.cancelAtPeriodEnd ? "Ends on" : "Renews on"} <strong>{renew}</strong>
                            </>
                          )}
                          {l.status === "past_due" && <span className="pb-row-fail"> · payment failed</span>}
                        </p>
                      </div>

                      <div className="pb-seg" role="group" aria-label={`Plan for ${l.name}`}>
                        {["Listed", "Partner", "Featured"].map((t) => {
                          const on = t === l.tier;
                          const price = priceOf(t);
                          const missing = t !== "Listed" && price == null;
                          return (
                            <button
                              key={t}
                              className={`pb-seg-btn${on ? " pb-seg-btn--on" : ""}${missing ? " pb-seg-btn--missing" : ""}`}
                              disabled={busy || missing || on}
                              onClick={() => setListingTier(l, t)}
                              title={missing ? "Price not configured in Stripe yet" : ""}
                              aria-pressed={on}
                            >
                              {t}{t !== "Listed" && price != null ? ` · ${fmtMoney(price, currency)}` : ""}
                              {on ? " ✓" : ""}
                            </button>
                          );
                        })}
                      </div>

                      <div className="pb-row-price">
                        {busy ? (
                          <p className="pb-row-updating"><span className="pb-spinner" />Updating…</p>
                        ) : (
                          <>
                            <p className="pb-row-amt">
                              {l.tier === "Listed" ? "Free" : (fmtMoney(currentPrice, currency) ?? "—")}
                            </p>
                            <p className="pb-row-per">{l.tier === "Listed" ? "no subscription" : "list price / month"}</p>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {summary && listings.length > 0 && (
              <div className="pb-summary">
                {["Featured", "Partner", "Listed"].filter((t) => tierCount(t) > 0).map((t) => (
                  <div key={t} className="pb-summary-row">
                    <span>{tierCount(t)} × {t}</span>
                    <span>{t === "Listed" ? "Free" : ""}</span>
                  </div>
                ))}
                {summary.discountMonthly > 0 && (
                  <>
                    <div className="pb-summary-row">
                      <span>Before discount</span>
                      <span>{fmtMoney(summary.grossMonthly, currency) ?? "—"}</span>
                    </div>
                    <div className="pb-summary-row pb-summary-row--red">
                      <span>Volume discount · {summary.volumePct}%</span>
                      <span>−{fmtMoney(summary.discountMonthly, currency)}</span>
                    </div>
                  </>
                )}
                <div className="pb-summary-total">
                  <span>Subscription total</span>
                  <span className="pb-summary-amt">
                    {fmtMoney(summary.netMonthly, currency) ?? "—"}
                    <span className="pb-summary-per"> /mo</span>
                  </span>
                </div>
              </div>
            )}
          </section>

          {/* ── Compare plans (reference only) ── */}
          <section className="pb-section pb-rise pb-d3">
            <div className="pb-section-head">
              <h2 className="pb-h2">Compare plans</h2>
              <button
                className={`pb-toggle${comparing ? " pb-toggle--open" : ""}`}
                onClick={() => setComparing((v) => !v)}
                aria-expanded={comparing}
              >
                {comparing ? "Hide plans" : "Show plans"}
                <ChevronDown size={16} strokeWidth={2} className="pb-toggle-chev" />
              </button>
            </div>
            {comparing && (
              <>
                <div className="pb-plans">
                  {TIER_PLANS.map((p, i) => {
                    const price = plans.find((pl) => pl.tier === p.tier);
                    const priceLabel = p.tier === "Listed" ? "Free" : fmtMoney(price?.amount, price?.currency) ?? "—";
                    const cnt = tierCount(p.tier);
                    return (
                      <div
                        key={p.tier}
                        className={`pb-plan${p.popular ? " pb-plan--dark" : ""}`}
                        style={{ animationDelay: `${i * 0.06}s` }}
                      >
                        {p.popular && <span className="pb-plan-badge">Most Popular</span>}
                        <h4 className="pb-plan-name">{p.tier}</h4>
                        <p className="pb-plan-price">
                          <span className="pb-plan-amt">{priceLabel}</span>
                          <span className="pb-plan-per">{p.tier !== "Listed" ? `/${price?.interval ?? "month"}` : " forever"}</span>
                        </p>
                        <ul className="pb-plan-features">
                          {p.features.map((f) => (
                            <li key={f}><span className="pb-plan-tick">✓</span><span>{f}</span></li>
                          ))}
                        </ul>
                        <div className={`pb-plan-note${cnt > 0 ? " pb-plan-note--on" : ""}`}>
                          {cnt > 0 ? `On ${cnt} of your ${cnt === 1 ? "listing" : "listings"}` : "Not in use yet"}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="pb-foot">
                  Prices are per venue listing, billed through Stripe. <strong>{volumePct}% off</strong> when 2–5 listings share the same paid tier.
                </p>
              </>
            )}
          </section>

          {/* ── Invoices ── */}
          <section className="pb-section pb-rise pb-d4">
            <div className="pb-section-head">
              <h2 className="pb-h2">Invoice history</h2>
            </div>
            {loading ? (
              <p className="pb-muted">Loading invoices…</p>
            ) : invoices.length === 0 ? (
              <div className="pb-empty pb-empty--flat">
                <p className="pb-empty-sub">No invoices yet — they'll appear here after your first payment.</p>
              </div>
            ) : (
              <div className="pb-inv">
                <div className="pb-inv-head">
                  <span>Invoice</span>
                  <span>Date</span>
                  <span>Description</span>
                  <span>Amount</span>
                  <span>Status</span>
                  <span></span>
                </div>
                {invoices.map((inv) => (
                  <div key={inv.id} className="pb-inv-row">
                    <span className="pb-inv-id">{inv.number || inv.id}</span>
                    <span className="pb-inv-muted pb-inv-date">{fmtUnixDate(inv.created)}</span>
                    <span className="pb-inv-muted pb-inv-desc">{inv.description || "Subscription"}</span>
                    <span className="pb-inv-amt">{fmtMoney(inv.total, inv.currency)}</span>
                    <span className={`pb-status${inv.status === "paid" ? " pb-status--paid" : ""}`}>
                      <span className="pb-status-dot" />{inv.status}
                    </span>
                    {inv.hostedInvoiceUrl ? (
                      <a
                        className="pb-inv-dl"
                        href={inv.invoicePdf || inv.hostedInvoiceUrl}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Download invoice ${inv.number || inv.id}`}
                      >
                        <Download size={15} strokeWidth={2} />
                      </a>
                    ) : (
                      <span />
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* ── Right rail ── */}
        <aside className="pb-rail pb-rise pb-d2">
          <div className="pb-card pb-card--rail">
            <p className="pb-rail-title">Payment method</p>
            <div className="pb-pm">
              <span className="pb-pm-icon"><CreditCard size={18} strokeWidth={1.8} /></span>
              <div>
                <p className="pb-pm-name">Managed by Stripe</p>
                <p className="pb-pm-sub">Cards, receipts and cancellation are handled securely by Stripe.</p>
              </div>
            </div>
            {anySub && (
              <button className="pb-btn" onClick={portal} disabled={busyId !== null}>
                <CreditCard size={15} strokeWidth={2} />
                {busyId === "portal" ? "Opening…" : "Manage billing"}
              </button>
            )}
          </div>

          <div className="pb-card pb-card--rail pb-card--ink">
            <p className="pb-eyebrow pb-eyebrow--dark">Changing a plan</p>
            <p className="pb-rail-big">Pick a tier, per venue.</p>
            <ul className="pb-rules">
              <li><span>Listed → paid</span>opens secure Stripe Checkout</li>
              <li><span>Partner ↔ Featured</span>updates the existing subscription</li>
              <li><span>Paid → Listed</span>ends the subscription at period end</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
