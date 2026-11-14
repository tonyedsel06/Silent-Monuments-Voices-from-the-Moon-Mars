import React, { useEffect, useRef, useState } from 'react';
import { Language } from '../data/bilingualContent';

export type SeismicMode = 'sol128' | 'meteorite' | 'wind';

interface SeismicModeConfig {
  id: SeismicMode;
  code: string;
  title: Record<Language, string>;
  rawFreqLabel: string;
  sonifiedFreqLabel: string;
  pWaveArrivalSec: number;
  sWaveArrivalSec: number;
  description: Record<Language, string>;
}

const SEISMIC_MODES: SeismicModeConfig[] = [
  {
    id: 'sol128',
    code: 'MODE 01 · SOL 128 (6 APR 2019)',
    title: {
      en: 'Sol 128 Tectonic Marsquake (First Confirmed Event)',
      vi: 'Động đất Kiến tạo Sol 128 (Sự kiện xác nhận đầu tiên 06/04/2019)',
    },
    rawFreqLabel: '0.4 – 2.4 Hz (Sub-audible)',
    sonifiedFreqLabel: '24 – 144 Hz (60x Speedup)',
    pWaveArrivalSec: 1.1,
    sWaveArrivalSec: 2.3,
    description: {
      en: 'Distinct compressional P-wave arrival followed by a broader shear S-wave train echoing through dry, fractured Martian crust—similar to lunar quakes measured by Apollo.',
      vi: 'Sóng dọc (sóng P) đến trước với biên độ nhỏ, theo sau là chuỗi sóng ngang (sóng S) dội vang qua lớp vỏ Sao Hỏa khô và nhiều vết nứt—rất giống các trận động đất Mặt Trăng thời Apollo.',
    },
  },
  {
    id: 'meteorite',
    code: 'MODE 02 · METEORITE IMPACT',
    title: {
      en: 'Meteorite Impact Seismic Wave (Fresh Crater Excavation)',
      vi: 'Sóng Địa chấn do Thiên thạch Va chạm (Đào hố va chạm mới)',
    },
    rawFreqLabel: '1.5 – 6.0 Hz + Acoustic Chirp',
    sonifiedFreqLabel: '90 – 360 Hz (60x Speedup)',
    pWaveArrivalSec: 0.7,
    sWaveArrivalSec: 1.6,
    description: {
      en: 'Sharp, impulsive high-frequency spike when a meteoroid strikes the surface, followed by an atmospheric acoustic "chirp" verified from orbit by Mars Reconnaissance Orbiter cameras.',
      vi: 'Xung tần số cao sắc gọn khi thiên thạch đập vào bề mặt, kèm theo tiếng "bloep" âm thanh khí quyển được tàu quỹ đạo MRO chụp ảnh miệng hố mới để đối chiếu xác nhận.',
    },
  },
  {
    id: 'wind',
    code: 'MODE 03 · ATMOSPHERIC VORTEX',
    title: {
      en: 'Martian Atmospheric Wind Vibration Across Lander Deck',
      vi: 'Rung động do Gió Khí quyển Sao Hỏa thổi qua Thân trạm',
    },
    rawFreqLabel: '0.1 – 1.2 Hz Continuous',
    sonifiedFreqLabel: '15 – 85 Hz (60x Speedup)',
    pWaveArrivalSec: 0.2,
    sWaveArrivalSec: 0.5,
    description: {
      en: 'Rolling afternoon wind gusts sweeping across Elysium Planitia vibrate the 2.15-meter decagonal solar wings, transferring gentle harmonic sway into the ground.',
      vi: 'Những luồng gió chiều quét qua đồng bằng Elysium Planitia làm rung hai cánh pin mặt trời rộng 2,15 m, truyền dao động điều hòa nhẹ xuống nền đất bên dưới.',
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
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
        // Low tectonic P-wave rumble (58 Hz) transitioning to S-wave (82 Hz)
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
        // Sharp high-frequency impact spike + downward acoustic chirp
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
        // Martian wind harmonic sweep
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
          // ignore already stopped
        }
      };
    } catch {
      // Fallback visual-only timer if Web Audio is blocked
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
      ctx.fillStyle = '#070B14';
      ctx.fillRect(0, 0, w, h);

      // Oscilloscope grid
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.14)';
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

      // P-wave and S-wave marker vertical lines
      const pX = Math.round(w * 0.24);
      const sX = Math.round(w * 0.54);
      ctx.strokeStyle = 'rgba(100, 223, 223, 0.45)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(pX, 0);
      ctx.lineTo(pX, h);
      ctx.moveTo(sX, 0);
      ctx.lineTo(sX, h);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#64DFDF';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillText('P-WAVE (Primary)', pX + 6, 18);
      ctx.fillText('S-WAVE (Shear)', sX + 6, 18);

      // Draw seismic waveform trace
      const elapsedSec = isPlaying ? (timestamp - playStartRef.current) / 1000 : 1.8;
      const phaseShift = isPlaying ? elapsedSec * 14 : 2.5;

      ctx.strokeStyle = mode === 'meteorite' ? '#64DFDF' : '#F4A261';
      ctx.lineWidth = 2.2;
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
          // Wind
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
    <div className="rounded-xl border border-slate-800 bg-[#0B1220] p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-[#F4A261] font-semibold">[VERIFIED NASA/NSSDCA DATA: 1,319 MARSQUAKES]</span>
          <span className="text-slate-600">·</span>
          <span className="text-[#64DFDF]">[EDUCATIONAL SIMULATION · 60x WEB AUDIO SYNTH]</span>
        </div>
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
              className={`p-3 rounded-lg border text-left transition-colors ${
                active
                  ? 'bg-[#16233B] border-[#F4A261] text-white'
                  : 'bg-[#0E1729] border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="text-[11px] font-mono text-[#F4A261] mb-1">{m.code}</div>
              <div className="text-xs font-semibold leading-snug">{m.title[lang]}</div>
            </button>
          );
        })}
      </div>

      {/* Live HTML5 Canvas Oscilloscope */}
      <div className="relative rounded-lg border border-slate-800 bg-[#070B14] overflow-hidden mb-4">
        <canvas
          ref={canvasRef}
          width={760}
          height={190}
          data-testid="seismic-oscilloscope-canvas"
          className="w-full h-[180px] block"
        />
        <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 border-t border-slate-800/80 bg-[#0A101E] text-xs font-mono text-slate-300">
          <span>
            {lang === 'en' ? 'Raw Martian Ground Freq:' : 'Tần số nền đất thực tế:'}{' '}
            <strong className="text-white">{currentConfig.rawFreqLabel}</strong>
          </span>
          <span>
            {lang === 'en' ? 'Audible Sonification (60x):' : 'Âm thanh hóa (Tăng tốc 60x):'}{' '}
            <strong className="text-[#64DFDF]">{currentConfig.sonifiedFreqLabel}</strong>
          </span>
        </div>
      </div>

      <p className="text-sm text-slate-300 leading-relaxed mb-4">
        {currentConfig.description[lang]}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() =>
              isPlaying ? stopSynthesizer() : triggerSeismicSonification(mode)
            }
            className="px-4 py-2 text-xs font-mono font-semibold rounded-lg bg-[#F4A261] text-[#070B14] hover:bg-[#FFD1A6] transition-colors whitespace-nowrap shrink-0"
          >
            {isPlaying
              ? lang === 'en'
                ? 'Stop 60x Sonification ■'
                : 'Dừng phát âm thanh ■'
              : lang === 'en'
                ? 'Synthesize 60x Seismic Audio ▶'
                : 'Phát Âm thanh Địa chấn 60x ▶'}
          </button>

          <a
            href="https://science.nasa.gov/resource/listen-to-nasas-insight-at-work-on-mars/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 text-xs font-mono rounded-lg border border-slate-700 text-slate-200 hover:border-[#F4A261] hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            {lang === 'en'
              ? 'Official NASA Audio Archive ↗'
              : 'Kho âm thanh gốc của NASA ↗'}
          </a>
        </div>

        <span className="text-[11px] font-mono text-slate-400 max-w-md">
          {lang === 'en'
            ? 'Scientific Note: Raw Martian seismic waves vibrate below 20 Hz; NASA speeds recordings up 60x so human ears can hear them.'
            : 'Ghi chú khoa học: Sóng địa chấn Sao Hỏa gốc có tần số dưới ngưỡng nghe của tai người (<20 Hz); NASA phải tua nhanh 60 lần.'}
        </span>
      </div>
    </div>
  );
};
