import React, { useState, useMemo } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  LogOut,
  LayoutDashboard,
  Store,
  TrendingUp,
  Settings,
  CreditCard,
  CheckCircle,
  Tag,
  Percent,
  Gift,
  Pencil,
  Calendar,
  Users,
  AlertCircle,
  FileText,
  Megaphone,
  Sparkles,
} from "lucide-react";
import PlanieLogo from "../Assets/Images/PlanieLogo2.png";
import {
  emptyPromotion,
  getPromotion,
  savePromotion,
  publishPromotion,
  deactivatePromotion,
} from "../utils/promotions";
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
  { id: "date_range", label: "Date range" },
  { id: "days_of_week", label: "Specific days of the week" },
];

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/partners/dashboard" },
  { icon: Store, label: "My Listings", path: "/partners/dashboard" },
  { icon: Megaphone, label: "Promotions", path: "/partners/dashboard#promotions" },
  { icon: TrendingUp, label: "Analytics", path: "/partners/dashboard" },
  { icon: CreditCard, label: "Billing", path: "/partners/dashboard" },
  { icon: Settings, label: "Settings", path: "/partners/dashboard" },
];

/* mock listing names → slugs (mirrors PartnerDashboard listings + EditListing mockListings) */
const knownListings = [
  { slug: "sunset-rooftop-bar", name: "Sunset Rooftop Bar" },
  { slug: "desert-safari-tours", name: "Desert Safari Tours" },
  { slug: "coastal-yoga-retreat", name: "Coastal Yoga Retreat" },
  { slug: "old-town-walking-tour", name: "Old Town Walking Tour" },
  { slug: "neon-night-market", name: "Neon Night Market" },
];

