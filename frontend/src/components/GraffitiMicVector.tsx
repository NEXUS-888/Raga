import React from 'react';

interface GraffitiMicVectorProps {
  isListening: boolean;
  volumeLevel: number;
}

export const GraffitiMicVector: React.FC<GraffitiMicVectorProps> = ({
  isListening,
  volumeLevel
}) => {
  // Audio-reactive scale pulse from top anchor
  const pulseScale = isListening ? Math.min(1.12, 1 + volumeLevel * 0.3) : 1;

  return (
    <div
      className="relative w-32 h-42 sm:w-34 sm:h-44 flex items-center justify-center filter drop-shadow-[8px_8px_0px_rgba(0,0,0,0.85)] select-none pointer-events-none transition-transform duration-150"
      style={{ transform: `scale(${pulseScale})`, transformOrigin: '49% 0px' }}
    >
      {/* Soundwave Aura when Recording */}
      {isListening && (
        <div
          style={{ transform: `scale(${1 + volumeLevel * 1.3})`, transformOrigin: 'center' }}
          className="absolute inset-0 rounded-3xl bg-[#FFE500]/30 blur-md transition-transform duration-75 pointer-events-none"
        />
      )}

      {/* Exact Pixel-Perfect Vintage Yellow & Purple Studio Microphone */}
      <img
        src="/assets/vintage_mic_capsule.png"
        alt="Vintage Studio Microphone"
        className="w-full h-full object-contain pointer-events-none"
        draggable={false}
      />
    </div>
  );
};


