import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  LogOut,
  LayoutDashboard,
  Store,
  TrendingUp,
  Settings,
  CreditCard,
  Tag,
  Percent,
  Gift,
  Pencil,
  Calendar,
  Users,
  AlertCircle,
  FileText,
  Megaphone,
  Crown,
  Sparkles,
} from "lucide-react";
import PlanieLogo from "../Assets/Images/PlanieLogo2.png";
import {
  emptyPromotion,
  fetchPromotion,
  createPromotion,
  updatePromotion,
  deactivatePromotion,
} from "../utils/promotions";
import { fetchMyListings } from "../utils/listings";
import { getTier, isFeatured } from "../utils/subscription";
import "./PartnerDashboard.css";
import "./AddListing.css";

const allOccasions = [
  "Date Night",
  "Birthday",
  "Anniversary",
  "Family Day",
  "Friends Night Out",
  "Romantic Getaway",
  "Honeymoon",
  "Bachelor / Hen Party",
  "Solo Trip",
  "Business Trip",
  "Kids Friendly",
  "Group Celebration",
];

const offerTypes = [
  { id: "percentage", label: "Percentage discount", desc: "e.g. 20% off", icon: Percent },
  { id: "fixed", label: "Fixed amount off", desc: "e.g. £10 off", icon: Tag },
  { id: "free_item", label: "Free item", desc: "e.g. free dessert, welcome drink", icon: Gift },
  { id: "custom", label: "Custom", desc: "Free text — e.g. 'Complimentary upgrade on arrival'", icon: Pencil },
];

const validityOptions = [
  { id: "always", label: "Always on" },
  { id: "custom", label: "Custom" },
];

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const buildSidebarItems = (tier) => [
  { icon: LayoutDashboard, label: "Overview",    path: "/partners/dashboard#dashboard" },
  { icon: Store,           label: "Listings",    path: "/partners/dashboard#listings" },
  { icon: Megaphone,       label: "Promotions",  path: "/partners/dashboard#promotions" },
  { icon: Crown,           label: "Campaigns",   path: "/partners/campaigns", badge: !isFeatured(tier) ? "Featured" : null },
  { icon: TrendingUp,      label: "Insights",    path: "/partners/dashboard#analytics" },
  { icon: CreditCard,      label: "Billing",     path: "/partners/dashboard#billing" },
  { icon: Settings,        label: "Settings",    path: "/partners/dashboard#settings" },
];

/* The form fields a promotion round-trips through the API. */
const promoFormFields = (f) => ({
  title: f.title || "",
  offerType: f.offerType || "",
  discountValue: f.discountValue || "",
  discountCode: f.discountCode || "",
  applicableOccasions: f.applicableOccasions || [],
  validityType: f.validityType || "always",
  validityFrom: f.validityFrom || "",
  validityTo: f.validityTo || "",
  validityDays: f.validityDays || [],
  validityTimeFrom: f.validityTimeFrom || "",
  validityTimeTo: f.validityTimeTo || "",
  minBookingSize: f.minBookingSize || "",
  internalNote: f.internalNote || "",
});

