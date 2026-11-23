import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  Plus,
  Pencil,
  ChevronRight,
  Store,
  Search,
  ArrowUpDown,
  MoreVertical,
  Trash2,
  Clock,
  ChevronDown,
  ChevronUp,
  Pause,
  Play,
  FileText,
} from "lucide-react";
import { listDrafts, deleteDraft, subscribeDrafts } from "../../utils/listingDrafts";
import { deactivateListing, reactivateListing, deleteListing } from "../../utils/listings";
import ListingPreview from "../../Components/ListingPreview";
import { useMyListings, formatDraftTimestamp } from "./shared";
import "../PartnerDashboard.css";
import "./ListingsTab.css";

/* Listing status filters (values drive the filter logic; labels are display only). */
const statusFilters = ["All", "Active", "Pending", "Inactive", "Denied"];
const filterLabels = { All: "All", Active: "Live", Pending: "Pending", Inactive: "Paused", Denied: "Denied" };

/* Real statuses → handoff wording + chip style + one-line status note. */
const STATUS_META = {
  active: { label: "Live", mod: "live", note: "Live in the Planie app" },
  pending: { label: "Pending", mod: "pending", note: "In review, usually under 24 hours" },
  inactive: { label: "Paused", mod: "paused", note: "Not being placed while paused" },
  denied: { label: "Denied", mod: "denied", note: "Not published. Edit and resubmit to try again" },
};
const statusMeta = (s) => STATUS_META[s] || { label: s ? s.charAt(0).toUpperCase() + s.slice(1) : "Unknown", mod: "paused", note: "" };

function StatusChip({ status }) {
  const m = statusMeta(status);
  return (
    <span className={`pl-chip pl-chip--${m.mod}`}>
      {m.mod === "live" && <span className="pl-dot" aria-hidden="true" />}
      {m.label}
    </span>
  );
}


