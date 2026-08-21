import React from 'react';

interface BeachGroundProps {
  isNight?: boolean;
}

export const BeachGround: React.FC<BeachGroundProps> = ({ isNight = false }) => {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden">
      <svg
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full"
      >
        <defs>
          {/* Day Golden Beach Sand Gradients */}
          <linearGradient id="sandBackGradDay" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#C45A1A" />
            <stop offset="40%" stopColor="#E27418" />
            <stop offset="100%" stopColor="#FA8C16" />
          </linearGradient>

          <linearGradient id="sandMidGradDay" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FA8C16" />
            <stop offset="50%" stopColor="#FF9C24" />
            <stop offset="100%" stopColor="#FFBA3B" />
          </linearGradient>

          <linearGradient id="sandFrontGradDay" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFB338" />
            <stop offset="60%" stopColor="#FFCA58" />
            <stop offset="100%" stopColor="#FFD670" />
          </linearGradient>

          {/* Night Deep Violet Beach Sand Gradients */}
          <linearGradient id="sandBackGradNight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0E051C" />
            <stop offset="40%" stopColor="#18092E" />
            <stop offset="100%" stopColor="#250E45" />
          </linearGradient>

          <linearGradient id="sandMidGradNight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#220D40" />
            <stop offset="50%" stopColor="#2E1254" />
            <stop offset="100%" stopColor="#3C186B" />
          </linearGradient>

          <linearGradient id="sandFrontGradNight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#35165E" />
            <stop offset="60%" stopColor="#451D7A" />
            <stop offset="100%" stopColor="#552494" />
          </linearGradient>

          {/* Wet Sand Shoreline Sheen */}
          <linearGradient id="wetSandSheen" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF7A00" stopOpacity="0" />
            <stop offset="50%" stopColor="#FFE066" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#FF7A00" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* ========================================================================= */}
        {/* 1. DISTANT DUNE (Shoreline meeting the water at Y: 740 - 790)             */}
        {/* ========================================================================= */}
        <g className="transition-opacity duration-1000">
          <path
            d="M -20 750 Q 240 730 520 745 Q 860 762 1200 738 Q 1560 722 1940 748 L 1940 1080 L -20 1080 Z"
            fill={isNight ? 'url(#sandBackGradNight)' : 'url(#sandBackGradDay)'}
          />
        </g>

        {/* Shoreline Wet Sand Reflection Band */}
        <path
          d="M 300 746 Q 650 760 960 752 Q 1300 740 1620 736"
          stroke="url(#wetSandSheen)"
          strokeWidth="6"
          fill="none"
          opacity="0.8"
        />

        {/* ========================================================================= */}
        {/* 2. MID BEACH DUNE (Sweeping organic curves Y: 790 - 890)                  */}
        {/* ========================================================================= */}
        <g className="transition-opacity duration-1000">
          <path
            d="M -20 830 Q 320 790 700 825 Q 1120 860 1520 805 Q 1760 780 1940 820 L 1940 1080 L -20 1080 Z"
            fill={isNight ? 'url(#sandMidGradNight)' : 'url(#sandMidGradDay)'}
          />
        </g>

        {/* Dune Texture Ridge Line */}
        <path
          d="M 180 812 Q 540 820 900 848 Q 1340 828 1780 802"
          stroke={isNight ? '#1E0B38' : '#D46012'}
          strokeWidth="2.5"
          fill="none"
          opacity="0.6"
        />

        {/* ========================================================================= */}
        {/* 3. FOREGROUND BEACH DUNE (Bottom anchor Y: 890 - 1080)                    */}
        {/* ========================================================================= */}
        <g className="transition-opacity duration-1000">
          <path
            d="M -20 910 Q 420 865 880 915 Q 1320 955 1940 885 L 1940 1080 L -20 1080 Z"
            fill={isNight ? 'url(#sandFrontGradNight)' : 'url(#sandFrontGradDay)'}
          />
        </g>

        {/* Foreground Contour Ridges */}
        <path
          d="M 60 892 Q 480 885 920 930 Q 1400 950 1880 895"
          stroke={isNight ? '#2A104E' : '#E87216'}
          strokeWidth="3.0"
          fill="none"
          opacity="0.5"
        />
        <path
          d="M 240 965 Q 680 950 1140 985 Q 1580 970 1940 945"
          stroke={isNight ? '#35165E' : '#F78822'}
          strokeWidth="2.0"
          fill="none"
          opacity="0.4"
        />
      </svg>
    </div>
  );
};
