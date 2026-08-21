import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export const Birds: React.FC = () => {
  const flock1Ref = useRef<SVGGElement | null>(null);
  const flock2Ref = useRef<SVGGElement | null>(null);

  useEffect(() => {
    // 1. Static/gentle gliding ambient birds hovering gently
    const ambientTl = gsap.timeline({ repeat: -1, yoyo: true });
    ambientTl.to('.static-bird', {
      y: '-=4',
      rotation: 2,
      duration: 3.5,
      stagger: 0.4,
      ease: 'sine.inOut',
      transformOrigin: 'center center',
    });

    // 2. Infrequent Flight Crossing across the sky (Flock 1)
    const launchFlock1 = () => {
      if (!flock1Ref.current) return;
      gsap.set(flock1Ref.current, { x: -200, y: 180 + Math.random() * 80, scale: 0.65, opacity: 0 });
      gsap.to(flock1Ref.current, {
        opacity: 0.85,
        duration: 2,
        ease: 'power1.in',
      });
      gsap.to(flock1Ref.current, {
        x: 2100,
        y: 120 + Math.random() * 60,
        duration: 26 + Math.random() * 8,
        ease: 'none',
        onComplete: () => {
          // Re-trigger after a randomized 25-45 second interval
          gsap.delayedCall(25 + Math.random() * 20, launchFlock1);
        },
      });
    };

    // 3. Infrequent Flight Crossing (Flock 2 - Right to Left)
    const launchFlock2 = () => {
      if (!flock2Ref.current) return;
      gsap.set(flock2Ref.current, { x: 2100, y: 260 + Math.random() * 60, scale: 0.45, opacity: 0 });
      gsap.to(flock2Ref.current, {
        opacity: 0.7,
        duration: 2,
        ease: 'power1.in',
      });
      gsap.to(flock2Ref.current, {
        x: -250,
        y: 200 + Math.random() * 40,
        duration: 34 + Math.random() * 10,
        ease: 'none',
        onComplete: () => {
          gsap.delayedCall(35 + Math.random() * 25, launchFlock2);
        },
      });
    };

    // Initial delayed launches
    const timeout1 = setTimeout(launchFlock1, 4000);
    const timeout2 = setTimeout(launchFlock2, 22000);

    return () => {
      ambientTl.kill();
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      gsap.killTweensOf([flock1Ref.current, flock2Ref.current, '.static-bird']);
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden">
      <svg
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full"
      >
        {/* Distant Static Ambient Birds */}
        <g id="distantStaticBirds" fill="#2B0938" opacity="0.6">
          <g className="static-bird" transform="translate(680, 240) scale(0.6)">
            <path d="M 0 0 Q 8 -10 16 -4 Q 24 -10 32 0 Q 24 -4 16 -1 Q 8 -4 0 0 Z" />
          </g>
          <g className="static-bird" transform="translate(730, 260) scale(0.45)">
            <path d="M 0 0 Q 8 -10 16 -4 Q 24 -10 32 0 Q 24 -4 16 -1 Q 8 -4 0 0 Z" />
          </g>
          <g className="static-bird" transform="translate(650, 280) scale(0.4)">
            <path d="M 0 0 Q 8 -10 16 -4 Q 24 -10 32 0 Q 24 -4 16 -1 Q 8 -4 0 0 Z" />
          </g>
          <g className="static-bird" transform="translate(1320, 190) scale(0.55)">
            <path d="M 0 0 Q 8 -10 16 -4 Q 24 -10 32 0 Q 24 -4 16 -1 Q 8 -4 0 0 Z" />
          </g>
          <g className="static-bird" transform="translate(1370, 210) scale(0.4)">
            <path d="M 0 0 Q 8 -10 16 -4 Q 24 -10 32 0 Q 24 -4 16 -1 Q 8 -4 0 0 Z" />
          </g>
        </g>

        {/* Dynamic Flock 1 (Flying Left to Right) */}
        <g ref={flock1Ref} fill="#1F0427">
          <g transform="translate(0, 0)">
            <path d="M 0 0 Q 12 -16 24 -6 Q 36 -16 48 0 Q 36 -6 24 -2 Q 12 -6 0 0 Z" />
          </g>
          <g transform="translate(-40, 25) scale(0.8)">
            <path d="M 0 0 Q 12 -16 24 -6 Q 36 -16 48 0 Q 36 -6 24 -2 Q 12 -6 0 0 Z" />
          </g>
          <g transform="translate(-70, -15) scale(0.75)">
            <path d="M 0 0 Q 12 -16 24 -6 Q 36 -16 48 0 Q 36 -6 24 -2 Q 12 -6 0 0 Z" />
          </g>
          <g transform="translate(-110, 10) scale(0.6)">
            <path d="M 0 0 Q 12 -16 24 -6 Q 36 -16 48 0 Q 36 -6 24 -2 Q 12 -6 0 0 Z" />
          </g>
        </g>

        {/* Dynamic Flock 2 (Flying Right to Left) */}
        <g ref={flock2Ref} fill="#290733" transform="scale(-1, 1)">
          <g transform="translate(0, 0)">
            <path d="M 0 0 Q 10 -14 20 -5 Q 30 -14 40 0 Q 30 -5 20 -2 Q 10 -5 0 0 Z" />
          </g>
          <g transform="translate(-35, 18) scale(0.8)">
            <path d="M 0 0 Q 10 -14 20 -5 Q 30 -14 40 0 Q 30 -5 20 -2 Q 10 -5 0 0 Z" />
          </g>
          <g transform="translate(-60, -10) scale(0.65)">
            <path d="M 0 0 Q 10 -14 20 -5 Q 30 -14 40 0 Q 30 -5 20 -2 Q 10 -5 0 0 Z" />
          </g>
        </g>
      </svg>
    </div>
  );
};
