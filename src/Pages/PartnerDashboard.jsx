import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  MousePointerClick,
  TrendingUp,
  CalendarCheck,
  Plus,
  Pencil,
  MapPin,
  Star,
  ChevronRight,
  LogOut,
  LayoutDashboard,
  Store,
  Settings,
  CreditCard,
  CheckCircle,
  Download,
  Crown,
  Calendar,
  AlertCircle,
  Search,
  Filter,
  MoreVertical,
  Trash2,
  Clock,
  Shield,
  ChevronDown,
  Pause,
  Play,
  FileText,
  Megaphone,
  Sparkles,
  Tag,
  Percent,
  Gift,
  Globe2,
  MessageSquare,
  Check,
} from "lucide-react";
import PlanieLogo from "../Assets/Images/PlanieLogoNew.svg";
import { listDrafts, deleteDraft, subscribeDrafts } from "../utils/listingDrafts";
import {
  fetchMyPromotions,
  deletePromotion,
  updatePromotion,
  deactivatePromotion,
  reactivatePromotion,
} from "../utils/promotions";
import {
  getTier,
  isFeatured,
  subscribeTier,
  fetchBilling,
  startListingCheckout,
  changeListingPlan,
  openBillingPortal,
} from "../utils/subscription";
import {
  fetchMyListings,
  deactivateListing,
  reactivateListing,
  deleteListing,
  toCardShape,
} from "../utils/listings";
import { usePartnerAuth } from "../Context/PartnerAuthContext";
import VerificationBanner from "../Components/VerificationBanner";
import "./PartnerDashboard.css";

/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Animated counter ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */
function useCounter(end, duration = 1400, delay = 0) {
  const [value, setValue] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    const t = setTimeout(() => {
      const t0 = performance.now();
      const tick = (now) => {
        const p = Math.min((now - t0) / duration, 1);
        setValue(Math.floor((1 - Math.pow(1 - p, 3)) * end));
        if (p < 1) raf.current = requestAnimationFrame(tick);
      };
      raf.current = requestAnimationFrame(tick);
    }, delay);
    return () => { clearTimeout(t); if (raf.current) cancelAnimationFrame(raf.current); };
  }, [end, duration, delay]);
  return value;
}

/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Performance chart ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const views = [320, 480, 390, 620, 540, 710, 680];
const clicks = [85, 130, 110, 195, 160, 220, 200];

// eslint-disable-next-line no-unused-vars
function PerfChart() {
  const w = 560, h = 200, px = 44, py = 16;
  const iw = w - px * 2, ih = h - py * 2;
  const maxV = Math.max(...views);

  const pt = (d, i) => ({
    x: px + (i / (d.length - 1)) * iw,
    y: py + ih - (d[i] / maxV) * ih,
  });
  const line = (d) => d.map((_, i) => { const {x,y}=pt(d,i); return `${i?'L':'M'}${x},${y}`; }).join(" ");
  const area = (d) => {
    const l = line(d), last = pt(d, d.length-1), first = pt(d, 0);
    return `${l} L${last.x},${h-py} L${first.x},${h-py} Z`;
  };

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="pd-chart">
      <defs>
        <linearGradient id="vGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF4040" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#FF4040" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="cGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#11181C" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#11181C" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map((f) => {
        const y = py + ih - f * ih;
        return (
          <g key={f}>
            <line x1={px} y1={y} x2={w-px} y2={y} stroke="#F0F0F3" strokeWidth="1" />
            <text x={px-8} y={y+3.5} textAnchor="end" className="pd-chart-lbl">{Math.round(f*maxV)}</text>
          </g>
        );
      })}
      {days.map((d, i) => (
        <text key={d} x={px+(i/(days.length-1))*iw} y={h-1} textAnchor="middle" className="pd-chart-lbl">{d}</text>
      ))}
      <path d={area(views)} fill="url(#vGrad)" className="pd-chart-area" />
      <path d={area(clicks)} fill="url(#cGrad)" className="pd-chart-area" />
      <path d={line(views)} fill="none" stroke="#FF4040" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="pd-chart-line" />
      <path d={line(clicks)} fill="none" stroke="#11181C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.25" className="pd-chart-line" />
      {views.map((_, i) => { const {x,y}=pt(views,i); return <circle key={i} cx={x} cy={y} r="3" fill="#fff" stroke="#FF4040" strokeWidth="1.5" className="pd-chart-dot" style={{animationDelay:`${i*0.07+0.6}s`}} />; })}
    </svg>
  );
}

/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Donut ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */
const sources = [
  { label: "Discovery Page", value: 42, color: "#FF4040" },
  { label: "AI Itineraries", value: 31, color: "#11181C" },
  { label: "Direct Search", value: 18, color: "#D1D5DB" },
  { label: "Shared Links", value: 9, color: "#F0F0F3" },
];

function Donut({ size = 160, data = sources }) {
  const sw = 18, r = (size - sw) / 2, c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <svg width={size} height={size}>
      {/* background track */}
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F5F5F8" strokeWidth={sw} />
      {data.map((s, i) => {
        const dash = (s.value / 100) * c;
        const off = -acc * (c / 100) + c * 0.25;
        acc += s.value;
        return (
          <circle key={i} cx={size/2} cy={size/2} r={r} fill="none"
            stroke={s.color} strokeWidth={sw}
            strokeDasharray={`${dash} ${c - dash}`}
            strokeDashoffset={off}
            className="pd-donut-seg" style={{ animationDelay: `${i*0.12+0.3}s` }} />
        );
      })}
    </svg>
  );
}

/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Helpers ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */
/* Loads the signed-in partner's real listings; null while loading. */
function useMyListings() {
  const [items, setItems] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const reload = useCallback(async () => {
    try {
      const { items: raw } = await fetchMyListings();
      setItems((raw ?? []).map(toCardShape));
      setLoadError(null);
    } catch (err) {
      setItems([]);
      setLoadError(err.message || "Could not load listings.");
    }
  }, []);
  useEffect(() => { reload(); }, [reload]);
  return { items, loadError, reload };
}

/* Loads the signed-in partner's real promotions; null while loading.
   Pass enabled=false when the data arrives via props instead. */
function useMyPromotions(enabled = true) {
  const [items, setItems] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const reload = useCallback(async () => {
    if (!enabled) return;
    try {
      const { items: raw } = await fetchMyPromotions();
      setItems(raw ?? []);
      setLoadError(null);
    } catch (err) {
      setItems([]);
      setLoadError(err.message || "Could not load promotions.");
    }
  }, [enabled]);
  useEffect(() => { reload(); }, [reload]);
  return { items, loadError, reload };
}

/* The form fields a promotion round-trips through partnerUpdatePromotion.
   Needed because "submit for review" resends content alongside the flag. */
const promoFormFields = (p) => ({
  title: p.title || "",
  offerType: p.offerType || "",
  discountValue: p.discountValue || "",
  discountCode: p.discountCode || "",
  applicableOccasions: p.applicableOccasions || [],
  validityType: p.validityType || "always",
  validityFrom: p.validityFrom || "",
  validityTo: p.validityTo || "",
  validityDays: p.validityDays || [],
  validityTimeFrom: p.validityTimeFrom || "",
  validityTimeTo: p.validityTimeTo || "",
  minBookingSize: p.minBookingSize || "",
  internalNote: p.internalNote || "",
});

/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Legacy mock data (Analytics tab only ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â Phase 6 replaces it) ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */
const listings = [
  { name: "Sunset Rooftop Bar", category: "Restaurant & Bar", location: "Marrakech, Morocco", rating: 4.8, views: 1240, clicks: 340, bookings: 47, conversionRate: 3.8, status: "active", created: "Jan 15, 2026", description: "A stunning rooftop bar with panoramic views of the Marrakech medina. Craft cocktails & live music." },
  { name: "Desert Safari Tours", category: "Activity & Tour", location: "Dubai, UAE", rating: 4.9, views: 2100, clicks: 580, bookings: 92, conversionRate: 4.4, status: "active", created: "Dec 3, 2025", description: "Thrilling desert safaris with dune bashing, camel rides, and traditional Bedouin camp dinners." },
  { name: "Coastal Yoga Retreat", category: "Wellness & Spa", location: "Bali, Indonesia", rating: 4.7, views: 860, clicks: 210, bookings: 28, conversionRate: 3.3, status: "pending", created: "Feb 22, 2026", description: "A beachfront wellness retreat offering daily yoga, meditation sessions, and organic cuisine." },
  { name: "Old Town Walking Tour", category: "Activity & Tour", location: "Prague, Czech Republic", rating: 4.6, views: 1520, clicks: 410, bookings: 63, conversionRate: 4.1, status: "active", created: "Nov 18, 2025", description: "Discover hidden gems and centuries of history on this expertly guided walking tour." },
  { name: "Neon Night Market", category: "Shopping & Market", location: "Bangkok, Thailand", rating: 4.5, views: 680, clicks: 190, bookings: 15, conversionRate: 2.2, status: "inactive", created: "Mar 1, 2026", description: "Bangkok's most vibrant night market with street food, local crafts, and live entertainment." },
];

const navItems = [
  { icon: LayoutDashboard, label: "Overview" },
  { icon: Store, label: "Listings" },
  { icon: Megaphone, label: "Promotions" },
  { icon: Crown, label: "Campaigns", external: "/partners/campaigns" },
  { icon: TrendingUp, label: "Insights" },
  { icon: Globe2, label: "GEO", external: "/partners/geo" },
  { icon: CreditCard, label: "Billing" },
  { icon: Settings, label: "Settings" },
];

/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Billing: tier catalog copy (prices come live from Stripe) ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */
const TIER_PLANS = [
  {
    tier: "Listed",
    features: ["Listings in the Planie app", "Promotions on your listings", "Staff-reviewed publishing", "Email support"],
  },
  {
    tier: "Partner",
    popular: true,
    features: ["Everything in Listed", "Priority placement in Featured", "Priority listing review", "Priority support"],
  },
  {
    tier: "Featured",
    features: ["Everything in Partner", "Access to Campaigns", "Top placement in Featured", "Dedicated support"],
  },
];

const fmtMoney = (amount, currency) =>
  amount == null
    ? null
    : new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: (currency || "eur").toUpperCase(),
      }).format(amount / 100);

const fmtUnixDate = (unix) =>
  unix
    ? new Date(unix * 1000).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
    : null;

/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Analytics data ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */
const monthLabels = ["Feb 5","Feb 12","Feb 19","Feb 26","Mar 5","Mar 12","Mar 19","Mar 26","Apr 2","Apr 9","Apr 16","Apr 23"];
const monthViews = [1800,2200,1950,2600,2400,3100,2800,3400,3200,3600,3900,4200];
const monthClicks = [420,530,470,640,580,760,690,850,780,900,960,1020];
const monthConversions = [85,110,95,130,120,155,140,175,160,185,198,210];

/* Deterministic per-listing time series derived from each listing's share */
function buildListingSeries(listing) {
  const active = listings.filter((l) => l.status === "active");
  const totalViews = active.reduce((s, l) => s + l.views, 0) || 1;
  const totalClicks = active.reduce((s, l) => s + l.clicks, 0) || 1;
  const totalBookings = active.reduce((s, l) => s + l.bookings, 0) || 1;
  const seed = listing.name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const jitter = (i, phase) => 0.78 + ((Math.sin(seed * 0.13 + i * 1.31 + phase) + 1) / 2) * 0.44;
  const viewsShare = listing.views / totalViews;
  const clicksShare = listing.clicks / totalClicks;
  const bookingsShare = listing.bookings / totalBookings;
  return {
    views: monthViews.map((v, i) => Math.max(1, Math.round(v * viewsShare * jitter(i, 0)))),
    clicks: monthClicks.map((v, i) => Math.max(1, Math.round(v * clicksShare * jitter(i, 1.7)))),
    conversions: monthConversions.map((v, i) => Math.max(0, Math.round(v * bookingsShare * jitter(i, 3.4)))),
  };
}

