import { useEffect, useRef, useState } from "react";
import { Sparkles, Users, MapPin, Calendar } from "lucide-react";
import "./UseCasesSection.css";

const useCases = [
  {
    icon: Sparkles,
    tag: "AI-Powered",
    title: "Plan a date night in seconds",
    description:
      "Tell Planie your vibe, budget, and time — watch it build a full evening with dinner, drinks, and activities perfectly timed and routed.",
    video: null, // replace with video URL
    color: "#FF4040",
  },
  {
    icon: Users,
    tag: "Group Trips",
    title: "Coordinate trips with friends effortlessly",
    description:
      "Everyone adds their preferences, Planie finds the overlap. Vote on activities, split plans, and keep the whole group in sync — no more endless group chats.",
    video: null,
    color: "#FF6B6B",
  },
  {
    icon: MapPin,
    tag: "Explore",
    title: "Discover hidden gems wherever you go",
    description:
      "Our discovery feed surfaces local favorites, trending spots, and off-the-beaten-path experiences tailored to your taste — not tourist traps.",
    video: null,
    color: "#FF8A65",
  },
  {
    icon: Calendar,
    tag: "Organize",
    title: "Keep every detail in one place",
    description:
      "Reservations, directions, timings, notes — everything lives in your itinerary. Share it, export it, or just glance at what's next.",
    video: null,
    color: "#FF4040",
  },
];

function UseCaseCard({ useCase, index, reversed }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const Icon = useCase.icon;

  return (
    <div
      ref={ref}
      className={`usecase-row ${reversed ? "usecase-row--reversed" : ""} ${
        visible ? "is-visible" : ""
      }`}
    >
      {/* Text side */}
      <div className="usecase-text">
        <h3 className="usecase-title">{useCase.title}</h3>
        <p className="usecase-desc">{useCase.description}</p>
      </div>

      {/* Video side */}
      <div className="usecase-video-wrap">
        <div
          className="usecase-video-glow"
          style={{ background: useCase.color }}
        />
        <div className="usecase-video-container">
          {useCase.video ? (
            <video
              src={useCase.video}
              autoPlay
              loop
              muted
              playsInline
              className="usecase-video"
            />
          ) : (
            <div className="usecase-video-placeholder">
              <div
                className="usecase-placeholder-icon"
                style={{ color: useCase.color }}
              >
                <Icon size={48} strokeWidth={1.2} />
              </div>
              <div className="usecase-placeholder-bars">
                <span style={{ width: "60%", background: useCase.color }} />
                <span style={{ width: "80%", background: useCase.color }} />
                <span style={{ width: "45%", background: useCase.color }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function UseCasesSection() {
  return (
    <section className="usecase-section">
      <div className="usecase-header">
        <p className="usecase-header__tag">Use Cases</p>
        <h2 className="usecase-header__title">
          One app, <span style={{ color: "#FF4040" }}>endless possibilities</span>
        </h2>
        <p className="usecase-header__sub">
          Whether it's a solo adventure, a date night, or a group trip —
          Planie handles the planning so you can enjoy the moment.
        </p>
      </div>

      <div className="usecase-list">
        {useCases.map((uc, i) => (
          <UseCaseCard
            key={uc.tag}
            useCase={uc}
            index={i}
            reversed={i % 2 !== 0}
          />
        ))}
      </div>
    </section>
  );
}
