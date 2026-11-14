import React, { useEffect, useRef, useState } from 'react';
import { Language } from '../data/bilingualContent';
import { simulateSeismicWaves } from '../utils/missionMath';

interface SeismicSonificationLabProps {
  lang: Language;
}

export const SeismicSonificationLab: React.FC<SeismicSonificationLabProps> = ({ lang }) => {
  const [waveProgress, setWaveProgress] = useState(0.58);
  const [isSimulatingWave, setIsSimulatingWave] = useState(false);
  const [activeAudioPreset, setActiveAudioPreset] = useState<'wind' | 'sol128' | 'sol1222' | null>(
    null
  );
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const stopAudioTimerRef = useRef<number | null>(null);

  const simState = simulateSeismicWaves(waveProgress);

  // Animate P-wave and S-wave propagation when user clicks "Trigger Marsquake Wavefronts"
  useEffect(() => {
    if (!isSimulatingWave) return;
    let rafId = 0;
    const step = () => {
      setWaveProgress((prev) => {
        if (prev >= 1) {
          setIsSimulatingWave(false);
          return 1;
        }
        return Number(Math.min(1, prev + 0.008).toFixed(3));
      });
      rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [isSimulatingWave]);

  // Draw P-wave vs S-wave Liquid Core Shadow Zone Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const cx = w * 0.42;
    const cy = h * 0.52;
    const planetR = 128;
    const coreR = 68; // ~1,830 km liquid core

    // Deep space background
    ctx.fillStyle = '#150B08';
    ctx.fillRect(0, 0, w, h);

    // Mars Mantle & Crust Circle
    const mantleGrad = ctx.createRadialGradient(cx, cy, coreR, cx, cy, planetR);
    mantleGrad.addColorStop(0, '#7C2D12');
    mantleGrad.addColorStop(0.82, '#9A3412');
    mantleGrad.addColorStop(1, '#EA580C');
    ctx.fillStyle = mantleGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, planetR, 0, Math.PI * 2);
    ctx.fill();

    // S-Wave Shadow Zone Cone on the far right side of the Liquid Core
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, planetR, 0, Math.PI * 2);
    ctx.clip();

    if (simState.progress > 0.35) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.68)';
      ctx.beginPath();
      ctx.moveTo(cx, cy - coreR);
      ctx.lineTo(cx + planetR + 20, cy - planetR * 0.85);
      ctx.lineTo(cx + planetR + 20, cy + planetR * 0.85);
      ctx.lineTo(cx, cy + coreR);
      ctx.closePath();
      ctx.fill();
    }

    // Molten Liquid Iron-Alloy Core (R ≈ 1,830 km)
    const coreGrad = ctx.createRadialGradient(cx - 12, cy - 12, 8, cx, cy, coreR);
    coreGrad.addColorStop(0, '#FEF08A');
    coreGrad.addColorStop(0.6, '#F59E0B');
    coreGrad.addColorStop(1, '#DC2626');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
    ctx.fill();

    // Quake Epicenter on Left Limb (Cerberus Fossae / Impact)
    const epiX = cx - planetR + 6;
    const epiY = cy;

    // 1. Primary (P) Compressional Wavefront (Fast, cyan, passes & refracts through Liquid Core!)
    const maxVisualR = planetR * 2.02;
    const pVisualR = simState.progress * maxVisualR;
    if (pVisualR > 2) {
      ctx.strokeStyle = '#64DFDF';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(epiX, epiY, pVisualR, -Math.PI * 0.48, Math.PI * 0.48);
      ctx.stroke();
    }

    // 2. Secondary (S) Shear Wavefront (Slower, golden-amber, BLOCKED by Liquid Core!)
    const sVisualR = Math.min(planetR * 1.15, simState.progress * maxVisualR * 0.56);
    if (sVisualR > 2) {
      ctx.strokeStyle = '#F4A261';
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.arc(epiX, epiY, sVisualR, -Math.PI * 0.44, Math.PI * 0.44);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore();

    // Planet Rim
    ctx.strokeStyle = '#F4A261';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, planetR, 0, Math.PI * 2);
    ctx.stroke();

    // Epicenter Star Marker
    ctx.fillStyle = '#FEF08A';
    ctx.beginPath();
    ctx.arc(epiX, epiY, 6, 0, Math.PI * 2);
    ctx.fill();

    // InSight SEIS Station Marker at Top-Right Limb
    const insightX = cx + Math.cos(-0.65) * planetR;
    const insightY = cy + Math.sin(-0.65) * planetR;
    ctx.fillStyle = '#64DFDF';
    ctx.beginPath();
    ctx.arc(insightX, insightY, 6, 0, Math.PI * 2);
    ctx.fill();

    // Labels on Canvas
    ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#FEF08A';
    ctx.fillText(lang === 'en' ? 'Quake Source' : 'Tâm chấn', epiX - 24, epiY - 12);

    ctx.fillStyle = '#64DFDF';
    ctx.fillText('InSight (SEIS)', insightX + 8, insightY - 4);

    ctx.fillStyle = '#1D0F0A';
    ctx.textAlign = 'center';
    ctx.fillText(
      lang === 'en' ? 'Liquid Core (1,830 km)' : 'Lõi Lỏng (1.830 km)',
      cx,
      cy - 3
    );
    ctx.font = '600 10px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(
      lang === 'en' ? 'Blocks S-Waves!' : 'Chặn Sóng S!',
      cx,
      cy + 12
    );

    // Shadow Zone Callout on Right
    ctx.textAlign = 'left';
    ctx.fillStyle = '#FFD1A6';
    ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(
      lang === 'en' ? 'S-Wave Shadow Zone' : 'Vùng Tối Sóng S',
      cx + planetR + 14,
      cy - 6
    );
    ctx.fillStyle = '#64DFDF';
    ctx.font = '600 10px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(
      lang === 'en' ? 'Only P-waves arrive here' : 'Chỉ có Sóng P truyền qua',
      cx + planetR + 14,
      cy + 10
    );
  }, [simState, lang]);

  // Synthesize authentic low-frequency Martian acoustic profiles via Web Audio API
  const playSynthesizedTelemetryAudio = (preset: 'wind' | 'sol128' | 'sol1222') => {
    try {
      if (stopAudioTimerRef.current) {
        window.clearTimeout(stopAudioTimerRef.current);
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }

      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;
      setActiveAudioPreset(preset);

      const duration = 3.2;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const subOsc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (preset === 'wind') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(68, now);
        osc.frequency.exponentialRampToValueAtTime(92, now + 1.5);
        osc.frequency.exponentialRampToValueAtTime(62, now + duration);

        subOsc.type = 'triangle';
        subOsc.frequency.setValueAtTime(34, now);
      } else if (preset === 'sol128') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(52, now);
        osc.frequency.exponentialRampToValueAtTime(118, now + 0.9);
        osc.frequency.exponentialRampToValueAtTime(44, now + duration);

        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(42, now);
      } else {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(84, now);
        osc.frequency.exponentialRampToValueAtTime(148, now + 0.6);
        osc.frequency.exponentialRampToValueAtTime(38, now + duration);

        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(48, now);
      }

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.24, now + 0.35);
      gain.gain.exponentialRampToValueAtTime(0.008, now + duration);

      osc.connect(gain);
      subOsc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      subOsc.start(now);
      osc.stop(now + duration);
      subOsc.stop(now + duration);

      stopAudioTimerRef.current = window.setTimeout(() => {
        setActiveAudioPreset(null);
      }, duration * 1000);
    } catch {
      setActiveAudioPreset(null);
    }
  };

  useEffect(() => {
    return () => {
      if (stopAudioTimerRef.current) window.clearTimeout(stopAudioTimerRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* PART A: Interactive P-Wave vs. S-Wave Seismic Simulator */}
      <div className="rounded-2xl border border-[#F4A261]/30 nasa-basalt-glass p-4 sm:p-6 space-y-4 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F4A261]/20 pb-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#64DFDF]">
              {lang === 'en'
                ? 'Interactive P-Wave vs. S-Wave Liquid Core Simulator'
                : 'Mô Phỏng Sóng Dọc (P) & Sóng Ngang (S) Qua Lõi Lỏng'}
            </span>
            <h4 className="text-lg sm:text-xl font-bold text-[#FFF8F2]">
              {lang === 'en'
                ? 'How S-Wave Shadow Zones Revealed Mars’ 1,830-km Molten Core'
                : 'Cách "Vùng Tối Sóng S" Tiết Lộ Lõi Sắt Nóng Chảy Rộng 1.830 km'}
            </h4>
          </div>

          <button
            type="button"
            data-testid="trigger-seismic-waves-btn"
            onClick={() => {
              setWaveProgress(0.02);
              setIsSimulatingWave(true);
            }}
            className="px-4 py-2 rounded-xl bg-[#F4A261] text-[#1D0F0A] text-xs font-bold hover:bg-[#FFD1A6] transition-colors shadow-lg shrink-0"
          >
            {lang === 'en' ? '▶ Trigger Marsquake Wavefronts' : '▶ Kích Hoạt Sóng Địa Chấn'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center mobile-single-col-lock">
          <div className="lg:col-span-7 bg-[#150B08] rounded-2xl border border-[#F4A261]/25 p-3 flex flex-col items-center">
            <canvas
              ref={canvasRef}
              width={540}
              height={300}
              data-testid="seismic-shadow-zone-canvas"
              className="w-full max-w-[540px] h-auto rounded-xl"
            />
            <div className="w-full pt-2 px-2 flex items-center gap-3">
              <label
                htmlFor="seismic-progress-slider"
                className="text-xs font-bold text-[#FFD1A6] whitespace-nowrap"
              >
                {lang === 'en' ? 'Wave Propagation:' : 'Tiến trình sóng:'}
              </label>
              <input
                id="seismic-progress-slider"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={waveProgress}
                onChange={(e) => {
                  setIsSimulatingWave(false);
                  setWaveProgress(Number(e.target.value));
                }}
                className="flex-1 accent-[#64DFDF]"
              />
              <span className="text-xs font-bold text-[#64DFDF]">
                {Math.round(waveProgress * 100)}%
              </span>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-3">
            <div className="p-3.5 rounded-xl bg-[#1C0F0B] border border-[#64DFDF]/40 space-y-1">
              <div className="text-xs font-bold text-[#64DFDF]">
                {lang === 'en'
                  ? 'Primary (P) Compressional Waves (~7.8 km/s)'
                  : 'Sóng Dọc Sơ Cấp — Sóng P (~7,8 km/s)'}
              </div>
              <p className="text-xs text-[#F3E5D8]/90 leading-relaxed">
                {lang === 'en'
                  ? 'Push-and-pull sound waves that travel fastest and refract right through both solid rock and Mars’ molten liquid iron core.'
                  : 'Sóng nén giãn truyền đi nhanh nhất và xuyên qua được cả đá rắn lẫn lõi sắt nóng chảy của Sao Hỏa.'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#1C0F0B] border border-[#F4A261]/40 space-y-1">
              <div className="text-xs font-bold text-[#F4A261]">
                {lang === 'en'
                  ? 'Secondary (S) Shear Waves (~4.4 km/s · Blocked by Liquid!)'
                  : 'Sóng Ngang Thứ Cấp — Sóng S (~4,4 km/s · Bị Chặn Bởi Chất Lỏng!)'}
              </div>
              <p className="text-xs text-[#F3E5D8]/90 leading-relaxed">
                {lang === 'en'
                  ? 'Side-to-side shear waves cannot pass through liquids. When Mars’ 1,830-km liquid core blocked S-waves from distant quakes, it cast an acoustic "shadow zone" that measured the core!'
                  : 'Sóng biến dạng ngang không thể truyền qua chất lỏng. Khi lõi lỏng 1.830 km chặn sóng S từ các trận động đất xa, nó tạo ra "vùng tối địa chấn" giúp đo chính xác kích thước lõi!'}
              </p>
            </div>

            <div className="px-3.5 py-2.5 rounded-xl bg-[#29150E] border border-[#F4A261]/25 text-xs font-semibold text-[#FFD1A6]">
              {lang === 'en' ? simState.phaseLabelEn : simState.phaseLabelVi}
            </div>
          </div>
        </div>
      </div>

      {/* PART B: Embedded Official NASA JPL YouTube Video & Web Audio Sonification Lab */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mobile-single-col-lock">
        {/* Official NASA JPL Video Embed */}
        <div className="lg:col-span-7 rounded-2xl border border-[#F4A261]/30 nasa-basalt-glass p-4 sm:p-5 space-y-3 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#FFD1A6]">
                {lang === 'en'
                  ? 'Official NASA JPL Audio/Video Archive (Dec 2018)'
                  : 'Tư Liệu Âm Thanh/Video Chính Thức Của NASA JPL (12/2018)'}
              </span>
              <h4 className="text-base sm:text-lg font-bold text-[#FFF8F2]">
                {lang === 'en'
                  ? 'Sounds of Mars: NASA’s InSight Senses Martian Wind'
                  : 'Âm Thanh Sao Hỏa: InSight Lắng Nghe Tiếng Gió Trên Cánh Pin'}
              </h4>
            </div>
            <a
              href="https://youtu.be/yT50Q_Zbf3s"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 rounded-lg bg-[#1D0F0A] border border-[#F4A261]/35 text-xs font-semibold text-[#FFD1A6] hover:text-white"
            >
              YouTube (NASA JPL) ↗
            </a>
          </div>

          <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-[#F4A261]/30 bg-[#0F0806]">
            <iframe
              src="https://www.youtube.com/embed/yT50Q_Zbf3s"
              title="Sounds of Mars: NASA's InSight Senses Martian Wind"
              className="w-full h-full border-0"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>

        {/* Interactive Web Audio Synthesizer + Scientific Pitch Disclosure */}
        <div className="lg:col-span-5 rounded-2xl border border-[#F4A261]/30 nasa-basalt-glass p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-2xl">
          <div className="space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64DFDF]">
              {lang === 'en'
                ? 'Interactive Web Audio Acoustic Synthesizer'
                : 'Bộ Tổng Hợp Âm Thanh Địa Chấn Tương Tác'}
            </span>
            <h4 className="text-base sm:text-lg font-bold text-[#FFF8F2]">
              {lang === 'en'
                ? 'Compare Wind Vibrations vs. Deep Marsquakes'
                : 'So Sánh Rung Động Gió & Động Đất Sao Hỏa'}
            </h4>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => playSynthesizedTelemetryAudio('wind')}
                className={`w-full p-3 rounded-xl border text-left transition-colors ${
                  activeAudioPreset === 'wind'
                    ? 'bg-[#64DFDF] text-[#101C26] border-[#64DFDF] font-bold'
                    : 'bg-[#1C0F0B] text-[#FFF8F2] border-[#F4A261]/30 hover:bg-[#2C1812]'
                }`}
              >
                <div className="text-xs font-bold">
                  {lang === 'en'
                    ? '🔊 1. Sol 4 Martian Wind Across Solar Panels (1 Dec 2018)'
                    : '🔊 1. Tiếng Gió Sao Hỏa Thổi Qua Cánh Pin Ngày Sol 4 (01/12/2018)'}
                </div>
                <div className="text-[11px] opacity-85 mt-0.5">
                  {lang === 'en'
                    ? '5 m/s breeze vibrating the 2.15m solar arrays like giant eardrums.'
                    : 'Cơn gió 5 m/s làm rung hai cánh pin rộng 2,15 m như màng nhĩ khổng lồ.'}
                </div>
              </button>

              <button
                type="button"
                onClick={() => playSynthesizedTelemetryAudio('sol128')}
                className={`w-full p-3 rounded-xl border text-left transition-colors ${
                  activeAudioPreset === 'sol128'
                    ? 'bg-[#64DFDF] text-[#101C26] border-[#64DFDF] font-bold'
                    : 'bg-[#1C0F0B] text-[#FFF8F2] border-[#F4A261]/30 hover:bg-[#2C1812]'
                }`}
              >
                <div className="text-xs font-bold">
                  {lang === 'en'
                    ? '🔊 2. Sol 128 First Confirmed Marsquake (6 Apr 2019)'
                    : '🔊 2. Trận Động Đất Sao Hỏa Đầu Tiên Ngày Sol 128 (06/04/2019)'}
                </div>
                <div className="text-[11px] opacity-85 mt-0.5">
                  {lang === 'en'
                    ? 'Faint deep rumble proving Mars remains seismically active.'
                    : 'Tiếng rền trầm đục đầu tiên chứng minh Sao Hỏa vẫn đang hoạt động địa chấn.'}
                </div>
              </button>

              <button
                type="button"
                onClick={() => playSynthesizedTelemetryAudio('sol1222')}
                className={`w-full p-3 rounded-xl border text-left transition-colors ${
                  activeAudioPreset === 'sol1222'
                    ? 'bg-[#64DFDF] text-[#101C26] border-[#64DFDF] font-bold'
                    : 'bg-[#1C0F0B] text-[#FFF8F2] border-[#F4A261]/30 hover:bg-[#2C1812]'
                }`}
              >
                <div className="text-xs font-bold">
                  {lang === 'en'
                    ? '🔊 3. Sol 1222 Record Mag 4.7 Monster Quake (4 May 2022)'
                    : '🔊 3. Siêu Động Đất 4,7 Độ Ngày Sol 1222 (04/05/2022)'}
                </div>
                <div className="text-[11px] opacity-85 mt-0.5">
                  {lang === 'en'
                    ? 'Reverberated through Mars’ crust and mantle for over 6 hours.'
                    : 'Làm rung chuyển toàn bộ lớp vỏ và lớp phủ Sao Hỏa suốt hơn 6 giờ.'}
                </div>
              </button>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#180C08] border border-[#F4A261]/30 text-[11px] text-[#FFD1A6]/90 leading-relaxed">
            <strong className="text-[#64DFDF]">
              {lang === 'en' ? 'Scientific Audio Disclosure: ' : 'Chú thích Khoa học Âm thanh: '}
            </strong>
            {lang === 'en'
              ? 'Raw SEIS vibrations occur at infrasonic frequencies (<10 Hz). NASA JPL pitched wind vibrations up 2 octaves (APSS sped up 100×) and sped up Sol 128 marsquake audio 60× so human ears can hear them.'
              : 'Rung chấn SEIS gốc nằm ở dải hạ âm (<10 Hz). NASA JPL đã nâng cao độ tiếng gió lên 2 quãng tám (APSS tua nhanh 100 lần) và tua nhanh âm thanh động đất Sol 128 lên 60 lần để tai người có thể nghe được.'}
          </div>
        </div>
      </div>
    </div>
  );
};
