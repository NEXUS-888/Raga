export type VoiceSceneState = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'RESPONDING';

export interface SceneAnimationConfig {
  waveSpeedMultiplier: number;
  oceanEnergy: number;
  sunGlowIntensity: number;
  windSpeed: number;
  boatBobAmplitude: number;
  characterAttentive: boolean;
  neonFlickerRate: number;
  ambientLight: string;
}

export const SCENE_STATE_CONFIGS: Record<VoiceSceneState, SceneAnimationConfig> = {
  IDLE: {
    waveSpeedMultiplier: 1.0,
    oceanEnergy: 1.0,
    sunGlowIntensity: 1.0,
    windSpeed: 1.0,
    boatBobAmplitude: 1.0,
    characterAttentive: false,
    neonFlickerRate: 1.0,
    ambientLight: 'rgba(255, 180, 50, 0.05)',
  },
  LISTENING: {
    waveSpeedMultiplier: 1.35,
    oceanEnergy: 1.4,
    sunGlowIntensity: 1.3,
    windSpeed: 1.25,
    boatBobAmplitude: 1.2,
    characterAttentive: true,
    neonFlickerRate: 1.5,
    ambientLight: 'rgba(255, 42, 85, 0.12)',
  },
  PROCESSING: {
    waveSpeedMultiplier: 0.8,
    oceanEnergy: 0.9,
    sunGlowIntensity: 1.6,
    windSpeed: 0.85,
    boatBobAmplitude: 0.9,
    characterAttentive: true,
    neonFlickerRate: 2.0,
    ambientLight: 'rgba(255, 229, 0, 0.14)',
  },
  RESPONDING: {
    waveSpeedMultiplier: 1.15,
    oceanEnergy: 1.2,
    sunGlowIntensity: 1.25,
    windSpeed: 1.1,
    boatBobAmplitude: 1.1,
    characterAttentive: false,
    neonFlickerRate: 1.1,
    ambientLight: 'rgba(0, 245, 212, 0.10)',
  },
};
