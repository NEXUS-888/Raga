import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import type { VoiceSceneState } from './SceneAnimationManager';

interface SkyAndSunsetProps {
  sceneState: VoiceSceneState;
}

export const SkyAndSunset: React.FC<SkyAndSunsetProps> = ({ sceneState }) => {
  const sunHaloRef = useRef<SVGCircleElement | null>(null);
  const sunCoreRef = useRef<SVGCircleElement | null>(null);
  const cloud1Ref = useRef<SVGGElement | null>(null);
  const cloud2Ref = useRef<SVGGElement | null>(null);
  const cloud3Ref = useRef<SVGGElement | null>(null);
  const sunRaysRef = useRef<SVGGElement | null>(null);

  useEffect(() => {
    // 1. Gentle Sun Breathing Corona
    const sunTl = gsap.timeline({ repeat: -1, yoyo: true });
    sunTl.to(sunHaloRef.current, {
      scale: 1.08,
      opacity: 0.85,
      duration: 5.5,
      ease: 'sine.inOut',
      transformOrigin: 'center center',
    });

    const coreTl = gsap.timeline({ repeat: -1, yoyo: true });
    coreTl.to(sunCoreRef.current, {
      scale: 1.02,
      duration: 3.8,
      ease: 'sine.inOut',
      transformOrigin: 'center center',
    });

    // 2. Continuous Slow Cloud Drift
    gsap.to(cloud1Ref.current, {
      x: 180,
      duration: 65,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    gsap.to(cloud2Ref.current, {
      x: -140,
      duration: 80,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    gsap.to(cloud3Ref.current, {
      x: 120,
      duration: 95,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    // 3. Subtle Sun Rays Haze Shimmer
    gsap.to(sunRaysRef.current, {
      opacity: 0.45,
      duration: 6.0,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    return () => {
      sunTl.kill();
      coreTl.kill();
      gsap.killTweensOf([cloud1Ref.current, cloud2Ref.current, cloud3Ref.current, sunRaysRef.current]);
    };
  }, []);

  // Reactive state response
  useEffect(() => {
    if (!sunHaloRef.current) return;
    if (sceneState === 'PROCESSING') {
      gsap.to(sunHaloRef.current, {
        scale: 1.25,
        opacity: 0.95,
        fill: '#FFE500',
        duration: 0.8,
        ease: 'power2.out',
      });
    } else if (sceneState === 'LISTENING') {
      gsap.to(sunHaloRef.current, {
        scale: 1.15,
        opacity: 0.8,
        fill: '#FFB703',
        duration: 0.6,
      });
    } else {
      gsap.to(sunHaloRef.current, {
        scale: 1.0,
        opacity: 0.65,
        fill: '#FB8500',
        duration: 1.2,
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
          {/* Sunset Gradient */}
          <linearGradient id="goaSkyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1B0A2A" />
            <stop offset="25%" stopColor="#4A154B" />
            <stop offset="50%" stopColor="#8C2D40" />
            <stop offset="70%" stopColor="#E0533C" />
            <stop offset="85%" stopColor="#F79D38" />
            <stop offset="100%" stopColor="#FFE066" />
          </linearGradient>

          {/* Sun Halo Glow Gradient */}
          <radialGradient id="sunGlowGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFDF0" stopOpacity="1" />
            <stop offset="30%" stopColor="#FFE500" stopOpacity="0.75" />
            <stop offset="60%" stopColor="#FF7A00" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#FF0055" stopOpacity="0" />
          </radialGradient>

          {/* Cloud Gradients */}
          <linearGradient id="cloudGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FF85A1" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#591A4F" stopOpacity="0.85" />
          </linearGradient>

          <linearGradient id="cloudGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFB385" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#782943" stopOpacity="0.75" />
          </linearGradient>

          {/* Distant atmospheric haze */}
          <linearGradient id="duskHaze" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFDE59" stopOpacity="0" />
            <stop offset="100%" stopColor="#FF7B54" stopOpacity="0.35" />
          </linearGradient>
        </defs>

        {/* 1. Sky Canvas */}
        <rect width="1920" height="1080" fill="url(#goaSkyGrad)" />

        {/* 2. Distant Clouds (Upper Atmosphere) */}
        <g ref={cloud3Ref} opacity="0.6">
          <path
            d="M 150 180 Q 220 140 310 160 Q 390 120 480 150 Q 560 140 620 180 Q 660 210 600 230 Q 300 240 150 180 Z"
            fill="url(#cloudGrad2)"
          />
          <path
            d="M 1250 120 Q 1340 90 1440 110 Q 1520 80 1620 115 Q 1700 130 1760 170 Q 1650 200 1250 120 Z"
            fill="url(#cloudGrad2)"
          />
        </g>

        <g ref={cloud2Ref} opacity="0.75">
          <path
            d="M 850 210 Q 940 170 1050 190 Q 1140 160 1240 195 Q 1310 220 1260 250 Q 1000 260 850 210 Z"
            fill="url(#cloudGrad1)"
          />
        </g>

        {/* 3. Sunset Sun & Halo */}
        {/* Sun Position: X: 960 (center-right horizon), Y: 560 */}
        <g id="sunGroup">
          {/* Outer Sun Corona */}
          <circle
            ref={sunHaloRef}
            cx="960"
            cy="560"
            r="160"
            fill="url(#sunGlowGrad)"
            opacity="0.7"
          />

          {/* Atmospheric Light Rays Haze */}
          <g ref={sunRaysRef} opacity="0.3">
            <polygon points="960,560 620,1080 1300,1080" fill="url(#duskHaze)" />
          </g>

          {/* Inner Sun Disk */}
          <circle
            ref={sunCoreRef}
            cx="960"
            cy="560"
            r="65"
            fill="#FFFBEA"
            stroke="#FFE600"
            strokeWidth="3"
            filter="drop-shadow(0px 0px 18px rgba(255,230,0,0.85))"
          />
        </g>

        {/* 4. Lower Foreground Clouds */}
        <g ref={cloud1Ref} opacity="0.85">
          <path
            d="M -40 380 Q 90 330 220 350 Q 340 310 460 350 Q 550 380 500 420 Q 200 430 -40 380 Z"
            fill="url(#cloudGrad1)"
          />
          <path
            d="M 1480 340 Q 1600 290 1720 320 Q 1830 290 1960 330 Q 1980 380 1860 400 Q 1600 410 1480 340 Z"
            fill="url(#cloudGrad1)"
          />
        </g>
      </svg>
    </div>
  );
};
