import AppShowcaseSection from "../Sections/AppShowcaseSection";
import UseCasesSection from "../Sections/UseCasesSection";
import "./HomePage.css";

/* ═══════════════════════════════════════════════════════
   Left Illustration — European landmarks
   ═══════════════════════════════════════════════════════ */
const LeftIllustration = () => (
  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[12%] xl:-translate-x-[5%] w-[300px] lg:w-[380px] xl:w-[430px] pointer-events-none select-none hidden lg:block">
    <div className="illustration-float">
      <svg
        viewBox="0 0 440 560"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background blob */}
        <path
          d="M220 50 C320 30, 400 120, 380 220 C360 320, 390 420, 320 480 C250 540, 130 520, 80 440 C30 360, 10 280, 40 200 C70 120, 120 70, 220 50Z"
          fill="#FFE8E0"
          opacity="0.5"
        />

        {/* ── Eiffel Tower ── */}
        <g transform="translate(155, 130)">
          {/* Left leg */}
          <path d="M30 220 L42 140 L48 140 L38 220Z" fill="#FF8A80" opacity="0.65" />
          {/* Right leg */}
          <path d="M82 220 L70 140 L64 140 L74 220Z" fill="#FF8A80" opacity="0.65" />
          {/* Middle body */}
          <path d="M48 140 L52 90 L55 90 L48 140Z" fill="#FF6B6B" opacity="0.7" />
          <path d="M64 140 L60 90 L57 90 L64 140Z" fill="#FF6B6B" opacity="0.7" />
          {/* Upper tower */}
          <path d="M52 90 L54 50 L56 30 L58 50 L60 90Z" fill="#FF4040" opacity="0.75" />
          {/* Antenna */}
          <rect x="55" y="10" width="2.5" height="24" rx="1" fill="#FF4040" opacity="0.6" />
          {/* Platforms */}
          <rect x="40" y="140" width="32" height="3.5" rx="1.5" fill="#FF4040" opacity="0.5" />
          <rect x="50" y="90" width="14" height="3" rx="1.5" fill="#FF4040" opacity="0.45" />
          {/* Arch */}
          <path
            d="M40 220 Q56 195 72 220"
            stroke="#FF4040"
            strokeWidth="2"
            fill="none"
            opacity="0.35"
          />
        </g>

        {/* ── Hot Air Balloon ── */}
        <g transform="translate(285, 55)">
          <ellipse cx="28" cy="30" rx="26" ry="30" fill="#FF4040" opacity="0.12" />
          <ellipse
            cx="28"
            cy="30"
            rx="26"
            ry="30"
            fill="none"
            stroke="#FF4040"
            strokeWidth="1.5"
            opacity="0.35"
          />
          {/* Stripe pattern */}
          <path d="M8 18 Q28 2 48 18" stroke="#FF6B6B" strokeWidth="1" fill="none" opacity="0.25" />
          <path d="M4 30 Q28 14 52 30" stroke="#FF6B6B" strokeWidth="1" fill="none" opacity="0.2" />
          {/* Ropes */}
          <line x1="12" y1="56" x2="18" y2="68" stroke="#FFB74D" strokeWidth="1" opacity="0.4" />
          <line x1="44" y1="56" x2="38" y2="68" stroke="#FFB74D" strokeWidth="1" opacity="0.4" />
          {/* Basket */}
          <rect x="16" y="68" width="24" height="10" rx="3" fill="#FFB74D" opacity="0.45" />
        </g>

        {/* ── Windmill ── */}
        <g transform="translate(65, 310)">
          {/* Body */}
          <path d="M18 30 L14 80 L36 80 L32 30Z" fill="#FFCCBC" opacity="0.55" />
          {/* Roof */}
          <polygon points="25,12 8,30 42,30" fill="#FF8A80" opacity="0.45" />
          {/* Blades */}
          <line x1="25" y1="30" x2="25" y2="4" stroke="#FF4040" strokeWidth="1.5" opacity="0.35" strokeLinecap="round" />
          <line x1="25" y1="30" x2="6" y2="18" stroke="#FF4040" strokeWidth="1.5" opacity="0.35" strokeLinecap="round" />
          <line x1="25" y1="30" x2="44" y2="18" stroke="#FF4040" strokeWidth="1.5" opacity="0.35" strokeLinecap="round" />
          <line x1="25" y1="30" x2="25" y2="52" stroke="#FF4040" strokeWidth="1.5" opacity="0.35" strokeLinecap="round" />
          <circle cx="25" cy="30" r="3" fill="#FF4040" opacity="0.4" />
        </g>

        {/* ── Small buildings ── */}
        <g transform="translate(250, 340)" opacity="0.4">
          <rect x="0" y="20" width="22" height="35" rx="2" fill="#FFCCBC" />
          <polygon points="0,20 11,8 22,20" fill="#FF8A80" />
          <rect x="30" y="28" width="18" height="27" rx="2" fill="#FFE0B2" />
          <polygon points="30,28 39,18 48,28" fill="#FFB74D" opacity="0.6" />
        </g>

        {/* ── Clouds ── */}
        <g opacity="0.2">
          <ellipse cx="95" cy="75" rx="38" ry="13" fill="#B3E5FC" />
          <ellipse cx="120" cy="68" rx="28" ry="11" fill="#B3E5FC" />
          <ellipse cx="345" cy="175" rx="32" ry="11" fill="#B3E5FC" />
          <ellipse cx="365" cy="169" rx="22" ry="9" fill="#B3E5FC" />
        </g>

        {/* ── Airplane ── */}
        <g transform="translate(55, 42) rotate(-18)">
          <path d="M0 5 L7 3 L18 5 L7 7Z" fill="#FF4040" opacity="0.45" />
          <path d="M9 1.5 L12 5 L9 8.5" fill="#FF4040" opacity="0.3" />
        </g>

        {/* Dotted trail */}
        <path
          d="M68 50 C95 72, 88 98, 115 108"
          stroke="#FF4040"
          strokeWidth="1.5"
          strokeDasharray="3 5"
          fill="none"
          opacity="0.18"
        />

        {/* ── Decorative circles ── */}
        <circle cx="340" cy="290" r="5" fill="#FF4040" opacity="0.1" />
        <circle cx="55" cy="455" r="7" fill="#FFB74D" opacity="0.12" />
        <circle cx="375" cy="410" r="4" fill="#FF8A80" opacity="0.12" />
        <circle cx="105" cy="165" r="3" fill="#FF4040" opacity="0.08" />
        <circle cx="300" cy="450" r="6" fill="#FF4040" opacity="0.06" />
      </svg>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════
   Right Illustration — Tropical / Adventure
   ═══════════════════════════════════════════════════════ */
