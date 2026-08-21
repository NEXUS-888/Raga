import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import type { VoiceSceneState } from './SceneAnimationManager';
import { ParallaxLayer } from './ParallaxContainer';

interface GoaSceneProps {
  sceneState: VoiceSceneState;
  isNight?: boolean;
}

export const GoaScene: React.FC<GoaSceneProps> = ({ isNight = false }) => {
  const sunCoronaRef = useRef<HTMLDivElement | null>(null);
  const neonSignRef = useRef<HTMLDivElement | null>(null);
  const birdsRef = useRef<SVGSVGElement | null>(null);
  const waterShimmerRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    // 1. Sun Corona Breathing Pulse in Day Mode
    const sunTl = gsap.timeline({ repeat: -1, yoyo: true });
    sunTl.to(sunCoronaRef.current, {
      scale: 1.12,
      opacity: 0.85,
      duration: 4.8,
      ease: 'sine.inOut',
    });

    // 2. Realistic Neon "OPEN" Sign Electrical Flicker
    const flickerTl = gsap.timeline({ repeat: -1 });
    flickerTl
      .to(neonSignRef.current, { opacity: 0.95, duration: 1.8 })
      .to(neonSignRef.current, { opacity: 0.4, duration: 0.08 })
      .to(neonSignRef.current, { opacity: 1.0, duration: 0.12 })
      .to(neonSignRef.current, { opacity: 0.7, duration: 0.06 })
      .to(neonSignRef.current, { opacity: 1.0, duration: 2.4 })
      .to(neonSignRef.current, { opacity: 0.85, duration: 3.0 });

    // 3. Gliding Seagulls Flight Animation
    const birdsTl = gsap.timeline({ repeat: -1 });
    birdsTl.fromTo(
      birdsRef.current,
      { x: -100, y: 15, opacity: 0 },
      {
        x: window.innerWidth + 120,
        y: -30,
        opacity: 0.85,
        duration: 28,
        ease: 'none',
      }
    );

    // 4. Undulating Ocean Specular Water Shimmer
    const shimmerTl = gsap.timeline({ repeat: -1, yoyo: true });
    shimmerTl.to('.specular-ripple', {
      scaleX: 1.15,
      opacity: 0.9,
      stagger: {
        each: 0.15,
        from: 'center',
      },
      duration: 2.2,
      ease: 'sine.inOut',
      transformOrigin: 'center center',
    });

    return () => {
      sunTl.kill();
      flickerTl.kill();
      birdsTl.kill();
      shimmerTl.kill();
    };
  }, []);

  return (
    <div
      className={`absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden bg-[#070210] ${
        isNight ? 'scene-night' : 'scene-day'
      }`}
    >
      {/* 2.5D Parallax Camera Layer */}
      <ParallaxLayer depth={0.15}>
        {/* ========================================================================= */}
        {/* 1. BASE HIGH-FIDELITY ILLUSTRATION LAYERS (Day Sunset & Night Moonlit)   */}
        {/* ========================================================================= */}
        {/* Day Sunset Illustrated Scene */}
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1400 ease-in-out"
          style={{
            backgroundImage: "url('/assets/goa_sunset_day_hd.png')",
            opacity: isNight ? 0 : 1,
          }}
        />

        {/* Night Moonlit Illustrated Scene (Crossfades in on mic pull) */}
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1400 ease-in-out"
          style={{
            backgroundImage: "url('/assets/goa_night_moonlit_hd.png')",
            opacity: isNight ? 1 : 0,
          }}
        />

        {/* ========================================================================= */}
        {/* 2. DYNAMIC SUN CORONA & AMBIENT HORIZON FLARE (Active in Day Mode)        */}
        {/* ========================================================================= */}
        <div
          ref={sunCoronaRef}
          className="absolute top-[52%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full pointer-events-none transition-opacity duration-1400"
          style={{
            background:
              'radial-gradient(circle, rgba(255, 240, 160, 0.45) 0%, rgba(255, 140, 0, 0.25) 40%, rgba(255, 42, 85, 0.08) 70%, transparent 100%)',
            opacity: isNight ? 0 : 0.75,
            filter: 'blur(16px)',
          }}
        />

        {/* ========================================================================= */}
        {/* 3. TWINKLING NIGHT STAR CONSTELLATIONS (Active in Night Mode)             */}
        {/* ========================================================================= */}
        <svg
          viewBox="0 0 1920 1080"
          preserveAspectRatio="xMidYMid slice"
          className="star-cluster absolute inset-0 w-full h-full pointer-events-none"
        >
          <g fill="#FFFDF8">
            {/* Group 1 */}
            <g className="star-twinkle-1">
              <circle cx="160" cy="80" r="1.8" />
              <circle cx="340" cy="130" r="2.2" />
              <circle cx="520" cy="70" r="1.5" />
              <circle cx="740" cy="110" r="2.0" />
              <circle cx="1120" cy="85" r="1.6" />
              <circle cx="1360" cy="120" r="2.4" />
              <circle cx="1640" cy="65" r="1.8" />
              <circle cx="1790" cy="100" r="2.0" />
            </g>

            {/* Group 2 */}
            <g className="star-twinkle-2">
              <circle cx="220" cy="160" r="1.4" />
              <circle cx="440" cy="180" r="2.0" />
              <circle cx="880" cy="80" r="2.5" />
              <circle cx="1040" cy="140" r="1.5" />
              <circle cx="1280" cy="60" r="1.9" />
              <circle cx="1530" cy="150" r="2.2" />
              <circle cx="1730" cy="170" r="1.6" />
            </g>

            {/* Group 3 */}
            <g className="star-twinkle-3">
              <circle cx="90" cy="210" r="1.6" />
              <circle cx="360" cy="230" r="1.3" />
              <circle cx="620" cy="150" r="2.1" />
              <circle cx="970" cy="100" r="1.7" />
              <circle cx="1300" cy="200" r="2.0" />
              <circle cx="1560" cy="220" r="1.5" />
              <circle cx="1870" cy="150" r="1.8" />
            </g>
          </g>
        </svg>

        {/* ========================================================================= */}
        {/* 4. LIVING OCEAN SPECULAR WATER SHIMMER RIBBONS                           */}
        {/* ========================================================================= */}
        <svg
          ref={waterShimmerRef}
          viewBox="0 0 1920 1080"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          {/* Day Golden Sun Specular Shimmer */}
          <g className="ocean-day">
            <ellipse className="specular-ripple" cx="960" cy="740" rx="60" ry="2.5" fill="#FFFBEA" opacity="0.9" />
            <ellipse className="specular-ripple" cx="960" cy="755" rx="85" ry="3.0" fill="#FFF4B8" opacity="0.85" />
            <ellipse className="specular-ripple" cx="958" cy="772" rx="115" ry="3.6" fill="#FFE57F" opacity="0.8" />
            <ellipse className="specular-ripple" cx="962" cy="792" rx="150" ry="4.2" fill="#FFD166" opacity="0.7" />
            <ellipse className="specular-ripple" cx="960" cy="815" rx="190" ry="5.0" fill="#FFAA33" opacity="0.6" />
          </g>

          {/* Night Moonlit Cyan Specular Shimmer */}
          <g className="ocean-night">
            <ellipse className="specular-ripple" cx="960" cy="740" rx="45" ry="2.2" fill="#E0F7FA" opacity="0.85" />
            <ellipse className="specular-ripple" cx="960" cy="755" rx="65" ry="2.6" fill="#B2EBF2" opacity="0.75" />
            <ellipse className="specular-ripple" cx="958" cy="772" rx="90" ry="3.2" fill="#80DEEA" opacity="0.65" />
            <ellipse className="specular-ripple" cx="962" cy="792" rx="120" ry="3.8" fill="#4DD0E1" opacity="0.55" />
            <ellipse className="specular-ripple" cx="960" cy="815" rx="155" ry="4.5" fill="#00BCD4" opacity="0.45" />
          </g>
        </svg>

        {/* ========================================================================= */}
        {/* 5. FLICKERING NEON "OPEN" SIGN GLOW ON CANDY ICE KIOSK                   */}
        {/* ========================================================================= */}
        <div
          ref={neonSignRef}
          className="absolute top-[56.6%] left-[78.4%] -translate-x-1/2 -translate-y-1/2 pointer-events-none rounded-lg"
          style={{
            width: '74px',
            height: '28px',
            background: 'rgba(0, 245, 212, 0.16)',
            boxShadow: '0 0 20px rgba(0, 245, 212, 0.85), inset 0 0 10px rgba(0, 245, 212, 0.6)',
            mixBlendMode: 'screen',
          }}
        />

        {/* ========================================================================= */}
        {/* 6. GLIDING SEAGULLS IN THE DUSK SKY                                      */}
        {/* ========================================================================= */}
        <svg
          ref={birdsRef}
          viewBox="0 0 160 50"
          className="absolute top-[14%] left-0 w-32 h-10 pointer-events-none"
        >
          <path
            d="M 10 25 Q 25 10 40 25 Q 55 10 70 25"
            fill="none"
            stroke={isNight ? '#4A5568' : '#2D1B36'}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M 85 18 Q 96 6 108 18 Q 120 6 132 18"
            fill="none"
            stroke={isNight ? '#4A5568' : '#2D1B36'}
            strokeWidth="2.0"
            strokeLinecap="round"
          />
        </svg>
      </ParallaxLayer>

      {/* ========================================================================= */}
      {/* 7. NIGHT SILHOUETTE DIMMER (Lowers contrast & focuses attention on mic)  */}
      {/* ========================================================================= */}
      <div className="scene-backdrop-dimmer absolute inset-0 pointer-events-none bg-[#05020E]/40" />

      {/* Ambient Goa Coastal Vignette */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
        style={{
          background:
            'radial-gradient(ellipse at 50% 60%, rgba(255, 170, 0, 0.03) 0%, rgba(15, 2, 25, 0.15) 85%, rgba(10, 1, 18, 0.35) 100%)',
          opacity: isNight ? 0.3 : 1.0,
        }}
      />
    </div>
  );
};
