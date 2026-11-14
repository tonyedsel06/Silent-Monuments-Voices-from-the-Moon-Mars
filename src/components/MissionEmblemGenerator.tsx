import React, { useEffect, useRef, useState } from 'react';
import { Language } from '../data/bilingualContent';
import { INSIGHT_MEDIA_ASSETS } from '../utils/nasaMedia';

interface MissionEmblemGeneratorProps {
  lang: Language;
  explorerName: string;
  onChangeExplorerName: (val: string) => void;
  generatedCallsign: string;
  onMintCallsign: (callsign: string) => void;
}

export const MissionEmblemGenerator: React.FC<MissionEmblemGeneratorProps> = ({
  lang,
  explorerName,
  onChangeExplorerName,
  generatedCallsign,
  onMintCallsign,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [marsCutawayImg, setMarsCutawayImg] = useState<HTMLImageElement | null>(null);
  const [downloadedNotice, setDownloadedNotice] = useState(false);

  // 4D Interactive CSS Perspective Tilt State
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 });

  // Load local CORS-clean 4K NASA Mars Cutaway image (PIA26636 / PIA22227) for the 4D Emblem
  useEffect(() => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => setMarsCutawayImg(img);
    img.src = INSIGHT_MEDIA_ASSETS.PIA26636_LOCAL;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 1200; // 4K-Grade High-DPI Aerospace Mission Badge Canvas
    const cx = size / 2;
    const cy = size / 2;

    ctx.clearRect(0, 0, size, size);

    const traceHexagon = (radius: number) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3 - Math.PI / 2;
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
    };

    // 1. Outer Metallic Gold-and-Copper Hexagonal Bevel Frame
    const outerMetallic = ctx.createLinearGradient(80, 60, 1120, 1140);
    outerMetallic.addColorStop(0, '#FFF1D0');
    outerMetallic.addColorStop(0.22, '#E07A3C');
    outerMetallic.addColorStop(0.48, '#FFE5B4');
    outerMetallic.addColorStop(0.75, '#B84A18');
    outerMetallic.addColorStop(1, '#F4A261');

    ctx.save();
    ctx.shadowColor = 'rgba(244, 162, 97, 0.55)';
    ctx.shadowBlur = 42;
    traceHexagon(552);
    ctx.fillStyle = outerMetallic;
    ctx.fill();
    ctx.restore();

    // Deep basalt inner bevel trench
    traceHexagon(518);
    ctx.fillStyle = '#1E0E09';
    ctx.fill();

    // Holographic cyan-gold inner rim
    const innerRimGrad = ctx.createLinearGradient(140, 140, 1060, 1060);
    innerRimGrad.addColorStop(0, '#FFD1A6');
    innerRimGrad.addColorStop(0.5, '#64DFDF');
    innerRimGrad.addColorStop(1, '#F4A261');
    traceHexagon(500);
    ctx.strokeStyle = innerRimGrad;
    ctx.lineWidth = 7;
    ctx.stroke();

    // 2. Clipped Interior Scene
    ctx.save();
    traceHexagon(490);
    ctx.clip();

    const spaceGrad = ctx.createRadialGradient(cx, cy - 60, 30, cx, cy, 520);
    spaceGrad.addColorStop(0, '#3D1E14');
    spaceGrad.addColorStop(0.55, '#1D0F0B');
    spaceGrad.addColorStop(1, '#0D0706');
    ctx.fillStyle = spaceGrad;
    ctx.fillRect(0, 0, size, size);

    // Subtle Martian Starfield & Dust Motes
    for (let i = 0; i < 80; i++) {
      const sx = ((i * 193) % 920) + 140;
      const sy = ((i * 137) % 860) + 160;
      const sr = (i % 3) + 1.1;
      ctx.fillStyle = i % 3 === 0 ? '#FFD1A6' : 'rgba(255, 248, 242, 0.6)';
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Central 4K Mars Core & Seismic Wave Sphere (100% Dedicated to InSight 2018-042A)
    const sphereX = cx;
    const sphereY = cy - 45;
    const sphereR = 175;

    // Glowing Concentric Seismic Wave Rings Radiating from Mars' Core
    [235, 208, 186].forEach((ringR, idx) => {
      ctx.strokeStyle =
        idx === 0
          ? 'rgba(100, 223, 223, 0.28)'
          : idx === 1
            ? 'rgba(244, 162, 97, 0.42)'
            : 'rgba(255, 209, 166, 0.65)';
      ctx.lineWidth = idx === 2 ? 3.5 : 2;
      ctx.setLineDash(idx === 1 ? [10, 6] : []);
      ctx.beginPath();
      ctx.arc(sphereX, sphereY, ringR, 0, Math.PI * 2);
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // Clipped Mars Globe with Real NASA PIA26636 Cutaway Texture + Glowing Molten Core
    ctx.save();
    ctx.beginPath();
    ctx.arc(sphereX, sphereY, sphereR, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    const marsGrad = ctx.createRadialGradient(
      sphereX - 40,
      sphereY - 40,
      20,
      sphereX,
      sphereY,
      sphereR
    );
    marsGrad.addColorStop(0, '#F7B27A');
    marsGrad.addColorStop(0.5, '#C85224');
    marsGrad.addColorStop(0.88, '#7A2510');
    marsGrad.addColorStop(1, '#3A1107');
    ctx.fillStyle = marsGrad;
    ctx.fillRect(sphereX - sphereR, sphereY - sphereR, sphereR * 2, sphereR * 2);

    if (marsCutawayImg) {
      try {
        ctx.globalAlpha = 0.85;
        ctx.drawImage(
          marsCutawayImg,
          sphereX - sphereR,
          sphereY - sphereR,
          sphereR * 2,
          sphereR * 2
        );
        ctx.globalAlpha = 1;
      } catch {
        // Fallback gradient already drawn
      }
    }

    // Inner Glowing 1,830-km Molten Core Heartbeat Arc
    const coreGlow = ctx.createRadialGradient(
      sphereX,
      sphereY + 55,
      6,
      sphereX,
      sphereY + 55,
      85
    );
    coreGlow.addColorStop(0, 'rgba(254, 240, 138, 0.92)');
    coreGlow.addColorStop(0.55, 'rgba(245, 158, 11, 0.55)');
    coreGlow.addColorStop(1, 'rgba(220, 38, 38, 0)');
    ctx.fillStyle = coreGlow;
    ctx.beginPath();
    ctx.arc(sphereX, sphereY + 55, 85, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Metallic Gold Rim around Mars Sphere
    ctx.strokeStyle = '#FFD1A6';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(sphereX, sphereY, sphereR, 0, Math.PI * 2);
    ctx.stroke();

    // 4. Embossed 3D Golden InSight Lander Silhouette Resting on Top of Mars
    const landerY = sphereY - 12;

    // Left & Right Decagonal UltraFlex Solar Wings
    [-112, 112].forEach((offsetX) => {
      const wx = sphereX + offsetX;
      const wy = landerY;
      ctx.fillStyle = '#142842';
      ctx.strokeStyle = '#FFD1A6';
      ctx.lineWidth = 4;
      ctx.beginPath();
      for (let s = 0; s < 10; s++) {
        const a = (s / 10) * Math.PI * 2;
        const px = wx + Math.cos(a) * 52;
        const py = wy + Math.sin(a) * 26;
        if (s === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Radial solar ribs
      ctx.strokeStyle = 'rgba(244, 162, 97, 0.65)';
      ctx.lineWidth = 1.8;
      for (let s = 0; s < 5; s++) {
        const a = (s / 5) * Math.PI;
        ctx.beginPath();
        ctx.moveTo(wx - Math.cos(a) * 48, wy - Math.sin(a) * 24);
        ctx.lineTo(wx + Math.cos(a) * 48, wy + Math.sin(a) * 24);
        ctx.stroke();
      }
    });

    // Central Octagonal Lander Deck
    ctx.fillStyle = '#F4A261';
    ctx.strokeStyle = '#FFF8F2';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.roundRect(sphereX - 52, landerY - 18, 104, 34, 8);
    ctx.fill();
    ctx.stroke();

    // 3 Stationary Titanium Landing Legs
    ctx.strokeStyle = '#FFE4B5';
    ctx.lineWidth = 4.5;
    [
      [-38, -56],
      [0, 0],
      [38, 56],
    ].forEach(([topX, botX]) => {
      ctx.beginPath();
      ctx.moveTo(sphereX + topX, landerY + 16);
      ctx.lineTo(sphereX + botX, landerY + 48);
      ctx.stroke();
    });

    // 1.8m Robotic Arm (IDA) & Deployed Copper SEIS Dome
    ctx.strokeStyle = '#64DFDF';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(sphereX + 18, landerY - 18);
    ctx.lineTo(sphereX + 44, landerY - 56);
    ctx.lineTo(sphereX + 78, landerY - 32);
    ctx.stroke();

    // Deployed Copper SEIS Dome on Right
    ctx.fillStyle = '#E07A3C';
    ctx.strokeStyle = '#FFD1A6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(sphereX + 86, landerY + 46, 20, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore(); // End inner hexagon clip

    // 5. Crisp, Verified Editorial Typography Positioned Inside Wide Hexagon Zone
    ctx.textAlign = 'center';

    // Top Arc Title
    ctx.fillStyle = '#FFD1A6';
    ctx.font = '800 27px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('INSIGHT: THE LAST DIARY FROM MARS', cx, 272);

    // Subtitle (Strictly "NASA SPACE APPS CHALLENGE 2026 · CHALLENGE 01")
    ctx.fillStyle = '#64DFDF';
    ctx.font = '700 18.5px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('NASA SPACE APPS CHALLENGE 2026 · CHALLENGE 01', cx, 306);

    // Center Metallic Explorer Nameplate Plaque
    const plaqueY = 726;
    const plaqueW = 700;
    const plaqueH = 82;
    ctx.fillStyle = '#180C08';
    ctx.strokeStyle = '#F4A261';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(cx - plaqueW / 2, plaqueY, plaqueW, plaqueH, 18);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FFF8F2';
    ctx.font = '700 34px "Playfair Display", Georgia, serif';
    ctx.fillText(generatedCallsign.slice(0, 26), cx, plaqueY + 53);

    // Verified InSight Telemetry Line
    ctx.fillStyle = '#64DFDF';
    ctx.font = '700 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(
      'NSSDCA ID: 2018-042A · ELYSIUM PLANITIA (4.502°N, 135.623°E) · 1,319 MARSQUAKES',
      cx,
      846
    );

    // Official Team Footer Line
    ctx.fillStyle = '#FFD1A6';
    ctx.font = '700 18.5px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('TEAM NAU EXPLORERS (ID: NS01048) · NGHE AN UNIVERSITY', cx, 884);
  }, [generatedCallsign, marsCutawayImg]);

  const handlePointerMove4D = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width; // 0..1
    const ny = (e.clientY - rect.top) / rect.height; // 0..1
    const rotateY = (nx - 0.5) * 22; // -11deg to +11deg
    const rotateX = (0.5 - ny) * 22; // -11deg to +11deg
    setTilt({
      rotateX,
      rotateY,
      glareX: Math.round(nx * 100),
      glareY: Math.round(ny * 100),
    });
  };

  const handlePointerLeave4D = () => {
    setTilt({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 });
  };

  const handleDownload4KPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const safeName = generatedCallsign.replace(/[^a-zA-Z0-9_-]/g, '-');
      link.download = `InSight-4K-Mission-Badge-${safeName}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloadedNotice(true);
      window.setTimeout(() => setDownloadedNotice(false), 3500);
    } catch {
      // Ignore if blocked
    }
  };

  return (
    <div className="rounded-2xl border border-[#F4A261]/35 nasa-basalt-glass p-4 space-y-3 shadow-2xl">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-[#64DFDF] uppercase tracking-wider">
          {lang === 'en'
            ? '4D Interactive Holographic Mission Badge · NSSDCA 2018-042A'
            : 'Huy Hiệu Sứ Mệnh Hologram 4D Tương Tác · NSSDCA 2018-042A'}
        </span>
        <span className="px-2 py-0.5 rounded-md bg-[#341C14] text-[11px] font-bold text-[#FFD1A6]">
          1200×1200 4K PNG
        </span>
      </div>

      <h3 className="text-base sm:text-lg font-bold text-[#FFF8F2]">
        {lang === 'en'
          ? 'Mint & Tilt Your 4D InSight Mission Archivist Badge'
          : 'Khắc Tên & Nghiêng Thử Huy Hiệu InSight 4D Của Bạn'}
      </h3>

      <div className="space-y-1.5">
        <label
          htmlFor="explorer-name-input"
          className="block text-xs font-semibold text-[#FFD1A6]"
        >
          {lang === 'en' ? 'Explorer Name / Callsign:' : 'Tên Nhà thám hiểm / Biệt danh:'}
        </label>
        <div className="flex flex-wrap sm:flex-nowrap gap-2">
          <input
            id="explorer-name-input"
            type="text"
            maxLength={24}
            value={explorerName}
            onChange={(e) => onChangeExplorerName(e.target.value)}
            placeholder={lang === 'en' ? 'e.g. MINH ANH' : 'VD: MINH ANH'}
            className="flex-1 min-w-[160px] px-3 py-1.5 rounded-xl bg-[#160C08] border border-[#F4A261]/35 text-xs sm:text-sm text-[#FFF8F2] focus:outline-none focus:border-[#F4A261]"
          />
          <button
            type="button"
            data-testid="engrave-crest-btn"
            onClick={() => {
              const clean = explorerName.trim();
              if (clean.length > 0) {
                onMintCallsign(clean.toUpperCase());
              }
            }}
            className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-[#F4A261] text-[#1F110C] hover:bg-[#FFD1A6] whitespace-nowrap shrink-0 transition-colors"
          >
            {lang === 'en' ? 'Engrave 4D Badge' : 'Khắc Lên Huy Hiệu 4D'}
          </button>
        </div>
      </div>

      {/* 4D Interactive Tilt Stage with Holographic Foil Glare */}
      <div className="p-3 rounded-2xl border border-[#F4A261]/25 bg-[#150B08] flex flex-col items-center space-y-2.5">
        <div
          onPointerMove={handlePointerMove4D}
          onPointerLeave={handlePointerLeave4D}
          style={{
            perspective: '900px',
          }}
          className="relative w-full max-w-[235px] aspect-square flex items-center justify-center cursor-pointer select-none"
        >
          <div
            style={{
              transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
              transition: 'transform 120ms ease-out',
              transformStyle: 'preserve-3d',
            }}
            className="relative w-full h-full rounded-2xl overflow-hidden"
          >
            <canvas
              ref={canvasRef}
              width={1200}
              height={1200}
              data-testid="mission-emblem-8k-canvas"
              className="w-full h-full block"
            />
            {/* Dynamic 4D Holographic Foil Sheen Layer */}
            <div
              style={{
                background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255, 240, 210, 0.28) 0%, rgba(100, 223, 223, 0.14) 35%, rgba(0, 0, 0, 0) 70%)`,
              }}
              className="pointer-events-none absolute inset-0 holo-foil-overlay mix-blend-screen"
            />
          </div>
        </div>

        <button
          type="button"
          data-testid="download-badge-png-btn"
          onClick={handleDownload4KPng}
          className="w-full py-2.5 px-4 text-xs font-bold rounded-xl bg-[#64DFDF] text-[#101C26] hover:bg-[#99F6E4] transition-colors shadow-lg"
        >
          {downloadedNotice
            ? lang === 'en'
              ? '✓ 4K Mission Badge PNG Downloaded!'
              : '✓ Đã Tải Xuống Huy Hiệu Sứ Mệnh 4K (PNG)!'
            : lang === 'en'
              ? 'Download 4K Mission Badge (PNG)'
              : 'Tải Xuống Huy Hiệu Sứ Mệnh 4K (PNG)'}
        </button>
      </div>
    </div>
  );
};
