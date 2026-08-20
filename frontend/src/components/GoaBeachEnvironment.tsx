import React, { useEffect, useRef, useState } from 'react';

interface GoaBeachEnvironmentProps {
  isRevealed: boolean;
  glimmerTrigger: number;
}

export const GoaBeachEnvironment: React.FC<GoaBeachEnvironmentProps> = ({
  isRevealed,
  glimmerTrigger
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasVideo, setHasVideo] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const bgImageRef = useRef<HTMLImageElement | null>(null);
  const glimmerParticles = useRef<Array<{ x: number; y: number; vx: number; vy: number; size: number; alpha: number; color: string }>>([]);

  // Check if a user video file exists in public/goa_beach.mp4
  useEffect(() => {
    const video = document.createElement('video');
    video.src = '/goa_beach.mp4';
    video.oncanplay = () => setHasVideo(true);
    video.onerror = () => setHasVideo(false);

    const img = new Image();
    img.src = '/assets/goa_sunset_scene.png';
    img.onload = () => {
      bgImageRef.current = img;
      setImageLoaded(true);
    };
  }, []);

  // Trigger Glimmer Light Burst on Mic Click
  useEffect(() => {
    if (glimmerTrigger > 0) {
      const p: typeof glimmerParticles.current = [];
      const originX = window.innerWidth - 220;
      const originY = 220;
      const colors = ['#FFE500', '#FF2A55', '#00F5D4', '#FFFDF8', '#FFB703', '#FF8500'];

      for (let i = 0; i < 110; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 9 + 3;
        p.push({
          x: originX,
          y: originY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 5 + 2,
          alpha: 1.0,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
      glimmerParticles.current = p;
    }
  }, [glimmerTrigger]);

  // Master 60FPS Render Loop: Exact Artwork + Layered Animations
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

        const spotX = width - 220;
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
      // STATE 2: CLEAN BACKGROUND IMAGE
      // ==========================================
      const bgImg = bgImageRef.current;
      if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
        // Draw exact high-resolution illustration with 'cover' aspect ratio
        const imgRatio = bgImg.naturalWidth / bgImg.naturalHeight;
        const screenRatio = width / height;
        let renderW = width;
        let renderH = height;
        let renderX = 0;
        let renderY = 0;

        if (screenRatio > imgRatio) {
          renderW = width;
          renderH = width / imgRatio;
          renderY = (height - renderH) / 2;
        } else {
          renderH = height;
          renderW = height * imgRatio;
          renderX = (width - renderW) / 2;
        }

        ctx.drawImage(bgImg, renderX, renderY, renderW, renderH);
      }

      // CELEBRATORY GLIMMER PARTICLES BURST
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
  }, [isRevealed, glimmerTrigger, imageLoaded]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[#05070D]">
      {hasVideo && isRevealed && (
        <video
          ref={videoRef}
          src="/goa_beach.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
        />
      )}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
};

