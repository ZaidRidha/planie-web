import { useState } from "react";

const CORAL  = "#FF6B5B";
const DARK   = "#0f0f0f";
const CARD   = "#161616";
const CARD2  = "#1a1a1a";
const WHITE  = "#f5f0eb";
const GREY   = "#6b6b6b";
const LGREY  = "#2a2a2a";
const GREEN  = "#4ade80";
const RED    = "#ef4444";
const AMBER  = "#f59e0b";
const BLUE   = "#60a5fa";

const CHECK  = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="7.5" fill="#0a1f0a" stroke="#4ade8044"/>
    <path d="M4.5 8.5L6.5 10.5L11.5 5.5" stroke={GREEN} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CROSS = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="7.5" fill="#1a0a0a" stroke="#ef444422"/>
    <path d="M5.5 5.5L10.5 10.5M10.5 5.5L5.5 10.5" stroke="#444" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const CREDIT = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="7.5" fill="#0a0f1f" stroke="#60a5fa44"/>
    <text x="8" y="11.5" textAnchor="middle" fill={BLUE} fontSize="8" fontWeight="700">£</text>
  </svg>
);

const sections = [
  {
    id: "profile", label: "Profile & Presence", icon: "◎",
    rows: [
      { label: "Business Profile setup (account)", sub: "One Business Profile per operator — your account, login, billing, and brand assets. Free for all tiers regardless of how many venue listings sit beneath it.", listed: "check", partner: "check", featured: "check" },
      { label: "Venue listing — up to 5 photos + description", sub: "Each venue listing (individual location) gets up to 5 location-specific photos and a description. Applied per listing, not per business. A Business Profile can hold multiple listings each with their own photos.", listed: "check", partner: "check", featured: "check" },
      { label: "Booking link per venue listing (WebView)", sub: "Each venue listing has its own booking URL that opens inside the Planie app. Configured per listing — a chain's Shoreditch and Soho venues have separate booking links. No commission tracking at Listed tier.", listed: "check", partner: "check", featured: "check" },
      { label: "Appears in AI itineraries, Discovery & guides (passive)", sub: "Each venue listing can appear across all three Planie consumer surfaces — AI-generated itineraries, the Discovery feed, and AI local guides (e.g. Best date night spots in Shoreditch). Placement is passive at this tier, ranked by Google data alone — rating, review count, proximity, category, and opening hours. No active control over when or how prominently you appear.", listed: "check", partner: "check", featured: "check" },
      { label: "Occasion tags — profile categorisation", sub: "Select the occasion types your venue suits — date night, family, groups, corporate. Available at all tiers so Planie can categorise every venue correctly from day one. At Listed tier these are descriptive only and do not influence ranking. Partner and Featured tiers activate these as weighted signals across all recommendation surfaces.", listed: "check", partner: "check", featured: "check" },
      { label: "Optional ROI Reporting", sub: "Optional fields per venue listing — estimated average booking value and average group size. Used only to show estimated revenue Planie drives in your dashboard (e.g. 12 bookings x £55 avg = £660 estimated). Never used for billing. Billing is always based on confirmed booking events only.", listed: "check", partner: "check", featured: "check" },
      { label: "Weighted ranking across itineraries, Discovery & guides", sub: "Your weighted occasion tags actively influence your ranking across all three surfaces. A restaurant weighted for date night is more likely to appear in date night itinerary slots, the date night Discovery filter, and date night AI guides — not just when your Google rating happens to rank you.", listed: "cross", partner: "check", featured: "check" },
      { label: "Priority placement across all surfaces", sub: "Your venue listing is weighted highest in Planie's recommendation engine across itineraries, Discovery, and AI guides — appearing more often, earlier, and in more occasion contexts than Partner venues.", listed: "cross", partner: "cross", featured: "check" },
      { label: "Enhanced venue listing — unlimited photos", sub: "Unlimited location-specific photos per venue listing. Also unlocks brand-level assets on the Business Profile — logo and lifestyle imagery that act as a fallback across all listings. Rich listings perform significantly better in recommendations.", listed: "cross", partner: "check", featured: "check" },
      { label: "Weighted occasion tags per listing", sub: "Each listing's occasion tags become active AI signals, configured independently per location. A chain can weight one listing for groups and another for date night to maximise relevance across their estate.", listed: "cross", partner: "check", featured: "check" },
      { label: "Active offers and promotions", sub: "Create time-limited deals — e.g. 20% off Tuesday bookings via Planie — that surface to relevant users in discovery and during itinerary planning.", listed: "cross", partner: "check", featured: "check" },
      { label: "Curated occasion collections", sub: "Featured in themed venue lists inside the app — e.g. Best Date Night Restaurants in London. These collections are browsed independently by users, giving you a persistent high-visibility placement.", listed: "cross", partner: "check", featured: "check" },
      { label: "Video content per venue listing", sub: "A short walkthrough or atmosphere reel per venue listing — showing the specific space at that location, not a generic brand video.", listed: "cross", partner: "cross", featured: "check" },
      { label: "Homepage and category feature slots", sub: "Limited-inventory placements on the Planie homepage and category pages. Genuine scarcity ensures this remains premium and high-visibility.", listed: "cross", partner: "cross", featured: "check" },
      { label: "Verified Featured badge per listing", sub: "A visible Featured badge applied at the venue listing level. Each Featured listing earns its own badge independently, visible when users browse that specific location.", listed: "cross", partner: "cross", featured: "check" },
      { label: "Planie Recommended designation", sub: "Displayed in occasion-specific searches — users planning a date night see your venue marked as Planie Recommended, increasing click-through.", listed: "cross", partner: "cross", featured: "check" },
    ]
  },
  {
    id: "geo", label: "GEO Score", icon: "◈",
    rows: [
      { label: "Per-listing GEO Score (read-only)", sub: "Each venue listing has its own GEO Score out of 100 — visible at all tiers but opaque at Listed. You can see the number for each location but not what drives it or how to improve it.", listed: "check", partner: "check", featured: "check" },
      { label: "Score driver breakdown", sub: "Understand exactly which factors are helping or hurting your score — profile completeness, booking conversion, occasion tag relevance, and more.", listed: "cross", partner: "check", featured: "check" },
      { label: "Actionable improvement checklist", sub: "Specific steps in the portal to improve your score — e.g. Add 3 more photos, Enable date night tag, Complete your venue description.", listed: "cross", partner: "check", featured: "check" },
      { label: "Score history and trend tracking", sub: "Track how your GEO Score changes over time as you improve your profile and accumulate bookings.", listed: "cross", partner: "check", featured: "check" },
      { label: "Significant change alerts", sub: "Get notified when your score moves significantly — up or down — so you can act on changes quickly.", listed: "cross", partner: "check", featured: "check" },
      { label: "Per-listing competitor benchmarking", sub: "See where each venue listing ranks against similar venues nearby — e.g. Your Shoreditch listing ranks 3rd of 8 Italian restaurants for date night. Each listing is benchmarked independently. Competitor names are anonymised.", listed: "cross", partner: "cross", featured: "check" },
      { label: "Predictive ranking insights", sub: "Forward-looking intelligence — e.g. Improving your occasion tags could move you from position 3 to 1 in date night recommendations. Helps you prioritise what to fix.", listed: "cross", partner: "cross", featured: "check" },
      { label: "Occasion-level GEO Scores per listing", sub: "Each venue listing gets a separate GEO Score per occasion type — date night, family, groups, corporate. Understand exactly where each location is strong and where there is room to grow.", listed: "cross", partner: "cross", featured: "check" },
    ]
  },
  {
    id: "analytics", label: "Analytics & Reporting", icon: "◇",
    rows: [
      { label: "Per-listing analytics dashboard", sub: "Each venue listing has its own analytics dashboard — viewable per listing or aggregated across all listings in the Business Profile group dashboard.", listed: "cross", partner: "check", featured: "check" },
      { label: "Estimated revenue driven (ROI view)", sub: "Uses self-reported average booking value and covers to show estimated total revenue Planie drove to your venue each month — e.g. 12 bookings × £55 avg = £660 estimated revenue, at £42 in fees = 6.4% effective rate. Clearly labelled as estimated. Billing line always shows flat fee only.", listed: "cross", partner: "check", featured: "check" },
      { label: "Booking completions and conversion rate", sub: "Track how many profile views converted into completed bookings through Planie and your overall conversion rate per listing.", listed: "cross", partner: "check", featured: "check" },
      { label: "Top occasion types driving traffic", sub: "See which occasions — date night, birthday, family — are sending the most users your way, so you can double down on what is working.", listed: "cross", partner: "check", featured: "check" },
      { label: "Monthly booking fee statement", sub: "A clear monthly breakdown of every Planie-attributed booking and the flat fee charged — per venue listing. Billing is based solely on confirmed booking events from session logs. No booking value needed for billing purposes.", listed: "cross", partner: "check", featured: "check" },
      { label: "Customer demographics (anonymised)", sub: "Aggregated data on who Planie is sending you — age range, group size, occasion type. Helps you understand your Planie audience and tailor your offering.", listed: "cross", partner: "cross", featured: "check" },
      { label: "Booking time and day patterns", sub: "See when Planie-driven customers tend to book and visit — which days, which time slots. Useful for staffing and promotional planning.", listed: "cross", partner: "cross", featured: "check" },
      { label: "Repeat visit tracking", sub: "What percentage of Planie-driven customers return for a second visit — a key indicator of whether Planie is sending you high-quality, loyal customers.", listed: "cross", partner: "cross", featured: "check" },
      { label: "Affinity Matrix audience insights", sub: "Understand why Planie recommends your venue to specific users — what interest signals make them a match. Helps you understand your Planie audience at a deeper level.", listed: "cross", partner: "cross", featured: "check" },
      { label: "Exportable monthly performance report", sub: "Download your full monthly performance data as a report — useful for sharing with stakeholders or feeding into your own analytics.", listed: "cross", partner: "cross", featured: "check" },
      { label: "Year-on-year comparison", sub: "Once 12 months of data exists, compare current performance against the same period last year.", listed: "cross", partner: "cross", featured: "check" },
    ]
  },
  {
    id: "bookings", label: "Bookings & Commission", icon: "◆",
    rows: [
      { label: "Basic booking link (no tracking)", sub: "Your existing booking URL is surfaced in the Planie app. Users tap through to your booking page in a WebView. No attribution tracking at Listed tier.", listed: "check", partner: "check", featured: "check" },
      { label: "Confirmation URL per venue listing", sub: "During onboarding, each venue listing provides its own confirmation URL pattern — booking platforms can differ per location. Planie detects when a user lands on that page within the WebView, confirming a completed booking. Commission is tracked per listing.", listed: "cross", partner: "check", featured: "check" },
      { label: "Flat fee per completed booking — active", sub: "A fixed flat fee per completed Planie-driven booking. Standard rates: Partner £4.50/booking, Featured £3.00/booking. Early adopter introductory rate (first 3 months): Partner £3.50/booking, Featured £2.00/booking — locked contractually from signup, full rate applies from month 4. One confirmation URL event = one fee, regardless of party size or booking value.", listed: "cross", partner: "£4.50", featured: "£3.00" },
      { label: "Booking event log in portal", sub: "A full log of every booking Planie has attributed to your venue listing — date, time, booking value, and commission charged. Full transparency on every transaction.", listed: "cross", partner: "check", featured: "check" },
      { label: "Monthly booking fee statement", sub: "A clear monthly booking fee summary — total bookings detected, flat fee per booking, and total amount due. Billing is always based on confirmed WebView session events only, never on self-reported booking values.", listed: "cross", partner: "check", featured: "check" },
      { label: "Early adopter introductory rate (first 3 months)", sub: "Venues signing up at launch pay a reduced flat fee for their first 3 months — Partner: £3.50/booking, Featured: £2.00/booking. The standard rate (Partner £4.50, Featured £3.00) applies from month 4 onwards. Introductory rate is locked contractually at signup — not a discount that can be withdrawn early. Designed to lower the barrier to signing before Planie has volume data to show.", listed: "cross", partner: "check", featured: "check" },
      { label: "Dispute process with session log", sub: "If you query a flat fee charge, Planie provides the session log showing WebView initiation and confirmation URL detection. If both are present the fee stands. Only valid dispute: confirmed technical error in URL pattern configuration.", listed: "cross", partner: "check", featured: "check" },
      { label: "Reduced flat fee per booking", sub: "Featured venues pay £3.00 per booking vs £4.50 on Partner — a reward for the higher fixed subscription. At 120 bookings/month the £1.50 saving (£180/mo) more than covers the £120/mo price uplift vs Partner. The upgrade becomes self-funding at volume.", listed: "cross", partner: "cross", featured: "check" },
    ]
  },
  {
    id: "campaigns", label: "Campaign & Promotional Tools", icon: "✦",
    rows: [
      { label: "Standard offers (discount or fixed)", sub: "Create an always-on promotion in your portal — e.g. 20% off bookings via Planie. Surfaced to relevant users in Discovery and itineraries. No slot limit.", listed: "cross", partner: "check", featured: "check" },
      { label: "Offers surfaced in discovery and itineraries", sub: "Your active offer appears alongside your venue in the Discovery feed and in AI-generated itineraries — giving users an extra incentive to book through Planie.", listed: "cross", partner: "check", featured: "check" },
      { label: "Occasion-targeted campaigns (self-serve, included)", sub: "Push a promotion to a targeted user segment based on occasion, location, and timing. Dynamic, behaviour-driven — multiple venues can run simultaneously. No slot inventory consumed. Unlimited, included in Featured subscription at no extra charge.", listed: "cross", partner: "cross", featured: "check" },
      { label: "Campaign performance reporting", sub: "See exactly how each campaign performed — impressions, profile clicks, and bookings driven. Covers both included campaign tools and purchased campaign slots.", listed: "cross", partner: "cross", featured: "check" },
      { label: "Exclusive right to purchase campaign slot inventory", sub: "Featured venues have exclusive access to purchase seasonal campaign slots across three surfaces. Listed and Partner venues cannot purchase slots at any price.", listed: "cross", partner: "cross", featured: "check" },
    ]
  },
  {
    id: "slots", label: "Campaign Slot Inventory (Purchased Separately — Featured Only)", icon: "◈",
    rows: [
      { label: "Homepage Strip slot", sub: "Featured venue strip on the Planie home screen — visible to all users opening the app in that city during the slot. 8 slots available per city per 2-week period. Slots are first-come first-served and visible in the portal. Price: £149 per slot.", listed: "cross", partner: "cross", featured: "£149" },
      { label: "Category page slot (per occasion)", sub: "Top-of-page featured placement in a specific occasion category — Date Night, Groups, Families, or Experiences. Each occasion has its own independent inventory pool. 6 slots per occasion per city per 2-week period. Price: £99 per slot.", listed: "cross", partner: "cross", featured: "£99" },
      { label: "AI guide placement (per occasion)", sub: "Featured placement within AI-generated local guides for a specific occasion type — e.g. Best Date Night spots in London. 5 slots per occasion per city per 2-week period. Price: £79 per slot.", listed: "cross", partner: "cross", featured: "£79" },
      { label: "Full campaign bundle (all 3 surfaces)", sub: "Homepage Strip + Category Page + AI Guide placement for the same 2-week slot in the same city. 15% saving vs purchasing individually (£327 separately vs £279 bundle). Draws from each surface inventory pool simultaneously.", listed: "cross", partner: "cross", featured: "£279" },
      { label: "Multi-slot discount (3+ consecutive slots)", sub: "10% off when purchasing 3 or more consecutive 2-week slots within the same seasonal window. Rewards sustained visibility and incentivises early booking across the full window.", listed: "cross", partner: "cross", featured: "check" },
      { label: "6 seasonal windows per year", sub: "New Year (Jan) · Valentine's (1-14 Feb, 1-week slots) · Spring (Apr-May) · Summer (Jun-Aug) · Halloween (Oct) · Christmas (Nov-Dec). Each window is divided into purchasable 2-week periods. A venue can buy multiple consecutive periods in the same window.", listed: "cross", partner: "cross", featured: "check" },
    ]
  },
  {
    id: "multisite", label: "Multi-site & Chain", icon: "⬡",
    rows: [
      { label: "Individual venue listings (per location)", sub: "Each physical location is a separate venue listing under the Business Profile — with its own GEO Score, photos, occasion tags, analytics, and booking tracking. Pricing is per venue listing.", listed: "check", partner: "check", featured: "check" },
      { label: "2-5 listings: 20% discount, unified billing", sub: "Businesses with 2-5 venue listings on the same tier get 20% off the per-listing price across all listings, with a single invoice managed at the Business Profile level.", listed: "cross", partner: "check", featured: "check" },
      { label: "Group dashboard (all listings in one view)", sub: "A Business Profile-level dashboard showing GEO Scores, booking performance, and analytics for all your venue listings side by side.", listed: "cross", partner: "check", featured: "check" },
      { label: "Bulk editing across venue listings", sub: "Apply changes — photos, descriptions, occasion tags, offers — across multiple venue listings simultaneously from the Business Profile.", listed: "cross", partner: "check", featured: "check" },
      { label: "6+ listings: custom enterprise pricing", sub: "Businesses with 6 or more venue listings are handled via a direct commercial conversation at the Business Profile level — bespoke pricing, dedicated support, and tailored reporting.", listed: "cross", partner: "check", featured: "check" },
      { label: "Cross-listing comparative analytics", sub: "Compare performance across all venue listings from the Business Profile dashboard — see which locations perform strongest on Planie and why.", listed: "cross", partner: "cross", featured: "check" },
      { label: "Brand-level GEO Score (Business Profile)", sub: "An aggregate GEO Score in the Business Profile dashboard. Only Featured venue listings contribute — a chain with 2 Partner and 1 Featured gets a brand score based on the Featured listing only.", listed: "cross", partner: "cross", featured: "check" },
      { label: "Chain-level campaign tools", sub: "Run a single campaign across multiple venue listings simultaneously from the Business Profile — e.g. a group-wide promotion that pushes each location to users in their respective areas.", listed: "cross", partner: "cross", featured: "check" },
      { label: "Dedicated account manager (enterprise)", sub: "Businesses with 6 or more Featured venue listings get a named Planie account manager working at the Business Profile level — single point of contact across the entire estate.", listed: "cross", partner: "cross", featured: "check" },
    ]
  },
  {
    id: "support", label: "Support & Onboarding", icon: "◉",
    rows: [
      { label: "Self-serve onboarding", sub: "Claim your profile, add photos, select occasion tags, and go live — all through the Planie partner portal without speaking to anyone.", listed: "check", partner: "check", featured: "check" },
      { label: "Help centre and documentation", sub: "Full documentation covering every feature of the partner portal, with step-by-step guides for setup, profile optimisation, and reading your analytics.", listed: "check", partner: "check", featured: "check" },
      { label: "Guided onboarding and URL configuration", sub: "A step-by-step onboarding checklist walks you through every setup step — including the confirmation URL configuration that activates commission tracking.", listed: "cross", partner: "check", featured: "check" },
      { label: "Portal onboarding checklist", sub: "A persistent checklist in your dashboard showing what is complete and what still needs setting up — so nothing falls through during onboarding.", listed: "cross", partner: "check", featured: "check" },
      { label: "Email support — 2 business days", sub: "Direct email access to the Planie partner support team with a 2 business day response SLA.", listed: "cross", partner: "check", featured: "check" },
      { label: "Priority email support — 4 hours", sub: "Featured venues are prioritised in the support queue with a 4-hour response SLA during business hours.", listed: "cross", partner: "cross", featured: "check" },
      { label: "Dedicated onboarding video call", sub: "A video call with the Planie partnerships team to walk through setup, configure your confirmation URL, and ensure everything is working before go-live.", listed: "cross", partner: "cross", featured: "check" },
      { label: "Quarterly performance review call", sub: "Every quarter, a Planie team member reviews your performance data with you — what is working, what to improve, and how to get more from your Featured tier.", listed: "cross", partner: "cross", featured: "check" },
      { label: "Early access to new B2B features", sub: "Featured venues get first access to new partner portal features before they roll out to Partner and Listed venues.", listed: "cross", partner: "cross", featured: "check" },
    ]
  },
  {
    id: "contract", label: "Contract Terms", icon: "◑",
    rows: [
      { label: "Monthly rolling (30 days notice)", sub: "Pay month to month with no long-term commitment. Cancel anytime with 30 days written notice.", listed: "check", partner: "check", featured: "check" },
      { label: "Annual commitment option", sub: "Commit to 12 months and save the equivalent of 2 months subscription. Pay monthly or upfront at the same price.", listed: "N/A", partner: "check", featured: "check" },
      { label: "Annual saving (2 months free)", sub: "The saving vs paying monthly for 12 months.", listed: "N/A", partner: "£149", featured: "£389" },
      { label: "Annual: monthly or upfront payment", sub: "Annual subscribers can pay monthly at the discounted rate or pay the full year upfront. Same price either way.", listed: "N/A", partner: "check", featured: "check" },
      { label: "3-month break clause", sub: "On annual plans, venues can exit after 3 months if Planie has not driven a minimum agreed number of bookings. Removes the risk of committing before results are proven.", listed: "N/A", partner: "check", featured: "check" },
      { label: "Auto-renewal (60 days notice)", sub: "Annual plans auto-renew at end of term. Planie notifies you 60 days before renewal — a clear window to reconsider, adjust your tier, or cancel.", listed: "N/A", partner: "check", featured: "check" },
    ]
  },
];

