import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  MousePointerClick,
  TrendingUp,
  DollarSign,
  Plus,
  Pencil,
  MapPin,
  Star,
  ChevronRight,
  LogOut,
  LayoutDashboard,
  Store,
  Settings,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Receipt,
  CheckCircle,
  Download,
  Zap,
  Crown,
  Calendar,
  AlertCircle,
  Search,
  Filter,
  MoreVertical,
  Trash2,
  ExternalLink,
  Clock,
  User,
  Building2,
  Mail,
  Phone,
  Globe,
  Bell,
  BellOff,
  Lock,
  Shield,
  ChevronDown,
} from "lucide-react";
import PlanieLogo from "../Assets/Images/PlanieLogo2.png";
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

/* ─── Sparkline ─── */
function Sparkline({ data, height = 32, width = 100 }) {
  const max = Math.max(...data), min = Math.min(...data), range = max - min || 1;
  const pts = data.map((v, i) =>
    `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * (height - 4) - 2}`
  );
  return (
    <svg width={width} height={height} className="pd-sparkline">
      <defs>
        <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF4040" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#FF4040" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`M0,${height} L${pts.join(" L")} L${width},${height} Z`} fill="url(#sparkFill)" />
      <polyline points={pts.join(" ")} fill="none" stroke="#FF4040" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.45" />
    </svg>
  );
}

/* ─── Performance chart ─── */
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const views = [320, 480, 390, 620, 540, 710, 680];
const clicks = [85, 130, 110, 195, 160, 220, 200];

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

