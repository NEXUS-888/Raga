import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import type { VoiceSceneState } from './SceneAnimationManager';

interface CharactersProps {
  sceneState: VoiceSceneState;
}

export const Characters: React.FC<CharactersProps> = ({ sceneState }) => {
  const p1TorsoRef = useRef<SVGGElement | null>(null);
  const p1HeadRef = useRef<SVGGElement | null>(null);
  const p1ArmRef = useRef<SVGGElement | null>(null);
  const p1GlassRef = useRef<SVGGElement | null>(null);

  const p2TorsoRef = useRef<SVGGElement | null>(null);
  const p2HeadRef = useRef<SVGGElement | null>(null);
  const p2ArmRef = useRef<SVGGElement | null>(null);

  const sunglassGlint1Ref = useRef<SVGCircleElement | null>(null);
  const sunglassGlint2Ref = useRef<SVGCircleElement | null>(null);

  useEffect(() => {
    // 1. Person 1 (Left) - Gentle 4.4s Breathing Cycle
    const p1Breath = gsap.timeline({ repeat: -1, yoyo: true });
    p1Breath.to(p1TorsoRef.current, {
      scaleY: 1.025,
      scaleX: 1.01,
      y: -1.8,
      duration: 4.4,
      ease: 'sine.inOut',
      transformOrigin: 'bottom center',
    });

    // 2. Person 1 Head - Subtle Relaxed Gaze & Micro Nod
    const p1HeadTl = gsap.timeline({ repeat: -1, yoyo: true });
    p1HeadTl.to(p1HeadRef.current, {
      rotation: 2.5,
      y: -1.2,
      duration: 6.2,
      ease: 'sine.inOut',
      transformOrigin: '50% 90%',
    });

    // 3. Person 1 Occasional Toast / Drink Gesture (every 22-38s)
    const triggerP1DrinkToast = () => {
      if (!p1ArmRef.current) return;
      const toastTl = gsap.timeline({
        onComplete: () => {
          gsap.delayedCall(22 + Math.random() * 16, triggerP1DrinkToast);
        },
      });

      toastTl
        .to(p1ArmRef.current, {
          rotation: -16,
          y: -5,
          duration: 2.2,
          ease: 'power2.inOut',
          transformOrigin: '15% 15%',
        })
        .to(sunglassGlint1Ref.current, {
          opacity: 1.0,
          scale: 1.6,
          duration: 0.5,
          yoyo: true,
          repeat: 1,
        }, '-=1.0')
        .to(p1ArmRef.current, {
          rotation: 0,
          y: 0,
          duration: 2.6,
          delay: 1.8,
          ease: 'power1.inOut',
          transformOrigin: '15% 15%',
        });
    };

    // 4. Person 2 (Right) - Gentle 5.0s Asynchronous Breathing Cycle
    const p2Breath = gsap.timeline({ repeat: -1, yoyo: true });
    p2Breath.to(p2TorsoRef.current, {
      scaleY: 1.02,
      scaleX: 1.008,
      y: -1.5,
      duration: 5.0,
      ease: 'sine.inOut',
      transformOrigin: 'bottom center',
    });

    // 5. Person 2 Head - Subtle Relaxed Head Tilt
    const p2HeadTl = gsap.timeline({ repeat: -1, yoyo: true });
    p2HeadTl.to(p2HeadRef.current, {
      rotation: -2.8,
      x: 1.2,
      duration: 7.0,
      ease: 'sine.inOut',
      transformOrigin: '50% 90%',
    });

    // 6. Person 2 Arm - Occasional Hand Conversational Gesture
    const triggerP2Gesture = () => {
      if (!p2ArmRef.current) return;
      const gestureTl = gsap.timeline({
        onComplete: () => {
          gsap.delayedCall(25 + Math.random() * 18, triggerP2Gesture);
        },
      });

      gestureTl
        .to(p2ArmRef.current, {
          rotation: 7,
          y: -3,
          duration: 1.8,
          ease: 'power1.inOut',
          transformOrigin: '80% 20%',
        })
        .to(p2ArmRef.current, {
          rotation: 0,
          y: 0,
          duration: 2.2,
          delay: 1.5,
          ease: 'power1.inOut',
          transformOrigin: '80% 20%',
        });
    };

    const t1 = setTimeout(triggerP1DrinkToast, 5000);
    const t2 = setTimeout(triggerP2Gesture, 15000);

    return () => {
      p1Breath.kill();
      p1HeadTl.kill();
      p2Breath.kill();
      p2HeadTl.kill();
      clearTimeout(t1);
      clearTimeout(t2);
      gsap.killTweensOf([p1ArmRef.current, p2ArmRef.current, sunglassGlint1Ref.current]);
    };
  }, []);

  // Reactive Voice AI State
  useEffect(() => {
    if (sceneState === 'LISTENING' || sceneState === 'PROCESSING') {
      gsap.to([p1HeadRef.current, p2HeadRef.current], {
        rotation: (i) => (i === 0 ? 4.0 : -4.0),
        duration: 0.8,
        ease: 'power2.out',
      });
    } else {
      gsap.to([p1HeadRef.current, p2HeadRef.current], {
        rotation: 0,
        duration: 1.2,
        ease: 'power1.inOut',
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
          {/* Skin Tone Gradients */}
          <linearGradient id="charSkinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E59866" />
            <stop offset="50%" stopColor="#D98A5B" />
            <stop offset="100%" stopColor="#A0522D" />
          </linearGradient>

          {/* Tropical Shirt 1 (Coral Red with Floral Yellow Accents) */}
          <linearGradient id="shirtGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF3366" />
            <stop offset="60%" stopColor="#D90429" />
            <stop offset="100%" stopColor="#7F0019" />
          </linearGradient>

          {/* Tropical Shirt 2 (Goan Teal with Palm Accents) */}
          <linearGradient id="shirtGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00F5D4" />
            <stop offset="60%" stopColor="#05B292" />
            <stop offset="100%" stopColor="#045648" />
          </linearGradient>

          {/* Deck Chair Wood Texture */}
          <linearGradient id="deckWood" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#802200" />
            <stop offset="50%" stopColor="#5E1914" />
            <stop offset="100%" stopColor="#3B0C08" />
          </linearGradient>

          {/* Sunglasses Sunset Reflection */}
          <linearGradient id="sunglassSunset" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF275" />
            <stop offset="40%" stopColor="#FF9F1C" />
            <stop offset="80%" stopColor="#FF2A55" />
            <stop offset="100%" stopColor="#660708" />
          </linearGradient>
        </defs>

        {/* Master Illustrated Characters Group - Centered at X: 520, Y: 710 */}
        <g id="masterIllustratedCharacters" transform="translate(520, 710)">
          {/* Ground Platform Shadow */}
          <ellipse cx="140" cy="190" rx="210" ry="26" fill="#15020D" opacity="0.45" />

          {/* ======================================================== */}
          {/* 1. LEFT CHARACTER (PERSON 1) */}
          {/* ======================================================== */}
          <g id="person1Illustrated" transform="translate(35, 15)">
            {/* Wooden Deck Chair Left */}
            <g id="chairLeft" stroke="url(#deckWood)" strokeWidth="6" strokeLinecap="round">
              <line x1="-15" y1="125" x2="40" y2="35" />
              <line x1="40" y1="35" x2="72" y2="125" />
              <line x1="8" y1="75" x2="55" y2="75" strokeWidth="4" />
              {/* Striped Lounge Canvas Sling */}
              <path
                d="M 36 38 Q 22 88 50 110"
                stroke="#FFE500"
                strokeWidth="7"
                fill="none"
              />
              <path
                d="M 38 40 Q 24 88 52 110"
                stroke="#FF2A55"
                strokeWidth="2.5"
                fill="none"
              />
            </g>

            {/* Torso, Legs & Clothing */}
            <g ref={p1TorsoRef}>
              {/* Tanned Legs / Shorts */}
              <path
                d="M 28 102 Q 34 118 48 124 L 44 150"
                stroke="url(#charSkinGrad)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
              />
              {/* Linen Shorts */}
              <path
                d="M 24 95 Q 38 92 48 100 Q 42 116 32 118 Q 22 114 24 95 Z"
                fill="#F8F9FA"
                stroke="#2B0515"
                strokeWidth="1.5"
              />

              {/* Illustrated Floral Shirt */}
              <path
                d="M 18 55 Q 36 46 52 56 Q 56 94 34 100 Q 14 94 18 55 Z"
                fill="url(#shirtGrad1)"
                stroke="#2B0515"
                strokeWidth="2"
              />
              {/* Shirt Floral Print Details */}
              <g fill="#FFE500" opacity="0.85">
                <circle cx="28" cy="68" r="2.5" />
                <circle cx="42" cy="74" r="2.5" />
                <circle cx="32" cy="85" r="2.5" />
                <circle cx="46" cy="88" r="2.2" />
              </g>
              {/* Shirt Collar Open V-Neck */}
              <polygon points="32,54 36,68 40,54" fill="url(#charSkinGrad)" />
            </g>

            {/* Arm with Tropical Cocktail */}
            <g ref={p1ArmRef}>
              {/* Forearm & Bicep */}
              <path
                d="M 44 60 Q 62 70 66 84 Q 78 76 80 60"
                stroke="url(#charSkinGrad)"
                strokeWidth="7"
                fill="none"
                strokeLinecap="round"
              />
              {/* Cocktail Glass */}
              <g ref={p1GlassRef} transform="translate(78, 52)">
                <polygon points="0,0 10,0 7,14 3,14" fill="url(#sunglassSunset)" opacity="0.9" stroke="#FFE500" strokeWidth="0.8" />
                <line x1="5" y1="14" x2="5" y2="19" stroke="#FFE500" strokeWidth="1.2" />
                <line x1="1" y1="19" x2="9" y2="19" stroke="#FFE500" strokeWidth="1.2" />
                {/* Drinking Straw & Umbrella Pick */}
                <line x1="7" y1="-3" x2="3" y2="8" stroke="#FF2A55" strokeWidth="1.2" strokeLinecap="round" />
                <polygon points="9,-3 14,-2 9,0" fill="#00F5D4" />
              </g>
            </g>

            {/* Head, Hair & Sunglasses */}
            <g ref={p1HeadRef} transform="translate(32, 26)">
              {/* Neck */}
              <line x1="5" y1="24" x2="5" y2="30" stroke="url(#charSkinGrad)" strokeWidth="6" strokeLinecap="round" />
              {/* Head Profile */}
              <ellipse cx="6" cy="14" rx="11" ry="13" fill="url(#charSkinGrad)" stroke="#2B0515" strokeWidth="1.5" />
              {/* Wavy Illustrated Hair */}
              <path
                d="M -5 12 Q -6 -3 7 -4 Q 18 -3 18 10 Q 14 0 7 0 Q 0 0 -5 12 Z"
                fill="#240010"
              />
              {/* Classic Wayfarer Sunglasses */}
              <rect x="2" y="9" width="12" height="6" rx="2.5" fill="url(#sunglassSunset)" stroke="#000" strokeWidth="1.2" />
              {/* Sunglasses Glint */}
              <circle ref={sunglassGlint1Ref} cx="4.5" cy="11" r="1.2" fill="#FFF" opacity="0.7" />
            </g>
          </g>

          {/* ======================================================== */}
          {/* 2. CENTRAL BAMBOO CAFE TABLE */}
          {/* ======================================================== */}
          <g id="bambooTable" transform="translate(138, 72)">
            {/* Bamboo Table Legs */}
            <line x1="15" y1="38" x2="15" y2="92" stroke="#5E1914" strokeWidth="5" strokeLinecap="round" />
            <line x1="-4" y1="92" x2="34" y2="92" stroke="#5E1914" strokeWidth="5" strokeLinecap="round" />
            {/* Table Top with Golden Bamboo Finish */}
            <ellipse cx="15" cy="38" rx="34" ry="8" fill="#FFE500" stroke="#000" strokeWidth="2.5" />
            <ellipse cx="15" cy="38" rx="30" ry="6" fill="none" stroke="#E09F3E" strokeWidth="1.5" />

            {/* Fresh Tender Coconut with Straw */}
            <g transform="translate(10, 22)">
              <ellipse cx="4" cy="10" rx="7" ry="7" fill="#4B280A" stroke="#1A0D02" strokeWidth="1.5" />
              <ellipse cx="4" cy="5" rx="4" ry="2" fill="#D98A5B" />
              <line x1="5" y1="4" x2="9" y2="-4" stroke="#FF2A55" strokeWidth="1.5" strokeLinecap="round" />
            </g>
          </g>

          {/* ======================================================== */}
          {/* 3. RIGHT CHARACTER (PERSON 2) */}
          {/* ======================================================== */}
          <g id="person2Illustrated" transform="translate(185, 18)">
            {/* Wooden Deck Chair Right */}
            <g id="chairRight" stroke="url(#deckWood)" strokeWidth="6" strokeLinecap="round">
              <line x1="62" y1="125" x2="8" y2="35" />
              <line x1="8" y1="35" x2="-24" y2="125" />
              <line x1="40" y1="75" x2="-8" y2="75" strokeWidth="4" />
              {/* Striped Fabric Sling */}
              <path
                d="M 12 38 Q 26 88 -2 110"
                stroke="#FF2A55"
                strokeWidth="7"
                fill="none"
              />
              <path
                d="M 10 40 Q 24 88 -4 110"
                stroke="#FFE500"
                strokeWidth="2.5"
                fill="none"
              />
            </g>

            {/* Torso & Upper Body */}
            <g ref={p2TorsoRef}>
              {/* Tanned Legs */}
              <path
                d="M 22 102 Q 16 118 4 124 L 8 150"
                stroke="url(#charSkinGrad)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
              />
              {/* Linen Shorts */}
              <path
                d="M 16 95 Q 2 92 -8 100 Q -2 116 8 118 Q 18 114 16 95 Z"
                fill="#FFE500"
                stroke="#2B0515"
                strokeWidth="1.5"
              />

              {/* Illustrated Teal Shirt */}
              <path
                d="M 30 55 Q 12 46 -4 56 Q -8 94 14 100 Q 34 94 30 55 Z"
                fill="url(#shirtGrad2)"
                stroke="#033830"
                strokeWidth="2"
              />
              {/* Palm Silhouette Shirt Pattern */}
              <g fill="#00F5D4" opacity="0.4">
                <circle cx="12" cy="70" r="2.5" />
                <circle cx="22" cy="78" r="2.5" />
                <circle cx="6" cy="86" r="2.5" />
              </g>
            </g>

            {/* Arm Resting Relaxed on Chair */}
            <g ref={p2ArmRef}>
              <path
                d="M 8 60 Q -12 70 -18 84 Q -26 76 -28 62"
                stroke="url(#charSkinGrad)"
                strokeWidth="7"
                fill="none"
                strokeLinecap="round"
              />
            </g>

            {/* Head, Hair & Sunglasses */}
            <g ref={p2HeadRef} transform="translate(14, 26)">
              {/* Neck */}
              <line x1="-3" y1="24" x2="-3" y2="30" stroke="url(#charSkinGrad)" strokeWidth="6" strokeLinecap="round" />
              {/* Head Profile */}
              <ellipse cx="-4" cy="14" rx="11" ry="13" fill="url(#charSkinGrad)" stroke="#033830" strokeWidth="1.5" />
              {/* Stylized Ponytail & Flowing Hair */}
              <path
                d="M 6 12 Q 9 -3 -4 -4 Q -16 -3 -16 10 Q -12 0 -4 0 Q 3 0 6 12 Z"
                fill="#160800"
              />
              <path d="M 6 4 Q 14 6 18 16" stroke="#160800" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              {/* Sunglasses */}
              <rect x="-12" y="9" width="12" height="6" rx="2.5" fill="url(#sunglassSunset)" stroke="#000" strokeWidth="1.2" />
              <circle ref={sunglassGlint2Ref} cx="-8.5" cy="11" r="1.2" fill="#FFF" opacity="0.7" />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
};
