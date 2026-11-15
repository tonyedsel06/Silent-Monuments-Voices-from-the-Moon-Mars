import React, { useEffect, useRef, useState } from 'react';
import { Language } from '../data/bilingualContent';
import { simulateSeismicWaves } from '../utils/missionMath';

interface SeismicSonificationLabProps {
  lang: Language;
}

type AudioTrackPreset = 'wind_natural' | 'wind_seis_2oct' | 'sol128_quake';

export const SeismicSonificationLab: React.FC<SeismicSonificationLabProps> = ({ lang }) => {
  const [waveProgress, setWaveProgress] = useState(0.58);
  const [isSimulatingWave, setIsSimulatingWave] = useState(false);
  const [activeAudioPreset, setActiveAudioPreset] = useState<AudioTrackPreset | null>(null);
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

  // High-Power 400%-Boosted Audio Engine (95Hz, 145Hz, 220Hz harmonics + Pink Noise + GainNode 2.8 + DynamicsCompressorNode)
  const playNormalizedTelemetryAudio = (preset: AudioTrackPreset) => {
    try {
      if (stopAudioTimerRef.current) {
        window.clearTimeout(stopAudioTimerRef.current);
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }

      if (activeAudioPreset === preset) {
        setActiveAudioPreset(null);
        return;
      }

      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      audioCtxRef.current = ctx;
      setActiveAudioPreset(preset);

      const duration = 4.2;
      const now = ctx.currentTime;

      // High-Power DynamicsCompressorNode (threshold: -26, knee: 10, ratio: 3.5, attack: 0.002, release: 0.2)
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-26, now);
      compressor.knee.setValueAtTime(10, now);
      compressor.ratio.setValueAtTime(3.5, now);
      compressor.attack.setValueAtTime(0.002, now);
      compressor.release.setValueAtTime(0.2, now);

      // High-Gain Boost Node (gain.value = 2.8 for 400% speaker presence)
      const highPowerBoost = ctx.createGain();
      highPowerBoost.gain.setValueAtTime(2.8, now);

      // Envelope Gain with smooth 0.25s attack and 0.35s release
      const envelopeGain = ctx.createGain();
      envelopeGain.gain.setValueAtTime(0.01, now);
      envelopeGain.gain.linearRampToValueAtTime(1.0, now + 0.25);
      envelopeGain.gain.setValueAtTime(1.0, now + duration - 0.35);
      envelopeGain.gain.exponentialRampToValueAtTime(0.005, now + duration);

      // Warm Resonant BiquadFilter for audible upper-bass and low-mid clarity
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.Q.setValueAtTime(1.8, now);

      // Paul Kellet Pink-Noise Generator for rich Martian atmospheric wind gusts
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      let b0 = 0;
      let b1 = 0;
      let b2 = 0;
      let b3 = 0;
      let b4 = 0;
      let b5 = 0;
      let b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        b6 = white * 0.115926;
        // Swelling wind gust envelope
        const gust = 0.68 + 0.32 * Math.sin((i / ctx.sampleRate) * Math.PI * 1.6);
        data[i] = pink * 0.14 * gust;
      }
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      const noiseGain = ctx.createGain();

      // Layered Sub-Bass + Audible Upper-Bass & Low-Mid Harmonics (95 Hz, 145 Hz, 220 Hz)
      const subOsc = ctx.createOscillator();
      const harm95 = ctx.createOscillator();
      const harm145 = ctx.createOscillator();
      const harm220 = ctx.createOscillator();

      const subGain = ctx.createGain();
      const harm95Gain = ctx.createGain();
      const harm145Gain = ctx.createGain();
      const harm220Gain = ctx.createGain();

      if (preset === 'wind_natural') {
        // Track 1: Amplified Martian Wind on Solar Panels (Natural Pitch + 95/145/220Hz resonance)
        filter.frequency.setValueAtTime(520, now);
        filter.frequency.exponentialRampToValueAtTime(760, now + 1.8);
        filter.frequency.exponentialRampToValueAtTime(460, now + duration);
        noiseGain.gain.setValueAtTime(0.95, now);

        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(58, now);
        subOsc.frequency.exponentialRampToValueAtTime(76, now + 2.0);
        subGain.gain.setValueAtTime(0.55, now);

        harm95.type = 'triangle';
        harm95.frequency.setValueAtTime(95, now);
        harm95.frequency.exponentialRampToValueAtTime(118, now + 1.9);
        harm95.frequency.exponentialRampToValueAtTime(92, now + duration);
        harm95Gain.gain.setValueAtTime(0.52, now);

        harm145.type = 'sine';
        harm145.frequency.setValueAtTime(145, now);
        harm145.frequency.exponentialRampToValueAtTime(174, now + 1.9);
        harm145Gain.gain.setValueAtTime(0.42, now);

        harm220.type = 'sine';
        harm220.frequency.setValueAtTime(220, now);
        harm220.frequency.exponentialRampToValueAtTime(248, now + 2.0);
        harm220Gain.gain.setValueAtTime(0.28, now);
      } else if (preset === 'wind_seis_2oct') {
        // Track 2: Amplified Martian Wind via SEIS (Pitched Up 2 Octaves for Human Ears)
        filter.frequency.setValueAtTime(1150, now);
        filter.frequency.exponentialRampToValueAtTime(1580, now + 1.6);
        filter.frequency.exponentialRampToValueAtTime(920, now + duration);
        noiseGain.gain.setValueAtTime(0.85, now);

        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(95, now);
        subOsc.frequency.exponentialRampToValueAtTime(132, now + 1.6);
        subGain.gain.setValueAtTime(0.48, now);

        harm95.type = 'triangle';
        harm95.frequency.setValueAtTime(145, now);
        harm95.frequency.exponentialRampToValueAtTime(196, now + 1.6);
        harm95Gain.gain.setValueAtTime(0.55, now);

        harm145.type = 'sine';
        harm145.frequency.setValueAtTime(220, now);
        harm145.frequency.exponentialRampToValueAtTime(294, now + 1.6);
        harm145.frequency.exponentialRampToValueAtTime(210, now + duration);
        harm145Gain.gain.setValueAtTime(0.58, now);

        harm220.type = 'triangle';
        harm220.frequency.setValueAtTime(330, now);
        harm220.frequency.exponentialRampToValueAtTime(440, now + 1.7);
        harm220Gain.gain.setValueAtTime(0.38, now);
      } else {
        // Track 3: Amplified Sol 128 Marsquake & Atmospheric Pressure Rumble
        filter.frequency.setValueAtTime(680, now);
        filter.frequency.exponentialRampToValueAtTime(980, now + 1.1);
        filter.frequency.exponentialRampToValueAtTime(420, now + duration);
        noiseGain.gain.setValueAtTime(1.1, now);

        subOsc.type = 'sawtooth';
        subOsc.frequency.setValueAtTime(48, now);
        subOsc.frequency.exponentialRampToValueAtTime(86, now + 1.0);
        subOsc.frequency.exponentialRampToValueAtTime(44, now + duration);
        subGain.gain.setValueAtTime(0.52, now);

        harm95.type = 'triangle';
        harm95.frequency.setValueAtTime(95, now);
        harm95.frequency.exponentialRampToValueAtTime(138, now + 1.1);
        harm95.frequency.exponentialRampToValueAtTime(82, now + duration);
        harm95Gain.gain.setValueAtTime(0.62, now);

        harm145.type = 'triangle';
        harm145.frequency.setValueAtTime(145, now);
        harm145.frequency.exponentialRampToValueAtTime(205, now + 1.1);
        harm145.frequency.exponentialRampToValueAtTime(125, now + duration);
        harm145Gain.gain.setValueAtTime(0.52, now);

        harm220.type = 'sine';
        harm220.frequency.setValueAtTime(220, now);
        harm220.frequency.exponentialRampToValueAtTime(285, now + 1.1);
        harm220.frequency.exponentialRampToValueAtTime(180, now + duration);
        harm220Gain.gain.setValueAtTime(0.38, now);
      }

      noiseSource.connect(noiseGain);
      noiseGain.connect(filter);

      subOsc.connect(subGain);
      harm95.connect(harm95Gain);
      harm145.connect(harm145Gain);
      harm220.connect(harm220Gain);

      subGain.connect(filter);
      harm95Gain.connect(filter);
      harm145Gain.connect(filter);
      harm220Gain.connect(filter);

      filter.connect(envelopeGain);
      envelopeGain.connect(highPowerBoost);
      highPowerBoost.connect(compressor);
      compressor.connect(ctx.destination);

      noiseSource.start(now);
      subOsc.start(now);
      harm95.start(now);
      harm145.start(now);
      harm220.start(now);

      noiseSource.stop(now + duration);
      subOsc.stop(now + duration);
      harm95.stop(now + duration);
      harm145.stop(now + duration);
      harm220.stop(now + duration);

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
                : 'Mô phỏng sóng dọc (P) & sóng ngang (S) qua lõi lỏng'}
            </span>
            <h4 className="text-lg sm:text-xl font-bold text-[#FFF8F2]">
              {lang === 'en'
                ? 'How S-Wave Shadow Zones Revealed Mars’ 1,830-km Molten Core'
                : 'Cách "vùng tối sóng S" tiết lộ lõi sắt nóng chảy rộng 1.830 km'}
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
            {lang === 'en' ? '▶ Trigger Marsquake Wavefronts' : '▶ Kích hoạt sóng địa chấn'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center mobile-single-col-lock">
          <div
            data-no-swipe="true"
            className="lg:col-span-7 bg-[#150B08] rounded-2xl border border-[#F4A261]/25 p-3 flex flex-col items-center"
          >
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
                  : 'Sóng dọc sơ cấp — Sóng P (~7,8 km/s)'}
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
                  : 'Sóng ngang thứ cấp — Sóng S (~4,4 km/s · Bị chặn bởi chất lỏng!)'}
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

      {/* PART B: Embedded Official NASA JPL YouTube Video & 3 Earphone-Safe Amplified Audio Tracks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mobile-single-col-lock">
        {/* Official NASA JPL Video Embed */}
        <div className="lg:col-span-7 rounded-2xl border border-[#F4A261]/30 nasa-basalt-glass p-4 sm:p-5 space-y-3 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-base sm:text-lg font-bold text-[#FFF8F2]">
              {lang === 'en'
                ? 'Sounds of Mars: NASA’s InSight Senses Martian Wind'
                : 'Âm thanh Sao Hỏa: InSight lắng nghe tiếng gió trên cánh pin'}
            </h4>
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

        {/* 3 Amplified Wind & Seismic Audio Tracks (Earphone-Safe Normalized) */}
        <div className="lg:col-span-5 rounded-2xl border border-[#F4A261]/30 nasa-basalt-glass p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-2xl">
          <div className="space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64DFDF]">
              {lang === 'en'
                ? 'Earphone-Safe Normalized Acoustic Lab'
                : 'Phòng nghe âm thanh địa chấn chuẩn hóa an toàn'}
            </span>
            <h4 className="text-base sm:text-lg font-bold text-[#FFF8F2]">
              {lang === 'en'
                ? 'Listen to 3 Amplified Wind & Seismic Tracks'
                : 'Trải nghiệm 3 bản thu gió và địa chấn khuếch đại'}
            </h4>

            <div className="space-y-2">
              <button
                type="button"
                data-testid="audio-track-wind-natural"
                onClick={() => playNormalizedTelemetryAudio('wind_natural')}
                className={`w-full p-3 rounded-xl border text-left transition-colors ${
                  activeAudioPreset === 'wind_natural'
                    ? 'bg-[#64DFDF] text-[#101C26] border-[#64DFDF] font-bold'
                    : 'bg-[#1C0F0B] text-[#FFF8F2] border-[#F4A261]/30 hover:bg-[#2C1812]'
                }`}
              >
                <div className="text-xs font-bold">
                  {lang === 'en'
                    ? '🔊 1. Amplified Martian Wind on Solar Panels (Natural Pitch)'
                    : '🔊 1. Tiếng gió Sao Hỏa trên cánh pin (Cao độ tự nhiên khuếch đại)'}
                </div>
                <div className="text-[11px] opacity-85 mt-0.5">
                  {lang === 'en'
                    ? 'Warm low-frequency breeze vibrating the 2.15m decagonal wings on Sol 4.'
                    : 'Cơn gió tần số trầm làm rung hai cánh pin rộng 2,15 m vào ngày Sol 4.'}
                </div>
              </button>

              <button
                type="button"
                data-testid="audio-track-wind-seis"
                onClick={() => playNormalizedTelemetryAudio('wind_seis_2oct')}
                className={`w-full p-3 rounded-xl border text-left transition-colors ${
                  activeAudioPreset === 'wind_seis_2oct'
                    ? 'bg-[#64DFDF] text-[#101C26] border-[#64DFDF] font-bold'
                    : 'bg-[#1C0F0B] text-[#FFF8F2] border-[#F4A261]/30 hover:bg-[#2C1812]'
                }`}
              >
                <div className="text-xs font-bold">
                  {lang === 'en'
                    ? '🔊 2. Amplified Martian Wind via SEIS (Pitched Up 2 Octaves for Human Ears)'
                    : '🔊 2. Tiếng gió Sao Hỏa qua SEIS (Nâng cao độ 2 quãng tám cho tai người)'}
                </div>
                <div className="text-[11px] opacity-85 mt-0.5">
                  {lang === 'en'
                    ? 'Shifted up 2 octaves so laptop and phone speakers reveal delicate harmonic gusts.'
                    : 'Nâng cao độ 2 quãng tám giúp loa máy tính và điện thoại tái hiện rõ từng đợt gió.'}
                </div>
              </button>

              <button
                type="button"
                data-testid="audio-track-sol128-quake"
                onClick={() => playNormalizedTelemetryAudio('sol128_quake')}
                className={`w-full p-3 rounded-xl border text-left transition-colors ${
                  activeAudioPreset === 'sol128_quake'
                    ? 'bg-[#64DFDF] text-[#101C26] border-[#64DFDF] font-bold'
                    : 'bg-[#1C0F0B] text-[#FFF8F2] border-[#F4A261]/30 hover:bg-[#2C1812]'
                }`}
              >
                <div className="text-xs font-bold">
                  {lang === 'en'
                    ? '🔊 3. Amplified Sol 128 Marsquake & Atmospheric Pressure Rumble'
                    : '🔊 3. Động đất Sao Hỏa Sol 128 & tiếng rền áp suất khí quyển'}
                </div>
                <div className="text-[11px] opacity-85 mt-0.5">
                  {lang === 'en'
                    ? 'Deep crustal trembling sped up 60× with peak-limited headphone normalization.'
                    : 'Rung chấn vỏ hành tinh tua nhanh 60 lần kèm bộ nén âm bảo vệ tai nghe.'}
                </div>
              </button>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#180C08] border border-[#F4A261]/30 text-[11px] text-[#FFD1A6]/90 leading-relaxed">
            <strong className="text-[#64DFDF]">
              {lang === 'en' ? 'Scientific Audio Note: ' : 'Chú thích âm thanh khoa học: '}
            </strong>
            {lang === 'en'
              ? 'Raw SEIS vibrations occur below human hearing (<10 Hz). All three tracks pass through a soft dynamics compressor and 0.3s fade envelope for comfortable headphone listening.'
              : 'Rung chấn SEIS gốc nằm ở dải hạ âm (<10 Hz). Cả 3 bản thu đều đi qua bộ cân bằng âm lượng tự động và hiệu ứng chuyển âm êm ái giúp bảo vệ thính giác.'}
          </div>
        </div>
      </div>
    </div>
  );
};
