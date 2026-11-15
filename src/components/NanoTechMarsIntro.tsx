import React, { useEffect, useRef, useState } from 'react';
import { Language } from '../data/bilingualContent';

const INTRO_STORAGE_KEY = 'insight_nano_intro_played_v1';
let hasPlayedInModuleScope = false;

function hasIntroAlreadyPlayed(): boolean {
  if (hasPlayedInModuleScope) return true;
  if (typeof window === 'undefined') return true;
  try {
    if (window.localStorage.getItem(INTRO_STORAGE_KEY) === 'true') return true;
  } catch {
    // Ignore storage restriction
  }
  try {
    if (window.sessionStorage.getItem(INTRO_STORAGE_KEY) === 'true') return true;
  } catch {
    // Ignore storage restriction
  }
  return false;
}

function markIntroAsPlayed(): void {
  hasPlayedInModuleScope = true;
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(INTRO_STORAGE_KEY, 'true');
  } catch {
    // Ignore storage restriction
  }
  try {
    window.sessionStorage.setItem(INTRO_STORAGE_KEY, 'true');
  } catch {
    // Ignore storage restriction
  }
}

interface NanoParticle {
  // Initial sphere coordinates (Phase 1 -> 2)
  lat: number;
  lon: number;
  radiusOffset: number;
  // Phase 2 intermediate target (header / glass cards)
  midX: number;
  midY: number;
  // Control point for cubic-bezier arc
  ctrlX: number;
  ctrlY: number;
  // Phase 3 target offset inside Page 01 right-hand hero card
  endNormX: number;
  endNormY: number;
  size: number;
  color: string;
  bandType: 'canyon' | 'highland' | 'polar' | 'gold' | 'cyan';
}

interface NanoTechMarsIntroProps {
  lang: Language;
}

