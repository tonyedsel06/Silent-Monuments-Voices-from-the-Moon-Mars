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
  const [dioramaImg, setDioramaImg] = useState<HTMLImageElement | null>(null);
  const [downloadedNotice, setDownloadedNotice] = useState(false);

  // Interactive CSS Perspective Tilt State
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 });

  // Load local CORS-clean Photorealistic Mars + InSight Diorama image (/assets/aistudio/image_89fb51ee.png)
  useEffect(() => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => setDioramaImg(img);
    img.src = INSIGHT_MEDIA_ASSETS.MARS_INSIGHT_DIORAMA_LOCAL;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = canvas.width / 1200;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const size = 1200; // Logical 1200x1200 coordinate space
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

    // 1. Outer Polished Metallic Copper-and-Gold Hexagonal Aerospace Frame
    const outerMetallic = ctx.createLinearGradient(80, 60, 1120, 1140);
    outerMetallic.addColorStop(0, '#FFF4D6');
    outerMetallic.addColorStop(0.2, '#E07A3C');
    outerMetallic.addColorStop(0.48, '#FFE8B8');
    outerMetallic.addColorStop(0.75, '#B84A18');
    outerMetallic.addColorStop(1, '#F4A261');

    ctx.save();
    ctx.shadowColor = 'rgba(244, 162, 97, 0.58)';
    ctx.shadowBlur = 44;
    traceHexagon(562);
    ctx.fillStyle = outerMetallic;
    ctx.fill();
    ctx.restore();

    // Deep obsidian inner bevel trench
    traceHexagon(528);
    ctx.fillStyle = '#0B0810';
    ctx.fill();

    // Precision gold-cyan inner rim
    const innerRimGrad = ctx.createLinearGradient(140, 140, 1060, 1060);
    innerRimGrad.addColorStop(0, '#FFD1A6');
    innerRimGrad.addColorStop(0.5, '#00F5D4');
    innerRimGrad.addColorStop(1, '#F4A261');
    traceHexagon(512);
    ctx.strokeStyle = innerRimGrad;
    ctx.lineWidth = 6.5;
    ctx.stroke();

    // 2. Clipped Interior Scene: Milky Way Galaxy & Twinkling Star Cluster
    ctx.save();
    traceHexagon(504);
    ctx.clip();

    const spaceGrad = ctx.createRadialGradient(cx, cy - 40, 30, cx, cy, 540);
    spaceGrad.addColorStop(0, '#1C1118');
    spaceGrad.addColorStop(0.52, '#0B0912');
    spaceGrad.addColorStop(1, '#040408');
    ctx.fillStyle = spaceGrad;
    ctx.fillRect(0, 0, size, size);

    // Diagonal Milky Way Galactic Core & Nebula Dust Lane inside Hexagon
    ctx.save();
    ctx.translate(cx, cy - 40);
    ctx.rotate(-0.48);
    const mwGrad = ctx.createLinearGradient(0, -240, 0, 240);
    mwGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    mwGrad.addColorStop(0.32, 'rgba(180, 96, 58, 0.20)');
    mwGrad.addColorStop(0.5, 'rgba(255, 218, 178, 0.32)');
    mwGrad.addColorStop(0.68, 'rgba(92, 130, 196, 0.18)');
    mwGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = mwGrad;
    ctx.fillRect(-620, -240, 1240, 480);
    ctx.restore();

    // Multi-Magnitude Star Cluster
    for (let i = 0; i < 160; i++) {
      const sx = ((i * 193 + 47) % 940) + 130;
      const sy = ((i * 137 + 29) % 900) + 140;
      const sr = (i % 3) * 0.75 + 0.9;
      ctx.fillStyle =
        i % 5 === 0
          ? '#FFD1A6'
          : i % 7 === 0
            ? '#00F5D4'
            : 'rgba(255, 248, 242, 0.75)';
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Centerpiece Logo: Photorealistic Mars + Deployed InSight Diorama Cluster (y: 310..695)
    const boxW = 680;
    const boxH = 382;
    const boxX = cx - boxW / 2;
    const boxY = 308;

    if (dioramaImg) {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxW, boxH, 28);
      ctx.clip();

      // Draw the photorealistic Mars + InSight Diorama (image_89fb51ee.png)
      ctx.drawImage(dioramaImg, boxX, boxY, boxW, boxH);

      // Subtle vignette feathering around the diorama rectangle so it blends naturally into the badge
      const edgeGrad = ctx.createRadialGradient(
        cx,
        boxY + boxH * 0.5,
        boxH * 0.34,
        cx,
        boxY + boxH * 0.5,
        boxW * 0.54
      );
      edgeGrad.addColorStop(0, 'rgba(0,0,0,0)');
      edgeGrad.addColorStop(0.82, 'rgba(7, 6, 12, 0.18)');
      edgeGrad.addColorStop(1, 'rgba(7, 6, 12, 0.85)');
      ctx.fillStyle = edgeGrad;
      ctx.fillRect(boxX, boxY, boxW, boxH);
      ctx.restore();

      // Delicate copper-gold border around the diorama stage
      ctx.strokeStyle = 'rgba(244, 162, 97, 0.38)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxW, boxH, 28);
      ctx.stroke();
    } else {
      // High-detail procedural Mars + InSight Terrain Block Diorama while image decodes
      const marsX = cx - 145;
      const marsY = boxY + 185;
      const marsR = 128;
      const marsGrad = ctx.createRadialGradient(
        marsX - 38,
        marsY - 38,
        14,
        marsX,
        marsY,
        marsR
      );
      marsGrad.addColorStop(0, '#FFD1A6');
      marsGrad.addColorStop(0.35, '#E76F51');
      marsGrad.addColorStop(0.75, '#9A3412');
      marsGrad.addColorStop(1, '#2B0E06');
      ctx.fillStyle = marsGrad;
      ctx.beginPath();
      ctx.arc(marsX, marsY, marsR, 0, Math.PI * 2);
      ctx.fill();

      // Isometric Martian terrain block on the right
      const tx = cx + 75;
      const ty = boxY + 215;
      ctx.fillStyle = '#B8542C';
      ctx.beginPath();
      ctx.moveTo(tx, ty - 75);
      ctx.lineTo(tx + 170, ty + 5);
      ctx.lineTo(tx, ty + 85);
      ctx.lineTo(tx - 170, ty + 5);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore(); // End inner hexagon clip

    // 4. STRICT TEXT HIERARCHY & EXACT WORDING (Top to Bottom, Centered, Zero Overlap)
    ctx.textAlign = 'center';

    // Line 1 (Main Title): "InSight’s Last Diary"
    ctx.fillStyle = '#FFF8F2';
    ctx.font = '800 38px "Outfit", "Plus Jakarta Sans", sans-serif';
    ctx.fillText('InSight’s Last Diary', cx, 236);

    // Line 2 (Subtitle): "The Hardware Fell Silent. The Discoveries Did Not."
    ctx.fillStyle = '#FFD1A6';
    ctx.font = '700 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('The Hardware Fell Silent. The Discoveries Did Not.', cx, 276);

    // Name Plate Box: [User's Custom Explorer Name, e.g., MINH ANH]
    const plaqueY = 710;
    const plaqueW = 660;
    const plaqueH = 76;
    ctx.fillStyle = '#120A0A';
    ctx.strokeStyle = '#F4A261';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(cx - plaqueW / 2, plaqueY, plaqueW, plaqueH, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FFF8F2';
    ctx.font = '800 34px "Outfit", "Plus Jakarta Sans", sans-serif';
    ctx.fillText(generatedCallsign.slice(0, 26), cx, plaqueY + 50);

    // Line 3 (Below Name): "NASA SPACE APPS CHALLENGE 2026"
    ctx.fillStyle = '#00F5D4';
    ctx.font = '800 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('NASA SPACE APPS CHALLENGE 2026', cx, 826);

    // Line 4: "ELYSIUM PLANITIA (4.502°N, 135.623°E) · 1,319 MARSQUAKES"
    ctx.fillStyle = '#F3E5D8';
    ctx.font = '700 17px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('ELYSIUM PLANITIA (4.502°N, 135.623°E) · 1,319 MARSQUAKES', cx, 864);

    // Line 5 (Bottom Footer): "TEAM NAU EXPLORERS"
    ctx.fillStyle = '#FFD1A6';
    ctx.font = '800 21px "Outfit", "Plus Jakarta Sans", sans-serif';
    ctx.fillText('TEAM NAU EXPLORERS', cx, 904);
  }, [generatedCallsign, dioramaImg]);

  const handlePointerMoveTilt = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;
    const rotateY = (nx - 0.5) * 22;
    const rotateX = (0.5 - ny) * 22;
    setTilt({
      rotateX,
      rotateY,
      glareX: Math.round(nx * 100),
      glareY: Math.round(ny * 100),
    });
  };

  const handlePointerLeaveTilt = () => {
    setTilt({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 });
  };

  const handleDownloadBadgePng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const safeName = generatedCallsign.replace(/[^a-zA-Z0-9_-]/g, '-');
      link.download = `InSight-Mission-Badge-${safeName}.png`;
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
    <div className="rounded-2xl border border-[#F4A261]/35 bg-[#120A0D]/95 p-4 space-y-3 shadow-2xl">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-[#00F5D4] uppercase tracking-wider">
          {lang === 'en'
            ? 'Interactive Holographic Mission Badge · NSSDCA 2018-042A'
            : 'Huy hiệu sứ mệnh Hologram tương tác · NSSDCA 2018-042A'}
        </span>
      </div>

      <h3 className="text-base sm:text-lg font-bold text-[#FFF8F2]">
        {lang === 'en'
          ? 'Mint & Tilt Your InSight Mission Archivist Badge'
          : 'Khắc tên & nghiêng thử huy hiệu InSight của bạn'}
      </h3>

      <div className="space-y-1.5">
        <label
          htmlFor="explorer-name-input"
          className="block text-xs font-semibold text-[#FFD1A6]"
        >
          {lang === 'en' ? 'Explorer Name / Callsign:' : 'Tên nhà thám hiểm / Biệt danh:'}
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
            {lang === 'en' ? 'Engrave Badge' : 'Khắc lên huy hiệu'}
          </button>
        </div>
      </div>

      {/* Interactive Tilt Stage with Holographic Foil Glare */}
      <div
        data-no-swipe="true"
        className="p-3 rounded-2xl border border-[#F4A261]/25 bg-[#0C080E] flex flex-col items-center space-y-2.5"
      >
        <div
          onPointerMove={handlePointerMoveTilt}
          onPointerLeave={handlePointerLeaveTilt}
          className="relative w-full max-w-[270px] aspect-square flex items-center justify-center cursor-pointer select-none"
        >
          <div
            style={{
              transform: `perspective(900px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
              transition: 'transform 120ms ease-out',
            }}
            className="relative w-full h-full rounded-2xl overflow-hidden"
          >
            <canvas
              ref={canvasRef}
              width={600}
              height={600}
              data-testid="mission-emblem-8k-canvas"
              className="w-full h-full block"
            />
            {/* Dynamic Interactive Foil Specular Highlight */}
            <div
              style={{
                background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255, 240, 210, 0.22) 0%, rgba(0, 245, 212, 0.1) 35%, rgba(0, 0, 0, 0) 70%)`,
              }}
              className="pointer-events-none absolute inset-0"
            />
          </div>
        </div>

        <button
          type="button"
          data-testid="download-badge-png-btn"
          onClick={handleDownloadBadgePng}
          className="w-full py-2.5 px-4 text-xs font-bold rounded-xl bg-[#00F5D4] text-[#09151B] hover:bg-[#99F6E4] transition-colors shadow-lg"
        >
          {downloadedNotice
            ? lang === 'en'
              ? '✓ Mission Badge Downloaded!'
              : '✓ Đã tải xuống huy hiệu sứ mệnh!'
            : lang === 'en'
              ? 'Download Mission Badge'
              : 'Tải xuống huy hiệu sứ mệnh'}
        </button>
      </div>
    </div>
  );
};
