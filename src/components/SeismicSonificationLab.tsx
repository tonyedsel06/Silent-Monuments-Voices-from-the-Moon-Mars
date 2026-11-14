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

  // Earphone-Safe Normalized Web Audio Synthesis (DynamicsCompressorNode + Warm BiquadFilter + 0.3s Fade Envelope)
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
      audioCtxRef.current = ctx;
      setActiveAudioPreset(preset);

      const duration = 3.8;
      const now = ctx.currentTime;

      // DynamicsCompressorNode for earphone safety & clear laptop speaker presence
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-20, now);
      compressor.knee.setValueAtTime(18, now);
      compressor.ratio.setValueAtTime(6, now);
      compressor.attack.setValueAtTime(0.015, now);
      compressor.release.setValueAtTime(0.25, now);

      // Warm Lowpass Filter to eliminate harshness
      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.Q.setValueAtTime(1.2, now);

      // Master Gain with smooth 0.3s fade-in and 0.35s fade-out
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, now);
      masterGain.gain.linearRampToValueAtTime(0.38, now + 0.3);
      masterGain.gain.setValueAtTime(0.38, now + duration - 0.35);
      masterGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      // Filtered Pink/Brown Noise Bed for authentic Martian atmospheric wind/rumble texture
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.04 * white) / 1.04;
        lastOut = data[i];
      }
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const noiseGain = ctx.createGain();
      const osc = ctx.createOscillator();
      const subOsc = ctx.createOscillator();

      if (preset === 'wind_natural') {
        // Track 1: Amplified Martian Wind on Solar Panels (Natural Pitch)
        lowpass.frequency.setValueAtTime(195, now);
        noiseGain.gain.setValueAtTime(0.65, now);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(62, now);
        osc.frequency.exponentialRampToValueAtTime(84, now + 1.8);
        osc.frequency.exponentialRampToValueAtTime(58, now + duration);

        subOsc.type = 'triangle';
        subOsc.frequency.setValueAtTime(45, now);
      } else if (preset === 'wind_seis_2oct') {
        // Track 2: Amplified Martian Wind via SEIS (Pitched Up 2 Octaves for Human Ears, 4x frequency)
        lowpass.frequency.setValueAtTime(480, now);
        noiseGain.gain.setValueAtTime(0.45, now);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(196, now);
        osc.frequency.exponentialRampToValueAtTime(268, now + 1.4);
        osc.frequency.exponentialRampToValueAtTime(178, now + duration);

        subOsc.type = 'triangle';
        subOsc.frequency.setValueAtTime(110, now);
        subOsc.frequency.exponentialRampToValueAtTime(142, now + 1.8);
      } else {
        // Track 3: Amplified Sol 128 Marsquake & Atmospheric Pressure Rumble
        lowpass.frequency.setValueAtTime(240, now);
        noiseGain.gain.setValueAtTime(0.75, now);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(55, now);
        osc.frequency.exponentialRampToValueAtTime(118, now + 0.9);
        osc.frequency.exponentialRampToValueAtTime(48, now + duration);

        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(42, now);
        subOsc.frequency.exponentialRampToValueAtTime(72, now + 1.2);
      }

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.28, now);

      noiseSource.connect(noiseGain);
      noiseGain.connect(lowpass);
      osc.connect(oscGain);
      subOsc.connect(oscGain);
      oscGain.connect(lowpass);

      lowpass.connect(masterGain);
      masterGain.connect(compressor);
      compressor.connect(ctx.destination);

      noiseSource.start(now);
      osc.start(now);
      subOsc.start(now);
      noiseSource.stop(now + duration);
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
