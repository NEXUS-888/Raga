import React from 'react';

interface GraffitiMicVectorProps {
  isListening: boolean;
  volumeLevel: number;
}

export const GraffitiMicVector: React.FC<GraffitiMicVectorProps> = ({
  isListening,
  volumeLevel
}) => {
  // Dynamic audio reactive scale
  const pulseScale = isListening ? Math.min(1.25, 1 + volumeLevel * 0.8) : 1;

  return (
    <div className="relative w-40 h-52 flex items-center justify-center filter drop-shadow-[10px_10px_0px_rgba(0,0,0,0.85)] select-none pointer-events-none transition-transform duration-150"
         style={{ transform: `scale(${pulseScale})` }}>
      
      {/* Soundwave Aura when Recording */}
      {isListening && (
        <div
          style={{ transform: `scale(${1 + volumeLevel * 1.6})` }}
          className="absolute -inset-4 rounded-full bg-[#FFE500]/25 blur-md transition-transform duration-75 pointer-events-none"
        />
      )}

      {/* SVG Exact Vector Recreation of Reference Vintage Yellow & Purple Mic */}
      <svg
        viewBox="0 0 160 210"
        className="w-full h-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Main Gold/Yellow Capsule Gradients */}
          <linearGradient id="micBodyGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF36D" />
            <stop offset="35%" stopColor="#FFC72C" />
            <stop offset="75%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>

          <linearGradient id="micBodyLeftShadow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D97706" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#FFC72C" />
          </linearGradient>

          <linearGradient id="micHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FFF59D" stopOpacity="0.2" />
          </linearGradient>

          {/* Deep Royal Purple Grille Vents Gradients */}
          <linearGradient id="purpleGrille" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#40105C" />
            <stop offset="50%" stopColor="#5E1E82" />
            <stop offset="100%" stopColor="#310848" />
          </linearGradient>

          <linearGradient id="purpleRim" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7E22CE" />
            <stop offset="100%" stopColor="#4A0E6B" />
          </linearGradient>

          <linearGradient id="purpleKnob" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6B21A8" />
            <stop offset="60%" stopColor="#4C1D95" />
            <stop offset="100%" stopColor="#2E1065" />
          </linearGradient>
        </defs>

        {/* ======================================================== */}
        {/* 1. TOP PURPLE RUBBER BOOT / CABLE SOCKET                 */}
        {/* ======================================================== */}
        <path
          d="M 72 2 C 72 2, 79 0, 87 2 L 95 18 C 95 18, 80 23, 64 18 Z"
          fill="url(#purpleRim)"
          stroke="#0F0F1A"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <ellipse cx="79" cy="3" rx="8" ry="3.5" fill="#2E1065" stroke="#0F0F1A" strokeWidth="2.5" />
        <ellipse cx="79.5" cy="18" rx="15" ry="4.5" fill="url(#purpleGrille)" stroke="#0F0F1A" strokeWidth="3" />

        {/* ======================================================== */}
        {/* 2. MAIN MICROPHONE CHASSIS (Warm Yellow 3/4 Capsule)     */}
        {/* ======================================================== */}
        {/* Left Side Facet (Shadowed amber face) */}
        <path
          d="M 48 55 
             C 45 65, 43 95, 42 125 
             C 41 145, 52 165, 70 174 
             L 74 172 
             C 65 150, 64 90, 68 50 
             C 68 40, 58 45, 48 55 Z"
          fill="url(#micBodyLeftShadow)"
          stroke="#0F0F1A"
          strokeWidth="4"
          strokeLinejoin="round"
        />

        {/* Main Front Curved Shell */}
        <path
          d="M 68 48 
             C 75 35, 110 38, 122 55 
             C 128 65, 126 110, 122 135 
             C 118 155, 105 168, 85 174 
             C 68 174, 60 162, 64 148 
             C 65 110, 65 70, 68 48 Z"
          fill="url(#micBodyGold)"
          stroke="#0F0F1A"
          strokeWidth="4"
          strokeLinejoin="round"
        />

        {/* Glossy Edge Highlight Reflection (Bottom-Left Curve) */}
        <path
          d="M 46 120 
             C 45 138, 54 158, 70 168 
             C 62 160, 54 144, 55 125 Z"
          fill="url(#micHighlight)"
        />

        {/* ======================================================== */}
        {/* 3. TOP CURVED VENT SLOTS (3 Deep Purple Slats on Top)    */}
        {/* ======================================================== */}
        {/* Top Vent 1 */}
        <path
          d="M 80 43 C 86 41, 100 44, 108 55 L 103 61 C 96 52, 85 49, 78 50 Z"
          fill="url(#purpleGrille)"
          stroke="#0F0F1A"
          strokeWidth="3"
        />
        {/* Top Vent 2 */}
        <path
          d="M 92 45 C 99 44, 110 48, 116 60 L 111 65 C 105 56, 96 52, 90 52 Z"
          fill="url(#purpleGrille)"
          stroke="#0F0F1A"
          strokeWidth="3"
        />
        {/* Top Vent 3 */}
        <path
          d="M 104 50 C 111 50, 118 56, 122 66 L 118 70 C 114 62, 108 57, 102 56 Z"
          fill="url(#purpleGrille)"
          stroke="#0F0F1A"
          strokeWidth="2.5"
        />

        {/* ======================================================== */}
        {/* 4. FRONT HORIZONTAL ACOUSTIC GRILLE SLOTS (5 Purple Ribs) */}
        {/* ======================================================== */}
        {/* Slot 1 (Top Front) */}
        <path
          d="M 76 72 C 86 70, 112 68, 119 75 C 120 80, 115 84, 107 85 C 96 86, 78 84, 73 80 Z"
          fill="url(#purpleGrille)"
          stroke="#0F0F1A"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <path d="M 78 74 C 88 72, 110 71, 116 76" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" />

        {/* Slot 2 */}
        <path
          d="M 74 90 C 85 87, 110 85, 117 92 C 118 97, 114 101, 105 102 C 94 103, 76 101, 71 97 Z"
          fill="url(#purpleGrille)"
          stroke="#0F0F1A"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <path d="M 76 92 C 86 89, 108 88, 114 93" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" />

        {/* Slot 3 (Center) */}
        <path
          d="M 72 107 C 83 104, 107 102, 114 109 C 115 114, 111 117, 102 118 C 91 119, 74 117, 69 113 Z"
          fill="url(#purpleGrille)"
          stroke="#0F0F1A"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <path d="M 74 109 C 84 106, 105 105, 111 110" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" />

        {/* Slot 4 */}
        <path
          d="M 70 124 C 80 121, 103 119, 110 125 C 111 130, 107 133, 99 134 C 89 135, 73 133, 68 129 Z"
          fill="url(#purpleGrille)"
          stroke="#0F0F1A"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <path d="M 72 126 C 81 123, 101 121, 107 126" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" />

        {/* Slot 5 (Bottom Front) */}
        <path
          d="M 69 140 C 78 137, 98 136, 104 141 C 105 145, 101 148, 94 149 C 85 150, 71 148, 67 144 Z"
          fill="url(#purpleGrille)"
          stroke="#0F0F1A"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <path d="M 71 142 C 79 139, 96 138, 101 142" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" />

        {/* ======================================================== */}
        {/* 5. SIDE SLOTS (4 Horizontal Vent Slots on Left Facet)     */}
        {/* ======================================================== */}
        {/* Side Slot 1 */}
        <rect x="46" y="70" width="16" height="8" rx="4" fill="url(#purpleGrille)" stroke="#0F0F1A" strokeWidth="3" transform="rotate(-6 54 74)" />
        {/* Side Slot 2 */}
        <rect x="45" y="87" width="16" height="8" rx="4" fill="url(#purpleGrille)" stroke="#0F0F1A" strokeWidth="3" transform="rotate(-5 53 91)" />
        {/* Side Slot 3 */}
        <rect x="44" y="104" width="16" height="8" rx="4" fill="url(#purpleGrille)" stroke="#0F0F1A" strokeWidth="3" transform="rotate(-4 52 108)" />
        {/* Side Slot 4 */}
        <rect x="43" y="121" width="16" height="8" rx="4" fill="url(#purpleGrille)" stroke="#0F0F1A" strokeWidth="3" transform="rotate(-3 51 125)" />

        {/* ======================================================== */}
        {/* 6. BOTTOM CURVED CHIN SLOTS (3 Purple Cutouts)           */}
        {/* ======================================================== */}
        <path d="M 71 163 C 71 168, 77 172, 80 170 L 78 158 Z" fill="url(#purpleGrille)" stroke="#0F0F1A" strokeWidth="3" />
        <path d="M 83 162 C 85 167, 91 169, 94 166 L 90 156 Z" fill="url(#purpleGrille)" stroke="#0F0F1A" strokeWidth="3" />
        <path d="M 96 158 C 99 162, 103 163, 105 159 L 101 152 Z" fill="url(#purpleGrille)" stroke="#0F0F1A" strokeWidth="3" />

        {/* ======================================================== */}
        {/* 7. SIDE SWIVEL MOUNT DIAL / PURPLE KNOB                  */}
        {/* ======================================================== */}
        {/* Knob Base/Cylinder */}
        <ellipse cx="56" cy="88" rx="8" ry="12" fill="#2E1065" stroke="#0F0F1A" strokeWidth="3.5" />
        <path
          d="M 52 77 L 57 77 C 62 77, 65 82, 65 88 C 65 94, 62 99, 57 99 L 52 99 Z"
          fill="url(#purpleKnob)"
          stroke="#0F0F1A"
          strokeWidth="3.5"
        />
        {/* Knob Outer Cap with Bevel Highlight */}
        <ellipse cx="58" cy="88" rx="6.5" ry="10.5" fill="url(#purpleRim)" stroke="#0F0F1A" strokeWidth="3" />
        <ellipse cx="57" cy="86" rx="3.5" ry="5.5" fill="#A855F7" opacity="0.6" />

      </svg>
    </div>
  );
};

