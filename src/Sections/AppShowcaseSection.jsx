import { useCallback, useEffect, useRef, useState } from "react";
import {
  Sparkles,
  FileText,
  Map,
  Compass,
  Palette,
} from "lucide-react";

import PhoneMockup from "../Components/PhoneMockup";
import PlanningWizard from "../Components/MockupScreens/PlanningWizard";
import GeneratedItinerary from "../Components/MockupScreens/GeneratedItinerary";
import MapView from "../Components/MockupScreens/MapView";
import DiscoveryFeed from "../Components/MockupScreens/DiscoveryFeed";
import VibeSelection from "../Components/MockupScreens/VibeSelection";

import "./AppShowcaseSection.css";

const slides = [
  { component: PlanningWizard, label: "Planning Wizard", icon: Sparkles },
  { component: GeneratedItinerary, label: "AI Itinerary", icon: FileText },
  { component: MapView, label: "Map View", icon: Map },
  { component: DiscoveryFeed, label: "Discovery Feed", icon: Compass },
  { component: VibeSelection, label: "Vibe Selection", icon: Palette },
];

// 200 slots = 40 full cycles = ~160 seconds of autoplay before needing to loop
const TOTAL_SLOTS = slides.length * 40;
const START_INDEX = Math.floor(TOTAL_SLOTS / 2);

export default function AppShowcaseSection() {
  const len = slides.length;
  const [activeSlot, setActiveSlot] = useState(START_INDEX);
  const timerRef = useRef(null);

  const realIndex = ((activeSlot % len) + len) % len;

  const startAutoplay = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActiveSlot((prev) => prev + 1);
    }, 4000);
  }, []);

  const stopAutoplay = useCallback(() => {
    clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    startAutoplay();
    return () => clearInterval(timerRef.current);
  }, [startAutoplay]);

  const goTo = (i) => {
    const current = realIndex;
    let diff = i - current;
    if (diff > len / 2) diff -= len;
    if (diff < -len / 2) diff += len;
    setActiveSlot((prev) => prev + diff);
    startAutoplay();
  };

  const scrollPrev = () => {
    setActiveSlot((prev) => prev - 1);
    startAutoplay();
  };

  const scrollNext = () => {
    setActiveSlot((prev) => prev + 1);
    startAutoplay();
  };

  return (
    <section className="w-full pt-6 pb-20 px-4 overflow-hidden">
      {/* Text Block */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <p className="showcase-animate showcase-delay-1 text-xs font-bold uppercase tracking-[0.2em] text-[#FF4040] mb-3">
          See it in action
        </p>
        <h2 className="showcase-animate showcase-delay-2 text-[clamp(1.75rem,4vw,2.75rem)] font-extrabold text-[#11181C] leading-tight tracking-[-0.02em]">
          Your entire trip,{" "}
          <span className="text-[#FF4040]">beautifully planned</span>
        </h2>
        <p className="showcase-animate showcase-delay-3 mt-4 text-base md:text-lg text-[#687076] leading-relaxed max-w-lg mx-auto">
          Our AI wizard walks you through occasion, vibe, and preferences —
          then builds a complete itinerary with maps, venues, and timing.
        </p>
      </div>

      {/* Carousel */}
      <div
        className="relative max-w-5xl mx-auto"
        onMouseEnter={stopAutoplay}
        onMouseLeave={startAutoplay}
      >
        <div className="showcase-carousel">
          <div
            className="showcase-carousel__track"
            style={{
              transform: `translateX(calc(50% - ${activeSlot * 280}px - 140px))`,
            }}
          >
            {Array.from({ length: TOTAL_SLOTS }, (_, i) => {
              const dist = Math.abs(i - activeSlot);

              // Only render full content for nearby slides
              if (dist > 3) {
                return <div key={i} className="showcase-carousel__slot" />;
              }

              const slideIndex = i % len;
              const slide = slides[slideIndex];
              const Screen = slide.component;

              return (
                <div
                  key={i}
                  className="showcase-carousel__slot"
                  style={{
                    transform: `scale(${dist === 0 ? 1 : 0.88})`,
                    opacity: dist === 0 ? 1 : dist === 1 ? 0.5 : 0.3,
                  }}
                  onClick={() => dist !== 0 && goTo(slideIndex)}
                >
                  <PhoneMockup label={slide.label}>
                    <Screen />
                  </PhoneMockup>
                </div>
              );
            })}
          </div>
        </div>

        {/* Arrow buttons */}
        <button
          className="showcase-arrow absolute top-1/2 -translate-y-1/2 left-0 md:left-4 hidden md:flex"
          onClick={scrollPrev}
          aria-label="Previous slide"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 12L6 8l4-4" />
          </svg>
        </button>
        <button
          className="showcase-arrow absolute top-1/2 -translate-y-1/2 right-0 md:right-4 hidden md:flex"
          onClick={scrollNext}
          aria-label="Next slide"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 4l4 4-4 4" />
          </svg>
        </button>
      </div>

      {/* Feature Chips */}
      <div className="max-w-4xl mx-auto px-4 mt-10">
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 md:gap-3 flex-wrap">
          {slides.map((slide, i) => {
            const Icon = slide.icon;
            const isActive = realIndex === i;
            return (
              <button
                key={slide.label}
                onClick={() => goTo(i)}
                className={`feature-chip flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "bg-[#FF4040]/[0.08] text-[#FF4040] shadow-[0_2px_12px_rgba(255,64,64,0.1)]"
                    : "text-[#687076] hover:text-[#11181C] hover:bg-gray-50"
                }`}
              >
                <Icon size={16} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="hidden sm:inline">{slide.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
