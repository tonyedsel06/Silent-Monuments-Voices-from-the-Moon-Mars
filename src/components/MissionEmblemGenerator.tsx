import React, { useEffect, useRef, useState } from 'react';
import { Language } from '../data/bilingualContent';
import { PLANETARY_MOSAIC_URLS } from '../utils/nasaMedia';

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
  const [moonImg, setMoonImg] = useState<HTMLImageElement | null>(null);
  const [downloadedNotice, setDownloadedNotice] = useState(false);

  // Preload CORS-enabled real Lunar LRO imagery for the emblem canvas
  useEffect(() => {
    const lImg = new Image();
    lImg.crossOrigin = 'anonymous';
    lImg.decoding = 'async';
    lImg.onload = () => setMoonImg(lImg);
    lImg.src = PLANETARY_MOSAIC_URLS.corsWebglMoon;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 1200; // Ultra-sharp high-DPI aerospace emblem canvas
    const cx = size / 2;
    const cy = size / 2;

    ctx.clearRect(0, 0, size, size);

    // Helper for regular hexagon path
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
    const outerMetallic = ctx.createLinearGradient(100, 80, 1100, 1120);
    outerMetallic.addColorStop(0, '#FFE4B5');
    outerMetallic.addColorStop(0.25, '#D97724');
    outerMetallic.addColorStop(0.5, '#FFF3D6');
    outerMetallic.addColorStop(0.75, '#B8541A');
    outerMetallic.addColorStop(1, '#F4A261');

    ctx.save();
    ctx.shadowColor = 'rgba(244, 162, 97, 0.45)';
    ctx.shadowBlur = 36;
    traceHexagon(545);
    ctx.fillStyle = outerMetallic;
    ctx.fill();
    ctx.restore();

    // Dark bronze inner bevel trench
    traceHexagon(512);
    ctx.fillStyle = '#2B150E';
    ctx.fill();

    // Secondary copper-gold inner rim
    traceHexagon(494);
    ctx.strokeStyle = '#FFD1A6';
    ctx.lineWidth = 6;
    ctx.stroke();

    // 2. Deep-Space Starry Core clipped inside Hexagon
    ctx.save();
    traceHexagon(484);
    ctx.clip();

    const spaceGrad = ctx.createRadialGradient(cx, cy - 80, 40, cx, cy, 520);
    spaceGrad.addColorStop(0, '#3D2016');
    spaceGrad.addColorStop(0.55, '#1E131A');
    spaceGrad.addColorStop(1, '#0F1624');
    ctx.fillStyle = spaceGrad;
    ctx.fillRect(0, 0, size, size);

    // Subtle starfield
    for (let i = 0; i < 75; i++) {
      const sx = ((i * 197) % 920) + 140;
      const sy = ((i * 131) % 860) + 160;
      const sr = (i % 3) + 1.2;
      ctx.fillStyle = i % 4 === 0 ? '#FFD1A6' : 'rgba(255, 248, 242, 0.65)';
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }

    // Celestial golden sun-burst behind Mars & Moon
    const burstGrad = ctx.createRadialGradient(cx, cy - 45, 10, cx, cy - 45, 320);
    burstGrad.addColorStop(0, 'rgba(255, 209, 166, 0.32)');
    burstGrad.addColorStop(0.6, 'rgba(244, 162, 97, 0.10)');
    burstGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = burstGrad;
    ctx.beginPath();
    ctx.arc(cx, cy - 45, 320, 0, Math.PI * 2);
    ctx.fill();

    // 3. Left Orb: High-Resolution Martian Sphere (Elysium Planitia, Valles Marineris & Polar Cap)
    const marsX = cx - 155;
    const marsY = cy - 55;
    const marsR = 122;

    ctx.save();
    ctx.beginPath();
    ctx.arc(marsX, marsY, marsR, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    const marsFallback = ctx.createRadialGradient(
      marsX - 35,
      marsY - 35,
      15,
      marsX,
      marsY,
      marsR
    );
    marsFallback.addColorStop(0, '#F7B27A');
    marsFallback.addColorStop(0.5, '#D1602B');
    marsFallback.addColorStop(0.85, '#7E2B14');
    marsFallback.addColorStop(1, '#3D1308');
    ctx.fillStyle = marsFallback;
    ctx.fillRect(marsX - marsR, marsY - marsR, marsR * 2, marsR * 2);

    // Martian North Polar Ice Cap & Albedo Terrains (Syrtis Major, Valles Marineris, Elysium)
    ctx.fillStyle = 'rgba(255, 242, 230, 0.72)';
    ctx.beginPath();
    ctx.ellipse(marsX, marsY - marsR + 12, 56, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(72, 22, 12, 0.55)';
    ctx.beginPath();
    ctx.ellipse(marsX + 24, marsY + 12, 48, 22, -0.25, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(52, 14, 8, 0.75)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(marsX - 65, marsY + 8);
    ctx.quadraticCurveTo(marsX - 10, marsY + 18, marsX + 45, marsY + 4);
    ctx.stroke();

    // InSight Landing Beacon on Elysium Planitia
    ctx.fillStyle = '#FFD1A6';
    ctx.beginPath();
    ctx.arc(marsX + 32, marsY - 18, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Mars metallic copper halo ring
    ctx.strokeStyle = '#F4A261';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(marsX, marsY, marsR + 3, 0, Math.PI * 2);
    ctx.stroke();

    // 4. Right Orb: Real NASA Moon Imagery (Apollo 11 LRRR 1969-059C)
    const moonX = cx + 175;
    const moonY = cy - 75;
    const moonR = 88;

    ctx.save();
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    const moonFallback = ctx.createRadialGradient(
      moonX - 25,
      moonY - 25,
      10,
      moonX,
      moonY,
      moonR
    );
    moonFallback.addColorStop(0, '#F1F5F9');
    moonFallback.addColorStop(0.6, '#94A3B8');
    moonFallback.addColorStop(1, '#334155');
    ctx.fillStyle = moonFallback;
    ctx.fillRect(moonX - moonR, moonY - moonR, moonR * 2, moonR * 2);

    if (moonImg) {
      try {
        ctx.drawImage(moonImg, moonX - moonR, moonY - moonR, moonR * 2, moonR * 2);
      } catch {
        // fallback gradient already drawn
      }
    }
    ctx.restore();

    // Moon lunar-cyan halo ring
    ctx.strokeStyle = '#64DFDF';
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR + 3, 0, Math.PI * 2);
    ctx.stroke();

    // 5. Golden-Cyan Optical & Seismic Telemetry Arc linking Mars and the Moon
    const arcGrad = ctx.createLinearGradient(marsX, marsY, moonX, moonY);
    arcGrad.addColorStop(0, '#FFD1A6');
    arcGrad.addColorStop(1, '#64DFDF');
    ctx.strokeStyle = arcGrad;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(marsX + 45, marsY - 15);
    ctx.quadraticCurveTo(cx + 15, cy - 210, moonX - 35, moonY - 10);
    ctx.stroke();

    // Stylized InSight SEIS Copper Dome Silhouette at bottom of Mars orb
    ctx.fillStyle = '#E07A3C';
    ctx.strokeStyle = '#FFD1A6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy + 52, 42, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore(); // End inner hexagon clip

    // 6. Crisp, Non-Overlapping Editorial Typography Banners
    ctx.textAlign = 'center';

    // Top Header Title inside Crest
    ctx.fillStyle = '#FFD1A6';
    ctx.font = '700 26px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('SILENT MONUMENTS', cx, 235);

    ctx.fillStyle = '#64DFDF';
    ctx.font = '600 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('VOICES FROM THE MOON & MARS · SPACE APPS 2026', cx, 268);

    // Center Metallic Nameplate Plaque
    const plaqueY = 710;
    const plaqueW = 720;
    const plaqueH = 92;
    ctx.fillStyle = '#1D100B';
    ctx.strokeStyle = '#F4A261';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(cx - plaqueW / 2, plaqueY, plaqueW, plaqueH, 18);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FFF8F2';
    ctx.font = '700 36px "Playfair Display", Georgia, serif';
    ctx.fillText(generatedCallsign.slice(0, 26), cx, plaqueY + 58);

    // Lower Verified NSSDCA & Team Credits
    ctx.fillStyle = '#64DFDF';
    ctx.font = '600 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('NSSDCA: 2018-042A · 2003-032A · 1969-059C', cx, 858);

    ctx.fillStyle = '#FFD1A6';
    ctx.font = '700 21px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('TEAM NAU EXPLORERS · ID: NS01048', cx, 902);

    ctx.fillStyle = 'rgba(255, 248, 242, 0.78)';
    ctx.font = '500 17px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('NGHE AN UNIVERSITY · HANOI 2026', cx, 938);
  }, [generatedCallsign, moonImg]);

  const handleDownloadHighResPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const safeName = generatedCallsign.replace(/[^a-zA-Z0-9_-]/g, '-');
      link.download = `Silent-Monuments-Emblem-${safeName}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloadedNotice(true);
      window.setTimeout(() => setDownloadedNotice(false), 3500);
    } catch {
      // Fallback if browser blocks download
    }
  };

  return (
    <div className="rounded-2xl border border-[#F4A261]/30 bg-[#23140F]/95 p-5 space-y-4 shadow-2xl">
      <div className="text-xs font-bold text-[#64DFDF] uppercase tracking-wider">
        {lang === 'en'
          ? '8K Aerospace Mission Emblem · Custom Patch Studio'
          : 'Huy Hiệu Sứ Mệnh Không Gian 8K · Tạo Huy Hiệu Cá Nhân'}
      </div>
      <h3 className="text-xl font-bold text-[#FFF8F2]">
        {lang === 'en'
          ? 'Mint & Download Your Off-World Archivist Emblem'
          : 'Tạo & Tải Xuống Huy Hiệu Nhà Thám Hiểm Hành Tinh'}
      </h3>
      <p className="text-xs text-[#F3E5D8]/85 leading-relaxed">
        {lang === 'en'
          ? 'Enter your name or callsign to engrave a high-resolution metallic copper-and-gold mission crest featuring real NASA Mars & Moon imagery.'
          : 'Nhập tên hoặc biệt danh của bạn để khắc lên huy hiệu kim loại đồng – vàng độ phân giải cao kết hợp ảnh chụp Sao Hỏa và Mặt Trăng thật của NASA.'}
      </p>

      <div className="space-y-2">
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
            maxLength={26}
            value={explorerName}
            onChange={(e) => onChangeExplorerName(e.target.value)}
            placeholder={lang === 'en' ? 'e.g. Minh Anh · Grade 8' : 'VD: Minh Anh · Lớp 8A'}
            className="flex-1 min-w-[180px] px-3.5 py-2 rounded-xl bg-[#160C08] border border-[#F4A261]/35 text-sm text-[#FFF8F2] focus:outline-none focus:border-[#F4A261]"
          />
          <button
            type="button"
            onClick={() => {
              const clean = explorerName.trim();
              if (clean.length > 0) {
                onMintCallsign(clean.toUpperCase());
              }
            }}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-[#F4A261] text-[#1F110C] hover:bg-[#FFD1A6] whitespace-nowrap shrink-0 transition-colors"
          >
            {lang === 'en' ? 'Engrave Crest' : 'Khắc Tên Lên Huy Hiệu'}
          </button>
        </div>
      </div>

      {/* High-Resolution 1200x1200 Aerospace Emblem Canvas */}
      <div className="p-3.5 rounded-2xl border border-[#F4A261]/25 bg-[#170D09] flex flex-col items-center space-y-3">
        <canvas
          ref={canvasRef}
          width={1200}
          height={1200}
          data-testid="mission-emblem-8k-canvas"
          className="w-full max-w-[265px] aspect-square block rounded-xl"
        />

        <button
          type="button"
          data-testid="download-badge-png-btn"
          onClick={handleDownloadHighResPng}
          className="w-full py-2.5 px-4 text-xs font-bold rounded-xl bg-[#64DFDF] text-[#111C28] hover:bg-[#99F6E4] transition-colors shadow-lg"
        >
          {downloadedNotice
            ? lang === 'en'
              ? '✓ High-Res PNG Emblem Downloaded!'
              : '✓ Đã Tải Xuống Huy Hiệu PNG Độ Phân Giải Cao!'
            : lang === 'en'
              ? 'Download High-Res Badge (PNG)'
              : 'Tải Xuống Huy Hiệu Độ Phân Giải Cao (PNG)'}
        </button>
      </div>
    </div>
  );
};
