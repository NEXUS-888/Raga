import React, { useState, useRef, useEffect } from 'react';
import { Radio, MoveDown } from 'lucide-react';

interface HangingDropdownMicProps {
  onStartVoice: () => void;
  onStopVoice: () => void;
  isRecording: boolean;
  onEngageGoaMode: () => void;
  isGoaActive?: boolean;
}

export const HangingDropdownMic: React.FC<HangingDropdownMicProps> = ({
  onStartVoice,
  onStopVoice,
  isRecording,
  onEngageGoaMode,
  isGoaActive = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [micY, setMicY] = useState(130); // Initial resting Y position in px from ceiling
  const [micX, setMicX] = useState(0); // Offset from center
  const [isDragging, setIsDragging] = useState(false);
  const [isPulledDown, setIsPulledDown] = useState(false);

  const startDragY = useRef(0);
  const startDragX = useRef(0);
  const currentY = useRef(130);
  const currentX = useRef(0);
  const velocityY = useRef(0);
  const velocityX = useRef(0);
  const animFrameRef = useRef<number | null>(null);

  const restingY = 130;
  const triggerY = 240; // Y threshold where mic connects and starts listening

  // Drag listeners
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startDragY.current = e.clientY - currentY.current;
    startDragX.current = e.clientX - currentX.current;
    onEngageGoaMode();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 0) return;
    setIsDragging(true);
    startDragY.current = e.touches[0].clientY - currentY.current;
    startDragX.current = e.touches[0].clientX - currentX.current;
    onEngageGoaMode();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newY = Math.max(80, Math.min(e.clientY - startDragY.current, 380));
      const newX = Math.max(-120, Math.min(e.clientX - startDragX.current, 120));
      currentY.current = newY;
      currentX.current = newX;
      setMicY(newY);
      setMicX(newX);

      // If dragged past the trigger threshold, connect the mic and begin voice capture
      if (newY >= triggerY && !isPulledDown) {
        setIsPulledDown(true);
        if (!isRecording) {
          onStartVoice();
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length === 0) return;
      const newY = Math.max(80, Math.min(e.touches[0].clientY - startDragY.current, 380));
      const newX = Math.max(-120, Math.min(e.touches[0].clientX - startDragX.current, 120));
      currentY.current = newY;
      currentX.current = newX;
      setMicY(newY);
      setMicX(newX);

      if (newY >= triggerY && !isPulledDown) {
        setIsPulledDown(true);
        if (!isRecording) {
          onStartVoice();
        }
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        if (isRecording || isPulledDown) {
          onStopVoice();
          setIsPulledDown(false);
        }
        animateSpringReturn();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, isPulledDown, isRecording]);

  // Spring physics return animation when released
  const animateSpringReturn = () => {
    const k = 0.12; // Spring tension stiffness
    const damping = 0.78; // Air resistance damping

    const step = () => {
      const forceY = (restingY - currentY.current) * k;
      velocityY.current = (velocityY.current + forceY) * damping;
      currentY.current += velocityY.current;

      const forceX = (0 - currentX.current) * k;
      velocityX.current = (velocityX.current + forceX) * damping;
      currentX.current += velocityX.current;

      setMicY(currentY.current);
      setMicX(currentX.current);

      if (
        Math.abs(currentY.current - restingY) > 0.5 ||
        Math.abs(velocityY.current) > 0.2 ||
        Math.abs(currentX.current) > 0.5
      ) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        currentY.current = restingY;
        currentX.current = 0;
        setMicY(restingY);
        setMicX(0);
      }
    };

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(step);
  };

  const isConnected = isRecording || isPulledDown;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[400px] flex flex-col items-center select-none overflow-visible pointer-events-auto"
    >
      {/* Ceiling Mounting Bracket */}
      <div className="absolute top-0 z-30 flex flex-col items-center">
        <div className="w-20 h-4 bg-gradient-to-b from-slate-700 to-slate-900 rounded-b-lg border-b border-x border-amber-500/40 shadow-lg flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse" />
        </div>
      </div>

      {/* SVG Hanging Cable with Curvature Physics */}
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-10">
        <defs>
          <linearGradient id="cableGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#D97706" />
            <stop offset="50%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
          <filter id="cableGlow">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#F59E0B" floodOpacity="0.5" />
          </filter>
        </defs>
        <path
          d={`M ${window.innerWidth > 0 ? '50%' : '50%'} 0 Q ${
            window.innerWidth > 0 ? '50%' : '50%'
          } ${micY * 0.5} calc(50% + ${micX}px) ${micY - 20}`}
          stroke="url(#cableGrad)"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          filter={isConnected ? 'url(#cableGlow)' : undefined}
        />
      </svg>

      {/* Floating Guidance Tooltip */}
      {!isConnected && (
        <div
          style={{ top: `${micY - 70}px`, transform: `translateX(${micX}px)` }}
          className="absolute z-30 pointer-events-none flex flex-col items-center transition-opacity duration-300 animate-bounce"
        >
          <div className="px-3.5 py-1.5 rounded-full bg-amber-500/90 text-slate-950 font-bold text-xs font-display flex items-center space-x-1.5 shadow-[0_0_15px_rgba(245,158,11,0.6)]">
            <MoveDown className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>PULL DOWN TO SPEAK</span>
          </div>
          <div className="w-2 h-2 bg-amber-500 rotate-45 -mt-1" />
        </div>
      )}

      {/* Mic Connected Status Pill when Pulled Down */}
      {isConnected && (
        <div
          style={{ top: `${micY - 75}px`, transform: `translateX(${micX}px)` }}
          className="absolute z-30 pointer-events-none flex flex-col items-center animate-slide-up"
        >
          <div className="px-4 py-1.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-xs font-display flex items-center space-x-2 shadow-[0_0_20px_rgba(16,185,129,0.8)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-950" />
            </span>
            <span>MIC CONNECTED • LISTENING...</span>
          </div>
          <span className="text-[10px] font-mono-data text-emerald-300 bg-black/70 px-2 py-0.5 rounded-full mt-1 border border-emerald-500/40">
            Release mic to get your answer
          </span>
        </div>
      )}

      {/* Draggable Hanging Vintage Microphone Unit */}
      <div
        style={{
          top: `${micY - 30}px`,
          transform: `translateX(${micX}px) rotate(${micX * 0.15}deg)`,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className="absolute z-20 flex flex-col items-center group transition-transform duration-75"
      >
        {/* Glow rings when active audio */}
        {isConnected && (
          <div
            className="absolute -inset-6 rounded-full bg-amber-500/20 animate-ping pointer-events-none"
            style={{ animationDuration: '1.2s' }}
          />
        )}

        {/* Vintage Chrome Studio Mic Image (Rendered in Blender 5.2) */}
        <div className="relative w-32 h-44 flex items-center justify-center filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.85)] group-hover:scale-105 transition-transform">
          <img
            src="/assets/blender_vintage_mic.png"
            onError={(e) => {
              // Fallback if needed
              (e.target as HTMLImageElement).src = "/assets/vintage_mic.png";
            }}
            alt="Blender 3D Vintage Studio Microphone"
            className="w-full h-full object-contain pointer-events-none"
          />

          {/* Glowing Status LED on the mic body */}
          <div
            className={`absolute top-26 w-3.5 h-3.5 rounded-full transition-all duration-300 ${
              isConnected
                ? 'bg-emerald-400 shadow-[0_0_18px_rgba(16,185,129,1)]'
                : 'bg-amber-500/60 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
            }`}
          />
        </div>

        {/* Tactile Grab Handle Tag */}
        <div className="mt-1 px-3 py-1 rounded-full bg-black/80 border border-white/[0.1] group-hover:border-amber-500/60 text-[10px] font-mono-data text-slate-300 flex items-center space-x-1 shadow-md">
          <Radio className="w-3 h-3 text-amber-400" />
          <span>{isConnected ? 'LIVE FEED ACTIVE' : isGoaActive ? '🌴 GOA VIBES ACTIVE' : 'DRAG ME DOWN'}</span>
        </div>
      </div>
    </div>
  );
};
