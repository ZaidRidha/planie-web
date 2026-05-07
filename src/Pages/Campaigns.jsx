import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Store,
  Megaphone,
  TrendingUp,
  CreditCard,
  Settings,
  LogOut,
  Lock,
  Crown,
  Home,
  LayoutGrid,
  Sparkles,
  Calendar,
  MapPin,
  CheckCircle,
  Info,
  ChevronDown,
  X,
  ArrowRight,
  Search,
} from "lucide-react";
import PlanieLogo from "../Assets/Images/PlanieLogo2.png";
import {
  WINDOWS,
  SURFACES,
  CITIES,
  BUNDLE_PRICE,
  BUNDLE_LIST_PRICE,
  BUNDLE_SAVING,
  MULTI_SLOT_DISCOUNT_PCT,
  MULTI_SLOT_THRESHOLD,
  listInventoryForWindow,
  listOwned,
  purchaseSlot,
  subscribeInventory,
  subscribeOwned,
  getSurface,
  getWindow,
} from "../utils/campaigns";
import {
  TIERS,
  getTier,
  setTier,
  isFeatured,
  subscribeTier,
} from "../utils/subscription";
import "./PartnerDashboard.css";
import "./Campaigns.css";

/* Sidebar items — Campaigns is highlighted; non-Featured tiers see the badge */
const buildSidebarItems = (tier) => [
  { icon: LayoutDashboard, label: "Dashboard",  path: "/partners/dashboard" },
  { icon: Store,           label: "My Listings", path: "/partners/dashboard" },
  { icon: Megaphone,       label: "Promotions",  path: "/partners/dashboard#promotions" },
  {
    icon: Crown,
    label: "Campaigns",
    path: "/partners/campaigns",
    active: true,
    badge: !isFeatured(tier) ? "Featured" : null,
  },
  { icon: TrendingUp,      label: "Analytics",   path: "/partners/dashboard" },
  { icon: CreditCard,      label: "Billing",     path: "/partners/dashboard" },
  { icon: Settings,        label: "Settings",    path: "/partners/dashboard" },
];

const surfaceIcon = (id) => (id === "homepage" ? Home : id === "category" ? LayoutGrid : Sparkles);

export default function Campaigns() {
  const [tier, setTierState] = useState(() => getTier());
  useEffect(() => subscribeTier(setTierState), []);

  const featured = isFeatured(tier);
  const sidebarItems = buildSidebarItems(tier);

  return (
    <div className="pd-layout">
      <Sidebar items={sidebarItems} />
      <main className="pd-main">
        <DemoTierSwitcher tier={tier} />
        {featured ? <ActiveState /> : <UpsellState />}
      </main>
    </div>
  );
}

