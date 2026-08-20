import React from 'react';

interface GraffitiMicVectorProps {
  isListening: boolean;
  volumeLevel: number;
}

export const GraffitiMicVector: React.FC<GraffitiMicVectorProps> = ({
  isListening,
  volumeLevel
}) => {
  // Audio-reactive scale pulse
  const pulseScale = isListening ? Math.min(1.18, 1 + volumeLevel * 0.5) : 1;

  return (
    <div
      className="relative w-44 h-56 flex items-center justify-center filter drop-shadow-[10px_10px_0px_rgba(0,0,0,0.8)] select-none pointer-events-none transition-transform duration-150"
      style={{ transform: `scale(${pulseScale})` }}
    >
      {/* Soundwave Aura when Recording */}
      {isListening && (
        <div
          style={{ transform: `scale(${1 + volumeLevel * 1.5})` }}
          className="absolute inset-0 rounded-3xl bg-[#FFE500]/30 blur-lg transition-transform duration-75 pointer-events-none"
        />
      )}

      {/* Exact Pixel-Perfect Vintage Yellow & Purple Studio Microphone */}
      <img
        src="/assets/vintage_mic_capsule.png"
        alt="Vintage Studio Microphone"
        className="w-full h-full object-contain pointer-events-none drop-shadow-md"
        draggable={false}
      />
    </div>
  );
};


