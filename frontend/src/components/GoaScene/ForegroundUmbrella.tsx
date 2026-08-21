import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export const ForegroundUmbrella: React.FC = () => {
  const umbrellaCanopyRef = useRef<SVGGElement | null>(null);

  useEffect(() => {
    // Subtle gentle umbrella sway in the coastal breeze
    const umbrellaTl = gsap.timeline({ repeat: -1, yoyo: true });
    umbrellaTl.to(umbrellaCanopyRef.current, {
      rotation: 1.4,
      duration: 5.4,
      ease: 'sine.inOut',
      transformOrigin: '50% 100%',
    });

    return () => {
      umbrellaTl.kill();
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden">
      <svg
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full"
      >
        <defs>
          {/* Retro Beach Umbrella Stripe Gradient */}
          <linearGradient id="umbrellaStripeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFE500" />
            <stop offset="20%" stopColor="#FFE500" />
            <stop offset="20%" stopColor="#FF2A55" />
            <stop offset="40%" stopColor="#FF2A55" />
            <stop offset="40%" stopColor="#00F5D4" />
            <stop offset="60%" stopColor="#00F5D4" />
            <stop offset="60%" stopColor="#FFE500" />
            <stop offset="80%" stopColor="#FFE500" />
            <stop offset="80%" stopColor="#FF2A55" />
            <stop offset="100%" stopColor="#FF2A55" />
          </linearGradient>
        </defs>

        {/* Master Beach Umbrella - Positioned over table at X: 520, Y: 545 */}
        <g id="masterBeachUmbrella" transform="translate(520, 545)">
          {/* Main Wooden Mast Pole */}
          <line
            x1="140"
            y1="140"
            x2="140"
            y2="365"
            stroke="#2B0515"
            strokeWidth="7"
            strokeLinecap="round"
          />

          {/* Animated Illustrated Canopy */}
          <g ref={umbrellaCanopyRef} id="umbrellaCanopy">
            {/* Curved Canopy Dome */}
            <path
              d="M 8 140 Q 140 25 272 140 Q 242 156 212 140 Q 182 156 152 140 Q 122 156 92 140 Q 62 156 32 140 L 8 140 Z"
              fill="url(#umbrellaStripeGrad)"
              stroke="#000"
              strokeWidth="2.8"
            />
            {/* Top Golden Finial */}
            <polygon points="140,18 145,28 135,28" fill="#FFE500" stroke="#000" strokeWidth="1" />

            {/* Fringe Tassels */}
            <path
              d="M 8 142 L 8 152 M 38 142 L 38 152 M 68 142 L 68 152 M 98 142 L 98 152 M 128 142 L 128 152 M 158 142 L 158 152 M 188 142 L 188 152 M 218 142 L 218 152 M 248 142 L 248 152 M 272 142 L 272 152"
              stroke="#FFF"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>
        </g>
      </svg>
    </div>
  );
};