export default function AddPromotion() {
  const navigate = useNavigate();
  const { id: editId } = useParams();
  const [searchParams] = useSearchParams();
  const queryListing = searchParams.get("listing") || "";

  const isEditing = Boolean(editId);

  const [form, setForm] = useState(() => ({ ...emptyPromotion(), listingId: queryListing }));
  const [loading, setLoading] = useState(isEditing);
  const [loadError, setLoadError] = useState(null);

  /* Approved venues (active/inactive) — promotions attach to these. */
  const [listings, setListings] = useState(null);

  /* Multi-listing selection — only used when creating new */
  const [selectedIds, setSelectedIds] = useState(() => (queryListing ? [queryListing] : []));

  const [conflicts, setConflicts] = useState([]); // [{ listingId, name, conflict, retry }]
  const [savedState, setSavedState] = useState(null); // 'draft' | 'published'
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  /* Explicit "All" toggles for the custom validity fields. They default to OFF
     for new promotions and only activate when the user clicks the chip
     (or — when editing — if the saved promo had empty date/time fields). */
  const [allDates, setAllDates] = useState(false);
  const [allTimes, setAllTimes] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { items } = await fetchMyListings();
        if (cancelled) return;
        setListings((items ?? []).filter((l) => l.status === "active" || l.status === "inactive"));
      } catch {
        if (!cancelled) setListings([]);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!editId) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const { promotion } = await fetchPromotion(editId);
        if (cancelled) return;
        const base = emptyPromotion();
        const merged = {
          ...base,
          ...Object.fromEntries(Object.keys(base).map((k) => [k, promotion[k] ?? base[k]])),
          id: editId,
        };
        setForm(merged);
        setSelectedIds([merged.listingId]);
        const isCustom = merged.validityType === "custom";
        setAllDates(isCustom && !merged.validityFrom && !merged.validityTo);
        setAllTimes(isCustom && !merged.validityTimeFrom && !merged.validityTimeTo);
        setLoadError(null);
      } catch (err) {
        if (!cancelled) setLoadError(err.message || "Could not load this promotion.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [editId]);

  const listingName = useMemo(() => {
    if (!isEditing) return "";
    const found = (listings ?? []).find((l) => l.id === form.listingId);
    return found?.name || "";
  }, [form.listingId, isEditing, listings]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleId = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const allSelected = listings !== null && selectedIds.length === listings.length && listings.length > 0;
  const toggleAll = () => {
    setSelectedIds(allSelected ? [] : (listings ?? []).map((l) => l.id));
  };

  const toggleOccasion = (occ) => {
    setForm((prev) => {
      const list = prev.applicableOccasions || [];
      const has = list.includes(occ);
      return {
        ...prev,
        applicableOccasions: has ? list.filter((o) => o !== occ) : [...list, occ],
      };
    });
  };

  const toggleDay = (day) => {
    setForm((prev) => {
      const list = prev.validityDays || [];
      const has = list.includes(day);
      return {
        ...prev,
        validityDays: has ? list.filter((d) => d !== day) : [...list, day],
      };
    });
  };

  const requiresValue = form.offerType === "percentage" || form.offerType === "fixed";
  const valuePrefix = form.offerType === "percentage" ? "%" : "£";
  const valueIsPrefix = form.offerType !== "percentage"; // £ goes before, % goes after

  const targetIds = isEditing ? [form.listingId] : selectedIds;
  const allDaysActive = (form.validityDays || []).length === 7;
  const customNeedsDays =
    form.validityType === "custom" && (form.validityDays || []).length === 0;
  const canSubmit =
    (isEditing || selectedIds.length > 0) && !customNeedsDays && !submitting;

  const toggleAllDates = () =>
    setAllDates((prev) => {
      const next = !prev;
      if (next) setForm((p) => ({ ...p, validityFrom: "", validityTo: "" }));
      return next;
    });
  const toggleAllDays = () =>
    setForm((p) => ({
      ...p,
      validityDays: allDaysActive ? [] : [...daysOfWeek],
    }));
  const toggleAllTimes = () =>
    setAllTimes((prev) => {
      const next = !prev;
      if (next) setForm((p) => ({ ...p, validityTimeFrom: "", validityTimeTo: "" }));
      return next;
    });

  const handleSaveDraft = async () => {
    if (targetIds.length === 0 || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      if (isEditing) {
        await updatePromotion(editId, promoFormFields(form), { submit: false });
      } else {
        for (const listingId of targetIds) {
          await createPromotion({ ...promoFormFields(form), listingId }, { submit: false });
        }
      }
      setSavedState("draft");
    } catch (err) {
      setSubmitError(err.message || "Could not save the draft.");
    } finally {
      setSubmitting(false);
    }
  };

  /* Submits into the staff review queue. The backend answers 409
     PROMO_CONFLICT when a venue already has a live promotion — those are
     collected so the user can choose "deactivate & submit". */
  const handlePublish = async () => {
    if (targetIds.length === 0 || customNeedsDays || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    setConflicts([]);
    const issues = [];
    const errors = [];
    try {
      if (isEditing) {
        try {
          await updatePromotion(editId, promoFormFields(form), { submit: true });
        } catch (err) {
          if (err.code === "PROMO_CONFLICT" && err.data?.conflict) {
            issues.push({
              listingId: form.listingId,
              name: listingName || "this venue",
              conflict: err.data.conflict,
              retry: () => updatePromotion(editId, promoFormFields(form), { submit: true }),
            });
          } else {
            throw err;
          }
        }
      } else {
        for (const listingId of targetIds) {
          const name = (listings ?? []).find((l) => l.id === listingId)?.name || "this venue";
          try {
            await createPromotion({ ...promoFormFields(form), listingId }, { submit: true });
          } catch (err) {
            if (err.code === "PROMO_CONFLICT" && err.data?.conflict) {
              issues.push({
                listingId,
                name,
                conflict: err.data.conflict,
                retry: () => createPromotion({ ...promoFormFields(form), listingId }, { submit: true }),
              });
            } else {
              errors.push(`${name}: ${err.message}`);
            }
          }
        }
      }
      if (errors.length > 0) setSubmitError(errors.join(" · "));
      if (issues.length > 0) {
        setConflicts(issues);
      } else if (errors.length === 0) {
        setSavedState("published");
      }
    } catch (err) {
      setSubmitError(err.message || "Could not submit the promotion.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolveConflicts = async () => {
    if (conflicts.length === 0 || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      for (const c of conflicts) {
        await deactivatePromotion(c.conflict.id);
        await c.retry();
      }
      setConflicts([]);
      setSavedState("published");
    } catch (err) {
      setSubmitError(err.message || "Could not resolve the conflict — please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Loading / not-found (edit mode) ── */
  if (isEditing && (loading || loadError)) {
    return (
      <div className="pd-layout">
        <Sidebar />
        <main className="pd-main">
          <div className="al-success pd-animate pd-d1">
            {loading ? (
              <p style={{ color: "#687076" }}>Loading promotion…</p>
            ) : (
              <>
                <h2>Promotion not found</h2>
                <p>{loadError}</p>
                <Link to="/partners/dashboard#promotions" className="pd-btn pd-btn--primary">
                  Back to Promotions
                </Link>
              </>
            )}
          </div>
        </main>
      </div>
    );
  }

  /* ── Success state ── */
  if (savedState) {
    const isPublished = savedState === "published";
    const venueCount = isEditing ? 1 : selectedIds.length;
    return (
      <div className="pd-layout">
        <Sidebar />
        <main className="pd-main">
          <div className="al-success pd-animate pd-d1">
            <div
              className="al-success-icon"
              style={{
                background: isPublished ? "#ECFDF5" : "#FEF3C7",
                color: isPublished ? "#10B981" : "#D97706",
              }}
            >
              {isPublished ? <Sparkles size={48} strokeWidth={1.5} /> : <FileText size={48} strokeWidth={1.5} />}
            </div>
            <h2>
              {isPublished
                ? venueCount > 1 ? `Submitted for ${venueCount} venues` : "Submitted for Review"
                : venueCount > 1 ? `${venueCount} drafts saved` : "Draft Saved"}
            </h2>
            <p>
              {isPublished
                ? "Our staff review every promotion before it goes live — typically within 24–48 hours. You can follow the status from the Promotions tab, and it will appear alongside your venue in Planie once approved."
                : "Your draft is saved. Come back any time to finish setting up and submit it for review."}
            </p>
            <div className="al-success-actions">
              <Link to="/partners/dashboard#promotions" className="pd-btn pd-btn--primary">
                Back to Promotions
              </Link>
              <button
                className="pd-btn pd-btn--outline"
                onClick={() => setSavedState(null)}
              >
                Continue Editing
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="pd-layout">
      <Sidebar />

      <main className="pd-main">
        <header className="al-header pd-animate pd-d1">
          <button className="al-back" onClick={() => navigate("/partners/dashboard#promotions")}>
            <ArrowLeft size={20} strokeWidth={2} />
          </button>
          <div>
            <p className="nu-microlabel" style={{ marginBottom: 6 }}>{isEditing ? "Edit promotion" : "New promotion"}</p>
            <h1 style={{ fontFamily: "'Gabarito', sans-serif", margin: 0, fontWeight: 700, fontSize: 34, letterSpacing: "-0.02em" }}>
              {isEditing ? "Refine your offer." : "Create an offer."}
            </h1>
            <p style={{ margin: "8px 0 0", fontSize: 15, opacity: 0.6 }}>
              {isEditing && listingName
                ? `For ${listingName} — edits go back to review.`
                : "Pick which venues this offer applies to and we'll set it up across them."}
            </p>
          </div>
        </header>

        {conflicts.length > 0 && (
          <div className="al-conflict-banner pd-animate pd-d1">
            <AlertCircle size={18} strokeWidth={2} />
            <div className="al-conflict-text">
              <strong>
                {conflicts.length === 1
                  ? `${conflicts[0].name} already has an active promotion`
                  : `${conflicts.length} venues already have active promotions`}
              </strong>
              <span>
                Only one promotion can be live per listing. Deactivate the existing offer
                {conflicts.length > 1 ? "s" : ""} to submit this one for review
                {conflicts.length > 1 ? " across all selected venues" : ""}.
                {conflicts.length > 1 && (
                  <>
                    <br />
                    <em>
                      {conflicts.map((c) => `${c.name} → "${c.conflict.title || "Untitled"}"`).join(", ")}
                    </em>
                  </>
                )}
              </span>
            </div>
            <div className="al-conflict-actions">
              <button className="pd-btn pd-btn--ghost" onClick={() => setConflicts([])} disabled={submitting}>
                Cancel
              </button>
              <button className={`pd-btn pd-btn--primary${submitting ? " is-busy" : ""}`} onClick={handleResolveConflicts} disabled={submitting}>
                {submitting ? <>Working<span className="busy-dots" /></> : "Deactivate & submit"}
              </button>
            </div>
          </div>
        )}

        <form
          className="al-form"
          onSubmit={(e) => {
            e.preventDefault();
            handlePublish();
          }}
        >
          {/* Listing picker — multi-select for new, locked for edit */}
          {isEditing ? (
            <section className="pd-card al-section pd-animate pd-d1">
              <h3 className="al-section-title">Applied to</h3>
              <div className="al-field">
                <span className="al-help">
                  This promotion is scoped to a single venue. To apply the same offer to other listings, create a new promotion and select multiple venues.
                </span>
                <div className="al-listing-locked">
                  <Store size={16} strokeWidth={1.7} />
                  <span>{listingName || "Your venue"}</span>
                </div>
              </div>
            </section>
          ) : (
            <section className="pd-card al-section pd-animate pd-d1">
              <h3 className="al-section-title">Which venues does this apply to?</h3>
              <div className="al-field">
                <div className="al-listings-head">
                  <label className="al-label" style={{ marginBottom: 0 }}>Listings *</label>
                  <button type="button" className="pd-link" onClick={toggleAll}>
                    {allSelected ? "Clear all" : "Select all"}
                  </button>
                </div>
                <span className="al-help">
                  Pick one venue, several, or all of them. We'll create a copy of this promotion for each selected listing — they can be edited or deactivated individually later. Only approved listings can carry promotions.
                </span>
                {listings === null ? (
                  <span className="al-help" style={{ marginTop: 10 }}>Loading your venues…</span>
                ) : listings.length === 0 ? (
                  <span className="al-help" style={{ marginTop: 10, color: "#B45309" }}>
                    You don't have an approved listing yet — promotions attach to approved venues.{" "}
                    <Link to="/partners/add-listing" className="pd-link">Create a listing</Link> first.
                  </span>
                ) : (
                  <div className="al-category-grid">
                    {listings.map((l) => {
                      const active = selectedIds.includes(l.id);
                      return (
                        <button
                          key={l.id}
                          type="button"
                          className={`al-category-chip ${active ? "al-category-chip--active" : ""}`}
                          onClick={() => toggleId(l.id)}
                        >
                          {l.name}
                        </button>
                      );
                    })}
                  </div>
                )}
                {listings !== null && listings.length > 0 && selectedIds.length === 0 && (
                  <span className="al-help" style={{ marginTop: 10, color: "#B45309" }}>
                    Select at least one venue to continue.
                  </span>
                )}
              </div>
            </section>
          )}

          {/* ── Offer Type ── */}
          <section className="pd-card al-section pd-animate pd-d1">
            <h3 className="al-section-title">What kind of offer is this?</h3>
            <div className="al-field">
              <label className="al-label">Offer Type *</label>
              <span className="al-help">
                Pick the format that best matches what you're offering. This shapes how the promotion is presented to travelers.
              </span>
              <div className="al-offer-grid">
                {offerTypes.map((o) => {
                  const I = o.icon;
                  const active = form.offerType === o.id;
                  return (
                    <button
                      key={o.id}
                      type="button"
                      className={`al-offer-card${active ? " al-offer-card--active" : ""}`}
                      onClick={() => updateField("offerType", o.id)}
                    >
                      <I size={20} strokeWidth={1.7} />
                      <div>
                        <div className="al-offer-card-title">{o.label}</div>
                        <div className="al-offer-card-desc">{o.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {requiresValue && (
              <div className="al-field al-field--divided">
                <label className="al-label">
                  Discount Value *
                </label>
                <span className="al-help">
                  {form.offerType === "percentage"
                    ? "What percentage will travelers save?"
                    : "How much off, in pounds?"}
                </span>
                <div className="al-currency" style={{ maxWidth: 180 }}>
                  {valueIsPrefix && <span className="al-currency-prefix">{valuePrefix}</span>}
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step={form.offerType === "percentage" ? "1" : "0.01"}
                    className="al-input"
                    placeholder="0"
                    style={!valueIsPrefix ? { paddingLeft: 14, paddingRight: 32 } : undefined}
                    value={form.discountValue}
                    onChange={(e) => updateField("discountValue", e.target.value)}
                    required={requiresValue}
                  />
                  {!valueIsPrefix && (
                    <span className="al-currency-prefix" style={{ left: "auto", right: 14 }}>%</span>
                  )}
                </div>
              </div>
            )}

            {form.offerType === "free_item" && (
              <div className="al-field al-field--divided">
                <label className="al-label">Free Item *</label>
                <span className="al-help">
                  Describe what travelers receive (e.g. "Free dessert", "Welcome drink on arrival").
                </span>
                <input
                  type="text"
                  className="al-input"
                  placeholder="Free dessert with main course"
                  value={form.discountValue}
                  onChange={(e) => updateField("discountValue", e.target.value)}
                  maxLength={80}
                  required
                />
              </div>
            )}

            {form.offerType === "custom" && (
              <div className="al-field al-field--divided">
                <label className="al-label">Custom Offer *</label>
                <span className="al-help">
                  Describe your offer in your own words — travelers will see this exactly as written.
                </span>
                <input
                  type="text"
                  className="al-input"
                  placeholder="Complimentary upgrade on arrival"
                  value={form.discountValue}
                  onChange={(e) => updateField("discountValue", e.target.value)}
                  maxLength={120}
                  required
                />
              </div>
            )}
          </section>

          {/* ── Discount code ── */}
          <section className="pd-card al-section pd-animate pd-d2">
            <h3 className="al-section-title">Discount Code</h3>
            <div className="al-field">
              <label className="al-label">Code (optional)</label>
              <span className="al-help">
                If using a code, ensure it is configured in your booking platform before activating this promotion. Planie will display the code to users at the point of booking.
              </span>
              <input
                type="text"
                className="al-input"
                placeholder="e.g. PLANIE20"
                value={form.discountCode}
                onChange={(e) => updateField("discountCode", e.target.value.toUpperCase())}
                style={{ textTransform: "uppercase", maxWidth: 280 }}
                maxLength={32}
              />
            </div>
          </section>

          {/* ── Applicable Occasions ── */}
          <section className="pd-card al-section pd-animate pd-d2">
            <h3 className="al-section-title">When does this offer apply?</h3>
            <div className="al-field">
              <label className="al-label">Applicable Occasions</label>
              <span className="al-help">
                Leave as <strong>All bookings</strong> to show this promotion to everyone, or restrict it to specific occasion types.
              </span>
              <div className="al-category-grid">
                <button
                  type="button"
                  className={`al-category-chip ${(form.applicableOccasions || []).length === 0 ? "al-category-chip--active" : ""}`}
                  onClick={() => updateField("applicableOccasions", [])}
                >
                  All bookings
                </button>
                {allOccasions.map((occ) => {
                  const active = (form.applicableOccasions || []).includes(occ);
                  return (
                    <button
                      key={occ}
                      type="button"
                      className={`al-category-chip ${active ? "al-category-chip--active" : ""}`}
                      onClick={() => toggleOccasion(occ)}
                    >
                      {occ}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ── Validity ── */}
          <section className="pd-card al-section pd-animate pd-d3">
            <h3 className="al-section-title">
              <Calendar size={18} strokeWidth={2} /> When is the promotion valid?
            </h3>
            <div className="al-field">
              <label className="al-label">Validity *</label>
              <div className="al-validity-row">
                {validityOptions.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    className={`al-category-chip ${form.validityType === v.id ? "al-category-chip--active" : ""}`}
                    onClick={() => updateField("validityType", v.id)}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            {form.validityType === "custom" && (
              <>
                <div className="al-field al-field--divided">
                  <label className="al-label">Date range *</label>
                  <span className="al-help">
                    The window during which this promotion runs. Choose <strong>All dates</strong> below for an open-ended offer.
                  </span>
                  <div className="al-row" style={{ marginBottom: 0 }}>
                    <div className="al-field al-field--half" style={{ marginBottom: 0 }}>
                      <label className="al-label">From{allDates ? "" : " *"}</label>
                      <input
                        type="date"
                        className="al-input"
                        value={form.validityFrom}
                        onChange={(e) => {
                          updateField("validityFrom", e.target.value);
                          if (e.target.value && allDates) setAllDates(false);
                        }}
                        required={!allDates}
                      />
                    </div>
                    <div className="al-field al-field--half" style={{ marginBottom: 0 }}>
                      <label className="al-label">To{allDates ? "" : " *"}</label>
                      <input
                        type="date"
                        className="al-input"
                        value={form.validityTo}
                        onChange={(e) => {
                          updateField("validityTo", e.target.value);
                          if (e.target.value && allDates) setAllDates(false);
                        }}
                        min={form.validityFrom || undefined}
                        required={!allDates}
                      />
                    </div>
                  </div>
                  <div className="al-validity-row" style={{ marginTop: 12 }}>
                    <button
                      type="button"
                      className={`al-category-chip ${allDates ? "al-category-chip--active" : ""}`}
                      onClick={toggleAllDates}
                    >
                      All dates
                    </button>
                  </div>
                </div>

                <div className="al-field al-field--divided">
                  <label className="al-label">Days & times *</label>
                  <span className="al-help">
                    Pick the days of the week the promotion is valid on, plus the time window each day. Use <strong>All days</strong> or <strong>All day</strong> for the whole week or full 24 hours.
                  </span>
                  <div className="al-days-row">
                    {daysOfWeek.map((d) => {
                      const active = (form.validityDays || []).includes(d);
                      return (
                        <button
                          key={d}
                          type="button"
                          className={`al-day-chip${active ? " al-day-chip--active" : ""}`}
                          onClick={() => toggleDay(d)}
                        >
                          {d}
                        </button>
                      );
                    })}
                  </div>
                  <div className="al-validity-row" style={{ marginTop: 12 }}>
                    <button
                      type="button"
                      className={`al-category-chip ${allDaysActive ? "al-category-chip--active" : ""}`}
                      onClick={toggleAllDays}
                    >
                      All days
                    </button>
                  </div>
                  {(form.validityDays || []).length === 0 && (
                    <span className="al-help" style={{ marginTop: 8, color: "#B45309" }}>
                      Select at least one day, or choose All days.
                    </span>
                  )}

                  <div className="al-row" style={{ marginTop: 18 }}>
                    <div className="al-field al-field--half" style={{ marginBottom: 0 }}>
                      <label className="al-label">Start time{allTimes ? "" : " *"}</label>
                      <input
                        type="time"
                        className="al-input"
                        value={form.validityTimeFrom}
                        onChange={(e) => {
                          updateField("validityTimeFrom", e.target.value);
                          if (e.target.value && allTimes) setAllTimes(false);
                        }}
                        required={!allTimes}
                      />
                    </div>
                    <div className="al-field al-field--half" style={{ marginBottom: 0 }}>
                      <label className="al-label">End time{allTimes ? "" : " *"}</label>
                      <input
                        type="time"
                        className="al-input"
                        value={form.validityTimeTo}
                        onChange={(e) => {
                          updateField("validityTimeTo", e.target.value);
                          if (e.target.value && allTimes) setAllTimes(false);
                        }}
                        min={form.validityTimeFrom || undefined}
                        required={!allTimes}
                      />
                    </div>
                  </div>
                  <div className="al-validity-row" style={{ marginTop: 12, marginBottom: 0 }}>
                    <button
                      type="button"
                      className={`al-category-chip ${allTimes ? "al-category-chip--active" : ""}`}
                      onClick={toggleAllTimes}
                    >
                      All day
                    </button>
                  </div>
                  <span className="al-help" style={{ marginTop: 8 }}>
                    e.g. Mon–Thu, 17:00 → 19:00 for a happy-hour promo.
                  </span>
                </div>
              </>
            )}
          </section>

          {/* ── Minimum booking size ── */}
          <section className="pd-card al-section pd-animate pd-d3">
            <h3 className="al-section-title">
              <Users size={18} strokeWidth={2} /> Minimum Booking Size
            </h3>
            <div className="al-field">
              <label className="al-label">Minimum people (optional)</label>
              <span className="al-help">
                Minimum number of people in the booking for this promotion to apply. Leave blank for no minimum.
              </span>
              <input
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                className="al-input"
                placeholder="e.g. 4"
                value={form.minBookingSize}
                onChange={(e) => updateField("minBookingSize", e.target.value)}
                style={{ maxWidth: 180 }}
              />
            </div>
          </section>

          {/* ── Promotion title ── */}
          <section className="pd-card al-section pd-animate pd-d4">
            <h3 className="al-section-title">Promotion Headline</h3>
            <div className="al-field">
              <label className="al-label">Promotion Title *</label>
              <span className="al-help">
                What the users will see — e.g. "20% off" or "Free dessert on date nights".
              </span>
              <input
                type="text"
                className="al-input"
                placeholder="20% off date nights"
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                maxLength={60}
                required
              />
              <span className="al-hint">{form.title.length}/60 characters</span>
            </div>
          </section>

          {/* ── Internal note ── */}
          <section className="pd-card al-section pd-animate pd-d4">
            <h3 className="al-section-title">Internal Note</h3>
            <div className="al-field">
              <label className="al-label">Note (optional)</label>
              <span className="al-help">
                Not shown to users — for your own reference (e.g. campaign source, end-of-quarter target).
              </span>
              <textarea
                className="al-textarea"
                rows={3}
                placeholder="Any context only your team needs to see…"
                value={form.internalNote}
                onChange={(e) => updateField("internalNote", e.target.value)}
              />
            </div>
          </section>

          {/* ── Submit row ── */}
          <div className="al-submit-row pd-animate pd-d4">
            <Link to="/partners/dashboard#promotions" className="pd-btn pd-btn--outline">
              Cancel
            </Link>
            <button
              type="button"
              className="pd-btn pd-btn--ghost al-submit-btn"
              onClick={handleSaveDraft}
              disabled={submitting || (!isEditing && selectedIds.length === 0)}
            >
              <FileText size={15} strokeWidth={2} />
              Save as Draft{!isEditing && selectedIds.length > 1 ? `s (${selectedIds.length})` : ""}
            </button>
            <button
              type="submit"
              className={`pd-btn pd-btn--primary al-submit-btn${submitting ? " is-busy" : ""}`}
              disabled={!canSubmit}
            >
              <Sparkles size={15} strokeWidth={2} />
              {submitting
                ? <>Submitting<span className="busy-dots" /></>
                : isEditing
                  ? form.status === "active" ? "Update & Resubmit" : "Submit for Review"
                  : selectedIds.length > 1
                    ? `Submit for ${selectedIds.length} venues`
                    : "Submit for Review"}
            </button>
          </div>
          {submitError && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#B91C1C", borderRadius: 12, padding: "10px 14px", fontSize: 14, marginTop: 12 }} role="alert">
              {submitError}
            </div>
          )}
        </form>
      </main>
    </div>
  );
}

function Sidebar() {
  const sidebarItems = buildSidebarItems(getTier());
  return (
    <aside className="pd-sidebar">
      <div>
        <Link to="/" className="pd-logo">
          <img src={PlanieLogo} alt="Planie" />
        </Link>
        <nav className="pd-nav">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.label} to={item.path} className="pd-nav-btn">
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
