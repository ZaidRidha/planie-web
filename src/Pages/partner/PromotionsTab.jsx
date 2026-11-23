import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Pencil,
  ChevronRight,
  Store,
  Trash2,
  Clock,
  Pause,
  Play,
  FileText,
  Megaphone,
  Sparkles,
  Tag,
} from "lucide-react";
import { deletePromotion, updatePromotion, deactivatePromotion, reactivatePromotion } from "../../utils/promotions";
import { useMyListings, useMyPromotions, promoFormFields, offerTypeMeta, promoStatusLabel, formatPromoValue, formatValidity, formatDraftTimestamp } from "./shared";
import "../PartnerDashboard.css";
import "./PromotionsTab.css";

/* Segmented tabs over the real statuses (denied/paused show under All). */
const PROMO_TABS = [
  { id: "all", label: "All" },
  { id: "active", label: "Live" },
  { id: "pending", label: "In review" },
  { id: "draft", label: "Drafts" },
];

const EMPTY_COPY = {
  active: { title: "Nothing live", sub: "None of your promotions are live right now. Approved offers show here once they go live." },
  pending: { title: "Nothing in review", sub: "Submit a draft for review and it will wait here until it's approved." },
  draft: { title: "No drafts", sub: "Promotions you start but don't submit are saved here." },
};

function StatusChip({ status }) {
  return (
    <span className={`pp-chip pp-chip--${status}`}>
      <span className="pp-chip-dot" />
      {promoStatusLabel[status] || status}
    </span>
  );
}

/* Renders the partner's promotion drafts. Self-loads when no `promotions`
   prop is given (overview usage); `listingNames` maps listingId → name. */