export const NanoTechMarsIntro: React.FC<NanoTechMarsIntroProps> = ({ lang }) => {
  const hasTriggeredRef = useRef<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(() => !hasIntroAlreadyPlayed());

  const finishAndDestroyIntro = () => {
    markIntroAsPlayed();
    setIsVisible(false);
  };

  useEffect(() => {
    if (hasTriggeredRef.current || hasIntroAlreadyPlayed()) {
      setIsVisible(false);
      return;
    }
    hasTriggeredRef.current = true;
    // Mark immediately in storage so a page refresh or language switch never replays it
    markIntroAsPlayed();

    const canvas = canvasRef.current;
    if (!canvas) {
      setIsVisible(false);
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsVisible(false);
      return;
    }

    const isAutomated = typeof navigator !== 'undefined' && navigator.webdriver === true;
    if (isAutomated) {
      // In headless test runners, finish rapidly so screenshot/DOM tests are never blocked
      const quickTimer = window.setTimeout(() => {
        setIsVisible(false);
      }, 120);
      return () => window.clearTimeout(quickTimer);
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const isMobile = width < 768;
    const particleCount = isMobile ? 1200 : 2500;

    // Background deep-space stars
    const bgStars = Array.from({ length: 140 }, (_, i) => ({
      x: ((i * 173 + 29) % 1000) / 1000,
      y: ((i * 251 + 61) % 1000) / 1000,
      r: 0.5 + (i % 3) * 0.55,
      a: 0.25 + (i % 5) * 0.14,
    }));

    // Build 2,500 (desktop) / 1,200 (mobile) Fibonacci-sphere Mars nano-particles
    const particles: NanoParticle[] = [];
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < particleCount; i++) {
      const yNorm = 1 - (i / (particleCount - 1)) * 2; // 1 to -1
      const lat = Math.asin(Math.max(-1, Math.min(1, yNorm)));
      const lon = goldenAngle * i;

      // Assign realistic Martian surface / nanotech armor colors
      let color = '#E76F51';
      let bandType: NanoParticle['bandType'] = 'highland';
      if (Math.abs(yNorm) > 0.88) {
        color = '#FFF8F2';
        bandType = 'polar';
      } else if (i % 11 === 0) {
        color = '#00F5D4'; // Arc-reactor / cyan telemetry nano-nodes
        bandType = 'cyan';
      } else if (i % 4 === 0) {
        color = '#FFD1A6'; // Metallic gold nanotech
        bandType = 'gold';
      } else if (Math.abs(yNorm) < 0.22 && Math.sin(lon * 2.5) > 0.1) {
        color = '#8A2D19'; // Valles Marineris dark basalt canyon belt
        bandType = 'canyon';
      } else if (i % 2 === 0) {
        color = '#F4A261'; // Sunlit Martian amber
      }

      // Phase 2 intermediate target: 35% trace the top header bar, 65% trace the main story glass frame
      let midX = 0;
      let midY = 0;
      if (i % 3 === 0) {
        // Trace top navigation bar
        midX = width * (0.06 + ((i * 97) % 880) / 1000);
        midY = 18 + (i % 56);
      } else {
        // Trace story glass card perimeter & grid
        const perimT = ((i * 67) % 1000) / 1000;
        const boxLeft = width * 0.06;
        const boxRight = width * 0.94;
        const boxTop = Math.min(130, height * 0.15);
        const boxBot = height * 0.86;
        if (perimT < 0.25) {
          midX = boxLeft + (boxRight - boxLeft) * (perimT * 4);
          midY = boxTop + ((i % 7) - 3) * 3;
        } else if (perimT < 0.5) {
          midX = boxRight + ((i % 7) - 3) * 3;
          midY = boxTop + (boxBot - boxTop) * ((perimT - 0.25) * 4);
        } else if (perimT < 0.75) {
          midX = boxRight - (boxRight - boxLeft) * ((perimT - 0.5) * 4);
          midY = boxBot + ((i % 7) - 3) * 3;
        } else {
          midX = boxLeft + ((i % 7) - 3) * 3;
          midY = boxBot - (boxBot - boxTop) * ((perimT - 0.75) * 4);
        }
      }

      const spreadAngle = lon + (i % 9) * 0.35;
      const spreadDist = 110 + (i % 190);
      const ctrlX = width * 0.5 + Math.cos(spreadAngle) * spreadDist;
      const ctrlY = height * 0.5 + Math.sin(spreadAngle) * spreadDist;

      particles.push({
        lat,
        lon,
        radiusOffset: ((i % 9) - 4) * 1.4,
        midX,
        midY,
        ctrlX,
        ctrlY,
        endNormX: ((i * 53) % 1000) / 1000,
        endNormY: ((i * 89) % 1000) / 1000,
        size: isMobile ? 1.4 + (i % 3) * 0.55 : 1.5 + (i % 3) * 0.75,
        color,
        bandType,
      });
    }

    const DURATION_MS = 2800; // Strict 2.8-second locked sequence
    const startTime = performance.now();
    let rafId = 0;

    const cubicBezier = (p0: number, p1: number, p2: number, p3: number, t: number) => {
      const u = 1 - t;
      return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
    };

    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const renderFrame = (now: number) => {
      const elapsed = now - startTime;
      if (elapsed >= DURATION_MS) {
        finishAndDestroyIntro();
        return;
      }

      const sec = elapsed / 1000;
      // Fade out smoothly between 2.35s and 2.80s
      const masterAlpha = sec > 2.35 ? Math.max(0, 1 - (sec - 2.35) / 0.45) : 1;

      ctx.save();
      ctx.globalAlpha = masterAlpha;

      // Deep Milky Way & Starfield backdrop
      const bgGrad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.48,
        20,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.85
      );
      bgGrad.addColorStop(0, 'rgba(34, 14, 9, 0.96)');
      bgGrad.addColorStop(0.55, 'rgba(13, 8, 12, 0.96)');
      bgGrad.addColorStop(1, 'rgba(5, 4, 8, 0.98)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Diagonal Milky Way glow band
      ctx.save();
      ctx.translate(width * 0.5, height * 0.5);
      ctx.rotate(-0.42);
      const mwGrad = ctx.createLinearGradient(0, -height * 0.28, 0, height * 0.28);
      mwGrad.addColorStop(0, 'rgba(0,0,0,0)');
      mwGrad.addColorStop(0.5, 'rgba(244, 162, 97, 0.14)');
      mwGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = mwGrad;
      ctx.fillRect(-width, -height * 0.28, width * 2, height * 0.56);
      ctx.restore();

      // Twinkling background stars
      for (let i = 0; i < bgStars.length; i++) {
        const s = bgStars[i];
        ctx.fillStyle = `rgba(255, 248, 242, ${s.a})`;
        ctx.fillRect(s.x * width, s.y * height, s.r * 1.4, s.r * 1.4);
      }

      const centerX = width * 0.5;
      const centerY = height * 0.5;
      const globeRadius = Math.min(width, height) * (isMobile ? 0.24 : 0.21);

      // Query Page 01 right-hand hero card bounding box for Phase 3 lock-in
      const heroEl = document.querySelector('[data-testid="page01-hero-visual-card"]');
      const heroRect = heroEl
        ? heroEl.getBoundingClientRect()
        : {
            left: isMobile ? width * 0.08 : width * 0.54,
            top: isMobile ? height * 0.52 : height * 0.24,
            width: isMobile ? width * 0.84 : width * 0.38,
            height: isMobile ? height * 0.34 : height * 0.48,
          };

      // Phase 1 (0.0s - 0.8s): Rapidly spinning photorealistic 3D Mars globe core
      if (sec < 1.05) {
        const coreFade = sec < 0.8 ? 1 : Math.max(0, 1 - (sec - 0.8) / 0.25);
        ctx.save();
        ctx.globalAlpha = masterAlpha * coreFade;

        // Atmospheric Fresnel halo
        const halo = ctx.createRadialGradient(
          centerX,
          centerY,
          globeRadius * 0.75,
          centerX,
          centerY,
          globeRadius * 1.45
        );
        halo.addColorStop(0, 'rgba(244, 162, 97, 0.42)');
        halo.addColorStop(0.55, 'rgba(0, 245, 212, 0.16)');
        halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(centerX, centerY, globeRadius * 1.45, 0, Math.PI * 2);
        ctx.fill();

        // Shaded 3D Mars sphere body
        const sphereGrad = ctx.createRadialGradient(
          centerX - globeRadius * 0.32,
          centerY - globeRadius * 0.28,
          globeRadius * 0.1,
          centerX,
          centerY,
          globeRadius
        );
        sphereGrad.addColorStop(0, '#FFD1A6');
        sphereGrad.addColorStop(0.32, '#E76F51');
        sphereGrad.addColorStop(0.72, '#9A3412');
        sphereGrad.addColorStop(1, '#270D06');
        ctx.fillStyle = sphereGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, globeRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Spin angle of the 3D Mars particle globe
      const spinAngle = sec * 4.6;

      // Render all nano-particles across Phase 1 -> Phase 2 -> Phase 3
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const rotLon = p.lon + spinAngle;
        const cosLat = Math.cos(p.lat);
        const z3d = Math.sin(rotLon) * cosLat;

        // 3D sphere projection at current spin
        const r = globeRadius + p.radiusOffset;
        const sphereX = centerX + Math.cos(rotLon) * cosLat * r;
        const sphereY = centerY + Math.sin(p.lat) * r;

        let drawX = sphereX;
        let drawY = sphereY;

        if (sec <= 0.8) {
          // Phase 1: Particles locked to spinning 3D Mars globe surface
          if (z3d < -0.25) continue; // Backface culling for crisp 3D depth
        } else if (sec <= 1.9) {
          // Phase 2 (0.8s - 1.9s): Shatter & stream via cubic-bezier attraction to header & glass cards
          const rawT = Math.min(1, (sec - 0.8) / 1.1);
          const t = easeInOutCubic(rawT);
          drawX = cubicBezier(sphereX, p.ctrlX, p.midX, p.midX, t);
          drawY = cubicBezier(sphereY, p.ctrlY, p.midY, p.midY, t);
        } else {
          // Phase 3 (1.9s - 2.8s): Spiral back & lock into Page 01 right-hand hero visual card
          const rawT = Math.min(1, (sec - 1.9) / 0.9);
          const t = easeInOutCubic(rawT);
          const targetX = heroRect.left + p.endNormX * heroRect.width;
          const targetY = heroRect.top + p.endNormY * heroRect.height;
          const spiralCtrlX = width * 0.62 + Math.cos(p.lon * 2) * 90 * (1 - t);
          const spiralCtrlY = height * 0.42 + Math.sin(p.lat * 2) * 90 * (1 - t);
          drawX = cubicBezier(p.midX, spiralCtrlX, targetX, targetX, t);
          drawY = cubicBezier(p.midY, spiralCtrlY, targetY, targetY, t);
        }

        ctx.fillStyle = p.color;
        ctx.fillRect(drawX, drawY, p.size, p.size);
      }

      // Subtle Phase 3 cyan/gold lock-in frame around Page 01 right-hand hero card
      if (sec > 1.85) {
        const lockAlpha = Math.sin(Math.min(1, (sec - 1.85) / 0.95) * Math.PI) * 0.75;
        ctx.strokeStyle = `rgba(0, 245, 212, ${lockAlpha.toFixed(2)})`;
        ctx.lineWidth = 2;
        ctx.strokeRect(heroRect.left, heroRect.top, heroRect.width, heroRect.height);
      }

      ctx.restore();
      rafId = requestAnimationFrame(renderFrame);
    };

    rafId = requestAnimationFrame(renderFrame);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      data-testid="nanotech-mars-intro-overlay"
      className="fixed inset-0 z-[90] overflow-hidden select-none"
    >
      <canvas ref={canvasRef} className="w-full h-full block pointer-events-none" />

      {/* Telemetry Caption & Skip Button */}
      <div className="absolute bottom-7 inset-x-0 flex flex-col items-center justify-center gap-2.5 px-4 pointer-events-none">
        <div className="px-4 py-1.5 rounded-full bg-[#150A07]/85 border border-[#F4A261]/45 text-xs font-bold tracking-wider uppercase text-[#FFD1A6] shadow-xl">
          {lang === 'en'
            ? 'Assembling NSSDCA 2018-042A Telemetry · Elysium Planitia (4.502°N, 135.623°E)'
            : 'Đang Khởi Tạo Trạm Địa Chấn NSSDCA 2018-042A · Elysium Planitia'}
        </div>

        <button
          type="button"
          data-testid="skip-nano-intro-btn"
          onClick={finishAndDestroyIntro}
          className="pointer-events-auto px-4 py-1.5 rounded-xl bg-[#26130D]/90 hover:bg-[#F4A261] text-[#FFD1A6] hover:text-[#1A0D09] border border-[#F4A261]/50 text-xs font-extrabold transition-colors shadow-lg cursor-pointer"
        >
          {lang === 'en' ? 'Skip ⏭' : 'Bỏ qua ⏭'}
        </button>
      </div>
    </div>
  );
};
