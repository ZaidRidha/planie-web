/* eslint-disable no-unused-vars -- analytics chart scaffolding (Donut,
   AnalyticsLineChart, HBarChart, useCounter and their sample datasets) is
   built but not yet wired into the render. */
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  TrendingUp,
  MapPin,
  Star,
  LogOut,
  LayoutDashboard,
  Store,
  Settings,
  CreditCard,
  CheckCircle,
  Crown,
  Search,
  Shield,
  Megaphone,
  Sparkles,
  Globe2,
  MessageSquare,
  Check,
} from "lucide-react";
import PlanieLogo from "../Assets/Images/PlanieLogoNew.svg";
import { getTier, isFeatured, subscribeTier } from "../utils/subscription";
import { fetchAnalytics } from "../utils/analytics";
import { usePartnerAuth } from "../Context/PartnerAuthContext";
import VerificationBanner from "../Components/VerificationBanner";
import { useMyListings, useMyPromotions, promoFormFields, offerTypeMeta, formatPromoValue } from "./partner/shared";
import { ListingsTab, DraftsSection } from "./partner/ListingsTab";
import { PromotionsTab, PromotionDraftsSection } from "./partner/PromotionsTab";
import { AnalyticsTab } from "./partner/InsightsTab";
import { BillingTab } from "./partner/BillingTab";
import { SettingsTab } from "./partner/SettingsTab";
import "./PartnerDashboard.css";

/* ─── Animated counter ─── */
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

/* ─── Performance chart ─── */
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

/* ─── Donut ─── */
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

/* ═══════════════════════════════════════════════════════ */

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

/* ───────── Overview (design port of Planie Partner Dashboard.dc.html) ─────────
   Real data: greeting, listing counts + the "Your places" table, setup
   checklist. Analytics numbers (metric deltas, the chart, demand, review) are
   sample data until the Phase-6 data platform exists — clearly a preview. */
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
                  {["😞", "😐", "🙂", "😍"].map((e) => (
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
                <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Anything you'd like us to know…" style={{
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

/* Right rail — Happening now (empty until placements exist), Demand near you
   (sample), Latest review (sample). */
function OverviewRail() {
  return (
    <aside style={{ flex: "1 1 300px", maxWidth: 420, display: "flex", flexDirection: "column", gap: 22 }} className="pd-ov-rail pd-anim pd-a3">
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
          Boost a listing to show up first for plans forming here — <Link to="/partners/campaigns" style={{ fontWeight: 600, color: "#FF4040" }}>run a campaign →</Link>
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
        <p style={{ margin: "10px 0 0", fontSize: 12.5, opacity: 0.45 }}>Sample review · shown until live reviews arrive</p>
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

  // Real total views for the Overview metric band (Phase 6). Verified partners
  // only — 403 for others just leaves it null (shows 0), which is correct.
  const [ovViews, setOvViews] = useState(null);
  useEffect(() => { fetchAnalytics("all", 30).then((d) => setOvViews(d?.totals?.views ?? 0)).catch(() => {}); }, []);

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
      {/* ── Sidebar ── */}
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

      {/* ── Main ── */}
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
                { label: "Views", value: (ovViews ?? 0).toLocaleString(), delta: "last 30 days", deltaColor: "rgba(28,17,20,0.45)", divider: true },
                { label: "Bookings", value: "—", delta: "placeholder — sample", deltaColor: "rgba(28,17,20,0.45)", divider: true },
                { label: "Rating", value: "—", delta: "placeholder — sample", deltaColor: "rgba(28,17,20,0.45)", divider: false },
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
                      <section className="pd-ov-metrics pd-anim pd-a2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", rowGap: 32 }}>
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
                          <div style={{ display: "flex", gap: "8px 22px", fontSize: 13.5, flexWrap: "wrap" }}>
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
                        <p style={{ margin: "6px 0 0", fontSize: 12.5, opacity: 0.45 }}>Sample data — live analytics arrive with the Insights platform.</p>
                      </section>

                      {/* Your places */}
                      <section className="pd-anim pd-a3" style={{ marginTop: 56 }}>
                        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                          <h2 style={{ ...OV_HEAD, margin: 0, fontWeight: 700, fontSize: 22, letterSpacing: "-0.015em" }}>Your places</h2>
                          <Link to="/partners/add-listing" className="nu-btn nu-btn--fill" style={{ padding: "10px 20px" }}>+ New listing</Link>
                        </div>
                        <div style={{ marginTop: 8 }}>
                          {myListings === null ? (
                            <p style={{ opacity: 0.5, fontSize: 14, padding: "16px 0" }}>Loading…</p>
                          ) : all.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "40px 16px", opacity: 0.6 }}>
                              <p style={{ ...OV_HEAD, margin: 0, fontWeight: 700, fontSize: 16 }}>No places yet</p>
                              <p style={{ margin: "6px 0 16px", fontSize: 13.5 }}>Add your first venue to get placed inside plans.</p>
                              <Link to="/partners/add-listing" className="nu-btn nu-btn--outline">Add a listing</Link>
                            </div>
                          ) : (
                            all.map((l) => (
                              <div key={l.id} className="pd-ov-place" style={{ display: "grid", gridTemplateColumns: "2.2fr 1fr 1fr 0.9fr", alignItems: "center", gap: 16, padding: "20px 4px", borderBottom: "1px solid rgba(28,17,20,0.08)" }}>
                                <div>
                                  <Link to={`/partners/edit-listing/${l.id}`} style={{ ...OV_HEAD, margin: 0, fontWeight: 600, fontSize: 16.5, color: "#1C1114" }}>{l.name}</Link>
                                  <p style={{ margin: "3px 0 0", fontSize: 13.5, opacity: 0.5 }}>{l.location || l.city || l.category}</p>
                                </div>
                                <div><p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{(l.views ?? 0).toLocaleString()}</p><p style={{ margin: "2px 0 0", fontSize: 12.5, opacity: 0.45 }}>views</p></div>
                                <div><p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>★ {l.rating ?? "—"}</p><p style={{ margin: "2px 0 0", fontSize: 12.5, opacity: 0.45 }}>rating</p></div>
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