function Donut({ size = 160 }) {
  const sw = 18, r = (size - sw) / 2, c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <svg width={size} height={size}>
      {/* background track */}
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F5F5F8" strokeWidth={sw} />
      {sources.map((s, i) => {
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

/* ─── Helpers ─── */
const toSlug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/* ─── Data ─── */
const listings = [
  { name: "Sunset Rooftop Bar", category: "Restaurant & Bar", location: "Marrakech, Morocco", rating: 4.8, views: 1240, clicks: 340, status: "active", created: "Jan 15, 2026", description: "A stunning rooftop bar with panoramic views of the Marrakech medina. Craft cocktails & live music." },
  { name: "Desert Safari Tours", category: "Activity & Tour", location: "Dubai, UAE", rating: 4.9, views: 2100, clicks: 580, status: "active", created: "Dec 3, 2025", description: "Thrilling desert safaris with dune bashing, camel rides, and traditional Bedouin camp dinners." },
  { name: "Coastal Yoga Retreat", category: "Wellness & Spa", location: "Bali, Indonesia", rating: 4.7, views: 860, clicks: 210, status: "pending", created: "Feb 22, 2026", description: "A beachfront wellness retreat offering daily yoga, meditation sessions, and organic cuisine." },
  { name: "Old Town Walking Tour", category: "Activity & Tour", location: "Prague, Czech Republic", rating: 4.6, views: 1520, clicks: 410, status: "active", created: "Nov 18, 2025", description: "Discover hidden gems and centuries of history on this expertly guided walking tour." },
  { name: "Neon Night Market", category: "Shopping & Market", location: "Bangkok, Thailand", rating: 4.5, views: 680, clicks: 190, status: "inactive", created: "Mar 1, 2026", description: "Bangkok's most vibrant night market with street food, local crafts, and live entertainment." },
];

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: Store, label: "My Listings" },
  { icon: TrendingUp, label: "Analytics" },
  { icon: CreditCard, label: "Billing" },
  { icon: Settings, label: "Settings" },
];

/* ─── Billing data ─── */
const invoices = [
  { id: "INV-2026-003", date: "Mar 1, 2026", amount: "$49.00", status: "paid", plan: "Pro Plan" },
  { id: "INV-2026-002", date: "Feb 1, 2026", amount: "$49.00", status: "paid", plan: "Pro Plan" },
  { id: "INV-2026-001", date: "Jan 1, 2026", amount: "$49.00", status: "paid", plan: "Pro Plan" },
  { id: "INV-2025-012", date: "Dec 1, 2025", amount: "$29.00", status: "paid", plan: "Starter Plan" },
  { id: "INV-2025-011", date: "Nov 1, 2025", amount: "$29.00", status: "paid", plan: "Starter Plan" },
];

const plans = [
  {
    name: "Starter",
    price: "$29",
    period: "/mo",
    features: ["Up to 3 listings", "Basic analytics", "Email support", "Standard placement"],
    current: false,
  },
  {
    name: "Pro",
    price: "$49",
    period: "/mo",
    features: ["Up to 10 listings", "Advanced analytics", "Priority support", "Featured placement", "AI itinerary boost"],
    current: true,
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$99",
    period: "/mo",
    features: ["Unlimited listings", "Custom analytics", "Dedicated manager", "Premium placement", "API access", "White-label options"],
    current: false,
  },
];

/* ─── Analytics data ─── */
const monthLabels = ["Feb 5","Feb 12","Feb 19","Feb 26","Mar 5","Mar 12","Mar 19","Mar 26","Apr 2","Apr 9","Apr 16","Apr 23"];
const monthViews = [1800,2200,1950,2600,2400,3100,2800,3400,3200,3600,3900,4200];
const monthClicks = [420,530,470,640,580,760,690,850,780,900,960,1020];
const monthConversions = [85,110,95,130,120,155,140,175,160,185,198,210];

const deviceData = [
  { label: "Mobile", value: 58, color: "#FF4040" },
  { label: "Desktop", value: 32, color: "#11181C" },
  { label: "Tablet", value: 10, color: "#D1D5DB" },
];

const topCountries = [
  { country: "United States", views: 1420, pct: 28 },
  { country: "United Kingdom", views: 890, pct: 17 },
  { country: "France", views: 720, pct: 14 },
  { country: "Germany", views: 580, pct: 11 },
  { country: "UAE", views: 460, pct: 9 },
  { country: "Others", views: 1130, pct: 21 },
];

const topReferrers = [
  { source: "planie.app/discover", visits: 1760, change: "+14%" },
  { source: "AI Itinerary Builder", visits: 1302, change: "+22%" },
  { source: "Google Search", visits: 756, change: "+5%" },
  { source: "Instagram Link", visits: 412, change: "+31%" },
  { source: "Direct / Bookmark", visits: 310, change: "-3%" },
];

/* ─── Analytics Chart ─── */
function AnalyticsLineChart({ labels, datasets, height = 220 }) {
  const w = 680, h = height, px = 48, py = 20;
  const iw = w - px * 2, ih = h - py * 2;
  const allVals = datasets.flatMap((d) => d.data);
  const maxV = Math.max(...allVals);

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

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="pd-an-chart">
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
    </svg>
  );
}

/* ─── Horizontal Bar Chart ─── */
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

/* ─── Analytics Tab ─── */
const timeRanges = ["7 Days", "30 Days", "90 Days"];

function AnalyticsTab() {
  const [range, setRange] = useState("30 Days");

  const totalViews = useCounter(34200, 1400, 200);
  const totalClicks = useCounter(8580, 1400, 300);
  const totalConv = useCounter(1765, 1200, 400);
  const avgRating = 4.72;
  const bounceRate = 24;
  const avgDuration = "2m 34s";

  return (
    <>
      <header className="pd-head pd-anim pd-a1">
        <div>
          <h1 className="pd-title">Analytics</h1>
          <p className="pd-subtitle">Deep dive into your listings' performance and visitor behavior</p>
        </div>
        <div className="pd-an-range">
          {timeRanges.map((t) => (
            <button
              key={t}
              className={`pd-an-range-btn${range === t ? " pd-an-range-btn--on" : ""}`}
              onClick={() => setRange(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </header>

      {/* Stat cards */}
      <div className="pd-an-stats pd-anim pd-a2">
        <div className="pd-an-stat">
          <div className="pd-an-stat-icon pd-an-stat-icon--red"><Eye size={18} strokeWidth={1.8} /></div>
          <div className="pd-an-stat-body">
            <span className="pd-an-stat-lbl">Total Views</span>
            <span className="pd-an-stat-val">{totalViews.toLocaleString()}</span>
          </div>
          <div className="pd-stat-chg pd-stat-chg--up"><ArrowUpRight size={12} /> 12.5%</div>
        </div>
        <div className="pd-an-stat">
          <div className="pd-an-stat-icon pd-an-stat-icon--blue"><MousePointerClick size={18} strokeWidth={1.8} /></div>
          <div className="pd-an-stat-body">
            <span className="pd-an-stat-lbl">Total Clicks</span>
            <span className="pd-an-stat-val">{totalClicks.toLocaleString()}</span>
          </div>
          <div className="pd-stat-chg pd-stat-chg--up"><ArrowUpRight size={12} /> 8.3%</div>
        </div>
        <div className="pd-an-stat">
          <div className="pd-an-stat-icon pd-an-stat-icon--green"><DollarSign size={18} strokeWidth={1.8} /></div>
          <div className="pd-an-stat-body">
            <span className="pd-an-stat-lbl">Conversions</span>
            <span className="pd-an-stat-val">{totalConv.toLocaleString()}</span>
          </div>
          <div className="pd-stat-chg pd-stat-chg--up"><ArrowUpRight size={12} /> 18.7%</div>
        </div>
        <div className="pd-an-stat">
          <div className="pd-an-stat-icon pd-an-stat-icon--amber"><Star size={18} strokeWidth={1.8} /></div>
          <div className="pd-an-stat-body">
            <span className="pd-an-stat-lbl">Avg. Rating</span>
            <span className="pd-an-stat-val">{avgRating}</span>
          </div>
          <div className="pd-stat-chg pd-stat-chg--up"><ArrowUpRight size={12} /> 0.3</div>
        </div>
        <div className="pd-an-stat">
          <div className="pd-an-stat-icon" style={{ background: "#F3F4F6", color: "#6B7280" }}><TrendingUp size={18} strokeWidth={1.8} /></div>
          <div className="pd-an-stat-body">
            <span className="pd-an-stat-lbl">Bounce Rate</span>
            <span className="pd-an-stat-val">{bounceRate}%</span>
          </div>
          <div className="pd-stat-chg pd-stat-chg--dn"><ArrowDownRight size={12} /> 2.1%</div>
        </div>
        <div className="pd-an-stat">
          <div className="pd-an-stat-icon" style={{ background: "#EFF6FF", color: "#3B82F6" }}><Clock size={18} strokeWidth={1.8} /></div>
          <div className="pd-an-stat-body">
            <span className="pd-an-stat-lbl">Avg. Duration</span>
            <span className="pd-an-stat-val">{avgDuration}</span>
          </div>
          <div className="pd-stat-chg pd-stat-chg--up"><ArrowUpRight size={12} /> 12s</div>
        </div>
      </div>

      {/* Views & Clicks over time */}
      <div className="pd-card pd-anim pd-a3">
        <div className="pd-card-top">
          <h3>Views, Clicks & Conversions</h3>
          <div className="pd-legend">
            <span><span className="pd-dot" style={{ background: "#FF4040" }} />Views</span>
            <span><span className="pd-dot" style={{ background: "#3B82F6" }} />Clicks</span>
            <span><span className="pd-dot" style={{ background: "#10B981" }} />Conversions</span>
          </div>
        </div>
        <AnalyticsLineChart
          labels={monthLabels}
          datasets={[
            { data: monthViews, color: "#FF4040" },
            { data: monthClicks, color: "#3B82F6" },
            { data: monthConversions, color: "#10B981" },
          ]}
        />
      </div>

      {/* Per-listing breakdown */}
      <div className="pd-card pd-anim pd-a3" style={{ marginTop: 16 }}>
        <div className="pd-card-top">
          <h3>Per-Listing Breakdown</h3>
        </div>
        <div className="pd-an-table">
          <div className="pd-an-table-header">
            <span>Listing</span>
            <span>Views</span>
            <span>Clicks</span>
            <span>CTR</span>
            <span>Rating</span>
          </div>
          {listings.filter((l) => l.status === "active").map((l) => {
            const ctr = ((l.clicks / l.views) * 100).toFixed(1);
            return (
              <div key={l.name} className="pd-an-table-row">
                <div className="pd-an-table-name">
                  <div className="pd-an-table-av"><Store size={16} strokeWidth={1.5} /></div>
                  <div>
                    <span className="pd-an-table-title">{l.name}</span>
                    <span className="pd-an-table-loc"><MapPin size={10} /> {l.location}</span>
                  </div>
                </div>
                <span className="pd-an-table-val">{l.views.toLocaleString()}</span>
                <span className="pd-an-table-val">{l.clicks.toLocaleString()}</span>
                <span className="pd-an-table-val pd-an-table-val--accent">{ctr}%</span>
                <span className="pd-an-table-val">
                  <Star size={12} fill="#F59E0B" stroke="#F59E0B" /> {l.rating}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom row: Devices + Geography + Referrers */}
      <div className="pd-an-bottom pd-anim pd-a4">
        {/* Devices */}
        <div className="pd-card">
          <div className="pd-card-top"><h3>Devices</h3></div>
          <div className="pd-an-device-donut">
            <Donut size={130} />
            <div className="pd-donut-ctr">
              <span className="pd-donut-num" style={{ fontSize: "1.2rem" }}>58%</span>
              <span className="pd-donut-lbl">Mobile</span>
            </div>
          </div>
          <HBarChart data={deviceData} maxVal={60} />
        </div>

        {/* Top Countries */}
        <div className="pd-card">
          <div className="pd-card-top"><h3>Top Countries</h3></div>
          <div className="pd-an-countries">
            {topCountries.map((c) => (
              <div key={c.country} className="pd-an-country-row">
                <span className="pd-an-country-name">{c.country}</span>
                <div className="pd-an-country-bar-wrap">
                  <div className="pd-an-country-bar" style={{ width: `${(c.pct / 28) * 100}%` }} />
                </div>
                <span className="pd-an-country-views">{c.views.toLocaleString()}</span>
                <span className="pd-an-country-pct">{c.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Referrers */}
        <div className="pd-card">
          <div className="pd-card-top"><h3>Top Referrers</h3></div>
          <div className="pd-an-referrers">
            {topReferrers.map((r, i) => (
              <div key={r.source} className="pd-an-ref-row">
                <span className="pd-an-ref-rank">{i + 1}</span>
                <div className="pd-an-ref-info">
                  <span className="pd-an-ref-source">{r.source}</span>
                  <span className="pd-an-ref-visits">{r.visits.toLocaleString()} visits</span>
                </div>
                <span className={`pd-stat-chg ${r.change.startsWith("+") ? "pd-stat-chg--up" : "pd-stat-chg--dn"}`}>
                  {r.change.startsWith("+") ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {r.change}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Listings Tab ─── */
const statusFilters = ["All", "Active", "Pending", "Inactive"];

function ListingsTab() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [openMenu, setOpenMenu] = useState(null);

  const filtered = listings.filter((l) => {
    const matchSearch =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.category.toLowerCase().includes(search.toLowerCase()) ||
      l.location.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "All" || l.status === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  const counts = {
    all: listings.length,
    active: listings.filter((l) => l.status === "active").length,
    pending: listings.filter((l) => l.status === "pending").length,
    inactive: listings.filter((l) => l.status === "inactive").length,
  };

  return (
    <>
      <header className="pd-head pd-anim pd-a1">
        <div>
          <h1 className="pd-title">My Listings</h1>
          <p className="pd-subtitle">Manage and monitor all your business listings</p>
        </div>
        <div className="pd-actions">
          <Link to="/partners/add-listing" className="pd-btn pd-btn--fill">
            <Plus size={17} strokeWidth={2.2} />
            Add a Listing
          </Link>
        </div>
      </header>

      {/* Summary cards */}
      <div className="pd-ml-summary pd-anim pd-a2">
        {statusFilters.map((s) => {
          const key = s.toLowerCase();
          const count = counts[key];
          const isActive = statusFilter === s;
          return (
            <button
              key={s}
              className={`pd-ml-summary-card${isActive ? " pd-ml-summary-card--on" : ""}`}
              onClick={() => setStatusFilter(s)}
            >
              <span className="pd-ml-summary-count">{count}</span>
              <span className="pd-ml-summary-label">{s}</span>
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
      </div>

      {/* Listings */}
      <div className="pd-ml-list pd-anim pd-a3">
        {filtered.length === 0 ? (
          <div className="pd-ml-empty">
            <Store size={40} strokeWidth={1.2} />
            <h4>No listings found</h4>
            <p>Try adjusting your search or filter</p>
          </div>
        ) : (
          filtered.map((l) => (
            <div key={l.name} className="pd-ml-card">
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
                      onClick={() => setOpenMenu(openMenu === l.name ? null : l.name)}
                    >
                      <MoreVertical size={16} strokeWidth={2} />
                    </button>
                    {openMenu === l.name && (
                      <div className="pd-ml-card-dropdown">
                        <button className="pd-ml-dropdown-item" onClick={() => navigate(`/partners/edit-listing/${toSlug(l.name)}`)}>
                          <Pencil size={14} /> Edit Listing
                        </button>
                        <button className="pd-ml-dropdown-item">
                          <ExternalLink size={14} /> View Live
                        </button>
                        <button className="pd-ml-dropdown-item pd-ml-dropdown-item--danger">
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <p className="pd-ml-card-desc">{l.description}</p>

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
                  <Star size={14} fill="#F59E0B" stroke="#F59E0B" />
                  <span className="pd-ml-card-stat-val">{l.rating}</span>
                  <span className="pd-ml-card-stat-lbl">rating</span>
                </div>
                <div className="pd-ml-card-stat">
                  <Clock size={14} strokeWidth={1.8} />
                  <span className="pd-ml-card-stat-val">{l.created}</span>
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

/* ─── Billing Tab ─── */
function BillingTab() {
  const currentPlan = plans.find((p) => p.current);

  return (
    <>
      <header className="pd-head pd-anim pd-a1">
        <div>
          <h1 className="pd-title">Billing</h1>
          <p className="pd-subtitle">Manage your subscription, payment method, and invoices</p>
        </div>
      </header>

      {/* Current Plan Banner */}
      <div className="pd-billing-banner pd-anim pd-a2">
        <div className="pd-billing-banner-left">
          <div className="pd-billing-plan-badge">
            <Crown size={14} strokeWidth={2} />
            Pro Plan
          </div>
          <div className="pd-billing-price">
            <span className="pd-billing-price-amt">$49</span>
            <span className="pd-billing-price-per">/month</span>
          </div>
          <p className="pd-billing-renew">
            <Calendar size={13} />
            Next billing date: <strong>April 1, 2026</strong>
          </p>
        </div>
        <div className="pd-billing-banner-right">
          <div className="pd-billing-usage">
            <div className="pd-billing-usage-row">
              <span>Listings used</span>
              <span className="pd-billing-usage-val">3 / 10</span>
            </div>
            <div className="pd-billing-usage-bar">
              <div className="pd-billing-usage-fill" style={{ width: "30%" }} />
            </div>
          </div>
          <div className="pd-billing-usage">
            <div className="pd-billing-usage-row">
              <span>AI Boosts used</span>
              <span className="pd-billing-usage-val">7 / 20</span>
            </div>
            <div className="pd-billing-usage-bar">
              <div className="pd-billing-usage-fill" style={{ width: "35%" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Plans */}
      <div className="pd-anim pd-a3">
        <h3 className="pd-billing-section-title">Change Plan</h3>
        <div className="pd-billing-plans">
          {plans.map((p) => (
            <div key={p.name} className={`pd-billing-plan-card${p.current ? " pd-billing-plan-card--active" : ""}`}>
              {p.popular && <span className="pd-billing-popular">Most Popular</span>}
              <h4 className="pd-billing-plan-name">{p.name}</h4>
              <div className="pd-billing-plan-price">
                <span className="pd-billing-plan-amt">{p.price}</span>
                <span className="pd-billing-plan-per">{p.period}</span>
              </div>
              <ul className="pd-billing-plan-features">
                {p.features.map((f) => (
                  <li key={f}>
                    <CheckCircle size={14} strokeWidth={2} />
                    {f}
                  </li>
                ))}
              </ul>
              <button className={`pd-btn ${p.current ? "pd-btn--ghost pd-btn--current" : "pd-btn--fill"}`}>
                {p.current ? "Current Plan" : "Upgrade"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <div className="pd-card pd-anim pd-a3" style={{ marginTop: 24 }}>
        <div className="pd-card-top">
          <h3>Payment Method</h3>
          <button className="pd-link">Update <Pencil size={13} /></button>
        </div>
        <div className="pd-billing-payment">
          <div className="pd-billing-card-icon">
            <CreditCard size={22} strokeWidth={1.5} />
          </div>
          <div className="pd-billing-card-info">
            <span className="pd-billing-card-number">Visa ending in 4242</span>
            <span className="pd-billing-card-exp">Expires 08/2028</span>
          </div>
          <span className="pd-badge pd-badge--active">Default</span>
        </div>
      </div>

      {/* Invoices */}
      <div className="pd-card pd-anim pd-a4">
        <div className="pd-card-top">
          <h3>Invoice History</h3>
          <button className="pd-link">Download All <Download size={13} /></button>
        </div>
        <div className="pd-billing-invoices">
          <div className="pd-billing-invoice-header">
            <span>Invoice</span>
            <span>Date</span>
            <span>Plan</span>
            <span>Amount</span>
            <span>Status</span>
            <span></span>
          </div>
          {invoices.map((inv) => (
            <div key={inv.id} className="pd-billing-invoice-row">
              <span className="pd-billing-invoice-id">{inv.id}</span>
              <span className="pd-billing-invoice-date">{inv.date}</span>
              <span className="pd-billing-invoice-plan">{inv.plan}</span>
              <span className="pd-billing-invoice-amount">{inv.amount}</span>
              <span className={`pd-badge pd-badge--${inv.status}`}>
                <CheckCircle size={11} /> Paid
              </span>
              <button className="pd-billing-invoice-dl">
                <Download size={14} strokeWidth={1.8} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ─── Settings Tab ─── */
function SettingsTab() {
  const [notifs, setNotifs] = useState({
    newBookings: true,
    weeklyReport: true,
    listingUpdates: false,
    promotions: false,
  });

  const [profileOpen, setProfileOpen] = useState(true);
  const [notifsOpen, setNotifsOpen] = useState(true);
  const [securityOpen, setSecurityOpen] = useState(true);

  const toggleNotif = (key) =>
    setNotifs((prev) => ({ ...prev, [key]: !prev[key] }));

  const notifItems = [
    { key: "newBookings", label: "New bookings & inquiries", desc: "Get notified when a traveler books or contacts you" },
    { key: "weeklyReport", label: "Weekly performance report", desc: "Receive a summary of your listings' performance every Monday" },
    { key: "listingUpdates", label: "Listing review updates", desc: "Notifications when your listings are approved or need changes" },
    { key: "promotions", label: "Promotions & tips", desc: "Occasional tips to improve your listings and grow your business" },
  ];

  return (
    <>
      <header className="pd-head pd-anim pd-a1">
        <div>
          <h1 className="pd-title">Settings</h1>
          <p className="pd-subtitle">Manage your account preferences and security</p>
        </div>
      </header>

      {/* ── Business Profile ── */}
      <div className="pd-set-section pd-anim pd-a2">
        <button className="pd-set-section-header" onClick={() => setProfileOpen(!profileOpen)}>
          <div className="pd-set-section-left">
            <div className="pd-set-section-icon">
              <Building2 size={18} strokeWidth={1.7} />
            </div>
            <div>
              <h3 className="pd-set-section-title">Business Profile</h3>
              <p className="pd-set-section-desc">Your business information visible to travelers</p>
            </div>
          </div>
          <ChevronDown size={18} className={`pd-set-chevron${profileOpen ? " pd-set-chevron--open" : ""}`} />
        </button>

        {profileOpen && (
          <div className="pd-set-section-body">
            <div className="pd-set-field-grid">
              <div className="pd-set-field">
                <label className="pd-set-label">Business Name</label>
                <div className="pd-set-input-wrap">
                  <Building2 size={16} strokeWidth={1.7} className="pd-set-input-icon" />
                  <input type="text" className="pd-set-input" defaultValue="Sunset Hospitality Group" />
                </div>
              </div>

              <div className="pd-set-field">
                <label className="pd-set-label">Contact Email</label>
                <div className="pd-set-input-wrap">
                  <Mail size={16} strokeWidth={1.7} className="pd-set-input-icon" />
                  <input type="email" className="pd-set-input" defaultValue="hello@sunsethospitality.com" />
                </div>
              </div>

              <div className="pd-set-field">
                <label className="pd-set-label">Phone Number</label>
                <div className="pd-set-input-wrap">
                  <Phone size={16} strokeWidth={1.7} className="pd-set-input-icon" />
                  <input type="tel" className="pd-set-input" defaultValue="+971 4 123 4567" />
                </div>
              </div>

              <div className="pd-set-field">
                <label className="pd-set-label">Website</label>
                <div className="pd-set-input-wrap">
                  <Globe size={16} strokeWidth={1.7} className="pd-set-input-icon" />
                  <input type="url" className="pd-set-input" defaultValue="https://sunsethospitality.com" />
                </div>
              </div>
            </div>

            <div className="pd-set-field" style={{ marginTop: 4 }}>
              <label className="pd-set-label">Business Description</label>
              <textarea
                className="pd-set-textarea"
                rows={3}
                defaultValue="A leading hospitality group offering premium dining, nightlife, and wellness experiences across the Middle East and beyond."
              />
            </div>

            <div className="pd-set-field-actions">
              <button className="pd-btn pd-btn--fill">Save Changes</button>
            </div>
          </div>
        )}
      </div>

      {/* ── Notifications ── */}
      <div className="pd-set-section pd-anim pd-a3">
        <button className="pd-set-section-header" onClick={() => setNotifsOpen(!notifsOpen)}>
          <div className="pd-set-section-left">
            <div className="pd-set-section-icon">
              <Bell size={18} strokeWidth={1.7} />
            </div>
            <div>
              <h3 className="pd-set-section-title">Notifications</h3>
              <p className="pd-set-section-desc">Choose what email notifications you receive</p>
            </div>
          </div>
          <ChevronDown size={18} className={`pd-set-chevron${notifsOpen ? " pd-set-chevron--open" : ""}`} />
        </button>

        {notifsOpen && (
          <div className="pd-set-section-body">
            {notifItems.map((item) => (
              <div key={item.key} className="pd-set-toggle-row">
                <div className="pd-set-toggle-info">
                  <span className="pd-set-toggle-label">{item.label}</span>
                  <span className="pd-set-toggle-desc">{item.desc}</span>
                </div>
                <button
                  className={`pd-set-toggle${notifs[item.key] ? " pd-set-toggle--on" : ""}`}
                  onClick={() => toggleNotif(item.key)}
                >
                  <span className="pd-set-toggle-knob" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Security ── */}
      <div className="pd-set-section pd-anim pd-a3">
        <button className="pd-set-section-header" onClick={() => setSecurityOpen(!securityOpen)}>
          <div className="pd-set-section-left">
            <div className="pd-set-section-icon">
              <Shield size={18} strokeWidth={1.7} />
            </div>
            <div>
              <h3 className="pd-set-section-title">Security</h3>
              <p className="pd-set-section-desc">Password and authentication settings</p>
            </div>
          </div>
          <ChevronDown size={18} className={`pd-set-chevron${securityOpen ? " pd-set-chevron--open" : ""}`} />
        </button>

        {securityOpen && (
          <div className="pd-set-section-body">
            <div className="pd-set-security-item">
              <div className="pd-set-security-info">
                <div className="pd-set-security-icon">
                  <Lock size={16} strokeWidth={1.7} />
                </div>
                <div>
                  <h4 className="pd-set-security-title">Password</h4>
                  <p className="pd-set-security-desc">Last changed 3 months ago</p>
                </div>
              </div>
              <button className="pd-btn pd-btn--ghost">Change Password</button>
            </div>

            <div className="pd-set-security-item">
              <div className="pd-set-security-info">
                <div className="pd-set-security-icon">
                  <Shield size={16} strokeWidth={1.7} />
                </div>
                <div>
                  <h4 className="pd-set-security-title">Two-Factor Authentication</h4>
                  <p className="pd-set-security-desc">Add an extra layer of security to your account</p>
                </div>
              </div>
              <button className="pd-btn pd-btn--ghost">Enable 2FA</button>
            </div>
          </div>
        )}
      </div>

      {/* ── Danger Zone ── */}
      <div className="pd-set-section pd-set-section--danger pd-anim pd-a4">
        <div className="pd-set-danger-content">
          <div className="pd-set-danger-info">
            <div className="pd-set-section-icon pd-set-section-icon--danger">
              <AlertCircle size={18} strokeWidth={1.7} />
            </div>
            <div>
              <h3 className="pd-set-section-title">Delete Account</h3>
              <p className="pd-set-section-desc">Permanently remove your account and all associated data. This action cannot be undone.</p>
            </div>
          </div>
          <button className="pd-btn pd-btn--danger">Delete Account</button>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════ */

export default function PartnerDashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const v = useCounter(4200, 1400, 200);
  const cl = useCounter(1340, 1400, 300);
  const cr = useCounter(32, 1200, 400);
  const rev = useCounter(2850, 1400, 500);

  const stats = [
    { label: "Total Views", value: v.toLocaleString(), change: "+12.5%", up: true, icon: Eye, spark: [120,180,150,260,220,310,290] },
    { label: "Total Clicks", value: cl.toLocaleString(), change: "+8.3%", up: true, icon: MousePointerClick, spark: [40,65,55,90,75,100,95] },
    { label: "Conv. Rate", value: `${cr}%`, change: "-2.1%", up: false, icon: TrendingUp, spark: [38,35,40,34,36,32,33] },
    { label: "Revenue", value: `$${rev.toLocaleString()}`, change: "+18.7%", up: true, icon: DollarSign, spark: [400,520,480,680,620,800,760] },
  ];

  return (
    <div className="pd-layout">
      {/* ── Sidebar ── */}
      <aside className="pd-sidebar">
        <div>
          <Link to="/" className="pd-logo">
            <img src={PlanieLogo} alt="Planie" />
          </Link>
          <nav className="pd-nav">
            {navItems.map((n) => {
              const I = n.icon;
              return (
                <button key={n.label} className={`pd-nav-btn${activeTab === n.label ? " pd-nav-btn--on" : ""}`} onClick={() => setActiveTab(n.label)}>
                  <I size={18} strokeWidth={1.7} />
                  <span>{n.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
        <Link to="/partners/login" className="pd-nav-btn pd-nav-btn--out">
          <LogOut size={18} strokeWidth={1.7} />
          <span>Sign Out</span>
        </Link>
      </aside>

      {/* ── Main ── */}
      <main className="pd-main">
        {activeTab === "My Listings" ? (
          <ListingsTab />
        ) : activeTab === "Analytics" ? (
          <AnalyticsTab />
        ) : activeTab === "Billing" ? (
          <BillingTab />
        ) : activeTab === "Settings" ? (
          <SettingsTab />
        ) : (
          <>
            {/* Header */}
            <header className="pd-head pd-anim pd-a1">
              <div>
                <h1 className="pd-title">Hello, Business</h1>
                <p className="pd-subtitle">Here's how your listings are performing this week</p>
              </div>
              <div className="pd-actions">
                <button className="pd-btn pd-btn--ghost" onClick={() => setActiveTab("My Listings")}>
                  <Pencil size={15} strokeWidth={2} />
                  Edit Listing
                </button>
                <Link to="/partners/add-listing" className="pd-btn pd-btn--fill">
                  <Plus size={17} strokeWidth={2.2} />
                  Add a Listing
                </Link>
              </div>
            </header>

            {/* Stats */}
            <div className="pd-stats pd-anim pd-a2">
              {stats.map((s) => {
                const I = s.icon;
                return (
                  <div key={s.label} className="pd-stat">
                    <div className="pd-stat-top">
                      <I size={16} strokeWidth={1.8} className="pd-stat-ico" />
                      <span className="pd-stat-lbl">{s.label}</span>
                    </div>
                    <div className="pd-stat-mid">
                      <span className="pd-stat-val">{s.value}</span>
                      <span className={`pd-stat-chg ${s.up ? "pd-stat-chg--up" : "pd-stat-chg--dn"}`}>
                        {s.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {s.change}
                      </span>
                    </div>
                    <Sparkline data={s.spark} />
                  </div>
                );
              })}
            </div>

            {/* Charts */}
            <div className="pd-row pd-anim pd-a3">
              <div className="pd-card pd-card--grow">
                <div className="pd-card-top">
                  <h3>Weekly Performance</h3>
                  <div className="pd-legend">
                    <span><span className="pd-dot" style={{background:"#FF4040"}} />Views</span>
                    <span><span className="pd-dot" style={{background:"#11181C",opacity:0.25}} />Clicks</span>
                  </div>
                </div>
                <PerfChart />
              </div>

              <div className="pd-card pd-card--side">
                <div className="pd-card-top"><h3>Traffic Sources</h3></div>
                <div className="pd-donut-wrap">
                  <Donut />
                  <div className="pd-donut-ctr">
                    <span className="pd-donut-num">4.2K</span>
                    <span className="pd-donut-lbl">visits</span>
                  </div>
                </div>
                <div className="pd-src-list">
                  {sources.map((s) => (
                    <div key={s.label} className="pd-src">
                      <span className="pd-dot" style={{ background: s.color }} />
                      <span className="pd-src-name">{s.label}</span>
                      <span className="pd-src-pct">{s.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Listings */}
            <div className="pd-card pd-anim pd-a4">
              <div className="pd-card-top">
                <h3>Your Listings</h3>
                <button className="pd-link" onClick={() => setActiveTab("My Listings")}>View All <ChevronRight size={14} /></button>
              </div>
              <div className="pd-list">
                {listings.map((l) => (
                  <div key={l.name} className="pd-item">
                    <div className="pd-item-av">
                      <Store size={18} strokeWidth={1.6} />
                    </div>
                    <div className="pd-item-info">
                      <h4>{l.name}</h4>
                      <p>
                        <span>{l.category}</span>
                        <span className="pd-item-loc"><MapPin size={11} />{l.location}</span>
                      </p>
                    </div>
                    <div className="pd-item-nums">
                      <span><Star size={13} fill="#F59E0B" stroke="#F59E0B" />{l.rating}</span>
                      <span><Eye size={13} />{l.views.toLocaleString()}</span>
                    </div>
                    <span className={`pd-badge pd-badge--${l.status}`}>
                      {l.status === "active" ? "Active" : "Pending"}
                    </span>
                    <Link to={`/partners/edit-listing/${toSlug(l.name)}`} className="pd-item-edit">
                      <Pencil size={14} strokeWidth={1.8} />
                    </Link>
                  </div>
                ))}
              </div>
              <Link to="/partners/add-listing" className="pd-add-cta">
                <Plus size={18} strokeWidth={2} />
                <span>Add a New Listing</span>
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
