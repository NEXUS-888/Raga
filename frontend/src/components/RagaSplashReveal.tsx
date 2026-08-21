import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface RagaSplashRevealProps {
  onComplete?: () => void;
  autoDismissTimeout?: number;
}

export const RagaSplashReveal: React.FC<RagaSplashRevealProps> = ({
  onComplete,
  autoDismissTimeout = 2200
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const micWrapperRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const lettersRef = useRef<HTMLDivElement>(null);
  const soundWavesLeftRef = useRef<SVGGElement>(null);
  const soundWavesRightRef = useRef<SVGGElement>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  const handleDismiss = () => {
    if (isDismissed) return;
    gsap.to(containerRef.current, {
      opacity: 0,
      scale: 1.06,
      duration: 0.4,
      ease: 'power2.inOut',
      onComplete: () => {
        setIsDismissed(true);
        if (onComplete) onComplete();
      }
    });
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Initial state
      gsap.set(pillRef.current, {
        width: 130,
        boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(255, 215, 0, 0.4)'
      });
      gsap.set(micWrapperRef.current, {
        x: 0,
        scale: 1.05
      });
      gsap.set(dividerRef.current, {
        scaleY: 0,
        opacity: 0,
        transformOrigin: 'center center'
      });
      gsap.set('.raga-letter', {
        opacity: 0,
        x: -30,
        scale: 0.6,
        transformOrigin: 'left center'
      });
      gsap.set([soundWavesLeftRef.current, soundWavesRightRef.current], {
        opacity: 0.7,
        scale: 0.9,
        transformOrigin: 'center center'
      });

      // Step 1: Subtle opening wave pop (0.0s - 0.25s)
      tl.to([soundWavesLeftRef.current, soundWavesRightRef.current], {
        opacity: 1,
        scale: 1.15,
        duration: 0.3,
        repeat: 1,
        yoyo: true,
        ease: 'power2.out'
      }, 0);

      // Step 2: The Slide & Unfurl (0.2s - 0.8s)
      // Pill expands horizontally from 130px to 440px
      tl.to(pillRef.current, {
        width: 440,
        duration: 0.65,
        ease: 'expo.out'
      }, 0.2);

      // Mic translates left to its resting anchor inside the expanded pill
      tl.to(micWrapperRef.current, {
        x: -145,
        duration: 0.65,
        ease: 'expo.out'
      }, 0.2);

      // Step 3: Reveal Orange Divider (0.45s - 0.75s)
      tl.to(dividerRef.current, {
        scaleY: 1,
        opacity: 1,
        duration: 0.35,
        ease: 'back.out(2)'
      }, 0.45);

      // Step 4: Staggered Letters Reveal: R -> A -> G -> A (0.5s - 1.0s)
      tl.to('.raga-letter', {
        opacity: 1,
        x: 0,
        scale: 1,
        duration: 0.4,
        stagger: 0.08,
        ease: 'back.out(2.2)'
      }, 0.5);

      // Step 5: Smooth Transition into App (Hold for 0.7s, then fade/zoom into main app UI)
      tl.to(containerRef.current, {
        opacity: 0,
        scale: 1.06,
        duration: 0.55,
        ease: 'power2.inOut',
        onComplete: () => {
          setIsDismissed(true);
          if (onComplete) onComplete();
        }
      }, "+=0.7");

    }, containerRef);

    return () => ctx.revert();
  }, [onComplete, autoDismissTimeout]);

  if (isDismissed) return null;

  return (
    <div
      ref={containerRef}
      onClick={handleDismiss}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#130324]/95 backdrop-blur-xl select-none cursor-pointer transition-all p-4"
      style={{ perspective: '1000px' }}
      title="Click to enter immediately"
    >
      {/* Ambient background glow */}
      <div className="absolute w-[320px] sm:w-[600px] h-[200px] sm:h-[300px] bg-gradient-to-r from-amber-500/20 via-pink-500/20 to-purple-500/20 blur-3xl rounded-full pointer-events-none animate-pulse" />

      {/* Proportional Scaled Responsive Stage */}
      <div className="transform scale-[0.72] sm:scale-100 origin-center transition-transform">
        {/* Pill Logo Container */}
        <div
          ref={pillRef}
          className="relative h-[120px] rounded-full border-[5px] sm:border-[6px] border-[#220738] bg-gradient-to-b from-[#FFE817] via-[#FFCA00] to-[#FFA000] overflow-hidden flex items-center justify-center shadow-2xl transition-all"
          style={{
            boxShadow: '0 25px 60px -10px rgba(0, 0, 0, 0.7), inset 0 3px 6px rgba(255, 255, 255, 0.8), inset 0 -6px 12px rgba(220, 90, 0, 0.5)'
          }}
        >
          {/* Top Gloss Reflection */}
          <div className="absolute top-1.5 left-6 right-6 h-5 bg-gradient-to-b from-white/60 to-transparent rounded-full pointer-events-none opacity-80" />

          {/* Bottom Orange Wave Accent */}
          <svg
            className="absolute bottom-0 left-0 w-full h-8 pointer-events-none opacity-90"
            viewBox="0 0 500 40"
            preserveAspectRatio="none"
          >
            <path
              d="M0,20 Q120,40 250,22 T500,18 L500,40 L0,40 Z"
              fill="#FF8500"
            />
          </svg>

          {/* Dynamic Center Stage Content */}
          <div className="relative w-full h-full flex items-center justify-center">
            
            {/* Centered Microphone with Soundwaves (Translates Left during animation) */}
            <div
              ref={micWrapperRef}
              className="absolute flex items-center justify-center"
              style={{ width: '120px', height: '100px' }}
            >
              <svg
                viewBox="0 0 130 110"
                className="w-full h-full drop-shadow-md overflow-visible"
              >
                {/* Left Sound Waves (Pink #FF1E75) */}
                <g ref={soundWavesLeftRef} id="sound-waves-left">
                  <path
                    d="M26,38 C20,46 20,64 26,72"
                    stroke="#FF1E75"
                    strokeWidth="6"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M14,30 C5,42 5,70 14,80"
                    stroke="#FF1E75"
                    strokeWidth="6.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                </g>

                {/* Central 2.5D Studio Microphone */}
                <g id="mic-body" transform="translate(42, 12)">
                  {/* Outer Shadow/Border */}
                  <rect
                    x="6"
                    y="4"
                    width="34"
                    height="54"
                    rx="17"
                    fill="#FFDF00"
                    stroke="#220738"
                    strokeWidth="5"
                  />
                  {/* Mic Grille Lines */}
                  <line x1="8" y1="20" x2="38" y2="20" stroke="#220738" strokeWidth="3.5" />
                  <line x1="8" y1="28" x2="38" y2="28" stroke="#220738" strokeWidth="3.5" />
                  <line x1="8" y1="36" x2="38" y2="36" stroke="#220738" strokeWidth="3.5" />
                  <line x1="8" y1="44" x2="38" y2="44" stroke="#220738" strokeWidth="3.5" />
                  <line x1="23" y1="6" x2="23" y2="56" stroke="#220738" strokeWidth="3.5" />
                  {/* Left Highlight Glint */}
                  <path
                    d="M11,12 A12,12 0 0,1 23,6 L23,10 A8,8 0 0,0 15,18 Z"
                    fill="#FFFFFF"
                    opacity="0.75"
                  />
                  {/* U-Shape Cradle Mount */}
                  <path
                    d="M2,32 C2,56 44,56 44,32"
                    stroke="#220738"
                    strokeWidth="5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  {/* Stand Stem & Circular Base */}
                  <line x1="23" y1="52" x2="23" y2="68" stroke="#220738" strokeWidth="5" />
                  <ellipse cx="23" cy="70" rx="16" ry="6" fill="#220738" />
                  <ellipse cx="23" cy="69" rx="13" ry="3.5" fill="#FFA500" />
                </g>

                {/* Right Sound Waves (Pink #FF1E75) */}
                <g ref={soundWavesRightRef} id="sound-waves-right">
                  <path
                    d="M104,38 C110,46 110,64 104,72"
                    stroke="#FF1E75"
                    strokeWidth="6"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M116,30 C125,42 125,70 116,80"
                    stroke="#FF1E75"
                    strokeWidth="6.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                </g>
              </svg>
            </div>

            {/* Right Section: Divider & Staggered RAGA Letters */}
            <div
              ref={lettersRef}
              className="absolute left-[165px] flex items-center gap-3.5 h-full pointer-events-none"
            >
              {/* Orange Vertical Divider */}
              <div
                ref={dividerRef}
                className="w-1.5 h-14 bg-[#FF8000] rounded-full shadow-sm"
                style={{
                  boxShadow: '0 0 10px rgba(255, 128, 0, 0.5)'
                }}
              />

              {/* Chunky Bold R A G A Text */}
              <div className="flex items-center gap-1 font-black text-[62px] leading-none tracking-tight text-[#220738]">
                <span
                  className="raga-letter inline-block drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]"
                  style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}
                >
                  R
                </span>
                <span
                  className="raga-letter inline-block drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]"
                  style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}
                >
                  A
                </span>
                <span
                  className="raga-letter inline-block drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]"
                  style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}
                >
                  G
                </span>
                <span
                  className="raga-letter inline-block drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]"
                  style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}
                >
                  A
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Subtitle / Telemetry prompt below */}
      <div className="absolute bottom-16 text-center text-amber-300/70 text-xs font-mono tracking-widest uppercase animate-pulse">
        ⚡ Initializing Sub-200ms Voice RAG Engine
      </div>
    </div>
  );
};
