import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export const DistantHorizon: React.FC = () => {
  const palmFarLeftRef = useRef<SVGGElement | null>(null);
  const palmFarRightRef = useRef<SVGGElement | null>(null);

  useEffect(() => {
    // Subtle distant palm sway
    const tlLeft = gsap.timeline({ repeat: -1, yoyo: true });
    tlLeft.to(palmFarLeftRef.current, {
      rotation: 1.5,
      duration: 8.4,
      ease: 'sine.inOut',
      transformOrigin: 'bottom center',
    });

    const tlRight = gsap.timeline({ repeat: -1, yoyo: true });
    tlRight.to(palmFarRightRef.current, {
      rotation: -1.8,
      duration: 9.6,
      ease: 'sine.inOut',
      transformOrigin: 'bottom center',
    });

    return () => {
      tlLeft.kill();
      tlRight.kill();
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
          <linearGradient id="horizonHillsGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#661C48" />
            <stop offset="60%" stopColor="#3B0B2F" />
            <stop offset="100%" stopColor="#1F0421" />
          </linearGradient>

          <linearGradient id="horizonGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFE066" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FF7A00" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 1. Distant Horizon Glow Line */}
        <rect x="0" y="555" width="1920" height="25" fill="url(#horizonGlow)" />

        {/* 2. Distant Hills & Headlands */}
        <g id="distantHills" fill="url(#horizonHillsGrad)">
          {/* Left Headland */}
          <path d="M -20 570 Q 180 520 380 540 Q 560 515 720 565 L 720 580 L -20 580 Z" />
          {/* Right Headland */}
          <path d="M 1200 565 Q 1380 525 1580 540 Q 1740 510 1940 565 L 1940 580 L 1200 580 Z" />
        </g>

        {/* 3. Distant Silhouetted Palms on Headlands */}
        <g ref={palmFarLeftRef} id="distantPalmsLeft" fill="#240526">
          {/* Palm 1 */}
          <path d="M 220 545 Q 225 510 235 480 Q 230 482 225 545 Z" />
          {/* Fronds */}
          <path d="M 235 480 Q 210 465 185 475 Q 210 480 235 480 Z" />
          <path d="M 235 480 Q 220 455 205 450 Q 225 465 235 480 Z" />
          <path d="M 235 480 Q 255 455 275 460 Q 250 470 235 480 Z" />
          <path d="M 235 480 Q 265 475 285 490 Q 255 485 235 480 Z" />

          {/* Palm 2 */}
          <path d="M 280 550 Q 290 520 305 495 Q 300 497 285 550 Z" />
          <path d="M 305 495 Q 280 480 260 490 Q 285 495 305 495 Z" />
          <path d="M 305 495 Q 330 475 350 485 Q 325 490 305 495 Z" />
        </g>

        <g ref={palmFarRightRef} id="distantPalmsRight" fill="#240526">
          {/* Palm Right 1 */}
          <path d="M 1640 545 Q 1630 510 1620 485 Q 1625 487 1645 545 Z" />
          <path d="M 1620 485 Q 1595 470 1575 480 Q 1600 485 1620 485 Z" />
          <path d="M 1620 485 Q 1645 465 1665 475 Q 1640 480 1620 485 Z" />
          <path d="M 1620 485 Q 1650 485 1670 500 Q 1640 492 1620 485 Z" />
        </g>
      </svg>
    </div>
  );
};
