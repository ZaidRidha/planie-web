const places = [
  {
    name: "La Boqueria Market",
    type: "Food Market",
    rating: 4.8,
    distance: "0.3 km",
    color: "#FF8A65",
    emoji: "🍽️",
    liked: true,
  },
  {
    name: "Casa Batlló",
    type: "Architecture",
    rating: 4.9,
    distance: "0.6 km",
    color: "#7C4DFF",
    emoji: "🏛️",
    liked: false,
  },
  {
    name: "El Born District",
    type: "Neighborhood",
    rating: 4.6,
    distance: "0.8 km",
    color: "#26C6DA",
    emoji: "🚶",
    liked: false,
  },
];

function Stars({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width="7"
          height="7"
          viewBox="0 0 12 12"
          fill={star <= Math.floor(rating) ? "#FFB300" : "#E0E0E0"}
        >
          <path d="M6 0.5L7.6 4.1L11.5 4.5L8.6 7.1L9.4 11L6 9L2.6 11L3.4 7.1L0.5 4.5L4.4 4.1Z" />
        </svg>
      ))}
      <span className="text-[7px] text-[#687076] ml-0.5">{rating}</span>
    </div>
  );
}

export default function DiscoveryFeed() {
  return (
    <div className="h-full bg-[#FAFAFA] px-3 py-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-[13px] font-bold text-[#11181C]">Discover</h3>
          <p className="text-[8px] text-[#687076]">Nearby in Barcelona</p>
        </div>
        <div className="flex gap-1">
          <div className="px-2 py-1 rounded-full bg-[#FF4040] text-white text-[7px] font-semibold">
            All
          </div>
          <div className="px-2 py-1 rounded-full bg-white text-[#687076] text-[7px] font-medium border border-gray-200">
            Food
          </div>
          <div className="px-2 py-1 rounded-full bg-white text-[#687076] text-[7px] font-medium border border-gray-200">
            Sights
          </div>
        </div>
      </div>

      {/* Place cards */}
      <div className="space-y-2.5">
        {places.map((place) => (
          <div
            key={place.name}
            className="bg-white rounded-xl p-2.5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] flex gap-2.5"
          >
            {/* Icon */}
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-[16px] flex-shrink-0"
              style={{ backgroundColor: place.color + "15" }}
            >
              {place.emoji}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-1">
                <p className="text-[10px] font-semibold text-[#11181C] leading-tight truncate">
                  {place.name}
                </p>
                {/* Heart */}
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 16 16"
                  className="flex-shrink-0 mt-0.5"
                  fill={place.liked ? "#FF4040" : "none"}
                  stroke={place.liked ? "#FF4040" : "#C0C0C0"}
                  strokeWidth="1.5"
                >
                  <path d="M8 14s-5.5-3.5-6.5-6.5C.5 4 3 1.5 5.5 3.5L8 6l2.5-2.5C13 1.5 15.5 4 14.5 7.5 13.5 10.5 8 14 8 14z" />
                </svg>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className="text-[6.5px] font-semibold px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: place.color + "18", color: place.color }}
                >
                  {place.type}
                </span>
                <span className="text-[7px] text-[#687076]">{place.distance}</span>
              </div>
              <Stars rating={place.rating} />
            </div>
          </div>
        ))}
      </div>

      {/* Quick action */}
      <div className="mt-3 flex items-center justify-center gap-1 py-2 rounded-xl border border-dashed border-gray-300">
        <span className="text-[9px] text-[#687076]">Swipe to explore more</span>
        <span className="text-[9px]">→</span>
      </div>
    </div>
  );
}
