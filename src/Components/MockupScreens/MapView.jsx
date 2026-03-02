const pins = [
  { x: "28%", y: "22%", label: "1", color: "#FF4040" },
  { x: "55%", y: "35%", label: "2", color: "#FF8A65" },
  { x: "42%", y: "55%", label: "3", color: "#FF4040" },
  { x: "70%", y: "48%", label: "4", color: "#7C4DFF" },
  { x: "35%", y: "72%", label: "5", color: "#26C6DA" },
];

export default function MapView() {
  return (
    <div className="h-full bg-[#F0F4F0] relative overflow-hidden">
      {/* Stylized map background */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 228 440" fill="none" preserveAspectRatio="xMidYMid slice">
        {/* Water areas */}
        <ellipse cx="180" cy="380" rx="100" ry="80" fill="#D4E8F0" opacity="0.6" />
        <ellipse cx="30" cy="100" rx="60" ry="50" fill="#D4E8F0" opacity="0.4" />

        {/* Roads */}
        <path d="M0 180 Q60 170 114 200 Q168 230 228 210" stroke="#E0DDD8" strokeWidth="6" fill="none" />
        <path d="M0 260 Q80 250 114 280 Q148 310 228 290" stroke="#E0DDD8" strokeWidth="6" fill="none" />
        <path d="M80 0 Q90 110 100 220 Q110 330 90 440" stroke="#E0DDD8" strokeWidth="5" fill="none" />
        <path d="M160 0 Q150 100 155 200 Q160 300 170 440" stroke="#E0DDD8" strokeWidth="5" fill="none" />

        {/* Minor roads */}
        <path d="M0 100 L228 120" stroke="#EAE7E2" strokeWidth="2.5" fill="none" />
        <path d="M0 340 L228 350" stroke="#EAE7E2" strokeWidth="2.5" fill="none" />
        <path d="M40 0 L50 440" stroke="#EAE7E2" strokeWidth="2.5" fill="none" />

        {/* Parks */}
        <rect x="100" y="100" width="50" height="40" rx="8" fill="#C8E6C9" opacity="0.5" />
        <rect x="20" y="300" width="40" height="30" rx="6" fill="#C8E6C9" opacity="0.4" />
      </svg>

      {/* Dotted route connecting pins */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path
          d="M28 22 L55 35 L42 55 L70 48 L35 72"
          stroke="#FF4040"
          strokeWidth="0.5"
          strokeDasharray="1.5 1"
          fill="none"
          opacity="0.5"
        />
      </svg>

      {/* Map pins */}
      {pins.map((pin) => (
        <div
          key={pin.label}
          className="absolute flex flex-col items-center"
          style={{ left: pin.x, top: pin.y, transform: "translate(-50%, -100%)" }}
        >
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold shadow-md"
            style={{ backgroundColor: pin.color }}
          >
            {pin.label}
          </div>
          <div
            className="w-0 h-0 -mt-0.5"
            style={{
              borderLeft: "4px solid transparent",
              borderRight: "4px solid transparent",
              borderTop: `5px solid ${pin.color}`,
            }}
          />
          {/* Shadow dot */}
          <div
            className="w-2 h-1 rounded-full bg-black/15 mt-0.5"
          />
        </div>
      ))}

      {/* Top search bar overlay */}
      <div className="absolute top-2 inset-x-3 z-10">
        <div className="flex items-center gap-2 bg-white rounded-xl shadow-sm px-3 py-2">
          <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="#687076" strokeWidth="2">
            <circle cx="7" cy="7" r="5" />
            <line x1="11" y1="11" x2="14" y2="14" />
          </svg>
          <span className="text-[8px] text-[#687076]">Barcelona, Spain</span>
        </div>
      </div>

      {/* Bottom card */}
      <div className="absolute bottom-6 inset-x-3 z-10">
        <div className="bg-white rounded-xl shadow-md p-2.5 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#FF4040]/10 flex items-center justify-center text-[12px]">
            📍
          </div>
          <div className="flex-1">
            <p className="text-[9px] font-semibold text-[#11181C]">5 stops planned</p>
            <p className="text-[7px] text-[#687076]">2.4 km total walking</p>
          </div>
          <div className="text-[7px] font-semibold text-[#FF4040]">Navigate</div>
        </div>
      </div>
    </div>
  );
}
