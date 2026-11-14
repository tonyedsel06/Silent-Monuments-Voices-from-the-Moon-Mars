import React, { useEffect, useRef, useState } from 'react';
import { Language } from '../data/bilingualContent';

export type SeismicMode = 'sol128' | 'meteorite' | 'wind';

interface SeismicModeConfig {
  id: SeismicMode;
  code: string;
  title: Record<Language, string>;
  rawFreqLabel: string;
  sonifiedFreqLabel: string;
  description: Record<Language, string>;
}

const SEISMIC_MODES: SeismicModeConfig[] = [
  {
    id: 'sol128',
    code: 'Sol 128 · 6 Apr 2019',
    title: {
      en: 'Sol 128 Tectonic Marsquake (First Confirmed Event)',
      vi: 'Động Đất Kiến Tạo Sol 128 (Sự Kiện Đầu Tiên 06/04/2019)',
    },
    rawFreqLabel: '0.4 – 2.4 Hz (Sub-audible)',
    sonifiedFreqLabel: '24 – 144 Hz (60× Speedup)',
    description: {
      en: 'A quiet primary P-wave arrival followed by a deep shear S-wave echoing through dry, fractured Martian rock.',
      vi: 'Sóng dọc P đến trước với biên độ nhỏ, theo sau là chuỗi sóng ngang S dội vang qua lớp vỏ đá khô nứt nẻ.',
    },
  },
  {
    id: 'meteorite',
    code: 'Meteoroid Strike',
    title: {
      en: 'Meteorite Impact & Fresh Crater Wave',
      vi: 'Sóng Địa Chấn Do Thiên Thạch Va Chạm',
    },
    rawFreqLabel: '1.5 – 6.0 Hz + Acoustic Chirp',
    sonifiedFreqLabel: '90 – 360 Hz (60× Speedup)',
    description: {
      en: 'A sharp high-frequency strike followed by an atmospheric acoustic chirp, confirmed from orbit by fresh crater imagery.',
      vi: 'Xung tần số cao sắc gọn khi thiên thạch chạm đất kèm âm thanh khí quyển, được tàu quỹ đạo chụp ảnh hố mới xác nhận.',
    },
  },
  {
    id: 'wind',
    code: 'Elysium Wind Gusts',
    title: {
      en: 'Martian Wind Gusts Across the Solar Wings',
      vi: 'Gió Sao Hỏa Thổi Qua Hai Cánh Pin Mặt Trời',
    },
    rawFreqLabel: '0.1 – 1.2 Hz Continuous',
    sonifiedFreqLabel: '15 – 85 Hz (60× Speedup)',
    description: {
      en: 'Afternoon gusts sweeping across Elysium Planitia gently sway the 2.15-meter solar wings, sending harmonic vibrations into the ground.',
      vi: 'Những luồng gió chiều quét qua đồng bằng làm rung nhẹ hai cánh pin rộng 2,15 m, truyền dao động xuống nền đất.',
    },
  },
];

interface SeismicSonificationLabProps {
  lang: Language;
}

