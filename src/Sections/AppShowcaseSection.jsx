import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

import PhoneMockup from "../Components/PhoneMockup";
import PlanningWizard from "../Components/MockupScreens/PlanningWizard";
import GeneratedItinerary from "../Components/MockupScreens/GeneratedItinerary";
import MapView from "../Components/MockupScreens/MapView";
import DiscoveryFeed from "../Components/MockupScreens/DiscoveryFeed";
import VibeSelection from "../Components/MockupScreens/VibeSelection";

import "./AppShowcaseSection.css";

const slides = [
  { component: PlanningWizard, label: "Planning Wizard" },
  { component: GeneratedItinerary, label: "AI Itinerary" },
  { component: MapView, label: "Map View" },
  { component: DiscoveryFeed, label: "Discovery Feed" },
  { component: VibeSelection, label: "Vibe Selection" },
];

export default function AppShowcaseSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "center",
      skipSnaps: false,
      containScroll: false,
    },
    [Autoplay({ delay: 4000, stopOnInteraction: true, stopOnMouseEnter: true })]
  );

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((i) => emblaApi?.scrollTo(i), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setActiveIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
    return () => emblaApi.off("select", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <section className="w-full py-20 px-4 overflow-hidden">
      {/* ─── Text Block ─── */}
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

      {/* ─── Carousel ─── */}
      <div className="relative max-w-5xl mx-auto">
        {/* Embla viewport */}
        <div className="showcase-carousel" ref={emblaRef}>
          <div className="showcase-carousel__container">
            {slides.map((slide, i) => {
              const Screen = slide.component;
              return (
                <div
                  key={slide.label}
                  className={`showcase-carousel__slide ${
                    i === activeIndex ? "is-active" : ""
                  }`}
                >
                  <PhoneMockup label={slide.label}>
                    <Screen />
                  </PhoneMockup>
                </div>
              );
            })}
          </div>
        </div>

        {/* Arrow buttons — hidden on mobile */}
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

      {/* ─── Dot Indicators ─── */}
      <div className="flex items-center justify-center gap-2 mt-8">
        {slides.map((slide, i) => (
          <button
            key={slide.label}
            className={`showcase-dot ${i === activeIndex ? "is-active" : ""}`}
            onClick={() => scrollTo(i)}
            aria-label={`Go to ${slide.label}`}
          />
        ))}
      </div>
    </section>
  );
}
