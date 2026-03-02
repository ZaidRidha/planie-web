import React, { useState } from "react";
import {
  Megaphone,
  Eye,
  MapPin,
  BarChart3,
  Brain,
  Crosshair,
  ExternalLink,
  Store,
  TrendingUp,
  Users,
  Star,
  Zap,
} from "lucide-react";
import "./PartnerPage.css";

const benefits = [
  {
    icon: Eye,
    title: "Discovery Page Visibility",
    description:
      "Your business appears directly on our Discovery page — seen by travelers actively exploring destinations.",
  },
  {
    icon: MapPin,
    title: "In-Itinerary Placements",
    description:
      "Get featured inside AI-generated itineraries, right when users are deciding where to go.",
  },
  {
    icon: Crosshair,
    title: "Geo-Targeted Reach",
    description:
      "We show your brand to travelers heading to your area — no wasted impressions.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description:
      "Track visibility, clicks, and engagement with a live partner dashboard.",
  },
  {
    icon: Brain,
    title: "AI-Powered Matching",
    description:
      "Our affinity matrix connects your business with travelers whose interests align perfectly.",
  },
  {
    icon: Megaphone,
    title: "Full-App Advertising",
    description:
      "Go beyond one page — your brand surfaces across the entire Planie experience.",
  },
];

const differentiators = [
  {
    id: "matrix",
    title: "Matrix Affinity",
    description:
      "Matrix Affinity connects your business with travelers who are actively looking for what you offer — boosting visibility, engagement, and conversions effortlessly.",
  },
  {
    id: "intent",
    title: "Built for Intent, Not Interruption",
    description:
      "We serve your brand at the exact moment users are seeking recommendations, ensuring you reach high-intent audiences without disrupting their experience.",
  },
  {
    id: "ai",
    title: "AI Enhanced, User Centric",
    description:
      "Our AI-driven recommendations personalize the journey, placing your brand at the heart of each traveler's curated plan.",
  },
];

/* ═══════════════════════════════════════════════════════
   Orbital Ring — floating icons around pulsing rings
   ═══════════════════════════════════════════════════════ */
const orbitIcons = [
  { Icon: Store, angle: 0, delay: 0 },
  { Icon: TrendingUp, angle: 60, delay: 0.8 },
  { Icon: MapPin, angle: 120, delay: 1.6 },
  { Icon: Users, angle: 180, delay: 0.4 },
  { Icon: Star, angle: 240, delay: 1.2 },
  { Icon: Zap, angle: 300, delay: 2.0 },
];

const OrbitalGraphic = () => (
  <div className="orbital-container absolute inset-0 pointer-events-none" aria-hidden="true">
    {/* Pulsing concentric rings */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      {/* Solid red center glow */}
      <div className="ring-center" />
      <div className="ring ring-1-size ring-pulse-1" />
      <div className="ring ring-2-size ring-pulse-2" />
      <div className="ring ring-3-size ring-pulse-3" />
    </div>

    {/* Orbiting icons */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 orbit-spin">
      {orbitIcons.map(({ Icon, angle, delay }, i) => (
        <div
          key={i}
          className="orbit-icon"
          style={{
            "--angle": `${angle}deg`,
            "--delay": `${delay}s`,
          }}
        >
          <div className="orbit-icon-inner orbit-counterspin">
            <Icon size={20} strokeWidth={1.6} />
          </div>
        </div>
      ))}
    </div>

    {/* Dashed connection lines radiating from center */}
    <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] md:w-[620px] md:h-[620px] dash-spin" viewBox="0 0 620 620" fill="none">
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <line
          key={angle}
          x1="310"
          y1="310"
          x2={310 + 260 * Math.cos((angle * Math.PI) / 180)}
          y2={310 + 260 * Math.sin((angle * Math.PI) / 180)}
          stroke="#FF4040"
          strokeWidth="1"
          strokeDasharray="4 8"
          opacity="0.18"
        />
      ))}
    </svg>
  </div>
);

