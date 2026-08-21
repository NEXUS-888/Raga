import React from 'react';

interface RagaLogoPillProps {
  className?: string;
  onClick?: () => void;
  scale?: number;
}

export const RagaLogoPill: React.FC<RagaLogoPillProps> = ({
  className = "",
  onClick,
  scale = 1
}) => {
  return (
    <div
      onClick={onClick}
      className={`group relative h-[44px] px-3 rounded-full border-[3px] border-[#220738] bg-gradient-to-b from-[#FFE817] via-[#FFCA00] to-[#FFA000] overflow-hidden flex items-center gap-2 shadow-lg select-none cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-amber-500/30 ${className}`}
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'left center',
        boxShadow: '0 8px 20px -4px rgba(0, 0, 0, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.7), inset 0 -3px 6px rgba(220, 90, 0, 0.4)'
      }}
      title="Click to replay RAGA splash animation"
    >
      {/* Top Gloss Reflection */}
      <div className="absolute top-1 left-3 right-3 h-2 bg-gradient-to-b from-white/60 to-transparent rounded-full pointer-events-none opacity-80" />

      {/* Bottom Orange Wave Accent */}
      <svg
        className="absolute bottom-0 left-0 w-full h-3 pointer-events-none opacity-90"
        viewBox="0 0 200 20"
        preserveAspectRatio="none"
      >
        <path
          d="M0,10 Q50,20 100,11 T200,9 L200,20 L0,20 Z"
          fill="#FF8500"
        />
      </svg>

      {/* Mini Retro Mic Icon with Sound Waves */}
      <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
        <svg viewBox="0 0 130 110" className="w-full h-full overflow-visible">
          {/* Soundwaves */}
          <g className="group-hover:scale-110 transition-transform origin-center">
            <path d="M26,38 C20,46 20,64 26,72" stroke="#FF1E75" strokeWidth="8" strokeLinecap="round" fill="none" />
            <path d="M14,30 C5,42 5,70 14,80" stroke="#FF1E75" strokeWidth="8.5" strokeLinecap="round" fill="none" />
            <path d="M104,38 C110,46 110,64 104,72" stroke="#FF1E75" strokeWidth="8" strokeLinecap="round" fill="none" />
            <path d="M116,30 C125,42 125,70 116,80" stroke="#FF1E75" strokeWidth="8.5" strokeLinecap="round" fill="none" />
          </g>
          {/* Mic */}
          <g transform="translate(42, 12)">
            <rect x="6" y="4" width="34" height="54" rx="17" fill="#FFDF00" stroke="#220738" strokeWidth="6" />
            <line x1="8" y1="22" x2="38" y2="22" stroke="#220738" strokeWidth="4" />
            <line x1="8" y1="36" x2="38" y2="36" stroke="#220738" strokeWidth="4" />
            <path d="M2,32 C2,56 44,56 44,32" stroke="#220738" strokeWidth="6" strokeLinecap="round" fill="none" />
            <line x1="23" y1="52" x2="23" y2="68" stroke="#220738" strokeWidth="6" />
            <ellipse cx="23" cy="70" rx="16" ry="6" fill="#220738" />
          </g>
        </svg>
      </div>

      {/* Divider */}
      <div className="w-[3px] h-6 bg-[#FF8000] rounded-full shrink-0 shadow-sm" />

      {/* Chunky RAGA Letters */}
      <div className="font-black text-[24px] leading-none tracking-tight text-[#220738] pr-1" style={{ fontWeight: 900 }}>
        RAGA
      </div>
    </div>
  );
};
