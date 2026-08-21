import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import type { VoiceSceneState } from './SceneAnimationManager';

interface IceCreamCartProps {
  sceneState: VoiceSceneState;
}

export const IceCreamCart: React.FC<IceCreamCartProps> = ({ sceneState }) => {
  const neonSignRef = useRef<SVGGElement | null>(null);
  const canopyRef = useRef<SVGGElement | null>(null);

  useEffect(() => {
    // 1. Realistic Neon "OPEN" Sign Random Intermittent Electrical Flicker
    const neonFlicker = () => {
      if (!neonSignRef.current) return;
      const isBurstFlicker = Math.random() > 0.65;
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.delayedCall(2.5 + Math.random() * 4.5, neonFlicker);
        },
      });

      if (isBurstFlicker) {
        tl.to(neonSignRef.current, { opacity: 0.25, duration: 0.04 })
          .to(neonSignRef.current, { opacity: 1.0, duration: 0.07 })
          .to(neonSignRef.current, { opacity: 0.4, duration: 0.03 })
          .to(neonSignRef.current, { opacity: 1.0, duration: 0.09 });
      } else {
        tl.to(neonSignRef.current, { opacity: 0.8, duration: 0.35, yoyo: true, repeat: 1 });
      }
    };

    // 2. Subtle Canopy Wind Sway
    const canopyTl = gsap.timeline({ repeat: -1, yoyo: true });
    canopyTl.to(canopyRef.current, {
      skewX: 1.2,
      duration: 3.6,
      ease: 'sine.inOut',
      transformOrigin: 'top center',
    });

    const timeout = setTimeout(neonFlicker, 1600);

    return () => {
      clearTimeout(timeout);
      canopyTl.kill();
      gsap.killTweensOf(neonSignRef.current);
    };
  }, []);

  // Reactive Voice AI State
  useEffect(() => {
    if (!neonSignRef.current) return;
    if (sceneState === 'LISTENING') {
      gsap.to(neonSignRef.current, {
        filter: 'drop-shadow(0 0 12px #00F5D4)',
        duration: 0.4,
      });
    } else if (sceneState === 'PROCESSING') {
      gsap.to(neonSignRef.current, {
        filter: 'drop-shadow(0 0 14px #FFE500)',
        duration: 0.4,
      });
    } else {
      gsap.to(neonSignRef.current, {
        filter: 'drop-shadow(0 0 8px rgba(0, 245, 212, 0.85))',
        duration: 0.8,
      });
    }
  }, [sceneState]);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden">
      <svg
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full"
      >
        <defs>
          {/* Cart Box Gradient */}
          <linearGradient id="cartBoxGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FF2A55" />
            <stop offset="60%" stopColor="#C9184A" />
            <stop offset="100%" stopColor="#7F0019" />
          </linearGradient>

          {/* Striped Canopy Gradient */}
          <linearGradient id="cartCanopyStripe" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFE500" />
            <stop offset="25%" stopColor="#FFE500" />
            <stop offset="25%" stopColor="#FF2A55" />
            <stop offset="50%" stopColor="#FF2A55" />
            <stop offset="50%" stopColor="#FFE500" />
            <stop offset="75%" stopColor="#FFE500" />
            <stop offset="75%" stopColor="#FF2A55" />
            <stop offset="100%" stopColor="#FF2A55" />
          </linearGradient>

          {/* Bicycle Frame Metal Gradient */}
          <linearGradient id="bikeFrameMetal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4A1526" />
            <stop offset="100%" stopColor="#1A020B" />
          </linearGradient>
        </defs>

        {/* Master Illustrated Cart & Bicycle - Positioned at X: 1240, Y: 715 */}
        <g id="masterIceCreamKiosk" transform="translate(1240, 715)">
          {/* Ground Contact Shadow */}
          <ellipse cx="140" cy="208" rx="170" ry="22" fill="#14020E" opacity="0.45" />

          {/* ======================================================== */}
          {/* 1. VINTAGE ROADSTER BICYCLE */}
          {/* ======================================================== */}
          <g id="illustratedBicycle" transform="translate(-50, 85)" stroke="url(#bikeFrameMetal)" strokeWidth="2.8" fill="none">
            {/* Rear Spoked Wheel */}
            <circle cx="20" cy="75" r="30" stroke="#000" strokeWidth="2.5" />
            <circle cx="20" cy="75" r="28" stroke="#FFE500" strokeWidth="0.8" opacity="0.75" />
            <line x1="20" y1="45" x2="20" y2="105" strokeWidth="0.8" />
            <line x1="-10" y1="75" x2="50" y2="75" strokeWidth="0.8" />
            <line x1="-1" y1="54" x2="41" y2="96" strokeWidth="0.8" />
            <line x1="-1" y1="96" x2="41" y2="54" strokeWidth="0.8" />

            {/* Front Spoked Wheel */}
            <circle cx="110" cy="75" r="30" stroke="#000" strokeWidth="2.5" />
            <circle cx="110" cy="75" r="28" stroke="#FFE500" strokeWidth="0.8" opacity="0.75" />
            <line x1="110" y1="45" x2="110" y2="105" strokeWidth="0.8" />
            <line x1="80" y1="75" x2="140" y2="75" strokeWidth="0.8" />
            <line x1="89" y1="54" x2="131" y2="96" strokeWidth="0.8" />
            <line x1="89" y1="96" x2="131" y2="54" strokeWidth="0.8" />

            {/* Vintage Diamond Frame */}
            <path d="M 20 75 L 58 75 L 90 42 L 48 42 Z" strokeWidth="3.2" />
            <line x1="58" y1="75" x2="48" y2="42" strokeWidth="3.2" /> {/* Seat Tube */}
            <line x1="90" y1="42" x2="110" y2="75" strokeWidth="3.2" /> {/* Front Fork */}

            {/* Leather Saddle & Chrome Handlebars */}
            <path d="M 90 42 L 86 32 L 78 32 M 86 32 L 95 32" stroke="#FFE500" strokeWidth="3.2" strokeLinecap="round" />
            <path d="M 44 38 L 56 38" stroke="#000" strokeWidth="5.5" strokeLinecap="round" />
          </g>

          {/* ======================================================== */}
          {/* 2. ICE CREAM KIOSK CART */}
          {/* ======================================================== */}
          <g id="illustratedCart">
            {/* Spoked Cart Wheels */}
            <g stroke="#000" strokeWidth="3.5" fill="none">
              <circle cx="45" cy="180" r="26" fill="#3D0B20" />
              <circle cx="45" cy="180" r="24" stroke="#FFE500" strokeWidth="1.2" />
              <line x1="45" y1="154" x2="45" y2="206" strokeWidth="1" stroke="#FFE500" />
              <line x1="19" y1="180" x2="71" y2="180" strokeWidth="1" stroke="#FFE500" />

              <circle cx="180" cy="180" r="26" fill="#3D0B20" />
              <circle cx="180" cy="180" r="24" stroke="#FFE500" strokeWidth="1.2" />
              <line x1="180" y1="154" x2="180" y2="206" strokeWidth="1" stroke="#FFE500" />
              <line x1="154" y1="180" x2="206" y2="180" strokeWidth="1" stroke="#FFE500" />
            </g>

            {/* Cart Body Box with Gold Trim */}
            <rect
              x="18"
              y="72"
              width="190"
              height="98"
              rx="6"
              fill="url(#cartBoxGrad)"
              stroke="#000"
              strokeWidth="2.8"
            />
            {/* Decorative Gold Inset Panel */}
            <rect
              x="28"
              y="82"
              width="170"
              height="78"
              rx="4"
              fill="none"
              stroke="#FFE500"
              strokeWidth="2"
            />

            {/* Ice Cream Waffle Cone Illustration on Cart Body */}
            <g transform="translate(105, 112)">
              <polygon points="10,26 0,0 20,0" fill="#E09F3E" stroke="#000" strokeWidth="1.2" />
              <circle cx="10" cy="-4" r="10" fill="#FFCCD5" stroke="#000" strokeWidth="1.2" />
              <circle cx="10" cy="-15" r="9" fill="#FFF3B0" stroke="#000" strokeWidth="1.2" />
              <circle cx="10" cy="-24" r="4.5" fill="#D90429" /> {/* Glazed Cherry */}
            </g>

            {/* Canopy Wooden Poles */}
            <line x1="24" y1="72" x2="24" y2="-6" stroke="#FFE500" strokeWidth="3.5" />
            <line x1="202" y1="72" x2="202" y2="-6" stroke="#FFE500" strokeWidth="3.5" />

            {/* Animated Scalloped Canopy Roof */}
            <g ref={canopyRef} id="cartCanopyAnimated">
              <path
                d="M 12 -6 L 214 -6 L 224 36 L 2 36 Z"
                fill="url(#cartCanopyStripe)"
                stroke="#000"
                strokeWidth="2.8"
              />
              {/* Scalloped Yellow Fringe */}
              <path
                d="M 2 36 Q 23 48 44 36 Q 65 48 86 36 Q 107 48 128 36 Q 149 48 170 36 Q 191 48 212 36 L 224 36"
                stroke="#FFE500"
                strokeWidth="3.5"
                fill="none"
              />
            </g>

            {/* Glowing Neon "OPEN" Sign */}
            <g ref={neonSignRef} id="neonOpenSignTube" transform="translate(136, 46)">
              {/* Neon Frame Box */}
              <rect x="-6" y="-4" width="58" height="26" rx="4" fill="#0D0214" stroke="#2B0736" strokeWidth="1.8" />
              {/* Glowing Neon Text */}
              <text
                x="4"
                y="15"
                fontFamily="'Courier New', monospace"
                fontWeight="900"
                fontSize="16"
                letterSpacing="3"
                fill="#00F5D4"
                stroke="#00F5D4"
                strokeWidth="0.6"
              >
                OPEN
              </text>
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
};
