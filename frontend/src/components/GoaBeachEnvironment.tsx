import React, { useEffect, useRef } from 'react';
import { GoaScene } from './GoaScene/GoaScene';
import type { VoiceSceneState } from './GoaScene/SceneAnimationManager';

interface GoaBeachEnvironmentProps {
  isRevealed: boolean;
  glimmerTrigger: number;
  sceneState?: VoiceSceneState;
}

export const GoaBeachEnvironment: React.FC<GoaBeachEnvironmentProps> = ({
  isRevealed,
  glimmerTrigger,
  sceneState = 'IDLE',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const glimmerParticles = useRef<
    Array<{ x: number; y: number; vx: number; vy: number; size: number; alpha: number; color: string }>
  >([]);

  // Trigger Glimmer Light Burst on Mic Click
  useEffect(() => {
    if (glimmerTrigger > 0) {
      const p: typeof glimmerParticles.current = [];
      const originX = window.innerWidth / 2;
      const originY = 160;
      const colors = ['#FFE500', '#FF2A55', '#00F5D4', '#FFFDF8', '#FFB703', '#FF8500'];

      for (let i = 0; i < 120; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 9 + 3;
        p.push({
          x: originX,
          y: originY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 5 + 2,
          alpha: 1.0,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
      glimmerParticles.current = p;
    }
  }, [glimmerTrigger]);

  // Spotlight and Particle Overlay Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const render = () => {
      animFrameRef.current = requestAnimationFrame(render);
      ctx.clearRect(0, 0, width, height);

      // ==========================================
      // STATE 1: UNREVEALED (Pitch Black + Mic Spotlight)
      // ==========================================
      if (!isRevealed) {
        ctx.fillStyle = '#05070D';
        ctx.fillRect(0, 0, width, height);

        const spotX = width / 2;
        const spotY = 160;
        const spotGrad = ctx.createRadialGradient(spotX, spotY, 20, spotX, spotY, 320);
        spotGrad.addColorStop(0, 'rgba(255, 229, 0, 0.24)');
        spotGrad.addColorStop(0.4, 'rgba(255, 42, 85, 0.10)');
        spotGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = spotGrad;
        ctx.fillRect(0, 0, width, height);
        return;
      }

      // ==========================================
      // STATE 2: CELEBRATORY GLIMMER PARTICLES BURST
      // ==========================================
      const particles = glimmerParticles.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.95;
        p.vy *= 0.95;
        p.alpha -= 0.016;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.fill();
          ctx.globalAlpha = 1.0;
        }
      }
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [isRevealed, glimmerTrigger]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[#05070D]">
      {/* Living Multi-Layered Goa Beach Scene (Rendered when revealed) */}
      {isRevealed && <GoaScene sceneState={sceneState} />}

      {/* Spotlight Canvas and Particle Effects Layer */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />
    </div>
  );
};