/* ─────────────────────────  Sidebar  ───────────────────────── */
function Sidebar({ items }) {
  return (
    <aside className="pd-sidebar">
      <div>
        <Link to="/" className="pd-logo">
          <img src={PlanieLogo} alt="Planie" />
        </Link>
        <nav className="pd-nav">
          {items.map((item) => {
            const Icon = item.icon;
            const cls = `pd-nav-btn${item.active ? " pd-nav-btn--on" : ""}`;
            return (
              <Link key={item.label} to={item.path} className={cls}>
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

/* ─────────────────  Demo tier switcher (mock infra)  ───────────────── */
function DemoTierSwitcher({ tier }) {
  return (
    <div className="cmp-demo-tier" role="group" aria-label="Demo tier switcher">
      <span className="cmp-demo-tier-label">Demo tier</span>
      <div className="cmp-demo-tier-options">
        {TIERS.map((t) => (
          <button
            key={t}
            type="button"
            className={`cmp-demo-tier-pill${tier === t ? " cmp-demo-tier-pill--on" : ""}`}
            onClick={() => setTier(t)}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   UPSELL STATE — Listed / Partner tiers
   ════════════════════════════════════════════════════════════════ */
function UpsellState() {
  const features = [
    { icon: Home,       title: "Homepage Strip",     body: "Featured placement on the Planie home screen. Visible to every user who opens the app in your city during your campaign window." },
    { icon: LayoutGrid, title: "Category Pages",     body: "Top-of-page placement in the occasion category that matches your venue — Date Night, Groups, Families, or Experiences." },
    { icon: Sparkles,   title: "AI Guide Placement", body: "Featured in Planie's AI-generated local guides for your occasion type — e.g. Best Date Night spots in London." },
  ];

  const benefits = [
    { title: "Limited inventory",       body: "Genuine scarcity — your placement actually stands out." },
    { title: "2-week slots",             body: "Concentrated visibility during the moments that matter most." },
    { title: "Featured venues only",     body: "Competitors on lower tiers cannot buy these placements." },
  ];

  return (
    <>
      {/* Hero */}
      <section className="cmp-hero pd-anim pd-a1">
        <div className="cmp-hero-lock">
          <Lock size={22} strokeWidth={1.8} />
        </div>
        <h1 className="cmp-hero-title">Campaign Slots</h1>
        <p className="cmp-hero-sub">
          Put your venue in front of thousands of Planie users at exactly the right moment.
        </p>
      </section>

      {/* Surface tiles */}
      <section className="cmp-tiles pd-anim pd-a2">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <article key={f.title} className="cmp-tile">
              <div className="cmp-tile-icon">
                <Icon size={20} strokeWidth={1.7} />
              </div>
              <h3 className="cmp-tile-title">{f.title}</h3>
              <p className="cmp-tile-body">{f.body}</p>
            </article>
          );
        })}
      </section>

      {/* Upgrade CTA */}
      <section className="cmp-cta pd-anim pd-a3">
        <Crown size={18} strokeWidth={1.7} className="cmp-cta-crown" />
        <h2 className="cmp-cta-title">Available exclusively to Featured venues</h2>
        <p className="cmp-cta-body">
          Campaign slots are purchased separately and available only to venues on the Featured plan.
          Upgrade to Featured to access seasonal campaign inventory across all three surfaces.
        </p>
        <div className="cmp-cta-actions">
          <Link to="/partners/dashboard#billing" className="pd-btn pd-btn--fill">
            Upgrade to Featured
            <ArrowRight size={15} strokeWidth={2} />
          </Link>
          <Link to="/partners#pricing" className="cmp-cta-link">
            See what's included in Featured
          </Link>
        </div>
      </section>

      {/* Why campaigns? */}
      <section className="cmp-why pd-anim pd-a3">
        <h3 className="cmp-why-title">Why campaigns?</h3>
        <div className="cmp-why-grid">
          {benefits.map((b) => (
            <div key={b.title} className="cmp-why-item">
              <CheckCircle size={16} strokeWidth={1.8} className="cmp-why-icon" />
              <div>
                <h4 className="cmp-why-item-title">{b.title}</h4>
                <p className="cmp-why-item-body">{b.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

/* ════════════════════════════════════════════════════════════════
   ACTIVE STATE — Featured tier
   ════════════════════════════════════════════════════════════════ */
function ActiveState() {
  const [activeWindow, setActiveWindow] = useState(WINDOWS[0].id);
  const [city, setCity] = useState(CITIES[0]);
  const [pricingOpen, setPricingOpen] = useState(false);
  const [purchaseTarget, setPurchaseTarget] = useState(null);
  const [purchaseError, setPurchaseError] = useState(null);
  const [justPurchasedId, setJustPurchasedId] = useState(null);

  /* Inventory subscription — bump a tick so memos recompute after purchase */
  const [inventoryTick, setInventoryTick] = useState(0);
  useEffect(() => subscribeInventory(() => setInventoryTick((t) => t + 1)), []);

  /* Owned subscription */
  const [owned, setOwned] = useState(() => listOwned());
  useEffect(() => subscribeOwned(setOwned), []);

  const inventory = useMemo(
    () => listInventoryForWindow(activeWindow).filter((s) => s.city === city),
    // inventoryTick is a sentinel that forces this memo to re-run after a
    // purchase mutates the in-memory inventory store.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeWindow, city, inventoryTick]
  );

  const windowMeta = getWindow(activeWindow);

  const groupedBySurface = useMemo(() => {
    const map = {};
    for (const surface of SURFACES) map[surface.id] = [];
    for (const slot of inventory) map[slot.surfaceId]?.push(slot);
    return map;
  }, [inventory]);

  const confirmPurchase = () => {
    if (!purchaseTarget) return;
    const result = purchaseSlot(purchaseTarget.id);
    if (result.ok) {
      setJustPurchasedId(result.purchase.id);
      setPurchaseTarget(null);
      setPurchaseError(null);
      setTimeout(() => setJustPurchasedId(null), 4000);
    } else {
      setPurchaseError(result.reason === "sold_out" ? "This slot just sold out — try another." : "Could not complete purchase.");
    }
  };

  return (
    <>
      <header className="pd-head pd-anim pd-a1">
        <div>
          <h1 className="pd-title">Campaigns</h1>
          <p className="pd-subtitle">
            Purchase seasonal campaign slots to feature your venue across Planie's key surfaces.
            Featured venues only — limited inventory per city per window.
          </p>
        </div>
      </header>

      {justPurchasedId && (
        <div className="cmp-toast pd-anim pd-a1">
          <CheckCircle size={16} strokeWidth={1.8} />
          <span>Slot reserved — see it under Active campaigns below.</span>
        </div>
      )}

      <ActiveCampaignsSection owned={owned} />

      {/* ── Available inventory ── */}
      <section className="cmp-section pd-anim pd-a2">
        <div className="cmp-section-head">
          <div>
            <h2 className="cmp-section-title">Available inventory</h2>
            <p className="cmp-section-sub">
              {windowMeta && (
                <>
                  <span>{windowMeta.label}</span>
                  <span className="cmp-dot">·</span>
                  <span>{windowMeta.start} → {windowMeta.end}</span>
                  <span className="cmp-dot">·</span>
                  <span>{windowMeta.durationLabel} slots</span>
                </>
              )}
            </p>
          </div>
          <CitySearch value={city} onChange={setCity} />
        </div>

        <WindowTabs active={activeWindow} onChange={setActiveWindow} />

        {windowMeta?.durationDays === 7 && (
          <div className="cmp-callout cmp-callout--info">
            <Info size={15} strokeWidth={1.8} />
            <span>
              <strong>Valentine's slots run for 1 week</strong> — pricing reflects the shorter window.
            </span>
          </div>
        )}

        {/* Bundle highlight */}
        <BundleCard windowMeta={windowMeta} city={city} />

        {/* Multi-slot discount callout */}
        <div className="cmp-callout cmp-callout--accent">
          <Sparkles size={15} strokeWidth={1.8} />
          <span>
            <strong>{MULTI_SLOT_DISCOUNT_PCT}% off</strong> when you purchase {MULTI_SLOT_THRESHOLD} or
            more consecutive slots in the same window.
          </span>
        </div>

        {/* Inventory grid by surface */}
        {SURFACES.map((surface) => (
          <SurfaceGroup
            key={surface.id}
            surface={surface}
            slots={groupedBySurface[surface.id] || []}
            windowMeta={windowMeta}
            onPurchase={(slot) => { setPurchaseError(null); setPurchaseTarget(slot); }}
          />
        ))}
      </section>

      {/* Pricing reference */}
      <section className="cmp-section pd-anim pd-a3">
        <button
          className="cmp-pricing-toggle"
          onClick={() => setPricingOpen((v) => !v)}
          aria-expanded={pricingOpen}
        >
          <span className="cmp-pricing-toggle-label">Pricing reference</span>
          <ChevronDown
            size={16}
            className={`cmp-pricing-chev${pricingOpen ? " cmp-pricing-chev--open" : ""}`}
          />
        </button>
        {pricingOpen && (
          <div className="cmp-pricing-body">
            <PricingRow label="Homepage Strip" detail="per 2-week slot, per city" price="£149" />
            <PricingRow label="Category Page" detail="per occasion, per 2-week slot" price="£99" />
            <PricingRow label="AI Guide Placement" detail="per occasion, per 2-week slot" price="£79" />
            <PricingRow
              label="Full Campaign Bundle"
              detail="all 3 surfaces, same slot, same city"
              price={`£${BUNDLE_PRICE}`}
              highlight
            />
            <p className="cmp-pricing-note">
              Valentine's window runs for 1 week — pricing applies to the same per-slot rate for that window.
            </p>
          </div>
        )}
      </section>

      {purchaseTarget && (
        <PurchaseModal
          slot={purchaseTarget}
          windowMeta={getWindow(purchaseTarget.windowId)}
          surface={getSurface(purchaseTarget.surfaceId)}
          error={purchaseError}
          onClose={() => { setPurchaseTarget(null); setPurchaseError(null); }}
          onConfirm={confirmPurchase}
        />
      )}
    </>
  );
}

/* ──────────────────────  Active campaigns  ────────────────────── */
function ActiveCampaignsSection({ owned }) {
  if (!owned.length) {
    return (
      <section className="cmp-section pd-anim pd-a1">
        <h2 className="cmp-section-title">Active campaigns</h2>
        <div className="cmp-empty">
          <Calendar size={20} strokeWidth={1.6} />
          <div>
            <p className="cmp-empty-title">No active campaigns yet</p>
            <p className="cmp-empty-sub">Browse available slots below to get started.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="cmp-section pd-anim pd-a1">
      <h2 className="cmp-section-title">Active campaigns</h2>
      <div className="cmp-active-grid">
        {owned.map((p) => {
          const surface = getSurface(p.surfaceId);
          const windowMeta = getWindow(p.windowId);
          const SurfIcon = surfaceIcon(p.surfaceId);
          return (
            <article key={p.id} className={`cmp-active-card cmp-active-card--${p.status.toLowerCase()}`}>
              <div className="cmp-active-card-top">
                <div className="cmp-active-card-icon"><SurfIcon size={16} strokeWidth={1.7} /></div>
                <span className={`cmp-active-status cmp-active-status--${p.status.toLowerCase()}`}>{p.status}</span>
              </div>
              <h3 className="cmp-active-card-title">
                {surface?.label}{p.occasion ? ` · ${p.occasion}` : ""}
              </h3>
              <div className="cmp-active-card-meta">
                <div><MapPin size={13} strokeWidth={1.7} /> {p.city}</div>
                <div><Calendar size={13} strokeWidth={1.7} /> {windowMeta?.label} · {windowMeta?.start} → {windowMeta?.end}</div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

/* ───────────────────────  Window tabs  ─────────────────────── */
function WindowTabs({ active, onChange }) {
  return (
    <div className="cmp-window-tabs" role="tablist">
      {WINDOWS.map((w) => (
        <button
          key={w.id}
          role="tab"
          aria-selected={active === w.id}
          className={`cmp-window-tab${active === w.id ? " cmp-window-tab--on" : ""}`}
          onClick={() => onChange(w.id)}
        >
          <span className="cmp-window-tab-label">{w.label}</span>
          <span className="cmp-window-tab-meta">{w.durationLabel}</span>
        </button>
      ))}
    </div>
  );
}

function CitySearch({ value, onChange }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const wrapRef = React.useRef(null);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CITIES.slice(0, 8);
    return CITIES.filter((c) => c.toLowerCase().includes(q)).slice(0, 8);
  }, [query]);

  /* Close on outside click */
  useEffect(() => {
    if (!open) return undefined;
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, [open]);

  /* Reset highlight when matches change */
  useEffect(() => { setHighlight(0); }, [query]);

  const select = (city) => {
    onChange(city);
    setQuery("");
    setOpen(false);
  };

  const handleKey = (e) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(matches.length - 1, h + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(0, h - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (matches[highlight]) select(matches[highlight]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="cmp-city-search" ref={wrapRef}>
      <div className="cmp-city-search-input-wrap">
        <Search size={14} strokeWidth={1.8} className="cmp-city-search-icon" />
        <input
          type="text"
          className="cmp-city-search-input"
          placeholder={value ? `Search city — currently ${value}` : "Search city…"}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKey}
          role="combobox"
          aria-label="Search city"
          aria-expanded={open}
          aria-controls="cmp-city-search-listbox"
          aria-autocomplete="list"
        />
        {value && !query && (
          <span className="cmp-city-search-tag">
            <MapPin size={11} strokeWidth={2} />
            {value}
          </span>
        )}
      </div>

      {open && matches.length > 0 && (
        <ul id="cmp-city-search-listbox" className="cmp-city-search-menu" role="listbox">
          {matches.map((c, i) => (
            <li key={c} role="option" aria-selected={i === highlight}>
              <button
                type="button"
                className={`cmp-city-search-option${i === highlight ? " cmp-city-search-option--on" : ""}${c === value ? " cmp-city-search-option--current" : ""}`}
                onMouseEnter={() => setHighlight(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => select(c)}
              >
                <MapPin size={13} strokeWidth={1.7} />
                <span>{c}</span>
                {c === value && <span className="cmp-city-search-current">Selected</span>}
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && matches.length === 0 && (
        <div className="cmp-city-search-empty">No cities match "{query}".</div>
      )}
    </div>
  );
}

/* ───────────────────────  Bundle card  ─────────────────────── */
function BundleCard({ windowMeta, city }) {
  if (!windowMeta) return null;
  return (
    <article className="cmp-bundle">
      <div className="cmp-bundle-left">
        <div className="cmp-bundle-icon"><Crown size={18} strokeWidth={1.7} /></div>
        <div>
          <h3 className="cmp-bundle-title">Full Campaign Bundle</h3>
          <p className="cmp-bundle-sub">
            All 3 surfaces · {city} · {windowMeta.start} → {windowMeta.end}
          </p>
        </div>
      </div>
      <div className="cmp-bundle-right">
        <div className="cmp-bundle-price">
          <span className="cmp-bundle-price-strike">£{BUNDLE_LIST_PRICE}</span>
          <span className="cmp-bundle-price-now">£{BUNDLE_PRICE}</span>
        </div>
        <span className="cmp-bundle-save">Save £{BUNDLE_SAVING}</span>
      </div>
    </article>
  );
}

/* ───────────────────────  Surface group  ─────────────────────── */
function SurfaceGroup({ surface, slots, windowMeta, onPurchase }) {
  const Icon = surfaceIcon(surface.id);
  const totalRemaining = slots.reduce((s, x) => s + x.remaining, 0);
  const totalCapacity = slots.reduce((s, x) => s + x.capacity, 0);

  return (
    <div className="cmp-surface">
      <header className="cmp-surface-head">
        <div className="cmp-surface-head-left">
          <div className="cmp-surface-icon"><Icon size={16} strokeWidth={1.7} /></div>
          <div>
            <h3 className="cmp-surface-title">{surface.label}</h3>
            <p className="cmp-surface-sub">£{surface.price} {surface.perOccasion ? "per occasion" : ""} · {windowMeta?.durationLabel} slot</p>
          </div>
        </div>
        <span className="cmp-surface-availability">{totalRemaining} of {totalCapacity} remaining</span>
      </header>

      <div className="cmp-slot-grid">
        {slots.map((slot) => (
          <SlotCard key={slot.id} slot={slot} surface={surface} windowMeta={windowMeta} onPurchase={onPurchase} />
        ))}
      </div>
    </div>
  );
}

function SlotCard({ slot, surface, windowMeta, onPurchase }) {
  const soldOut = slot.remaining <= 0;
  const pct = (slot.remaining / slot.capacity) * 100;
  const lowStock = !soldOut && pct <= 30;

  return (
    <article className={`cmp-slot${soldOut ? " cmp-slot--sold-out" : ""}`}>
      <div className="cmp-slot-top">
        <div>
          {slot.occasion && <div className="cmp-slot-occasion">{slot.occasion}</div>}
          <div className="cmp-slot-window">{windowMeta?.start} → {windowMeta?.end}</div>
        </div>
        <div className="cmp-slot-price">£{surface.price}</div>
      </div>

      <div className="cmp-slot-availability">
        <div className="cmp-slot-progress">
          <div className="cmp-slot-progress-bar" style={{ width: `${pct}%` }} />
        </div>
        <span className={`cmp-slot-remaining${lowStock ? " cmp-slot-remaining--low" : ""}`}>
          {soldOut ? "Sold out" : `${slot.remaining} of ${slot.capacity} remaining`}
        </span>
      </div>

      <button
        className={`pd-btn ${soldOut ? "pd-btn--ghost cmp-slot-btn--disabled" : "pd-btn--fill"} cmp-slot-btn`}
        disabled={soldOut}
        onClick={() => onPurchase(slot)}
      >
        {soldOut ? "Sold out" : "Purchase"}
      </button>
    </article>
  );
}

function PricingRow({ label, detail, price, highlight }) {
  return (
    <div className={`cmp-pricing-row${highlight ? " cmp-pricing-row--highlight" : ""}`}>
      <div>
        <div className="cmp-pricing-row-label">{label}</div>
        <div className="cmp-pricing-row-detail">{detail}</div>
      </div>
      <div className="cmp-pricing-row-price">{price}</div>
    </div>
  );
}

/* ───────────────────────  Purchase modal  ─────────────────────── */
function PurchaseModal({ slot, surface, windowMeta, error, onClose, onConfirm }) {
  return (
    <div className="cmp-modal-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="cmp-modal" onClick={(e) => e.stopPropagation()}>
        <button className="cmp-modal-close" onClick={onClose} aria-label="Close">
          <X size={16} />
        </button>
        <h2 className="cmp-modal-title">Confirm purchase</h2>
        <p className="cmp-modal-sub">
          Payment will continue through your existing billing flow.
        </p>

        <div className="cmp-modal-summary">
          <SummaryRow label="Surface" value={surface?.label || ""} />
          {slot.occasion && <SummaryRow label="Occasion" value={slot.occasion} />}
          <SummaryRow label="City" value={slot.city} />
          <SummaryRow label="Window" value={`${windowMeta?.label} (${windowMeta?.durationLabel})`} />
          <SummaryRow label="Dates" value={`${windowMeta?.start} → ${windowMeta?.end}`} />
          <SummaryRow label="Price" value={`£${surface?.price}`} highlight />
        </div>

        {error && <div className="cmp-modal-error">{error}</div>}

        <div className="cmp-modal-actions">
          <button className="pd-btn pd-btn--ghost" onClick={onClose}>Cancel</button>
          <button className="pd-btn pd-btn--fill" onClick={onConfirm}>
            Confirm &amp; continue to billing
          </button>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, highlight }) {
  return (
    <div className={`cmp-summary-row${highlight ? " cmp-summary-row--highlight" : ""}`}>
      <span className="cmp-summary-row-label">{label}</span>
      <span className="cmp-summary-row-value">{value}</span>
    </div>
  );
}

