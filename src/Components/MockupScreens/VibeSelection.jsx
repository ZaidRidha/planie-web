const vibes = [
  { emoji: "🌍", label: "Adventurous", color: "#4CAF50", selected: false },
  { emoji: "💕", label: "Romantic", color: "#E91E63", selected: true },
  { emoji: "🎨", label: "Cultural", color: "#9C27B0", selected: false },
  { emoji: "🍹", label: "Relaxing", color: "#00BCD4", selected: true },
  { emoji: "🎵", label: "Nightlife", color: "#FF5722", selected: false },
  { emoji: "🍜", label: "Foodie", color: "#FF9800", selected: false },
  { emoji: "🏔️", label: "Outdoorsy", color: "#4DB6AC", selected: false },
  { emoji: "📸", label: "Instagram", color: "#7C4DFF", selected: false },
];

export default function VibeSelection() {
  return (
    <div className="h-full bg-gradient-to-b from-[#FFF8F6] to-white px-4 py-3">
      {/* Header */}
      <div className="mb-3">
        <p className="text-[9px] font-semibold text-[#FF4040] uppercase tracking-wider mb-0.5">
          Step 2 of 3
        </p>
        <h3 className="text-[13px] font-bold text-[#11181C] leading-tight">
          Set the vibe
        </h3>
        <p className="text-[8px] text-[#687076] mt-0.5">
          Pick up to 3 moods for your trip
        </p>
      </div>

      {/* Selected count */}
      <div className="flex items-center gap-1.5 mb-3">
        <div className="flex gap-0.5">
          <div className="w-4 h-1 rounded-full bg-[#FF4040]" />
          <div className="w-4 h-1 rounded-full bg-[#FF4040]" />
          <div className="w-4 h-1 rounded-full bg-gray-200" />
        </div>
        <span className="text-[7px] text-[#687076]">2 of 3 selected</span>
      </div>

      {/* Vibe grid */}
      <div className="grid grid-cols-2 gap-2">
        {vibes.map((vibe) => (
          <div
            key={vibe.label}
            className="flex items-center gap-2 rounded-xl py-2.5 px-2.5 transition-all"
            style={{
              backgroundColor: vibe.selected ? vibe.color + "15" : "#F5F5F5",
              border: vibe.selected
                ? `1.5px solid ${vibe.color}`
                : "1.5px solid transparent",
            }}
          >
            <span className="text-[16px]">{vibe.emoji}</span>
            <div className="flex-1 min-w-0">
              <span
                className="text-[8.5px] font-semibold block truncate"
                style={{ color: vibe.selected ? vibe.color : "#11181C" }}
              >
                {vibe.label}
              </span>
            </div>
            {vibe.selected && (
              <svg width="10" height="10" viewBox="0 0 16 16" fill={vibe.color}>
                <circle cx="8" cy="8" r="8" />
                <path d="M5 8l2 2 4-4" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        ))}
      </div>

      {/* Continue */}
      <div className="mt-4 px-1">
        <div className="w-full py-2.5 rounded-full bg-[#FF4040] text-white text-[10px] font-semibold text-center">
          Continue →
        </div>
      </div>
    </div>
  );
}
