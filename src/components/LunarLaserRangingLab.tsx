import React, { useEffect, useRef, useState } from 'react';
import { Language } from '../data/bilingualContent';
import { calculateLaserRangingTelemetry } from '../utils/missionMath';

interface LunarLaserRangingLabProps {
  lang: Language;
}

export const LunarLaserRangingLab: React.FC<LunarLaserRangingLabProps> = ({ lang }) => {
  const [progress, setProgress] = useState(0);
  const [isFiring, setIsFiring] = useState(false);
  const [shotsCount, setShotsCount] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const telemetry = calculateLaserRangingTelemetry(progress);

  const fireLaserPulse = () => {
    if (isFiring) return;
    setIsFiring(true);
    setProgress(0.01);
    const startMs = performance.now();
    const durationMs = 2560;

    const step = (now: number) => {
      const elapsed = now - startMs;
      const p = Math.min(1, elapsed / durationMs);
      setProgress(p);
      if (p < 1) {
        requestAnimationFrame(step);
      } else {
        setIsFiring(false);
        setShotsCount((c) => c + 1);
      }
    };
    requestAnimationFrame(step);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.fillStyle = '#131C2B';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(148, 163, 184, 0.16)';
    ctx.lineWidth = 1;
    for (let x = 80; x < w; x += 110) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    const earthX = 76;
    const earthY = h / 2;
    const moonX = w - 92;
    const moonY = h / 2;

    const earthGrad = ctx.createRadialGradient(earthX - 8, earthY - 8, 4, earthX, earthY, 36);
    earthGrad.addColorStop(0, '#38BDF8');
    earthGrad.addColorStop(0.7, '#1D4ED8');
    earthGrad.addColorStop(1, '#0F172A');
    ctx.fillStyle = earthGrad;
    ctx.beginPath();
    ctx.arc(earthX, earthY, 36, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFF8F2';
    ctx.font = '600 11.5px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Earth Observatory', 22, earthY + 54);

    const moonGrad = ctx.createRadialGradient(moonX - 6, moonY - 6, 4, moonX, moonY, 26);
    moonGrad.addColorStop(0, '#E2E8F0');
    moonGrad.addColorStop(0.75, '#64748B');
    moonGrad.addColorStop(1, '#334155');
    ctx.fillStyle = moonGrad;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 26, 0, Math.PI * 2);
    ctx.fill();

    const lrrrX = moonX - 24;
    const lrrrY = moonY;
    ctx.fillStyle = '#64DFDF';
    ctx.fillRect(lrrrX - 4, lrrrY - 9, 8, 18);

    ctx.fillStyle = '#64DFDF';
    ctx.fillText('Apollo 11 LRRR (0.674°N)', moonX - 120, moonY + 46);

    ctx.strokeStyle = 'rgba(100, 223, 223, 0.25)';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(earthX + 36, earthY);
    ctx.lineTo(lrrrX, lrrrY);
    ctx.stroke();
    ctx.setLineDash([]);

    if (progress > 0) {
      const startX = earthX + 36;
      const endX = lrrrX;
      const span = endX - startX;

      let photonX = startX;
      if (progress <= 0.5) {
        photonX = startX + (progress / 0.5) * span;
      } else {
        photonX = endX - ((progress - 0.5) / 0.5) * span;
      }

      ctx.strokeStyle = '#64DFDF';
      ctx.lineWidth = 3;
      ctx.beginPath();
      if (progress <= 0.5) {
        ctx.moveTo(startX, earthY);
        ctx.lineTo(photonX, earthY);
      } else {
        ctx.moveTo(endX, earthY);
        ctx.lineTo(photonX, earthY);
      }
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(photonX, earthY, 6, 0, Math.PI * 2);
      ctx.fill();

      if (progress >= 0.44 && progress <= 0.58) {
        ctx.strokeStyle = '#FFD1A6';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(endX, earthY, 18, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    ctx.fillStyle = '#CBD5E1';
    ctx.font = '600 11.5px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Mean Distance: 384,400 km · Round Trip: 768,800 km in 2.56 Seconds', 175, 24);
  }, [progress]);

  return (
    <div className="rounded-2xl border border-[#64DFDF]/30 bg-[#1B2638]/95 p-5 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="text-[#64DFDF]">Apollo 11 LRRR · NSSDCA 1969-059C</span>
          <span className="text-slate-500">·</span>
          <span className="text-[#FFD1A6]">2.56s Photon Time-of-Flight</span>
        </div>
        <span className="text-xs font-medium text-slate-300">
          {lang === 'en' ? `Completed Pulses: ${shotsCount}` : `Số xung đã bắn: ${shotsCount}`}
        </span>
      </div>

      <div className="rounded-xl border border-[#64DFDF]/25 bg-[#131C2B] overflow-hidden mb-4">
        <canvas
          ref={canvasRef}
          width={760}
          height={185}
          data-testid="lunar-laser-canvas"
          className="w-full h-[180px] block"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="p-3.5 rounded-xl bg-[#223046] border border-[#64DFDF]/20">
          <div className="text-xs font-medium text-slate-300">
            {lang === 'en' ? 'Round-Trip Timer' : 'Đồng hồ hành trình'}
          </div>
          <div className="text-2xl font-bold text-[#64DFDF] tabular-nums">
            {telemetry.elapsedSeconds.toFixed(2)}
            <span className="text-xs text-slate-300 ml-1">s / 2.56 s</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#223046] border border-[#64DFDF]/20">
          <div className="text-xs font-medium text-slate-300">
            {lang === 'en' ? 'Photon Distance' : 'Quãng đường photon'}
          </div>
          <div className="text-2xl font-bold text-white tabular-nums">
            {telemetry.distanceTraveledKm.toLocaleString()}
            <span className="text-xs text-slate-300 ml-1">km</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#223046] border border-[#64DFDF]/20">
          <div className="text-xs font-medium text-slate-300">
            {lang === 'en' ? 'Power Required' : 'Điện năng tiêu thụ'}
          </div>
          <div className="text-2xl font-bold text-[#FFD1A6] tabular-nums">
            0.0
            <span className="text-xs text-slate-300 ml-1">Watts</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#223046] border border-[#64DFDF]/20">
          <div className="text-xs font-medium text-slate-300">
            {lang === 'en' ? 'Lunar Recession' : 'Tốc độ lùi xa'}
          </div>
          <div className="text-2xl font-bold text-[#64DFDF] tabular-nums">
            +3.8
            <span className="text-xs text-slate-300 ml-1">cm / yr</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#64DFDF]/20">
        <button
          type="button"
          onClick={fireLaserPulse}
          disabled={isFiring}
          className="px-5 py-2.5 text-xs font-bold rounded-xl bg-[#64DFDF] text-[#111C28] hover:bg-[#99F6E4] disabled:opacity-50 transition-colors whitespace-nowrap shrink-0"
        >
          {isFiring
            ? lang === 'en'
              ? 'Laser Pulse in Flight (2.56s)...'
              : 'Xung Laser đang bay (2,56 giây)...'
            : lang === 'en'
              ? 'Fire Earth Observatory Laser Pulse'
              : 'Bắn Xung Laser Từ Đài Quan Sát Trái Đất'}
        </button>

        <p className="text-xs text-slate-200 max-w-xl leading-relaxed">
          {lang === 'en'
            ? 'Each of the 100 fused-silica corner-cube prisms has three perpendicular polished glass faces (90°). Any incoming light ray bounces off all three inner faces and returns strictly parallel back to the telescope on Earth.'
            : 'Mỗi lăng kính trong số 100 lăng kính góc thạch anh có 3 mặt phẳng vuông góc 90°. Bất kỳ tia sáng nào chiếu vào đều phản xạ qua 3 mặt trong và quay thẳng về kính thiên văn trên Trái Đất.'}
        </p>
      </div>
    </div>
  );
};
