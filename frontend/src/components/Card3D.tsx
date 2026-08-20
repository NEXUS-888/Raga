import React, { useRef, useState } from 'react';

interface Card3DProps {
  children: React.ReactNode;
  className?: string;
  screwAccents?: boolean;
}

export const Card3D: React.FC<Card3DProps> = ({
  children,
  className = '',
  screwAccents = true
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    // Gentle 3D perspective tilt (max 3 degrees to keep it smooth and battery efficient)
    setRotateX(-y / 45);
    setRotateY(x / 45);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div
      style={{ perspective: 1000 }}
      className="w-full"
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transition: 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1), border-color 150ms ease-out, background-color 150ms ease-out',
          willChange: 'transform'
        }}
        className={`relative titanium-card ${className}`}
      >
        {/* Chassis Corner Screws (Teenage Engineering Hardware Aesthetic) */}
        {screwAccents && (
          <>
            <div className="absolute top-2.5 left-2.5 w-1.5 h-1.5 rounded-full bg-slate-700/80 border border-slate-600/50 shadow-inner flex items-center justify-center pointer-events-none">
              <div className="w-1 h-0.5 bg-slate-400 rotate-45" />
            </div>
            <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-slate-700/80 border border-slate-600/50 shadow-inner flex items-center justify-center pointer-events-none">
              <div className="w-1 h-0.5 bg-slate-400 -rotate-45" />
            </div>
            <div className="absolute bottom-2.5 left-2.5 w-1.5 h-1.5 rounded-full bg-slate-700/80 border border-slate-600/50 shadow-inner flex items-center justify-center pointer-events-none">
              <div className="w-1 h-0.5 bg-slate-400 -rotate-45" />
            </div>
            <div className="absolute bottom-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-slate-700/80 border border-slate-600/50 shadow-inner flex items-center justify-center pointer-events-none">
              <div className="w-1 h-0.5 bg-slate-400 rotate-45" />
            </div>
          </>
        )}
        {children}
      </div>
    </div>
  );
};