const RightIllustration = () => (
  <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[12%] xl:translate-x-[5%] w-[300px] lg:w-[380px] xl:w-[430px] pointer-events-none select-none hidden lg:block">
    <div className="illustration-float-reverse">
      <svg
        viewBox="0 0 440 560"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background blob */}
        <path
          d="M200 40 C310 15, 420 100, 400 210 C380 320, 410 400, 340 470 C270 540, 150 530, 90 450 C30 370, 20 270, 70 185 C120 100, 90 65, 200 40Z"
          fill="#FFE0E8"
          opacity="0.4"
        />

        {/* ── Temple / Pagoda ── */}
        <g transform="translate(190, 170)">
          {/* Base */}
          <rect x="15" y="120" width="90" height="28" rx="3" fill="#FFCCBC" opacity="0.55" />
          {/* Middle section */}
          <rect x="25" y="78" width="70" height="45" rx="2" fill="#FFB0A0" opacity="0.5" />
          {/* Top section */}
          <rect x="38" y="42" width="44" height="40" rx="2" fill="#FF8A80" opacity="0.45" />
          {/* Curved roofs */}
          <path d="M10 120 Q60 103 110 120" stroke="#FF4040" strokeWidth="2" fill="none" opacity="0.35" />
          <path d="M20 78 Q60 62 100 78" stroke="#FF4040" strokeWidth="2" fill="none" opacity="0.35" />
          <path d="M33 42 Q60 26 87 42" stroke="#FF4040" strokeWidth="2" fill="none" opacity="0.35" />
          {/* Spire */}
          <line x1="60" y1="42" x2="60" y2="14" stroke="#FF4040" strokeWidth="2" opacity="0.45" strokeLinecap="round" />
          <circle cx="60" cy="10" r="4" fill="#FF4040" opacity="0.25" />
          {/* Door */}
          <rect x="52" y="130" width="16" height="18" rx="8" fill="#FF8A80" opacity="0.3" />
        </g>

        {/* ── Palm Tree ── */}
        <g transform="translate(75, 260)">
          {/* Trunk */}
          <path
            d="M28 130 Q24 65 30 0"
            stroke="#FFB74D"
            strokeWidth="7"
            fill="none"
            opacity="0.45"
            strokeLinecap="round"
          />
          {/* Leaves */}
          <path d="M30 5 Q55 -18 75 8" stroke="#81C784" strokeWidth="3" fill="none" opacity="0.4" strokeLinecap="round" />
          <path d="M30 5 Q8 -22 -12 5" stroke="#81C784" strokeWidth="3" fill="none" opacity="0.4" strokeLinecap="round" />
          <path d="M30 5 Q60 -8 70 22" stroke="#A5D6A7" strokeWidth="2.5" fill="none" opacity="0.3" strokeLinecap="round" />
          <path d="M30 5 Q4 -8 -8 18" stroke="#A5D6A7" strokeWidth="2.5" fill="none" opacity="0.3" strokeLinecap="round" />
          <path d="M30 5 Q45 -28 50 -12" stroke="#66BB6A" strokeWidth="2" fill="none" opacity="0.25" strokeLinecap="round" />
          <path d="M30 5 Q15 -28 10 -12" stroke="#66BB6A" strokeWidth="2" fill="none" opacity="0.25" strokeLinecap="round" />
        </g>

        {/* ── Mountains ── */}
        <g transform="translate(90, 390)" opacity="0.3">
          <polygon points="0,75 48,8 96,75" fill="#B3E5FC" />
          <polygon points="55,75 95,22 135,75" fill="#90CAF9" />
          <polygon points="18,75 52,28 86,75" fill="#81D4FA" />
          {/* Snow caps */}
          <polygon points="48,8 40,28 56,28" fill="white" opacity="0.6" />
          <polygon points="95,22 89,38 101,38" fill="white" opacity="0.6" />
        </g>

        {/* ── Compass ── */}
        <g transform="translate(325, 115)">
          <circle cx="24" cy="24" r="21" fill="none" stroke="#FF4040" strokeWidth="1.5" opacity="0.22" />
          <circle cx="24" cy="24" r="17" fill="none" stroke="#FF4040" strokeWidth="1" opacity="0.12" />
          {/* Needle N */}
          <polygon points="24,6 21,24 24,27 27,24" fill="#FF4040" opacity="0.25" />
          {/* Needle S */}
          <polygon points="24,42 21,24 24,21 27,24" fill="#FFB0A0" opacity="0.15" />
          <circle cx="24" cy="24" r="2.5" fill="#FF4040" opacity="0.25" />
          {/* Direction markers */}
          <text x="24" y="4" textAnchor="middle" fontSize="5" fill="#FF4040" opacity="0.2" fontWeight="600">N</text>
        </g>

        {/* ── Sun ── */}
        <g transform="translate(345, 55)" opacity="0.18">
          <circle cx="20" cy="20" r="14" fill="#FFD54F" />
          <circle
            cx="20"
            cy="20"
            r="20"
            fill="none"
            stroke="#FFD54F"
            strokeWidth="1.2"
            strokeDasharray="3 4"
          />
        </g>

        {/* ── Clouds ── */}
        <g opacity="0.18">
          <ellipse cx="145" cy="78" rx="34" ry="12" fill="#B3E5FC" />
          <ellipse cx="170" cy="72" rx="24" ry="9" fill="#B3E5FC" />
        </g>

        {/* ── Decorative circles ── */}
        <circle cx="55" cy="150" r="5" fill="#FF4040" opacity="0.08" />
        <circle cx="380" cy="340" r="6" fill="#FFB74D" opacity="0.1" />
        <circle cx="145" cy="480" r="4" fill="#FF8A80" opacity="0.08" />
        <circle cx="320" cy="460" r="8" fill="#FF4040" opacity="0.05" />
      </svg>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════
   HomePage
   ═══════════════════════════════════════════════════════ */