export const SeismicSonificationLab: React.FC<SeismicSonificationLabProps> = ({ lang }) => {
  const [mode, setMode] = useState<SeismicMode>('sol128');
  const [isPlaying, setIsPlaying] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const stopAudioRef = useRef<(() => void) | null>(null);
  const playStartRef = useRef<number>(0);

  const currentConfig = SEISMIC_MODES.find((m) => m.id === mode) ?? SEISMIC_MODES[0];

  const stopSynthesizer = () => {
    if (stopAudioRef.current) {
      stopAudioRef.current();
      stopAudioRef.current = null;
    }
    setIsPlaying(false);
  };

  const triggerSeismicSonification = (selectedMode: SeismicMode) => {
    stopSynthesizer();
    setIsPlaying(true);
    playStartRef.current = performance.now();

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const duration = 4.2;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.01, now);
      masterGain.connect(ctx.destination);

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();

      if (selectedMode === 'sol128') {
        osc1.type = 'sine';
        osc2.type = 'triangle';
        osc1.frequency.setValueAtTime(52, now);
        osc1.frequency.exponentialRampToValueAtTime(78, now + 1.8);
        osc1.frequency.exponentialRampToValueAtTime(42, now + duration);

        osc2.frequency.setValueAtTime(104, now);
        osc2.frequency.exponentialRampToValueAtTime(64, now + duration);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(180, now);

        masterGain.gain.linearRampToValueAtTime(0.18, now + 0.9);
        masterGain.gain.linearRampToValueAtTime(0.34, now + 2.2);
        masterGain.gain.exponentialRampToValueAtTime(0.005, now + duration);
      } else if (selectedMode === 'meteorite') {
        osc1.type = 'sawtooth';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(290, now);
        osc1.frequency.exponentialRampToValueAtTime(68, now + 2.4);

        osc2.frequency.setValueAtTime(420, now + 0.4);
        osc2.frequency.exponentialRampToValueAtTime(95, now + duration);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(240, now);

        masterGain.gain.linearRampToValueAtTime(0.35, now + 0.25);
        masterGain.gain.exponentialRampToValueAtTime(0.005, now + duration);
      } else {
        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(65, now);
        osc1.frequency.linearRampToValueAtTime(92, now + 1.8);
        osc1.frequency.linearRampToValueAtTime(58, now + duration);

        osc2.frequency.setValueAtTime(98, now);
        osc2.frequency.linearRampToValueAtTime(132, now + 2.0);
        osc2.frequency.linearRampToValueAtTime(84, now + duration);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(220, now);

        masterGain.gain.linearRampToValueAtTime(0.24, now + 1.2);
        masterGain.gain.exponentialRampToValueAtTime(0.005, now + duration);
      }

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(masterGain);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + duration);
      osc2.stop(now + duration);

      const timer = window.setTimeout(() => {
        setIsPlaying(false);
      }, duration * 1000);

      stopAudioRef.current = () => {
        window.clearTimeout(timer);
        try {
          osc1.stop();
          osc2.stop();
        } catch {
          // ignore
        }
      };
    } catch {
      const timer = window.setTimeout(() => setIsPlaying(false), 4000);
      stopAudioRef.current = () => window.clearTimeout(timer);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;

    const drawFrame = (timestamp: number) => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = '#1B0E0A';
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(255, 209, 166, 0.14)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 36) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      const pX = Math.round(w * 0.24);
      const sX = Math.round(w * 0.54);
      ctx.strokeStyle = 'rgba(100, 223, 223, 0.48)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(pX, 0);
      ctx.lineTo(pX, h);
      ctx.moveTo(sX, 0);
      ctx.lineTo(sX, h);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#64DFDF';
      ctx.font = '600 11.5px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('P-Wave (Primary)', pX + 8, 20);
      ctx.fillText('S-Wave (Shear)', sX + 8, 20);

      const elapsedSec = isPlaying ? (timestamp - playStartRef.current) / 1000 : 1.8;
      const phaseShift = isPlaying ? elapsedSec * 14 : 2.5;

      ctx.strokeStyle = mode === 'meteorite' ? '#64DFDF' : '#F4A261';
      ctx.lineWidth = 2.4;
      ctx.beginPath();

      for (let x = 0; x < w; x++) {
        const normX = x / w;
        let env = 0.04;

        if (mode === 'sol128') {
          if (normX > 0.24 && normX < 0.54) {
            env = 0.28 * Math.exp(-(normX - 0.26) * 3.5);
          } else if (normX >= 0.54) {
            env = 0.78 * Math.exp(-(normX - 0.56) * 4.2);
          }
        } else if (mode === 'meteorite') {
          if (normX > 0.22) {
            env = 0.92 * Math.exp(-(normX - 0.23) * 6.5);
          }
        } else {
          env = 0.25 + 0.35 * Math.sin(normX * Math.PI * 3 + phaseShift * 0.25);
        }

        const freq = mode === 'meteorite' ? 78 : mode === 'sol128' ? 48 : 26;
        const yOffset =
          Math.sin(normX * freq - phaseShift) *
          Math.cos(normX * (freq * 0.37) + phaseShift * 0.5) *
          env *
          (h * 0.44);

        const y = h / 2 + yOffset;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      if (isPlaying) {
        animId = requestAnimationFrame(drawFrame);
      }
    };

    drawFrame(performance.now());
    return () => cancelAnimationFrame(animId);
  }, [mode, isPlaying]);

  useEffect(() => {
    return () => stopSynthesizer();
  }, []);

  return (
    <div className="rounded-2xl border border-[#F4A261]/25 bg-[#23140F]/95 p-5 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="text-[#F4A261]">
            {lang === 'en' ? '1,319 Cataloged Marsquakes' : '1.319 Động đất Sao Hỏa đã ghi nhận'}
          </span>
          <span className="text-[#FFD1A6]/40">·</span>
          <span className="text-[#64DFDF]">
            {lang === 'en' ? '60× Web Audio Sonification' : 'Âm thanh hóa tăng tốc 60×'}
          </span>
        </div>
        <a
          href="https://science.nasa.gov/resource/listen-to-nasas-insight-at-work-on-mars/"
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1 rounded-full bg-[#311B13] border border-[#FFD1A6]/30 text-xs font-semibold text-[#FFD1A6] hover:bg-[#42251A]"
        >
          {lang === 'en' ? 'Source: NASA Audio ↗' : 'Nguồn: Âm thanh NASA ↗'}
        </a>
      </div>

      {/* 3 Selectable Waveform Mode Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mb-4">
        {SEISMIC_MODES.map((m) => {
          const active = m.id === mode;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setMode(m.id);
                triggerSeismicSonification(m.id);
              }}
              className={`p-3.5 rounded-xl border text-left transition-colors ${
                active
                  ? 'bg-[#3B2117] border-[#F4A261] text-[#FFF8F2]'
                  : 'bg-[#2C1812] border-[#F4A261]/20 text-[#F3E5D8] hover:border-[#F4A261]/50'
              }`}
            >
              <div className="text-xs font-bold text-[#F4A261] mb-1">{m.code}</div>
              <div className="text-xs font-semibold leading-snug">{m.title[lang]}</div>
            </button>
          );
        })}
      </div>

      {/* Live HTML5 Canvas Oscilloscope */}
      <div className="relative rounded-xl border border-[#F4A261]/25 bg-[#1B0E0A] overflow-hidden mb-4">
        <canvas
          ref={canvasRef}
          width={760}
          height={190}
          data-testid="seismic-oscilloscope-canvas"
          className="w-full h-[180px] block"
        />
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-t border-[#F4A261]/20 bg-[#261510] text-xs text-[#F3E5D8]">
          <span>
            {lang === 'en' ? 'Raw Martian Ground Frequency:' : 'Tần số nền đất thực tế:'}{' '}
            <strong className="text-[#FFF8F2]">{currentConfig.rawFreqLabel}</strong>
          </span>
          <span>
            {lang === 'en' ? 'Audible Sonification (60×):' : 'Âm thanh hóa (Tăng tốc 60×):'}{' '}
            <strong className="text-[#64DFDF]">{currentConfig.sonifiedFreqLabel}</strong>
          </span>
        </div>
      </div>

      <p className="text-sm text-[#F3E5D8] leading-relaxed mb-4">
        {currentConfig.description[lang]}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#F4A261]/20">
        <button
          type="button"
          onClick={() => (isPlaying ? stopSynthesizer() : triggerSeismicSonification(mode))}
          className="px-5 py-2.5 text-xs font-bold rounded-xl bg-[#F4A261] text-[#1F110C] hover:bg-[#FFD1A6] transition-colors whitespace-nowrap shrink-0"
        >
          {isPlaying
            ? lang === 'en'
              ? 'Stop 60× Sonification ■'
              : 'Dừng phát âm thanh ■'
            : lang === 'en'
              ? 'Play 60× Seismic Audio ▶'
              : 'Phát Âm thanh Địa chấn 60× ▶'}
        </button>

        <span className="text-xs text-[#F3E5D8]/80 max-w-md">
          {lang === 'en'
            ? 'Raw Martian tremors vibrate below 20 Hz; speeding them up 60× brings them into human hearing.'
            : 'Rung động gốc của Sao Hỏa dưới 20 Hz; tua nhanh 60× giúp tai người nghe rõ sóng P và sóng S.'}
        </span>
      </div>
    </div>
  );
};
