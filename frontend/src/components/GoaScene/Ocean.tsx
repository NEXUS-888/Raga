import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import type { VoiceSceneState } from './SceneAnimationManager';

interface OceanProps {
  sceneState: VoiceSceneState;
}

export const Ocean: React.FC<OceanProps> = ({ sceneState }) => {
  const wave1Ref = useRef<SVGGElement | null>(null);
  const wave2Ref = useRef<SVGGElement | null>(null);
  const wave3Ref = useRef<SVGGElement | null>(null);
  const wave4Ref = useRef<SVGGElement | null>(null);
  const sunReflectionRef = useRef<SVGGElement | null>(null);
  const foamHighlightsRef = useRef<SVGGElement | null>(null);

  useEffect(() => {
    // 1. Distant Swell Waves (Ultra-smooth 26s crawl)
    const tl1 = gsap.timeline({ repeat: -1 });
    tl1.to(wave1Ref.current, {
      x: -480,
      duration: 26,
      ease: 'none',
    });

    const heave1 = gsap.timeline({ repeat: -1, yoyo: true });
    heave1.to(wave1Ref.current, {
      y: -3.5,
      duration: 4.2,
      ease: 'sine.inOut',
    });

    // 2. Mid Swell Waves (17s medium roll)
    const tl2 = gsap.timeline({ repeat: -1 });
    tl2.to(wave2Ref.current, {
      x: 520,
      duration: 17,
      ease: 'none',
    });

    const heave2 = gsap.timeline({ repeat: -1, yoyo: true });
    heave2.to(wave2Ref.current, {
      y: 4.0,
      duration: 3.6,
      ease: 'sine.inOut',
    });

    // 3. Near-Shore Swell (11s wave roll)
    const tl3 = gsap.timeline({ repeat: -1 });
    tl3.to(wave3Ref.current, {
      x: -560,
      duration: 11,
      ease: 'none',
    });

    const heave3 = gsap.timeline({ repeat: -1, yoyo: true });
    heave3.to(wave3Ref.current, {
      y: -5.0,
      duration: 2.8,
      ease: 'sine.inOut',
    });

    // 4. Shore Surf Wash (8s surf wave)
    const tl4 = gsap.timeline({ repeat: -1 });
    tl4.to(wave4Ref.current, {
      x: 480,
      duration: 8.0,
      ease: 'none',
    });

    // 5. Sun Specular Reflection Shimmer
    const reflectTl = gsap.timeline({ repeat: -1, yoyo: true });
    reflectTl.to('.sun-specular-band', {
      scaleX: 1.14,
      opacity: 0.95,
      stagger: {
        each: 0.12,
        from: 'center',
      },
      duration: 2.2,
      ease: 'sine.inOut',
      transformOrigin: 'center center',
    });

    // 6. Foam Sparkle
    const foamTl = gsap.timeline({ repeat: -1, yoyo: true });
    foamTl.to(foamHighlightsRef.current, {
      opacity: 0.85,
      duration: 1.8,
      ease: 'sine.inOut',
    });

    return () => {
      tl1.kill();
      tl2.kill();
      tl3.kill();
      tl4.kill();
      heave1.kill();
      heave2.kill();
      heave3.kill();
      reflectTl.kill();
      foamTl.kill();
    };
  }, []);

  // Reactive State Response
  useEffect(() => {
    if (!sunReflectionRef.current) return;
    if (sceneState === 'LISTENING') {
      gsap.to(sunReflectionRef.current, {
        opacity: 1.0,
        scaleY: 1.1,
        duration: 0.5,
        transformOrigin: 'top center',
      });
    } else if (sceneState === 'PROCESSING') {
      gsap.to(sunReflectionRef.current, {
        opacity: 1.0,
        filter: 'drop-shadow(0 0 14px rgba(255, 230, 0, 0.95))',
        duration: 0.8,
      });
    } else {
      gsap.to(sunReflectionRef.current, {
        opacity: 0.82,
        filter: 'none',
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
          {/* Deep Ocean Sunset Water Gradient */}
          <linearGradient id="oceanDeepGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#C94A29" />
            <stop offset="25%" stopColor="#D95C26" />
            <stop offset="55%" stopColor="#E87121" />
            <stop offset="80%" stopColor="#F48C06" />
            <stop offset="100%" stopColor="#FAA307" />
          </linearGradient>

          {/* Wave Layer 1 Gradient (Distant) */}
          <linearGradient id="wave1Grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7A1538" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#A83226" stopOpacity="0.95" />
          </linearGradient>

          {/* Wave Layer 2 Gradient (Mid) */}
          <linearGradient id="wave2Grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#B33728" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#D85824" stopOpacity="0.9" />
          </linearGradient>

          {/* Wave Layer 3 Gradient (Foreground) */}
          <linearGradient id="wave3Grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#DE6720" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#F48C06" stopOpacity="0.85" />
          </linearGradient>

          {/* Wave Layer 4 Gradient (Surf) */}
          <linearGradient id="wave4Grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F79F1A" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#FFBA08" stopOpacity="0.75" />
          </linearGradient>
        </defs>

        {/* 1. Base Ocean Water Body (Horizon Y: 565 to Y: 745) */}
        <rect x="0" y="565" width="1920" height="185" fill="url(#oceanDeepGrad)" />

        {/* 2. Wave Layer 1 (Distant Horizon Swell) */}
        <g ref={wave1Ref} fill="url(#wave1Grad)">
          <path d="M -600 575 Q -450 566 -300 575 Q -150 584 0 575 Q 150 566 300 575 Q 450 584 600 575 Q 750 566 900 575 Q 1050 584 1200 575 Q 1350 566 1500 575 Q 1650 584 1800 575 Q 1950 566 2100 575 Q 2250 584 2400 575 Q 2550 566 2700 575 L 2700 625 L -600 625 Z" />
        </g>

        {/* 3. Wave Layer 2 (Mid-distance Rolling Waves) */}
        <g ref={wave2Ref} fill="url(#wave2Grad)">
          <path d="M -600 610 Q -420 598 -240 610 Q -60 622 120 610 Q 300 598 480 610 Q 660 622 840 610 Q 1020 598 1200 610 Q 1380 622 1560 610 Q 1740 598 1920 610 Q 2100 622 2280 610 Q 2460 598 2640 610 L 2640 665 L -600 665 Z" />
        </g>

        {/* 4. Sun Specular Reflection Column (Aligned with Sun at X: 960) */}
        <g ref={sunReflectionRef} id="sunReflectionMaster">
          <ellipse className="sun-specular-band" cx="960" cy="572" rx="48" ry="2.8" fill="#FFFBEA" opacity="0.95" />
          <ellipse className="sun-specular-band" cx="960" cy="583" rx="66" ry="3.2" fill="#FFF4B8" opacity="0.9" />
          <ellipse className="sun-specular-band" cx="960" cy="596" rx="88" ry="3.8" fill="#FFE57F" opacity="0.85" />
          <ellipse className="sun-specular-band" cx="958" cy="612" rx="115" ry="4.4" fill="#FFD166" opacity="0.8" />
          <ellipse className="sun-specular-band" cx="962" cy="630" rx="142" ry="5.0" fill="#FFC048" opacity="0.75" />
          <ellipse className="sun-specular-band" cx="960" cy="650" rx="175" ry="5.8" fill="#FFAA33" opacity="0.7" />
          <ellipse className="sun-specular-band" cx="958" cy="672" rx="212" ry="6.6" fill="#FF9224" opacity="0.65" />
          <ellipse className="sun-specular-band" cx="962" cy="698" rx="250" ry="7.5" fill="#F77F00" opacity="0.55" />
          <ellipse className="sun-specular-band" cx="960" cy="726" rx="290" ry="8.5" fill="#E85D04" opacity="0.45" />
        </g>

        {/* 5. Wave Layer 3 (Foreground Rolling Crests) */}
        <g ref={wave3Ref} fill="url(#wave3Grad)">
          <path d="M -600 655 Q -380 640 -160 655 Q 60 670 280 655 Q 500 640 720 655 Q 940 670 1160 655 Q 1380 640 1600 655 Q 1820 670 2040 655 Q 2260 640 2480 655 L 2480 715 L -600 715 Z" />
        </g>

        {/* 6. Wave Layer 4 (Shore Surf Wash) */}
        <g ref={wave4Ref} fill="url(#wave4Grad)">
          <path d="M -600 700 Q -320 682 -40 700 Q 240 718 520 700 Q 800 682 1080 700 Q 1360 718 1640 700 Q 1920 682 2200 700 Q 2480 718 2760 700 L 2760 760 L -600 760 Z" />
        </g>

        {/* 7. Foam Lace & Spray Highlights */}
        <g ref={foamHighlightsRef} stroke="#FFF8E7" strokeWidth="2.5" fill="none" opacity="0.7" strokeLinecap="round">
          <path d="M 260 658 Q 370 650 480 658 M 600 656 Q 710 664 820 656" />
          <path d="M 1100 657 Q 1210 649 1320 657 M 1460 656 Q 1570 664 1680 656" />
          <path d="M 100 703 Q 250 693 400 703 M 740 701 Q 890 711 1040 701 M 1380 702 Q 1530 692 1680 702" strokeWidth="3.2" />
        </g>
      </svg>
    </div>
  );
};
