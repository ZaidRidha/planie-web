import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
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
  Pencil,
  Globe2,
} from "lucide-react";
import PlanieLogo from "../Assets/Images/PlanieLogo2.png";
import {
  WINDOWS,
  SURFACES,
  CITIES,
  OCCASIONS,
  BUNDLE_PRICE,
  MULTI_SLOT_DISCOUNT_PCT,
  MULTI_SLOT_THRESHOLD,
  listInventoryForWindow,
  listOwned,
  purchaseSlot,
  purchaseBundle,
  getBundleSlots,
  subscribeInventory,
  subscribeOwned,
  getSurface,
  getWindow,
  windowPricing,
  assignListingsToPurchase,
  refreshInventory,
  refreshOwned,
  releaseCancelledCheckout,
} from "../utils/campaigns";
import { fetchMyListings } from "../utils/listings";
import { getTier, isFeatured, subscribeTier } from "../utils/subscription";
import "./PartnerDashboard.css";
import "./Campaigns.css";

/* Sidebar items — Campaigns is highlighted; non-Featured tiers see the badge */
const buildSidebarItems = (tier) => [
  { icon: LayoutDashboard, label: "Overview",    path: "/partners/dashboard#dashboard" },
  { icon: Store,           label: "Listings",    path: "/partners/dashboard#listings" },
  { icon: Megaphone,       label: "Promotions",  path: "/partners/dashboard#promotions" },
  {
    icon: Crown,
    label: "Campaigns",
    path: "/partners/campaigns",
    active: true,
    badge: !isFeatured(tier) ? "Featured" : null,
  },
  { icon: TrendingUp,      label: "Insights",    path: "/partners/dashboard#analytics" },
  { icon: Globe2,          label: "GEO",         path: "/partners/geo" },
  { icon: CreditCard,      label: "Billing",     path: "/partners/dashboard#billing" },
  { icon: Settings,        label: "Settings",    path: "/partners/dashboard#settings" },
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
          <Link to="/placements" className="cmp-cta-link">
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
  const [bundleOpen, setBundleOpen] = useState(false);
  const [bundleError, setBundleError] = useState(null);
  const [purchasing, setPurchasing] = useState(false);
  const [assignTargetId, setAssignTargetId] = useState(null);
  const [checkoutNotice, setCheckoutNotice] = useState(null); // "success" | "cancelled"
  const [searchParams, setSearchParams] = useSearchParams();

  /* Inventory subscription — bump a tick so memos recompute after refresh */
  const [inventoryTick, setInventoryTick] = useState(0);
  useEffect(() => subscribeInventory(() => setInventoryTick((t) => t + 1)), []);

  /* Load inventory for the selected window from the backend */
  useEffect(() => {
    refreshInventory(activeWindow).catch(() => {});
  }, [activeWindow]);

  /* Owned subscription + initial load */
  const [owned, setOwned] = useState(() => listOwned());
  useEffect(() => subscribeOwned(setOwned), []);
  useEffect(() => {
    refreshOwned().catch(() => {});
  }, []);

  /* The partner's real listings — for assignment + the campaign cards.
     Campaigns are bought FOR a Featured-tier listing (per-listing billing). */
  const [myListings, setMyListings] = useState([]);
  const [campaignListingId, setCampaignListingId] = useState(null);
  useEffect(() => {
    let cancelled = false;
    fetchMyListings()
      .then(({ items }) => {
        if (cancelled) return;
        const list = items || [];
        setMyListings(list);
        const featured = list.filter((l) => l.tier === "Featured" && l.status === "active");
        setCampaignListingId((prev) => prev || featured[0]?.id || null);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);
  const featuredListings = myListings.filter((l) => l.tier === "Featured" && l.status === "active");

  /* Stripe Checkout return: ?campaign=success | cancelled(&session_id=…) */
  useEffect(() => {
    const outcome = searchParams.get("campaign");
    if (!outcome) return;
    if (outcome === "cancelled") {
      releaseCancelledCheckout(searchParams.get("session_id")).then(() => {
        refreshInventory(activeWindow).catch(() => {});
      });
    }
    if (outcome === "success") {
      /* The webhook may land a moment after the redirect — refresh twice. */
      refreshOwned().catch(() => {});
      setTimeout(() => refreshOwned().catch(() => {}), 4000);
    }
    setCheckoutNotice(outcome);
    setSearchParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const inventory = useMemo(
    () => listInventoryForWindow(activeWindow).filter((s) => s.city === city),
    // inventoryTick is a sentinel that forces this memo to re-run after a
    // refresh replaces the cached inventory.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeWindow, city, inventoryTick]
  );

  const windowMeta = getWindow(activeWindow);
  const pricing = useMemo(() => windowPricing(activeWindow), [activeWindow]);

  const groupedBySurface = useMemo(() => {
    const map = {};
    for (const surface of SURFACES) map[surface.id] = [];
    for (const slot of inventory) map[slot.surfaceId]?.push(slot);
    return map;
  }, [inventory]);

  const purchaseFailureMessage = (result) => {
    if (result.reason === "sold_out") {
      const surface = result.soldOutSurfaceId ? getSurface(result.soldOutSurfaceId) : null;
      return surface
        ? `${surface.label} is sold out for this combination — try another occasion.`
        : "This slot just sold out — try another.";
    }
    if (result.reason === "payments_not_configured") {
      return "Payments aren't set up yet (Stripe configuration pending) — the slot was not charged or reserved.";
    }
    if (result.reason === "featured_required") {
      return "Campaigns are for Featured-tier listings — set this venue to Featured in Billing first.";
    }
    if (result.reason === "listing_required") {
      return "Select which Featured venue this campaign is for.";
    }
    return "Could not complete purchase.";
  };

  /* Both purchase paths end in a redirect to Stripe Checkout; the slot is
     held for 30 minutes while the partner pays. */
  const confirmPurchase = async () => {
    if (!purchaseTarget || purchasing) return;
    if (!campaignListingId) { setPurchaseError("Select which Featured venue this campaign is for."); return; }
    setPurchasing(true);
    const result = await purchaseSlot(purchaseTarget, campaignListingId);
    setPurchasing(false);
    if (result.ok) {
      window.location.assign(result.url);
    } else {
      setPurchaseError(purchaseFailureMessage(result));
      refreshInventory(activeWindow).catch(() => {});
    }
  };

  const confirmBundle = async (occasion) => {
    if (purchasing) return;
    if (!campaignListingId) { setBundleError("Select which Featured venue this campaign is for."); return; }
    setPurchasing(true);
    const result = await purchaseBundle({ windowId: activeWindow, city, occasion, listingId: campaignListingId });
    setPurchasing(false);
    if (result.ok) {
      window.location.assign(result.url);
    } else {
      setBundleError(purchaseFailureMessage(result));
      refreshInventory(activeWindow).catch(() => {});
    }
  };

  const assignTarget = useMemo(
    () => owned.find((p) => p.id === assignTargetId) || null,
    [assignTargetId, owned]
  );

  return (
    <>
      <header className="pd-anim pd-a1">
        <p className="nu-microlabel" style={{ marginBottom: 6 }}>Campaigns</p>
        <h1 style={{ fontFamily: "'Gabarito', sans-serif", margin: 0, fontWeight: 700, fontSize: 40, letterSpacing: "-0.02em" }}>Own the moment.</h1>
        <p style={{ margin: "12px 0 0", fontSize: 15, opacity: 0.6, maxWidth: "62ch" }}>
          Seasonal campaign slots put a Featured venue in front of a whole city — limited inventory per city per window.
        </p>
      </header>

      {checkoutNotice === "success" && (
        <div className="cmp-toast pd-anim pd-a1">
          <CheckCircle size={16} strokeWidth={1.8} />
          <span>
            Payment received — your campaign is under Active campaigns below.
            Assign a listing to it when you're ready.
          </span>
        </div>
      )}

      {checkoutNotice === "cancelled" && (
        <div className="cmp-callout cmp-callout--info pd-anim pd-a1">
          <Info size={15} strokeWidth={1.8} />
          <span>Checkout cancelled — nothing was charged and the slot was released.</span>
        </div>
      )}

      <ActiveCampaignsSection
        owned={owned}
        myListings={myListings}
        onEditListings={(id) => setAssignTargetId(id)}
      />

      {/* ── Available inventory ── */}
      <section className="cmp-section pd-anim pd-a2">
        <div className="cmp-section-head">
          <div>
            <h2 className="cmp-section-title">Available inventory</h2>
            <p className="cmp-section-sub">
              {windowMeta && (
                <>
                  <span>{windowMeta.label} {windowMeta.year}</span>
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

        {/* Which Featured venue this campaign is for (per-listing billing) */}
        <div className="cmp-callout cmp-callout--info" style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontWeight: 600 }}>Campaign for</span>
          {featuredListings.length === 0 ? (
            <span style={{ opacity: 0.7 }}>
              — no Featured venue yet. Set a listing to Featured in Billing to run campaigns.
            </span>
          ) : (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {featuredListings.map((l) => {
                const on = l.id === campaignListingId;
                return (
                  <button
                    key={l.id}
                    className={`al-category-chip${on ? " al-category-chip--active" : ""}`}
                    onClick={() => setCampaignListingId(l.id)}
                  >
                    {l.name}{on ? " ✓" : ""}
                  </button>
                );
              })}
            </div>
          )}
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
        <BundleCard
          windowMeta={windowMeta}
          pricing={pricing}
          city={city}
          onPurchase={() => { setBundleError(null); setBundleOpen(true); }}
        />

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
            price={pricing.surfacePrices[surface.id]}
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
              Valentine's window runs for 1 week — prices for that window are pro-rated to half (e.g. Homepage £{windowPricing("valentines").surfacePrices.homepage}, Bundle £{windowPricing("valentines").bundlePrice}).
            </p>
          </div>
        )}
      </section>

      {purchaseTarget && (
        <PurchaseModal
          slot={purchaseTarget}
          windowMeta={getWindow(purchaseTarget.windowId)}
          surface={getSurface(purchaseTarget.surfaceId)}
          price={windowPricing(purchaseTarget.windowId).surfacePrices[purchaseTarget.surfaceId]}
          error={purchaseError}
          busy={purchasing}
          onClose={() => { setPurchaseTarget(null); setPurchaseError(null); }}
          onConfirm={confirmPurchase}
        />
      )}

      {bundleOpen && (
        <BundleModal
          windowMeta={windowMeta}
          pricing={pricing}
          city={city}
          error={bundleError}
          busy={purchasing}
          onClose={() => { setBundleOpen(false); setBundleError(null); }}
          onConfirm={confirmBundle}
        />
      )}

      {assignTarget && (
        <AssignListingsModal
          purchase={assignTarget}
          myListings={myListings}
          onClose={() => setAssignTargetId(null)}
          onSave={async (listingIds) => {
            await assignListingsToPurchase(assignTarget.id, listingIds);
            setAssignTargetId(null);
          }}
        />
      )}
    </>
  );
}

/* ──────────────────────  Active campaigns  ────────────────────── */
function ActiveCampaignsSection({ owned, myListings, onEditListings }) {
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
          const listings = (p.listingIds || [])
            .map((id) => myListings.find((l) => l.id === id))
            .filter(Boolean);
          const expired = p.status === "Expired";
          const processing = p.status === "Processing";
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
                <div>
                  <Calendar size={13} strokeWidth={1.7} />{" "}
                  {p.windowLabel || windowMeta?.label} · {p.windowStart} → {p.windowEnd}
                </div>
              </div>

              <div className="cmp-active-card-listings">
                {listings.length > 0 ? (
                  <>
                    <div className="cmp-active-listings-label">Featuring</div>
                    <div className="cmp-active-listings-tags">
                      {listings.map((l) => (
                        <span key={l.id} className="cmp-active-listing-tag">{l.name}</span>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="cmp-active-listings-empty">
                    No listing assigned yet
                  </div>
                )}
                {!expired && !processing && (
                  <button
                    type="button"
                    className="cmp-active-listings-btn"
                    onClick={() => onEditListings(p.id)}
                  >
                    <Pencil size={12} strokeWidth={1.8} />
                    {listings.length > 0 ? "Change listing" : "Assign listing"}
                  </button>
                )}
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
          <span className="cmp-window-tab-label">{w.label} {w.year}</span>
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
          placeholder="Search city…"
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
function BundleCard({ windowMeta, pricing, city, onPurchase }) {
  if (!windowMeta || !pricing) return null;
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
          <span className="cmp-bundle-price-strike">£{pricing.bundleListPrice}</span>
          <span className="cmp-bundle-price-now">£{pricing.bundlePrice}</span>
        </div>
        <span className="cmp-bundle-save">Save £{pricing.bundleSaving}</span>
        <button className="pd-btn pd-btn--fill cmp-bundle-btn" onClick={onPurchase}>
          Purchase bundle
        </button>
      </div>
    </article>
  );
}

/* ───────────────────────  Surface group  ─────────────────────── */
function SurfaceGroup({ surface, slots, windowMeta, price, onPurchase }) {
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
            <p className="cmp-surface-sub">£{price} {surface.perOccasion ? "per occasion" : ""} · {windowMeta?.durationLabel} slot</p>
          </div>
        </div>
        <span className="cmp-surface-availability">{totalRemaining} of {totalCapacity} remaining</span>
      </header>

      <div className="cmp-slot-grid">
        {slots.map((slot) => (
          <SlotCard key={slot.id} slot={slot} surface={surface} windowMeta={windowMeta} price={price} onPurchase={onPurchase} />
        ))}
      </div>
    </div>
  );
}

function SlotCard({ slot, surface, windowMeta, price, onPurchase }) {
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
        <div className="cmp-slot-price">£{price}</div>
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
function PurchaseModal({ slot, surface, windowMeta, price, error, busy, onClose, onConfirm }) {
  return (
    <div className="cmp-modal-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="cmp-modal" onClick={(e) => e.stopPropagation()}>
        <button className="cmp-modal-close" onClick={onClose} aria-label="Close">
          <X size={16} />
        </button>
        <h2 className="cmp-modal-title">Confirm purchase</h2>
        <p className="cmp-modal-sub">
          You'll be redirected to Stripe to pay. The slot is held for you for
          30 minutes; cancelling releases it.
        </p>

        <div className="cmp-modal-summary">
          <SummaryRow label="Surface" value={surface?.label || ""} />
          {slot.occasion && <SummaryRow label="Occasion" value={slot.occasion} />}
          <SummaryRow label="City" value={slot.city} />
          <SummaryRow label="Window" value={`${windowMeta?.label} ${windowMeta?.year} (${windowMeta?.durationLabel})`} />
          <SummaryRow label="Dates" value={`${windowMeta?.start} → ${windowMeta?.end}`} />
          <SummaryRow label="Price" value={`£${price}`} highlight />
        </div>

        {error && <div className="cmp-modal-error">{error}</div>}

        <div className="cmp-modal-actions">
          <button className="pd-btn pd-btn--ghost" onClick={onClose}>Cancel</button>
          <button className="pd-btn pd-btn--fill" disabled={busy} onClick={onConfirm}>
            {busy ? "Opening checkout…" : "Continue to payment"}
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

/* ───────────────────  Assign listing modal  ─────────────────── */
function AssignListingsModal({ purchase, myListings, onClose, onSave }) {
  /* Only approved (active) listings can front a paid placement. */
  /* Only Featured, active venues can front a paid campaign placement. */
  const allListings = myListings.filter((l) => l.status === "active" && l.tier === "Featured");
  const surface = getSurface(purchase.surfaceId);
  const windowMeta = getWindow(purchase.windowId);
  const isBundle = Boolean(purchase.bundleId);

  const [selected, setSelected] = useState(() => (purchase.listingIds || [])[0] || null);
  const [saving, setSaving] = useState(false);

  return (
    <div className="cmp-modal-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="cmp-modal cmp-modal--wide" onClick={(e) => e.stopPropagation()}>
        <button className="cmp-modal-close" onClick={onClose} aria-label="Close">
          <X size={16} />
        </button>
        <h2 className="cmp-modal-title">Choose a listing to feature</h2>
        <p className="cmp-modal-sub">
          {isBundle
            ? "This listing will run across all 3 surfaces in your bundle."
            : `This listing will appear in your ${surface?.label} placement.`}
          {windowMeta && ` ${windowMeta.label} ${windowMeta.year} · ${purchase.city}.`}
        </p>

        <div className="cmp-assign-list" role="radiogroup">
          {allListings.length === 0 && (
            <div className="cmp-active-listings-empty">
              You need an approved (active) listing before you can assign one —
              submit a listing from the dashboard first.
            </div>
          )}
          {allListings.map((l) => {
            const checked = selected === l.id;
            return (
              <button
                type="button"
                key={l.id}
                role="radio"
                aria-checked={checked}
                className={`cmp-assign-row${checked ? " cmp-assign-row--on" : ""}`}
                onClick={() => setSelected(l.id)}
              >
                <span className={`cmp-assign-radio${checked ? " cmp-assign-radio--on" : ""}`}>
                  {checked && <span className="cmp-assign-radio-dot" />}
                </span>
                <span className="cmp-assign-row-main">
                  <span className="cmp-assign-row-name">{l.name}</span>
                  <span className="cmp-assign-row-meta">{l.category} · {l.city}</span>
                </span>
                <span className={`cmp-assign-row-status cmp-assign-row-status--${l.status}`}>
                  {l.status}
                </span>
              </button>
            );
          })}
        </div>

        <div className="cmp-modal-actions">
          <button className="pd-btn pd-btn--ghost" onClick={onClose}>
            {selected ? "Cancel" : "Skip for now"}
          </button>
          <button
            className="pd-btn pd-btn--fill"
            disabled={!selected || saving}
            onClick={async () => {
              setSaving(true);
              await onSave(selected ? [selected] : []);
              setSaving(false);
            }}
          >
            {saving ? "Saving…" : "Save listing"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────  Bundle modal  ─────────────────────── */
function BundleModal({ windowMeta, pricing, city, error, busy, onClose, onConfirm }) {
  const [occasion, setOccasion] = useState(OCCASIONS[0]);
  const [tick, setTick] = useState(0);

  /* Re-read inventory on changes so availability badges stay live */
  useEffect(() => subscribeInventory(() => setTick((t) => t + 1)), []);

  const slots = useMemo(
    () => getBundleSlots({ windowId: windowMeta?.id, city, occasion }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [windowMeta?.id, city, occasion, tick]
  );

  const anySoldOut = slots.some((s) => !s || s.remaining <= 0);

  return (
    <div className="cmp-modal-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="cmp-modal cmp-modal--wide" onClick={(e) => e.stopPropagation()}>
        <button className="cmp-modal-close" onClick={onClose} aria-label="Close">
          <X size={16} />
        </button>
        <div className="cmp-modal-bundle-head">
          <Crown size={18} strokeWidth={1.7} className="cmp-modal-bundle-crown" />
          <div>
            <h2 className="cmp-modal-title">Confirm bundle purchase</h2>
            <p className="cmp-modal-sub">
              All 3 surfaces for the same slot in {city}. You'll be redirected
              to Stripe to pay; the slots are held for 30 minutes.
            </p>
          </div>
        </div>

        <div className="cmp-bundle-step">
          <div className="cmp-bundle-step-label">Choose an occasion</div>
          <div className="cmp-bundle-occasion-grid">
            {OCCASIONS.map((o) => (
              <button
                key={o}
                type="button"
                className={`cmp-bundle-occasion${occasion === o ? " cmp-bundle-occasion--on" : ""}`}
                onClick={() => setOccasion(o)}
              >
                {o}
              </button>
            ))}
          </div>
          <p className="cmp-bundle-step-hint">
            Homepage Strip is city-wide. Category Page and AI Guide will run for the occasion you choose.
          </p>
        </div>

        <div className="cmp-bundle-summary">
          {SURFACES.map((surface, i) => {
            const slot = slots[i];
            const sold = !slot || slot.remaining <= 0;
            return (
              <div key={surface.id} className={`cmp-bundle-leg${sold ? " cmp-bundle-leg--sold" : ""}`}>
                <div className="cmp-bundle-leg-main">
                  <span className="cmp-bundle-leg-name">{surface.label}</span>
                  <span className="cmp-bundle-leg-detail">
                    {surface.perOccasion ? occasion : "City-wide"} · £{pricing?.surfacePrices[surface.id]}
                  </span>
                </div>
                <span className={`cmp-bundle-leg-status${sold ? " cmp-bundle-leg-status--sold" : ""}`}>
                  {sold ? "Sold out" : `${slot.remaining} of ${slot.capacity}`}
                </span>
              </div>
            );
          })}
          <div className="cmp-bundle-totals">
            <div className="cmp-bundle-totals-row">
              <span>List price</span>
              <span className="cmp-bundle-totals-strike">£{pricing?.bundleListPrice}</span>
            </div>
            <div className="cmp-bundle-totals-row cmp-bundle-totals-row--final">
              <span>Bundle price</span>
              <span>£{pricing?.bundlePrice}</span>
            </div>
            <div className="cmp-bundle-totals-row cmp-bundle-totals-row--save">
              <span>You save</span>
              <span>£{pricing?.bundleSaving}</span>
            </div>
          </div>
        </div>

        <div className="cmp-modal-summary-meta">
          <SummaryRow label="City" value={city} />
          <SummaryRow label="Window" value={`${windowMeta?.label} ${windowMeta?.year} (${windowMeta?.durationLabel})`} />
          <SummaryRow label="Dates" value={`${windowMeta?.start} → ${windowMeta?.end}`} />
        </div>

        {error && <div className="cmp-modal-error">{error}</div>}

        <div className="cmp-modal-actions">
          <button className="pd-btn pd-btn--ghost" onClick={onClose}>Cancel</button>
          <button
            className="pd-btn pd-btn--fill"
            disabled={anySoldOut || busy}
            onClick={() => onConfirm(occasion)}
          >
            {anySoldOut ? "Pick another occasion" : busy ? "Opening checkout…" : "Confirm bundle & pay"}
          </button>
        </div>
      </div>
    </div>
  );
}

