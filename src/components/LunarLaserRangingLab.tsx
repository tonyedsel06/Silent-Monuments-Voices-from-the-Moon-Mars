import React, { useEffect, useRef, useState } from 'react';
import { Language } from '../data/bilingualContent';
import { calculateLaserRangingTelemetry } from '../utils/missionMath';

interface LunarLaserRangingLabProps {
  lang: Language;
}

export const LunarLaserRangingLab: React.FC<LunarLaserRangingLabProps> = ({ lang }) => {
  const [progress, setProgress] = useState(0); // 0 to 1
  const [isFiring, setIsFiring] = useState(false);
  const [shotsCount, setShotsCount] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const telemetry = calculateLaserRangingTelemetry(progress);

  const fireLaserPulse = () => {
    if (isFiring) return;
    setIsFiring(true);
    setProgress(0.01);
    const startMs = performance.now();
    const durationMs = 2560; // Real-time 2.56 seconds round trip

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
    ctx.fillStyle = '#070B14';
    ctx.fillRect(0, 0, w, h);

    // Distance grid lines
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.14)';
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

    // Draw Earth (Apache Point Observatory)
    const earthGrad = ctx.createRadialGradient(earthX - 8, earthY - 8, 4, earthX, earthY, 36);
    earthGrad.addColorStop(0, '#38BDF8');
    earthGrad.addColorStop(0.7, '#1D4ED8');
    earthGrad.addColorStop(1, '#0F172A');
    ctx.fillStyle = earthGrad;
    ctx.beginPath();
    ctx.arc(earthX, earthY, 36, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#F8F9FA';
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.fillText('EARTH OBSERVATORY', 18, earthY + 54);

    // Draw Moon (Mare Tranquillitatis 0.674°N, 23.473°E)
    const moonGrad = ctx.createRadialGradient(moonX - 6, moonY - 6, 4, moonX, moonY, 26);
    moonGrad.addColorStop(0, '#CBD5E1');
    moonGrad.addColorStop(0.75, '#64748B');
    moonGrad.addColorStop(1, '#334155');
    ctx.fillStyle = moonGrad;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 26, 0, Math.PI * 2);
    ctx.fill();

    // LRRR Prism Array Marker on Lunar limb
    const lrrrX = moonX - 24;
    const lrrrY = moonY;
    ctx.fillStyle = '#64DFDF';
    ctx.fillRect(lrrrX - 4, lrrrY - 9, 8, 18);

    ctx.fillStyle = '#64DFDF';
    ctx.fillText('APOLLO 11 LRRR (0.674°N)', moonX - 115, moonY + 46);

    // Baseline guide path
    ctx.strokeStyle = 'rgba(100, 223, 223, 0.22)';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(earthX + 36, earthY);
    ctx.lineTo(lrrrX, lrrrY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Active 532nm Green Laser Pulse
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

      // Glowing laser beam trail
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

      // Photon wavepacket head
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(photonX, earthY, 6, 0, Math.PI * 2);
      ctx.fill();

      // Corner-cube reflection flash at progress ~0.5
      if (progress >= 0.44 && progress <= 0.58) {
        ctx.strokeStyle = '#FFD1A6';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(endX, earthY, 18, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    ctx.fillStyle = '#94A3B8';
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.fillText('MEAN DISTANCE: 384,400 KM (ROUND TRIP: 768,800 KM IN 2.56 SECONDS)', 170, 24);
  }, [progress]);

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0B1220] p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-[#64DFDF] font-semibold">[VERIFIED NASA/NSSDCA DATA: 1969-059C]</span>
          <span className="text-slate-600">·</span>
          <span className="text-[#F4A261]">[EDUCATIONAL SIMULATION · 2.56s PHOTON TIMER]</span>
        </div>
        <span className="text-xs font-mono text-slate-400">
          {lang === 'en' ? `Completed Pulses: ${shotsCount}` : `Số xung đã bắn: ${shotsCount}`}
        </span>
      </div>

      {/* Live Laser Canvas */}
      <div className="rounded-lg border border-slate-800 bg-[#070B14] overflow-hidden mb-4">
        <canvas
          ref={canvasRef}
          width={760}
          height={185}
          data-testid="lunar-laser-canvas"
          className="w-full h-[180px] block"
        />
      </div>

      {/* Telemetry Readout Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="p-3 rounded-lg bg-[#0E1729] border border-slate-800">
          <div className="text-[11px] font-mono text-slate-400">
            {lang === 'en' ? 'ROUND-TRIP TIMER' : 'ĐỒNG HỒ HÀNH TRÌNH'}
          </div>
          <div className="text-2xl font-mono font-bold text-[#64DFDF] tabular-nums">
            {telemetry.elapsedSeconds.toFixed(2)}
            <span className="text-xs text-slate-400 ml-1">s / 2.56 s</span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[#0E1729] border border-slate-800">
          <div className="text-[11px] font-mono text-slate-400">
            {lang === 'en' ? 'PHOTON DISTANCE' : 'QUÃNG ĐƯỜNG PHOTON'}
          </div>
          <div className="text-2xl font-mono font-bold text-white tabular-nums">
            {telemetry.distanceTraveledKm.toLocaleString()}
            <span className="text-xs text-slate-400 ml-1">km</span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[#0E1729] border border-slate-800">
          <div className="text-[11px] font-mono text-slate-400">
            {lang === 'en' ? 'POWER REQUIRED' : 'ĐIỆN NĂNG TIÊU THỤ'}
          </div>
          <div className="text-2xl font-mono font-bold text-[#FFD1A6] tabular-nums">
            0.0
            <span className="text-xs text-slate-400 ml-1">Watts</span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[#0E1729] border border-slate-800">
          <div className="text-[11px] font-mono text-slate-400">
            {lang === 'en' ? 'LUNAR RECESSION' : 'TỐC ĐỘ LÙI XA'}
          </div>
          <div className="text-2xl font-mono font-bold text-[#64DFDF] tabular-nums">
            +3.8
            <span className="text-xs text-slate-400 ml-1">cm / yr</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-800">
        <button
          type="button"
          onClick={fireLaserPulse}
          disabled={isFiring}
          className="px-5 py-2.5 text-xs font-mono font-bold rounded-lg bg-[#64DFDF] text-[#070B14] hover:bg-[#80FFDB] disabled:opacity-50 transition-colors whitespace-nowrap shrink-0"
        >
          {isFiring
            ? lang === 'en'
              ? 'LASER PULSE IN FLIGHT (2.56s)...'
              : 'XUNG LASER ĐANG BAY (2,56 giây)...'
            : lang === 'en'
              ? 'FIRE EARTH OBSERVATORY LASER PULSE'
              : 'BẮN XUNG LASER TỪ ĐÀI QUAN SÁT TRÁI ĐẤT'}
        </button>

        <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
          {lang === 'en'
            ? 'How it works without batteries: Each of the 100 fused-silica corner-cube prisms has three mutually perpendicular polished glass faces (90° angles). Any light ray entering the prism reflects off all three inner faces and exits strictly parallel to the incoming beam—straight back to the telescope on Earth.'
            : 'Vì sao không cần ắc-quy: Mỗi lăng kính trong số 100 lăng kính góc thạch anh có 3 mặt phẳng vuông góc 90° với nhau. Bất kỳ tia laser nào chiếu vào đều phản xạ lần lượt qua 3 mặt trong và bật ngược trở lại song song tuyệt đối với hướng chiếu ban đầu—quay thẳng về kính thiên văn trên Trái Đất.'}
        </p>
      </div>
    </div>
  );
};