/* Unpublished listing drafts (localStorage) — finish to submit. */
export function DraftsSection({ animClass = "pd-a2" }) {
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState(() => listDrafts());
  useEffect(() => subscribeDrafts(setDrafts), []);
  if (drafts.length === 0) return null;
  const handleDelete = (id, name) => {
    if (!window.confirm(`Delete "${name || "this draft"}"? This cannot be undone.`)) return;
    deleteDraft(id);
  };
  return (
    <section className={`pl-drafts pd-anim ${animClass}`}>
      <div className="pl-drafts-head">
        <div className="pl-drafts-title">
          <h3>Listing drafts</h3>
          <span className="pl-drafts-count">{drafts.length}</span>
        </div>
        <p className="pl-drafts-sub">Unpublished listings. Finish setting up to submit for review.</p>
      </div>
      <div className="pl-drafts-grid">
        {drafts.map((d) => {
          const name = d.form?.name || "Untitled listing";
          const cat = d.form?.category || "";
          const city = d.form?.city || "";
          return (
            <div key={d.id} className="pl-draft-card">
              <div className="pl-draft-card-top">
                <div className="pl-draft-card-icon"><FileText size={17} strokeWidth={1.7} /></div>
                <div className="pl-draft-card-info">
                  <h4>{name}</h4>
                  <p>{cat || "No category"}{city && <> · {city}</>}</p>
                </div>
                <span className="pl-chip pl-chip--draft">Draft</span>
              </div>
              <div className="pl-draft-card-foot">
                <span className="pl-draft-card-time"><Clock size={12} strokeWidth={1.8} /> Edited {formatDraftTimestamp(d.updatedAt)}</span>
                <div className="pl-draft-card-actions">
                  <button type="button" className="pl-btn pl-btn--ghost pl-btn--sm" onClick={() => handleDelete(d.id, name)}><Trash2 size={13} strokeWidth={2} /> Delete</button>
                  <button type="button" className="pl-btn pl-btn--fill pl-btn--sm" onClick={() => navigate(`/partners/add-listing?draft=${d.id}`)}>Continue <ChevronRight size={13} strokeWidth={2.2} /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function ListingsTab() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [openMenu, setOpenMenu] = useState(null);
  const [previewId, setPreviewId] = useState(null);
  const [selId, setSelId] = useState(null);
  const { items, loadError, reload } = useMyListings();
  const [sortBy, setSortBy] = useState("newest");
  const [actionError, setActionError] = useState(null);
  const listingData = items ?? [];
  const loading = items === null;

  // Pause/resume only applies to approved listings; pending/denied can't toggle.
  const togglePause = async (l) => {
    setOpenMenu(null);
    setActionError(null);
    try {
      if (l.status === "inactive") await reactivateListing(l.id);
      else if (l.status === "active") await deactivateListing(l.id);
      else return;
      await reload();
    } catch (err) {
      setActionError(err.message || "Could not update the listing.");
    }
  };

  const handleDelete = async (l) => {
    setOpenMenu(null);
    if (!window.confirm(`Delete "${l.name}"? This cannot be undone.`)) return;
    setActionError(null);
    try {
      await deleteListing(l.id);
      await reload();
    } catch (err) {
      setActionError(err.message || "Could not delete the listing.");
    }
  };

  const filtered = listingData.filter((l) => {
    const matchSearch =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.category.toLowerCase().includes(search.toLowerCase()) ||
      l.location.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "All" || l.status === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "newest": return new Date(b.createdISO || 0) - new Date(a.createdISO || 0);
      case "oldest": return new Date(a.createdISO || 0) - new Date(b.createdISO || 0);
      case "name-az": return a.name.localeCompare(b.name);
      case "name-za": return b.name.localeCompare(a.name);
      case "views": return b.views - a.views;
      case "clicks": return b.clicks - a.clicks;
      case "rating": return b.rating - a.rating;
      case "bookings": return b.bookings - a.bookings;
      case "conversion": return b.conversionRate - a.conversionRate;
      default: return 0;
    }
  });

  const counts = {
    all: listingData.length,
    active: listingData.filter((l) => l.status === "active").length,
    pending: listingData.filter((l) => l.status === "pending").length,
    inactive: listingData.filter((l) => l.status === "inactive").length,
    denied: listingData.filter((l) => l.status === "denied").length,
  };

  // Selected listing for the detail panel: the clicked row, else the first visible one.
  const sel = sorted.find((l) => l.id === selId) || sorted[0] || null;
  const filtersOn = search !== "" || statusFilter !== "All";
  const clearFilters = () => { setSearch(""); setStatusFilter("All"); };

  return (
    <div className="pl-page">
      <header className="pl-head pd-anim pd-a1">
        <div>
          <p className="nu-microlabel pl-microlabel">Listings</p>
          <h1 className="pl-title">Your places.</h1>
        </div>
        <Link to="/partners/add-listing" className="pl-btn pl-btn--fill pl-btn--lg">
          <Plus size={16} strokeWidth={2.2} /> New listing
        </Link>
      </header>

      {/* Controls: status tabs + search & sort */}
      <div className="pl-toolbar pd-anim pd-a2">
        <div className="pl-tabs" role="tablist" aria-label="Filter listings by status">
          {statusFilters.map((s) => {
            const isActive = statusFilter === s;
            return (
              <button
                key={s}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setStatusFilter(s)}
                className={`pl-tab${isActive ? " is-active" : ""}`}
              >
                {filterLabels[s]} <span className="pl-tab-count">{counts[s.toLowerCase()]}</span>
              </button>
            );
          })}
        </div>

        <div className="pl-toolbar-right">
          <label className="pl-search">
            <Search size={16} strokeWidth={2} className="pl-search-icon" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search your places…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-search-input"
              aria-label="Search listings"
            />
          </label>
          <label className="pl-sort">
            <ArrowUpDown size={14} strokeWidth={2} aria-hidden="true" />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="pl-sort-select" aria-label="Sort listings">
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="name-az">Name A–Z</option>
              <option value="name-za">Name Z–A</option>
              <option value="views">Most views</option>
              <option value="clicks">Most clicks</option>
              <option value="rating">Highest rating</option>
              <option value="bookings">Most bookings</option>
              <option value="conversion">Highest conversion</option>
            </select>
            <ChevronDown size={14} strokeWidth={2} className="pl-sort-caret" aria-hidden="true" />
          </label>
        </div>
      </div>

      {/* Errors */}
      {(loadError || actionError) && (
        <div className="pl-error" role="alert">
          {loadError || actionError}
        </div>
      )}

      {/* Drafts */}
      <DraftsSection animClass="pd-a2" />

      {/* Listings: rows + selected-listing detail */}
      <div className={`pl-body${sel ? "" : " pl-body--single"}`}>
        <div className="pl-list pd-anim pd-a3">
          {loading ? (
            <div aria-busy="true" aria-label="Loading your listings">
              {[0, 1, 2].map((i) => (
                <div key={i} className="pl-row pl-row--skeleton">
                  <div><span className="pl-skel pl-skel--title" /><span className="pl-skel pl-skel--sub" /></div>
                  <span className="pl-skel pl-skel--stat" />
                  <span className="pl-skel pl-skel--stat" />
                  <span className="pl-skel pl-skel--stat" />
                  <span className="pl-skel pl-skel--chip" />
                </div>
              ))}
              <p className="pl-loading-text">Loading your listings…</p>
            </div>
          ) : sorted.length === 0 ? (
            <div className="pl-empty">
              <div className="pl-empty-icon">
                {listingData.length === 0 ? <Store size={26} strokeWidth={1.6} /> : <Search size={26} strokeWidth={1.8} />}
              </div>
              {listingData.length === 0 ? (
                <>
                  <p className="pl-empty-title">No places yet</p>
                  <p className="pl-empty-text">Create your first listing to get started. Once it's approved, Planie can place it inside plans.</p>
                  <Link to="/partners/add-listing" className="pl-btn pl-btn--fill pl-empty-btn"><Plus size={15} strokeWidth={2.2} /> Add a listing</Link>
                </>
              ) : (
                <>
                  <p className="pl-empty-title">No places match your filters</p>
                  <p className="pl-empty-text">
                    {search ? <>Nothing here for “{search}”. </> : null}
                    Try a different term, or clear your filters to see all your places.
                  </p>
                  {filtersOn && (
                    <button type="button" className="pl-btn pl-btn--outline pl-empty-btn" onClick={clearFilters}>Clear filters</button>
                  )}
                </>
              )}
            </div>
          ) : (
            sorted.map((l) => {
              const isSel = sel && sel.id === l.id;
              return (
                <div
                  key={l.id}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSel}
                  className={`pl-row${isSel ? " is-selected" : ""}${openMenu === l.id ? " is-menu-open" : ""}`}
                  onClick={() => setSelId(l.id)}
                  onKeyDown={(e) => { if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); setSelId(l.id); } }}
                >
                  <span className="pl-row-bar" aria-hidden="true" />
                  <div className="pl-row-main">
                    <p className="pl-row-name">{l.name}</p>
                    <p className="pl-row-sub">{l.category} · {l.location}</p>
                  </div>
                  <div className="pl-row-stats">
                    <div className="pl-row-stat"><p className="pl-row-val">{l.views.toLocaleString()}</p><p className="pl-row-lbl">views</p></div>
                    <div className="pl-row-stat"><p className="pl-row-val">{l.clicks.toLocaleString()}</p><p className="pl-row-lbl">clicks</p></div>
                    <div className="pl-row-stat"><p className="pl-row-val">★ {l.rating}</p><p className="pl-row-lbl">rating</p></div>
                  </div>
                  <div className="pl-row-status"><StatusChip status={l.status} /></div>
                  <div className="pl-row-menu" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="pl-icon-btn"
                      aria-label={`Actions for ${l.name}`}
                      aria-haspopup="menu"
                      aria-expanded={openMenu === l.id}
                      onClick={() => setOpenMenu(openMenu === l.id ? null : l.id)}
                    >
                      <MoreVertical size={16} strokeWidth={2} />
                    </button>
                    {openMenu === l.id && (
                      <div className="pl-menu" role="menu">
                        <button type="button" role="menuitem" className="pl-menu-item" onClick={() => navigate(`/partners/edit-listing/${l.id}`)}>
                          <Pencil size={14} /> Edit listing
                        </button>
                        {(l.status === "active" || l.status === "inactive") && (
                          <button type="button" role="menuitem" className="pl-menu-item" onClick={() => togglePause(l)}>
                            {l.status === "inactive" ? <><Play size={14} /> Resume listing</> : <><Pause size={14} /> Pause listing</>}
                          </button>
                        )}
                        <button type="button" role="menuitem" className="pl-menu-item pl-menu-item--danger" onClick={() => handleDelete(l)}>
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Add listing CTA */}
          {!loading && listingData.length > 0 && (
            <Link to="/partners/add-listing" className="pl-add-cta">
              <Plus size={17} strokeWidth={2} />
              <span>Add a new listing</span>
            </Link>
          )}
        </div>

        {/* Selected-listing detail */}
        {sel && (
          <aside className="pl-detail pd-anim pd-a4" aria-label="Listing detail">
            <div key={sel.id} className="pl-detail-inner">
              <div className="pl-detail-top">
                <StatusChip status={sel.status} />
                <span className="pl-detail-rating">★ {sel.rating} · added {sel.created}</span>
              </div>
              <h2 className="pl-detail-name">{sel.name}</h2>
              <p className="pl-detail-sub">{sel.category} · {sel.location}</p>

              {sel.description && <p className="pl-detail-desc">{sel.description}</p>}

              {sel.status === "denied" && sel.denialReason && (
                <div className="pl-denial">
                  <p className="pl-denial-title">Why it was denied</p>
                  <p className="pl-denial-text">{sel.denialReason}</p>
                </div>
              )}

              <div className="pl-detail-stats">
                <div><p className="pl-detail-val">{sel.views.toLocaleString()}</p><p className="pl-detail-lbl">views</p></div>
                <div><p className="pl-detail-val">{sel.clicks.toLocaleString()}</p><p className="pl-detail-lbl">clicks</p></div>
              </div>
              <p className="pl-detail-note-small">Listing analytics arrive with the Insights platform.</p>

              {statusMeta(sel.status).note && (
                <p className={`pl-detail-line pl-detail-line--${statusMeta(sel.status).mod}`}>
                  <span className="pl-dot" aria-hidden="true" />
                  {statusMeta(sel.status).note}
                </p>
              )}

              <div className="pl-detail-actions">
                <button type="button" className="pl-btn pl-btn--outline pl-btn--block" onClick={() => navigate(`/partners/edit-listing/${sel.id}`)}>
                  <Pencil size={14} strokeWidth={2} /> Edit listing
                </button>
                {(sel.status === "active" || sel.status === "inactive") && (
                  <button type="button" className="pl-btn pl-btn--outline pl-btn--block" onClick={() => togglePause(sel)}>
                    {sel.status === "inactive" ? <><Play size={14} strokeWidth={2} /> Resume</> : <><Pause size={14} strokeWidth={2} /> Pause</>}
                  </button>
                )}
              </div>

              {/* Virtual app view — see exactly how the listing looks in-app */}
              <button
                type="button"
                className={`pl-preview-toggle${previewId === sel.id ? " is-open" : ""}`}
                onClick={() => setPreviewId(previewId === sel.id ? null : sel.id)}
                aria-expanded={previewId === sel.id}
              >
                <Eye size={14} strokeWidth={2} />
                {previewId === sel.id ? "Hide app preview" : "Preview in app"}
                {previewId === sel.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {previewId === sel.id && (
                <div className="pl-preview">
                  <ListingPreview
                    form={{ name: sel.name, category: sel.category, city: sel.city, country: sel.country }}
                    imagePreview={(sel.images || []).map((url) => ({ url }))}
                  />
                </div>
              )}

              <button type="button" className="pl-delete-link" onClick={() => handleDelete(sel)}>
                <Trash2 size={13} strokeWidth={2} /> Delete listing
              </button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
