import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, MapPin } from "lucide-react";
import { fetchAnalytics } from "../../utils/analytics";
import { useMyListings } from "./shared";
import "../PartnerDashboard.css";
import "./InsightsTab.css";

/* ─── Helpers ─── */
const fmtDay = (iso) => {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};
const fmtNum = (n) => (n || 0).toLocaleString();
const partyColors = ["#FF4040", "#1C1114", "rgba(28,17,20,0.45)", "rgba(28,17,20,0.18)", "rgba(28,17,20,0.08)"];

/* ─── Real time-series chart (views / clicks / saves from fetchAnalytics.series) ─── */
function SeriesChart({ labels, datasets }) {
  const w = 860, h = 250, padL = 40, padR = 8, padT = 14, padB = 30;
  const iw = w - padL - padR, ih = h - padT - padB;
  const n = labels.length;
  const maxV = Math.max(1, ...datasets.flatMap((d) => d.data));
  const svgRef = useRef(null);
  const [hoverIdx, setHoverIdx] = useState(null);

  const xAt = (i) => padL + (n > 1 ? (i / (n - 1)) * iw : iw / 2);
  const yAt = (v) => padT + ih - (v / maxV) * ih;
  const line = (data) => data.map((v, i) => `${i ? "L" : "M"}${xAt(i)},${yAt(v)}`).join(" ");
  const area = (data) => `${line(data)} L${xAt(n - 1)},${padT + ih} L${xAt(0)},${padT + ih} Z`;

  const onMove = (e) => {
    if (!svgRef.current || n < 1) return;
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * w;
    const frac = Math.max(0, Math.min(1, (svgX - padL) / iw));
    setHoverIdx(Math.round(frac * (n - 1)));
  };

  const tickCount = Math.min(n, 5);
  const ticks = tickCount > 1
    ? Array.from({ length: tickCount }, (_, k) => Math.round((k / (tickCount - 1)) * (n - 1)))
    : [0];

  const ttW = 156, ttLine = 18, ttPad = 12;
  const ttH = ttPad * 2 + ttLine * (datasets.length + 1) - 4;
  let ttX = 0, ttY = padT;
  if (hoverIdx !== null) {
    const hx = xAt(hoverIdx);
    ttX = hx + 14 + ttW > w ? hx - ttW - 14 : hx + 14;
    const topY = Math.min(...datasets.map((d) => yAt(d.data[hoverIdx] || 0)));
    ttY = Math.max(padT, Math.min(padT + ih - ttH, topY - ttH / 2));
  }

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${w} ${h}`}
      className="pi-chart"
      onMouseMove={onMove}
      onMouseLeave={() => setHoverIdx(null)}
      role="img"
      aria-label="Views, clicks and saves over the selected period"
    >
      <defs>
        {datasets.map((ds, di) => (
          <linearGradient key={di} id={`piGrad${di}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ds.color} stopOpacity={di === 0 ? 0.08 : 0.04} />
            <stop offset="100%" stopColor={ds.color} stopOpacity="0" />
          </linearGradient>
        ))}
      </defs>

      {[0, 0.5, 1].map((f) => {
        const y = padT + ih - f * ih;
        return (
          <g key={f}>
            <line x1={padL} y1={y} x2={w - padR} y2={y} className="pi-chart-grid" />
            <text x={padL - 10} y={y + 4} textAnchor="end" className="pi-chart-lbl">
              {maxV >= 1000 ? `${((f * maxV) / 1000).toFixed(1)}k` : Math.round(f * maxV)}
            </text>
          </g>
        );
      })}

      {ticks.map((i, k) => (
        <text
          key={i}
          x={xAt(i)}
          y={h - 6}
          textAnchor={k === 0 ? "start" : k === ticks.length - 1 ? "end" : "middle"}
          className="pi-chart-lbl"
        >
          {fmtDay(labels[i])}
        </text>
      ))}

      {datasets.map((ds, di) => (
        <g key={ds.label}>
          <path d={area(ds.data)} fill={`url(#piGrad${di})`} className="pi-chart-area" />
          <path
            d={line(ds.data)}
            fill="none"
            stroke={ds.color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength="1"
            className="pi-chart-line"
            style={{ animationDelay: `${0.2 + di * 0.15}s` }}
          />
        </g>
      ))}

      {hoverIdx !== null && (
        <g pointerEvents="none">
          <line x1={xAt(hoverIdx)} x2={xAt(hoverIdx)} y1={padT} y2={padT + ih} className="pi-chart-cursor" />
          {datasets.map((ds) => (
            <circle key={ds.label} cx={xAt(hoverIdx)} cy={yAt(ds.data[hoverIdx] || 0)} r="5" fill="#FAF7F1" stroke={ds.color} strokeWidth="2" />
          ))}
          <g transform={`translate(${ttX},${ttY})`}>
            <rect width={ttW} height={ttH} rx="10" fill="#1C1114" />
            <text x={ttPad} y={ttPad + 10} className="pi-tt-title">{fmtDay(labels[hoverIdx])}</text>
            {datasets.map((ds, di) => (
              <g key={ds.label} transform={`translate(${ttPad},${ttPad + ttLine * (di + 1) + 6})`}>
                <circle cx="4" cy="-4" r="4" fill={ds.color === "#1C1114" ? "#FAF7F1" : ds.color} />
                <text x="14" y="0" className="pi-tt-label">{ds.label}</text>
                <text x={ttW - ttPad * 2} y="0" textAnchor="end" className="pi-tt-value">{fmtNum(ds.data[hoverIdx])}</text>
              </g>
            ))}
          </g>
        </g>
      )}
    </svg>
  );
}

