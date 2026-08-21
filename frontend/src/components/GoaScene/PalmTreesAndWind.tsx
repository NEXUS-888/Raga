import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export const PalmTreesAndWind: React.FC = () => {
  const palmLeftMainRef = useRef<SVGGElement | null>(null);
  const palmLeftSecondaryRef = useRef<SVGGElement | null>(null);
  const palmRightMainRef = useRef<SVGGElement | null>(null);
  const grassRef = useRef<SVGGElement | null>(null);

  useEffect(() => {
    // 1. Palm Left Main - 7.2s Natural Sway
    const tlLeft1 = gsap.timeline({ repeat: -1, yoyo: true });
    tlLeft1.to(palmLeftMainRef.current, {
      rotation: 3.0,
      duration: 7.2,
      ease: 'sine.inOut',
      transformOrigin: '0% 100%',
    });

    // 2. Palm Left Secondary - 9.1s Sway (Asynchronous)
    const tlLeft2 = gsap.timeline({ repeat: -1, yoyo: true });
    tlLeft2.to(palmLeftSecondaryRef.current, {
      rotation: -2.6,
      duration: 9.1,
      ease: 'sine.inOut',
      transformOrigin: '0% 100%',
    });

    // 3. Palm Right Main - 6.4s Sway
    const tlRight = gsap.timeline({ repeat: -1, yoyo: true });
    tlRight.to(palmRightMainRef.current, {
      rotation: -3.2,
      duration: 6.4,
      ease: 'sine.inOut',
      transformOrigin: '100% 100%',
    });

    // 4. Frond Flutter
    const frondTl = gsap.timeline({ repeat: -1, yoyo: true });
    frondTl.to('.palm-leaf-blade', {
      scaleY: 1.05,
      rotation: 1.6,
      stagger: 0.15,
      duration: 3.2,
      ease: 'sine.inOut',
      transformOrigin: 'center center',
    });

    // 5. Beach Grass Sway
    const grassTl = gsap.timeline({ repeat: -1, yoyo: true });
    grassTl.to('.beach-grass-blade', {
      skewX: 7,
      duration: 2.5,
      stagger: 0.1,
      ease: 'sine.inOut',
      transformOrigin: 'bottom center',
    });

    return () => {
      tlLeft1.kill();
      tlLeft2.kill();
      tlRight.kill();
      frondTl.kill();
      grassTl.kill();
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
          {/* Palm Trunk Texture Gradient */}
          <linearGradient id="palmTrunkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4A1435" />
            <stop offset="40%" stopColor="#300922" />
            <stop offset="100%" stopColor="#14020E" />
          </linearGradient>

          {/* Lush Palm Leaf Gradient */}
          <linearGradient id="palmLeafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6B1D40" />
            <stop offset="50%" stopColor="#430C28" />
            <stop offset="100%" stopColor="#1F0312" />
          </linearGradient>
        </defs>

        {/* ======================================================== */}
        {/* 1. LEFT FRAMING PALMS */}
        {/* ======================================================== */}
        <g id="palmsLeftCluster">
          {/* Main Tall Left Palm */}
          <g ref={palmLeftMainRef} transform="translate(0, 0)">
            {/* Trunk with Bark Segments */}
            <path
              d="M -40 1080 Q 90 600 130 180 Q 155 180 108 600 Q 10 1080 -40 1080 Z"
              fill="url(#palmTrunkGrad)"
            />
            {/* Bark Ring Detailing */}
            <g stroke="#FF2A55" strokeWidth="1" opacity="0.3" fill="none">
              <path d="M 12 900 Q 30 890 48 905" />
              <path d="M 38 750 Q 55 740 72 755" />
              <path d="M 65 600 Q 82 590 98 605" />
              <path d="M 92 450 Q 108 440 122 455" />
              <path d="M 115 300 Q 128 290 140 305" />
            </g>

            {/* Lush Crown of Fronds (X=140, Y=180) */}
            <g id="crownLeftMain" transform="translate(140, 180)" fill="url(#palmLeafGrad)" stroke="#12010A" strokeWidth="1.5">
              {/* Frond 1 (Top Left) */}
              <path className="palm-leaf-blade" d="M 0 0 Q -130 -90 -240 -25 Q -150 15 0 0 Z" />
              {/* Frond 2 (Upper Left Arc) */}
              <path className="palm-leaf-blade" d="M 0 0 Q -90 -150 -180 -130 Q -100 -45 0 0 Z" />
              {/* Frond 3 (Top Upward Arch) */}
              <path className="palm-leaf-blade" d="M 0 0 Q -25 -195 45 -185 Q 25 -90 0 0 Z" />
              {/* Frond 4 (Top Right Arc) */}
              <path className="palm-leaf-blade" d="M 0 0 Q 130 -175 230 -110 Q 135 -45 0 0 Z" />
              {/* Frond 5 (Right Droop) */}
              <path className="palm-leaf-blade" d="M 0 0 Q 175 -65 260 45 Q 155 35 0 0 Z" />
              {/* Frond 6 (Down Droop) */}
              <path className="palm-leaf-blade" d="M 0 0 Q 100 80 135 175 Q 70 100 0 0 Z" />

              {/* Coconut Cluster */}
              <circle cx="-6" cy="6" r="10" fill="#1A020E" />
              <circle cx="9" cy="9" r="10" fill="#14020B" />
              <circle cx="2" cy="18" r="9" fill="#100108" />
            </g>
          </g>

          {/* Secondary Leaning Left Palm */}
          <g ref={palmLeftSecondaryRef} transform="translate(0, 0)">
            {/* Trunk */}
            <path
              d="M 60 1080 Q 210 680 270 320 Q 288 320 228 680 Q 95 1080 60 1080 Z"
              fill="url(#palmTrunkGrad)"
            />
            {/* Crown of Fronds (X=275, Y=320) */}
            <g id="crownLeftSecondary" transform="translate(275, 320)" fill="url(#palmLeafGrad)" stroke="#12010A" strokeWidth="1.2">
              <path className="palm-leaf-blade" d="M 0 0 Q -120 -80 -210 -15 Q -130 20 0 0 Z" />
              <path className="palm-leaf-blade" d="M 0 0 Q -70 -135 -145 -115 Q -80 -40 0 0 Z" />
              <path className="palm-leaf-blade" d="M 0 0 Q 110 -145 200 -90 Q 110 -35 0 0 Z" />
              <path className="palm-leaf-blade" d="M 0 0 Q 155 -45 220 55 Q 120 40 0 0 Z" />
              <circle cx="-4" cy="7" r="9" fill="#14020B" />
              <circle cx="8" cy="9" r="8" fill="#1A020E" />
            </g>
          </g>
        </g>

        {/* ======================================================== */}
        {/* 2. RIGHT FRAMING PALM */}
        {/* ======================================================== */}
        <g id="palmsRightCluster">
          <g ref={palmRightMainRef} transform="translate(0, 0)">
            {/* Trunk */}
            <path
              d="M 1940 1080 Q 1820 620 1760 210 Q 1735 210 1792 620 Q 1890 1080 1940 1080 Z"
              fill="url(#palmTrunkGrad)"
            />
            {/* Crown of Fronds (X=1750, Y=210) */}
            <g id="crownRightMain" transform="translate(1750, 210)" fill="url(#palmLeafGrad)" stroke="#12010A" strokeWidth="1.5">
              <path className="palm-leaf-blade" d="M 0 0 Q -165 -145 -265 -70 Q -155 -25 0 0 Z" />
              <path className="palm-leaf-blade" d="M 0 0 Q -200 -45 -290 55 Q -165 45 0 0 Z" />
              <path className="palm-leaf-blade" d="M 0 0 Q -120 80 -155 180 Q -90 90 0 0 Z" />
              <path className="palm-leaf-blade" d="M 0 0 Q 35 -175 -35 -165 Q -25 -80 0 0 Z" />
              <path className="palm-leaf-blade" d="M 0 0 Q 135 -125 220 -45 Q 120 -15 0 0 Z" />
              <circle cx="-5" cy="6" r="10" fill="#14020B" />
              <circle cx="7" cy="9" r="9" fill="#1A020E" />
            </g>
          </g>
        </g>

        {/* ======================================================== */}
        {/* 3. COASTAL BEACH GRASS (Bottom Edge) */}
        {/* ======================================================== */}
        <g ref={grassRef} id="coastalBeachGrass" fill="#2E0A1E">
          {/* Left Grass */}
          <path className="beach-grass-blade" d="M 120 1080 Q 110 1020 90 980 Q 115 1025 125 1080 Z" />
          <path className="beach-grass-blade" d="M 140 1080 Q 145 1010 165 960 Q 150 1020 145 1080 Z" />
          <path className="beach-grass-blade" d="M 160 1080 Q 180 1030 205 990 Q 175 1035 165 1080 Z" />
          <path className="beach-grass-blade" d="M 280 1080 Q 270 1015 250 970 Q 275 1025 285 1080 Z" />

          {/* Right Grass */}
          <path className="beach-grass-blade" d="M 1580 1080 Q 1590 1010 1620 965 Q 1595 1020 1585 1080 Z" />
          <path className="beach-grass-blade" d="M 1620 1080 Q 1610 1025 1590 985 Q 1615 1030 1625 1080 Z" />
          <path className="beach-grass-blade" d="M 1720 1080 Q 1740 1020 1765 975 Q 1735 1030 1725 1080 Z" />
        </g>
      </svg>
    </div>
  );
};
