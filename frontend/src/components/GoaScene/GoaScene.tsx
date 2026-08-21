import React from 'react';
import type { VoiceSceneState } from './SceneAnimationManager';
import { ParallaxLayer } from './ParallaxContainer';
import { SkyAndSunset } from './SkyAndSunset';
import { Birds } from './Birds';
import { DistantHorizon } from './DistantHorizon';
import { Ocean } from './Ocean';
import { Boat } from './Boat';
import { Characters } from './Characters';
import { ForegroundUmbrella } from './ForegroundUmbrella';
import { PalmTreesAndWind } from './PalmTreesAndWind';
import { IceCreamCart } from './IceCreamCart';

interface GoaSceneProps {
  sceneState: VoiceSceneState;
}

export const GoaScene: React.FC<GoaSceneProps> = ({ sceneState }) => {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden bg-[#10021A]">
      {/* Layer 0: Sky, Sun & Clouds (0.05x Parallax Depth) */}
      <ParallaxLayer depth={0.05}>
        <SkyAndSunset sceneState={sceneState} />
        <Birds />
      </ParallaxLayer>

      {/* Layer 1: Distant Horizon Hills & Headlands (0.15x Depth) */}
      <ParallaxLayer depth={0.15}>
        <DistantHorizon />
      </ParallaxLayer>

      {/* Layer 2: 4-Layer Animated Ocean & Specular Reflection (0.35x Depth) */}
      <ParallaxLayer depth={0.35}>
        <Ocean sceneState={sceneState} />
      </ParallaxLayer>

      {/* Layer 3: Traditional Goan Sailboat Bobbing on Waves (0.50x Depth) */}
      <ParallaxLayer depth={0.50}>
        <Boat sceneState={sceneState} />
      </ParallaxLayer>

      {/* Layer 4: Beachgoers / Characters with Micro-Movements (0.75x Depth) */}
      <ParallaxLayer depth={0.75}>
        <Characters sceneState={sceneState} />
      </ParallaxLayer>

      {/* Layer 5: Retro Beach Umbrella & Shade (0.88x Depth) */}
      <ParallaxLayer depth={0.88}>
        <ForegroundUmbrella />
      </ParallaxLayer>

      {/* Layer 6: Palm Trees Swaying in Sea Breeze & Ice Cream Cart (1.0x Depth) */}
      <ParallaxLayer depth={1.0}>
        <PalmTreesAndWind />
        <IceCreamCart sceneState={sceneState} />
      </ParallaxLayer>

      {/* Ambient Vignette & Warm Goa Golden Hour Atmosphere */}
      <div
        className="absolute inset-0 pointer-events-none transition-colors duration-1000"
        style={{
          background:
            'radial-gradient(ellipse at 50% 60%, rgba(255, 170, 0, 0.04) 0%, rgba(15, 2, 25, 0.25) 85%, rgba(10, 1, 18, 0.45) 100%)',
        }}
      />
    </div>
  );
};
