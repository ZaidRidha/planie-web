const timeline = [
  { time: "9:00 AM", title: "Sagrada Família", type: "Landmark", color: "#FF4040" },
  { time: "11:30 AM", title: "Brunch at La Boqueria", type: "Food", color: "#FF8A65" },
  { time: "1:00 PM", title: "Park Güell", type: "Landmark", color: "#FF4040" },
  { time: "3:30 PM", title: "Gothic Quarter Walk", type: "Activity", color: "#7C4DFF" },
  { time: "6:00 PM", title: "Barceloneta Beach", type: "Leisure", color: "#26C6DA" },
  { time: "8:30 PM", title: "Tapas at El Nacional", type: "Food", color: "#FF8A65" },
];

export default function GeneratedItinerary() {
  return (
    <div className="h-full bg-white px-4 py-3">
      {/* Header */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-[13px] font-bold text-[#11181C]">Barcelona</h3>
          <span className="text-[8px] px-2 py-0.5 rounded-full bg-[#FF4040]/10 text-[#FF4040] font-semibold">
            Day 1 of 3
          </span>
        </div>
        <p className="text-[8px] text-[#687076]">Sat, March 15 — Romantic Getaway</p>
      </div>

      {/* Timeline */}
      <div className="space-y-0">
        {timeline.map((item, i) => (
          <div key={i} className="flex gap-2.5 pb-2.5">
            {/* Timeline line + dot */}
            <div className="flex flex-col items-center">
              <div
                className="w-2.5 h-2.5 rounded-full border-2 flex-shrink-0"
                style={{ borderColor: item.color, backgroundColor: i === 0 ? item.color : "white" }}
              />
              {i < timeline.length - 1 && (
                <div className="w-[1.5px] flex-1 bg-gray-200 mt-0.5" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 -mt-0.5">
              <span className="text-[7px] text-[#687076] font-medium">{item.time}</span>
              <p className="text-[10px] font-semibold text-[#11181C] leading-tight">{item.title}</p>
              <span
                className="inline-block text-[6.5px] font-semibold mt-0.5 px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: item.color + "18", color: item.color }}
              >
                {item.type}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer action */}
      <div className="flex gap-2 mt-1">
        <div className="flex-1 py-1.5 rounded-full bg-[#FF4040] text-white text-[8px] font-semibold text-center">
          Save Itinerary
        </div>
        <div className="flex-1 py-1.5 rounded-full border border-gray-200 text-[#687076] text-[8px] font-semibold text-center">
          Regenerate
        </div>
      </div>
    </div>
  );
}