export default function PartnerPage() {
  const [activeId, setActiveId] = useState(differentiators[0].id);
  const active = differentiators.find((d) => d.id === activeId);

  return (
    <section className="w-full overflow-x-hidden">
      {/* ─── Hero ─── */}
      <div className="relative min-h-[82vh] flex flex-col items-center justify-center pt-24 pb-8 overflow-hidden">
        {/* Radial gradient background — distinct from homepage linear */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 40%, #FFF0EB 0%, #FFF8F6 35%, white 70%)",
          }}
        />

        {/* Orbital animation behind content */}
        <OrbitalGraphic />

        {/* Hero content */}
        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          {/* Badge */}
          <div className="partner-animate partner-delay-1 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF4040]/[0.07] text-[#FF4040] text-sm font-semibold mb-6">
            <Megaphone size={14} strokeWidth={2.2} />
            Partner Program
          </div>

          <h1 className="partner-animate partner-delay-1">
            <span className="block text-[clamp(2.5rem,5.5vw,4.25rem)] font-extrabold leading-[1.08] tracking-[-0.03em] text-[#11181C]">
              Become a{" "}
              <span className="text-[#FF4040]">Partner</span>
            </span>
            <span className="block text-[clamp(1.25rem,2.5vw,1.75rem)] font-semibold leading-[1.3] text-[#687076] mt-4">
              Advertise your business on our Discovery page and across the entire app
            </span>
          </h1>

          <p className="partner-animate partner-delay-2 mt-5 text-base md:text-lg text-[#687076]/80 leading-relaxed max-w-lg mx-auto">
            Reach high-intent travelers right when they're deciding where to go,
            what to eat, and what to do.
          </p>

          {/* CTAs */}
          <div className="partner-animate partner-delay-3 flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <a
              href="https://partners.planie.app"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center gap-2 px-8 py-4 bg-[#FF4040] text-white text-base font-semibold rounded-full
                transition-all duration-300
                hover:bg-[#e63636] hover:shadow-[0_8px_40px_rgba(255,64,64,0.35)] hover:-translate-y-[2px]
                active:translate-y-0"
            >
              Go to Partner Portal
              <ExternalLink
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </a>
            <a
              href="#why-partner"
              className="inline-flex items-center gap-2 px-7 py-4 text-[#11181C]/60 text-base font-medium rounded-full
                border border-gray-200
                transition-all duration-300
                hover:border-gray-300 hover:text-[#11181C] hover:bg-gray-50/80"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>

      {/* ─── Divider ─── */}
      <div className="w-3/5 max-w-lg h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mx-auto" />

      {/* ─── Benefits Grid ─── */}
      <div className="w-full py-20 px-6" id="why-partner">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="partner-animate partner-delay-1 text-[clamp(1.75rem,3.5vw,2.5rem)] font-bold text-[#11181C]">
              Why Partner with Planie?
            </h2>
            <p className="partner-animate partner-delay-2 mt-4 text-lg text-[#687076] max-w-2xl mx-auto">
              Planie isn't just another app — it's the moment users decide what
              to do. That's when your business shows up.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, i) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  className="benefit-card group rounded-2xl bg-white border border-gray-100 p-7 transition-all duration-300
                    hover:shadow-[0_8px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1"
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-5
                      bg-[#FF4040]/[0.07] text-[#FF4040]
                      transition-all duration-300 group-hover:bg-[#FF4040]/[0.12]"
                  >
                    <Icon size={26} strokeWidth={1.8} />
                  </div>
                  <h3 className="text-lg font-semibold text-[#11181C] mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-[#687076] leading-relaxed text-[0.95rem]">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Divider ─── */}
      <div className="w-3/5 max-w-lg h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mx-auto" />

      {/* ─── How We're Different ─── */}
      <div className="w-full max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-bold mb-14 text-center text-[#11181C]">
          How We're{" "}
          <span className="text-[#FF4040]">Different</span>
        </h2>

        <div className="flex flex-col md:flex-row gap-8 items-stretch">
          {/* Feature buttons */}
          <div className="w-full md:w-1/2 flex flex-col gap-3">
            {differentiators.map((d) => (
              <button
                key={d.id}
                onClick={() => setActiveId(d.id)}
                className={`w-full py-5 px-6 rounded-xl text-lg font-semibold text-left transition-all duration-300 ${
                  d.id === activeId
                    ? "bg-[#FF4040] text-white shadow-[0_4px_24px_rgba(255,64,64,0.25)]"
                    : "bg-gray-50 text-[#687076] hover:bg-gray-100 hover:text-[#11181C]"
                }`}
              >
                {d.title}
              </button>
            ))}
          </div>

          {/* Description */}
          <div className="w-full md:w-1/2 flex items-center">
            <div className="w-full bg-white border border-gray-100 p-8 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
              <p className="text-lg text-[#11181C] leading-relaxed font-medium">
                {active.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Divider ─── */}
      <div className="w-3/5 max-w-lg h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mx-auto" />

      {/* ─── Bottom CTA ─── */}
      <div className="w-full py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[#11181C] mb-3">
            Ready to grow your business?
          </h2>
          <p className="text-lg text-[#687076] mb-8">
            Join the Planie partner program and start reaching travelers today.
          </p>
          <a
            href="https://partners.planie.app"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 px-8 py-4 bg-[#FF4040] text-white text-base font-semibold rounded-full
              transition-all duration-300
              hover:bg-[#e63636] hover:shadow-[0_8px_40px_rgba(255,64,64,0.35)] hover:-translate-y-[2px]
              active:translate-y-0"
          >
            Go to Partner Portal
            <ExternalLink
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </a>
        </div>
      </div>
    </section>
  );
}