export function PromotionDraftsSection({ promotions: promotionsProp, listingNames = {}, onChanged, animClass = "pd-a2" }) {
  const navigate = useNavigate();
  const own = useMyPromotions(promotionsProp === undefined);
  const promotions = promotionsProp ?? own.items ?? [];
  const drafts = promotions.filter((p) => p.status === "draft");

  if (drafts.length === 0) return null;

  const handleDelete = async (id, title) => {
    const ok = window.confirm(`Delete "${title || "this promotion"}"? This cannot be undone.`);
    if (!ok) return;
    try {
      await deletePromotion(id);
    } catch {
      /* surfaced on next load */
    }
    if (onChanged) onChanged();
    else own.reload();
  };

  const selfLoaded = promotionsProp === undefined;

  return (
    <div className={`pp-drafts${selfLoaded ? " pp-drafts--overview" : ""} pd-anim ${animClass}`}>
      <div className="pp-drafts-head">
        <div className="pp-drafts-icon">
          <FileText size={18} strokeWidth={2} />
        </div>
        <div>
          <h3 className="pp-drafts-title">
            Promotion drafts <span className="pp-venue-count">{drafts.length}</span>
          </h3>
          <p className="pp-drafts-sub">Unpublished promotions. Finish setting up to submit them for review.</p>
        </div>
      </div>
      {drafts.map((p) => {
        const meta = offerTypeMeta[p.offerType] || { icon: Tag, label: "" };
        const I = meta.icon;
        const venueName = listingNames[p.listingId] || "No venue";
        const valueLabel = formatPromoValue(p);
        return (
          <div key={p.id} className="pp-draft">
            <div className="pp-draft-main">
              <div className="pp-offer-icon">
                <I size={17} strokeWidth={1.8} />
              </div>
              <div className="pp-draft-text">
                <p className="pp-draft-title">{p.title || "Untitled promotion"}</p>
                <p className="pp-draft-meta">
                  <span>{venueName}</span>
                  <span>·</span>
                  <span>{valueLabel || "No offer set"}</span>
                  <span>·</span>
                  <Clock size={12} strokeWidth={1.8} />
                  <span>Edited {formatDraftTimestamp(p.updatedAt ? new Date(p.updatedAt).getTime() : 0)}</span>
                </p>
              </div>
            </div>
            <div className="pp-actions">
              <button
                type="button"
                className="pp-act pp-act--icon"
                onClick={() => handleDelete(p.id, p.title)}
                aria-label={`Delete ${p.title || "draft"}`}
                title="Delete draft"
              >
                <Trash2 size={14} strokeWidth={2} />
              </button>
              <button
                type="button"
                className="pp-act pp-act--fill"
                onClick={() => navigate(`/partners/edit-promotion/${p.id}`)}
              >
                Continue
                <ChevronRight size={13} strokeWidth={2.2} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function PromotionsTab() {
  const navigate = useNavigate();
  const { items: listings, loadError: listingsError } = useMyListings();
  const { items: promotions, loadError, reload } = useMyPromotions();
  const [actionError, setActionError] = useState(null);
  const [tab, setTab] = useState("all");

  const loading = promotions === null || listings === null;
  const promos = promotions ?? [];
  const listingNames = Object.fromEntries((listings ?? []).map((l) => [l.id, l.name]));

  const grouped = (listings ?? []).map((l) => ({
    id: l.id,
    name: l.name,
    promos: promos.filter((p) => p.listingId === l.id),
  }));

  const run = async (fn) => {
    setActionError(null);
    try {
      await fn();
      await reload();
    } catch (err) {
      setActionError(err.message || "Action failed.");
    }
  };

  /* Submit a draft/denied promo into the review queue. On PROMO_CONFLICT the
     server refused because another promo is live — offer deactivate & retry. */
  const handleSubmit = async (p) => {
    setActionError(null);
    try {
      await updatePromotion(p.id, promoFormFields(p), { submit: true });
      await reload();
    } catch (err) {
      if (err.code === "PROMO_CONFLICT" && err.data?.conflict) {
        const ok = window.confirm(
          `"${err.data.conflict.title || "An existing promotion"}" is already live for this venue. Deactivate it and submit this one for review instead?`
        );
        if (ok) {
          await run(async () => {
            await deactivatePromotion(err.data.conflict.id);
            await updatePromotion(p.id, promoFormFields(p), { submit: true });
          });
        }
      } else {
        setActionError(err.message || "Could not submit the promotion.");
      }
    }
  };

  const handleReactivate = async (p) => {
    setActionError(null);
    try {
      await reactivatePromotion(p.id);
      await reload();
    } catch (err) {
      if (err.code === "PROMO_CONFLICT" && err.data?.conflict) {
        const ok = window.confirm(
          `"${err.data.conflict.title || "An existing promotion"}" is already live for this venue. Deactivate it and reactivate this one instead?`
        );
        if (ok) {
          await run(async () => {
            await deactivatePromotion(err.data.conflict.id);
            await reactivatePromotion(p.id);
          });
        }
      } else {
        setActionError(err.message || "Could not reactivate the promotion.");
      }
    }
  };

  const handleDelete = (id, title) => {
    const ok = window.confirm(`Delete "${title || "this promotion"}"? This cannot be undone.`);
    if (ok) run(() => deletePromotion(id));
  };

  const totalActive = promos.filter((p) => p.status === "active").length;
  const totalPending = promos.filter((p) => p.status === "pending").length;
  const totalDrafts = promos.filter((p) => p.status === "draft").length;
  const tabCounts = { all: promos.length, active: totalActive, pending: totalPending, draft: totalDrafts };

  const summary = [
    { label: "All", value: promos.length, sub: `across ${grouped.length} ${grouped.length === 1 ? "venue" : "venues"}` },
    { label: "Live", value: totalActive, sub: "showing now", red: totalActive > 0 },
    { label: "In review", value: totalPending, sub: "awaiting approval" },
    { label: "Drafts", value: totalDrafts, sub: "not yet submitted" },
  ];

  const matches = (p) => tab === "all" || p.status === tab;
  /* On a filtered tab, only venues with a matching promotion are shown. */
  const visibleGroups = grouped
    .map((g) => ({ ...g, shown: g.promos.filter(matches) }))
    .filter((g) => tab === "all" || g.shown.length > 0);

  const renderRow = (p, idx) => {
    const meta = offerTypeMeta[p.offerType] || { icon: Tag, label: "" };
    const I = meta.icon;
    const valueLabel = formatPromoValue(p);
    const validity = formatValidity(p);
    const occasions = p.applicableOccasions || [];
    return (
      <div
        key={p.id}
        className={`pp-row pp-row--${p.status}`}
        style={{ animationDelay: `${Math.min(idx, 8) * 0.04}s` }}
      >
        <div className="pp-offer">
          <div className="pp-offer-icon">
            <I size={17} strokeWidth={1.8} />
          </div>
          <div className="pp-offer-text">
            <p className="pp-offer-title">{p.title || "Untitled promotion"}</p>
            <p className="pp-offer-meta">
              {meta.label || "Offer"}
              {p.discountCode && (
                <>
                  {" · Code "}
                  <span className="pp-code">{p.discountCode}</span>
                </>
              )}
            </p>
            {occasions.length > 0 && (
              <div className="pp-tags">
                {occasions.map((o) => (
                  <span key={o} className="pp-tag">{o}</span>
                ))}
              </div>
            )}
            {p.status === "denied" && p.denialReason && (
              <p className="pp-denied">Denied: {p.denialReason}</p>
            )}
          </div>
        </div>

        <div>
          <p className="pp-cell-main">{valueLabel || "—"}</p>
          <p className="pp-cell-sub">offer</p>
        </div>

        <span className="pp-cell-plain" title={validity}>{validity}</span>

        <span className="pp-chip-cell"><StatusChip status={p.status} /></span>

        <div className="pp-actions">
          <button
            type="button"
            className="pp-act"
            onClick={() => navigate(`/partners/edit-promotion/${p.id}`)}
          >
            <Pencil size={12} strokeWidth={2} />
            Edit
          </button>
          {p.status === "active" && (
            <button
              type="button"
              className="pp-act"
              onClick={() => run(() => deactivatePromotion(p.id))}
              title="Deactivate this promotion"
            >
              <Pause size={12} strokeWidth={2} />
              Pause
            </button>
          )}
          {p.status === "inactive" && (
            <button
              type="button"
              className="pp-act pp-act--fill"
              onClick={() => handleReactivate(p)}
              title="Reactivate this promotion"
            >
              <Play size={12} strokeWidth={2} />
              Resume
            </button>
          )}
          {(p.status === "draft" || p.status === "denied") && (
            <button
              type="button"
              className="pp-act pp-act--fill"
              onClick={() => handleSubmit(p)}
            >
              <Sparkles size={12} strokeWidth={2} />
              Submit for review
            </button>
          )}
          <button
            type="button"
            className="pp-act pp-act--icon"
            onClick={() => handleDelete(p.id, p.title)}
            aria-label={`Delete ${p.title || "promotion"}`}
            title="Delete promotion"
          >
            <Trash2 size={14} strokeWidth={2} />
          </button>
        </div>
      </div>
    );
  };

  const errorMsg = loadError || listingsError || actionError;
  const emptyCopy = EMPTY_COPY[tab] || EMPTY_COPY.active;

  return (
    <div className="pp-page">
      <header className="pp-header pd-anim pd-a1">
        <div>
          <p className="pp-eyebrow">Promotions</p>
          <h1 className="pp-title">Give plans a reason to pick you.</h1>
          <p className="pp-lede">Offers appear on your listing in Discovery and inside generated itineraries, right at the moment of decision.</p>
        </div>
        <Link to="/partners/add-promotion" className="nu-btn nu-btn--fill pp-new-btn">
          <Plus size={16} strokeWidth={2.2} /> New promotion
        </Link>
      </header>

      {/* Summary — hairline metric band */}
      <section className="pp-band pd-anim pd-a2">
        {summary.map((m) => (
          <div key={m.label} className="pp-metric">
            <p className="pp-metric-label">{m.label}</p>
            <p className={`pp-metric-value${m.red ? " pp-metric-value--red" : ""}`}>{loading ? "—" : m.value}</p>
            <p className="pp-metric-sub">{m.sub}</p>
          </div>
        ))}
      </section>

      {errorMsg && (
        <div className="pp-alert" role="alert">{errorMsg}</div>
      )}

      {/* Drafts */}
      {tab === "all" && (
        <PromotionDraftsSection promotions={promos} listingNames={listingNames} onChanged={reload} animClass="pd-a2" />
      )}

      {/* Promotions per venue */}
      <section className="pp-section pd-anim pd-a3">
        <div className="pp-section-head">
          <h2 className="pp-h2">Your offers</h2>
          {!loading && grouped.length > 0 && (
            <div className="pp-tabs" role="tablist" aria-label="Filter promotions">
              {PROMO_TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.id}
                  className={`pp-tab${tab === t.id ? " pp-tab--on" : ""}`}
                  onClick={() => setTab(t.id)}
                >
                  {t.label} <span className="pp-tab-count">{tabCounts[t.id]}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <p className="pp-loading">Loading your promotions…</p>
        ) : grouped.length === 0 ? (
          <div className="pp-empty">
            <div className="pp-empty-icon"><Megaphone size={25} strokeWidth={1.8} /></div>
            <p className="pp-empty-title">Create a listing first</p>
            <p className="pp-empty-sub">Promotions are offers attached to one of your venues. Add a listing to start creating them.</p>
            <Link to="/partners/add-listing" className="nu-btn nu-btn--fill pp-empty-btn">
              <Plus size={16} strokeWidth={2.2} /> Add a listing
            </Link>
          </div>
        ) : visibleGroups.length === 0 ? (
          <div className="pp-empty" key={`empty-${tab}`}>
            <div className="pp-empty-icon"><Megaphone size={25} strokeWidth={1.8} /></div>
            <p className="pp-empty-title">{emptyCopy.title}</p>
            <p className="pp-empty-sub">{emptyCopy.sub}</p>
            <button type="button" className="nu-btn nu-btn--outline pp-empty-btn" onClick={() => setTab("all")}>
              Show all promotions
            </button>
          </div>
        ) : (
          <div className="pp-list" key={tab}>
            {visibleGroups.map((group) => (
              <div key={group.id} className="pp-venue">
                <div className="pp-venue-head">
                  <div className="pp-venue-info">
                    <div className="pp-venue-icon"><Store size={16} strokeWidth={1.8} /></div>
                    <h3 className="pp-venue-name">{group.name}</h3>
                    <span className="pp-venue-count">{group.promos.length}</span>
                  </div>
                  <button
                    type="button"
                    className="nu-btn nu-btn--outline pp-venue-add"
                    onClick={() => navigate(`/partners/add-promotion?listing=${group.id}`)}
                  >
                    <Plus size={14} strokeWidth={2.2} />
                    Create a promotion
                  </button>
                </div>

                {group.shown.length > 0 ? (
                  group.shown.map((p, i) => renderRow(p, i))
                ) : (
                  <div className="pp-venue-empty">
                    <span>No promotions yet for this venue.</span>
                    <button
                      type="button"
                      className="pp-link-btn"
                      onClick={() => navigate(`/partners/add-promotion?listing=${group.id}`)}
                    >
                      Create its first offer <ChevronRight size={14} strokeWidth={2.2} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
