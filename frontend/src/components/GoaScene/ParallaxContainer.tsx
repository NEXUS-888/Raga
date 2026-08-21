import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface ParallaxLayerProps {
  depth: number; // 0.05 (sky) to 1.0 (foreground)
  children: React.ReactNode;
  className?: string;
}

export const ParallaxLayer: React.FC<ParallaxLayerProps> = ({ depth, children, className = '' }) => {
  const layerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = layerRef.current;
    if (!el) return;

    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;

    const quickX = gsap.quickTo(el, 'x', { duration: 0.8, ease: 'power2.out' });
    const quickY = gsap.quickTo(el, 'y', { duration: 0.8, ease: 'power2.out' });

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const normalizedX = (e.clientX / innerWidth - 0.5) * 2; // -1 to 1
      const normalizedY = (e.clientY / innerHeight - 0.5) * 2;

      // Max foreground shift: 24px horizontal, 14px vertical
      const shiftX = normalizedX * 24 * depth;
      const shiftY = normalizedY * 14 * depth;

      quickX(shiftX);
      quickY(shiftY);
    };

    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const scrollShiftY = -scrollY * depth * 0.2;
      gsap.to(el, { y: scrollShiftY, duration: 0.4, ease: 'power1.out', overwrite: 'auto' });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [depth]);

  return (
    <div
      ref={layerRef}
      className={`absolute inset-0 w-full h-full pointer-events-none will-change-transform ${className}`}
      style={{ transform: 'translate3d(0, 0, 0)' }}
    >
      {children}
    </div>
  );
};

export const ParallaxContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return <div className={`relative w-full h-full overflow-hidden ${className}`}>{children}</div>;
};
