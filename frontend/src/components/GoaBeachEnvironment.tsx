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

    let time = 0;

    // Silhouette bird flock
    const birds = [
      { x: width * 0.15, y: height * 0.22, speed: 0.75, scale: 0.85, phase: 0 },
      { x: width * 0.28, y: height * 0.16, speed: 0.95, scale: 1.0, phase: 1.4 },
      { x: width * 0.65, y: height * 0.10, speed: 0.80, scale: 0.70, phase: 2.2 },
      { x: width * 0.72, y: height * 0.14, speed: 0.70, scale: 0.60, phase: 3.1 },
    ];

    const render = () => {
      animFrameRef.current = requestAnimationFrame(render);
      time += 0.016;

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
      // STATE 2: EXACT ARTWORK WITH HIGH-RES FIDELITY
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

        // 1. LAYER: SUN ATMOSPHERIC BREATHING GLOW
        const sunCenterX = renderX + renderW * 0.46;
        const sunCenterY = renderY + renderH * 0.62;
        const sunRadius = renderH * 0.32;
        const sunPulse = 1.0 + Math.sin(time * 1.8) * 0.06;

        const sunGlow = ctx.createRadialGradient(
          sunCenterX, sunCenterY, sunRadius * 0.3,
          sunCenterX, sunCenterY, sunRadius * 1.5 * sunPulse
        );
        sunGlow.addColorStop(0, 'rgba(255, 235, 59, 0.28)');
        sunGlow.addColorStop(0.45, 'rgba(255, 152, 0, 0.14)');
        sunGlow.addColorStop(1, 'rgba(230, 81, 0, 0)');
        ctx.fillStyle = sunGlow;
        ctx.beginPath();
        ctx.arc(sunCenterX, sunCenterY, sunRadius * 1.5 * sunPulse, 0, Math.PI * 2);
        ctx.fill();

        // 2. LAYER: OCEAN WATER SUNSET SHIMMER RIPPLES
        const waterTopY = renderY + renderH * 0.70;
        const waterBottomY = renderY + renderH * 0.83;
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, waterTopY, width, waterBottomY - waterTopY);
        ctx.clip();

        for (let y = waterTopY; y < waterBottomY; y += 4) {
          const prog = (y - waterTopY) / (waterBottomY - waterTopY);
          const waveShift = Math.sin(time * 3.5 + y * 0.12) * 14 * prog;
          const shimmerW = sunRadius * 1.8 * (1 + prog * 1.4);
          const alpha = (1 - prog * 0.5) * (0.28 + Math.sin(time * 4.2 + y * 0.2) * 0.18);

          ctx.fillStyle = `rgba(255, 224, 130, ${Math.max(0.05, alpha)})`;
          ctx.fillRect(sunCenterX - shimmerW / 2 + waveShift, y, shimmerW, 2.0);
        }
        ctx.restore();

        // 3. LAYER: HORIZON GLIDING SAILBOAT
        const boatProgress = ((time * 14) % (renderW + 160)) - 80;
        const boatActualX = renderX + boatProgress;
        const boatActualY = waterTopY + 2 + Math.sin(time * 2.8) * 1.5;
        const boatScale = Math.max(0.6, renderH / 900);

        ctx.save();
        ctx.translate(boatActualX, boatActualY);
        ctx.scale(boatScale, boatScale);
        ctx.fillStyle = '#261208';
        // Hull
        ctx.beginPath();
        ctx.moveTo(-18, 0);
        ctx.lineTo(20, 0);
        ctx.lineTo(15, 7);
        ctx.lineTo(-14, 7);
        ctx.closePath();
        ctx.fill();
        // Main Mast & Sail
        ctx.beginPath();
        ctx.moveTo(3, -2);
        ctx.lineTo(3, -34);
        ctx.lineTo(-14, -5);
        ctx.closePath();
        ctx.fill();
        // Jib Sail
        ctx.beginPath();
        ctx.moveTo(5, -5);
        ctx.lineTo(5, -28);
        ctx.lineTo(17, -5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // 4. LAYER: NEON "OPEN" SIGN PULSING & GLOW ON CANDY ICE CART
        // Precise relative anchor of the "OPEN" sign on the cart in the artwork
        const neonX = renderX + renderW * 0.714;
        const neonY = renderY + renderH * 0.558;
        const neonW = renderW * 0.065;
        const neonH = renderH * 0.040;
        const neonPulse = (Math.sin(time * 4.5) > -0.6) ? 1.0 : 0.35;

        // Ambient Cyan Neon Bloom
        const neonBloom = ctx.createRadialGradient(neonX, neonY, 5, neonX, neonY, neonW * 1.8);
        neonBloom.addColorStop(0, `rgba(0, 245, 212, ${0.45 * neonPulse})`);
        neonBloom.addColorStop(0.5, `rgba(255, 42, 85, ${0.22 * neonPulse})`);
        neonBloom.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = neonBloom;
        ctx.beginPath();
        ctx.arc(neonX, neonY, neonW * 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Glowing Neon "OPEN" Sign Text & Border
        ctx.save();
        ctx.strokeStyle = `rgba(0, 245, 212, ${0.85 * neonPulse})`;
        ctx.lineWidth = 2;
        ctx.strokeRect(neonX - neonW / 2, neonY - neonH / 2, neonW, neonH);

        ctx.fillStyle = `rgba(255, 60, 100, ${0.95 * neonPulse})`;
        ctx.font = `900 ${Math.max(10, Math.floor(renderH * 0.018))}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('OPEN', neonX, neonY);
        ctx.restore();

        // 5. LAYER: "CHEERS" BOTTLE CLINK SPARKLE FX
        const cycle = (time % 5.0);
        if (cycle >= 1.8 && cycle <= 2.6) {
          const clinkX = renderX + renderW * 0.222;
          const clinkY = renderY + renderH * 0.778;
          const clinkAlpha = Math.sin((cycle - 1.8) * Math.PI / 0.8);

          ctx.save();
          ctx.translate(clinkX, clinkY);
          ctx.fillStyle = `rgba(255, 229, 0, ${clinkAlpha})`;
          ctx.beginPath();
          ctx.arc(0, 0, 6 * clinkAlpha, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = `rgba(255, 255, 255, ${clinkAlpha})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-12, 0); ctx.lineTo(12, 0);
          ctx.moveTo(0, -12); ctx.lineTo(0, 12);
          ctx.stroke();
          ctx.restore();
        }
      }

      // 6. LAYER: SILHOUETTE BIRDS GLIDING ACROSS SKY
      ctx.fillStyle = '#261208';
      birds.forEach((b) => {
        b.x += b.speed;
        if (b.x > width + 60) b.x = -60;

        const wingFlap = Math.sin(time * 5.5 + b.phase) * 7 * b.scale;
        const bY = b.y + Math.sin(time * 1.8 + b.phase) * 3;

        ctx.save();
        ctx.translate(b.x, bY);
        ctx.scale(b.scale, b.scale);
        ctx.beginPath();
        // Left wing
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-10, -8 + wingFlap, -18, -3 + wingFlap * 0.8);
        ctx.quadraticCurveTo(-11, 2 + wingFlap * 0.4, 0, 2);
        // Right wing
        ctx.quadraticCurveTo(11, 2 + wingFlap * 0.4, 18, -3 + wingFlap * 0.8);
        ctx.quadraticCurveTo(10, -8 + wingFlap, 0, 0);
        ctx.fill();
        ctx.restore();
      });

      // 7. LAYER: CELEBRATORY GLIMMER PARTICLES BURST
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

