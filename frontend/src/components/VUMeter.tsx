import React from 'react';

interface VUMeterProps {
  level: number; // 0 to 1
  isActive: boolean;
  theme: 'amber' | 'cyan' | 'emerald';
}

export const VUMeter: React.FC<VUMeterProps> = ({ level, isActive, theme }) => {
  const totalSegments = 16;
  const activeSegments = isActive ? Math.round(level * totalSegments) : 0;

  const getSegmentColor = (index: number) => {
    if (index < activeSegments) {
      if (index >= 13) return 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]'; // Peak Red
      if (index >= 10) return 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'; // Warning Yellow
      if (theme === 'amber') return 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.6)]';
      if (theme === 'cyan') return 'bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.6)]';
      return 'bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.6)]';
    }
    return 'bg-slate-800/40 border border-white/[0.03]';
  };

  return (
    <div className="flex flex-col space-y-1 w-full bg-black/50 p-2.5 rounded-xl border border-white/[0.06] font-mono-data">
      <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase tracking-widest px-0.5">
        <span>-30dB</span>
        <span>Acoustic VU Level</span>
        <span className="text-rose-500 font-bold">0dB Peak</span>
      </div>
      <div className="grid grid-cols-16 gap-1 h-3.5">
        {Array.from({ length: totalSegments }).map((_, i) => (
          <div
            key={i}
            className={`h-full rounded-xs transition-colors duration-75 ${getSegmentColor(i)}`}
          />
        ))}
      </div>
    </div>
  );
};
