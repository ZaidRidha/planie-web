export default function PhoneMockup({ children, label }) {
  return (
    <div className="flex flex-col items-center gap-3">
      {/* Phone frame */}
      <div
        className="relative w-[240px] h-[480px] rounded-[32px] bg-[#11181C] p-[6px] shadow-[0_8px_40px_rgba(0,0,0,0.15)]"
        style={{ flexShrink: 0 }}
      >
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90px] h-[22px] bg-[#11181C] rounded-b-2xl z-20" />

        {/* Screen area */}
        <div className="relative w-full h-full rounded-[26px] overflow-hidden bg-white">
          {/* Status bar */}
          <div className="absolute top-0 inset-x-0 h-8 bg-white/90 backdrop-blur z-10 flex items-end justify-between px-5 pb-0.5">
            <span className="text-[9px] font-semibold text-[#11181C]">9:41</span>
            <div className="flex items-center gap-1">
              {/* Signal bars */}
              <svg width="12" height="8" viewBox="0 0 12 8" fill="#11181C" opacity="0.5">
                <rect x="0" y="6" width="2" height="2" rx="0.5" />
                <rect x="3" y="4" width="2" height="4" rx="0.5" />
                <rect x="6" y="2" width="2" height="6" rx="0.5" />
                <rect x="9" y="0" width="2" height="8" rx="0.5" />
              </svg>
              {/* Battery */}
              <svg width="16" height="8" viewBox="0 0 16 8" fill="none" opacity="0.5">
                <rect x="0.5" y="0.5" width="13" height="7" rx="1.5" stroke="#11181C" strokeWidth="0.8" />
                <rect x="2" y="2" width="9" height="4" rx="0.5" fill="#11181C" />
                <rect x="14" y="2.5" width="1.5" height="3" rx="0.5" fill="#11181C" />
              </svg>
            </div>
          </div>

          {/* Content */}
          <div className="h-full pt-8 overflow-hidden">
            {children}
          </div>

          {/* Home indicator */}
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-[80px] h-[4px] rounded-full bg-[#11181C]/20" />
        </div>
      </div>

      {/* Label below phone */}
      {label && (
        <span className="text-sm font-medium text-[#687076]">{label}</span>
      )}
    </div>
  );
}