export default function HomePage() {
  return (
    <section className="w-full overflow-x-hidden">
      {/* ─── Hero ─── */}
      <div className="relative min-h-[85vh] flex flex-col items-center justify-center pt-24 pb-8">
        {/* Subtle warm gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFF8F6] via-white to-white pointer-events-none" />

        {/* Decorative dot grid */}
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#FF4040 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Illustrations */}
        <LeftIllustration />
        <RightIllustration />

        {/* ─── Hero Content ─── */}
        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          {/* Headline */}
          <h1 className="hero-animate hero-delay-1">
            <span className="block text-[clamp(2.5rem,5.5vw,4.25rem)] font-extrabold leading-[1.08] tracking-[-0.03em] text-[#FF4040]">
              Your perfect trip
            </span>
            <span className="block text-[clamp(2.5rem,5.5vw,4.25rem)] font-extrabold leading-[1.08] tracking-[-0.03em] text-[#11181C]">
              planned in minutes
            </span>
          </h1>

          {/* Subtitle */}
          <p className="hero-animate hero-delay-3 mt-6 text-lg md:text-[1.2rem] text-[#687076] leading-relaxed max-w-xl mx-auto">
            Tell us your vibe, dates, and budget — our AI builds a complete
            day-by-day itinerary with real venues, times, and transport.
          </p>

          {/* CTAs */}
          <div className="hero-animate hero-delay-4 flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <a
              href="#get-started"
              className="group relative inline-flex items-center gap-2 px-8 py-4 bg-[#FF4040] text-white text-base font-semibold rounded-full
                transition-all duration-300
                hover:bg-[#e63636] hover:shadow-[0_8px_40px_rgba(255,64,64,0.35)] hover:-translate-y-[2px]
                active:translate-y-0"
            >
              Start Planning — It's Free
              <svg
                className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
            <a
              href="#features"
              className="inline-flex items-center gap-2 px-7 py-4 text-[#11181C]/60 text-base font-medium rounded-full
                border border-gray-200
                transition-all duration-300
                hover:border-gray-300 hover:text-[#11181C] hover:bg-gray-50/80"
            >
              See How It Works
            </a>
          </div>
        </div>
      </div>

      {/* ─── App Showcase ─── */}
      <AppShowcaseSection />

      {/* ─── Divider ─── */}
      <div className="w-3/5 max-w-lg h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mx-auto" />

      {/* ─── Use Cases ─── */}
      <UseCasesSection />

    </section>
  );
}
