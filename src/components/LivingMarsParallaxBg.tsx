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

  // DevicePixelRatio-scaled HTML5 Canvas rendering a diagonal Milky Way dust lane,
  // warm nebula clouds, and multi-magnitude twinkling stars
  useEffect(() => {
    const canvas = starCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let vw = window.innerWidth;
    let vh = window.innerHeight;

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      vw = window.innerWidth;
      vh = window.innerHeight;
      canvas.width = Math.floor(vw * dpr);
      canvas.height = Math.floor(vh * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 260 multi-magnitude stars + concentrated Milky Way galactic band stars
    const stars = Array.from({ length: 260 }, (_, i) => {
      const isBandStar = i < 120;
      const u = ((i * 197 + 31) % 1000) / 1000;
      const vSpread = (((i * 139 + 17) % 1000) / 1000 - 0.5) * (isBandStar ? 0.28 : 1.0);
      const x = u;
      const y = isBandStar
        ? Math.max(0.02, Math.min(0.95, 0.78 - u * 0.62 + vSpread))
        : ((i * 139 + 17) % 1000) / 1000;
      return {
        x,
        y,
        r: isBandStar ? 0.5 + (i % 3) * 0.45 : 0.65 + (i % 4) * 0.55,
        baseAlpha: isBandStar ? 0.42 + (i % 4) * 0.14 : 0.35 + (i % 5) * 0.13,
        speed: 0.02 + (i % 6) * 0.008,
        phase: i * 0.85,
        tint:
          i % 5 === 0
            ? '255, 209, 166'
            : i % 7 === 0
              ? '0, 245, 212'
              : i % 9 === 0
                ? '196, 181, 253'
                : '255, 248, 242',
      };
    });

    let tick = 0;

    const renderStars = () => {
      tick += 1;
      const w = vw;
      const h = vh;
      ctx.clearRect(0, 0, w, h);

      // Deep 8K Cosmic & Martian Night Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, '#04050B');
      skyGrad.addColorStop(0.38, '#0B0914');
      skyGrad.addColorStop(0.72, '#1A0D0C');
      skyGrad.addColorStop(1, '#33160E');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Diagonal Milky Way Galactic Core & Warm Nebula Clouds
      ctx.save();
      ctx.translate(w * 0.52, h * 0.42);
      ctx.rotate(-0.54);

      const mwOuter = ctx.createLinearGradient(0, -h * 0.36, 0, h * 0.36);
      mwOuter.addColorStop(0, 'rgba(12, 10, 24, 0)');
      mwOuter.addColorStop(0.3, 'rgba(138, 79, 56, 0.14)');
      mwOuter.addColorStop(0.5, 'rgba(255, 209, 166, 0.24)');
      mwOuter.addColorStop(0.7, 'rgba(88, 110, 168, 0.14)');
      mwOuter.addColorStop(1, 'rgba(12, 10, 24, 0)');
      ctx.fillStyle = mwOuter;
      ctx.fillRect(-w * 1.2, -h * 0.36, w * 2.4, h * 0.72);

      // Dark cosmic rift dust lane down the center of the Milky Way
      const riftGrad = ctx.createLinearGradient(0, -h * 0.08, 0, h * 0.08);
      riftGrad.addColorStop(0, 'rgba(10, 6, 9, 0)');
      riftGrad.addColorStop(0.5, 'rgba(8, 5, 10, 0.52)');
      riftGrad.addColorStop(1, 'rgba(10, 6, 9, 0)');
      ctx.fillStyle = riftGrad;
      ctx.fillRect(-w * 0.95, -h * 0.08, w * 1.9, h * 0.16);
      ctx.restore();

      // Warm Atmospheric Limb Glow on the Martian Horizon
      const limbGrad = ctx.createRadialGradient(
        w * 0.5,
        h * 0.94,
        20,
        w * 0.5,
        h * 0.94,
        w * 0.74
      );
      limbGrad.addColorStop(0, 'rgba(244, 162, 97, 0.28)');
      limbGrad.addColorStop(0.5, 'rgba(231, 111, 81, 0.12)');
      limbGrad.addColorStop(1, 'rgba(12, 7, 10, 0)');
      ctx.fillStyle = limbGrad;
      ctx.fillRect(0, 0, w, h);

      // Multi-magnitude twinkling stars
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const twinkle = Math.sin(tick * s.speed + s.phase) * 0.28;
        const alpha = Math.max(0.14, Math.min(1, s.baseAlpha + twinkle));
        ctx.fillStyle = `rgba(${s.tint}, ${alpha.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h * 0.92, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    renderStars();
    const isAutomated = typeof navigator !== 'undefined' && navigator.webdriver === true;
    const intervalId = isAutomated ? 0 : window.setInterval(renderStars, 95);

    return () => {
      if (intervalId) window.clearInterval(intervalId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  const [milkyWaySrc, setMilkyWaySrc] = useState<string>(INSIGHT_MEDIA_ASSETS.PIA22227_LOCAL);
  const [marsGlobeSrc, setMarsGlobeSrc] = useState<string>(INSIGHT_MEDIA_ASSETS.PIA26635_LOCAL);
  const [horizonSrc, setHorizonSrc] = useState<string>(INSIGHT_MEDIA_ASSETS.PIA22227_LOCAL);

  useEffect(() => {
    const isAutomated = typeof navigator !== 'undefined' && navigator.webdriver === true;
    if (isAutomated) return;

    let cancelled = false;
    const upgradeImage = (url: string, setter: (val: string) => void) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        if (!cancelled) setter(url);
      };
      img.src = url;
    };

    upgradeImage(INSIGHT_MEDIA_ASSETS.MILKY_WAY_4K, setMilkyWaySrc);
    upgradeImage(INSIGHT_MEDIA_ASSETS.PIA00407_ORIG, setMarsGlobeSrc);
    upgradeImage(INSIGHT_MEDIA_ASSETS.PIA23201_ORIG, setHorizonSrc);

    return () => {
      cancelled = true;
    };
  }, []);

  // Dynamic Parallax Offsets driven by currentPage (0..9) and vertical scrollY
  const starShiftX = -(currentPage - 4.5) * 9;
  const starShiftY = -(scrollY * 0.04);

  const milkyWayShiftX = -(currentPage - 4.5) * 15;
  const milkyWayShiftY = -(scrollY * 0.06);

  const globeShiftX = -(currentPage - 4.5) * 22;
  const globeShiftY = -(scrollY * 0.09) + (currentPage % 2 === 0 ? -10 : 10);
  const globeRotate = (currentPage - 4.5) * 3.2;

  const horizonShiftX = -(currentPage - 4.5) * 14;
  const horizonShiftY = Math.min(28, scrollY * 0.03);

  const isAutomated = typeof navigator !== 'undefined' && navigator.webdriver === true;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
    >
      {/* LAYER 1: DPR-Scaled Milky Way & Twinkling Starfield Canvas */}
      <canvas
        ref={starCanvasRef}
        style={{
          transform: `translate3d(${starShiftX}px, ${starShiftY}px, 0) scale(1.06)`,
          transition: isAutomated ? 'none' : 'transform 650ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
        className="absolute inset-0 w-full h-full block"
      />

      {/* LAYER 1B: NASA 4K Deep-Space Milky Way Star Map (SVS a003895 starmap_4k.jpg) */}
      <div
        style={{
          transform: `translate3d(${milkyWayShiftX}px, ${milkyWayShiftY}px, 0) scale(1.12)`,
          transition: isAutomated ? 'none' : 'transform 800ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
        className="absolute inset-0 opacity-30 mix-blend-screen"
      >
        <img
          src={milkyWaySrc}
          onError={(e) => handleNasaImageError(e, INSIGHT_MEDIA_ASSETS.PIA22227_LOCAL)}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>

      {/* LAYER 2: Orbital Mars Vista (NASA PIA00407~orig.jpg) with Chapter Angle Parallax */}
      <div
        style={{
          transform: `translate3d(${globeShiftX}px, ${globeShiftY}px, 0) rotate(${globeRotate}deg)`,
          transition: isAutomated ? 'none' : 'transform 850ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
        className="absolute -right-24 -top-20 w-[440px] h-[440px] sm:w-[640px] sm:h-[640px] opacity-30 mix-blend-screen"
      >
        <img
          src={marsGlobeSrc}
          onError={(e) => handleNasaImageError(e, INSIGHT_MEDIA_ASSETS.PIA00407_MARS_VISTA)}
          alt=""
          className="w-full h-full object-contain rounded-full"
        />
        <div className="absolute inset-0 rounded-full bg-radial from-transparent via-[#26130D]/35 to-[#0B0914]" />
      </div>

      {/* LAYER 3: Panoramic Martian Surface & Hills Horizon (PIA23201~orig.jpg / mera_east_hills.jpg) */}
      <div
        style={{
          transform: `translate3d(${horizonShiftX}px, ${horizonShiftY}px, 0) scale(1.08)`,
          transition: isAutomated ? 'none' : 'transform 750ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
        className="absolute bottom-0 left-0 right-0 h-[38vh] min-h-[220px] max-h-[380px] opacity-42"
      >
        <img
          src={horizonSrc}
          onError={(e) => handleNasaImageError(e, INSIGHT_MEDIA_ASSETS.MARS_EAST_HILLS_HORIZON)}
          alt=""
          className="w-full h-full object-cover object-bottom"
        />
        {/* Smooth Atmospheric Blend from Starry Sky into Martian Hills */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#120806] via-[#1E0F0A]/68 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#0B0914] to-transparent" />
      </div>
    </div>
  );
};
