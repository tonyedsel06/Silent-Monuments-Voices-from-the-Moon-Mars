import React, { useEffect, useRef, useState } from 'react';
import {
  CHAPTER_TITLES,
  GIS_LANDMARKS,
  GisLandmark,
  HardwareHotspot,
  Language,
  OFFICIAL_REFERENCES,
  QUIZ_QUESTIONS,
  TEAM_METADATA,
} from './data/bilingualContent';
import {
  calculateMissionClocks,
  calculateSolarPowerFromDust,
  evaluatePowerAllocation,
  gradeExplorerQuiz,
} from './utils/missionMath';
import {
  CHAPTER_BACKDROPS,
  DIRECT_NASA_PHOTO_URLS,
  preloadCriticalNasaAssets,
} from './utils/nasaMedia';
import { NasaPhotoViewer } from './components/NasaPhotoViewer';
import { PlanetaryGisGlobe3D } from './components/PlanetaryGisGlobe3D';
import { InSightLander3D } from './components/InSightLander3D';
import { SeismicSonificationLab } from './components/SeismicSonificationLab';
import { MartianInteriorCutaway } from './components/MartianInteriorCutaway';
import { LunarLaserRangingLab } from './components/LunarLaserRangingLab';
import { MissionEmblemGenerator } from './components/MissionEmblemGenerator';
import { ReferenceDeskModal } from './components/ReferenceDeskModal';

interface ChapterBackdropWrapperProps {
  chapterIdx: number;
  lang: Language;
  id: string;
  ariaLabelledBy: string;
  children: React.ReactNode;
}