/* ─── Horizontal % bars (top value highlighted red, as in the handoff) ─── */
function Bars({ items, wide }) {
  const max = Math.max(...items.map((a) => a.pct));
  return (
    <div className="pi-bars">
      {items.map((a) => (
        <div key={a.label} className={`pi-bar-row${wide ? " pi-bar-row--wide" : ""}`}>
          <span className="pi-bar-label" title={a.label}>{a.label}</span>
          <div className="pi-bar-track">
            <div className={`pi-bar-fill${a.pct === max ? " pi-bar-fill--top" : ""}`} style={{ width: `${a.pct}%` }} />
          </div>
          <span className="pi-bar-val">{a.pct}%</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Analytics Tab ─── */
export function AnalyticsTab() {
  const { items: myListings } = useMyListings();
  const activeListings = (myListings || []).filter((l) => l.status === "active");
  const [selectedId, setSelectedId] = useState("all");
  const [range, setRange] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logTab, setLogTab] = useState("All");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchAnalytics(selectedId, range)
      .then((d) => { if (!cancelled) { setData(d); setError(null); } })
      .catch((e) => { if (!cancelled) setError(e.message || "Could not load insights."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [selectedId, range]);

  const empty = data && data.cohort === 0 && !(data.totals?.views);
  const suppressed = data && data.suppressed && !empty;
  const t = data?.totals || {};
  const topAge = data?.age?.[0]?.label;
  const topOrigin = data?.origin?.[0]?.label;
  const headline = empty ? "No insights yet."
    : topAge && topOrigin ? `Mostly ${topOrigin.toLowerCase()}, around ${topAge}.`
    : "Your audience is taking shape.";
  const dwellLabel = t.avgDwellMs ? `${(t.avgDwellMs / 1000).toFixed(1)}s` : "—";
  const selectedListing = activeListings.find((l) => l.id === selectedId);
  const scopeLabel = selectedListing ? selectedListing.name : "all your places";

  const metrics = [
    ["Views", fmtNum(t.views), `last ${range} days`],
    ["People", fmtNum(t.reach), "unique visitors"],
    ["Clicks", fmtNum(t.clicks), `last ${range} days`],
    ["Saves", fmtNum(t.saves), `last ${range} days`],
    ["Avg. dwell", dwellLabel, "per view"],
  ];

  const series = data?.series;
  const hasSeries = series && Array.isArray(series.labels) && series.labels.length > 0;
  const chartSets = hasSeries ? [
    { label: "Views", color: "#1C1114", data: series.views || [] },
    { label: "Clicks", color: "rgba(28,17,20,0.3)", data: series.clicks || [] },
    { label: "Saves", color: "#FF4040", data: series.saves || [] },
  ] : [];

  const recent = data?.recent || [];
  const surfaceTabs = ["All", ...Array.from(new Set(recent.map((e) => e.surface).filter(Boolean)))];
  const activeLogTab = surfaceTabs.includes(logTab) ? logTab : "All";
  const log = recent.filter((e) => activeLogTab === "All" || e.surface === activeLogTab);

  const topAsk = data?.asks?.[0]?.quote;
  const editHref = selectedListing ? `/partners/edit-listing/${selectedListing.id}` : null;

  const suppressNote = (
    <p className="pi-note">Not enough visitors yet to show this safely. It appears once at least {data?.minCohort ?? 15} people have discovered this venue.</p>
  );
  const noData = (msg = "No data yet.") => <p className="pi-note">{msg}</p>;

  return (
    <div className="pi-page">
      <header className="pi-header pd-anim pd-a1">
        <div>
          <p className="nu-microlabel pi-eyebrow">Insights</p>
          <h1 className="pi-title">Who Planie sends you.</h1>
          <p className="pi-lede">The people arriving through plans: where they came from, and what they were really looking for. Built from real activity as travellers discover your venues.</p>
        </div>
        <div className="pi-seg" role="group" aria-label="Period">
          {[7, 30, 90].map((r) => (
            <button key={r} type="button" onClick={() => setRange(r)} className={`pi-seg-btn${range === r ? " pi-seg-btn--on" : ""}`}>{r} days</button>
          ))}
        </div>
      </header>

      <div className="pi-seg pi-places pd-anim pd-a2" role="group" aria-label="Listing">
        <button type="button" onClick={() => setSelectedId("all")} className={`pi-seg-btn pi-seg-btn--lg${selectedId === "all" ? " pi-seg-btn--on" : ""}`}>All places</button>
        {activeListings.map((l) => (
          <button key={l.id} type="button" onClick={() => setSelectedId(l.id)} className={`pi-seg-btn pi-seg-btn--lg${selectedId === l.id ? " pi-seg-btn--on" : ""}`}>{l.name}</button>
        ))}
      </div>

      {loading ? (
        <div className="pi-loading pd-anim pd-a2" aria-live="polite">
          <span className="pi-loading-dot" /> Loading insights…
        </div>
      ) : error ? (
        <div className="pi-card pi-error pd-anim pd-a2" role="alert">
          <p className="pi-card-title">Couldn't load insights</p>
          <p className="pi-error-msg">{error}</p>
        </div>
      ) : empty ? (
        <div className="pi-empty pi-empty--page pd-anim pd-a2">
          <div className="pi-empty-icon"><TrendingUp size={25} strokeWidth={2} /></div>
          <p className="pi-empty-title">No insights yet</p>
          <p className="pi-empty-body">These fill in as travellers discover your venues through plans. Add and get a listing approved, then check back.</p>
        </div>
      ) : (
        <div className="pi-layout">
          <div className="pi-main">
            {/* Headline */}
            <section className="pd-anim pd-a2">
              <p className="pi-headline">{headline}</p>
            </section>

            {/* Metric band (real totals) */}
            <section className="pi-metrics pd-anim pd-a2">
              {metrics.map(([label, val, sub]) => (
                <div key={label} className="pi-metric">
                  <p className="pi-metric-label">{label}</p>
                  <p className="pi-metric-val">{val}</p>
                  <p className="pi-metric-sub">{sub}</p>
                </div>
              ))}
            </section>

            {/* Trend chart (real series) */}
            {hasSeries && (
              <section className="pi-section pd-anim pd-a2">
                <div className="pi-sec-head">
                  <div>
                    <h2 className="pi-h2">People finding you <span className="pi-h2-meta">· last {range} days</span></h2>
                    <p className="pi-sub">Daily activity across {scopeLabel}.</p>
                  </div>
                  <div className="pi-legend">
                    {chartSets.map((ds) => (
                      <span key={ds.label} className="pi-legend-item"><span className="pi-legend-swatch" style={{ background: ds.color }} />{ds.label}</span>
                    ))}
                  </div>
                </div>
                <div className="pi-chart-wrap">
                  <SeriesChart key={`${selectedId}-${range}`} labels={series.labels} datasets={chartSets} />
                </div>
              </section>
            )}

            {/* Demographics */}
            <section className="pi-section pi-demo pd-anim pd-a3">
              <div>
                <h2 className="pi-h2">Age</h2>
                <p className="pi-sub">Across plans that placed {scopeLabel}.</p>
                {suppressed ? suppressNote : data.age?.length ? <Bars items={data.age} /> : noData()}
              </div>
              <div>
                <h2 className="pi-h2">Where they come from</h2>
                <p className="pi-sub">Distance and travel intent.</p>
                {suppressed ? suppressNote : data.origin?.length ? <Bars items={data.origin} wide /> : noData()}
              </div>
              <div>
                <h2 className="pi-h2">Home countries</h2>
                <p className="pi-sub">Where your visitors are based.</p>
                {suppressed ? suppressNote : data.country?.length ? <Bars items={data.country} wide /> : noData()}
              </div>
            </section>

            {/* Asks */}
            <section className="pi-section pd-anim pd-a3">
              <h2 className="pi-h2">What they asked Planie for</h2>
              <p className="pi-sub">The desires behind the plans that included you, ranked by volume.</p>
              {data.asks?.length ? (
                <div className="pi-list">
                  {data.asks.map((ak) => (
                    <div key={ak.rank} className="pi-ask">
                      <span className="pi-ask-rank">{String(ak.rank).padStart(2, "0")}</span>
                      <p className="pi-ask-quote">“{ak.quote}”</p>
                      <span className="pi-ask-count">{fmtNum(ak.visits)} plans</span>
                    </div>
                  ))}
                </div>
              ) : noData("No occasion data yet.")}
            </section>

            {/* Party */}
            <section className="pi-section pd-anim pd-a3">
              <h2 className="pi-h2">Who they came with</h2>
              <p className="pi-sub">Party composition across plans that placed you.</p>
              {suppressed ? suppressNote : data.party?.length ? (
                <>
                  <div className="pi-stack">
                    {data.party.map((p, i) => (
                      <div key={p.label} className="pi-stack-seg" title={`${p.label} ${p.pct}%`} style={{ width: `${p.pct}%`, background: partyColors[i % partyColors.length] }} />
                    ))}
                  </div>
                  <div className="pi-stack-legend">
                    {data.party.map((p, i) => (
                      <span key={p.label} className="pi-stack-key">
                        <span className="pi-stack-swatch" style={{ background: partyColors[i % partyColors.length] }} />
                        <strong>{p.pct}%</strong> <span className="pi-muted">{p.label}</span>
                      </span>
                    ))}
                  </div>
                </>
              ) : noData()}
            </section>

            {/* Surfaces */}
            <section className="pi-section pd-anim pd-a4">
              <h2 className="pi-h2">Where you appeared <span className="pi-h2-meta">· last {range} days</span></h2>
              <p className="pi-sub">The surfaces that carried you into people's plans.</p>
              {data.surface?.length ? (
                <div className="pi-surfaces">
                  {data.surface.map((s, i) => (
                    <div key={s.name} className="pi-surface">
                      <p className="pi-metric-label">{s.name}</p>
                      <p className="pi-surface-val">{fmtNum(s.value)}</p>
                      <div className="pi-bar-track pi-bar-track--thin">
                        <div className={`pi-bar-fill${i === 0 ? " pi-bar-fill--top" : ""}`} style={{ width: `${s.share}%` }} />
                      </div>
                      <p className="pi-surface-note">{s.share}% of views{s.note ? ` · ${s.note}` : ""}</p>
                    </div>
                  ))}
                </div>
              ) : noData("No placements yet.")}
            </section>

            {/* Recent placements (real feed) */}
            <section className="pi-section pd-anim pd-a4">
              <div className="pi-sec-head pi-sec-head--center">
                <div>
                  <h2 className="pi-h2">Recent placements</h2>
                  <p className="pi-sub pi-sub--live"><span className="pi-pulse" />Every time a plan chose you.</p>
                </div>
                {surfaceTabs.length > 2 && (
                  <div className="pi-seg" role="group" aria-label="Filter by surface">
                    {surfaceTabs.map((s) => (
                      <button key={s} type="button" onClick={() => setLogTab(s)} className={`pi-seg-btn${activeLogTab === s ? " pi-seg-btn--on" : ""}`}>{s}</button>
                    ))}
                  </div>
                )}
              </div>
              {log.length ? (
                <div className="pi-log">
                  {log.map((e, i) => (
                    <div key={`${e.ts}-${i}`} className="pi-log-row">
                      <span className="pi-log-time">
                        {e.ts ? new Date(e.ts).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "—"}
                        {e.ts && <span className="pi-log-clock">{new Date(e.ts).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}</span>}
                      </span>
                      <div className="pi-log-main">
                        <p className="pi-log-plan">{e.occasion ? `“${e.occasion}”` : "A plan"}</p>
                        <p className="pi-log-slot">{e.listing || "A venue"}</p>
                      </div>
                      <span className="pi-log-surface">{e.surface || "—"}</span>
                      {e.party ? <span className="pi-chip">{e.party}</span> : <span />}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="pi-empty">
                  <div className="pi-empty-icon"><MapPin size={23} strokeWidth={2} /></div>
                  <p className="pi-empty-title">No placements in this period</p>
                  <p className="pi-empty-body">As soon as Planie places one of your venues in a plan, it'll appear here. Try a wider date range.</p>
                </div>
              )}
            </section>
          </div>

          {/* Right rail */}
          <aside className="pi-rail pd-anim pd-a3">
            <div className="pi-card pi-card--ink">
              <p className="pi-card-eyebrow">Do one thing</p>
              {topAsk ? (
                <>
                  <p className="pi-action-title">Lead with “{topAsk}”.</p>
                  <p className="pi-action-body">It's the most common ask behind plans that placed {scopeLabel}. Say it in the first line of your listing so Planie can match you to it more often.</p>
                </>
              ) : (
                <>
                  <p className="pi-action-title">Lead with the moment.</p>
                  <p className="pi-action-body">Open your listing with the experience guests come for, not the menu or the price list. Tips here get specific once people start asking Planie for you.</p>
                </>
              )}
              {editHref ? (
                <Link to={editHref} className="pi-action-cta">Edit listing</Link>
              ) : (
                <a href="#listings" className="pi-action-cta">Go to listings</a>
              )}
            </div>

            <div className="pi-card">
              <div className="pi-card-row">
                <p className="pi-card-title">Against your category</p>
                <span className="pi-soon">Soon</span>
              </div>
              <p className="pi-card-sub">Similar places in your cities</p>
              {["Conversion vs category", "Rating vs category", "Repeat visits"].map((label, i, arr) => (
                <div key={label} className={`pi-bench${i < arr.length - 1 ? " pi-bench--line" : ""}`}>
                  <span className="pi-muted">{label}</span>
                  <span className="pi-bench-val">—</span>
                </div>
              ))}
              <p className="pi-card-foot">Category benchmarks are coming soon. No figures are shown until they're live.</p>
            </div>

            <div className="pi-card">
              <div className="pi-card-row">
                <p className="pi-card-title">When plans place you</p>
                <span className="pi-soon">Soon</span>
              </div>
              <div className="pi-hours" aria-hidden="true">
                {[["12", 18], ["14", 26], ["16", 38], ["18", 62], ["20", 100], ["22", 54]].map(([label, hgt]) => (
                  <div key={label} className="pi-hours-col">
                    <div className="pi-hours-bar" style={{ height: `${hgt}%` }} />
                    <span className="pi-hours-lbl">{label}</span>
                  </div>
                ))}
              </div>
              <p className="pi-card-foot">Sample shape. Peak-hour analytics arrive with the Insights platform.</p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
