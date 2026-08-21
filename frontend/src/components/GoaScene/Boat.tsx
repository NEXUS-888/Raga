import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import type { VoiceSceneState } from './SceneAnimationManager';

interface BoatProps {
  sceneState: VoiceSceneState;
}

export const Boat: React.FC<BoatProps> = ({ sceneState }) => {
  const boatGroupRef = useRef<SVGGElement | null>(null);
  const sailRef = useRef<SVGGElement | null>(null);
  const ripple1Ref = useRef<SVGEllipseElement | null>(null);
  const ripple2Ref = useRef<SVGEllipseElement | null>(null);

  useEffect(() => {
    // 1. Boat Heave (Natural vertical bobbing on water)
    const heaveTl = gsap.timeline({ repeat: -1, yoyo: true });
    heaveTl.to(boatGroupRef.current, {
      y: 4.5,
      duration: 3.4,
      ease: 'sine.inOut',
    });

    // 2. Boat Pitch / Roll (Slightly offset from heave)
    const pitchTl = gsap.timeline({ repeat: -1, yoyo: true });
    pitchTl.to(boatGroupRef.current, {
      rotation: 1.6,
      duration: 4.2,
      ease: 'sine.inOut',
      transformOrigin: '50% 85%',
    });

    // 3. Micro Horizontal Drift
    const driftTl = gsap.timeline({ repeat: -1, yoyo: true });
    driftTl.to(boatGroupRef.current, {
      x: 6.0,
      duration: 13.0,
      ease: 'sine.inOut',
    });

    // 4. Cloth Sail Wind Billow
    const sailTl = gsap.timeline({ repeat: -1, yoyo: true });
    sailTl.to(sailRef.current, {
      scaleX: 1.05,
      rotation: 0.9,
      duration: 2.9,
      ease: 'sine.inOut',
      transformOrigin: '0% 50%',
    });

    // 5. Water Displacement Ripples
    const rippleTl = gsap.timeline({ repeat: -1 });
    rippleTl
      .fromTo(
        ripple1Ref.current,
        { scaleX: 0.8, scaleY: 0.8, opacity: 0.7 },
        { scaleX: 1.45, scaleY: 1.35, opacity: 0, duration: 3.6, ease: 'power1.out' }
      )
      .fromTo(
        ripple2Ref.current,
        { scaleX: 0.8, scaleY: 0.8, opacity: 0.6 },
        { scaleX: 1.55, scaleY: 1.45, opacity: 0, duration: 3.6, ease: 'power1.out' },
        '-=1.8'
      );

    return () => {
      heaveTl.kill();
      pitchTl.kill();
      driftTl.kill();
      sailTl.kill();
      rippleTl.kill();
    };
  }, []);

  // Reactive Voice AI State
  useEffect(() => {
    if (!boatGroupRef.current) return;
    if (sceneState === 'LISTENING') {
      gsap.to(boatGroupRef.current, {
        scale: 1.03,
        duration: 0.6,
      });
    } else {
      gsap.to(boatGroupRef.current, {
        scale: 1.0,
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
          <linearGradient id="woodenHullGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#5A1E32" />
            <stop offset="50%" stopColor="#3B0B1E" />
            <stop offset="100%" stopColor="#1C020B" />
          </linearGradient>

          <linearGradient id="mainSailGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE066" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#F48C06" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#D90429" stopOpacity="0.85" />
          </linearGradient>

          <linearGradient id="jibSailGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF275" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FF7B00" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Master Illustrated Sailboat - Centered in mid-water at X: 760, Y: 605 */}
        <g id="masterIllustratedBoat" transform="translate(760, 605)">
          {/* Water Displacement Ripples */}
          <ellipse
            ref={ripple1Ref}
            cx="40"
            cy="36"
            rx="48"
            ry="6.5"
            fill="none"
            stroke="#FFF4CC"
            strokeWidth="1.5"
            opacity="0.65"
          />
          <ellipse
            ref={ripple2Ref}
            cx="40"
            cy="36"
            rx="56"
            ry="7.5"
            fill="none"
            stroke="#FFE066"
            strokeWidth="1.5"
            opacity="0.5"
          />

          {/* Animated Sailboat */}
          <g ref={boatGroupRef}>
            {/* Wooden Hull Silhouette with Plank Detailing */}
            <path
              d="M -18 26 Q 35 46 98 26 Q 92 38 60 42 Q 18 44 -12 38 Z"
              fill="url(#woodenHullGrad)"
              stroke="#000"
              strokeWidth="2"
            />
            {/* Golden Trim & Wood Planking Lines */}
            <path
              d="M -12 28 Q 35 40 92 28"
              stroke="#FFE500"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M -6 34 Q 35 44 76 34"
              stroke="#FF8500"
              strokeWidth="1"
              fill="none"
              opacity="0.7"
            />

            {/* Central Wooden Mast */}
            <line x1="38" y1="30" x2="38" y2="-48" stroke="#1F040E" strokeWidth="3" strokeLinecap="round" />

            {/* Rigging Stay Cords */}
            <line x1="38" y1="-45" x2="-12" y2="28" stroke="#4A1526" strokeWidth="1" opacity="0.8" />
            <line x1="38" y1="-45" x2="90" y2="28" stroke="#4A1526" strokeWidth="1" opacity="0.8" />

            {/* Billowing Sails Group */}
            <g ref={sailRef}>
              {/* Main Sail */}
              <path
                d="M 39 -43 Q 78 -14 82 22 Q 58 16 39 25 Z"
                fill="url(#mainSailGrad)"
                stroke="#FFBA08"
                strokeWidth="1"
              />
              {/* Main Sail Stitching Ribs */}
              <path d="M 39 -20 Q 60 -5 68 18" stroke="#FFE500" strokeWidth="0.8" fill="none" opacity="0.6" />

              {/* Jib / Front Small Sail */}
              <path
                d="M 36 -39 Q 8 -10 -8 24 Q 16 16 36 23 Z"
                fill="url(#jibSailGrad)"
                stroke="#FFD000"
                strokeWidth="1"
              />
            </g>

            {/* Top Pennant Flag */}
            <polygon points="38,-48 50,-44 38,-41" fill="#FF2A55" />

            {/* Water Shadow Reflection */}
            <ellipse
              cx="40"
              cy="44"
              rx="42"
              ry="5"
              fill="#1C020B"
              opacity="0.4"
            />
          </g>
        </g>
      </svg>
    </div>
  );
};