const genderData = [
  { label: "Female", value: 54, color: "#FF4040" },
  { label: "Male", value: 43, color: "#11181C" },
  { label: "Non-binary", value: 3, color: "#D1D5DB" },
];

const ageData = [
  { label: "18ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“24", views: 710, pct: 14 },
  { label: "25ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“34", views: 1920, pct: 38 },
  { label: "35ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“44", views: 1210, pct: 24 },
  { label: "45ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“54", views: 760, pct: 15 },
  { label: "55ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“64", views: 300, pct: 6 },
  { label: "65+", views: 150, pct: 3 },
];

const topAffinities = [
  { source: "Luxury Travel", visits: 1640, change: "+18%" },
  { source: "Foodie Experiences", visits: 1280, change: "+24%" },
  { source: "Adventure Tourism", visits: 940, change: "+11%" },
  { source: "Wellness & Retreats", visits: 620, change: "+7%" },
  { source: "Culture & History", visits: 410, change: "-2%" },
];

const visitorOrigin = [
  { country: "United States", views: 1420, pct: 28 },
  { country: "United Kingdom", views: 890, pct: 17 },
  { country: "France", views: 720, pct: 14 },
  { country: "Germany", views: 580, pct: 11 },
  { country: "UAE", views: 460, pct: 9 },
  { country: "Others", views: 1130, pct: 21 },
];

/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Analytics Chart ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */
function AnalyticsLineChart({ labels, datasets, height = 220 }) {
  const w = 680, h = height, px = 48, py = 20;
  const iw = w - px * 2, ih = h - py * 2;
  const allVals = datasets.flatMap((d) => d.data);
  const maxV = Math.max(...allVals);
  const svgRef = useRef(null);
  const [hoverIdx, setHoverIdx] = useState(null);

  const pt = (data, i) => ({
    x: px + (i / (data.length - 1)) * iw,
    y: py + ih - (data[i] / maxV) * ih,
  });

  const buildLine = (data) =>
    data.map((_, i) => { const { x, y } = pt(data, i); return `${i ? "L" : "M"}${x},${y}`; }).join(" ");

  const buildArea = (data) => {
    const l = buildLine(data);
    const last = pt(data, data.length - 1);
    const first = pt(data, 0);
    return `${l} L${last.x},${h - py} L${first.x},${h - py} Z`;
  };

  const handleMove = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * w;
    const frac = Math.max(0, Math.min(1, (svgX - px) / iw));
    const idx = Math.round(frac * (labels.length - 1));
    setHoverIdx(idx);
  };

  const ttWidth = 150;
  const ttLineH = 16;
  const ttPad = 10;
  const ttHeight = ttPad * 2 + ttLineH * (datasets.length + 1);
  let ttX = 0;
  let ttY = 0;
  if (hoverIdx !== null) {
    const hoverX = px + (hoverIdx / (labels.length - 1)) * iw;
    ttX = hoverX + 14;
    if (ttX + ttWidth > w - 4) ttX = hoverX - ttWidth - 14;
    const minY = datasets.reduce((m, ds) => Math.min(m, pt(ds.data, hoverIdx).y), Infinity);
    ttY = Math.max(py, Math.min(h - py - ttHeight, minY - ttHeight / 2));
  }

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${w} ${h}`}
      className="pd-an-chart"
      onMouseMove={handleMove}
      onMouseLeave={() => setHoverIdx(null)}
    >
      <defs>
        {datasets.map((ds, di) => (
          <linearGradient key={di} id={`anGrad${di}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ds.color} stopOpacity="0.08" />
            <stop offset="100%" stopColor={ds.color} stopOpacity="0" />
          </linearGradient>
        ))}
      </defs>

      {[0, 0.25, 0.5, 0.75, 1].map((f) => {
        const y = py + ih - f * ih;
        return (
          <g key={f}>
            <line x1={px} y1={y} x2={w - px} y2={y} stroke="#F0F0F3" strokeWidth="1" />
            <text x={px - 8} y={y + 3.5} textAnchor="end" className="pd-chart-lbl">
              {maxV >= 1000 ? `${(Math.round(f * maxV) / 1000).toFixed(1)}k` : Math.round(f * maxV)}
            </text>
          </g>
        );
      })}

      {labels.map((label, i) => {
        if (i % 2 !== 0 && labels.length > 8) return null;
        const x = px + (i / (labels.length - 1)) * iw;
        return (
          <text key={label} x={x} y={h - 1} textAnchor="middle" className="pd-chart-lbl">{label}</text>
        );
      })}

      {datasets.map((ds, di) => (
        <g key={di}>
          <path d={buildArea(ds.data)} fill={`url(#anGrad${di})`} className="pd-chart-area" />
          <path
            d={buildLine(ds.data)}
            fill="none"
            stroke={ds.color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={di === 0 ? 1 : 0.5}
            className="pd-chart-line"
          />
          {ds.data.map((_, i) => {
            const { x, y } = pt(ds.data, i);
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="3"
                fill="#fff"
                stroke={ds.color}
                strokeWidth="1.5"
                className="pd-chart-dot"
                style={{ animationDelay: `${i * 0.04 + 0.6 + di * 0.2}s` }}
              />
            );
          })}
        </g>
      ))}

      {hoverIdx !== null && (
        <g className="pd-an-chart-hover" pointerEvents="none">
          <line
            x1={px + (hoverIdx / (labels.length - 1)) * iw}
            x2={px + (hoverIdx / (labels.length - 1)) * iw}
            y1={py}
            y2={h - py}
            stroke="#11181C"
            strokeOpacity="0.12"
            strokeDasharray="3 3"
          />
          {datasets.map((ds, di) => {
            const p = pt(ds.data, hoverIdx);
            return (
              <circle key={di} cx={p.x} cy={p.y} r="5" fill="#fff" stroke={ds.color} strokeWidth="2" />
            );
          })}
          <g transform={`translate(${ttX},${ttY})`}>
            <rect
              width={ttWidth}
              height={ttHeight}
              rx="8"
              fill="#11181C"
              opacity="0.95"
            />
            <text x={ttPad} y={ttPad + 11} className="pd-an-tt-title">
              {labels[hoverIdx]}
            </text>
            {datasets.map((ds, di) => (
              <g key={di} transform={`translate(${ttPad},${ttPad + ttLineH * (di + 1) + 6})`}>
                <circle cx="4" cy="0" r="4" fill={ds.color} />
                <text x="14" y="0" className="pd-an-tt-label">{ds.label}</text>
                <text x={ttWidth - ttPad * 2} y="0" className="pd-an-tt-value" textAnchor="end">
                  {ds.data[hoverIdx].toLocaleString()}
                </text>
              </g>
            ))}
          </g>
        </g>
      )}

      <rect
        x={px}
        y={py}
        width={iw}
        height={ih}
        fill="transparent"
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIdx(null)}
      />
    </svg>
  );
}

/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Horizontal Bar Chart ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */
function HBarChart({ data, maxVal }) {
  return (
    <div className="pd-an-hbar-list">
      {data.map((d) => (
        <div key={d.label || d.country || d.source} className="pd-an-hbar-row">
          <span className="pd-an-hbar-label">{d.label || d.country || d.source}</span>
          <div className="pd-an-hbar-track">
            <div
              className="pd-an-hbar-fill"
              style={{ width: `${((d.value || d.pct || 0) / maxVal) * 100}%`, background: d.color || "#FF4040" }}
            />
          </div>
          <span className="pd-an-hbar-val">{d.value || d.pct}%</span>
        </div>
      ))}
    </div>
  );
}

/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Analytics Tab ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */
const timeRanges = ["7 Days", "30 Days", "90 Days"];

