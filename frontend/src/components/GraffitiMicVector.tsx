import React from 'react';

interface GraffitiMicVectorProps {
  isListening: boolean;
  volumeLevel: number;
}

export const GraffitiMicVector: React.FC<GraffitiMicVectorProps> = ({
  isListening,
  volumeLevel
}) => {
  // Soundwave scale based on actual live voice volume
  const waveScale = isListening ? Math.min(1.6, 1 + volumeLevel * 1.5) : 1;

  return (
    <div className="relative w-36 h-48 flex items-center justify-center filter drop-shadow-[8px_8px_0px_#000] select-none pointer-events-none">
      {/* Graffiti Spray Glow & Soundwave Burst */}
      {isListening && (
        <div
          style={{ transform: `scale(${waveScale})` }}
          className="absolute -inset-4 rounded-full bg-[#FFE500]/25 blur-sm transition-transform duration-75 pointer-events-none"
        />
      )}

      {/* Street Art Soundwave Burst Rays */}
      {isListening && (
        <svg className="absolute -inset-6 w-48 h-60 pointer-events-none animate-pulse">
          <path d="M 20 50 L 5 45" stroke="#FFE500" strokeWidth="4" strokeLinecap="round" />
          <path d="M 18 70 L 2 75" stroke="#00F5D4" strokeWidth="4" strokeLinecap="round" />
          <path d="M 24 95 L 8 105" stroke="#FF2A55" strokeWidth="4" strokeLinecap="round" />
          <path d="M 124 50 L 140 45" stroke="#FFE500" strokeWidth="4" strokeLinecap="round" />
          <path d="M 126 70 L 144 75" stroke="#00F5D4" strokeWidth="4" strokeLinecap="round" />
          <path d="M 120 95 L 138 105" stroke="#FF2A55" strokeWidth="4" strokeLinecap="round" />
        </svg>
      )}

      {/* Main Vector SVG Graffiti Studio Microphone */}
      <svg
        viewBox="0 0 140 180"
        className="w-full h-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Graffiti Red-Pink Body Gradient */}
          <linearGradient id="graffitiBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF2A55" />
            <stop offset="60%" stopColor="#D81159" />
            <stop offset="100%" stopColor="#8F00FF" />
          </linearGradient>

          {/* Grille Infill */}
          <linearGradient id="grilleInfill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#121629" />
            <stop offset="100%" stopColor="#05070D" />
          </linearGradient>

          {/* Chrome Slat Gradient */}
          <linearGradient id="slatGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFE500" />
            <stop offset="50%" stopColor="#FFFDF8" />
            <stop offset="100%" stopColor="#FFE500" />
          </linearGradient>
        </defs>

        {/* Top Swivel Mount & Cable Joint */}
        <rect x="58" y="4" width="24" height="18" rx="4" fill="#FFE500" stroke="#000000" strokeWidth="3.5" />
        <circle cx="70" cy="13" r="4" fill="#000000" />

        {/* Upper Mounting Arm */}
        <path
          d="M 52 20 C 52 20, 70 14, 88 20 L 94 32 C 94 32, 70 28, 46 32 Z"
          fill="#00F5D4"
          stroke="#000000"
          strokeWidth="3.5"
        />

        {/* Outer Capsule Frame */}
        <rect
          x="32"
          y="30"
          width="76"
          height="108"
          rx="38"
          fill="url(#graffitiBody)"
          stroke="#000000"
          strokeWidth="4"
        />

        {/* Inner Acoustic Grille Cutout */}
        <rect
          x="40"
          y="38"
          width="60"
          height="92"
          rx="30"
          fill="url(#grilleInfill)"
          stroke="#000000"
          strokeWidth="3"
        />

        {/* Horizontal Graphic Acoustic Slats / Ribs */}
        {[48, 58, 68, 78, 88, 98, 108, 118].map((yPos, i) => (
          <g key={i}>
            <rect
              x="44"
              y={yPos}
              width="52"
              height="4.5"
              rx="2"
              fill="url(#slatGrad)"
              stroke="#000000"
              strokeWidth="2"
            />
          </g>
        ))}

        {/* Center Vertical Chrome Spine */}
        <rect x="67" y="38" width="6" height="92" fill="#FFE500" stroke="#000000" strokeWidth="2.5" />

        {/* Center Street-Art Diamond Badge */}
        <polygon
          points="70,72 84,84 70,96 56,84"
          fill="#00F5D4"
          stroke="#000000"
          strokeWidth="3"
        />
        <circle cx="70" cy="84" r="3.5" fill="#FF2A55" stroke="#000000" strokeWidth="1.5" />

        {/* Graffiti Stickers & Tags on the Mic */}
        {/* 1. Lightning Bolt Sticker on Left */}
        <polygon
          points="26,70 34,70 30,82 38,82 22,98 27,86 20,86"
          fill="#FFE500"
          stroke="#000000"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* 2. Star Sticker on Right */}
        <polygon
          points="114,66 117,73 124,74 119,79 120,86 114,82 108,86 109,79 104,74 111,73"
          fill="#00F5D4"
          stroke="#000000"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* 3. Spray Paint Drips at Bottom */}
        <path
          d="M 50 136 C 50 148, 54 152, 54 144 C 54 136, 62 136, 64 148 C 66 156, 70 156, 70 142 C 70 136, 80 136, 84 150 C 86 156, 90 152, 90 136"
          fill="#FF2A55"
          stroke="#000000"
          strokeWidth="3"
        />

        {/* 4. Tag Text: "GOA" */}
        <text
          x="70"
          y="132"
          textAnchor="middle"
          fill="#FFE500"
          stroke="#000000"
          strokeWidth="1.5"
          fontSize="11"
          fontWeight="900"
          fontFamily="'Space Grotesk', sans-serif"
          letterSpacing="1.5"
        >
          GOA &apos;26
        </text>

        {/* Live Audio Glow LED Indicator */}
        <circle
          cx="70"
          cy="26"
          r="5"
          fill={isListening ? "#00F5D4" : "#FF2A55"}
          stroke="#000000"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
};
