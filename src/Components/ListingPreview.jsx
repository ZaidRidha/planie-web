import React from "react";
import { MapPin, Star, Heart, Clock, DollarSign } from "lucide-react";

const categoryMeta = {
  "Restaurant & Bar": { color: "#FF8A65", tag: "Restaurant" },
  "Activity & Tour": { color: "#7C4DFF", tag: "Activity" },
  "Wellness & Spa": { color: "#26C6DA", tag: "Wellness" },
  "Hotel & Resort": { color: "#FF7043", tag: "Hotel" },
  "Shopping & Market": { color: "#66BB6A", tag: "Market" },
  "Nightlife & Entertainment": { color: "#AB47BC", tag: "Nightlife" },
  "Museum & Gallery": { color: "#42A5F5", tag: "Museum" },
  "Outdoor & Adventure": { color: "#8D6E63", tag: "Adventure" },
};

const otherListings = [
  { name: "Blue Lagoon Spa", type: "Wellness", color: "#26C6DA", rating: 4.7, distance: "1.2 km" },
  { name: "Old Town Market", type: "Market", color: "#66BB6A", rating: 4.5, distance: "0.9 km" },
];

function MiniStars({ rating }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 1 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} width="7" height="7" viewBox="0 0 12 12" fill={s <= Math.floor(rating) ? "#FFB300" : "#E0E0E0"}>
          <path d="M6 0.5L7.6 4.1L11.5 4.5L8.6 7.1L9.4 11L6 9L2.6 11L3.4 7.1L0.5 4.5L4.4 4.1Z" />
        </svg>
      ))}
      <span style={{ fontSize: 7, color: "#687076", marginLeft: 2 }}>{rating}</span>
    </div>
  );
}