function AnalyticsTab() {
  const [place, setPlace] = useState("All listings");
  const H = { fontFamily: "'Gabarito', sans-serif" };
  const ages = [
    { label: "18–24", pct: 22, color: "#FF4040" }, { label: "25–34", pct: 38, color: "#1C1114" },
    { label: "35–44", pct: 21, color: "#1C1114" }, { label: "45–54", pct: 12, color: "#1C1114" },
    { label: "55+", pct: 7, color: "#1C1114" },
  ];
  const origins = [
    { label: "Local (<5km)", pct: 46, color: "#FF4040" }, { label: "Visiting the city", pct: 28, color: "#1C1114" },
    { label: "Tourists", pct: 16, color: "#1C1114" }, { label: "Business trips", pct: 10, color: "#1C1114" },
  ];
  const asks = [
    { rank: 1, quote: "Somewhere for a relaxed date night", visits: 214, trend: "+12%", up: true },
    { rank: 2, quote: "Good food, not too loud", visits: 168, trend: "+8%", up: true },
    { rank: 3, quote: "A spot for a small group dinner", visits: 121, trend: "+3%", up: true },
    { rank: 4, quote: "Late-night, walkable from the river", visits: 74, trend: "−2%", up: false },
  ];
  const parties = [
    { label: "Couples", pct: 44, color: "#FF4040" }, { label: "Small groups", pct: 31, color: "#1C1114" },
    { label: "Solo", pct: 15, color: "rgba(28,17,20,0.5)" }, { label: "Families", pct: 10, color: "rgba(28,17,20,0.25)" },
  ];
  const surfaces = [
    { name: "For You", value: "1,240", share: 80, barColor: "#FF4040", note: "Personalised home picks" },
    { name: "Category", value: "540", share: 42, barColor: "#1C1114", note: "Occasion category pages" },
    { name: "AI Guide", value: "310", share: 24, barColor: "#1C1114", note: "AI-generated local guides" },
  ];
  return (
    <>
      <header className="pd-anim pd-a1">
        <p className="nu-microlabel" style={{ marginBottom: 6 }}>Insights</p>
        <h1 style={{ ...H, margin: 0, fontWeight: 700, fontSize: 40, letterSpacing: "-0.02em" }}>Who Planie sends you.</h1>
        <p style={{ margin: "12px 0 0", fontSize: 15, opacity: 0.6, maxWidth: "62ch" }}>The people arriving through plans — where they came from, and what they were really looking for. <strong>Sample data</strong> until the Insights platform goes live.</p>
      </header>

      <div className="pd-anim pd-a2" style={{ marginTop: 30, display: "inline-flex", padding: 4, borderRadius: 100, background: "rgba(28,17,20,0.05)", flexWrap: "wrap" }}>
        {["All listings", "My venue"].map((t) => (
          <button key={t} onClick={() => setPlace(t)} style={{ fontFamily: "'Instrument Sans', sans-serif", fontSize: 13.5, fontWeight: 600, cursor: "pointer", border: "none", padding: "9px 18px", borderRadius: 100, background: place === t ? "#1C1114" : "transparent", color: place === t ? "#FAF7F1" : "#1C1114", transition: "all 0.25s" }}>{t}</button>
        ))}
      </div>

      <section className="pd-anim pd-a2" style={{ marginTop: 32 }}>
        <p style={{ ...H, margin: 0, fontWeight: 700, fontSize: "clamp(22px,2.4vw,30px)", letterSpacing: "-0.015em", lineHeight: 1.25, maxWidth: "30ch" }}>Mostly locals in their late twenties, planning a relaxed night out.</p>
      </section>

      <section className="pd-anim pd-a3" style={{ marginTop: 40, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%,300px),1fr))", gap: 44 }}>
        <div>
          <h2 style={{ ...H, margin: "0 0 4px", fontWeight: 700, fontSize: 19, letterSpacing: "-0.015em" }}>Age</h2>
          <p style={{ margin: "0 0 18px", fontSize: 13, opacity: 0.5 }}>Who plans included you this month.</p>
          {ages.map((a) => (
            <div key={a.label} style={{ display: "grid", gridTemplateColumns: "52px 1fr 44px", alignItems: "center", gap: 12, padding: "6px 0" }}>
              <span style={{ fontSize: 13.5, fontWeight: 600 }}>{a.label}</span>
              <div style={{ height: 6, borderRadius: 3, background: "rgba(28,17,20,0.07)", overflow: "hidden" }}><div style={{ width: `${a.pct}%`, height: "100%", borderRadius: 3, background: a.color }} /></div>
              <span style={{ fontSize: 13, opacity: 0.55, textAlign: "right" }}>{a.pct}%</span>
            </div>
          ))}
        </div>
        <div>
          <h2 style={{ ...H, margin: "0 0 4px", fontWeight: 700, fontSize: 19, letterSpacing: "-0.015em" }}>Where they come from</h2>
          <p style={{ margin: "0 0 18px", fontSize: 13, opacity: 0.5 }}>Distance and travel intent.</p>
          {origins.map((o) => (
            <div key={o.label} style={{ display: "grid", gridTemplateColumns: "110px 1fr 44px", alignItems: "center", gap: 12, padding: "6px 0" }}>
              <span style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o.label}</span>
              <div style={{ height: 6, borderRadius: 3, background: "rgba(28,17,20,0.07)", overflow: "hidden" }}><div style={{ width: `${o.pct}%`, height: "100%", borderRadius: 3, background: o.color }} /></div>
              <span style={{ fontSize: 13, opacity: 0.55, textAlign: "right" }}>{o.pct}%</span>
            </div>
          ))}
        </div>
      </section>

      <section className="pd-anim pd-a3" style={{ marginTop: 52 }}>
        <h2 style={{ ...H, margin: "0 0 4px", fontWeight: 700, fontSize: 19, letterSpacing: "-0.015em" }}>What they asked Planie for</h2>
        <p style={{ margin: "0 0 20px", fontSize: 13, opacity: 0.5 }}>The desires behind the plans that included you — ranked by volume.</p>
        {asks.map((ak) => (
          <div key={ak.rank} style={{ display: "flex", alignItems: "baseline", gap: 18, padding: "15px 4px", borderBottom: "1px solid rgba(28,17,20,0.08)" }}>
            <span style={{ ...H, fontWeight: 700, fontSize: 15, opacity: 0.35, minWidth: 20 }}>{ak.rank}</span>
            <p style={{ margin: 0, fontSize: 15.5, fontWeight: 600, flex: 1, minWidth: 0 }}>“{ak.quote}”</p>
            <span style={{ fontSize: 13, opacity: 0.5, whiteSpace: "nowrap" }}>{ak.visits} plans</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: ak.up ? "#15803d" : "#FF4040", whiteSpace: "nowrap", minWidth: 44, textAlign: "right" }}>{ak.trend}</span>
          </div>
        ))}
      </section>

      <section className="pd-anim pd-a3" style={{ marginTop: 52 }}>
        <h2 style={{ ...H, margin: "0 0 4px", fontWeight: 700, fontSize: 19, letterSpacing: "-0.015em" }}>Who they came with</h2>
        <p style={{ margin: "0 0 20px", fontSize: 13, opacity: 0.5 }}>Party composition across plans that placed you.</p>
        <div style={{ display: "flex", height: 14, borderRadius: 8, overflow: "hidden", gap: 3 }}>
          {parties.map((p) => <div key={p.label} style={{ width: `${p.pct}%`, background: p.color }} />)}
        </div>
        <div style={{ marginTop: 14, display: "flex", gap: 26, flexWrap: "wrap" }}>
          {parties.map((p) => (
            <span key={p.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: p.color }} /><strong>{p.pct}%</strong> <span style={{ opacity: 0.55 }}>{p.label}</span></span>
          ))}
        </div>
      </section>

      <section className="pd-anim pd-a3" style={{ marginTop: 52 }}>
        <h2 style={{ ...H, margin: 0, fontWeight: 700, fontSize: 19, letterSpacing: "-0.015em" }}>Where you appeared <span style={{ fontWeight: 500, fontSize: 13, opacity: 0.45 }}>· last 30 days</span></h2>
        <p style={{ margin: "4px 0 20px", fontSize: 13, opacity: 0.5 }}>The surfaces that carried you into people's plans.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%,190px),1fr))", gap: 28 }}>
          {surfaces.map((s) => (
            <div key={s.name}>
              <p style={{ margin: 0, fontSize: 12.5, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.45 }}>{s.name}</p>
              <p style={{ ...H, margin: "8px 0 0", fontWeight: 700, fontSize: 32, letterSpacing: "-0.02em" }}>{s.value}</p>
              <div style={{ marginTop: 12, height: 5, borderRadius: 3, background: "rgba(28,17,20,0.07)", overflow: "hidden" }}><div style={{ width: `${s.share}%`, height: "100%", borderRadius: 3, background: s.barColor }} /></div>
              <p style={{ margin: "8px 0 0", fontSize: 12.5, opacity: 0.5 }}>{s.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="pd-anim pd-a4" style={{ marginTop: 52 }}>
        <h2 style={{ ...H, margin: 0, fontWeight: 700, fontSize: 19, letterSpacing: "-0.015em" }}>Recent placements</h2>
        <p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.5, display: "flex", alignItems: "center", gap: 9 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF4040", animation: "nuPulseDot 2s ease-out infinite" }} />Every time a plan chose you, as it happens.</p>
        <div style={{ textAlign: "center", padding: "56px 24px 40px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ width: 54, height: 54, borderRadius: 16, background: "rgba(28,17,20,0.05)", display: "grid", placeItems: "center", color: "rgba(28,17,20,0.4)", marginBottom: 16 }}><TrendingUp size={25} /></div>
          <p style={{ ...H, margin: 0, fontWeight: 700, fontSize: 18, letterSpacing: "-0.01em" }}>No placements yet</p>
          <p style={{ margin: "8px 0 0", fontSize: 14, opacity: 0.55, maxWidth: "42ch", lineHeight: 1.55 }}>As soon as Planie places one of your venues in a plan, it'll appear here in real time.</p>
        </div>
      </section>
    </>
  );
}

/* Listing status filters (used by ListingsTab summary cards). */
const statusFilters = ["All", "Active", "Pending", "Inactive", "Denied"];

/* Relative "edited N ago" label for draft cards. */
function formatDraftTimestamp(ms) {
  if (!ms) return "just now";
  const mins = Math.floor((Date.now() - ms) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(ms).toLocaleDateString();
}

/* Unpublished listing drafts (localStorage) — finish to submit. */
function DraftsSection({ animClass = "pd-a2" }) {
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState(() => listDrafts());
  useEffect(() => subscribeDrafts(setDrafts), []);
  if (drafts.length === 0) return null;
  const handleDelete = (id, name) => {
    if (!window.confirm(`Delete "${name || "this draft"}"? This cannot be undone.`)) return;
    deleteDraft(id);
  };
  return (
    <div className={`pd-drafts pd-anim ${animClass}`}>
      <div className="pd-drafts-head">
        <div className="pd-drafts-title">
          <FileText size={16} strokeWidth={2} />
          <h3>Listing Drafts</h3>
          <span className="pd-drafts-count">{drafts.length}</span>
        </div>
        <span className="pd-drafts-sub">Unpublished listings — finish setting up to submit</span>
      </div>
      <div className="pd-drafts-grid">
        {drafts.map((d) => {
          const name = d.form?.name || "Untitled listing";
          const cat = d.form?.category || "";
          const city = d.form?.city || "";
          return (
            <div key={d.id} className="pd-draft-card">
              <div className="pd-draft-card-top">
                <div className="pd-draft-card-avatar"><Store size={18} strokeWidth={1.6} /></div>
                <div className="pd-draft-card-info">
                  <h4>{name}</h4>
                  <div className="pd-draft-card-meta">
                    <span>{cat || "No category"}</span>
                    {city && <><span className="pd-draft-card-dot">·</span><span>{city}</span></>}
                  </div>
                </div>
              </div>
              <div className="pd-draft-card-foot">
                <span className="pd-draft-card-time"><Clock size={12} strokeWidth={1.8} /> Edited {formatDraftTimestamp(d.updatedAt)}</span>
                <div className="pd-draft-card-actions">
                  <button className="pd-btn pd-btn--ghost pd-draft-btn" onClick={() => handleDelete(d.id, name)}><Trash2 size={13} strokeWidth={2} /> Delete</button>
                  <button className="pd-btn pd-btn--fill pd-draft-btn" onClick={() => navigate(`/partners/add-listing?draft=${d.id}`)}>Continue <ChevronRight size={13} strokeWidth={2.2} /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ListingsTab() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [openMenu, setOpenMenu] = useState(null);
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

  return (
    <>
      <header className="pd-anim pd-a1" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
        <div>
          <p className="nu-microlabel" style={{ marginBottom: 6 }}>Listings</p>
          <h1 style={{ fontFamily: "'Gabarito', sans-serif", margin: 0, fontWeight: 700, fontSize: 40, letterSpacing: "-0.02em" }}>Your places.</h1>
        </div>
        <Link to="/partners/add-listing" className="nu-btn nu-btn--fill" style={{ padding: "12px 24px" }}>
          <Plus size={16} strokeWidth={2.2} /> New listing
        </Link>
      </header>

      {/* Status filter pills (design) */}
      <div className="pd-anim pd-a2" style={{ marginTop: 24, display: "inline-flex", padding: 4, borderRadius: 100, background: "rgba(28,17,20,0.05)", flexWrap: "wrap" }}>
        {statusFilters.map((s) => {
          const isActive = statusFilter === s;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                fontFamily: "'Instrument Sans', sans-serif", fontSize: 13.5, fontWeight: 600, cursor: "pointer",
                border: "none", padding: "8px 16px", borderRadius: 100, display: "flex", alignItems: "center", gap: 7,
                background: isActive ? "#1C1114" : "transparent", color: isActive ? "#FAF7F1" : "#1C1114",
                transition: "all 0.25s cubic-bezier(0.22,1,0.36,1)",
              }}
            >
              {s} <span style={{ opacity: 0.5, fontWeight: 500 }}>{counts[s.toLowerCase()]}</span>
            </button>
          );
        })}
      </div>

      {/* Search & filter bar */}
      <div className="pd-ml-toolbar pd-anim pd-a2">
        <div className="pd-ml-search">
          <Search size={16} strokeWidth={2} className="pd-ml-search-icon" />
          <input
            type="text"
            placeholder="Search listings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pd-ml-search-input"
          />
        </div>
        <div className="pd-ml-sort">
          <Filter size={14} strokeWidth={2} />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="pd-ml-sort-select">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name-az">Name AÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“Z</option>
            <option value="name-za">Name ZÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“A</option>
            <option value="views">Most Views</option>
            <option value="clicks">Most Clicks</option>
            <option value="rating">Highest Rating</option>
            <option value="bookings">Most Bookings</option>
            <option value="conversion">Highest Conversion</option>
          </select>
        </div>
      </div>

      {/* Drafts */}
      <DraftsSection animClass="pd-a2" />

      {/* Errors */}
      {(loadError || actionError) && (
        <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#B91C1C", borderRadius: 12, padding: "10px 14px", fontSize: 14, marginBottom: 14 }} role="alert">
          {loadError || actionError}
        </div>
      )}

      {/* Listings */}
      <div className="pd-ml-list pd-anim pd-a3">
        {loading ? (
          <div className="pd-ml-empty">
            <h4>Loading your listingsÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦</h4>
          </div>
        ) : sorted.length === 0 ? (
          <div className="pd-ml-empty">
            <Store size={40} strokeWidth={1.2} />
            <h4>No listings found</h4>
            <p>{listingData.length === 0 ? "Create your first listing to get started" : "Try adjusting your search or filter"}</p>
          </div>
        ) : (
          sorted.map((l) => (
            <div key={l.id} className="pd-ml-card">
              <div className="pd-ml-card-top">
                <div className="pd-ml-card-left">
                  <div className="pd-ml-card-avatar">
                    <Store size={20} strokeWidth={1.5} />
                  </div>
                  <div className="pd-ml-card-info">
                    <h4>{l.name}</h4>
                    <div className="pd-ml-card-meta">
                      <span className="pd-ml-card-cat">{l.category}</span>
                      <span className="pd-ml-card-loc">
                        <MapPin size={12} /> {l.location}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="pd-ml-card-right">
                  <span className={`pd-badge pd-badge--${l.status}`}>
                    {l.status.charAt(0).toUpperCase() + l.status.slice(1)}
                  </span>
                  <div className="pd-ml-card-menu-wrap">
                    <button
                      className="pd-ml-card-menu-btn"
                      onClick={() => setOpenMenu(openMenu === l.id ? null : l.id)}
                    >
                      <MoreVertical size={16} strokeWidth={2} />
                    </button>
                    {openMenu === l.id && (
                      <div className="pd-ml-card-dropdown">
                        <button className="pd-ml-dropdown-item" onClick={() => navigate(`/partners/edit-listing/${l.id}`)}>
                          <Pencil size={14} /> Edit Listing
                        </button>
                        {(l.status === "active" || l.status === "inactive") && (
                          <button className="pd-ml-dropdown-item" onClick={() => togglePause(l)}>
                            {l.status === "inactive" ? <><Play size={14} /> Resume Listing</> : <><Pause size={14} /> Pause Listing</>}
                          </button>
                        )}
                        <button className="pd-ml-dropdown-item pd-ml-dropdown-item--danger" onClick={() => handleDelete(l)}>
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <p className="pd-ml-card-desc">{l.description}</p>

              {l.status === "denied" && l.denialReason && (
                <p style={{ color: "#B91C1C", fontSize: 13, margin: "6px 0 0" }}>
                  Denied: {l.denialReason}
                </p>
              )}

              <div className="pd-ml-card-stats">
                <div className="pd-ml-card-stat">
                  <Eye size={14} strokeWidth={1.8} />
                  <span className="pd-ml-card-stat-val">{l.views.toLocaleString()}</span>
                  <span className="pd-ml-card-stat-lbl">views</span>
                </div>
                <div className="pd-ml-card-stat">
                  <MousePointerClick size={14} strokeWidth={1.8} />
                  <span className="pd-ml-card-stat-val">{l.clicks.toLocaleString()}</span>
                  <span className="pd-ml-card-stat-lbl">clicks</span>
                </div>
                <div className="pd-ml-card-stat">
                  <CalendarCheck size={14} strokeWidth={1.8} />
                  <span className="pd-ml-card-stat-val">{l.bookings}</span>
                  <span className="pd-ml-card-stat-lbl">bookings</span>
                </div>
                <div className="pd-ml-card-stat">
                  <TrendingUp size={14} strokeWidth={1.8} />
                  <span className="pd-ml-card-stat-val">{l.conversionRate}%</span>
                  <span className="pd-ml-card-stat-lbl">conversion</span>
                </div>
                <div className="pd-ml-card-stat">
                  <Clock size={14} strokeWidth={1.8} />
                  <span className="pd-ml-card-stat-val">{l.created}</span>
                </div>
                <div className="pd-ml-card-stat">
                  <Star size={14} fill="#F59E0B" stroke="#F59E0B" />
                  <span className="pd-ml-card-stat-val">{l.rating}</span>
                  <span className="pd-ml-card-stat-lbl">rating</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add listing CTA */}
      <Link to="/partners/add-listing" className="pd-add-cta" style={{ marginTop: 16 }}>
        <Plus size={18} strokeWidth={2} />
        <span>Add a New Listing</span>
      </Link>
    </>
  );
}

/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Promotions Tab ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */
const offerTypeMeta = {
  percentage: { icon: Percent, label: "% off" },
  fixed: { icon: Tag, label: "Ãƒâ€šÃ‚Â£ off" },
  free_item: { icon: Gift, label: "Free item" },
  custom: { icon: Sparkles, label: "Custom" },
};

const promoStatusLabel = {
  draft: "Draft",
  pending: "In review",
  active: "Live",
  denied: "Denied",
  inactive: "Paused",
};

function formatPromoValue(p) {
  if (!p.offerType) return "";
  if (p.offerType === "percentage") return p.discountValue ? `${p.discountValue}% off` : "ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â";
  if (p.offerType === "fixed") return p.discountValue ? `Ãƒâ€šÃ‚Â£${p.discountValue} off` : "ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â";
  return p.discountValue || "ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â";
}

function formatValidity(p) {
  if (p.validityType === "always") return "Always on";
  if (
    p.validityType === "custom" ||
    p.validityType === "days_of_week" ||
    p.validityType === "date_range"
  ) {
    const days = (p.validityDays || []).join(", ");
    const hasTimes = p.validityTimeFrom || p.validityTimeTo;
    const hasRange = p.validityFrom || p.validityTo;
    if (!days && !hasTimes && !hasRange) return "Custom ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â not set";
    const parts = [];
    if (hasRange) parts.push(`${p.validityFrom || "?"} ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ ${p.validityTo || "?"}`);
    if (days || hasTimes) {
      const dayPart = days || "Any day";
      const timePart = hasTimes
        ? `${p.validityTimeFrom || "00:00"}ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“${p.validityTimeTo || "23:59"}`
        : "";
      parts.push(timePart ? `${dayPart}, ${timePart}` : dayPart);
    }
    return parts.join(" Ãƒâ€šÃ‚Â· ");
  }
  return "";
}

const SETUP_STORAGE_KEY = "planie:setup:dismissed";

function readSetupDone() {
  try {
    const raw = window.localStorage.getItem(SETUP_STORAGE_KEY);
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeSetupDone(ids) {
  try {
    window.localStorage.setItem(SETUP_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* ignore */
  }
}

function SetupChecklistSection({ setActiveTab, animClass = "pd-a2" }) {
  const navigate = useNavigate();
  const [done, setDone] = useState(() => readSetupDone());

  const items = [
    {
      id: "billing",
      icon: CreditCard,
      title: "Connect billing information",
      desc: "Add a payment method so we can run your subscription and traveler payouts.",
      cta: "Set up billing",
      onClick: () => setActiveTab("Billing"),
    },
    {
      id: "profile",
      icon: Settings,
      title: "Complete your business profile",
      desc: "Fill in your business name, contact details, and logo.",
      cta: "Open settings",
      onClick: () => setActiveTab("Settings"),
    },
    {
      id: "listing",
      icon: Store,
      title: "Publish your first listing",
      desc: "Get discoverable across Planie itineraries and search.",
      cta: "Add a listing",
      onClick: () => navigate("/partners/add-listing"),
    },
    {
      id: "promotion",
      icon: Megaphone,
      title: "Launch a promotion",
      desc: "Drive early bookings with a percentage off, free upgrade, or custom offer.",
      cta: "Create promotion",
      onClick: () => navigate("/partners/add-promotion"),
    },
    {
      id: "verify",
      icon: CheckCircle,
      title: "Verify your business email",
      desc: "Confirm the email on file so we can send booking and payout updates.",
      cta: "Send verification",
      onClick: () => setActiveTab("Settings"),
    },
  ];

  const completedCount = done.length;
  const totalCount = items.length;
  const pct = Math.round((completedCount / totalCount) * 100);
  const remaining = items.filter((i) => !done.includes(i.id));

  if (remaining.length === 0) return null;

  const markDone = (id) => {
    const next = done.includes(id) ? done : [...done, id];
    setDone(next);
    writeSetupDone(next);
  };

  return (
    <div
      className={`pd-card pd-anim ${animClass}`}
      style={{ marginBottom: 24, padding: 20 }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 6,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Sparkles size={16} strokeWidth={2} />
          <h3 style={{ margin: 0, fontSize: 16 }}>Finish setting up your account</h3>
        </div>
        <span style={{ fontSize: 13, color: "#6B7280" }}>
          {completedCount}/{totalCount} complete
        </span>
      </div>
      <p style={{ margin: "0 0 14px", color: "#6B7280", fontSize: 13 }}>
        A couple of quick steps to get the most out of Planie.
      </p>
      <div
        style={{
          height: 6,
          background: "#F3F4F6",
          borderRadius: 999,
          overflow: "hidden",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: "#10B981",
            transition: "width 0.3s ease",
          }}
        />
      </div>
      <div
        style={{
          display: "grid",
          gap: 10,
        }}
      >
        {remaining.map((i) => {
          const I = i.icon;
          return (
            <div
              key={i.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 14px",
                border: "1px solid #E5E7EB",
                borderRadius: 12,
                background: "#FAFAFA",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "#FFFFFF",
                  border: "1px solid #E5E7EB",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <I size={16} strokeWidth={1.7} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{i.title}</div>
                <div style={{ fontSize: 12, color: "#6B7280" }}>{i.desc}</div>
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button
                  className="pd-btn pd-btn--ghost"
                  style={{ padding: "6px 10px", fontSize: 12 }}
                  onClick={() => markDone(i.id)}
                  title="Mark as done"
                >
                  <CheckCircle size={13} strokeWidth={2} />
                </button>
                <button
                  className="pd-btn pd-btn--fill"
                  style={{ padding: "6px 12px", fontSize: 12 }}
                  onClick={i.onClick}
                >
                  {i.cta}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* Renders the partner's promotion drafts. Self-loads when no `promotions`
   prop is given (overview usage); `listingNames` maps listingId ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ name. */
function PromotionDraftsSection({ promotions: promotionsProp, listingNames = {}, onChanged, animClass = "pd-a2" }) {
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

  return (
    <div className={`pd-drafts pd-anim ${animClass}`}>
      <div className="pd-drafts-head">
        <div className="pd-drafts-title">
          <FileText size={16} strokeWidth={2} />
          <h3>Promotion Drafts</h3>
          <span className="pd-drafts-count">{drafts.length}</span>
        </div>
        <span className="pd-drafts-sub">Unpublished promotions ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â finish setting up to go live</span>
      </div>
      <div className="pd-drafts-grid">
        {drafts.map((p) => {
          const meta = offerTypeMeta[p.offerType] || { icon: Tag, label: "" };
          const I = meta.icon;
          const venueName = listingNames[p.listingId] || "No venue";
          const valueLabel = formatPromoValue(p);
          return (
            <div key={p.id} className="pd-draft-card">
              <div className="pd-draft-card-top">
                <div className="pd-draft-card-avatar">
                  <I size={18} strokeWidth={1.6} />
                </div>
                <div className="pd-draft-card-info">
                  <h4>{p.title || "Untitled promotion"}</h4>
                  <div className="pd-draft-card-meta">
                    <span>{venueName}</span>
                    <span className="pd-draft-card-dot">Ãƒâ€šÃ‚Â·</span>
                    <span>{valueLabel || "No offer set"}</span>
                  </div>
                </div>
              </div>
              <div className="pd-draft-card-foot">
                <span className="pd-draft-card-time">
                  <Clock size={12} strokeWidth={1.8} /> Edited {formatDraftTimestamp(p.updatedAt ? new Date(p.updatedAt).getTime() : 0)}
                </span>
                <div className="pd-draft-card-actions">
                  <button
                    className="pd-btn pd-btn--ghost pd-draft-btn"
                    onClick={() => handleDelete(p.id, p.title)}
                  >
                    <Trash2 size={13} strokeWidth={2} />
                    Delete
                  </button>
                  <button
                    className="pd-btn pd-btn--fill pd-draft-btn"
                    onClick={() => navigate(`/partners/edit-promotion/${p.id}`)}
                  >
                    Continue
                    <ChevronRight size={13} strokeWidth={2.2} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PromotionsTab() {
  const navigate = useNavigate();
  const { items: listings, loadError: listingsError } = useMyListings();
  const { items: promotions, loadError, reload } = useMyPromotions();
  const [actionError, setActionError] = useState(null);

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
     server refused because another promo is live ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â offer deactivate & retry. */
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

  return (
    <>
      <header className="pd-anim pd-a1" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
        <div>
          <p className="nu-microlabel" style={{ marginBottom: 6 }}>Promotions</p>
          <h1 style={{ fontFamily: "'Gabarito', sans-serif", margin: 0, fontWeight: 700, fontSize: 40, letterSpacing: "-0.02em" }}>Offers that travel.</h1>
        </div>
        <Link to="/partners/add-promotion" className="nu-btn nu-btn--fill" style={{ padding: "12px 24px" }}>
          <Plus size={16} strokeWidth={2.2} /> New promotion
        </Link>
      </header>

      {/* Summary — hairline metric band (design) */}
      <section className="pd-anim pd-a2" style={{ marginTop: 32, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", rowGap: 24 }}>
        {[["All", promos.length], ["Live", totalActive], ["In review", totalPending], ["Drafts", totalDrafts]].map(([label, val], i, arr) => (
          <div key={label} style={{ padding: "4px 20px 8px 0", marginRight: 20, borderRight: i < arr.length - 1 ? "1px solid rgba(28,17,20,0.08)" : "none", minWidth: 0 }}>
            <p style={{ margin: "0 0 10px", fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.45 }}>{label}</p>
            <p style={{ fontFamily: "'Gabarito', sans-serif", margin: 0, fontWeight: 700, fontSize: 38, letterSpacing: "-0.02em", lineHeight: 1 }}>{val}</p>
          </div>
        ))}
      </section>

      {/* Errors */}
      {(loadError || listingsError || actionError) && (
        <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#B91C1C", borderRadius: 12, padding: "10px 14px", fontSize: 14, marginBottom: 14 }} role="alert">
          {loadError || listingsError || actionError}
        </div>
      )}

      {/* Drafts */}
      <PromotionDraftsSection promotions={promos} listingNames={listingNames} onChanged={reload} animClass="pd-a2" />

      {/* Promotions per venue */}
      <div className="pd-promo-list pd-anim pd-a3">
        {loading ? (
          <div className="pd-promo-empty">
            <span>Loading your promotionsÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦</span>
          </div>
        ) : grouped.length === 0 ? (
          <div className="pd-promo-empty">
            <Megaphone size={20} strokeWidth={1.5} />
            <span>Create a listing first ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â promotions are offers attached to one of your venues.</span>
          </div>
        ) : null}
        {grouped.map((group) => {
          const hasPromos = group.promos.length > 0;
          return (
            <div key={group.id} className="pd-promo-venue">
              <div className="pd-promo-venue-head">
                <div className="pd-promo-venue-info">
                  <Store size={16} strokeWidth={1.7} />
                  <h3>{group.name}</h3>
                  <span className="pd-promo-venue-count">{group.promos.length}</span>
                </div>
                <button
                  className="pd-btn pd-btn--ghost pd-promo-add-btn"
                  onClick={() => navigate(`/partners/add-promotion?listing=${group.id}`)}
                >
                  <Plus size={14} strokeWidth={2.2} />
                  Create a Promotion
                </button>
              </div>

              {hasPromos ? (
                <div className="pd-promo-cards">
                  {group.promos.map((p) => {
                    const meta = offerTypeMeta[p.offerType] || { icon: Tag, label: "" };
                    const I = meta.icon;
                    return (
                      <div key={p.id} className={`pd-promo-card pd-promo-card--${p.status}`}>
                        <div className="pd-promo-card-top">
                          <div className="pd-promo-card-icon">
                            <I size={18} strokeWidth={1.7} />
                          </div>
                          <div className="pd-promo-card-info">
                            <h4>{p.title || "Untitled promotion"}</h4>
                            <div className="pd-promo-card-meta">
                              <span>{formatPromoValue(p)}</span>
                              <span className="pd-promo-card-dot">Ãƒâ€šÃ‚Â·</span>
                              <span>{formatValidity(p)}</span>
                              {p.discountCode && (
                                <>
                                  <span className="pd-promo-card-dot">Ãƒâ€šÃ‚Â·</span>
                                  <span className="pd-promo-card-code">{p.discountCode}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <span className={`pd-badge pd-promo-status pd-promo-status--${p.status}`}>
                            {promoStatusLabel[p.status] || p.status}
                          </span>
                        </div>

                        {(p.applicableOccasions || []).length > 0 && (
                          <div className="pd-promo-card-tags">
                            {(p.applicableOccasions || []).map((o) => (
                              <span key={o} className="pd-promo-tag">{o}</span>
                            ))}
                          </div>
                        )}

                        {p.status === "denied" && p.denialReason && (
                          <p style={{ color: "#B91C1C", fontSize: 13, margin: "8px 0 0" }}>
                            Denied: {p.denialReason}
                          </p>
                        )}

                        <div className="pd-promo-card-actions">
                          <button
                            className="pd-btn pd-btn--ghost pd-promo-action-btn"
                            onClick={() => navigate(`/partners/edit-promotion/${p.id}`)}
                          >
                            <Pencil size={13} strokeWidth={2} />
                            Edit
                          </button>
                          {p.status === "active" && (
                            <button
                              className="pd-btn pd-btn--ghost pd-promo-action-btn"
                              onClick={() => run(() => deactivatePromotion(p.id))}
                            >
                              <Pause size={13} strokeWidth={2} />
                              Deactivate
                            </button>
                          )}
                          {p.status === "inactive" && (
                            <button
                              className="pd-btn pd-btn--fill pd-promo-action-btn"
                              onClick={() => handleReactivate(p)}
                            >
                              <Play size={13} strokeWidth={2} />
                              Reactivate
                            </button>
                          )}
                          {(p.status === "draft" || p.status === "denied") && (
                            <button
                              className="pd-btn pd-btn--fill pd-promo-action-btn"
                              onClick={() => handleSubmit(p)}
                            >
                              <Sparkles size={13} strokeWidth={2} />
                              Submit for review
                            </button>
                          )}
                          <button
                            className="pd-btn pd-btn--ghost pd-promo-action-btn pd-promo-action-btn--danger"
                            onClick={() => handleDelete(p.id, p.title)}
                          >
                            <Trash2 size={13} strokeWidth={2} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="pd-promo-empty">
                  <Megaphone size={20} strokeWidth={1.5} />
                  <span>No promotions yet for this venue.</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Billing Tab ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
   PER-LISTING Stripe billing (rework 2026-07-25). Each venue has its own
   Listed/Partner/Featured plan. Upgrading a Listed venue Ã¢â€ â€™ Stripe Checkout;
   switching between paid tiers or cancelling Ã¢â€ â€™ partnerChangeListingPlan (no
   redirect). Cards/invoices/cancel also available via the Customer Portal.
   Tiers only change when the backend webhook writes them. */
function BillingTab() {
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

  /* Set a listing to a tier. ListedÃ¢â€ â€™paid opens Checkout (redirect); any change
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

  return (
    <>
      <header className="pd-anim pd-a1" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
        <div>
          <p className="nu-microlabel" style={{ marginBottom: 6 }}>Billing</p>
          <h1 style={{ fontFamily: "'Gabarito', sans-serif", margin: 0, fontWeight: 700, fontSize: 40, letterSpacing: "-0.02em" }}>Plans, per venue.</h1>
        </div>
        <span className="pd-billing-plan-badge" style={{ alignSelf: "center" }}>
          <Calendar size={14} strokeWidth={2} /> Monthly billing
        </span>
      </header>

      {notice === "success" && (
        <div className="pd-card pd-anim pd-a1" style={{ marginBottom: 16 }}>
          <p style={{ display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
            <CheckCircle size={16} strokeWidth={2} />
            Payment received ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â the venue's plan updates as soon as Stripe confirms it (usually seconds).
          </p>
        </div>
      )}
      {notice === "cancelled" && (
        <div className="pd-card pd-anim pd-a1" style={{ marginBottom: 16 }}>
          <p style={{ display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
            <AlertCircle size={16} strokeWidth={2} />
            Checkout was cancelled ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â no changes were made.
          </p>
        </div>
      )}
      {(loadError || actionError) && (
        <div className="pd-card pd-anim pd-a1" style={{ marginBottom: 16 }}>
          <p style={{ display: "flex", alignItems: "center", gap: 8, margin: 0, color: "#B42318" }}>
            <AlertCircle size={16} strokeWidth={2} />
            {loadError || actionError}
          </p>
        </div>
      )}

      {/* Composition + total */}
      <div className="pd-billing-banner pd-anim pd-a2">
        <div className="pd-billing-banner-left">
          <div className="pd-billing-plan-badge">
            <Crown size={14} strokeWidth={2} />
            {listings.length} {listings.length === 1 ? "listing" : "listings"}
          </div>
          {compositionParts.length > 0 && (
            <p className="pd-billing-renew" style={{ marginTop: 6 }}>{compositionParts.join(" Ãƒâ€šÃ‚Â· ")}</p>
          )}
          <div className="pd-billing-price" style={{ marginTop: 8 }}>
            <span className="pd-billing-price-amt">
              {summary ? (fmtMoney(summary.netMonthly, currency) ?? "ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â") : "ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â"}
            </span>
            <span className="pd-billing-price-per">/month</span>
          </div>
          {summary?.discountMonthly > 0 && (
            <p className="pd-billing-renew" style={{ color: "#15803d" }}>
              <CheckCircle size={13} /> Includes {summary.volumePct}% volume discount
              (ÃƒÂ¢Ã‹â€ Ã¢â‚¬â„¢{fmtMoney(summary.discountMonthly, currency)})
            </p>
          )}
        </div>
        <div className="pd-billing-banner-right">
          {anySub && (
            <button className="pd-btn pd-btn--ghost" onClick={portal} disabled={busyId !== null}>
              <CreditCard size={15} strokeWidth={2} />
              {busyId === "portal" ? "OpeningÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦" : "Manage billing"}
            </button>
          )}
          <p className="pd-billing-renew" style={{ marginTop: 8 }}>
            Cards, receipts and cancellation are handled securely by Stripe.
          </p>
        </div>
      </div>

      {/* Per-listing plan selector */}
      <div className="pd-anim pd-a3">
        <h3 className="pd-billing-section-title">Listings &amp; plans</h3>
        {data == null && !loadError ? (
          <p className="pd-billing-renew">Loading your listingsÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦</p>
        ) : listings.length === 0 ? (
          <div className="pd-card">
            <p style={{ margin: 0 }}>You have no listings yet. Add a listing first, then choose its plan here.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {listings.map((l) => {
              const busy = busyId === l.listingId;
              const renew = fmtUnixDate(l.currentPeriodEnd);
              return (
                <div key={l.listingId} className="pd-card" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                  <div style={{ minWidth: 200 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Store size={15} strokeWidth={1.8} />
                      <strong>{l.name}</strong>
                    </div>
                    {["active", "trialing", "past_due"].includes(l.status) && renew && (
                      <p className="pd-billing-renew" style={{ marginTop: 4 }}>
                        <Calendar size={12} />
                        {l.cancelAtPeriodEnd ? "Ends on" : "Renews on"} <strong>{renew}</strong>
                        {l.status === "past_due" && <span style={{ color: "#B42318" }}> Ãƒâ€šÃ‚Â· payment failed</span>}
                      </p>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {["Listed", "Partner", "Featured"].map((t) => {
                      const on = t === l.tier;
                      const price = priceOf(t);
                      const missing = t !== "Listed" && price == null;
                      return (
                        <button
                          key={t}
                          className={`al-category-chip${on ? " al-category-chip--active" : ""}`}
                          disabled={busy || missing || on}
                          onClick={() => setListingTier(l, t)}
                          title={missing ? "Price not configured in Stripe yet" : ""}
                          style={{ opacity: missing ? 0.5 : 1 }}
                        >
                          {t}{t !== "Listed" && price != null ? ` Ãƒâ€šÃ‚Â· ${fmtMoney(price, currency)}` : ""}
                          {on ? " ÃƒÂ¢Ã…â€œÃ¢â‚¬Å“" : ""}
                        </button>
                      );
                    })}
                  </div>
                  {busy && <span className="pd-billing-renew">UpdatingÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦</span>}
                </div>
              );
            })}
          </div>
        )}
        <p className="pd-billing-renew" style={{ marginTop: 10 }}>
          When 2ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“5 of your venues share a paid tier, each gets {summary?.volumePct ?? 20}% off automatically.
        </p>
      </div>

      {/* Compare plans (reference only) */}
      <div className="pd-anim pd-a3">
        <button
          className="cmp-pricing-toggle"
          onClick={() => setComparing((v) => !v)}
          aria-expanded={comparing}
          style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, padding: "8px 0", fontWeight: 600 }}
        >
          Compare plans
          <ChevronDown size={16} style={{ transform: comparing ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
        </button>
        {comparing && (
          <div className="pd-billing-plans">
            {TIER_PLANS.map((p) => {
              const price = plans.find((pl) => pl.tier === p.tier);
              const priceLabel = p.tier === "Listed" ? "Free" : fmtMoney(price?.amount, price?.currency) ?? "ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â";
              return (
                <div key={p.tier} className="pd-billing-plan-card">
                  {p.popular && <span className="pd-billing-popular">Most Popular</span>}
                  <h4 className="pd-billing-plan-name">{p.tier}</h4>
                  <div className="pd-billing-plan-price">
                    <span className="pd-billing-plan-amt">{priceLabel}</span>
                    {p.tier !== "Listed" && <span className="pd-billing-plan-per">/{price?.interval ?? "month"}</span>}
                  </div>
                  <ul className="pd-billing-plan-features">
                    {p.features.map((f) => (
                      <li key={f}><CheckCircle size={14} strokeWidth={2} />{f}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Invoices */}
      <div className="pd-card pd-anim pd-a4">
        <div className="pd-card-top">
          <h3>Invoice History</h3>
        </div>
        {data == null && !loadError ? (
          <p className="pd-billing-renew">Loading invoicesÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦</p>
        ) : (data?.invoices?.length ?? 0) === 0 ? (
          <p className="pd-billing-renew">No invoices yet ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â they'll appear here after your first payment.</p>
        ) : (
          <div className="pd-billing-invoices">
            <div className="pd-billing-invoice-header">
              <span>Invoice</span>
              <span>Date</span>
              <span>Description</span>
              <span>Amount</span>
              <span>Status</span>
              <span></span>
            </div>
            {data.invoices.map((inv) => (
              <div key={inv.id} className="pd-billing-invoice-row">
                <span className="pd-billing-invoice-id">{inv.number || inv.id}</span>
                <span className="pd-billing-invoice-date">{fmtUnixDate(inv.created)}</span>
                <span className="pd-billing-invoice-plan">{inv.description || "Subscription"}</span>
                <span className="pd-billing-invoice-amount">{fmtMoney(inv.total, inv.currency)}</span>
                <span className={`pd-badge pd-badge--${inv.status === "paid" ? "paid" : "pending"}`}>
                  {inv.status === "paid" && <CheckCircle size={11} />} {inv.status}
                </span>
                {inv.hostedInvoiceUrl ? (
                  <a
                    className="pd-billing-invoice-dl"
                    href={inv.invoicePdf || inv.hostedInvoiceUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Download size={14} strokeWidth={1.8} />
                  </a>
                ) : (
                  <span />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Settings Tab ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */
function SettingsTab() {
  const { profile, logout } = usePartnerAuth();
  const [notifs, setNotifs] = useState({
    newBookings: true, weeklyReport: true, monthlyGeoReport: true,
    listingUpdates: false, growthInsights: false, platformUpdates: false,
  });
  const toggle = (k) => setNotifs((p) => ({ ...p, [k]: !p[k] }));
  const H = { fontFamily: "'Gabarito', sans-serif" };
  const CARD = { borderRadius: 22, background: "rgba(255,255,255,0.66)", boxShadow: "0 1px 0 rgba(255,255,255,0.9) inset, 0 16px 48px rgba(28,17,20,0.05)", padding: "30px 34px", scrollMarginTop: 24 };
  const INP = { width: "100%", boxSizing: "border-box", fontSize: 15, padding: "14px 16px", borderRadius: 12, border: "1px solid rgba(28,17,20,0.14)", background: "rgba(255,255,255,0.7)", color: "#1C1114", fontFamily: "'Instrument Sans', sans-serif", outline: "none" };
  const LBL = { display: "block", fontSize: 13, fontWeight: 600, opacity: 0.7, marginBottom: 8 };
  const KICK = { margin: "26px 0 14px", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.45, fontWeight: 600 };
  const bizName = profile?.businessName || "";
  const email = profile?.email || "";
  const notifItems = [
    { key: "newBookings", title: "New bookings", desc: "When a traveler books your listing." },
    { key: "weeklyReport", title: "Weekly performance report", desc: "A summary of your listings every Monday." },
    { key: "monthlyGeoReport", title: "Monthly GEO score report", desc: "GEO score and ranking trends.", soon: true },
    { key: "listingUpdates", title: "Listing review updates", desc: "When your listings are approved or need changes." },
    { key: "growthInsights", title: "Growth insights", desc: "Occasional tips to grow your business.", soon: true },
    { key: "platformUpdates", title: "Planie platform updates", desc: "Product announcements and new features." },
  ];
  const jump = [
    { label: "Business profile", href: "#set-business" },
    { label: "Team & access", href: "#set-team" },
    { label: "Notifications", href: "#set-notifications" },
    { label: "Security", href: "#set-security" },
    { label: "Danger zone", href: "#set-danger" },
  ];
  const Toggle = ({ on, onClick }) => (
    <button onClick={onClick} style={{ flexShrink: 0, cursor: "pointer", width: 46, height: 27, borderRadius: 100, border: "none", padding: 3, background: on ? "#FF4040" : "rgba(28,17,20,0.15)", transition: "background 0.25s", display: "flex", justifyContent: on ? "flex-end" : "flex-start" }}>
      <span style={{ width: 21, height: 21, borderRadius: "50%", background: "#FAF7F1", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
    </button>
  );
  return (
    <>
      <header className="pd-anim pd-a1">
        <p className="nu-microlabel" style={{ marginBottom: 6 }}>Settings</p>
        <h1 style={{ ...H, margin: 0, fontWeight: 700, fontSize: 40, letterSpacing: "-0.02em" }}>Account &amp; preferences.</h1>
      </header>

      <div style={{ marginTop: 36, display: "flex", flexWrap: "wrap", gap: 44, alignItems: "flex-start" }}>
        <div style={{ flex: "10 1 560px", minWidth: 0, display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Business profile */}
          <section id="set-business" style={CARD} className="pd-anim pd-a2">
            <h2 style={{ ...H, margin: 0, fontWeight: 700, fontSize: 20, letterSpacing: "-0.015em" }}>Business profile</h2>
            <p style={{ margin: "4px 0 24px", fontSize: 13.5, opacity: 0.5 }}>Your Business Profile â€” the account every venue listing sits under.</p>
            <label style={LBL}>Business name</label>
            <input type="text" defaultValue={bizName} placeholder="Your business name" style={INP} />
            <p style={KICK}>Primary contact</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%,220px),1fr))", gap: 16 }}>
              <div><label style={LBL}>Contact email</label><input type="text" defaultValue={email} style={INP} /></div>
              <div><label style={LBL}>Phone</label><input type="text" placeholder="+44 â€¦" style={INP} /></div>
            </div>
            <label style={{ ...LBL, margin: "22px 0 8px" }}>Business description</label>
            <textarea rows={3} placeholder="A short description of your business." style={{ ...INP, resize: "vertical", lineHeight: 1.5 }} />
            <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
              <button className="nu-btn nu-btn--fill">Save changes</button>
            </div>
          </section>

          {/* Team & access */}
          <section id="set-team" style={CARD}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              <div>
                <h2 style={{ ...H, margin: 0, fontWeight: 700, fontSize: 20, letterSpacing: "-0.015em" }}>Team &amp; access</h2>
                <p style={{ margin: "4px 0 0", fontSize: 13.5, opacity: 0.5 }}>Who can manage this Business Profile and its listings.</p>
              </div>
              <button className="nu-btn nu-btn--outline">+ Invite teammate</button>
            </div>
            <div style={{ marginTop: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 4px", borderTop: "1px solid rgba(28,17,20,0.07)" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#1C1114", color: "#FAF7F1", display: "flex", alignItems: "center", justifyContent: "center", ...H, fontWeight: 700, fontSize: 15 }}>{(bizName || email || "?").slice(0, 1).toUpperCase()}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 14.5, fontWeight: 600 }}>{bizName || "You"}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12.5, opacity: 0.5 }}>{email}</p>
                </div>
                <span style={{ fontSize: 12.5, fontWeight: 600, padding: "6px 13px", borderRadius: 100, color: "#15803d", background: "rgba(21,128,61,0.1)" }}>Owner</span>
              </div>
            </div>
          </section>

          {/* Notifications */}
          <section id="set-notifications" style={CARD}>
            <h2 style={{ ...H, margin: 0, fontWeight: 700, fontSize: 20, letterSpacing: "-0.015em" }}>Notifications</h2>
            <p style={{ margin: "4px 0 20px", fontSize: 13.5, opacity: 0.5 }}>Choose what lands in your inbox.</p>
            {notifItems.map((nt) => (
              <div key={nt.key} style={{ display: "flex", alignItems: "center", gap: 18, padding: "16px 0", borderTop: "1px solid rgba(28,17,20,0.07)", opacity: nt.soon ? 0.55 : 1 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 14.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 9 }}>
                    {nt.title}{nt.soon && <span className="nu-nav-badge" style={{ color: "rgba(28,17,20,0.55)", borderColor: "rgba(28,17,20,0.2)" }}>Soon</span>}
                  </p>
                  <p style={{ margin: "3px 0 0", fontSize: 13, opacity: 0.5, lineHeight: 1.5 }}>{nt.desc}</p>
                </div>
                <Toggle on={notifs[nt.key]} onClick={() => !nt.soon && toggle(nt.key)} />
              </div>
            ))}
          </section>

          {/* Security */}
          <section id="set-security" style={CARD}>
            <h2 style={{ ...H, margin: 0, fontWeight: 700, fontSize: 20, letterSpacing: "-0.015em" }}>Security</h2>
            <p style={{ margin: "4px 0 20px", fontSize: 13.5, opacity: 0.5 }}>Password, authentication and active sessions.</p>
            <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 0", borderTop: "1px solid rgba(28,17,20,0.07)" }}>
              <div style={{ flex: 1 }}><p style={{ margin: 0, fontSize: 14.5, fontWeight: 600 }}>Password</p><p style={{ margin: "3px 0 0", fontSize: 13, opacity: 0.5 }}>Reset it by email any time.</p></div>
              <button className="nu-btn nu-btn--outline" onClick={() => logout()}>Sign out</button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 0", borderTop: "1px solid rgba(28,17,20,0.07)" }}>
              <div style={{ flex: 1 }}><p style={{ margin: 0, fontSize: 14.5, fontWeight: 600 }}>Two-factor authentication</p><p style={{ margin: "3px 0 0", fontSize: 13, opacity: 0.5 }}>Add an extra layer of security.</p></div>
              <button className="nu-btn nu-btn--fill">Enable 2FA</button>
            </div>
          </section>

          {/* Danger zone */}
          <section id="set-danger" style={{ borderRadius: 22, background: "rgba(255,64,64,0.05)", border: "1px solid rgba(255,64,64,0.2)", padding: "26px 34px", display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 240 }}>
              <p style={{ ...H, margin: 0, fontWeight: 700, fontSize: 17, color: "#C8321F" }}>Delete Business Profile</p>
              <p style={{ margin: "6px 0 0", fontSize: 13.5, opacity: 0.6, lineHeight: 1.55 }}>Permanently removes your account, every venue listing, and all associated data. This cannot be undone.</p>
            </div>
            <button style={{ fontSize: 13.5, fontWeight: 600, cursor: "pointer", padding: "12px 24px", borderRadius: 100, border: "1px solid #FF4040", background: "transparent", color: "#C8321F" }}>Delete account</button>
          </section>
        </div>

        {/* Rail */}
        <aside style={{ flex: "1 1 260px", maxWidth: 340, position: "sticky", top: 36, display: "flex", flexDirection: "column", gap: 22 }} className="pd-anim pd-a3">
          <div style={{ borderRadius: 20, background: "rgba(255,255,255,0.66)", boxShadow: "0 1px 0 rgba(255,255,255,0.9) inset, 0 16px 48px rgba(28,17,20,0.05)", padding: "20px 22px" }}>
            <p style={{ margin: "0 0 12px", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.45, fontWeight: 600 }}>On this page</p>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {jump.map((j, i) => (
                <a key={j.href} href={j.href} style={{ fontSize: 14, padding: "9px 0", borderBottom: i < jump.length - 1 ? "1px solid rgba(28,17,20,0.07)" : "none", opacity: 0.7, color: "#1C1114" }}>{j.label}</a>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

/* ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â */

const tabSlugs = {
  "Overview": "dashboard",
  "Listings": "listings",
  "Promotions": "promotions",
  "Insights": "analytics",
  "Billing": "billing",
  "Settings": "settings",
};
const tabFromSlug = Object.fromEntries(Object.entries(tabSlugs).map(([k, v]) => [v, k]));

function getTabFromHash() {
  if (typeof window === "undefined") return "Overview";
  const slug = window.location.hash.replace(/^#/, "");
  return tabFromSlug[slug] || "Overview";
}

/* Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Overview (design port of Planie Partner Dashboard.dc.html) Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
   Real data: greeting, listing counts + the "Your places" table, setup
   checklist. Analytics numbers (metric deltas, the chart, demand, review) are
   sample data until the Phase-6 data platform exists Ã¢â‚¬â€ clearly a preview. */
const OV_HEAD = { fontFamily: "'Gabarito', sans-serif" };
const OV_CARD = {
  borderRadius: 20, background: "rgba(255,255,255,0.66)",
  boxShadow: "0 1px 0 rgba(255,255,255,0.9) inset, 0 16px 48px rgba(28,17,20,0.05)",
  padding: "22px 24px",
};
const OV_AREAS = [
  { name: "Old Town", pct: 82, barColor: "#FF4040" },
  { name: "Harbour", pct: 64, barColor: "#1C1114" },
  { name: "Design District", pct: 48, barColor: "#1C1114" },
  { name: "Riverside", pct: 31, barColor: "#1C1114" },
];

function OvPeriodToggle() {
  const [i, setI] = useState(1);
  const opts = ["7 days", "30 days", "90 days"];
  return (
    <div style={{ display: "inline-flex", padding: 4, borderRadius: 100, background: "rgba(28,17,20,0.05)" }}>
      {opts.map((o, idx) => (
        <button key={o} onClick={() => setI(idx)} style={{
          fontFamily: "'Instrument Sans', sans-serif", fontSize: 13.5, fontWeight: 600, cursor: "pointer",
          border: "none", padding: "8px 18px", borderRadius: 100, transition: "all 0.25s cubic-bezier(0.22,1,0.36,1)",
          background: i === idx ? "#1C1114" : "transparent", color: i === idx ? "#FAF7F1" : "#1C1114",
        }}>{o}</button>
      ))}
    </div>
  );
}

function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [emoji, setEmoji] = useState(null);
  const [topic, setTopic] = useState("General");
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);
  const close = () => { setOpen(false); setTimeout(() => { setSent(false); setEmoji(null); setNote(""); setTopic("General"); }, 200); };
  return (
    <>
      <button onClick={() => setOpen(true)} style={{
        fontFamily: "'Instrument Sans', sans-serif", fontSize: 13.5, fontWeight: 600, cursor: "pointer",
        padding: "9px 18px", borderRadius: 100, border: "1px solid rgba(28,17,20,0.16)", background: "transparent",
        color: "#1C1114", display: "inline-flex", alignItems: "center", gap: 8,
      }}>
        <MessageSquare size={15} strokeWidth={2} /> Leave feedback
      </button>
      {open && (
        <div onClick={close} style={{ position: "fixed", inset: 0, background: "rgba(28,17,20,0.45)", zIndex: 200, display: "grid", placeItems: "center", padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "min(440px,100%)", background: "#FAF7F1", borderRadius: 18, padding: "28px 30px", boxShadow: "0 24px 64px rgba(28,17,20,0.25)" }}>
            {sent ? (
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <div style={{ width: 52, height: 52, margin: "0 auto 14px", borderRadius: "50%", background: "#1C1114", color: "#FAF7F1", display: "grid", placeItems: "center" }}>
                  <Check size={24} strokeWidth={2.4} />
                </div>
                <h3 style={{ ...OV_HEAD, margin: 0, fontSize: 22 }}>Thank you</h3>
                <p style={{ margin: "10px 0 20px", opacity: 0.6, fontSize: 14.5 }}>Your feedback helps us make Planie better for partners.</p>
                <button className="nu-btn nu-btn--outline" onClick={close}>Close</button>
              </div>
            ) : (
              <>
                <h3 style={{ ...OV_HEAD, margin: "0 0 4px", fontSize: 20 }}>How's it going?</h3>
                <p style={{ margin: "0 0 18px", opacity: 0.55, fontSize: 13.5 }}>Tell us what's working or what's not.</p>
                <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
                  {["Ã°Å¸ËœÅ¾", "Ã°Å¸ËœÂ", "Ã°Å¸â„¢â€š", "Ã°Å¸ËœÂ"].map((e) => (
                    <button key={e} onClick={() => setEmoji(e)} style={{
                      fontSize: 24, cursor: "pointer", width: 48, height: 48, borderRadius: 12,
                      border: `1px solid ${emoji === e ? "#1C1114" : "rgba(28,17,20,0.14)"}`,
                      background: emoji === e ? "rgba(28,17,20,0.05)" : "#fff",
                    }}>{e}</button>
                  ))}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                  {["General", "A bug", "Feature idea", "Billing"].map((t) => (
                    <button key={t} className={`al-category-chip${topic === t ? " al-category-chip--active" : ""}`} onClick={() => setTopic(t)}>{t}</button>
                  ))}
                </div>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Anything you'd like us to knowÃ¢â‚¬Â¦" style={{
                  width: "100%", boxSizing: "border-box", minHeight: 90, resize: "vertical", fontFamily: "'Instrument Sans', sans-serif",
                  fontSize: 14, padding: "12px 14px", borderRadius: 12, border: "1px solid rgba(28,17,20,0.14)", background: "#fff", color: "#1C1114", outline: "none",
                }} />
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
                  <button className="nu-btn nu-btn--outline" onClick={close}>Cancel</button>
                  <button className="nu-btn nu-btn--fill" disabled={!emoji} onClick={() => setSent(true)}>Send feedback</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/* Right rail Ã¢â‚¬â€ Happening now (empty until placements exist), Demand near you
   (sample), Latest review (sample). */
function OverviewRail() {
  return (
    <aside style={{ flex: "1 1 300px", maxWidth: 420, display: "flex", flexDirection: "column", gap: 22 }} className="pd-anim pd-a3">
      <div style={OV_CARD}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <p style={{ ...OV_HEAD, margin: 0, fontWeight: 700, fontSize: 17, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF4040", animation: "nuPulseDot 2s ease-out infinite" }} />
            Happening now
          </p>
        </div>
        <div style={{ textAlign: "center", padding: "30px 16px 10px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ width: 44, height: 44, borderRadius: 13, background: "rgba(28,17,20,0.05)", display: "grid", placeItems: "center", color: "rgba(28,17,20,0.4)", marginBottom: 12 }}>
            <MapPin size={21} strokeWidth={2} />
          </div>
          <p style={{ ...OV_HEAD, margin: 0, fontWeight: 700, fontSize: 15.5 }}>No placements yet</p>
          <p style={{ margin: "6px 0 0", fontSize: 13, opacity: 0.55, lineHeight: 1.5, maxWidth: "30ch" }}>
            When Planie adds your venue to a live plan, it'll show up here in real time.
          </p>
        </div>
      </div>

      <div style={OV_CARD}>
        <p style={{ ...OV_HEAD, margin: 0, fontWeight: 700, fontSize: 17 }}>Demand near you</p>
        <p style={{ margin: "4px 0 16px", fontSize: 13, opacity: 0.5 }}>Where this week's plans are forming</p>
        {OV_AREAS.map((a) => (
          <div key={a.name} style={{ display: "grid", gridTemplateColumns: "92px 1fr 38px", alignItems: "center", gap: 12, padding: "7px 0" }}>
            <span style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.name}</span>
            <div style={{ height: 5, borderRadius: 3, background: "rgba(28,17,20,0.07)", overflow: "hidden" }}>
              <div style={{ width: `${a.pct}%`, height: "100%", borderRadius: 3, background: a.barColor }} />
            </div>
            <span style={{ fontSize: 12.5, opacity: 0.5, textAlign: "right" }}>{a.pct}%</span>
          </div>
        ))}
        <p style={{ margin: "16px 0 0", fontSize: 13, opacity: 0.6, lineHeight: 1.5 }}>
          Boost a listing to show up first for plans forming here Ã¢â‚¬â€ <Link to="/partners/campaigns" style={{ fontWeight: 600, color: "#FF4040" }}>run a campaign Ã¢â€ â€™</Link>
        </p>
      </div>

      <div style={OV_CARD}>
        <p style={{ ...OV_HEAD, margin: "0 0 4px", fontWeight: 700, fontSize: 17 }}>Latest review</p>
        <div style={{ display: "flex", gap: 3, margin: "6px 0 10px", color: "#F59E0B" }}>
          {[0, 1, 2, 3, 4].map((i) => <Star key={i} size={14} fill="#F59E0B" stroke="#F59E0B" />)}
        </div>
        <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, fontStyle: "italic", opacity: 0.8 }}>
          "Found this spot through Planie and it was exactly our vibe. Booked in seconds."
        </p>
        <p style={{ margin: "10px 0 0", fontSize: 12.5, opacity: 0.45 }}>Sample review Ã‚Â· shown until live reviews arrive</p>
      </div>
    </aside>
  );
}

export default function PartnerDashboard() {
  const [activeTab, setActiveTabState] = useState(getTabFromHash);
  const [tier, setTier] = useState(() => getTier());
  const navigate = useNavigate();
  const { user, profile, isAdmin, logout } = usePartnerAuth();
  const { items: myListings } = useMyListings();
  useEffect(() => subscribeTier(setTier), []);

  const partnerName =
    profile?.businessName || user?.displayName || user?.email?.split("@")[0] || "Partner";

  const handleSignOut = async () => {
    await logout();
    navigate("/partners/login", { replace: true });
  };

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    const slug = tabSlugs[tab];
    if (slug && typeof window !== "undefined" && window.location.hash.replace(/^#/, "") !== slug) {
      window.history.replaceState(null, "", `#${slug}`);
    }
  };

  useEffect(() => {
    const onHashChange = () => setActiveTabState(getTabFromHash());
    window.addEventListener("hashchange", onHashChange);
    // Ensure hash reflects initial tab
    if (!window.location.hash) {
      window.history.replaceState(null, "", `#${tabSlugs.Overview}`);
    }
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <div className="pd-layout">
      {/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Sidebar ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */}
      <aside className="pd-sidebar">
        <div>
          <Link to="/" className="pd-logo">
            <img src={PlanieLogo} alt="Planie" />
          </Link>
          <nav className="pd-nav">
            {isAdmin && (
              <Link to="/partners/admin" className="pd-nav-btn" style={{ color: "#FF4040" }}>
                <Shield size={18} strokeWidth={1.7} />
                <span>Staff Review</span>
              </Link>
            )}
            {navItems.map((n) => {
              const I = n.icon;
              const badge = n.label === "Campaigns" && !isFeatured(tier) ? "Featured" : null;
              if (n.external) {
                return (
                  <Link key={n.label} to={n.external} className="pd-nav-btn">
                    <I size={18} strokeWidth={1.7} />
                    <span>{n.label}</span>
                    {badge && <span className="pd-nav-badge">{badge}</span>}
                  </Link>
                );
              }
              return (
                <button key={n.label} className={`pd-nav-btn${activeTab === n.label ? " pd-nav-btn--on" : ""}`} onClick={() => setActiveTab(n.label)}>
                  <I size={18} strokeWidth={1.7} />
                  <span>{n.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
        <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid rgba(250,247,241,0.08)", display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <p style={{ margin: 0, fontFamily: "'Gabarito', sans-serif", fontWeight: 600, fontSize: 14.5, color: "#FAF7F1" }}>{partnerName}</p>
            <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "rgba(250,247,241,0.45)" }}>
              {(myListings?.length ?? 0)} venue {(myListings?.length ?? 0) === 1 ? "listing" : "listings"}
            </p>
          </div>
          <button onClick={handleSignOut} className="pd-nav-btn pd-nav-btn--out">
            <LogOut size={18} strokeWidth={1.7} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Main ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */}
      <main className="pd-main">
        <VerificationBanner />
        {activeTab === "Listings" ? (
          <ListingsTab />
        ) : activeTab === "Promotions" ? (
          <PromotionsTab />
        ) : activeTab === "Insights" ? (
          <AnalyticsTab />
        ) : activeTab === "Billing" ? (
          <BillingTab />
        ) : activeTab === "Settings" ? (
          <SettingsTab />
        ) : (
          <>
            {(() => {
              const all = myListings ?? [];
              const activeCount = all.filter((l) => l.status === "active").length;
              const metrics = [
                { label: "Listings", value: String(all.length), delta: `${activeCount} active`, deltaColor: "#15803d", divider: true },
                { label: "Views", value: "4,200", delta: "+12.5%", deltaColor: "#15803d", divider: true },
                { label: "Bookings", value: "187", delta: "+18.7%", deltaColor: "#15803d", divider: true },
                { label: "Rating", value: "4.8", delta: "+0.1", deltaColor: "#15803d", divider: false },
              ];
              const statusChip = (s) => {
                const map = {
                  active: { c: "#15803d", label: "Active" },
                  pending: { c: "#9a3412", label: "Pending" },
                  denied: { c: "#FF4040", label: "Denied" },
                  inactive: { c: "rgba(28,17,20,0.5)", label: "Paused" },
                };
                const m = map[s] || map.inactive;
                return <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 600, padding: "6px 14px", borderRadius: 100, color: m.c, border: `1px solid ${m.c}33` }}>{m.label}</span>;
              };
              return (
                <>
                  {/* Header */}
                  <header className="pd-anim pd-a1" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
                    <div>
                      <p className="nu-microlabel" style={{ marginBottom: 6 }}>Overview</p>
                      <h1 style={{ ...OV_HEAD, margin: 0, fontWeight: 700, fontSize: 40, letterSpacing: "-0.02em" }}>Hello, {partnerName}</h1>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                      <FeedbackButton />
                      <OvPeriodToggle />
                    </div>
                  </header>

                  <div style={{ marginTop: 36, display: "flex", flexWrap: "wrap", gap: 44, alignItems: "flex-start" }}>
                    <div style={{ flex: "10 1 560px", minWidth: 0 }}>
                      {/* Metric band */}
                      <section className="pd-anim pd-a2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", rowGap: 32 }}>
                        {metrics.map((m) => (
                          <div key={m.label} style={{ padding: "4px 20px 8px 0", marginRight: 20, borderRight: m.divider ? "1px solid rgba(28,17,20,0.08)" : "none", minWidth: 0 }}>
                            <p style={{ margin: "0 0 10px", fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.45 }}>{m.label}</p>
                            <p style={{ ...OV_HEAD, margin: 0, fontWeight: 700, fontSize: 42, letterSpacing: "-0.02em", lineHeight: 1 }}>{m.value}</p>
                            <p style={{ margin: "10px 0 0", fontSize: 13.5, fontWeight: 600, color: m.deltaColor }}>{m.delta}</p>
                          </div>
                        ))}
                      </section>

                      {/* Performance chart (sample) */}
                      <section className="pd-anim pd-a2" style={{ marginTop: 52 }}>
                        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                          <h2 style={{ ...OV_HEAD, margin: 0, fontWeight: 700, fontSize: 22, letterSpacing: "-0.015em" }}>People finding you</h2>
                          <div style={{ display: "flex", gap: 22, fontSize: 13.5 }}>
                            <span style={{ display: "flex", alignItems: "center", gap: 7 }}><span style={{ width: 16, height: 3, borderRadius: 2, background: "#1C1114" }} />Views</span>
                            <span style={{ display: "flex", alignItems: "center", gap: 7, opacity: 0.75 }}><span style={{ width: 16, height: 3, borderRadius: 2, background: "rgba(28,17,20,0.3)" }} />Clicks</span>
                            <span style={{ display: "flex", alignItems: "center", gap: 7 }}><span style={{ width: 16, height: 3, borderRadius: 2, background: "#FF4040" }} />Bookings</span>
                          </div>
                        </div>
                        <svg viewBox="0 0 860 250" style={{ width: "100%", height: "auto", display: "block", marginTop: 14 }}>
                          <g stroke="#1C1114" strokeOpacity="0.06" strokeWidth="1">
                            {[10, 70, 130, 190].map((y) => <line key={y} x1="0" y1={y} x2="860" y2={y} />)}
                          </g>
                          <polyline points="0,150 120,120 240,135 360,90 480,105 600,60 720,75 860,40" fill="none" stroke="#1C1114" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          <polyline points="0,180 120,165 240,170 360,140 480,150 600,120 720,130 860,110" fill="none" stroke="rgba(28,17,20,0.3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          <polyline points="0,205 120,200 240,195 360,185 480,180 600,165 720,160 860,150" fill="none" stroke="#FF4040" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          <g fontFamily="Instrument Sans, sans-serif" fontSize="12" fill="#1C1114" fillOpacity="0.4">
                            <text x="0" y="242">4 weeks ago</text>
                            <text x="430" y="242" textAnchor="middle">2 weeks ago</text>
                            <text x="860" y="242" textAnchor="end">This week</text>
                          </g>
                        </svg>
                        <p style={{ margin: "6px 0 0", fontSize: 12.5, opacity: 0.45 }}>Sample data Ã¢â‚¬â€ live analytics arrive with the Insights platform.</p>
                      </section>

                      {/* Your places */}
                      <section className="pd-anim pd-a3" style={{ marginTop: 56 }}>
                        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
                          <h2 style={{ ...OV_HEAD, margin: 0, fontWeight: 700, fontSize: 22, letterSpacing: "-0.015em" }}>Your places</h2>
                          <Link to="/partners/add-listing" className="nu-btn nu-btn--fill" style={{ padding: "10px 20px" }}>+ New listing</Link>
                        </div>
                        <div style={{ marginTop: 8 }}>
                          {myListings === null ? (
                            <p style={{ opacity: 0.5, fontSize: 14, padding: "16px 0" }}>LoadingÃ¢â‚¬Â¦</p>
                          ) : all.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "40px 16px", opacity: 0.6 }}>
                              <p style={{ ...OV_HEAD, margin: 0, fontWeight: 700, fontSize: 16 }}>No places yet</p>
                              <p style={{ margin: "6px 0 16px", fontSize: 13.5 }}>Add your first venue to get placed inside plans.</p>
                              <Link to="/partners/add-listing" className="nu-btn nu-btn--outline">Add a listing</Link>
                            </div>
                          ) : (
                            all.map((l) => (
                              <div key={l.id} style={{ display: "grid", gridTemplateColumns: "2.2fr 1fr 1fr 0.9fr", alignItems: "center", gap: 16, padding: "20px 4px", borderBottom: "1px solid rgba(28,17,20,0.08)" }}>
                                <div>
                                  <Link to={`/partners/edit-listing/${l.id}`} style={{ ...OV_HEAD, margin: 0, fontWeight: 600, fontSize: 16.5, color: "#1C1114" }}>{l.name}</Link>
                                  <p style={{ margin: "3px 0 0", fontSize: 13.5, opacity: 0.5 }}>{l.location || l.city || l.category}</p>
                                </div>
                                <div><p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{(l.views ?? 0).toLocaleString()}</p><p style={{ margin: "2px 0 0", fontSize: 12.5, opacity: 0.45 }}>views</p></div>
                                <div><p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Ã¢Ëœâ€¦ {l.rating ?? "Ã¢â‚¬â€"}</p><p style={{ margin: "2px 0 0", fontSize: 12.5, opacity: 0.45 }}>rating</p></div>
                                <div style={{ display: "flex", justifyContent: "flex-end" }}>{statusChip(l.status)}</div>
                              </div>
                            ))
                          )}
                        </div>
                      </section>

                      {/* Finish setting up (real checklist) */}
                      <div style={{ marginTop: 44 }}>
                        <SetupChecklistSection setActiveTab={setActiveTab} animClass="pd-a3" />
                        <DraftsSection animClass="pd-a3" />
                        <PromotionDraftsSection
                          listingNames={Object.fromEntries(all.map((l) => [l.id, l.name]))}
                          animClass="pd-a3"
                        />
                      </div>
                    </div>

                    {/* Right rail */}
                    <OverviewRail />
                  </div>
                </>
              );
            })()}
          </>
        )}
      </main>
    </div>
  );
}
