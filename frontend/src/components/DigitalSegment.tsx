import React from 'react';

interface DigitalSegmentProps {
  value: string | number;
  label: string;
  unit?: string;
  subtext?: string;
  status?: 'pass' | 'warn' | 'fail' | 'neutral';
  theme: 'amber' | 'cyan' | 'emerald';
}

export const DigitalSegment: React.FC<DigitalSegmentProps> = ({
  value,
  label,
  unit = '',
  subtext,
  status = 'neutral',
  theme
}) => {
  const getGlowStyle = () => {
    if (status === 'pass') return 'text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]';
    if (status === 'warn') return 'text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]';
    if (status === 'fail') return 'text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]';
    if (theme === 'amber') return 'text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]';
    if (theme === 'cyan') return 'text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]';
    return 'text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]';
  };

  return (
    <div className="relative p-4 rounded-xl bg-gradient-to-b from-black/80 to-slate-950/90 border border-white/[0.08] shadow-inner font-mono-data overflow-hidden group">
      {/* Laser Corner Accents */}
      <div className="absolute top-1 left-1 w-1.5 h-1.5 border-t border-l border-white/20" />
      <div className="absolute top-1 right-1 w-1.5 h-1.5 border-t border-r border-white/20" />
      <div className="absolute bottom-1 left-1 w-1.5 h-1.5 border-b border-l border-white/20" />
      <div className="absolute bottom-1 right-1 w-1.5 h-1.5 border-b border-r border-white/20" />

      {/* Label */}
      <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold truncate mb-1">
        {label}
      </div>

      {/* Main Digital Readout */}
      <div className="flex items-baseline space-x-1">
        <span className={`text-2xl font-bold tracking-tight ${getGlowStyle()}`}>
          {typeof value === 'number' ? value.toFixed(2) : value}
        </span>
        {unit && <span className="text-xs text-slate-400 font-mono-data">{unit}</span>}
      </div>

      {/* Subtext info */}
      {subtext && (
        <div className="text-[10px] text-slate-400 mt-1 truncate">
          {subtext}
        </div>
      )}
    </div>
  );
};
