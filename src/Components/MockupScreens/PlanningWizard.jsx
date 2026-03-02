const occasions = [
  { emoji: "🎂", label: "Birthday", color: "#FFE0E0" },
  { emoji: "💑", label: "Date Night", color: "#FFE0F0" },
  { emoji: "👨‍👩‍👧‍👦", label: "Family", color: "#E0F0FF" },
  { emoji: "🎉", label: "Celebration", color: "#FFF3E0" },
  { emoji: "✈️", label: "Vacation", color: "#E0FFE8" },
  { emoji: "🏖️", label: "Weekend", color: "#E8E0FF" },
  { emoji: "🍷", label: "Night Out", color: "#FFE8E0" },
  { emoji: "💼", label: "Business", color: "#E0F4FF" },
  { emoji: "🎓", label: "Graduation", color: "#FFFDE0" },
];

export default function PlanningWizard() {
  return (
    <div className="h-full bg-gradient-to-b from-[#FFF8F6] to-white px-4 py-3">
      {/* Header */}
      <div className="mb-4">
        <p className="text-[9px] font-semibold text-[#FF4040] uppercase tracking-wider mb-0.5">
          Step 1 of 3
        </p>
        <h3 className="text-[13px] font-bold text-[#11181C] leading-tight">
          What's the occasion?
        </h3>
        <p className="text-[8px] text-[#687076] mt-0.5">
          Pick one to personalize your plan
        </p>
      </div>

      {/* Occasion grid */}
      <div className="grid grid-cols-3 gap-2">
        {occasions.map((item, i) => (
          <div
            key={item.label}
            className="flex flex-col items-center justify-center rounded-xl py-2.5 px-1 transition-all"
            style={{
              backgroundColor: i === 1 ? "#FF4040" : item.color,
              border: i === 1 ? "2px solid #FF4040" : "1.5px solid transparent",
            }}
          >
            <span className="text-[18px] mb-0.5">{item.emoji}</span>
            <span
              className="text-[7.5px] font-semibold"
              style={{ color: i === 1 ? "white" : "#11181C" }}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Continue button */}
      <div className="mt-4 px-1">
        <div className="w-full py-2.5 rounded-full bg-[#FF4040] text-white text-[10px] font-semibold text-center">
          Continue →
        </div>
      </div>
    </div>
  );
}