function CellValue({ value, col }) {
  if (value === "check") return <CHECK />;
  if (value === "cross") return <CROSS />;
  if (value === "N/A")   return <span style={{ fontSize: 11, color: "#333" }}>—</span>;

  const isComm = value === "8%" || value === "5%";
  const isSaving = value === "£149" || value === "£389";
  const color = col === "listed" ? GREY
    : col === "partner" ? "#818cf8"
    : CORAL;

  return (
    <span style={{
      fontSize: isComm ? 13 : 11,
      fontWeight: 700,
      color: isComm ? GREEN : isSaving ? AMBER : color,
      fontFamily: "monospace",
      letterSpacing: isComm ? "0.02em" : 0,
    }}>{value}</span>
  );
}

export default function PlanieB2BComparison() {
  const [openSections, setOpenSections] = useState(sections.map(() => true));
  const [hoveredRow, setHoveredRow] = useState(null);
  const [activeCol, setActiveCol] = useState(null);

  const toggle = i => setOpenSections(s => s.map((v, idx) => idx === i ? !v : v));

  const colDefs = [
    { key: "listed",   label: "Listed",   price: "Free",        sub: "forever",              accent: GREY,     bg: CARD },
    { key: "partner",  label: "Partner",  price: "£79",         sub: "/month or £799/year",  accent: "#6366f1", bg: "#0d0d1a" },
    { key: "featured", label: "Featured", price: "£199",        sub: "/month or £1,999/year", accent: CORAL,   bg: "#1a0d0a" },
  ];

  return (
    <div style={{ fontFamily: "'Georgia', 'Times New Roman', serif", background: DARK, minHeight: "100vh", color: WHITE }}>

      {/* Hero header */}
      <div style={{ padding: "40px 40px 32px", borderBottom: `1px solid #1e1e1e`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 15% 50%, ${CORAL}08 0%, transparent 55%), radial-gradient(ellipse at 85% 50%, #6366f108 0%, transparent 55%)` }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: CORAL }} />
            <span style={{ fontSize: 10, color: CORAL, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "sans-serif" }}>Planie · Business</span>
          </div>
          <h1 style={{ margin: "0 0 10px", fontSize: 30, fontWeight: 400, color: WHITE, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            Partner Tier Specification
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: GREY, fontFamily: "sans-serif", maxWidth: 480, lineHeight: 1.6 }}>
            Complete feature breakdown across all three venue partner tiers. Every inclusion, exclusion, and term — for internal use.
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            {colDefs.map(col => (
              <div key={col.key} onClick={() => setActiveCol(activeCol === col.key ? null : col.key)}
                style={{ padding: "8px 16px", borderRadius: 6, background: activeCol === col.key ? `${col.accent}22` : "#1a1a1a", border: `1px solid ${activeCol === col.key ? col.accent : "#2a2a2a"}`, cursor: "pointer", transition: "all 0.2s" }}>
                <span style={{ fontSize: 11, color: activeCol === col.key ? col.accent : GREY, fontWeight: 600, fontFamily: "sans-serif", textTransform: "uppercase", letterSpacing: "0.08em" }}>{col.label}</span>
              </div>
            ))}
            {activeCol && <button onClick={() => setActiveCol(null)} style={{ padding: "8px 14px", borderRadius: 6, background: "none", border: "1px solid #2a2a2a", cursor: "pointer", fontSize: 11, color: GREY, fontFamily: "sans-serif" }}>Clear filter</button>}
          </div>
        </div>
      </div>

      {/* Sticky column headers */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 150px 200px 220px", position: "sticky", top: 0, zIndex: 20, background: "#0f0f0f", borderBottom: "1px solid #1e1e1e" }}>
        <div style={{ padding: "14px 40px" }} />
        {colDefs.map(col => (
          <div key={col.key} style={{
            padding: "14px 16px", textAlign: "center",
            borderLeft: `1px solid ${col.accent}22`,
            background: col.key === "featured" ? `${CORAL}08` : col.key === "partner" ? "#6366f108" : "transparent",
            position: "relative"
          }}>
            {col.key === "featured" && (
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${CORAL}, transparent)` }} />
            )}
            <div style={{ fontSize: 10, color: col.accent, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "sans-serif", marginBottom: 3 }}>{col.label}</div>
            <div style={{ fontSize: 18, fontWeight: 400, color: WHITE, fontFamily: "sans-serif" }}>{col.price}</div>
            <div style={{ fontSize: 10, color: GREY, fontFamily: "sans-serif" }}>{col.sub}</div>
          </div>
        ))}
      </div>

      {/* Commission callout strip */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 150px 200px 220px", background: "#111", borderBottom: "1px solid #1e1e1e" }}>
        <div style={{ padding: "8px 40px" }}>
          <span style={{ fontSize: 10, color: GREY, fontFamily: "sans-serif", letterSpacing: "0.05em", textTransform: "uppercase" }}>Flat fee per Planie-driven booking</span>
        </div>
        {[
          { val: "None", color: GREY },
          { val: "£4.50", color: GREEN },
          { val: "£3.00", color: GREEN },
        ].map(({ val, color }, i) => (
          <div key={i} style={{ padding: "8px 16px", textAlign: "center", borderLeft: `1px solid #1e1e1e` }}>
            <span style={{ fontSize: 13, fontWeight: 700, color, fontFamily: "monospace" }}>{val}</span>
          </div>
        ))}
      </div>

      {/* Feature sections */}
      <div style={{ padding: "0 0 40px" }}>
        {sections.map((section, si) => (
          <div key={section.id} style={{ borderBottom: "1px solid #141414" }}>
            {/* Section header */}
            <button onClick={() => toggle(si)} style={{
              width: "100%", background: "none", border: "none", cursor: "pointer",
              padding: "16px 40px", display: "flex", alignItems: "center", gap: 10, textAlign: "left"
            }}>
              <span style={{ fontSize: 12, color: "#333", fontFamily: "sans-serif" }}>{section.icon}</span>
              <span style={{ fontSize: 11, letterSpacing: "0.12em", color: "#555", textTransform: "uppercase", fontFamily: "sans-serif", fontWeight: 600 }}>{section.label}</span>
              <div style={{ marginLeft: "auto", fontSize: 13, color: "#333", transform: openSections[si] ? "rotate(0)" : "rotate(-90deg)", transition: "transform 0.2s" }}>▾</div>
            </button>

            {/* Rows */}
            {openSections[si] && section.rows.map((row, ri) => {
              const rk = `${si}-${ri}`;
              const hi = hoveredRow === rk;
              return (
                <div key={ri}
                  onMouseEnter={() => setHoveredRow(rk)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{ display: "grid", gridTemplateColumns: "1fr 150px 200px 220px", background: hi ? "#161616" : "transparent", transition: "background 0.15s" }}>

                  {/* Label + sub */}
                  <div style={{ padding: "10px 40px 10px 52px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <span style={{ fontSize: 12.5, color: hi ? "#c8c0b0" : "#6a6258", fontFamily: "sans-serif", lineHeight: 1.4 }}>{row.label}</span>
                    {row.sub && hi && (
                      <span style={{ fontSize: 10.5, color: "#4a4540", fontFamily: "sans-serif", lineHeight: 1.55, marginTop: 3, maxWidth: 520 }}>{row.sub}</span>
                    )}
                  </div>

                  {/* Tier cells */}
                  {colDefs.map(col => {
                    const dimmed = activeCol && activeCol !== col.key;
                    return (
                      <div key={col.key} style={{
                        padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "center",
                        borderLeft: `1px solid #141414`,
                        background: col.key === "featured" ? `${CORAL}04` : col.key === "partner" ? "#6366f104" : "transparent",
                        opacity: dimmed ? 0.25 : 1, transition: "opacity 0.2s"
                      }}>
                        <CellValue value={row[col.key]} col={col.key} />
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Pricing footer */}
      <div style={{ padding: "32px 40px 48px", borderTop: "1px solid #1e1e1e", background: "#0a0a0a" }}>
        <div style={{ fontSize: 10, color: GREY, fontFamily: "sans-serif", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 20 }}>Pricing at a Glance</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 28 }}>
          {[
            { label: "Listed",   monthly: "Free",  annual: "Free",      comm: "None", saving: "—",    accent: GREY,     items: ["Self-serve onboarding", "Read-only GEO Score", "Basic booking link", "Help centre access"] },
            { label: "Partner",  monthly: "£79/mo", annual: "£799/yr",  comm: "£4.50",  saving: "£149",  accent: "#6366f1", items: ["Commission tracking", "Active GEO Score tools", "Basic analytics", "Email support"] },
            { label: "Featured", monthly: "£199/mo", annual: "£1,999/yr", comm: "£3.00", saving: "£389", accent: CORAL,    items: ["Priority AI placement", "Full analytics suite", "Campaign tools", "Quarterly review"] },
          ].map(tier => (
            <div key={tier.label} style={{ background: CARD, borderRadius: 10, padding: "20px 22px", border: `1px solid ${tier.accent}22`, position: "relative", overflow: "hidden" }}>
              {tier.label === "Featured" && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${CORAL}, transparent)` }} />}
              <div style={{ fontSize: 10, color: tier.accent, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "sans-serif", marginBottom: 10 }}>{tier.label}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
                {[["Monthly", tier.monthly], ["Annual", tier.annual], ["Fee/booking", tier.comm], ["Annual saving", tier.saving]].map(([l, v]) => (
                  <div key={l}>
                    <div style={{ fontSize: 10, color: GREY, fontFamily: "sans-serif", marginBottom: 2 }}>{l}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: l === "Commission" ? (v === "None" ? GREY : GREEN) : l === "Annual saving" && v !== "—" ? AMBER : WHITE, fontFamily: "monospace" }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: `1px solid #1e1e1e`, paddingTop: 12 }}>
                {tier.items.map(item => (
                  <div key={item} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                    <div style={{ width: 4, height: 4, borderRadius: "50%", background: tier.accent, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: GREY, fontFamily: "sans-serif" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Commission policy note */}
        <div style={{ background: CARD, borderRadius: 10, padding: "18px 22px", border: "1px solid #1e1e1e" }}>
          <div style={{ fontSize: 10, color: GREY, fontFamily: "sans-serif", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Commission Policy</div>
          <p style={{ margin: "0 0 6px", fontSize: 12, color: "#555", fontFamily: "sans-serif", lineHeight: 1.7 }}>
            A Planie-driven booking is defined as any booking completed within a Planie-initiated WebView session, confirmed by detection of the venue's designated confirmation URL pattern. A flat fee is charged per booking event — one confirmation URL detection equals one fee, regardless of party size or booking value. This is Planie's launch model; commission-based pricing (percentage of booking value) will be introduced as direct platform API integrations are established.
          </p>
          <p style={{ margin: 0, fontSize: 12, color: "#444", fontFamily: "sans-serif", lineHeight: 1.7 }}>
            <strong style={{ color: "#555" }}>Annual plans:</strong> 12-month commitment · paid monthly or upfront at same price · 3-month break clause · auto-renewal with 60 days notice · 20% multi-site discount for 2–5 sites · custom enterprise pricing for 6+ sites.
          </p>
        </div>
      </div>

      {/* Legend */}
      <div style={{ padding: "0 40px 32px", display: "flex", gap: 24, alignItems: "center" }}>
        {[
          { el: <CHECK />, label: "Included" },
          { el: <CROSS />, label: "Not available" },
          { el: <span style={{ fontSize: 11, color: GREEN, fontWeight: 700, fontFamily: "monospace" }}>8%</span>, label: "Commission rate" },
          { el: <span style={{ fontSize: 11, color: AMBER, fontWeight: 700, fontFamily: "monospace" }}>£149</span>, label: "Annual saving" },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 7 }}>
            {item.el}
            <span style={{ fontSize: 11, color: GREY, fontFamily: "sans-serif" }}>{item.label}</span>
          </div>
        ))}
        <div style={{ marginLeft: "auto", fontSize: 11, color: "#333", fontFamily: "sans-serif" }}>
          Click a tier header to highlight · Click a section to collapse
        </div>
      </div>
    </div>
  );
}
