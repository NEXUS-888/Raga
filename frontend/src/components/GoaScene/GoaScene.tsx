import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import type { VoiceSceneState } from './SceneAnimationManager';
import { ParallaxContainer, ParallaxLayer } from './ParallaxContainer';
import { SkyAndSunset } from './SkyAndSunset';
import { DistantHorizon } from './DistantHorizon';
import { Boat } from './Boat';
import { Ocean } from './Ocean';
import { BeachGround } from './BeachGround';
import { PalmTreesAndWind } from './PalmTreesAndWind';
import { Birds } from './Birds';

interface GoaSceneProps {
  sceneState: VoiceSceneState;
  isNight?: boolean;
}

export const GoaScene: React.FC<GoaSceneProps> = ({ sceneState, isNight = false }) => {
  const sunCoronaRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Sun Corona Breathing Pulse in Day Mode
    const sunTl = gsap.timeline({ repeat: -1, yoyo: true });
    sunTl.to(sunCoronaRef.current, {
      scale: 1.15,
      opacity: 0.85,
      duration: 4.8,
      ease: 'sine.inOut',
    });

    return () => {
      sunTl.kill();
    };
  }, []);

  return (
    <div
      className={`absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden bg-[#070210] ${
        isNight ? 'scene-night' : 'scene-day'
      }`}
    >
      <ParallaxContainer className="w-full h-full">
        {/* ========================================================================= */}
        {/* 1. SKY & SUNSET LAYER (Deepest parallax layer depth: 0.05)                */}
        {/* ========================================================================= */}
        <ParallaxLayer depth={0.05}>
          <SkyAndSunset sceneState={sceneState} isNight={isNight} />
        </ParallaxLayer>

        {/* Ambient Sun Corona Bloom */}
        <ParallaxLayer depth={0.08}>
          <div
            ref={sunCoronaRef}
            className="absolute top-[52%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full pointer-events-none transition-opacity duration-1400"
            style={{
              background:
                'radial-gradient(circle, rgba(255, 240, 160, 0.4) 0%, rgba(255, 140, 0, 0.22) 40%, rgba(255, 42, 85, 0.06) 70%, transparent 100%)',
              opacity: isNight ? 0 : 0.75,
              filter: 'blur(20px)',
            }}
          />
        </ParallaxLayer>

        {/* ========================================================================= */}
        {/* 2. GLIDING BIRDS & DISTANT HORIZON HILLS (depth: 0.12)                   */}
        {/* ========================================================================= */}
        <ParallaxLayer depth={0.12}>
          <DistantHorizon />
          <Birds />
        </ParallaxLayer>

        {/* ========================================================================= */}
        {/* 3. BOBBING SAILBOAT & LIVING OCEAN WAVES (depth: 0.22)                   */}
        {/* ========================================================================= */}
        <ParallaxLayer depth={0.22}>
          <Ocean sceneState={sceneState} isNight={isNight} />
          <Boat sceneState={sceneState} />
        </ParallaxLayer>

        {/* ========================================================================= */}
        {/* 4. GOLDEN SANDY BEACH GROUND (depth: 0.35)                               */}
        {/* ========================================================================= */}
        <ParallaxLayer depth={0.35}>
          <BeachGround isNight={isNight} />
        </ParallaxLayer>

        {/* ========================================================================= */}
        {/* 5. LUSH SWAYING COCONUT PALM TREES & COASTAL GRASS (depth: 0.48)          */}
        {/* ========================================================================= */}
        <ParallaxLayer depth={0.48}>
          <PalmTreesAndWind isNight={isNight} />
        </ParallaxLayer>
      </ParallaxContainer>

      {/* ========================================================================= */}
      {/* 6. NIGHT ATMOSPHERIC DIMMER & COASTAL VIGNETTE                           */}
      {/* ========================================================================= */}
      <div
        className="scene-backdrop-dimmer absolute inset-0 pointer-events-none transition-opacity duration-1000"
        style={{
          backgroundColor: isNight ? 'rgba(5, 2, 14, 0.45)' : 'transparent',
        }}
      />

      {/* Ambient Goa Sunset/Night Vignette */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
        style={{
          background:
            'radial-gradient(ellipse at 50% 60%, rgba(255, 170, 0, 0.02) 0%, rgba(15, 2, 25, 0.12) 85%, rgba(10, 1, 18, 0.3) 100%)',
          opacity: isNight ? 0.3 : 1.0,
        }}
      />
    </div>
  );
};