function PreviewCard({ name, type, color, rating, distance, featured, hasImage }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 12,
      padding: featured ? 0 : 10,
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      display: "flex",
      flexDirection: featured ? "column" : "row",
      gap: featured ? 0 : 10,
      overflow: "hidden",
      border: featured ? "1.5px solid #FF4040" : "none",
    }}>
      {/* Featured card has a hero image area */}
      {featured && (
        <div style={{
          height: 80,
          background: hasImage
            ? `linear-gradient(135deg, ${color}30, ${color}15)`
            : "#F5F5F8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}>
          {hasImage ? (
            <div style={{
              width: "100%",
              height: "100%",
              background: `linear-gradient(135deg, ${color}25, ${color}10)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <span style={{ fontSize: 10, color: color, fontWeight: 600, opacity: 0.6 }}>Your Photo</span>
            </div>
          ) : (
            <span style={{ fontSize: 9, color: "#9CA3AF" }}>No photo yet</span>
          )}
          {/* Featured badge */}
          <div style={{
            position: "absolute",
            top: 6,
            left: 6,
            background: "#FF4040",
            color: "#fff",
            fontSize: 6,
            fontWeight: 700,
            padding: "2px 6px",
            borderRadius: 6,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}>Featured</div>
          {/* Heart */}
          <div style={{
            position: "absolute",
            top: 6,
            right: 6,
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <Heart size={9} strokeWidth={2} color="#FF4040" fill="#FF4040" />
          </div>
        </div>
      )}

      {/* Non-featured icon */}
      {!featured && (
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: color + "15",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}>
          <div style={{
            width: 16,
            height: 16,
            borderRadius: 4,
            background: color + "30",
          }} />
        </div>
      )}

      {/* Info */}
      <div style={{ padding: featured ? "8px 10px 10px" : 0, flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", gap: 4 }}>
          <p style={{
            fontSize: featured ? 11 : 9.5,
            fontWeight: 650,
            color: "#11181C",
            lineHeight: 1.2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {name || "Your Business Name"}
          </p>
          {!featured && (
            <Heart size={10} strokeWidth={1.5} color="#C0C0C0" fill="none" style={{ flexShrink: 0, marginTop: 1 }} />
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
          <span style={{
            fontSize: 6.5,
            fontWeight: 600,
            padding: "1.5px 5px",
            borderRadius: 20,
            background: color + "18",
            color: color,
          }}>
            {type || "Category"}
          </span>
          {distance && (
            <span style={{ fontSize: 7, color: "#687076" }}>{distance}</span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: featured ? 4 : 3 }}>
          <MiniStars rating={rating} />
          {featured && distance && (
            <span style={{ fontSize: 7, color: "#9CA3AF", display: "flex", alignItems: "center", gap: 2 }}>
              <MapPin size={7} strokeWidth={2} /> {distance}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ListingPreview({ form, imagePreview = [] }) {
  const meta = categoryMeta[form.category] || { color: "#9CA3AF", tag: "Category" };
  const location = [form.city, form.country].filter(Boolean).join(", ") || "Your City";

  return (
    <section className="al-preview-section pd-animate pd-d4">
      <h3 className="al-section-title al-preview-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        App Preview
      </h3>
      <p className="al-preview-desc">This is how your listing will appear to travelers in the Planie app</p>

      <div className="al-preview-layout">
        {/* Phone mockup */}
        <div className="al-preview-phone">
          <div className="al-preview-phone-frame">
            {/* Notch */}
            <div className="al-preview-notch" />

            {/* Screen */}
            <div className="al-preview-screen">
              {/* Status bar */}
              <div className="al-preview-statusbar">
                <span style={{ fontSize: 8, fontWeight: 600, color: "#11181C" }}>9:41</span>
                <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <svg width="10" height="7" viewBox="0 0 12 8" fill="#11181C" opacity="0.4">
                    <rect x="0" y="6" width="2" height="2" rx="0.5" />
                    <rect x="3" y="4" width="2" height="4" rx="0.5" />
                    <rect x="6" y="2" width="2" height="6" rx="0.5" />
                    <rect x="9" y="0" width="2" height="8" rx="0.5" />
                  </svg>
                  <svg width="14" height="7" viewBox="0 0 16 8" fill="none" opacity="0.4">
                    <rect x="0.5" y="0.5" width="13" height="7" rx="1.5" stroke="#11181C" strokeWidth="0.8" />
                    <rect x="2" y="2" width="9" height="4" rx="0.5" fill="#11181C" />
                    <rect x="14" y="2.5" width="1.5" height="3" rx="0.5" fill="#11181C" />
                  </svg>
                </div>
              </div>

              {/* Discovery header */}
              <div style={{ padding: "10px 12px 0" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: "#11181C", margin: 0 }}>Discover</h3>
                    <p style={{ fontSize: 8, color: "#687076", margin: 0, marginTop: 1 }}>Nearby in {location}</p>
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <div style={{ padding: "3px 8px", borderRadius: 20, background: "#FF4040", color: "#fff", fontSize: 7, fontWeight: 600 }}>All</div>
                    <div style={{ padding: "3px 8px", borderRadius: 20, background: "#fff", color: "#687076", fontSize: 7, fontWeight: 500, border: "1px solid #E5E7EB" }}>Food</div>
                  </div>
                </div>
              </div>

              {/* Cards */}
              <div style={{ padding: "0 12px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
                {/* User's listing - featured */}
                <PreviewCard
                  name={form.name}
                  type={meta.tag}
                  color={meta.color}
                  rating={4.8}
                  distance="0.3 km"
                  featured
                  hasImage={imagePreview.length > 0}
                />

                {/* Other listings */}
                {otherListings.map((l) => (
                  <PreviewCard key={l.name} {...l} />
                ))}
              </div>

              {/* Home indicator */}
              <div className="al-preview-home-indicator" />
            </div>
          </div>
        </div>

        {/* Info side */}
        <div className="al-preview-info">
          <div className="al-preview-info-card">
            <div className="al-preview-info-icon" style={{ background: meta.color + "15", color: meta.color }}>
              <Star size={16} strokeWidth={2} />
            </div>
            <div>
              <h4>Featured Placement</h4>
              <p>Your listing appears with a featured badge and hero image in the discovery feed</p>
            </div>
          </div>
          <div className="al-preview-info-card">
            <div className="al-preview-info-icon" style={{ background: "#FFF0EB", color: "#FF4040" }}>
              <Heart size={16} strokeWidth={2} />
            </div>
            <div>
              <h4>Save & Discover</h4>
              <p>Travelers can save your listing and find it through AI-powered recommendations</p>
            </div>
          </div>
          <div className="al-preview-info-card">
            <div className="al-preview-info-icon" style={{ background: "#EFF6FF", color: "#3B82F6" }}>
              <MapPin size={16} strokeWidth={2} />
            </div>
            <div>
              <h4>Location Aware</h4>
              <p>Shown to travelers exploring {form.city || "your city"} based on proximity and interests</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
