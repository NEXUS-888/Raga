import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface PalmTreesAndWindProps {
  isNight?: boolean;
}

export const PalmTreesAndWind: React.FC<PalmTreesAndWindProps> = ({ isNight = false }) => {
  const palmLeftMainRef = useRef<SVGGElement | null>(null);
  const palmLeftSecondaryRef = useRef<SVGGElement | null>(null);
  const palmRightMainRef = useRef<SVGGElement | null>(null);
  const palmRightSecondaryRef = useRef<SVGGElement | null>(null);
  const grassRef = useRef<SVGGElement | null>(null);

  useEffect(() => {
    // 1. Palm Left Main - 7.2s Natural Sway
    const tlLeft1 = gsap.timeline({ repeat: -1, yoyo: true });
    tlLeft1.to(palmLeftMainRef.current, {
      rotation: 3.2,
      duration: 7.2,
      ease: 'sine.inOut',
      transformOrigin: '0% 100%',
    });

    // 2. Palm Left Secondary - 9.1s Sway (Asynchronous)
    const tlLeft2 = gsap.timeline({ repeat: -1, yoyo: true });
    tlLeft2.to(palmLeftSecondaryRef.current, {
      rotation: -2.8,
      duration: 9.1,
      ease: 'sine.inOut',
      transformOrigin: '0% 100%',
    });

    // 3. Palm Right Main - 6.8s Sway
    const tlRight1 = gsap.timeline({ repeat: -1, yoyo: true });
    tlRight1.to(palmRightMainRef.current, {
      rotation: -3.4,
      duration: 6.8,
      ease: 'sine.inOut',
      transformOrigin: '100% 100%',
    });

    // 4. Palm Right Secondary - 8.4s Sway
    const tlRight2 = gsap.timeline({ repeat: -1, yoyo: true });
    tlRight2.to(palmRightSecondaryRef.current, {
      rotation: 2.5,
      duration: 8.4,
      ease: 'sine.inOut',
      transformOrigin: '100% 100%',
    });

    // 5. Frond Flutter
    const frondTl = gsap.timeline({ repeat: -1, yoyo: true });
    frondTl.to('.palm-leaf-blade', {
      scaleY: 1.06,
      rotation: 2.2,
      stagger: 0.12,
      duration: 3.4,
      ease: 'sine.inOut',
      transformOrigin: 'center center',
    });

    // 6. Beach Grass Sway
    const grassTl = gsap.timeline({ repeat: -1, yoyo: true });
    grassTl.to('.beach-grass-blade', {
      skewX: 9,
      duration: 2.4,
      stagger: 0.08,
      ease: 'sine.inOut',
      transformOrigin: 'bottom center',
    });

    return () => {
      tlLeft1.kill();
      tlLeft2.kill();
      tlRight1.kill();
      tlRight2.kill();
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
          {/* Day Palm Trunk Texture Gradient */}
          <linearGradient id="palmTrunkGradDay" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4A1630" />
            <stop offset="40%" stopColor="#320A20" />
            <stop offset="100%" stopColor="#15020D" />
          </linearGradient>

          {/* Night Palm Trunk Texture Gradient */}
          <linearGradient id="palmTrunkGradNight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1B0A33" />
            <stop offset="40%" stopColor="#110522" />
            <stop offset="100%" stopColor="#080212" />
          </linearGradient>

          {/* Day Lush Palm Leaf Gradient */}
          <linearGradient id="palmLeafGradDay" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7A1D44" />
            <stop offset="50%" stopColor="#4C0D2C" />
            <stop offset="100%" stopColor="#220314" />
          </linearGradient>

          {/* Night Lush Palm Leaf Gradient */}
          <linearGradient id="palmLeafGradNight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2E124D" />
            <stop offset="50%" stopColor="#1C0933" />
            <stop offset="100%" stopColor="#0B0314" />
          </linearGradient>
        </defs>

        {/* ======================================================== */}
        {/* 1. LEFT FRAMING PALMS (Lush Multi-Trunk Cluster)         */}
        {/* ======================================================== */}
        <g id="palmsLeftCluster">
          {/* Main Tall Left Palm */}
          <g ref={palmLeftMainRef} transform="translate(0, 0)">
            {/* Trunk with Bark Segments */}
            <path
              d="M -50 1080 Q 90 600 135 180 Q 165 180 115 600 Q 15 1080 -50 1080 Z"
              fill={isNight ? 'url(#palmTrunkGradNight)' : 'url(#palmTrunkGradDay)'}
            />
            {/* Bark Ring Detailing */}
            <g stroke={isNight ? '#4C1D7A' : '#FF2A55'} strokeWidth="1.2" opacity="0.3" fill="none">
              <path d="M 12 900 Q 30 890 48 905" />
              <path d="M 38 750 Q 55 740 72 755" />
              <path d="M 65 600 Q 82 590 98 605" />
              <path d="M 92 450 Q 108 440 122 455" />
              <path d="M 118 300 Q 132 290 144 305" />
            </g>

            {/* Lush Crown of Fronds (X=145, Y=180) */}
            <g
              id="crownLeftMain"
              transform="translate(145, 180)"
              fill={isNight ? 'url(#palmLeafGradNight)' : 'url(#palmLeafGradDay)'}
              stroke={isNight ? '#08010F' : '#14010A'}
              strokeWidth="1.8"
            >
              {/* Frond 1 (Top Left Droop) */}
              <path className="palm-leaf-blade" d="M 0 0 Q -150 -100 -270 -30 Q -170 20 0 0 Z" />
              {/* Frond 2 (Upper Left Arc) */}
              <path className="palm-leaf-blade" d="M 0 0 Q -110 -170 -210 -150 Q -120 -50 0 0 Z" />
              {/* Frond 3 (Top Upward Arch) */}
              <path className="palm-leaf-blade" d="M 0 0 Q -30 -220 50 -210 Q 30 -100 0 0 Z" />
              {/* Frond 4 (Top Right Arc) */}
              <path className="palm-leaf-blade" d="M 0 0 Q 145 -195 260 -125 Q 150 -50 0 0 Z" />
              {/* Frond 5 (Right Droop) */}
              <path className="palm-leaf-blade" d="M 0 0 Q 195 -75 290 50 Q 170 40 0 0 Z" />
              {/* Frond 6 (Down Right Droop) */}
              <path className="palm-leaf-blade" d="M 0 0 Q 120 90 155 195 Q 80 110 0 0 Z" />
              {/* Frond 7 (Under Droop) */}
              <path className="palm-leaf-blade" d="M 0 0 Q -60 110 -110 180 Q -60 80 0 0 Z" />

              {/* Coconut Fruit Cluster */}
              <circle cx="-8" cy="8" r="12" fill={isNight ? '#0C0317' : '#1E0210'} />
              <circle cx="10" cy="11" r="11" fill={isNight ? '#080210' : '#16010D'} />
              <circle cx="2" cy="22" r="10" fill={isNight ? '#06010C' : '#120109'} />
            </g>
          </g>

          {/* Secondary Leaning Left Palm */}
          <g ref={palmLeftSecondaryRef} transform="translate(0, 0)">
            {/* Trunk */}
            <path
              d="M 50 1080 Q 220 680 285 320 Q 305 320 240 680 Q 90 1080 50 1080 Z"
              fill={isNight ? 'url(#palmTrunkGradNight)' : 'url(#palmTrunkGradDay)'}
            />
            {/* Crown of Fronds (X=290, Y=320) */}
            <g
              id="crownLeftSecondary"
              transform="translate(290, 320)"
              fill={isNight ? 'url(#palmLeafGradNight)' : 'url(#palmLeafGradDay)'}
              stroke={isNight ? '#08010F' : '#14010A'}
              strokeWidth="1.4"
            >
              <path className="palm-leaf-blade" d="M 0 0 Q -135 -90 -235 -20 Q -145 25 0 0 Z" />
              <path className="palm-leaf-blade" d="M 0 0 Q -80 -150 -165 -130 Q -90 -45 0 0 Z" />
              <path className="palm-leaf-blade" d="M 0 0 Q 125 -165 225 -105 Q 125 -40 0 0 Z" />
              <path className="palm-leaf-blade" d="M 0 0 Q 175 -50 250 65 Q 135 45 0 0 Z" />
              <path className="palm-leaf-blade" d="M 0 0 Q 90 85 120 165 Q 60 90 0 0 Z" />
              <circle cx="-5" cy="8" r="10" fill={isNight ? '#080210' : '#16010D'} />
              <circle cx="9" cy="10" r="9" fill={isNight ? '#0C0317' : '#1E0210'} />
            </g>
          </g>
        </g>

        {/* ======================================================== */}
        {/* 2. RIGHT FRAMING PALMS (Dual Curved Palm Silhouette)     */}
        {/* ======================================================== */}
        <g id="palmsRightCluster">
          {/* Main Tall Right Palm */}
          <g ref={palmRightMainRef} transform="translate(0, 0)">
            {/* Trunk */}
            <path
              d="M 1960 1080 Q 1830 620 1765 210 Q 1735 210 1798 620 Q 1905 1080 1960 1080 Z"
              fill={isNight ? 'url(#palmTrunkGradNight)' : 'url(#palmTrunkGradDay)'}
            />
            {/* Crown of Fronds (X=1755, Y=210) */}
            <g
              id="crownRightMain"
              transform="translate(1755, 210)"
              fill={isNight ? 'url(#palmLeafGradNight)' : 'url(#palmLeafGradDay)'}
              stroke={isNight ? '#08010F' : '#14010A'}
              strokeWidth="1.8"
            >
              <path className="palm-leaf-blade" d="M 0 0 Q -180 -160 -290 -80 Q -170 -30 0 0 Z" />
              <path className="palm-leaf-blade" d="M 0 0 Q -220 -50 -320 60 Q -180 50 0 0 Z" />
              <path className="palm-leaf-blade" d="M 0 0 Q -135 90 -175 200 Q -100 100 0 0 Z" />
              <path className="palm-leaf-blade" d="M 0 0 Q 40 -195 -40 -185 Q -30 -90 0 0 Z" />
              <path className="palm-leaf-blade" d="M 0 0 Q 150 -140 245 -50 Q 135 -15 0 0 Z" />
              <path className="palm-leaf-blade" d="M 0 0 Q 180 30 220 140 Q 120 70 0 0 Z" />
              <circle cx="-6" cy="7" r="12" fill={isNight ? '#080210' : '#16010D'} />
              <circle cx="8" cy="10" r="11" fill={isNight ? '#0C0317' : '#1E0210'} />
            </g>
          </g>

          {/* Secondary Leaning Right Palm */}
          <g ref={palmRightSecondaryRef} transform="translate(0, 0)">
            <path
              d="M 1880 1080 Q 1720 700 1640 370 Q 1620 370 1690 700 Q 1830 1080 1880 1080 Z"
              fill={isNight ? 'url(#palmTrunkGradNight)' : 'url(#palmTrunkGradDay)'}
            />
            <g
              id="crownRightSecondary"
              transform="translate(1630, 370)"
              fill={isNight ? 'url(#palmLeafGradNight)' : 'url(#palmLeafGradDay)'}
              stroke={isNight ? '#08010F' : '#14010A'}
              strokeWidth="1.4"
            >
              <path className="palm-leaf-blade" d="M 0 0 Q -150 -130 -240 -60 Q -140 -20 0 0 Z" />
              <path className="palm-leaf-blade" d="M 0 0 Q -175 -30 -255 60 Q -140 40 0 0 Z" />
              <path className="palm-leaf-blade" d="M 0 0 Q 110 -120 185 -40 Q 100 -10 0 0 Z" />
              <path className="palm-leaf-blade" d="M 0 0 Q 135 20 170 110 Q 90 50 0 0 Z" />
              <circle cx="-4" cy="6" r="9" fill={isNight ? '#080210' : '#16010D'} />
              <circle cx="6" cy="8" r="8" fill={isNight ? '#0C0317' : '#1E0210'} />
            </g>
          </g>
        </g>

        {/* ======================================================== */}
        {/* 3. COASTAL BEACH GRASS (Bottom Edge Silhouettes)          */}
        {/* ======================================================== */}
        <g ref={grassRef} id="coastalBeachGrass" fill={isNight ? '#120526' : '#300B20'}>
          {/* Left Grass Clusters */}
          <path className="beach-grass-blade" d="M 100 1080 Q 90 1010 70 965 Q 95 1015 105 1080 Z" />
          <path className="beach-grass-blade" d="M 125 1080 Q 130 995 155 940 Q 138 1010 130 1080 Z" />
          <path className="beach-grass-blade" d="M 150 1080 Q 175 1020 205 975 Q 170 1025 158 1080 Z" />
          <path className="beach-grass-blade" d="M 270 1080 Q 260 1005 235 955 Q 265 1015 275 1080 Z" />
          <path className="beach-grass-blade" d="M 310 1080 Q 330 1010 365 960 Q 335 1020 320 1080 Z" />

          {/* Right Grass Clusters */}
          <path className="beach-grass-blade" d="M 1540 1080 Q 1550 1000 1585 950 Q 1555 1015 1545 1080 Z" />
          <path className="beach-grass-blade" d="M 1590 1080 Q 1580 1015 1555 970 Q 1585 1025 1595 1080 Z" />
          <path className="beach-grass-blade" d="M 1690 1080 Q 1715 1010 1745 960 Q 1710 1020 1698 1080 Z" />
          <path className="beach-grass-blade" d="M 1740 1080 Q 1730 1015 1710 970 Q 1735 1025 1745 1080 Z" />
        </g>
      </svg>
    </div>
  );
};