export default function AddPromotion() {
  const navigate = useNavigate();
  const { id: editId } = useParams();
  const [searchParams] = useSearchParams();
  const queryListing = searchParams.get("listing") || "";

  const existing = editId ? getPromotion(editId) : null;
  const isEditing = Boolean(existing);

  const [form, setForm] = useState(() => {
    if (existing) return { ...existing, listingSlug: existing.listingSlug };
    return { ...emptyPromotion(), listingSlug: queryListing };
  });

  /* Multi-listing selection — only used when creating new */
  const [selectedSlugs, setSelectedSlugs] = useState(() => {
    if (existing) return [existing.listingSlug];
    return queryListing ? [queryListing] : [];
  });

  const [conflicts, setConflicts] = useState([]); // [{ slug, name, conflict }]
  const [savedState, setSavedState] = useState(null); // 'draft' | 'published'

  const listingName = useMemo(() => {
    if (!isEditing) return "";
    const found = knownListings.find((l) => l.slug === form.listingSlug);
    return found?.name || "";
  }, [form.listingSlug, isEditing]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleSlug = (slug) => {
    setSelectedSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const allSelected = selectedSlugs.length === knownListings.length;
  const toggleAll = () => {
    setSelectedSlugs(allSelected ? [] : knownListings.map((l) => l.slug));
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

  const targetSlugs = isEditing ? [form.listingSlug] : selectedSlugs;

  const handleSaveDraft = () => {
    if (targetSlugs.length === 0) return;
    if (isEditing) {
      const saved = savePromotion({ ...form, status: "draft" });
      setForm(saved);
    } else {
      targetSlugs.forEach((slug) => {
        savePromotion({ ...form, id: "", listingSlug: slug, status: "draft" });
      });
    }
    setSavedState("draft");
  };

  const handlePublish = () => {
    if (targetSlugs.length === 0) return;

    if (isEditing) {
      const saved = savePromotion({ ...form, status: form.status });
      const result = publishPromotion(saved.id);
      if (!result.ok && result.reason === "conflict") {
        const venue = knownListings.find((l) => l.slug === saved.listingSlug);
        setForm(saved);
        setConflicts([{ slug: saved.listingSlug, name: venue?.name || saved.listingSlug, conflict: result.conflict, promoId: saved.id }]);
        return;
      }
      setForm({ ...saved, status: "active" });
      setSavedState("published");
      return;
    }

    /* Multi-listing publish: save one promo per slug, then publish each */
    const saved = targetSlugs.map((slug) =>
      savePromotion({ ...form, id: "", listingSlug: slug, status: "draft" })
    );
    const issues = [];
    saved.forEach((s) => {
      const result = publishPromotion(s.id);
      if (!result.ok && result.reason === "conflict") {
        const venue = knownListings.find((l) => l.slug === s.listingSlug);
        issues.push({
          slug: s.listingSlug,
          name: venue?.name || s.listingSlug,
          conflict: result.conflict,
          promoId: s.id,
        });
      }
    });
    if (issues.length > 0) {
      setConflicts(issues);
      return;
    }
    setSavedState("published");
  };

  const handleResolveConflicts = () => {
    if (conflicts.length === 0) return;
    conflicts.forEach((c) => {
      deactivatePromotion(c.conflict.id);
      publishPromotion(c.promoId);
    });
    setConflicts([]);
    setSavedState("published");
  };

  /* ── Success state ── */
  if (savedState) {
    const isPublished = savedState === "published";
    const venueCount = isEditing ? 1 : selectedSlugs.length;
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
                ? venueCount > 1 ? `Live across ${venueCount} venues` : "Promotion Live"
                : venueCount > 1 ? `${venueCount} drafts saved` : "Draft Saved"}
            </h2>
            <p>
              {isPublished
                ? venueCount > 1
                  ? "Your promotion is now live across each selected venue in Planie Discovery and itineraries. Each venue's promo can be edited or deactivated individually."
                  : "Your promotion is live and now appears alongside your venue card in Planie Discovery and itineraries."
                : "Your draft is saved. Come back any time to finish setting up and publish."}
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
            <h1 className="pd-greeting">{isEditing ? "Edit Promotion" : "Create a Promotion"}</h1>
            <p className="pd-greeting-sub">
              {isEditing && listingName
                ? `For ${listingName}`
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
                Only one promotion can be active per listing. Deactivate the existing offer
                {conflicts.length > 1 ? "s" : ""} to publish this one
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
              <button className="pd-btn pd-btn--ghost" onClick={() => setConflicts([])}>
                Cancel
              </button>
              <button className="pd-btn pd-btn--primary" onClick={handleResolveConflicts}>
                Deactivate & publish
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
                  <span>{listingName || form.listingSlug}</span>
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
                  Pick one venue, several, or all of them. We'll create a copy of this promotion for each selected listing — they can be edited or deactivated individually later.
                </span>
                <div className="al-category-grid">
                  {knownListings.map((l) => {
                    const active = selectedSlugs.includes(l.slug);
                    return (
                      <button
                        key={l.slug}
                        type="button"
                        className={`al-category-chip ${active ? "al-category-chip--active" : ""}`}
                        onClick={() => toggleSlug(l.slug)}
                      >
                        {l.name}
                      </button>
                    );
                  })}
                </div>
                {selectedSlugs.length === 0 && (
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

            {form.validityType === "date_range" && (
              <div className="al-row al-field--divided">
                <div className="al-field al-field--half" style={{ marginBottom: 0 }}>
                  <label className="al-label">From *</label>
                  <input
                    type="date"
                    className="al-input"
                    value={form.validityFrom}
                    onChange={(e) => updateField("validityFrom", e.target.value)}
                    required
                  />
                </div>
                <div className="al-field al-field--half" style={{ marginBottom: 0 }}>
                  <label className="al-label">To *</label>
                  <input
                    type="date"
                    className="al-input"
                    value={form.validityTo}
                    onChange={(e) => updateField("validityTo", e.target.value)}
                    min={form.validityFrom || undefined}
                    required
                  />
                </div>
              </div>
            )}

            {form.validityType === "days_of_week" && (
              <div className="al-field al-field--divided">
                <label className="al-label">Days *</label>
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
              </div>
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
            <h3 className="al-section-title">How should travelers see this offer?</h3>
            <div className="al-field">
              <label className="al-label">Promotion Title *</label>
              <span className="al-help">
                Short, clear, and benefit-led — this is what users see in the app. e.g. "20% off" or "Free dessert on date nights".
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
              disabled={!isEditing && selectedSlugs.length === 0}
            >
              <FileText size={15} strokeWidth={2} />
              Save as Draft{!isEditing && selectedSlugs.length > 1 ? `s (${selectedSlugs.length})` : ""}
            </button>
            <button
              type="submit"
              className="pd-btn pd-btn--primary al-submit-btn"
              disabled={!isEditing && selectedSlugs.length === 0}
            >
              <Sparkles size={15} strokeWidth={2} />
              {isEditing
                ? form.status === "active" ? "Update & Republish" : "Publish Promotion"
                : selectedSlugs.length > 1
                  ? `Publish to ${selectedSlugs.length} venues`
                  : "Publish Promotion"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

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
            return (
              <Link key={item.label} to={item.path} className="pd-nav-btn">
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
