import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeAcousticCoreProps {
  isRecording: boolean;
  isLoading: boolean;
  theme: 'amber' | 'cyan' | 'emerald';
  audioFrequencyData?: Uint8Array | null;
}

export const ThreeAcousticCore: React.FC<ThreeAcousticCoreProps> = ({
  isRecording,
  isLoading,
  theme,
  audioFrequencyData
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const sphereWireRef = useRef<THREE.LineSegments | null>(null);
  const particleSystemRef = useRef<THREE.Points | null>(null);
  const ringsRef = useRef<THREE.Group | null>(null);
  const isDraggingRef = useRef(false);
  const prevMousePos = useRef({ x: 0, y: 0 });

  const themeColors = {
    amber: {
      primary: 0xf59e0b,
      secondary: 0xd97706,
      particles: 0xfbbf24,
      glow: 0x78350f
    },
    cyan: {
      primary: 0x00f0ff,
      secondary: 0x0284c7,
      particles: 0x38bdf8,
      glow: 0x082f49
    },
    emerald: {
      primary: 0x00ff66,
      secondary: 0x059669,
      particles: 0x34d399,
      glow: 0x064e3b
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene & Camera Setup
    const width = container.clientWidth || 320;
    const height = container.clientHeight || 220;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 5.2;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // limit pixel ratio for battery efficiency
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const colors = themeColors[theme];

    // 2. Geometric Inner Sphere (Icosahedron Wireframe)
    const icosahedronGeo = new THREE.IcosahedronGeometry(1.6, 2);
    const wireframeGeo = new THREE.WireframeGeometry(icosahedronGeo);
    const wireframeMat = new THREE.LineBasicMaterial({
      color: colors.primary,
      transparent: true,
      opacity: 0.45,
      linewidth: 1
    });
    const sphereWire = new THREE.LineSegments(wireframeGeo, wireframeMat);
    scene.add(sphereWire);
    sphereWireRef.current = sphereWire;

    // 3. Central Neural Particles
    const particleCount = 280;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random()) * 1.35;
      const sinPhi = Math.sin(phi);
      particlePositions[i * 3] = r * sinPhi * Math.cos(theta);
      particlePositions[i * 3 + 1] = r * sinPhi * Math.sin(theta);
      particlePositions[i * 3 + 2] = r * Math.cos(phi);
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: colors.particles,
      size: 0.05,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);
    particleSystemRef.current = particleSystem;

    // 4. Orbital Telemetry Rings (Hardware Gimbal)
    const ringGroup = new THREE.Group();
    const ringGeo1 = new THREE.RingGeometry(2.1, 2.13, 64);
    const ringMat1 = new THREE.MeshBasicMaterial({ color: colors.secondary, side: THREE.DoubleSide, transparent: true, opacity: 0.35 });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;

    const ringGeo2 = new THREE.RingGeometry(2.3, 2.32, 64);
    const ringMat2 = new THREE.MeshBasicMaterial({ color: colors.primary, side: THREE.DoubleSide, transparent: true, opacity: 0.25 });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.y = Math.PI / 4;

    ringGroup.add(ring1);
    ringGroup.add(ring2);
    scene.add(ringGroup);
    ringsRef.current = ringGroup;

    // 5. Interactive Mouse Drag for 3D Rotation
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      prevMousePos.current = { x: e.clientX, y: e.clientY };
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !sphereWireRef.current) return;
      const deltaX = e.clientX - prevMousePos.current.x;
      const deltaY = e.clientY - prevMousePos.current.y;
      sphereWireRef.current.rotation.y += deltaX * 0.01;
      sphereWireRef.current.rotation.x += deltaY * 0.01;
      if (particleSystemRef.current) {
        particleSystemRef.current.rotation.y += deltaX * 0.01;
        particleSystemRef.current.rotation.x += deltaY * 0.01;
      }
      prevMousePos.current = { x: e.clientX, y: e.clientY };
    };
    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // 6. Animation Loop (Throttled & Low-power)
    let clock = new THREE.Clock();

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      let rotSpeed = 0.4;
      let pulseScale = 1.0;

      if (isRecording) {
        rotSpeed = 1.2;
        // Audio reactivity if available
        if (audioFrequencyData && audioFrequencyData.length > 0) {
          let sum = 0;
          for (let i = 0; i < 16; i++) sum += audioFrequencyData[i];
          const avg = sum / 16;
          pulseScale = 1.0 + (avg / 255) * 0.35;
        } else {
          pulseScale = 1.0 + Math.sin(time * 8) * 0.08;
        }
      } else if (isLoading) {
        rotSpeed = 2.4;
        pulseScale = 1.0 + Math.sin(time * 12) * 0.06;
      } else {
        pulseScale = 1.0 + Math.sin(time * 2) * 0.02;
      }

      if (sphereWire) {
        sphereWire.rotation.y += delta * rotSpeed * 0.7;
        sphereWire.rotation.x += delta * rotSpeed * 0.4;
        sphereWire.scale.set(pulseScale, pulseScale, pulseScale);
      }

      if (particleSystem) {
        particleSystem.rotation.y -= delta * rotSpeed * 0.5;
        particleSystem.rotation.z += delta * rotSpeed * 0.3;
        particleSystem.scale.set(pulseScale, pulseScale, pulseScale);
      }

      if (ringGroup) {
        ringGroup.rotation.z += delta * rotSpeed * 0.2;
        ringGroup.rotation.x -= delta * rotSpeed * 0.15;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 7. Cleanup
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      renderer.dispose();
      icosahedronGeo.dispose();
      wireframeGeo.dispose();
      wireframeMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      ringGeo1.dispose();
      ringGeo2.dispose();
      ringMat1.dispose();
      ringMat2.dispose();
    };
  }, [theme, isRecording, isLoading]);

  return (
    <div className="relative w-full h-48 flex items-center justify-center cursor-grab active:cursor-grabbing select-none">
      <div ref={containerRef} className="w-full h-full" />
      {/* Laser HUD Reticle Crosshairs */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-40 h-40 border border-white/[0.04] rounded-full" />
        <div className="absolute w-2 h-2 border-t border-l border-white/20 -top-1 -left-1" />
        <div className="absolute w-2 h-2 border-t border-r border-white/20 -top-1 -right-1" />
        <div className="absolute w-2 h-2 border-b border-l border-white/20 -bottom-1 -left-1" />
        <div className="absolute w-2 h-2 border-b border-r border-white/20 -bottom-1 -right-1" />
      </div>
    </div>
  );
};