const ChapterBackdropWrapper: React.FC<ChapterBackdropWrapperProps> = ({
  chapterIdx,
  lang,
  id,
  ariaLabelledBy,
  children,
}) => {
  const meta = CHAPTER_BACKDROPS[chapterIdx] ?? CHAPTER_BACKDROPS[0];
  const [imgSrc, setImgSrc] = useState<string>(meta.primaryUrl);

  useEffect(() => {
    setImgSrc(meta.primaryUrl);
  }, [meta.primaryUrl]);

  const isLunar = meta.theme === 'moon';

  return (
    <section
      id={id}
      aria-labelledby={ariaLabelledBy}
      className={`relative rounded-3xl overflow-hidden border shadow-2xl transition-colors ${
        isLunar
          ? 'border-[#64DFDF]/25 bg-[#1A2436]'
          : 'border-[#F4A261]/25 bg-[#2A1812]'
      }`}
    >
      {/* Real NASA Photograph Background with Slow Living Ken Burns Motion */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <img
          src={imgSrc}
          alt=""
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => {
            if (imgSrc !== meta.fallbackUrl) {
              setImgSrc(meta.fallbackUrl);
            }
          }}
          className="w-full h-full object-cover opacity-35 animate-ken-burns"
        />
        {/* Translucent Sunlit Terracotta or Lunar Silver-Slate Gradient Overlay */}
        <div
          className={`absolute inset-0 ${
            isLunar
              ? 'bg-gradient-to-br from-[#1A2436]/88 via-[#24344D]/82 to-[#162030]/92'
              : 'bg-gradient-to-br from-[#2A1812]/88 via-[#4A2518]/80 to-[#24130E]/92'
          }`}
        />
        {/* Warm Ambient Sunlight Glow */}
        <div
          className="absolute inset-0 opacity-35"
          style={{
            background: isLunar
              ? 'radial-gradient(circle at 82% 18%, rgba(100, 223, 223, 0.22), transparent 55%)'
              : 'radial-gradient(circle at 82% 18%, rgba(255, 209, 166, 0.26), transparent 55%)',
          }}
        />
      </div>

      {/* Foreground Chapter Content */}
      <div className="relative z-10 p-5 sm:p-8 lg:p-10 space-y-8">
        {children}

        {/* Ultra-Compact Chapter Backdrop Photo Citation Pill */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/10 text-xs text-[#F3E5D8]/75">
          <span>
            {lang === 'en' ? 'Chapter Backdrop:' : 'Ảnh nền chương:'} {meta.caption[lang]}
          </span>
          <a
            href={meta.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/30 border border-white/15 text-[#FFD1A6] hover:text-white font-semibold transition-colors"
          >
            {lang === 'en' ? `Source: ${meta.credit} ↗` : `Nguồn: ${meta.credit} ↗`}
          </a>
        </div>
      </div>
    </section>
  );
};

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [currentChapter, setCurrentChapter] = useState<number>(0);
  const [displayMode, setDisplayMode] = useState<'chapter' | 'all'>('chapter');
  const [isRefModalOpen, setIsRefModalOpen] = useState<boolean>(false);

  // Chapter 01 cursor-reactive Martian dust & sunlight overlay canvas over real NASA photo
  const heroCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const cursorRef = useRef({ x: 0.5, y: 0.5 });
  const [heroPhotoUrl, setHeroPhotoUrl] = useState<string>(DIRECT_NASA_PHOTO_URLS.PIA22876);

  // Chapter 02 GIS state
  const [gisBody, setGisBody] = useState<'mars' | 'moon'>('mars');
  const [selectedLandmarkId, setSelectedLandmarkId] = useState<GisLandmark['id']>('insight');

  // Chapter 03 Lander vs Rover comparison state
  const [architectureTab, setArchitectureTab] = useState<'lander' | 'rover'>('lander');

  // Chapter 04 3D Lander Hotspot & Quick Discovery Challenge
  const [selectedHotspotId, setSelectedHotspotId] = useState<HardwareHotspot['id']>('seis');
  const [ch4Choice, setCh4Choice] = useState<'seis' | 'panel' | 'camera' | null>(null);

  // Chapter 07 Dust & Power Scrubber + Power Trade-Off Lab
  const [dustPercent, setDustPercent] = useState<number>(75);
  const [powerAlloc, setPowerAlloc] = useState({
    survivalHeatersWh: 200,
    seisSeismometerWh: 180,
    uhfTelemetryWh: 90,
    hp3MoleWh: 0,
  });

  // Chapter 09 Baseline Comparison Toggle
  const [baselineView, setBaselineView] = useState<'comparison' | 'raw' | 'solution'>('comparison');

  // Chapter 10 Quiz & 8K Mission Emblem Generator
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([null, null, null, null]);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [explorerName, setExplorerName] = useState<string>('');
  const [generatedCallsign, setGeneratedCallsign] = useState<string>('EXPLORER-NS01048');

  // Preload all critical NASA photographs on initial boot
  useEffect(() => {
    preloadCriticalNasaAssets();
  }, []);

  const missionClocks = calculateMissionClocks('2026-11-14T00:00:00Z');
  const solarMetrics = calculateSolarPowerFromDust(dustPercent);
  const powerEvaluation = evaluatePowerAllocation(solarMetrics.wattHoursPerSol, powerAlloc);
  const quizEvaluation = gradeExplorerQuiz(quizAnswers, [1, 2, 0, 1]);

  const selectedLandmark =
    GIS_LANDMARKS.find((l) => l.id === selectedLandmarkId) ?? GIS_LANDMARKS[0];

  const goToChapter = (index: number) => {
    const clamped = Math.max(0, Math.min(9, index));
    setCurrentChapter(clamped);
    if (displayMode === 'chapter') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.getElementById(`chapter-section-${clamped}`);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowRight' && currentChapter < 9) {
        goToChapter(currentChapter + 1);
      } else if (e.key === 'ArrowLeft' && currentChapter > 0) {
        goToChapter(currentChapter - 1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  // Chapter 01 transparent Martian dust particles & warm sunlight flare overlay over real NASA photo
  useEffect(() => {
    const canvas = heroCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const particles = Array.from({ length: 38 }, (_, i) => ({
      x: ((i * 73) % 100) / 100,
      y: ((i * 41) % 100) / 100,
      r: 1.3 + (i % 3) * 0.85,
      vx: 0.00045 + (i % 4) * 0.00018,
      vy: -0.00015 + (i % 3) * 0.0001,
    }));

    let animId = 0;
    const renderDustOverlay = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Warm golden-amber sunlight flare responding to cursor
      const sunX = w * (0.76 + (cursorRef.current.x - 0.5) * 0.1);
      const sunY = h * (0.26 + (cursorRef.current.y - 0.5) * 0.08);
      const sunGrad = ctx.createRadialGradient(sunX, sunY, 4, sunX, sunY, 150);
      sunGrad.addColorStop(0, 'rgba(255, 224, 186, 0.52)');
      sunGrad.addColorStop(0.45, 'rgba(244, 162, 97, 0.22)');
      sunGrad.addColorStop(1, 'rgba(244, 162, 97, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 150, 0, Math.PI * 2);
      ctx.fill();

      // Floating iron-oxide dust motes drifting across the real NASA photograph
      particles.forEach((p) => {
        p.x = (p.x + p.vx + (cursorRef.current.x - 0.5) * 0.0014 + 1) % 1;
        p.y = (p.y + p.vy + 1) % 1;
        ctx.fillStyle = 'rgba(255, 218, 180, 0.68)';
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(renderDustOverlay);
    };

    renderDustOverlay();
    return () => cancelAnimationFrame(animId);
  }, [currentChapter, displayMode]);

  const isChapterVisible = (idx: number) => displayMode === 'all' || currentChapter === idx;
  const activeBackdropTheme = CHAPTER_BACKDROPS[currentChapter]?.theme ?? 'mars';

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-700 ${
        activeBackdropTheme === 'moon'
          ? 'bg-gradient-to-b from-[#1A2436] via-[#243247] to-[#172030] text-[#FFF8F2]'
          : 'bg-gradient-to-b from-[#2A1812] via-[#3D2016] to-[#24140E] text-[#FFF8F2]'
      }`}
    >
      {/* Sticky Top Navigation Bar with Continuous Animated Glowing Horizon Line */}
      <header className="sticky top-0 z-40 bg-[#22130E]/95 shadow-xl">
        <div className="max-w-[1360px] mx-auto px-3 sm:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-6">
          {/* Zone 1: Brand Title */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              goToChapter(0);
            }}
            className="font-serif-editorial text-sm sm:text-lg font-bold tracking-tight text-[#FFF8F2] whitespace-nowrap shrink-0"
          >
            Silent Monuments
          </a>

          {/* Zone 2: Direct 10-Chapter Navigation Pills */}
          <nav
            aria-label="Chapter group navigation"
            className="hidden lg:flex items-center gap-1 text-[11px] font-semibold text-[#F3E5D8]"
          >
            {CHAPTER_TITLES.map((ch, idx) => {
              const isActive = currentChapter === idx;
              return (
                <button
                  key={ch.num}
                  type="button"
                  onClick={() => goToChapter(idx)}
                  title={`${ch.num}. ${ch.title[lang]}`}
                  className={`px-2 py-1 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-[#F4A261] text-[#1F110C] font-bold shadow-sm'
                      : 'text-[#F3E5D8]/85 hover:bg-[#382017] hover:text-white'
                  }`}
                >
                  {ch.num}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Mode Toggle + [ EN | VI ] + Reference Desk */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <button
              type="button"
              data-testid="reading-mode-toggle-btn"
              onClick={() => setDisplayMode((m) => (m === 'chapter' ? 'all' : 'chapter'))}
              className="px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-semibold rounded-xl bg-[#341D15] text-[#FFD1A6] border border-[#F4A261]/35 hover:bg-[#46271C] transition-colors whitespace-nowrap shrink-0"
            >
              {displayMode === 'chapter'
                ? lang === 'en'
                  ? 'Mode: Focused Chapter'
                  : 'Chế độ: Từng chương'
                : lang === 'en'
                  ? 'Mode: Full 10-Chapter Scroll'
                  : 'Chế độ: Cuộn 10 chương'}
            </button>

            <div
              role="group"
              aria-label="Language switcher"
              className="flex items-center bg-[#341D15] p-0.5 rounded-xl border border-[#F4A261]/35"
            >
              <button
                type="button"
                onClick={() => setLang('en')}
                aria-pressed={lang === 'en'}
                className={`px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  lang === 'en'
                    ? 'bg-[#F4A261] text-[#1F110C]'
                    : 'text-[#F3E5D8] hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang('vi')}
                aria-pressed={lang === 'vi'}
                className={`px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  lang === 'vi'
                    ? 'bg-[#F4A261] text-[#1F110C]'
                    : 'text-[#F3E5D8] hover:text-white'
                }`}
              >
                VI
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsRefModalOpen(true)}
              className="px-2.5 sm:px-3.5 py-1.5 text-[11px] sm:text-xs font-semibold rounded-xl bg-[#341D15] text-[#FFF8F2] border border-[#F4A261]/35 hover:border-[#FFD1A6] transition-colors whitespace-nowrap shrink-0"
            >
              {lang === 'en' ? 'Reference Desk' : 'Nguồn Tư liệu'}
            </button>
          </div>
        </div>

        {/* Continuous Animated Glowing Horizon Line + Chapter Progress Indicator */}
        <div className="relative h-[3px] w-full bg-[#180D09] overflow-hidden">
          <div className="absolute inset-0 animate-horizon-glow opacity-80" />
          <div
            className="relative h-full bg-[#FFF8F2] shadow-[0_0_12px_#FFD1A6] transition-all duration-300"
            style={{ width: `${((currentChapter + 1) / 10) * 100}%` }}
          />
        </div>
      </header>

      {/* Main Content Container */}
      <main id="top" className="flex-1 max-w-[1360px] w-full mx-auto px-3 sm:px-8 py-6 sm:py-8 space-y-12">
        {/* ================================================================
            CHAPTER 01: THE MESSAGE AFTER SILENCE
           ================================================================ */}
        {isChapterVisible(0) && (
          <ChapterBackdropWrapper
            chapterIdx={0}
            lang={lang}
            id="chapter-section-0"
            ariaLabelledBy="ch01-heading"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* Left 7 cols: Concise, Emotional First-Person Opening */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3A2016]/90 border border-[#F4A261]/35 text-xs font-semibold text-[#FFD1A6] mb-4">
                    <span>
                      {lang === 'en'
                        ? 'Chapter 01 of 10 · Elysium Planitia, Mars (4.502°N, 135.623°E)'
                        : 'Chương 01 / 10 · Đồng bằng Elysium Planitia, Sao Hỏa (4,502°B, 135,623°Đ)'}
                    </span>
                  </div>

                  <h1
                    id="ch01-heading"
                    className="font-serif-editorial text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#FFF8F2] leading-[1.08] mb-5"
                  >
                    {lang === 'en' ? (
                      <>
                        My radio is quiet.{' '}
                        <span className="text-[#FFD1A6] italic font-semibold">
                          My seismic archive is still speaking.
                        </span>
                      </>
                    ) : (
                      <>
                        Ăng-ten của tôi đã lặng tiếng.{' '}
                        <span className="text-[#FFD1A6] italic font-semibold">
                          Nhưng kho dữ liệu địa chấn vẫn lên tiếng.
                        </span>
                      </>
                    )}
                  </h1>

                  <div className="space-y-4 text-base sm:text-lg text-[#F5E8DC] leading-relaxed max-w-2xl">
                    <p>
                      {lang === 'en'
                        ? 'I am InSight (2018-042A). My three titanium feet still rest in the rust-red dust of Elysium Planitia, 1.63 meters behind the copper-colored Wind and Thermal Shield I lowered onto the Martian soil in 2018.'
                        : 'Tôi là trạm đổ bộ InSight (2018-042A). Ba chân trụ bằng titan của tôi vẫn đứng trên lớp bụi đỏ Elysium Planitia, cách chiếc lồng chắn gió màu đồng 1,63 mét mà cánh tay tôi đã đặt xuống năm 2018.'}
                    </p>
                    <p>
                      {lang === 'en'
                        ? 'On December 15, 2022, fine iron-oxide dust veiled my twin solar wings and my transmitter fell silent. Yet across the Moon and Mars, silent explorers remain where humanity left them—not as forgotten scrap, but as enduring monuments and active optical beacons.'
                        : 'Ngày 15/12/2022, lớp bụi mịn oxit sắt phủ kín hai cánh pin mặt trời và bộ phát sóng của tôi ngừng đập. Nhưng khắp Mặt Trăng và Sao Hỏa, những thiết bị này vẫn ở lại—không phải phế liệu bị lãng quên, mà là những cột mốc khoa học vĩnh cửu.'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => goToChapter(1)}
                    className="px-5 py-3 text-sm font-bold rounded-xl bg-[#F4A261] text-[#1F110C] hover:bg-[#FFD1A6] transition-colors shadow-lg"
                  >
                    {lang === 'en'
                      ? 'Explore Chapter 02: Planetary GIS Observatory →'
                      : 'Khám phá Chương 02: Đài Quan sát GIS Hành tinh →'}
                  </button>
                  <button
                    type="button"
                    onClick={() => goToChapter(3)}
                    className="px-4 py-3 text-sm font-semibold rounded-xl border border-[#FFD1A6]/40 bg-[#321B13]/90 text-[#FFF8F2] hover:bg-[#45261B] transition-colors"
                  >
                    {lang === 'en' ? 'Inspect 3D InSight Lander' : 'Xem Mô hình 3D InSight'}
                  </button>
                </div>
              </div>

              {/* Right 5 cols: Real NASA Photography of InSight on Mars + Interactive Dust Overlay */}
              <div className="lg:col-span-5 flex flex-col rounded-2xl border border-[#F4A261]/35 bg-[#23140F] overflow-hidden shadow-2xl">
                <div
                  className="relative flex-1 min-h-[320px] bg-[#1A0E0A] overflow-hidden"
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    cursorRef.current = {
                      x: (e.clientX - rect.left) / rect.width,
                      y: (e.clientY - rect.top) / rect.height,
                    };
                  }}
                >
                  {/* Real High-Resolution NASA Photograph of InSight on Mars */}
                  <img
                    src={heroPhotoUrl}
                    alt={
                      lang === 'en'
                        ? 'NASA InSight Lander on Elysium Planitia, Mars (PIA22876)'
                        : 'Trạm đổ bộ InSight trên đồng bằng Elysium Planitia, Sao Hỏa (PIA22876)'
                    }
                    decoding="async"
                    referrerPolicy="no-referrer"
                    onError={() => {
                      if (heroPhotoUrl !== DIRECT_NASA_PHOTO_URLS.PIA23201) {
                        setHeroPhotoUrl(DIRECT_NASA_PHOTO_URLS.PIA23201);
                      }
                    }}
                    className="absolute inset-0 w-full h-full object-cover"
                  />

                  {/* Subtle Warm Gradient Vignette */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1D100B]/90 via-transparent to-[#1D100B]/45" />

                  {/* Interactive Cursor-Driven Martian Dust & Sunlight Canvas Overlay */}
                  <canvas
                    ref={heroCanvasRef}
                    width={560}
                    height={340}
                    data-testid="martian-horizon-canvas"
                    className="relative z-10 w-full h-full block"
                  />

                  <div className="absolute top-3 left-3 z-20 bg-[#23140F]/85 border border-[#F4A261]/40 px-3 py-1 rounded-full text-xs font-semibold text-[#FFD1A6]">
                    {lang === 'en'
                      ? 'Real NASA Photo (PIA22876) · Move Cursor to Drift Dust'
                      : 'Ảnh Thật NASA (PIA22876) · Di Chuột Tương Tác Hạt Bụi'}
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 z-20 bg-[#23140F]/90 border border-[#F4A261]/30 px-3.5 py-2 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-[#FFF8F2]">
                    <span>4.502°N, 135.623°E</span>
                    <span className="text-[#FFD1A6]">-2,655 m MOLA</span>
                    <span className="text-[#64DFDF]">1,319 Marsquakes</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Mission Elapsed Telemetry Strip */}
            <div className="rounded-2xl border border-[#F4A261]/25 bg-[#23140F]/90 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <span className="text-xs font-bold text-[#FFD1A6] uppercase tracking-wider">
                  {lang === 'en'
                    ? 'Verified NASA/NSSDCA Mission Clocks · Benchmark: 14 Nov 2026'
                    : 'Đồng Hồ Sứ Mệnh NASA/NSSDCA Đã Xác Minh · Mốc: 14/11/2026'}
                </span>
                <a
                  href="https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2018-042A"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 rounded-full bg-[#341D15] border border-[#F4A261]/30 text-xs font-semibold text-[#FFD1A6] hover:text-white"
                >
                  {lang === 'en' ? 'Source: NASA NSSDCA ↗' : 'Nguồn: NASA NSSDCA ↗'}
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Card 1: Apollo 11 LRRR */}
                <div className="p-4 rounded-xl border border-[#64DFDF]/25 bg-[#2C1812]/90">
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span className="text-[#64DFDF]">NSSDCA: {missionClocks.apollo11.nssdcaId}</span>
                    <span className="text-[#64DFDF]">
                      {lang === 'en' ? '● Still Active' : '● Đang Hoạt Động'}
                    </span>
                  </div>
                  <div className="text-base font-bold text-[#FFF8F2] mb-1">
                    {lang === 'en'
                      ? 'Apollo 11 Lunar Laser Retroreflector'
                      : 'Gương Phản Xạ Laser Apollo 11'}
                  </div>
                  <div className="text-3xl font-bold text-[#FFF8F2] tabular-nums">
                    {missionClocks.apollo11.yearsOnSurface}
                    <span className="text-xs font-medium text-[#FFD1A6] ml-1.5">
                      {lang === 'en'
                        ? `Years (${missionClocks.apollo11.daysOnSurface.toLocaleString()} Days)`
                        : `Năm (${missionClocks.apollo11.daysOnSurface.toLocaleString()} Ngày)`}
                    </span>
                  </div>
                  <p className="text-xs text-[#F3E5D8]/80 mt-1.5">
                    {lang === 'en'
                      ? 'Mare Tranquillitatis (0.674°N, 23.473°E) · 0 Watts required.'
                      : 'Biển Tĩnh Lặng (0,674°B, 23,473°Đ) · Tiêu thụ 0 Watt điện.'}
                  </p>
                </div>

                {/* Card 2: Opportunity Rover */}
                <div className="p-4 rounded-xl border border-[#F4A261]/25 bg-[#2C1812]/90">
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span className="text-[#F4A261]">
                      NSSDCA: {missionClocks.opportunity.nssdcaId}
                    </span>
                    <span className="text-[#FFD1A6]">
                      {lang === 'en' ? '▲ Silent Monument' : '▲ Đài Tưởng Niệm'}
                    </span>
                  </div>
                  <div className="text-base font-bold text-[#FFF8F2] mb-1">
                    {lang === 'en' ? 'Opportunity Rover (MER-B)' : 'Xe Tự Hành Opportunity (MER-B)'}
                  </div>
                  <div className="text-3xl font-bold text-[#FFF8F2] tabular-nums">
                    {missionClocks.opportunity.yearsOnSurface}
                    <span className="text-xs font-medium text-[#FFD1A6] ml-1.5">
                      {lang === 'en' ? 'Years Active · 45.16 km' : 'Năm Hoạt Động · 45,16 km'}
                    </span>
                  </div>
                  <p className="text-xs text-[#F3E5D8]/80 mt-1.5">
                    {lang === 'en'
                      ? 'Operated 5,111 sols (planned for 90) until the June 2018 global storm.'
                      : 'Hoạt động 5.111 sol (thiết kế 90 sol) tới cơn bão bụi tháng 6/2018.'}
                  </p>
                </div>

                {/* Card 3: InSight Lander */}
                <div className="p-4 rounded-xl border border-[#F4A261]/25 bg-[#2C1812]/90">
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span className="text-[#F4A261]">NSSDCA: {missionClocks.insight.nssdcaId}</span>
                    <span className="text-[#FFD1A6]">
                      {lang === 'en' ? '▲ Active Seismic Archive' : '▲ Kho Địa Chấn Sống'}
                    </span>
                  </div>
                  <div className="text-base font-bold text-[#FFF8F2] mb-1">
                    {lang === 'en'
                      ? 'InSight Mars Geophysical Lander'
                      : 'Trạm Đổ Bộ Địa Vật Lý InSight'}
                  </div>
                  <div className="text-3xl font-bold text-[#FFF8F2] tabular-nums">
                    {missionClocks.insight.daysOnSurface.toLocaleString()}
                    <span className="text-xs font-medium text-[#FFD1A6] ml-1.5">
                      {lang === 'en'
                        ? `Days on Mars (${missionClocks.insight.daysSinceLastSignal?.toLocaleString()} Silent)`
                        : `Ngày Trên Sao Hỏa (${missionClocks.insight.daysSinceLastSignal?.toLocaleString()} Tĩnh Lặng)`}
                    </span>
                  </div>
                  <p className="text-xs text-[#F3E5D8]/80 mt-1.5">
                    {lang === 'en'
                      ? 'Landed 26 Nov 2018 · Recorded 1,319 marsquakes that mapped Mars’ core.'
                      : 'Hạ cánh 26/11/2018 · Ghi nhận 1.319 trận động đất Sao Hỏa.'}
                  </p>
                </div>
              </div>
            </div>
          </ChapterBackdropWrapper>
        )}

        {/* ================================================================
            CHAPTER 02: PLANETARY GIS OBSERVATORY
           ================================================================ */}
        {isChapterVisible(1) && (
          <ChapterBackdropWrapper
            chapterIdx={1}
            lang={lang}
            id="chapter-section-1"
            ariaLabelledBy="ch02-heading"
          >
            <div className="max-w-3xl">
              <div className="text-xs font-bold text-[#64DFDF] uppercase tracking-wider mb-2">
                {lang === 'en'
                  ? 'Chapter 02 of 10 · Off-World Artifact Coordinate Registry'
                  : 'Chương 02 / 10 · Hệ Thống Tọa Độ Địa Lý (GIS) Các Di Sản Không Gian'}
              </div>
              <h2
                id="ch02-heading"
                className="font-serif-editorial text-3xl sm:text-4xl font-bold text-[#FFF8F2] mb-3"
              >
                {lang === 'en'
                  ? 'Planetary GIS Observatory: Where Do Our Explorers Rest?'
                  : 'Đài Quan Sát GIS Hành Tinh: Những Nhà Thám Hiểm Yên Nghỉ Ở Đâu?'}
              </h2>
              <p className="text-base text-[#F3E5D8] leading-relaxed">
                {lang === 'en'
                  ? 'Bringing a spacecraft back from Mars or the Moon would require ten times its weight in return rocket fuel. Instead, NASA engineers build missions to work on-site for life and beam their discoveries home across deep space.'
                  : 'Mang một trạm thăm dò từ Sao Hỏa hay Mặt Trăng quay về đòi hỏi lượng nhiên liệu nặng gấp chục lần chính nó. Vì vậy, NASA thiết kế các sứ mệnh làm việc trọn đời tại chỗ và truyền tri thức về Trái Đất qua sóng vô tuyến.'}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7">
                <PlanetaryGisGlobe3D
                  lang={lang}
                  selectedId={selectedLandmarkId}
                  onSelectLandmark={setSelectedLandmarkId}
                  activeBody={gisBody}
                  onChangeBody={setGisBody}
                />
              </div>

              {/* Selected Landmark Telemetry Dossier with Real NASA Hardware Photo */}
              <div className="lg:col-span-5 rounded-2xl border border-[#F4A261]/25 bg-[#23140F]/95 p-5 space-y-4 shadow-2xl">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F4A261]/20 pb-3">
                  <span className="text-xs font-bold text-[#F4A261]">
                    NSSDCA ID: {selectedLandmark.nssdcaId}
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      selectedLandmark.statusTone === 'emerald'
                        ? 'text-[#64DFDF]'
                        : 'text-[#FFD1A6]'
                    }`}
                  >
                    ● {selectedLandmark.statusBadge[lang]}
                  </span>
                </div>

                <div>
                  <h3 className="font-serif-editorial text-2xl font-bold text-[#FFF8F2]">
                    {selectedLandmark.name[lang]}
                  </h3>
                  <div className="text-xs font-semibold text-[#FFD1A6] mt-1">
                    {selectedLandmark.siteName[lang]} · {selectedLandmark.coordsLabel} ·{' '}
                    {selectedLandmark.elevationLabel}
                  </div>
                </div>

                <NasaPhotoViewer photoId={selectedLandmark.nasaPhotoId} lang={lang} compact />

                <div className="space-y-2 text-sm text-[#F3E5D8] leading-relaxed">
                  <p>{selectedLandmark.summary[lang]}</p>
                  <p className="text-xs text-[#F3E5D8]/80">
                    <strong className="text-[#FFD1A6]">
                      {lang === 'en' ? 'Site Geology: ' : 'Địa chất khu vực: '}
                    </strong>
                    {selectedLandmark.geology[lang]}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#1A0E0A] border border-[#F4A261]/25 flex items-center justify-between text-xs font-semibold">
                  <span className="text-[#FFD1A6]">{selectedLandmark.keyMetric[lang]}</span>
                  <a
                    href={selectedLandmark.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#64DFDF] hover:underline shrink-0 ml-2"
                  >
                    {lang === 'en' ? 'NSSDCA Record ↗' : 'Hồ sơ NSSDCA ↗'}
                  </a>
                </div>
              </div>
            </div>
          </ChapterBackdropWrapper>
        )}

        {/* ================================================================
            CHAPTER 03: TOUCHDOWN AT ELYSIUM PLANITIA
           ================================================================ */}
        {isChapterVisible(2) && (
          <ChapterBackdropWrapper
            chapterIdx={2}
            lang={lang}
            id="chapter-section-2"
            ariaLabelledBy="ch03-heading"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-6 space-y-5">
                <div className="text-xs font-bold text-[#FFD1A6] uppercase tracking-wider">
                  {lang === 'en'
                    ? 'Chapter 03 of 10 · 485 Million km Cruise to Elysium Planitia'
                    : 'Chương 03 / 10 · Hành Trình 485 Triệu km Tới Elysium Planitia'}
                </div>
                <h2
                  id="ch03-heading"
                  className="font-serif-editorial text-3xl sm:text-4xl font-bold text-[#FFF8F2]"
                >
                  {lang === 'en'
                    ? 'Touchdown at Elysium Planitia: Why the Flattest Plain on Mars?'
                    : 'Chạm Xuống Elysium Planitia: Vì Sao Chọn Đồng Bằng Phẳng Nhất Sao Hỏa?'}
                </h2>
                <p className="text-base text-[#F3E5D8] leading-relaxed">
                  {lang === 'en'
                    ? 'After cruising 485 million kilometers from Earth, InSight touched down on November 26, 2018. While rovers seek rugged canyons, InSight needed a quiet, level equatorial plain where its solar wings could soak up sunlight and its robotic arm could set a seismometer on flat soil.'
                    : 'Sau hành trình 485 triệu km từ Trái Đất, InSight hạ cánh ngày 26/11/2018. Trong khi các xe tự hành tìm đến hẻm núi hiểm trở, InSight cần một đồng bằng xích đạo phẳng lặng để đón nắng và đặt ống nghe địa chấn lên nền đất bằng phẳng.'}
                </p>

                {/* Interactive "Lander vs. Rover" Engineering Comparison Card */}
                <div className="rounded-2xl border border-[#F4A261]/25 bg-[#23140F]/95 p-5 shadow-xl">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-bold text-[#F4A261] uppercase tracking-wider">
                      {lang === 'en'
                        ? 'Engineering Architecture Comparison'
                        : 'So Sánh Kiến Trúc Kỹ Thuật'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <button
                      type="button"
                      onClick={() => setArchitectureTab('lander')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                        architectureTab === 'lander'
                          ? 'bg-[#F4A261] text-[#1F110C] border-[#F4A261]'
                          : 'bg-[#2C1812] text-[#F3E5D8] border-[#F4A261]/20'
                      }`}
                    >
                      {lang === 'en' ? 'Stationary Lander (InSight)' : 'Trạm Cố Định (InSight)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setArchitectureTab('rover')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                        architectureTab === 'rover'
                          ? 'bg-[#64DFDF] text-[#111C28] border-[#64DFDF]'
                          : 'bg-[#2C1812] text-[#F3E5D8] border-[#F4A261]/20'
                      }`}
                    >
                      {lang === 'en' ? 'Mobile Rover (Opportunity)' : 'Xe Tự Hành (Opportunity)'}
                    </button>
                  </div>

                  {architectureTab === 'lander' ? (
                    <div className="space-y-1.5 text-sm text-[#F3E5D8]">
                      <div className="font-bold text-[#FFD1A6]">
                        {lang === 'en'
                          ? 'Why InSight Has Zero Wheels:'
                          : 'Vì sao InSight không có bánh xe:'}
                      </div>
                      <p className="text-xs text-[#F3E5D8]/90 leading-relaxed">
                        {lang === 'en'
                          ? 'A doctor cannot listen to a heartbeat while the patient is sprinting. Detecting ground motion smaller than a hydrogen atom (10⁻¹⁰ m/s²) required a motionless three-legged anchor in direct contact with the regolith.'
                          : 'Bác sĩ không thể nghe nhịp tim khi bệnh nhân đang chạy. Để đo rung động nhỏ hơn nguyên tử hydro (10⁻¹⁰ m/s²), trạm cần đứng yên tuyệt đối trên ba chân trụ vững chắc.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1.5 text-sm text-[#F3E5D8]">
                      <div className="font-bold text-[#64DFDF]">
                        {lang === 'en'
                          ? 'Why Opportunity Needed 6 Wheels:'
                          : 'Vì sao Opportunity cần 6 bánh xe:'}
                      </div>
                      <p className="text-xs text-[#F3E5D8]/90 leading-relaxed">
                        {lang === 'en'
                          ? 'Field geologists walk from crater to outcrop. Opportunity drove 45.16 km over 5,111 sols, discovering spherical hematite "blueberries" that proved ancient liquid water once soaked Mars.'
                          : 'Nhà địa chất phải đi qua từng vỉa đá. Opportunity đã lăn bánh 45,16 km suốt 5.111 sol, phát hiện các viên hematit chứng minh nước lỏng từng chảy trên Sao Hỏa.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right 6 cols: Live NASA Photo Viewers for PIA22876 and PIA22948 */}
              <div className="lg:col-span-6 space-y-5">
                <NasaPhotoViewer photoId="PIA22876" lang={lang} compact />
                <NasaPhotoViewer photoId="PIA22948" lang={lang} compact />
              </div>
            </div>
          </ChapterBackdropWrapper>
        )}

        {/* ================================================================
            CHAPTER 04: MEET INSIGHT & THE PLANET'S STETHOSCOPE
           ================================================================ */}
        {isChapterVisible(3) && (
          <ChapterBackdropWrapper
            chapterIdx={3}
            lang={lang}
            id="chapter-section-3"
            ariaLabelledBy="ch04-heading"
          >
            <div className="max-w-3xl">
              <div className="text-xs font-bold text-[#FFD1A6] uppercase tracking-wider mb-2">
                {lang === 'en'
                  ? 'Chapter 04 of 10 · 3D Hardware Anatomy & NASA Eyes Live Telemetry'
                  : 'Chương 04 / 10 · Giải Phẫu Phần Cứng 3D & NASA Eyes Trực Tiếp'}
              </div>
              <h2
                id="ch04-heading"
                className="font-serif-editorial text-3xl sm:text-4xl font-bold text-[#FFF8F2] mb-3"
              >
                {lang === 'en'
                  ? 'Meet InSight & The Planet’s Stethoscope (SEIS)'
                  : 'Giải Phẫu 3D InSight & Chiếc Ống Nghe Hành Tinh (SEIS)'}
              </h2>
              <p className="text-base text-[#F3E5D8] leading-relaxed">
                {lang === 'en'
                  ? 'On December 19, 2018 (Sol 22), InSight’s 1.8-meter robotic arm placed the copper-clad SEIS seismometer directly onto Martian soil—the first seismometer ever set on another planet’s ground. Click any glowing hotspot dot or subsystem button to inspect its single callout line.'
                  : 'Ngày 19/12/2018 (Sol 22), cánh tay robot dài 1,8 mét đã đặt máy đo địa chấn SEIS bọc đồng trực tiếp xuống đất Sao Hỏa. Hãy nhấn vào điểm sáng trên mô hình 3D hoặc nút bộ phận bên phải để xem đường dẫn giải thích.'}
              </p>
            </div>

            <InSightLander3D
              lang={lang}
              selectedHotspotId={selectedHotspotId}
              onSelectHotspot={setSelectedHotspotId}
              dustFactor={dustPercent / 100}
            />

            {/* Quick Discovery Challenge Card */}
            <div className="rounded-2xl border border-[#F4A261]/25 bg-[#23140F]/95 p-5 shadow-xl">
              <div className="text-xs font-bold text-[#F4A261] uppercase tracking-wider mb-1">
                {lang === 'en'
                  ? 'Quick Discovery Challenge'
                  : 'Thử Thách Khám Phá Nhanh'}
              </div>
              <h3 className="text-lg font-bold text-[#FFF8F2] mb-3">
                {lang === 'en'
                  ? 'Which instrument on InSight detects ground motion smaller than a hydrogen atom?'
                  : 'Thiết bị nào của InSight phát hiện được rung động mặt đất nhỏ hơn cả nguyên tử hydro?'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <button
                  type="button"
                  onClick={() => {
                    setCh4Choice('seis');
                    setSelectedHotspotId('seis');
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-colors ${
                    ch4Choice === 'seis'
                      ? 'bg-[#2C2018] border-[#64DFDF] text-[#FFF8F2]'
                      : 'bg-[#2C1812] border-[#F4A261]/20 text-[#F3E5D8] hover:border-[#F4A261]/50'
                  }`}
                >
                  <strong className="block text-sm font-bold text-[#64DFDF]">
                    A. SEIS Seismometer
                  </strong>
                  <span className="text-xs text-[#F3E5D8]/80">
                    {lang === 'en'
                      ? 'Vacuum-sealed pendulum sensors on Martian soil'
                      : 'Cảm biến con lắc chân không đặt trên mặt đất'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCh4Choice('panel');
                    setSelectedHotspotId('arrays');
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-colors ${
                    ch4Choice === 'panel'
                      ? 'bg-[#3B2117] border-[#F4A261] text-[#FFF8F2]'
                      : 'bg-[#2C1812] border-[#F4A261]/20 text-[#F3E5D8] hover:border-[#F4A261]/50'
                  }`}
                >
                  <strong className="block text-sm font-bold text-[#F4A261]">
                    B. Twin Decagonal Solar Arrays
                  </strong>
                  <span className="text-xs text-[#F3E5D8]/80">
                    {lang === 'en'
                      ? 'Converts sunlight into electrical Watt-hours'
                      : 'Chuyển đổi ánh nắng thành điện năng'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCh4Choice('camera');
                    setSelectedHotspotId('arm');
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-colors ${
                    ch4Choice === 'camera'
                      ? 'bg-[#3B2117] border-[#F4A261] text-[#FFF8F2]'
                      : 'bg-[#2C1812] border-[#F4A261]/20 text-[#F3E5D8] hover:border-[#F4A261]/50'
                  }`}
                >
                  <strong className="block text-sm font-bold text-[#F4A261]">
                    C. IDC Elbow Camera
                  </strong>
                  <span className="text-xs text-[#F3E5D8]/80">
                    {lang === 'en'
                      ? 'Captures panoramic workspace photographs'
                      : 'Chụp ảnh toàn cảnh khu vực làm việc'}
                  </span>
                </button>
              </div>

              {ch4Choice && (
                <div
                  className={`p-3.5 rounded-xl border text-xs font-medium leading-relaxed ${
                    ch4Choice === 'seis'
                      ? 'bg-[#122628] border-[#64DFDF] text-[#64DFDF]'
                      : 'bg-[#2E1812] border-[#F4A261] text-[#FFD1A6]'
                  }`}
                >
                  {ch4Choice === 'seis'
                    ? lang === 'en'
                      ? '● Correct: SEIS uses three pendulum sensors inside a titanium vacuum sphere to resolve ground displacements smaller than 0.05 nanometers.'
                      : '● Chính xác: SEIS sử dụng 3 con lắc trong quả cầu chân không titan, phát hiện độ dịch chuyển nhỏ hơn 0,05 nanômét.'
                    : lang === 'en'
                      ? '▲ Not quite: Solar arrays generate electricity and the IDC camera photographs the deck. Select A (SEIS Seismometer).'
                      : '▲ Chưa chính xác: Hãy chọn đáp án A (Máy đo địa chấn SEIS).'}
                </div>
              )}
            </div>
          </ChapterBackdropWrapper>
        )}

        {/* ================================================================
            CHAPTER 05: 1,319 HEARTBEATS OF MARS
           ================================================================ */}
        {isChapterVisible(4) && (
          <ChapterBackdropWrapper
            chapterIdx={4}
            lang={lang}
            id="chapter-section-4"
            ariaLabelledBy="ch05-heading"
          >
            <div className="max-w-3xl">
              <div className="text-xs font-bold text-[#FFD1A6] uppercase tracking-wider mb-2">
                {lang === 'en'
                  ? 'Chapter 05 of 10 · Sol 128 First Marsquake to 1,319 Cataloged Events'
                  : 'Chương 05 / 10 · Từ Trận Động Đất Sol 128 Đến 1.319 Sự Kiện Địa Chấn'}
              </div>
              <h2
                id="ch05-heading"
                className="font-serif-editorial text-3xl sm:text-4xl font-bold text-[#FFF8F2] mb-3"
              >
                {lang === 'en'
                  ? '1,319 Heartbeats of Mars: Listening to a Living World'
                  : '1.319 Nhịp Tim Của Sao Hỏa: Lắng Nghe Một Hành Tinh Đang Sống'}
              </h2>
              <p className="text-base text-[#F3E5D8] leading-relaxed">
                {lang === 'en'
                  ? 'On April 6, 2019 (Sol 128), as the evening wind died down, SEIS recorded a faint subterranean rumble—humanity’s first confirmed marsquake. By mission’s end, InSight had cataloged 1,319 marsquakes and meteorite strikes.'
                  : 'Chiều ngày 06/04/2019 (Sol 128), khi gió lặng dần, SEIS đã bắt được tiếng rền trầm đục từ lòng đất—trận động đất Sao Hỏa đầu tiên được xác nhận. Tổng cộng InSight đã ghi nhận 1.319 trận động đất và va chạm thiên thạch.'}
              </p>
            </div>

            <SeismicSonificationLab lang={lang} />
          </ChapterBackdropWrapper>
        )}

        {/* ================================================================
            CHAPTER 06: DEEP INSIDE THE RED PLANET & THE HP3 LESSON
           ================================================================ */}
        {isChapterVisible(5) && (
          <ChapterBackdropWrapper
            chapterIdx={5}
            lang={lang}
            id="chapter-section-5"
            ariaLabelledBy="ch06-heading"
          >
            <div className="max-w-3xl">
              <div className="text-xs font-bold text-[#FFD1A6] uppercase tracking-wider mb-2">
                {lang === 'en'
                  ? 'Chapter 06 of 10 · Planetary Tomography & The HP³ Mole Lesson'
                  : 'Chương 06 / 10 · Cắt Lớp Địa Chấn Học & Bài Học Từ Mũi Khoan HP³'}
              </div>
              <h2
                id="ch06-heading"
                className="font-serif-editorial text-3xl sm:text-4xl font-bold text-[#FFF8F2] mb-3"
              >
                {lang === 'en'
                  ? 'Deep Inside the Red Planet & When Engineering Hits a Wall'
                  : 'Nhìn Xuyên Lòng Đất Đỏ & Bài Học Kỹ Thuật Từ Mũi Khoan HP³'}
              </h2>
              <p className="text-base text-[#F3E5D8] leading-relaxed">
                {lang === 'en'
                  ? 'Primary (P) and shear (S) waves bend and reflect at boundaries between rock and liquid metal, revealing Mars’ crust, mantle, and 1,830-km molten core—while the HP³ heat probe taught engineers a lasting lesson about Martian soil.'
                  : 'Sóng dọc P và sóng ngang S khúc xạ và phản xạ tại ranh giới giữa đá rắn và kim loại lỏng, hé lộ lớp vỏ, manti và lõi lỏng 1.830 km—trong khi mũi khoan HP³ để lại bài học quý giá về cơ học đất Sao Hỏa.'}
              </p>
            </div>

            <MartianInteriorCutaway lang={lang} />
          </ChapterBackdropWrapper>
        )}

        {/* ================================================================
            CHAPTER 07: WHEN THE RED DUST FALLS (INSIGHT & OPPORTUNITY)
           ================================================================ */}
        {isChapterVisible(6) && (
          <ChapterBackdropWrapper
            chapterIdx={6}
            lang={lang}
            id="chapter-section-6"
            ariaLabelledBy="ch07-heading"
          >
            <div className="max-w-3xl">
              <div className="text-xs font-bold text-[#FFD1A6] uppercase tracking-wider mb-2">
                {lang === 'en'
                  ? 'Chapter 07 of 10 · Solar Power Decline (5,000 Wh → 500 Wh) & Resource Lab'
                  : 'Chương 07 / 10 · Suy Giảm Điện Mặt Trời (5.000 Wh → 500 Wh) & Phân Bổ Nguồn Lực'}
              </div>
              <h2
                id="ch07-heading"
                className="font-serif-editorial text-3xl sm:text-4xl font-bold text-[#FFF8F2] mb-3"
              >
                {lang === 'en'
                  ? 'When the Red Dust Falls: InSight & Opportunity’s Shared Fate'
                  : 'Khi Bụi Đỏ Che Khuất Mặt Trời: Số Phận Chung Của InSight & Opportunity'}
              </h2>
              <p className="text-base text-[#F3E5D8] leading-relaxed">
                {lang === 'en'
                  ? 'Drag the scrubber below from 2018 (0% dust) to 2022 (90% dust) to see how iron-oxide grains coated the solar wings and forced engineers to ration every final watt-hour.'
                  : 'Kéo thanh trượt bên dưới từ năm 2018 (0% bụi) đến năm 2022 (90% bụi) để quan sát lớp bụi đỏ phủ dần lên cánh pin và đặt mình vào bài toán chia sẻ từng Watt-giờ điện cuối cùng.'}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 rounded-2xl border border-[#F4A261]/25 bg-[#23140F]/95 p-5 space-y-5 shadow-2xl">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#F4A261]">
                    {lang === 'en'
                      ? 'Verified Solar Array Telemetry (2018–2022)'
                      : 'Dữ Liệu Điện Mặt Trời Đã Xác Minh (2018–2022)'}
                  </span>
                  <span className="text-xs font-semibold text-[#FFD1A6]">
                    {lang === 'en' ? solarMetrics.dateLabelEn : solarMetrics.dateLabelVi}
                  </span>
                </div>

                <div>
                  <label
                    htmlFor="dust-scrubber-input"
                    className="flex items-center justify-between text-sm font-bold text-[#FFF8F2] mb-2"
                  >
                    <span>
                      {lang === 'en'
                        ? `Solar Array Dust Coating: ${solarMetrics.dustClamped}%`
                        : `Độ che phủ bụi trên cánh pin: ${solarMetrics.dustClamped}%`}
                    </span>
                    <span className="text-[#FFD1A6] tabular-nums">
                      {solarMetrics.wattHoursPerSol.toLocaleString()} Wh / sol (
                      {solarMetrics.percentOfInitial}%)
                    </span>
                  </label>
                  <input
                    id="dust-scrubber-input"
                    type="range"
                    min={0}
                    max={90}
                    step={5}
                    value={dustPercent}
                    onChange={(e) => setDustPercent(Number(e.target.value))}
                    className="w-full accent-[#F4A261] cursor-pointer h-2 bg-[#3A2016] rounded-lg"
                  />
                  <div className="flex justify-between text-xs text-[#F3E5D8]/80 mt-1.5">
                    <span>0% · Nov 2018 (~5,000 Wh)</span>
                    <span>45% · 2020 (~2,750 Wh)</span>
                    <span>90% · 2022 (~500 Wh)</span>
                  </div>
                </div>

                <NasaPhotoViewer
                  photoId={dustPercent >= 65 ? 'PIA25287' : 'PIA22876'}
                  lang={lang}
                  dustOverlayOpacity={dustPercent < 65 ? dustPercent / 90 : 0}
                  compact
                />
              </div>

              {/* Right 5 cols: Classroom Power Allocation Lab */}
              <div className="lg:col-span-5 rounded-2xl border border-[#F4A261]/25 bg-[#23140F]/95 p-5 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#64DFDF]">
                    {lang === 'en' ? 'Interactive Power Budget Lab' : 'Phòng Lab Phân Bổ Điện Năng'}
                  </span>
                  <a
                    href="https://science.nasa.gov/resource/insights-power-generation-after-landing-and-spring-2022/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#FFD1A6] hover:underline"
                  >
                    {lang === 'en' ? 'Source: NASA ↗' : 'Nguồn: NASA ↗'}
                  </a>
                </div>

                <h3 className="text-lg font-bold text-[#FFF8F2]">
                  {lang === 'en'
                    ? 'Mission Planner Power Simulator'
                    : 'Mô Phỏng Ngân Sách Điện Năng'}
                </h3>
                <p className="text-xs text-[#F3E5D8] leading-relaxed">
                  {lang === 'en'
                    ? `Available energy: ${solarMetrics.wattHoursPerSol} Wh/sol. Balance heaters, SEIS, and radio within budget.`
                    : `Điện khả dụng: ${solarMetrics.wattHoursPerSol} Wh/sol. Hãy cân đối bộ sưởi, SEIS và bộ phát sóng.`}
                </p>

                <div className="space-y-3 text-xs">
                  <div>
                    <label
                      htmlFor="alloc-heaters"
                      className="flex justify-between font-semibold text-[#FFF8F2] mb-1"
                    >
                      <span>
                        {lang === 'en'
                          ? '1. Survival Deck Heaters (-80°C night)'
                          : '1. Bộ sưởi ấm mạch điện (-80°C ban đêm)'}
                      </span>
                      <span className="text-[#FFD1A6] tabular-nums">
                        {powerAlloc.survivalHeatersWh} Wh
                      </span>
                    </label>
                    <input
                      id="alloc-heaters"
                      type="range"
                      min={0}
                      max={400}
                      step={20}
                      value={powerAlloc.survivalHeatersWh}
                      onChange={(e) =>
                        setPowerAlloc((p) => ({
                          ...p,
                          survivalHeatersWh: Number(e.target.value),
                        }))
                      }
                      className="w-full accent-[#F4A261]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="alloc-seis"
                      className="flex justify-between font-semibold text-[#FFF8F2] mb-1"
                    >
                      <span>
                        {lang === 'en'
                          ? '2. SEIS Seismometer (Core Science)'
                          : '2. Máy đo địa chấn SEIS (Khoa học chính)'}
                      </span>
                      <span className="text-[#64DFDF] tabular-nums">
                        {powerAlloc.seisSeismometerWh} Wh
                      </span>
                    </label>
                    <input
                      id="alloc-seis"
                      type="range"
                      min={0}
                      max={400}
                      step={20}
                      value={powerAlloc.seisSeismometerWh}
                      onChange={(e) =>
                        setPowerAlloc((p) => ({
                          ...p,
                          seisSeismometerWh: Number(e.target.value),
                        }))
                      }
                      className="w-full accent-[#64DFDF]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="alloc-uhf"
                      className="flex justify-between font-semibold text-[#FFF8F2] mb-1"
                    >
                      <span>
                        {lang === 'en'
                          ? '3. UHF Orbiter Telemetry Radio'
                          : '3. Bộ phát sóng tiếp vận UHF'}
                      </span>
                      <span className="text-[#FFD1A6] tabular-nums">
                        {powerAlloc.uhfTelemetryWh} Wh
                      </span>
                    </label>
                    <input
                      id="alloc-uhf"
                      type="range"
                      min={0}
                      max={300}
                      step={10}
                      value={powerAlloc.uhfTelemetryWh}
                      onChange={(e) =>
                        setPowerAlloc((p) => ({
                          ...p,
                          uhfTelemetryWh: Number(e.target.value),
                        }))
                      }
                      className="w-full accent-[#F4A261]"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setDustPercent(90);
                    setPowerAlloc({
                      survivalHeatersWh: 180,
                      seisSeismometerWh: 200,
                      uhfTelemetryWh: 100,
                      hp3MoleWh: 0,
                    });
                  }}
                  className="w-full py-2 px-3 text-xs font-bold rounded-xl border border-[#F4A261]/35 bg-[#2C1812] text-[#FFD1A6] hover:bg-[#3B2117]"
                >
                  {lang === 'en'
                    ? 'Load Spring 2022 Critical 500 Wh/sol Preset'
                    : 'Nạp kịch bản Mùa xuân 2022 (Chỉ còn 500 Wh/sol)'}
                </button>

                <div className="p-3.5 rounded-xl border border-[#F4A261]/25 bg-[#1B0E0A] text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-[#F3E5D8]/80">
                      {lang === 'en' ? 'Allocated / Available:' : 'Đã phân bổ / Khả dụng:'}
                    </span>
                    <span className="text-[#FFF8F2] font-bold tabular-nums">
                      {powerEvaluation.allocatedWh} / {powerEvaluation.availableWh} Wh
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#F3E5D8]/80">
                      {lang === 'en' ? 'System Outcome:' : 'Trạng thái hệ thống:'}
                    </span>
                    <span
                      className={
                        powerEvaluation.status === 'OPTIMAL_SCIENCE'
                          ? 'text-[#64DFDF] font-bold'
                          : 'text-[#F4A261] font-bold'
                      }
                    >
                      {powerEvaluation.status === 'OPTIMAL_SCIENCE'
                        ? '● Optimal Science & Survival'
                        : powerEvaluation.status === 'OVER_BUDGET'
                          ? '✖ Battery Depletion (Over Budget)'
                          : powerEvaluation.status === 'FREEZE_FAILURE'
                            ? '▲ Thermal Freeze Risk (<150 Wh)'
                            : '▲ Survival Only (Low Science)'}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-[#F4A261]/20 bg-[#2C1812] text-xs space-y-1">
                  <div className="text-[#FFD1A6] font-bold">
                    {lang === 'en'
                      ? 'Parallel Fate · Opportunity Rover (2003-032A)'
                      : 'Số Phận Song Hành · Opportunity (2003-032A)'}
                  </div>
                  <p className="text-[#F3E5D8] leading-relaxed">
                    {lang === 'en'
                      ? 'Wind gusts at Meridiani Planum periodically swept Opportunity’s panels clean across 5,111 sols—until the June 2018 global dust storm darkened the entire planet.'
                      : 'Gió lốc tại Meridiani Planum đã nhiều lần thổi sạch bụi trên mặt pin giúp Opportunity sống tới 5.111 sol—cho tới cơn bão bụi toàn cầu tháng 6/2018.'}
                  </p>
                </div>
              </div>
            </div>
          </ChapterBackdropWrapper>
        )}

        {/* ================================================================
            CHAPTER 08: THE MIRROR THAT NEVER SLEEPS (APOLLO 11 LRRR)
           ================================================================ */}
        {isChapterVisible(7) && (
          <ChapterBackdropWrapper
            chapterIdx={7}
            lang={lang}
            id="chapter-section-7"
            ariaLabelledBy="ch08-heading"
          >
            <div className="max-w-3xl">
              <div className="text-xs font-bold text-[#64DFDF] uppercase tracking-wider mb-2">
                {lang === 'en'
                  ? 'Chapter 08 of 10 · Apollo 11 Lunar Laser Ranging Retroreflector (1969-059C)'
                  : 'Chương 08 / 10 · Gương Phản Xạ Laser Mặt Trăng Apollo 11 (1969-059C)'}
              </div>
              <h2
                id="ch08-heading"
                className="font-serif-editorial text-3xl sm:text-4xl font-bold text-[#FFF8F2] mb-3"
              >
                {lang === 'en'
                  ? 'The Mirror That Never Sleeps: Why 1969 Lunar Hardware Still Works Tonight'
                  : 'Tấm Gương Không Bao Giờ Ngủ: Vì Sao Thiết Bị Năm 1969 Vẫn Hoạt Động Đêm Nay?'}
              </h2>
              <p className="text-base text-slate-200 leading-relaxed">
                {lang === 'en'
                  ? 'InSight fell silent when dust starved its solar panels. Yet at Mare Tranquillitatis (0.674°N, 23.473°E), the passive tray of 100 fused-silica prisms left by Apollo 11 in July 1969 needs zero electricity—and still reflects Earth laser pulses 57+ years later.'
                  : 'InSight lặng tiếng khi bụi che khuất tấm pin mặt trời. Nhưng tại Biển Tĩnh Lặng (0,674°B, 23,473°Đ), khay 100 lăng kính thạch anh thụ động do Apollo 11 đặt năm 1969 không cần một giọt điện nào—và vẫn phản xạ tia laser từ Trái Đất suốt hơn 57 năm qua.'}
              </p>
            </div>

            <LunarLaserRangingLab lang={lang} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <NasaPhotoViewer photoId="AS11-40-5952" lang={lang} compact />
              <NasaPhotoViewer photoId="PIA23177" lang={lang} compact />
            </div>
          </ChapterBackdropWrapper>
        )}

        {/* ================================================================
            CHAPTER 09: WHY STORYTELLING MATTERS — BASELINE & IMPACT
           ================================================================ */}
        {isChapterVisible(8) && (
          <ChapterBackdropWrapper
            chapterIdx={8}
            lang={lang}
            id="chapter-section-8"
            ariaLabelledBy="ch09-heading"
          >
            <div className="max-w-3xl">
              <div className="text-xs font-bold text-[#64DFDF] uppercase tracking-wider mb-2">
                {lang === 'en'
                  ? 'Chapter 09 of 10 · Baseline Comparison & Vietnamese STEM Roadmap'
                  : 'Chương 09 / 10 · Đối Chiếu Cơ Sở & Lộ Trình Giáo Dục STEM Việt Nam'}
              </div>
              <h2
                id="ch09-heading"
                className="font-serif-editorial text-3xl sm:text-4xl font-bold text-[#FFF8F2] mb-3"
              >
                {lang === 'en'
                  ? 'Why Storytelling Matters: Turning Archival Tables into Living Inquiry'
                  : 'Vì Sao Kể Chuyện Khoa Học Quan Trọng: Từ Bảng Dữ Liệu Thô Đến Trải Nghiệm Sống'}
              </h2>
              <p className="text-base text-slate-200 leading-relaxed">
                {lang === 'en'
                  ? 'Raw archival tables preserve vital numbers, but spatial storytelling lets middle-school students see, hear, and test the physics behind every mission.'
                  : 'Các bảng lưu trữ giữ trọn con số kỹ thuật, nhưng nghệ thuật kể chuyện không gian giúp học sinh trực tiếp nhìn thấy, lắng nghe và thực hành vật lý đằng sau mỗi sứ mệnh.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setBaselineView('comparison')}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition-colors ${
                  baselineView === 'comparison'
                    ? 'bg-[#F4A261] text-[#1F110C] border-[#F4A261]'
                    : 'bg-[#1E2B3E] text-slate-200 border-white/15'
                }`}
              >
                {lang === 'en' ? 'Side-by-Side Comparison' : 'Đối chiếu Song song'}
              </button>
              <button
                type="button"
                onClick={() => setBaselineView('raw')}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition-colors ${
                  baselineView === 'raw'
                    ? 'bg-[#F4A261] text-[#1F110C] border-[#F4A261]'
                    : 'bg-[#1E2B3E] text-slate-200 border-white/15'
                }`}
              >
                {lang === 'en' ? 'Conventional Catalog Baseline' : 'Bảng Lưu Trữ Truyền Thống'}
              </button>
              <button
                type="button"
                onClick={() => setBaselineView('solution')}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition-colors ${
                  baselineView === 'solution'
                    ? 'bg-[#64DFDF] text-[#111C28] border-[#64DFDF]'
                    : 'bg-[#1E2B3E] text-slate-200 border-white/15'
                }`}
              >
                {lang === 'en' ? 'Silent Monuments Interactive Lab' : 'Giải Pháp Tương Tác Của Đội'}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {(baselineView === 'comparison' || baselineView === 'raw') && (
                <div className="rounded-2xl border border-white/15 bg-[#1B2638]/95 p-5 space-y-3">
                  <div className="text-xs font-bold text-[#FFD1A6] uppercase tracking-wider">
                    {lang === 'en'
                      ? 'Conventional Baseline · Static Archival Table'
                      : 'Cơ Sở Truyền Thống · Bảng Tra Cứu Tĩnh'}
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    {lang === 'en'
                      ? 'What a Student Normally Sees: Uncontextualized Entries'
                      : 'Những Gì Học Sinh Thường Gặp: Dữ Liệu Rời Rạc'}
                  </h3>
                  <div className="p-4 rounded-xl bg-[#111926] border border-white/10 text-xs text-slate-300 space-y-1.5 leading-relaxed">
                    <div>
                      <strong className="text-white">Object ID:</strong> 2018-042A (InSight) · Mars (4.502°N, 135.623°E, -2,655 m MOLA)
                    </div>
                    <div>
                      <strong className="text-white">Timeline:</strong> Launch 5 May 2018 · Landed 26 Nov 2018 · Last Signal 15 Dec 2022
                    </div>
                    <div>
                      <strong className="text-white">Payloads:</strong> SEIS (VBB/SP), HP³ (DLR), RISE (X-Band), TWINS
                    </div>
                    <div>
                      <strong className="text-white">Power Delta:</strong> ~5,000 Wh/sol (Sol 10) → ~500 Wh/sol (Sol 1211)
                    </div>
                  </div>
                  <p className="text-xs text-slate-300">
                    {lang === 'en'
                      ? 'Accurate for specialists, but offers no spatial 3D intuition, acoustic feedback, or hands-on experimentation.'
                      : 'Chính xác với chuyên gia nhưng thiếu trực quan không gian 3D, âm thanh địa chấn và trải nghiệm thực hành.'}
                  </p>
                </div>
              )}

              {(baselineView === 'comparison' || baselineView === 'solution') && (
                <div className="rounded-2xl border border-[#64DFDF]/40 bg-[#1B2638]/95 p-5 space-y-3">
                  <div className="text-xs font-bold text-[#64DFDF] uppercase tracking-wider">
                    {lang === 'en'
                      ? 'Our Solution · Interactive 3D & GIS Scrollytelling'
                      : 'Giải Pháp Của Đội · Kể Chuyện Tương Tác 3D & GIS'}
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    {lang === 'en'
                      ? 'Spatial GIS + Physics Simulations + Bilingual Equity'
                      : 'Bản Đồ GIS 3D + Mô Phỏng Vật Lý + Song Ngữ Anh–Việt'}
                  </h3>
                  <ul className="space-y-2.5 text-xs text-slate-200 leading-relaxed">
                    <li>
                      <strong className="text-[#FFD1A6]">1. Real NASA Photography & 3D GIS:</strong>{' '}
                      {lang === 'en'
                        ? 'Maps 2018-042A, 2003-032A, and 1969-059C onto photographic Mars & Moon globes and an articulated 3D InSight lander.'
                        : 'Đặt trực tiếp các sứ mệnh lên quả cầu ảnh chụp thật của NASA và mô hình 3D InSight.'}
                    </li>
                    <li>
                      <strong className="text-[#64DFDF]">2. Hands-On Physics Labs:</strong>{' '}
                      {lang === 'en'
                        ? 'Students hear 60× marsquake sonifications, scrub 2018–2022 solar dust, and time a 2.56-second lunar laser pulse.'
                        : 'Học sinh nghe âm thanh địa chấn 60×, kéo thanh trượt bụi phủ 2018–2022 và bấm giờ tia laser 2,56 giây.'}
                    </li>
                    <li>
                      <strong className="text-[#F4A261]">3. Classroom-Ready Bilingual Access:</strong>{' '}
                      {lang === 'en'
                        ? 'Instant 100% English / 100% Vietnamese switching tailored for middle-school STEM classrooms.'
                        : 'Chuyển đổi tức thì 100% Tiếng Anh / 100% Tiếng Việt phục vụ học sinh và giáo viên STEM.'}
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Scalable Roadmap */}
            <div className="rounded-2xl border border-white/15 bg-[#1B2638]/95 p-5">
              <div className="text-xs font-bold text-[#FFD1A6] uppercase tracking-wider mb-3">
                {lang === 'en'
                  ? 'Modular Expansion Roadmap · Next Off-World Monuments'
                  : 'Lộ Trình Mở Rộng Mô-Đun · Các Di Sản Không Gian Tiếp Theo'}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-[#223046] border border-white/10">
                  <strong className="text-white block text-sm mb-1">
                    {lang === 'en'
                      ? 'Phase 1 · Ingenuity Helicopter (2020-052B)'
                      : 'Giai đoạn 1 · Trực thăng Ingenuity (2020-052B)'}
                  </strong>
                  <p className="text-slate-200 leading-relaxed">
                    {lang === 'en'
                      ? 'After 72 flights at Jezero Crater, Ingenuity now serves as a stationary weather and avionics testbed in Valinor Hills.'
                      : 'Sau 72 chuyến bay tại miệng hố Jezero, Ingenuity hiện trở thành trạm thời tiết cố định tại đồi Valinor.'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#223046] border border-white/10">
                  <strong className="text-white block text-sm mb-1">
                    {lang === 'en'
                      ? 'Phase 2 · Voyager Golden Records (1977-084A)'
                      : 'Giai đoạn 2 · Đĩa Vàng Voyager (1977-084A)'}
                  </strong>
                  <p className="text-slate-200 leading-relaxed">
                    {lang === 'en'
                      ? 'Extending our power-budget simulator to RTG decay in interstellar space beyond the heliopause.'
                      : 'Mở rộng mô phỏng quản lý nguồn điện sang nguồn đồng vị phóng xạ ở không gian liên sao.'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#223046] border border-white/10">
                  <strong className="text-white block text-sm mb-1">
                    {lang === 'en'
                      ? 'Phase 3 · Vietnamese STEM Classroom Kit'
                      : 'Giai đoạn 3 · Học liệu STEM Trường học Việt Nam'}
                  </strong>
                  <p className="text-slate-200 leading-relaxed">
                    {lang === 'en'
                      ? '45-minute bilingual physics lesson modules for middle-school educators covering seismic waves, solar power, and optics.'
                      : 'Bộ bài giảng thực hành 45 phút song ngữ dành cho giáo viên Khoa học tự nhiên THCS.'}
                  </p>
                </div>
              </div>
            </div>
          </ChapterBackdropWrapper>
        )}

        {/* ================================================================
            CHAPTER 10: EXPLORER CHALLENGE & 8K MISSION EMBLEM
           ================================================================ */}
        {isChapterVisible(9) && (
          <ChapterBackdropWrapper
            chapterIdx={9}
            lang={lang}
            id="chapter-section-9"
            ariaLabelledBy="ch10-heading"
          >
            <div className="max-w-3xl">
              <div className="text-xs font-bold text-[#FFD1A6] uppercase tracking-wider mb-2">
                {lang === 'en'
                  ? 'Chapter 10 of 10 · 4-Question Mission Review & 8K Aerospace Emblem'
                  : 'Chương 10 / 10 · 4 Câu Hỏi Ôn Tập & Huy Hiệu Sứ Mệnh 8K'}
              </div>
              <h2
                id="ch10-heading"
                className="font-serif-editorial text-3xl sm:text-4xl font-bold text-[#FFF8F2] mb-3"
              >
                {lang === 'en'
                  ? 'Explorer Challenge & Custom 8K Mission Emblem'
                  : 'Thử Thách Nhà Thám Hiểm & Huy Hiệu Sứ Mệnh 8K'}
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left 7 cols: 4-Question Interactive Mission Review */}
              <div className="lg:col-span-7 space-y-4">
                {QUIZ_QUESTIONS.map((q, qIdx) => {
                  const selected = quizAnswers[qIdx];
                  const isCorrect = selected === q.correctIndex;
                  return (
                    <div
                      key={q.id}
                      className="rounded-2xl border border-[#F4A261]/25 bg-[#23140F]/95 p-5 space-y-3 shadow-xl"
                    >
                      <h3 className="text-base font-bold text-[#FFF8F2]">{q.question[lang]}</h3>
                      <div className="space-y-2">
                        {q.options[lang].map((optText, oIdx) => {
                          const chosen = selected === oIdx;
                          return (
                            <button
                              key={oIdx}
                              type="button"
                              onClick={() => {
                                const next = [...quizAnswers];
                                next[qIdx] = oIdx;
                                setQuizAnswers(next);
                              }}
                              className={`w-full p-3.5 rounded-xl border text-left text-xs leading-relaxed transition-colors ${
                                chosen
                                  ? 'bg-[#3B2117] border-[#F4A261] text-[#FFF8F2] font-semibold'
                                  : 'bg-[#2C1812] border-[#F4A261]/20 text-[#F3E5D8] hover:border-[#F4A261]/50'
                              }`}
                            >
                              {optText}
                            </button>
                          );
                        })}
                      </div>

                      {quizSubmitted && selected !== null && (
                        <div
                          className={`p-3 rounded-xl border text-xs font-medium leading-relaxed ${
                            isCorrect
                              ? 'bg-[#122628] border-[#64DFDF] text-[#64DFDF]'
                              : 'bg-[#2E1812] border-[#F4A261] text-[#FFD1A6]'
                          }`}
                        >
                          {q.explanation[lang]}
                        </div>
                      )}
                    </div>
                  );
                })}

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuizSubmitted(true)}
                    className="px-5 py-2.5 text-xs font-bold rounded-xl bg-[#F4A261] text-[#1F110C] hover:bg-[#FFD1A6]"
                  >
                    {lang === 'en' ? 'Verify Mission Answers' : 'Kiểm Tra Đáp Án'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setQuizAnswers([null, null, null, null]);
                      setQuizSubmitted(false);
                    }}
                    className="px-4 py-2.5 text-xs font-semibold rounded-xl border border-[#F4A261]/35 bg-[#2C1812] text-[#F3E5D8] hover:border-[#FFD1A6]"
                  >
                    {lang === 'en' ? 'Reset Quiz' : 'Làm Lại'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsRefModalOpen(true)}
                    className="px-4 py-2.5 text-xs font-semibold rounded-xl border border-[#64DFDF]/40 bg-[#1B2638] text-[#64DFDF] hover:bg-[#24334C]"
                  >
                    {lang === 'en'
                      ? 'Open Full 12-Source Reference Desk ↗'
                      : 'Mở Bàn Tra Cứu 12 Nguồn Tư Liệu NASA ↗'}
                  </button>
                </div>

                {quizSubmitted && (
                  <div
                    role="status"
                    aria-live="polite"
                    className="p-4 rounded-2xl border border-[#64DFDF]/50 bg-[#1B2638] text-sm"
                  >
                    {!quizEvaluation.complete ? (
                      <span className="text-[#FFD1A6] font-semibold">
                        {lang === 'en'
                          ? '▲ Please select an answer for all 4 questions before verifying.'
                          : '▲ Vui lòng chọn đáp án cho cả 4 câu hỏi trước khi kiểm tra.'}
                      </span>
                    ) : (
                      <div className="space-y-1">
                        <strong className="text-[#64DFDF] block text-base font-bold">
                          {lang === 'en'
                            ? `Mission Review Score: ${quizEvaluation.score} / ${quizEvaluation.total}`
                            : `Điểm Ôn Tập Sứ Mệnh: ${quizEvaluation.score} / ${quizEvaluation.total}`}
                        </strong>
                        <p className="text-xs text-slate-200">
                          {lang === 'en'
                            ? 'The spacecraft fell silent, but their discoveries—and your curiosity—continue.'
                            : 'Những cỗ máy đã im lặng, nhưng khám phá của chúng—và sự tò mò khoa học của bạn—vẫn tiếp tục.'}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right 5 cols: 8K Photorealistic Aerospace Mission Emblem Generator */}
              <div className="lg:col-span-5">
                <MissionEmblemGenerator
                  lang={lang}
                  explorerName={explorerName}
                  onChangeExplorerName={setExplorerName}
                  generatedCallsign={generatedCallsign}
                  onMintCallsign={setGeneratedCallsign}
                />
              </div>
            </div>
          </ChapterBackdropWrapper>
        )}
      </main>

      {/* Single Deduplicated Official Team Metadata & Representational Integrity Footer */}
      <footer className="border-t border-[#F4A261]/25 bg-[#1B0F0B] py-8 px-4 sm:px-8 text-xs text-[#F3E5D8]/85">
        <div className="max-w-[1360px] mx-auto space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="font-serif-editorial text-base text-[#FFF8F2] font-bold">
                {TEAM_METADATA.projectTitle}
              </div>
              <div>
                <strong className="text-[#F4A261] font-bold">
                  Team {TEAM_METADATA.teamName} (Official ID: {TEAM_METADATA.teamId})
                </strong>{' '}
                · {TEAM_METADATA.institution[lang]} · {TEAM_METADATA.localEvent[lang]}
              </div>
              <div>
                {lang === 'en' ? 'Official Team Members (5): ' : 'Thành viên chính thức (5): '}
                <span className="text-[#FFF8F2] font-semibold">
                  {TEAM_METADATA.members.join(' · ')}
                </span>
              </div>
            </div>

            <div className="text-left md:text-right space-y-1.5 shrink-0">
              <div className="text-[#64DFDF] font-semibold">{TEAM_METADATA.license}</div>
              <div>
                {lang === 'en'
                  ? 'Target Audience: Ages 10–15 & STEM Educators'
                  : 'Đối tượng: Học sinh 10–15 tuổi & Giáo viên STEM'}
              </div>
              <button
                type="button"
                onClick={() => setIsRefModalOpen(true)}
                className="text-[#FFD1A6] hover:underline font-semibold"
              >
                {lang === 'en'
                  ? 'Inspect Full NASA/NSSDCA Reference Desk (${OFFICIAL_REFERENCES.length} Sources) ↗'.replace(
                      '${OFFICIAL_REFERENCES.length}',
                      String(OFFICIAL_REFERENCES.length)
                    )
                  : `Xem Sổ cái ${OFFICIAL_REFERENCES.length} Nguồn Tư liệu NASA/NSSDCA ↗`}
              </button>
            </div>
          </div>

          {/* Clean Footer Representational Integrity Note (Moved from Top of Chapter 01) */}
          <div className="pt-3 border-t border-[#F4A261]/15 text-[11px] text-[#F3E5D8]/70 flex flex-wrap items-center justify-between gap-2">
            <span>
              {lang === 'en'
                ? 'Representational Integrity Note: First-person narration is a pedagogical storytelling device for learners aged 10–15; all mission dates, coordinates, and NSSDCA identifiers (2018-042A, 2003-032A, 1969-059C) are verified against primary NASA/JPL archives.'
                : 'Ghi chú minh bạch khoa học: Lời kể ngôi thứ nhất là phương pháp sư phạm dành cho học sinh 10–15 tuổi; mọi ngày tháng, tọa độ và mã NSSDCA (2018-042A, 2003-032A, 1969-059C) đều được xác minh từ hồ sơ gốc của NASA/JPL.'}
            </span>
          </div>
        </div>
      </footer>

      {/* Sticky Bottom Chapter Pager HUD */}
      <div className="sticky bottom-0 z-40 border-t border-[#F4A261]/25 bg-[#22130E]/95">
        <div className="max-w-[1360px] mx-auto px-3 sm:px-8 h-14 flex items-center justify-between gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => goToChapter(currentChapter - 1)}
            disabled={currentChapter === 0}
            aria-label="Previous chapter"
            className="px-3.5 py-1.5 text-xs font-bold rounded-xl border border-[#F4A261]/35 bg-[#341D15] text-[#FFF8F2] disabled:opacity-35 hover:border-[#FFD1A6] transition-colors whitespace-nowrap shrink-0"
          >
            {lang === 'en' ? '← Prev' : '← Trước'}
          </button>

          {/* 10 Chapter Quick Dots */}
          <div
            role="navigation"
            aria-label="Chapter progress dots"
            className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-1"
          >
            {CHAPTER_TITLES.map((ch, idx) => {
              const active = idx === currentChapter;
              return (
                <button
                  key={ch.num}
                  type="button"
                  onClick={() => goToChapter(idx)}
                  title={`${ch.num}. ${ch.title[lang]}`}
                  aria-label={`Go to chapter ${ch.num}: ${ch.title[lang]}`}
                  aria-current={active ? 'step' : undefined}
                  className={`h-2.5 rounded-full transition-all ${
                    active
                      ? 'w-7 bg-[#F4A261]'
                      : 'w-2.5 bg-[#5C3426] hover:bg-[#8C523C]'
                  }`}
                />
              );
            })}
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <span
              data-testid="chapter-counter"
              className="text-xs font-bold text-[#FFD1A6] tabular-nums"
            >
              {String(currentChapter + 1).padStart(2, '0')} / 10
            </span>
            <button
              type="button"
              onClick={() => goToChapter(currentChapter + 1)}
              disabled={currentChapter === 9}
              aria-label="Next chapter"
              className="px-3.5 py-1.5 text-xs font-bold rounded-xl border border-[#F4A261]/35 bg-[#341D15] text-[#FFF8F2] disabled:opacity-35 hover:border-[#FFD1A6] transition-colors whitespace-nowrap shrink-0"
            >
              {lang === 'en' ? 'Next →' : 'Tiếp →'}
            </button>
          </div>
        </div>
      </div>

      {/* Reference Desk & Transparency Ledger Modal */}
      <ReferenceDeskModal
        lang={lang}
        isOpen={isRefModalOpen}
        onClose={() => setIsRefModalOpen(false)}
      />
    </div>
  );
}
