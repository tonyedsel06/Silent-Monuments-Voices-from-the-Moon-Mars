import React, { useEffect, useRef, useState } from 'react';
import { INSIGHT_MEDIA_ASSETS, handleNasaImageError } from '../utils/nasaMedia';

interface LivingMarsParallaxBgProps {
  currentPage: number; // 0..9
}

export const LivingMarsParallaxBg: React.FC<LivingMarsParallaxBgProps> = ({ currentPage }) => {
  const starCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setScrollY(window.scrollY || 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Layer 1: SVS 11929 ("Imaging Stars From Mars") Twinkling Martian Night Sky Canvas
  useEffect(() => {
    const canvas = starCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 180 stars of varying magnitudes & warm/cool color temperatures
    const stars = Array.from({ length: 180 }, (_, i) => ({
      x: ((i * 197 + 31) % 1000) / 1000,
      y: ((i * 139 + 17) % 1000) / 1000,
      r: 0.65 + (i % 4) * 0.55,
      baseAlpha: 0.35 + (i % 5) * 0.13,
      speed: 0.015 + (i % 6) * 0.006,
      phase: i * 0.85,
      tint:
        i % 5 === 0
          ? '255, 209, 166'
          : i % 7 === 0
            ? '100, 223, 223'
            : '255, 248, 242',
    }));

    let tick = 0;

    const renderStars = () => {
      tick += 1;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Deep Martian Night Sky Gradient (SVS 11929)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, '#09060A');
      skyGrad.addColorStop(0.45, '#170B08');
      skyGrad.addColorStop(0.78, '#2C150E');
      skyGrad.addColorStop(1, '#441E13');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Warm Atmospheric Limb Glow on the Horizon
      const limbGrad = ctx.createRadialGradient(
        w * 0.5,
        h * 0.92,
        20,
        w * 0.5,
        h * 0.92,
        w * 0.72
      );
      limbGrad.addColorStop(0, 'rgba(244, 162, 97, 0.28)');
      limbGrad.addColorStop(0.5, 'rgba(231, 111, 81, 0.12)');
      limbGrad.addColorStop(1, 'rgba(23, 11, 8, 0)');
      ctx.fillStyle = limbGrad;
      ctx.fillRect(0, 0, w, h);

      stars.forEach((s) => {
        const twinkle = Math.sin(tick * s.speed + s.phase) * 0.28;
        const alpha = Math.max(0.12, Math.min(1, s.baseAlpha + twinkle));
        ctx.fillStyle = `rgba(${s.tint}, ${alpha.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h * 0.85, s.r, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    renderStars();
    const isAutomated = typeof navigator !== 'undefined' && navigator.webdriver === true;
    const intervalId = isAutomated ? 0 : window.setInterval(renderStars, 120);

    return () => {
      if (intervalId) window.clearInterval(intervalId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // Dynamic Parallax Offsets driven by currentPage (0..9) and vertical scrollY
  const starShiftX = -(currentPage - 4.5) * 8;
  const starShiftY = -(scrollY * 0.04);

  const globeShiftX = -(currentPage - 4.5) * 22;
  const globeShiftY = -(scrollY * 0.09) + (currentPage % 2 === 0 ? -10 : 10);
  const globeRotate = (currentPage - 4.5) * 3.2;

  const horizonShiftX = -(currentPage - 4.5) * 14;
  const horizonShiftY = Math.min(28, scrollY * 0.03);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
    >
      {/* LAYER 1: Deep Martian Night Sky & Twinkling Stars (SVS 11929) */}
      <canvas
        ref={starCanvasRef}
        style={{
          transform: `translate3d(${starShiftX}px, ${starShiftY}px, 0) scale(1.06)`,
          transition: 'transform 650ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
        className="absolute inset-0 w-full h-full block"
      />

      {/* LAYER 2: Orbital Mars Vista (NASA PIA00407) with Chapter Angle Parallax */}
      <div
        style={{
          transform: `translate3d(${globeShiftX}px, ${globeShiftY}px, 0) rotate(${globeRotate}deg)`,
          transition: 'transform 850ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
        className="absolute -right-24 -top-20 w-[440px] h-[440px] sm:w-[640px] sm:h-[640px] opacity-28 mix-blend-screen"
      >
        <img
          src={INSIGHT_MEDIA_ASSETS.PIA00407_MARS_VISTA}
          onError={(e) => handleNasaImageError(e, INSIGHT_MEDIA_ASSETS.PIA22227_LOCAL)}
          alt=""
          className="w-full h-full object-contain rounded-full"
        />
        <div className="absolute inset-0 rounded-full bg-radial from-transparent via-[#26130D]/35 to-[#160B07]" />
      </div>

      {/* LAYER 3: Panoramic Martian Surface & Hills Horizon (Spirit / InSight Horizon) */}
      <div
        style={{
          transform: `translate3d(${horizonShiftX}px, ${horizonShiftY}px, 0) scale(1.08)`,
          transition: 'transform 750ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
        className="absolute bottom-0 left-0 right-0 h-[38vh] min-h-[220px] max-h-[380px] opacity-38"
      >
        <img
          src={INSIGHT_MEDIA_ASSETS.MARS_EAST_HILLS_HORIZON}
          onError={(e) => handleNasaImageError(e, INSIGHT_MEDIA_ASSETS.PIA22227_LOCAL)}
          alt=""
          className="w-full h-full object-cover object-bottom"
        />
        {/* Smooth Atmospheric Blend from Starry Sky into Martian Hills */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#160B07] via-[#26130D]/68 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#170B08] to-transparent" />
      </div>
    </div>
  );
};
