import React, { useEffect, useRef, useState } from 'react';
import {
  CHAPTER_TITLES,
  INSIGHT_DISCOVERIES_4,
  INSIGHT_QUIZ_QUESTIONS_3,
  INSIGHT_SUBSYSTEMS_9,
  InSightSubsystemSpec,
  JUDGE_QA_ITEMS,
  JOURNEY_MILESTONES,
  Language,
  SCIENTIFIC_SOURCES,
  TEAM_METADATA,
} from './data/bilingualContent';
import {
  CHAPTER_BACKDROPS,
  INSIGHT_MEDIA_ASSETS,
  preloadCriticalNasaAssets,
} from './utils/nasaMedia';
import {
  calculateInSightTelemetry,
  calculateSolarPowerFromDust,
  evaluatePowerAllocation,
  gradeInSightQuiz,
} from './utils/missionMath';
import { InSightLander3D } from './components/InSightLander3D';
import { MartianInteriorCutaway } from './components/MartianInteriorCutaway';
import { SeismicSonificationLab } from './components/SeismicSonificationLab';
import { MissionEmblemGenerator } from './components/MissionEmblemGenerator';
import { ReferenceDeskModal } from './components/ReferenceDeskModal';

interface ChapterBackdropWrapperProps {
  chapterIndex: number;
  lang: Language;
  children: React.ReactNode;
}

const ChapterBackdropWrapper: React.FC<ChapterBackdropWrapperProps> = ({
  chapterIndex,
  lang,
  children,
}) => {
  const meta = CHAPTER_BACKDROPS[chapterIndex] ?? CHAPTER_BACKDROPS[0];
  const [imgSrc, setImgSrc] = useState(meta.primaryUrl);

  useEffect(() => {
    setImgSrc(meta.primaryUrl);
  }, [meta.primaryUrl]);

  return (
    <section
      id={`chapter-section-${chapterIndex}`}
      data-testid={`page-section-${chapterIndex + 1}`}
      className="relative rounded-3xl overflow-hidden border border-[#F4A261]/30 shadow-2xl transition-all duration-500 bg-[#24130D]"
    >
      {/* Living 4K Real NASA Photograph Background with Ken Burns Motion */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <img
          src={imgSrc}
          alt={meta.caption[lang]}
          decoding="async"
          onError={() => {
            if (imgSrc !== meta.fallbackUrl) {
              setImgSrc(meta.fallbackUrl);
            }
          }}
          className="w-full h-full object-cover opacity-35 animate-ken-burns"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#23110B]/92 via-[#361A11]/82 to-[#1B0D08]/95" />
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 p-4 sm:p-8 lg:p-10 space-y-6">
        {children}

        {/* Bottom Backdrop Photo Credit & Direct NASA Verification Pill */}
        <div className="pt-3 border-t border-[#F4A261]/20 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#F3E5D8]/75">
          <span>
            {lang === 'en' ? 'Backdrop Photography: ' : 'Ảnh nền NASA: '}
            <strong className="text-[#FFD1A6]">{meta.caption[lang]}</strong>
          </span>
          <a
            href={meta.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#FFD1A6] hover:text-white transition-colors font-semibold"
          >
            Source: {meta.credit} ↗
          </a>
        </div>
      </div>
    </section>
  );
};

export function App() {
  const [lang, setLang] = useState<Language>('en');
  const [currentPage, setCurrentPage] = useState<number>(0); // 0..9 (Page 01 to Page 10)
  const [displayMode, setDisplayMode] = useState<'page' | 'all'>('page');
  const [isRefModalOpen, setIsRefModalOpen] = useState(false);

  // Page 01: Ambient Martian Wind Audio Toggle
  const [isWindPlaying, setIsWindPlaying] = useState(false);
  const windAudioCtxRef = useRef<AudioContext | null>(null);
  const heroCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const cursorRef = useRef({ x: 0.5, y: 0.5 });

  // Page 02: Stationary Lander vs Rolling Rover Comparison Toggle
  const [landerCompareTab, setLanderCompareTab] = useState<'insight' | 'rover'>('insight');

  // Page 03: Selected Journey Milestone (0..5)
  const [selectedMilestoneIdx, setSelectedMilestoneIdx] = useState<number>(1);

  // Page 04: Selected Mission Pillar ('seis' | 'hp3' | 'rise') & Student Discovery Check
  const [selectedPillar, setSelectedPillar] = useState<'seis' | 'hp3' | 'rise'>('seis');
  const [page4CheckAnswer, setPage4CheckAnswer] = useState<'earth' | 'mars' | null>(null);

  // Page 05: Selected Hardware Subsystem (9 subsystems from PIA17358)
  const [selectedSubsystemId, setSelectedSubsystemId] =
    useState<InSightSubsystemSpec['id']>('seis');

  // Page 08: Selected Discovery Card (0..3)
  const [selectedDiscoveryIdx, setSelectedDiscoveryIdx] = useState<number>(0);

  // Page 09: Dust Cover Scrubber (0% clean 2018 -> 90% dusty 2022) & Classroom Power Lab
  const [dustPercent, setDustPercent] = useState<number>(85);
  const [powerInputs, setPowerInputs] = useState({
    survivalHeatersWh: 200,
    seisSeismometerWh: 180,
    uhfTelemetryWh: 100,
    hp3MoleWh: 0,
  });

  // Page 10: 3-Question Quiz, 4D Badge Callsign & Collapsible Judge Drawer
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([null, null, null]);
  const [explorerName, setExplorerName] = useState('MINH ANH');
  const [generatedCallsign, setGeneratedCallsign] = useState('MINH ANH');
  const [isJudgeDrawerOpen, setIsJudgeDrawerOpen] = useState(false);

  const telemetry = calculateInSightTelemetry('2026-11-14T00:00:00Z');
  const solarMetrics = calculateSolarPowerFromDust(dustPercent);
  const powerEval = evaluatePowerAllocation(solarMetrics.wattHoursPerSol, powerInputs);
  const quizResult = gradeInSightQuiz(quizAnswers);

  useEffect(() => {
    preloadCriticalNasaAssets();
  }, []);

  const goToPage = (idx: number) => {
    const clamped = Math.max(0, Math.min(9, idx));
    setCurrentPage(clamped);
    if (displayMode === 'page') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.getElementById(`chapter-section-${clamped}`);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Keyboard Left/Right navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowRight' && currentPage < 9) {
        goToPage(currentPage + 1);
      } else if (e.key === 'ArrowLeft' && currentPage > 0) {
        goToPage(currentPage - 1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  // Ambient Martian Wind Web Audio Generator for Page 01
  const toggleMartianWindAudio = () => {
    if (isWindPlaying) {
      if (windAudioCtxRef.current) {
        windAudioCtxRef.current.close().catch(() => {});
        windAudioCtxRef.current = null;
      }
      setIsWindPlaying(false);
      return;
    }

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      windAudioCtxRef.current = ctx;

      const bufferSize = ctx.sampleRate * 3;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 135;

      const gain = ctx.createGain();
      gain.gain.value = 0.14;

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      whiteNoise.start();
      setIsWindPlaying(true);
    } catch {
      setIsWindPlaying(false);
    }
  };

  useEffect(() => {
    return () => {
      if (windAudioCtxRef.current) {
        windAudioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Page 01 Drifting Martian Dust & Warm Sunlight Flare Canvas
  useEffect(() => {
    const canvas = heroCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const particles = Array.from({ length: 36 }, (_, i) => ({
      x: ((i * 73) % 100) / 100,
      y: ((i * 41) % 100) / 100,
      r: 1.2 + (i % 3) * 0.85,
      vx: 0.00045 + (i % 4) * 0.00018,
      vy: -0.00012 + (i % 3) * 0.00009,
    }));

    let animId = 0;
    const renderDust = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const sunX = w * (0.5 + (cursorRef.current.x - 0.5) * 0.08);
      const sunY = h * (0.18 + (cursorRef.current.y - 0.5) * 0.06);
      const sunGrad = ctx.createRadialGradient(sunX, sunY, 4, sunX, sunY, 160);
      sunGrad.addColorStop(0, 'rgba(255, 228, 196, 0.48)');
      sunGrad.addColorStop(0.5, 'rgba(244, 162, 97, 0.18)');
      sunGrad.addColorStop(1, 'rgba(244, 162, 97, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 160, 0, Math.PI * 2);
      ctx.fill();

      particles.forEach((p) => {
        p.x = (p.x + p.vx + (cursorRef.current.x - 0.5) * 0.0012 + 1) % 1;
        p.y = (p.y + p.vy + 1) % 1;
        ctx.fillStyle = 'rgba(255, 218, 180, 0.68)';
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(renderDust);
    };

    renderDust();
    return () => cancelAnimationFrame(animId);
  }, [currentPage, displayMode]);

  const isPageVisible = (idx: number) => displayMode === 'all' || currentPage === idx;
  const activeMilestone = JOURNEY_MILESTONES[selectedMilestoneIdx] ?? JOURNEY_MILESTONES[1];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#26130D] via-[#381C13] to-[#1D0E0A] text-[#FFF8F2] overflow-x-hidden">
      {/* STICKY TOP NAVIGATION BAR (Modular Subsystem Header) */}
      <header className="sticky top-0 z-40 bg-[#1F100B]/95 backdrop-blur-md shadow-xl">
        <div className="max-w-[1360px] mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
          {/* Brand Title */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              goToPage(0);
            }}
            className="flex flex-col shrink-0"
          >
            <span className="font-serif-editorial text-xs sm:text-base font-bold tracking-tight text-[#FFF8F2] leading-tight">
              INSIGHT: THE LAST DIARY FROM MARS
            </span>
            <span className="hidden sm:inline text-[10px] font-semibold text-[#FFD1A6]/80">
              {lang === 'en'
                ? 'Abandoned But Not Forgotten · NSSDCA ID: 2018-042A'
                : 'Bị Bỏ Lại Nhưng Không Bị Lãng Quên · NSSDCA ID: 2018-042A'}
            </span>
          </a>

          {/* Direct 01–10 Page Pills (Desktop) */}
          <nav
            aria-label="10-page InSight navigation"
            className="hidden xl:flex items-center gap-1 text-xs font-semibold"
          >
            {CHAPTER_TITLES.map((ch, idx) => {
              const isActive = currentPage === idx;
              return (
                <button
                  key={ch.num}
                  type="button"
                  onClick={() => goToPage(idx)}
                  title={`${ch.num}. ${ch.title[lang]}`}
                  className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-[#F4A261] text-[#1D0F0A] font-bold shadow-sm'
                      : 'text-[#F3E5D8]/85 hover:bg-[#382017] hover:text-white'
                  }`}
                >
                  {ch.num}
                </button>
              );
            })}
          </nav>

          {/* Controls: Mode Toggle + [ EN | VI ] + Reference Desk */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              data-testid="reading-mode-toggle-btn"
              onClick={() => setDisplayMode((m) => (m === 'page' ? 'all' : 'page'))}
              className="hidden md:inline-flex px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-[#341C14] text-[#FFD1A6] border border-[#F4A261]/35 hover:bg-[#46271C] transition-colors whitespace-nowrap"
            >
              {displayMode === 'page'
                ? lang === 'en'
                  ? 'Mode: Focused Page'
                  : 'Chế độ: Từng trang'
                : lang === 'en'
                  ? 'Mode: Full 10-Page Scroll'
                  : 'Chế độ: Cuộn 10 trang'}
            </button>

            <div
              role="group"
              aria-label="Language switcher"
              className="flex items-center bg-[#341C14] p-0.5 rounded-xl border border-[#F4A261]/35"
            >
              <button
                type="button"
                data-testid="lang-en-btn"
                aria-pressed={lang === 'en'}
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                  lang === 'en'
                    ? 'bg-[#F4A261] text-[#1D0F0A]'
                    : 'text-[#F3E5D8] hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                data-testid="lang-vi-btn"
                aria-pressed={lang === 'vi'}
                onClick={() => setLang('vi')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                  lang === 'vi'
                    ? 'bg-[#F4A261] text-[#1D0F0A]'
                    : 'text-[#F3E5D8] hover:text-white'
                }`}
              >
                VI
              </button>
            </div>

            <button
              type="button"
              data-testid="open-reference-desk-btn"
              onClick={() => setIsRefModalOpen(true)}
              className="px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-xl bg-[#382017] text-[#FFD1A6] border border-[#F4A261]/45 hover:bg-[#4C2C20] transition-colors whitespace-nowrap"
            >
              {lang === 'en' ? 'Reference Desk' : 'Nguồn Tư Liệu'}
            </button>
          </div>
        </div>

        {/* Continuous Animated Glowing Horizon Line */}
        <div className="relative w-full h-[3px] bg-[#361D14] overflow-hidden">
          <div className="absolute inset-0 animate-horizon-glow opacity-80" />
          <div
            style={{ width: `${((currentPage + 1) / 10) * 100}%` }}
            className="relative h-full bg-[#FFF8F2] transition-all duration-300"
          />
        </div>
      </header>

      {/* MAIN 10-PAGE CONTENT CONTAINER */}
      <main className="flex-1 w-full max-w-[1320px] mx-auto px-3 sm:px-6 pt-5 pb-24 space-y-10">
        {/* ===================================================================
            PAGE 01: THE LAST DIARY (Nhật ký cuối cùng từ Sao Hỏa)
           =================================================================== */}
        {isPageVisible(0) && (
          <ChapterBackdropWrapper chapterIndex={0} lang={lang}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center mobile-single-col-lock">
              {/* Left 7 Cols: First-Person Diary Opening */}
              <div className="lg:col-span-7 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#3A1F16] border border-[#F4A261]/45 text-xs font-bold text-[#FFD1A6]">
                    {lang === 'en'
                      ? 'PAGE 01 OF 10 · ELYSIUM PLANITIA, MARS (4.502°N, 135.623°E)'
                      : 'TRANG 01 / 10 · ĐỒNG BẰNG ELYSIUM PLANITIA, SAO HỎA (4,502°B, 135,623°Đ)'}
                  </span>
                  <a
                    href="https://science.nasa.gov/mission/insight/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1 rounded-full bg-[#1C0E0A] border border-[#64DFDF]/45 text-xs font-bold text-[#64DFDF] hover:bg-[#2B1610] transition-colors"
                  >
                    {lang === 'en' ? 'Verify at NASA/JPL ↗' : 'Kiểm chứng tại NASA/JPL ↗'}
                  </a>
                </div>

                <h1 className="font-serif-editorial text-3xl sm:text-5xl lg:text-[54px] font-bold tracking-tight leading-[1.08] text-[#FFF8F2]">
                  {lang === 'en' ? (
                    <>
                      I am InSight.
                      <span className="block italic font-semibold text-[#FFD1A6] mt-1">
                        Here is my last diary from the Red Planet.
                      </span>
                    </>
                  ) : (
                    <>
                      Tôi là InSight.
                      <span className="block italic font-semibold text-[#FFD1A6] mt-1">
                        Đây là cuốn nhật ký cuối cùng từ Hành tinh Đỏ.
                      </span>
                    </>
                  )}
                </h1>

                <div className="space-y-3.5 text-sm sm:text-base text-[#FFF8F2]/92 leading-relaxed">
                  <p>
                    {lang === 'en'
                      ? '“My radio fell silent in December 2022, and a quiet veil of red iron-oxide dust now covers my twin solar wings on the flat lava plains of Elysium Planitia. No rocket will ever bring my metal body back to Earth.”'
                      : '“Đài phát sóng của tôi đã lặng im từ tháng 12 năm 2022, và một lớp bụi oxit sắt đỏ mịn giờ đây phủ kín đôi cánh pin mặt trời trên đồng bằng dung nham Elysium Planitia. Sẽ chẳng có tên lửa nào đưa cơ thể kim loại của tôi trở về Trái Đất.”'}
                  </p>
                  <p>
                    {lang === 'en'
                      ? '“Yet the 1,319 marsquakes I felt with my copper-shielded seismometer are still speaking. Open my field diary to discover how a silent lander on Mars unlocked the deep heart of a rocky world.”'
                      : '“Thế nhưng 1.319 trận động đất Sao Hỏa mà tôi ghi lại bằng ống nghe địa chấn màu đồng vẫn đang tiếp tục lên tiếng. Hãy mở cuốn nhật ký của tôi để khám phá cách một trạm đổ bộ tĩnh lặng giải mã trái tim của cả một hành tinh.”'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    data-testid="open-mission-diary-btn"
                    onClick={() => goToPage(1)}
                    className="px-5 py-3 rounded-xl bg-[#F4A261] text-[#1D0F0A] font-bold text-xs sm:text-sm hover:bg-[#FFD1A6] transition-colors shadow-lg"
                  >
                    {lang === 'en'
                      ? 'Open My Mission Diary (Page 02) →'
                      : 'Mở Nhật Ký Sứ Mệnh (Trang 02) →'}
                  </button>

                  <button
                    type="button"
                    data-testid="toggle-martian-wind-btn"
                    onClick={toggleMartianWindAudio}
                    className={`px-4 py-3 rounded-xl text-xs sm:text-sm font-bold border transition-colors ${
                      isWindPlaying
                        ? 'bg-[#64DFDF] text-[#101C26] border-[#64DFDF]'
                        : 'bg-[#2C1710] text-[#FFD1A6] border-[#F4A261]/45 hover:bg-[#3E2117]'
                    }`}
                  >
                    {isWindPlaying
                      ? lang === 'en'
                        ? '🔊 Martian Wind Playing (Click to Mute)'
                        : '🔊 Đang Phát Tiếng Gió Sao Hỏa (Tắt)'
                      : lang === 'en'
                        ? '🔈 Listen to Ambient Martian Wind'
                        : '🔈 Lắng Nghe Tiếng Gió Sao Hỏa'}
                  </button>
                </div>

                {/* Pedagogical Storytelling Footnote */}
                <div className="p-3 rounded-xl bg-[#1A0D09]/90 border border-[#F4A261]/25 text-xs text-[#FFD1A6]/90 leading-relaxed">
                  <strong className="text-[#64DFDF]">
                    {lang === 'en' ? 'Storytelling Note: ' : 'Chú thích Kể chuyện Khoa học: '}
                  </strong>
                  {lang === 'en'
                    ? 'The first-person voice ("I am InSight") is a creative educational storytelling device for ages 10–15. All coordinates, dates, instruments, and seismic discoveries are 100% verified NASA/JPL facts (NSSDCA ID: 2018-042A).'
                    : 'Giọng kể ngôi thứ nhất ("Tôi là InSight") là phương pháp kể chuyện giáo dục dành cho lứa tuổi 10–15. Mọi tọa độ, ngày tháng, thiết bị và khám phá địa chấn đều là dữ kiện khoa học xác thực 100% từ NASA/JPL (NSSDCA ID: 2018-042A).'}
                </div>
              </div>

              {/* Right 5 Cols: 4K InSight Cutaway & Interactive Dust Canvas */}
              <div
                onPointerMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  cursorRef.current = {
                    x: (e.clientX - rect.left) / rect.width,
                    y: (e.clientY - rect.top) / rect.height,
                  };
                }}
                className="lg:col-span-5 relative rounded-2xl overflow-hidden border border-[#F4A261]/40 bg-[#160B07] shadow-2xl h-[350px] sm:h-[430px]"
              >
                <img
                  src={INSIGHT_MEDIA_ASSETS.PIA22227_LOCAL}
                  onError={(e) => {
                    e.currentTarget.src = INSIGHT_MEDIA_ASSETS.PIA19664_NASA;
                  }}
                  alt="NASA PIA22227 InSight Lander on Elysium Planitia"
                  className="w-full h-full object-cover"
                />
                <canvas
                  ref={heroCanvasRef}
                  width={520}
                  height={430}
                  className="pointer-events-none absolute inset-0 w-full h-full"
                />
                <div className="absolute top-3 left-3 px-3 py-1 rounded-lg bg-[#1A0D09]/90 border border-[#F4A261]/35 text-[11px] font-bold text-[#FFD1A6]">
                  {lang === 'en'
                    ? 'NASA 4K Visual (PIA22227) · Move Cursor to Drift Dust'
                    : 'Ảnh NASA 4K (PIA22227) · Di Chuột Để Tương Tác Bụi Đỏ'}
                </div>
                <div className="absolute bottom-3 left-3 right-3 px-3.5 py-2 rounded-xl bg-[#1A0D09]/92 border border-[#F4A261]/35 flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
                  <span className="text-[#FFF8F2]">NSSDCA: {telemetry.nssdcaId}</span>
                  <span className="text-[#FFD1A6]">4.502°N, 135.623°E</span>
                  <span className="text-[#64DFDF]">1,319 Marsquakes</span>
                </div>
              </div>
            </div>
          </ChapterBackdropWrapper>
        )}

        {/* ===================================================================
            PAGE 02: MEET INSIGHT (Làm quen với InSight)
           =================================================================== */}
        {isPageVisible(1) && (
          <ChapterBackdropWrapper chapterIndex={1} lang={lang}>
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-full bg-[#3A1F16] border border-[#F4A261]/45 text-xs font-bold text-[#FFD1A6]">
                  {lang === 'en'
                    ? 'PAGE 02 OF 10 · MEET INSIGHT: WHY I HAD NO WHEELS'
                    : 'TRANG 02 / 10 · LÀM QUEN VỚI INSIGHT: VÌ SAO TÔI KHÔNG CÓ BÁNH XE'}
                </span>
                <a
                  href="https://science.nasa.gov/photojournal/the-insight-lander/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 rounded-full bg-[#1C0E0A] border border-[#64DFDF]/45 text-xs font-bold text-[#64DFDF] hover:bg-[#2B1610]"
                >
                  {lang === 'en' ? 'Verify at NASA/JPL ↗' : 'Kiểm chứng tại NASA/JPL ↗'}
                </a>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mobile-single-col-lock">
                <div className="lg:col-span-6 space-y-4">
                  <h2 className="font-serif-editorial text-2xl sm:text-4xl font-bold text-[#FFF8F2]">
                    {lang === 'en'
                      ? 'Who Am I, and Why Did Engineers Give Me Three Legs Instead of Wheels?'
                      : 'Tôi Là Ai, Và Vì Sao Các Kỹ Sư Trao Cho Tôi Ba Chân Đáp Thay Vì Bánh Xe?'}
                  </h2>

                  <p className="text-sm sm:text-base text-[#F3E5D8]/90 leading-relaxed">
                    {lang === 'en'
                      ? 'My full name is Interior Exploration using Seismic Investigations, Geodesy and Heat Transport. Built on the proven heritage of NASA’s 2008 Phoenix Mars lander, I was designed not to roll across craters like Curiosity or Perseverance, but to stand completely still in one quiet spot.'
                      : 'Tên đầy đủ của tôi là Interior Exploration using Seismic Investigations, Geodesy and Heat Transport (Khảo sát Nội tâm Sao Hỏa bằng Địa chấn, Trắc địa và Truyền nhiệt). Kế thừa thiết kế từ tàu đổ bộ Phoenix năm 2008, tôi không lăn bánh qua các miệng núi lửa như Curiosity hay Perseverance, mà đứng yên tuyệt đối tại một vị trí tĩnh lặng.'}
                  </p>

                  <p className="text-sm sm:text-base text-[#F3E5D8]/90 leading-relaxed">
                    {lang === 'en'
                      ? 'Just as a doctor cannot listen to your heartbeat while you are sprinting, a planetary seismologist cannot detect ground vibrations smaller than a hydrogen atom if wheel motors and suspension joints are creaking.'
                      : 'Cũng giống như bác sĩ không thể dùng ống nghe khám nhịp tim khi bạn đang chạy nước rút, một trạm địa chấn hành tinh không thể bắt được những rung động nhỏ hơn nguyên tử Hydro nếu động cơ và khớp bánh xe liên tục phát ra tiếng động.'}
                  </p>

                  {/* 4 Key Mission Counters */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="p-3.5 rounded-xl bg-[#1A0D09] border border-[#F4A261]/35">
                      <div className="text-xl sm:text-2xl font-extrabold text-[#FFD1A6]">
                        4 Yrs, 25 Days
                      </div>
                      <div className="text-xs text-[#F3E5D8]/85 mt-0.5">
                        {lang === 'en'
                          ? 'Active Operations on Mars (1,440 Sols)'
                          : 'Thời gian hoạt động (1.440 ngày Sao Hỏa)'}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#1A0D09] border border-[#64DFDF]/35">
                      <div className="text-xl sm:text-2xl font-extrabold text-[#64DFDF]">
                        1,319
                      </div>
                      <div className="text-xs text-[#F3E5D8]/85 mt-0.5">
                        {lang === 'en'
                          ? 'Confirmed Marsquakes Recorded'
                          : 'Trận động đất Sao Hỏa được ghi nhận'}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#1A0D09] border border-[#F4A261]/35">
                      <div className="text-xl sm:text-2xl font-extrabold text-[#FFD1A6]">
                        1.8 Meters
                      </div>
                      <div className="text-xs text-[#F3E5D8]/85 mt-0.5">
                        {lang === 'en'
                          ? 'Robotic Arm (IDA) Reach on Soil'
                          : 'Tầm với cánh tay robot hạ đặt thiết bị'}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#1A0D09] border border-[#64DFDF]/35">
                      <div className="text-xl sm:text-2xl font-extrabold text-[#64DFDF]">
                        0 Wheels
                      </div>
                      <div className="text-xs text-[#F3E5D8]/85 mt-0.5">
                        {lang === 'en'
                          ? '3 Rigid Titanium Legs for Acoustic Silence'
                          : '3 Chân đáp titan cố định chống rung nhiễu'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right 6 Cols: Interactive Stationary Lander vs Rolling Rover Comparison + PIA19664 */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="rounded-2xl border border-[#F4A261]/35 bg-[#1B0E0A] p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#64DFDF]">
                        {lang === 'en'
                          ? 'Interactive Spacecraft Architecture Comparison'
                          : 'So Sánh Thiết Kế Trạm Cố Định & Xe Tự Hành'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setLanderCompareTab('insight')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-colors ${
                          landerCompareTab === 'insight'
                            ? 'bg-[#F4A261] text-[#1D0F0A]'
                            : 'bg-[#2C1710] text-[#F3E5D8] hover:text-white'
                        }`}
                      >
                        {lang === 'en'
                          ? 'InSight Stationary Lander'
                          : 'Trạm Cố Định InSight (3 Chân)'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setLanderCompareTab('rover')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-colors ${
                          landerCompareTab === 'rover'
                            ? 'bg-[#64DFDF] text-[#101C26]'
                            : 'bg-[#2C1710] text-[#F3E5D8] hover:text-white'
                        }`}
                      >
                        {lang === 'en'
                          ? 'Rolling Mars Rover (6 Wheels)'
                          : 'Xe Tự Hành Sao Hỏa (6 Bánh Xe)'}
                      </button>
                    </div>

                    {landerCompareTab === 'insight' ? (
                      <div className="p-3.5 rounded-xl bg-[#26140E] border border-[#F4A261]/30 space-y-1.5 text-xs">
                        <div className="font-bold text-[#FFD1A6] text-sm">
                          {lang === 'en'
                            ? 'Stationary Geophysical Observatory (NSSDCA: 2018-042A)'
                            : 'Đài Quan Sắc Địa Vật Lý Cố Định (NSSDCA: 2018-042A)'}
                        </div>
                        <p className="text-[#F3E5D8]/90 leading-relaxed">
                          {lang === 'en'
                            ? '• Mission Goal: Look 1,830 km deep into the crust, mantle, and core from a flat, safe plain (Elysium Planitia).'
                            : '• Mục tiêu: Nhìn xuyên sâu 1.830 km vào lớp vỏ, lớp phủ và lõi hành tinh từ đồng bằng phẳng Elysium Planitia.'}
                        </p>
                        <p className="text-[#F3E5D8]/90 leading-relaxed">
                          {lang === 'en'
                            ? '• Key Advantage: Placing SEIS directly on the ground away from the lander deck allowed detection of atomic-scale seismic waves.'
                            : '• Ưu thế: Đặt máy SEIS trực tiếp xuống đất giúp phát hiện sóng địa chấn có biên độ nhỏ cỡ nguyên tử.'}
                        </p>
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-xl bg-[#26140E] border border-[#64DFDF]/30 space-y-1.5 text-xs">
                        <div className="font-bold text-[#64DFDF] text-sm">
                          {lang === 'en'
                            ? 'Mobile Surface Geologist (e.g., Curiosity & Perseverance)'
                            : 'Nhà Địa Chất Bề Mặt Di Động (VD: Curiosity & Perseverance)'}
                        </div>
                        <p className="text-[#F3E5D8]/90 leading-relaxed">
                          {lang === 'en'
                            ? '• Mission Goal: Drive across ancient river deltas and craters to drill surface rock samples and search for biosignatures.'
                            : '• Mục tiêu: Di chuyển qua các miệng hố và châu thổ sông cổ đại để khoan mẫu đá bề mặt.'}
                        </p>
                        <p className="text-[#F3E5D8]/90 leading-relaxed">
                          {lang === 'en'
                            ? '• Why Rovers Can’t Do InSight’s Job: Six wheels, suspension bogies, and RTG generators vibrate too much to record ultra-faint deep mantle quakes.'
                            : '• Khác biệt: Hệ thống 6 bánh xe và khung gầm tạo nhiều rung động cơ học nên không thể thay thế ống nghe địa chấn siêu nhạy của InSight.'}
                        </p>
                      </div>
                    )}

                    <div className="relative rounded-xl overflow-hidden border border-[#F4A261]/30 h-[210px] bg-[#120906]">
                      <img
                        src={INSIGHT_MEDIA_ASSETS.PIA19664_NASA}
                        onError={(e) => {
                          e.currentTarget.src = INSIGHT_MEDIA_ASSETS.PIA22227_LOCAL;
                        }}
                        alt="NASA PIA19664 InSight Solar Panels Open in Cleanroom"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 left-2 right-2 px-3 py-1.5 rounded-lg bg-[#1A0D09]/90 text-[11px] text-[#FFD1A6] flex items-center justify-between">
                        <span>
                          {lang === 'en'
                            ? 'InSight’s twin decagonal solar panels open (PIA19664)'
                            : 'Hai cánh pin mặt trời hình thập giác của InSight (PIA19664)'}
                        </span>
                        <span className="text-[#64DFDF] font-bold">Span: 6.0m</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ChapterBackdropWrapper>
        )}

        {/* ===================================================================
            PAGE 03: THE JOURNEY TO MARS (Hành trình 485 triệu km tới Hành tinh Đỏ)
           =================================================================== */}
        {isPageVisible(2) && (
          <ChapterBackdropWrapper chapterIndex={2} lang={lang}>
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-full bg-[#3A1F16] border border-[#F4A261]/45 text-xs font-bold text-[#FFD1A6]">
                  {lang === 'en'
                    ? 'PAGE 03 OF 10 · 485 MILLION KM JOURNEY & MISSION TIMELINE'
                    : 'TRANG 03 / 10 · HÀNH TRÌNH 485 TRIỆU KM & DÒNG THỜI GIAN SỨ MỆNH'}
                </span>
                <a
                  href="https://www.nasa.gov/news-release/nasa-insight-lander-arrives-on-martian-surface-to-learn-what-lies-beneath/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 rounded-full bg-[#1C0E0A] border border-[#64DFDF]/45 text-xs font-bold text-[#64DFDF] hover:bg-[#2B1610]"
                >
                  {lang === 'en' ? 'Verify at NASA/JPL ↗' : 'Kiểm chứng tại NASA/JPL ↗'}
                </a>
              </div>

              <div className="space-y-2">
                <h2 className="font-serif-editorial text-2xl sm:text-4xl font-bold text-[#FFF8F2]">
                  {lang === 'en'
                    ? 'From California Fog to Martian Fire: My 6 Key Mission Milestones'
                    : 'Từ Sương Mù California Tới Bầu Trời Lửa Sao Hỏa: 6 Cột Mốc Lịch Sử'}
                </h2>
                <p className="text-sm text-[#F3E5D8]/90 max-w-3xl">
                  {lang === 'en'
                    ? 'Click each milestone below to trace my 485-million-km flight (accompanied by the twin MarCO CubeSats), my 19,800 km/h atmospheric entry, and my 1,440 sols on Mars.'
                    : 'Nhấn vào từng cột mốc bên dưới để theo dõi chặng bay 485 triệu km (cùng cặp vệ tinh MarCO), màn lao vào khí quyển ở tốc độ 19.800 km/h và 1.440 ngày hoạt động trên Sao Hỏa.'}
                </p>
              </div>

              {/* 6 Interactive Milestone Selector Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {JOURNEY_MILESTONES.map((ms, idx) => {
                  const active = idx === selectedMilestoneIdx;
                  return (
                    <button
                      key={ms.id}
                      type="button"
                      data-testid={`journey-milestone-btn-${idx}`}
                      onClick={() => setSelectedMilestoneIdx(idx)}
                      className={`p-3 rounded-xl text-left transition-all border ${
                        active
                          ? 'bg-[#F4A261] text-[#1D0F0A] border-[#FFD1A6] shadow-lg font-bold'
                          : 'bg-[#1C0F0B] text-[#F3E5D8] border-[#F4A261]/30 hover:bg-[#2E1912]'
                      }`}
                    >
                      <div className="text-[11px] opacity-85">0{idx + 1}</div>
                      <div className="text-xs font-bold mt-0.5 leading-snug">
                        {ms.dateLabel[lang]}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Active Milestone Detail & Real NASA Photograph */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center rounded-2xl border border-[#F4A261]/35 bg-[#1B0E0A] p-4 sm:p-6 mobile-single-col-lock">
                <div className="lg:col-span-6 space-y-3">
                  <span className="inline-block px-3 py-1 rounded-lg bg-[#2E1811] text-xs font-bold text-[#64DFDF]">
                    {activeMilestone.telemetryBadge[lang]}
                  </span>
                  <h3 className="font-serif-editorial text-xl sm:text-2xl font-bold text-[#FFF8F2]">
                    {activeMilestone.title[lang]}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#F3E5D8]/90 leading-relaxed">
                    {activeMilestone.story[lang]}
                  </p>
                  <div className="pt-2 flex items-center justify-between text-xs">
                    <span className="text-[#FFD1A6] font-semibold">
                      {activeMilestone.imageCredit}
                    </span>
                    <a
                      href={activeMilestone.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#64DFDF] font-bold hover:underline"
                    >
                      {lang === 'en' ? 'Official NASA Log ↗' : 'Hồ sơ NASA ↗'}
                    </a>
                  </div>
                </div>

                <div className="lg:col-span-6">
                  <div className="relative rounded-xl overflow-hidden border border-[#F4A261]/35 h-[260px] sm:h-[310px] bg-[#120906]">
                    <img
                      src={activeMilestone.imageUrl}
                      onError={(e) => {
                        e.currentTarget.src = activeMilestone.fallbackUrl;
                      }}
                      alt={activeMilestone.title[lang]}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </ChapterBackdropWrapper>
        )}

        {/* ===================================================================
            PAGE 04: THE MISSION (Ba sứ mệnh khám phá lòng đất đỏ)
           =================================================================== */}
        {isPageVisible(3) && (
          <ChapterBackdropWrapper chapterIndex={3} lang={lang}>
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-full bg-[#3A1F16] border border-[#F4A261]/45 text-xs font-bold text-[#FFD1A6]">
                  {lang === 'en'
                    ? 'PAGE 04 OF 10 · THE MISSION: THREE PILLARS OF PLANETARY SCIENCE'
                    : 'TRANG 04 / 10 · BA SỨ MỆNH KHÁM PHÁ LÒNG ĐẤT ĐỎ'}
                </span>
                <a
                  href="https://science.nasa.gov/mission/insight/science/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 rounded-full bg-[#1C0E0A] border border-[#64DFDF]/45 text-xs font-bold text-[#64DFDF] hover:bg-[#2B1610]"
                >
                  {lang === 'en' ? 'Verify at NASA/JPL ↗' : 'Kiểm chứng tại NASA/JPL ↗'}
                </a>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mobile-single-col-lock">
                {/* Left 7 Cols: Why Mars is a 4.5-Billion-Year Time Capsule + 3 Pillars */}
                <div className="lg:col-span-7 space-y-4">
                  <h2 className="font-serif-editorial text-2xl sm:text-4xl font-bold text-[#FFF8F2]">
                    {lang === 'en'
                      ? 'Why Go to Mars Just to Look Underground?'
                      : 'Vì Sao Bay Tới Sao Hỏa Chỉ Để Nhìn Xuống Lòng Đất?'}
                  </h2>

                  <p className="text-sm text-[#F3E5D8]/90 leading-relaxed">
                    {lang === 'en'
                      ? 'On Earth, moving tectonic plates constantly melt and recycle the crust, erasing the geological fingerprint of how rocky planets formed 4.5 billion years ago. Mars is smaller and froze its tectonic lid early—preserving a pristine time capsule of the young Solar System.'
                      : 'Trên Trái Đất, các mảng kiến tạo liên tục trượt và nấu chảy lớp vỏ, xóa sạch dấu vết thuở sơ khai cách đây 4,5 tỷ năm. Sao Hỏa nhỏ hơn và sớm đóng băng lớp vỏ ngoài—trở thành một "hộp thời gian" nguyên vẹn giúp giải mã sự hình thành của các hành tinh đất đá.'}
                  </p>

                  {/* 3 Interactive Investigation Pillars */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      {
                        id: 'seis' as const,
                        label: '1. SEIS (Seismology)',
                        viLabel: '1. SEIS (Địa chấn)',
                      },
                      {
                        id: 'hp3' as const,
                        label: '2. HP³ (Heat Flow)',
                        viLabel: '2. HP³ (Dòng nhiệt)',
                      },
                      {
                        id: 'rise' as const,
                        label: '3. RISE (Radio Geodesy)',
                        viLabel: '3. RISE (Trắc địa vô tuyến)',
                      },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedPillar(p.id)}
                        className={`p-3 rounded-xl text-xs font-bold transition-all ${
                          selectedPillar === p.id
                            ? 'bg-[#F4A261] text-[#1D0F0A] shadow-lg'
                            : 'bg-[#1C0F0B] text-[#F3E5D8] border border-[#F4A261]/30 hover:bg-[#2E1912]'
                        }`}
                      >
                        {lang === 'en' ? p.label : p.viLabel}
                      </button>
                    ))}
                  </div>

                  {selectedPillar === 'seis' && (
                    <div className="p-4 rounded-2xl bg-[#1A0D09] border border-[#F4A261]/35 space-y-2">
                      <div className="text-xs font-bold text-[#64DFDF] uppercase">
                        {lang === 'en'
                          ? 'Investigation 01 · Seismic Experiment for Interior Structure'
                          : 'Trụ cột 01 · Thí nghiệm Địa chấn Khảo sát Cấu trúc Nội tâm'}
                      </div>
                      <h3 className="text-lg font-bold text-[#FFF8F2]">
                        {lang === 'en'
                          ? 'Taking Mars’ Pulse Across 1,319 Marsquakes'
                          : 'Bắt Mạch Sao Hỏa Qua 1.319 Trận Động Đất'}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#F3E5D8]/90 leading-relaxed">
                        {lang === 'en'
                          ? 'Just like an ultrasound uses sound waves to image inside a human body, SEIS listened to marsquakes and meteorite impacts echoing through the planet to measure the thickness of the crust (24–72 km), mantle (1,550 km), and core (1,830 km).'
                          : 'Giống như máy siêu âm dùng sóng âm để nhìn vào cơ thể người, SEIS lắng nghe sóng địa chấn từ động đất và va chạm thiên thạch dội qua lòng hành tinh để đo độ dày lớp vỏ (24–72 km), lớp phủ (1.550 km) và lõi (1.830 km).'}
                      </p>
                    </div>
                  )}

                  {selectedPillar === 'hp3' && (
                    <div className="p-4 rounded-2xl bg-[#1A0D09] border border-[#F4A261]/35 space-y-2">
                      <div className="text-xs font-bold text-[#FFD1A6] uppercase">
                        {lang === 'en'
                          ? 'Investigation 02 · Heat Flow and Physical Properties Package'
                          : 'Trụ cột 02 · Đo Dòng Nhiệt & Đặc tính Vật lý Đất (HP³)'}
                      </div>
                      <h3 className="text-lg font-bold text-[#FFF8F2]">
                        {lang === 'en'
                          ? 'Measuring Planetary Temperature & Soil Mechanics (~40 cm Depth)'
                          : 'Đo Nhiệt Độ Lòng Đất & Bài Học Cơ Học Đất (~40 cm)'}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#F3E5D8]/90 leading-relaxed">
                        {lang === 'en'
                          ? 'HP³ ("The Mole") was designed to hammer 5 meters deep to measure heat escaping from Mars’ interior. When cemented duricrust soil halted it at ~40 cm, engineers used the robotic arm scoop to bury the probe and measured the thermal conductivity of Martian regolith.'
                          : 'Mũi khoan HP³ ("Chuột chũi") được thiết kế để đóng sâu 5 mét đo dòng nhiệt thoát ra từ tâm Sao Hỏa. Khi lớp đất cứng duricrust chặn mũi khoan ở độ sâu ~40 cm, các kỹ sư đã dùng cánh tay robot hỗ trợ chôn toàn bộ thân mũi khoan để đo độ dẫn nhiệt của đất.'}
                      </p>
                    </div>
                  )}

                  {selectedPillar === 'rise' && (
                    <div className="p-4 rounded-2xl bg-[#1A0D09] border border-[#F4A261]/35 space-y-2">
                      <div className="text-xs font-bold text-[#64DFDF] uppercase">
                        {lang === 'en'
                          ? 'Investigation 03 · Rotation and Interior Structure Experiment'
                          : 'Trụ cột 03 · Thí nghiệm Tốc độ Quay & Cấu trúc Nội tâm (RISE)'}
                      </div>
                      <h3 className="text-lg font-bold text-[#FFF8F2]">
                        {lang === 'en'
                          ? 'Tracking Mars’ Wobble to Prove the Core is Liquid'
                          : 'Đo Độ Chao Đảo Của Trục Quay Để Chứng Minh Lõi Lỏng'}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#F3E5D8]/90 leading-relaxed">
                        {lang === 'en'
                          ? 'Just as a raw egg spins differently from a hard-boiled egg, a planet with a liquid core wobbles slightly more as it rotates. Using X-band radio Doppler shifts accurate to 2 centimeters, RISE proved Mars’ core is molten liquid!'
                          : 'Giống như một quả trứng sống quay khác với quả trứng luộc chín, hành tinh có lõi lỏng sẽ chao đảo nhẹ khi tự quay. Bằng sóng vô tuyến băng tần X chính xác tới 2 cm, RISE đã chứng minh lõi Sao Hỏa hoàn toàn nóng chảy!'}
                      </p>
                    </div>
                  )}

                  {/* Quick Student Discovery Check */}
                  <div className="p-3.5 rounded-xl bg-[#27140E] border border-[#64DFDF]/35 space-y-2">
                    <div className="text-xs font-bold text-[#64DFDF]">
                      {lang === 'en'
                        ? 'Quick Discovery Check: Why does Mars preserve 4.5-billion-year-old rocks better than Earth?'
                        : 'Câu hỏi khám phá nhanh: Vì sao Sao Hỏa bảo tồn đá 4,5 tỷ năm tuổi tốt hơn Trái Đất?'}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setPage4CheckAnswer('mars')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                          page4CheckAnswer === 'mars'
                            ? 'bg-[#64DFDF] text-[#101C26] border-[#64DFDF]'
                            : 'bg-[#1A0D09] text-[#F3E5D8] border-[#F4A261]/30'
                        }`}
                      >
                        {lang === 'en'
                          ? '✓ Mars lacks active plate tectonics that recycle its crust'
                          : '✓ Sao Hỏa không có các mảng kiến tạo nấu chảy lại lớp vỏ'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPage4CheckAnswer('earth')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                          page4CheckAnswer === 'earth'
                            ? 'bg-[#E76F51] text-white border-[#E76F51]'
                            : 'bg-[#1A0D09] text-[#F3E5D8] border-[#F4A261]/30'
                        }`}
                      >
                        {lang === 'en'
                          ? 'Mars is covered in thick glaciers everywhere'
                          : 'Sao Hỏa được bao phủ bởi băng hà dày ở mọi nơi'}
                      </button>
                    </div>
                    {page4CheckAnswer === 'mars' && (
                      <p className="text-xs text-[#64DFDF] font-semibold">
                        {lang === 'en'
                          ? 'Exactly! Without plate subduction, Mars’ crust and mantle act as a frozen geological time capsule.'
                          : 'Chính xác! Không có sự hút chìm mảng kiến tạo, lớp vỏ và lớp phủ Sao Hỏa giữ nguyên vẹn dấu vết từ thuở sơ khai.'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right 5 Cols: Official NASA PIA19811 Subsurface Cross-Section */}
                <div className="lg:col-span-5">
                  <div className="rounded-2xl overflow-hidden border border-[#F4A261]/40 bg-[#140A07] p-3 space-y-2 shadow-2xl">
                    <img
                      src={INSIGHT_MEDIA_ASSETS.PIA19811_LOCAL}
                      onError={(e) => {
                        e.currentTarget.src = INSIGHT_MEDIA_ASSETS.PIA19811_NASA;
                      }}
                      alt="NASA PIA19811 InSight Subsurface Cross-Section"
                      className="w-full max-h-[390px] object-contain rounded-xl mx-auto"
                    />
                    <div className="p-2.5 rounded-xl bg-[#1D0F0A] text-xs text-[#FFD1A6] flex items-center justify-between">
                      <span>
                        {lang === 'en'
                          ? 'Official NASA Subsurface Cutaway (PIA19811)'
                          : 'Mặt cắt lòng đất chính thức của NASA (PIA19811)'}
                      </span>
                      <span className="text-[#64DFDF] font-bold">SEIS · HP³ · RISE</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ChapterBackdropWrapper>
        )}

        {/* ===================================================================
            PAGE 05: INSIDE MY BODY (Giải phẫu cơ thể tôi — 3D & Sơ đồ PIA17358)
           =================================================================== */}
        {isPageVisible(4) && (
          <ChapterBackdropWrapper chapterIndex={4} lang={lang}>
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-full bg-[#3A1F16] border border-[#F4A261]/45 text-xs font-bold text-[#FFD1A6]">
                  {lang === 'en'
                    ? 'PAGE 05 OF 10 · INSIDE MY BODY: 9 SUBSYSTEMS (3D RIG, PIA17358 & NASA EYES)'
                    : 'TRANG 05 / 10 · GIẢI PHẪU CƠ THỂ TÔI: 9 THIẾT BỊ (3D, SƠ ĐỒ PIA17358 & NASA EYES)'}
                </span>
                <a
                  href="https://science.nasa.gov/mission/insight/science-instruments/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 rounded-full bg-[#1C0E0A] border border-[#64DFDF]/45 text-xs font-bold text-[#64DFDF] hover:bg-[#2B1610]"
                >
                  {lang === 'en' ? 'Verify at NASA/JPL ↗' : 'Kiểm chứng tại NASA/JPL ↗'}
                </a>
              </div>

              <div className="space-y-1.5">
                <h2 className="font-serif-editorial text-2xl sm:text-4xl font-bold text-[#FFF8F2]">
                  {lang === 'en'
                    ? 'Explore My 9 Scientific Subsystems in 3D & Official PIA17358 Blueprint'
                    : 'Khám Phá 9 Hệ Thống Thiết Bị Trên Cơ Thể Tôi Qua Mô Hình 3D & Sơ Đồ PIA17358'}
                </h2>
                <p className="text-xs sm:text-sm text-[#F3E5D8]/90 max-w-3xl">
                  {lang === 'en'
                    ? 'Select any of the 9 subsystems on the right or tap a glowing orb to inspect its single callout line, switch to the official NASA PIA17358 diagram, or launch the pre-warmed NASA Eyes 3D live embed.'
                    : 'Chọn bất kỳ thiết bị nào trong 9 hệ thống bên phải hoặc chạm vào điểm sáng để xem đường chỉ dẫn riêng biệt, chuyển sang sơ đồ gốc PIA17358 của NASA, hoặc mở trực tiếp NASA Eyes 3D.'}
                </p>
              </div>

              <InSightLander3D
                lang={lang}
                selectedSubsystemId={selectedSubsystemId}
                onSelectSubsystem={setSelectedSubsystemId}
              />
            </div>
          </ChapterBackdropWrapper>
        )}

        {/* ===================================================================
            PAGE 06: THE HEART OF MARS (Trái tim Sao Hỏa: Vỏ – Lớp phủ – Lõi)
           =================================================================== */}
        {isPageVisible(5) && (
          <ChapterBackdropWrapper chapterIndex={5} lang={lang}>
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-full bg-[#3A1F16] border border-[#F4A261]/45 text-xs font-bold text-[#FFD1A6]">
                  {lang === 'en'
                    ? 'PAGE 06 OF 10 · THE HEART OF MARS: CRUST, LUMPY MANTLE & LIQUID CORE'
                    : 'TRANG 06 / 10 · TRÁI TIM SAO HỎA: LỚP VỎ – LỚP PHỦ – LÕI NÓNG CHẢY'}
                </span>
                <a
                  href="https://science.nasa.gov/mission/insight/science-highlights/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 rounded-full bg-[#1C0E0A] border border-[#64DFDF]/45 text-xs font-bold text-[#64DFDF] hover:bg-[#2B1610]"
                >
                  {lang === 'en' ? 'Verify at NASA/JPL ↗' : 'Kiểm chứng tại NASA/JPL ↗'}
                </a>
              </div>

              <div className="space-y-1.5">
                <h2 className="font-serif-editorial text-2xl sm:text-4xl font-bold text-[#FFF8F2]">
                  {lang === 'en'
                    ? 'Seeing 1,830 Kilometers Deep Without Drilling a Single Deep Hole'
                    : 'Nhìn Xuyên Sâu 1.830 Km Xuống Tâm Sao Hỏa Mà Không Cần Đào Giếng Sâu'}
                </h2>
                <p className="text-xs sm:text-sm text-[#F3E5D8]/90 max-w-3xl">
                  {lang === 'en'
                    ? 'Tap each layer in the cutaway below to inspect how SEIS and RISE mapped Mars’ 3-layer volcanic crust (24–72 km), lumpy silicate mantle (1,550 km), and molten iron-alloy core (1,830 km radius).'
                    : 'Chạm vào từng lớp cấu trúc bên dưới để xem SEIS và RISE đã lập bản đồ lớp vỏ 3 tầng (24–72 km), lớp phủ silicat lổn nhổn (1.550 km) và lõi sắt lỏng (bán kính 1.830 km) như thế nào.'}
                </p>
              </div>

              <MartianInteriorCutaway lang={lang} />
            </div>
          </ChapterBackdropWrapper>
        )}

        {/* ===================================================================
            PAGE 07: LISTENING TO THE PLANET (Lắng nghe nhịp đập của một hành tinh)
           =================================================================== */}
        {isPageVisible(6) && (
          <ChapterBackdropWrapper chapterIndex={6} lang={lang}>
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-full bg-[#3A1F16] border border-[#F4A261]/45 text-xs font-bold text-[#FFD1A6]">
                  {lang === 'en'
                    ? 'PAGE 07 OF 10 · LISTENING TO THE PLANET: P/S WAVES & MARTIAN WIND'
                    : 'TRANG 07 / 10 · LẮNG NGHE HÀNH TINH: SÓNG P/S & ÂM THANH GIÓ SAO HỎA'}
                </span>
                <a
                  href="https://science.nasa.gov/resource/listen-to-nasas-insight-at-work-on-mars/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 rounded-full bg-[#1C0E0A] border border-[#64DFDF]/45 text-xs font-bold text-[#64DFDF] hover:bg-[#2B1610]"
                >
                  {lang === 'en' ? 'Verify at NASA/JPL ↗' : 'Kiểm chứng tại NASA/JPL ↗'}
                </a>
              </div>

              <div className="space-y-1.5">
                <h2 className="font-serif-editorial text-2xl sm:text-4xl font-bold text-[#FFF8F2]">
                  {lang === 'en'
                    ? 'How Do You Hear a Planet? From Sol 4 Wind Rumblings to Sol 128 Marsquakes'
                    : 'Làm Sao Để "Nghe" Được Một Hành Tinh? Từ Tiếng Gió Sol 4 Tới Động Đất Sol 128'}
                </h2>
                <p className="text-xs sm:text-sm text-[#F3E5D8]/90 max-w-3xl">
                  {lang === 'en'
                    ? 'On December 1, 2018, my sensors captured the low rumble of Martian wind blowing across my solar wings. On April 6, 2019 (Sol 128), I recorded the first marsquake. Simulate P-wave and S-wave shadow zones or listen to the official NASA JPL recordings below.'
                    : 'Ngày 01/12/2018, cảm biến của tôi thu được tiếng gió trầm đục thổi qua hai cánh pin. Đến ngày 06/04/2019 (Sol 128), tôi ghi nhận trận động đất Sao Hỏa đầu tiên. Hãy chạy thử mô phỏng sóng P/S và nghe bản thu chính thức của NASA JPL bên dưới.'}
                </p>
              </div>

              <SeismicSonificationLab lang={lang} />
            </div>
          </ChapterBackdropWrapper>
        )}

        {/* ===================================================================
            PAGE 08: THE SECRETS I LEFT BEHIND (Những bí mật chấn động tôi để lại)
           =================================================================== */}
        {isPageVisible(7) && (
          <ChapterBackdropWrapper chapterIndex={7} lang={lang}>
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-full bg-[#3A1F16] border border-[#F4A261]/45 text-xs font-bold text-[#FFD1A6]">
                  {lang === 'en'
                    ? 'PAGE 08 OF 10 · THE SECRETS I LEFT BEHIND (INCLUDING AUG 2025 BREAKTHROUGH)'
                    : 'TRANG 08 / 10 · NHỮNG BÍ MẬT TÔI ĐỂ LẠI (GỒM ĐỘT PHÁ THÁNG 8/2025)'}
                </span>
                <a
                  href="https://www.nasa.gov/missions/insight/nasa-marsquake-data-reveals-lumpy-nature-of-red-planets-interior/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 rounded-full bg-[#1C0E0A] border border-[#64DFDF]/45 text-xs font-bold text-[#64DFDF] hover:bg-[#2B1610]"
                >
                  {lang === 'en' ? 'Verify at NASA/JPL ↗' : 'Kiểm chứng tại NASA/JPL ↗'}
                </a>
              </div>

              <div className="space-y-1.5">
                <h2 className="font-serif-editorial text-2xl sm:text-4xl font-bold text-[#FFF8F2]">
                  {lang === 'en'
                    ? 'Four Breakthrough Discoveries From My Open Seismic Archive'
                    : 'Bốn Khám Phá Chấn Động Từ Kho Dữ Liệu Địa Chấn Mở Của Tôi'}
                </h2>
                <p className="text-xs sm:text-sm text-[#F3E5D8]/90 max-w-3xl">
                  {lang === 'en'
                    ? 'Even years after my radio went silent in 2022, planetary scientists continue to make headline discoveries in my data—including the August 2025 Science study revealing giant 4.5-billion-year-old impact fragments in Mars’ mantle.'
                    : 'Ngay cả khi đài phát của tôi đã ngừng hoạt động từ năm 2022, các nhà khoa học vẫn liên tục tìm ra những phát hiện mới từ kho dữ liệu của tôi—tiêu biểu là công bố tháng 8/2025 trên tạp chí Science về các mảnh vỡ 4,5 tỷ năm tuổi trong lớp phủ.'}
                </p>
              </div>

              {/* 4-Discovery Bento Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mobile-single-col-lock">
                {INSIGHT_DISCOVERIES_4.map((disc, idx) => {
                  const isSelected = idx === selectedDiscoveryIdx;
                  return (
                    <div
                      key={disc.id}
                      onClick={() => setSelectedDiscoveryIdx(idx)}
                      className={`rounded-2xl border p-4 sm:p-5 flex flex-col justify-between space-y-3.5 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#26130D] border-[#64DFDF] shadow-2xl'
                          : 'bg-[#1A0D09]/90 border-[#F4A261]/30 hover:border-[#F4A261]/60'
                      }`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-[#341C14] text-[11px] font-bold text-[#FFD1A6]">
                            {disc.badge[lang]}
                          </span>
                          <span className="text-xs font-extrabold text-[#64DFDF]">
                            {disc.metric}
                          </span>
                        </div>

                        <div className="relative rounded-xl overflow-hidden border border-[#F4A261]/25 h-44 bg-[#110806]">
                          <img
                            src={disc.imageUrl}
                            alt={disc.title[lang]}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-1.5 right-2 px-2 py-0.5 rounded bg-black/75 text-[10px] text-[#FFD1A6]">
                            {disc.imageCredit}
                          </div>
                        </div>

                        <h3 className="text-base sm:text-lg font-bold text-[#FFF8F2]">
                          {disc.title[lang]}
                        </h3>
                        <p className="text-xs text-[#F3E5D8]/90 leading-relaxed">
                          {disc.summary[lang]}
                        </p>
                        <p className="text-xs text-[#FFD1A6]/85 leading-relaxed">
                          {disc.detail[lang]}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[#F4A261]/20 flex items-center justify-between text-xs">
                        <span className="text-[#64DFDF] font-semibold">
                          {lang === 'en' ? 'Primary NASA Archive' : 'Hồ sơ gốc NASA'}
                        </span>
                        <a
                          href={disc.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="font-bold text-[#FFD1A6] hover:underline"
                        >
                          {lang === 'en' ? 'Read NASA Study ↗' : 'Xem Công Bố NASA ↗'}
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </ChapterBackdropWrapper>
        )}

        {/* ===================================================================
            PAGE 09: WHEN THE LIGHTS WENT OUT (Khi ánh sáng tắt dần dưới lớp bụi đỏ)
           =================================================================== */}
        {isPageVisible(8) && (
          <ChapterBackdropWrapper chapterIndex={8} lang={lang}>
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-full bg-[#3A1F16] border border-[#F4A261]/45 text-xs font-bold text-[#FFD1A6]">
                  {lang === 'en'
                    ? 'PAGE 09 OF 10 · WHEN THE LIGHTS WENT OUT: 5,000 Wh → 500 Wh'
                    : 'TRANG 09 / 10 · KHI ÁNH SÁNG TẮT DẦN: TỪ 5.000 Wh XUỐNG 500 Wh'}
                </span>
                <a
                  href="https://science.nasa.gov/resource/insights-power-generation-after-landing-and-spring-2022/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 rounded-full bg-[#1C0E0A] border border-[#64DFDF]/45 text-xs font-bold text-[#64DFDF] hover:bg-[#2B1610]"
                >
                  {lang === 'en' ? 'Verify at NASA/JPL ↗' : 'Kiểm chứng tại NASA/JPL ↗'}
                </a>
              </div>

              <div className="space-y-1.5">
                <h2 className="font-serif-editorial text-2xl sm:text-4xl font-bold text-[#FFF8F2]">
                  {lang === 'en'
                    ? 'Red Dust on My Wings & My Final Signal on December 15, 2022'
                    : 'Bụi Đỏ Trên Đôi Cánh Pin & Tín Hiệu Cuối Cùng Ngày 15/12/2022'}
                </h2>
                <p className="text-xs sm:text-sm text-[#F3E5D8]/90 max-w-3xl">
                  {lang === 'en'
                    ? 'From generating ~5,000 Wh per Martian day (sol) after landing in 2018, airborne iron-oxide dust reduced my solar power to just ~500 Wh/sol by 2022. Drag the selfie scrubber below to compare my clean 2018 arrays (PIA22876) with my final 2022 dust-blanketed selfie (PIA25287).'
                    : 'Từ mức ~5.000 Wh điện mỗi ngày Sao Hỏa (sol) khi mới hạ cánh năm 2018, bụi oxit sắt trong khí quyển đã làm công suất giảm xuống chỉ còn ~500 Wh/sol vào năm 2022. Hãy kéo thanh trượt bên dưới để so sánh bức ảnh selfie năm 2018 (PIA22876) và năm 2022 (PIA25287).'}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mobile-single-col-lock">
                {/* Left 6 Cols: Before/After Dust Selfie Scrubber (PIA22876 vs PIA25287) + Power Bar */}
                <div className="lg:col-span-6 rounded-2xl border border-[#F4A261]/35 bg-[#1A0D09] p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-[#64DFDF]">
                      {lang === 'en'
                        ? 'Dec 2018 Clean Selfie (PIA22876)'
                        : 'Tháng 12/2018 Sạch Bụi (PIA22876)'}
                    </span>
                    <span className="text-[#F4A261]">
                      {lang === 'en'
                        ? 'Apr 2022 Final Selfie (PIA25287)'
                        : 'Tháng 4/2022 Phủ Đầy Bụi (PIA25287)'}
                    </span>
                  </div>

                  {/* Overlaid Before/After Image Comparison Viewport */}
                  <div className="relative w-full h-[270px] sm:h-[310px] rounded-xl overflow-hidden border border-[#F4A261]/35 bg-[#110806]">
                    {/* Base Image: Clean 2018 Selfie (PIA22876) */}
                    <img
                      src={INSIGHT_MEDIA_ASSETS.PIA22876_MED}
                      alt="InSight Clean Solar Panels Selfie Dec 2018 PIA22876"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    {/* Foreground Image: Dusty 2022 Selfie (PIA25287) with opacity/clip synced to dustPercent */}
                    <img
                      src={INSIGHT_MEDIA_ASSETS.PIA25287_MED}
                      alt="InSight Dust-Covered Solar Panels Selfie April 2022 PIA25287"
                      style={{ opacity: dustPercent / 90 }}
                      className="absolute inset-0 w-full h-full object-cover transition-opacity duration-150"
                    />
                    <div className="absolute bottom-2 left-2 right-2 px-3 py-1.5 rounded-lg bg-[#1A0D09]/92 border border-[#F4A261]/35 flex items-center justify-between text-xs font-bold">
                      <span className="text-[#FFD1A6]">
                        {lang === 'en' ? solarMetrics.dateLabelEn : solarMetrics.dateLabelVi}
                      </span>
                      <span className="text-[#64DFDF]">
                        {solarMetrics.wattHoursPerSol.toLocaleString()} Wh/sol
                      </span>
                    </div>
                  </div>

                  {/* Dust Cover Scrubber Slider */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <label htmlFor="dust-scrubber-slider" className="text-[#FFD1A6]">
                        {lang === 'en'
                          ? `Martian Dust Accumulation: ${solarMetrics.dustClamped}%`
                          : `Độ Che Phủ Bụi Sao Hỏa: ${solarMetrics.dustClamped}%`}
                      </label>
                      <span className="text-[#64DFDF]">
                        {solarMetrics.percentOfInitial}% {lang === 'en' ? 'Power Remaining' : 'Điện năng còn lại'}
                      </span>
                    </div>
                    <input
                      id="dust-scrubber-slider"
                      data-testid="dust-scrubber-slider"
                      type="range"
                      min={0}
                      max={90}
                      step={5}
                      value={dustPercent}
                      onChange={(e) => setDustPercent(Number(e.target.value))}
                      className="w-full accent-[#F4A261]"
                    />
                  </div>

                  {/* Visual 5,000 Wh -> 500 Wh Energy Comparison Bar */}
                  <div className="p-3 rounded-xl bg-[#25130D] border border-[#F4A261]/25 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[#F3E5D8]/85">
                        {lang === 'en' ? '2018 Landing Baseline:' : 'Khi mới hạ cánh (2018):'}
                      </span>
                      <span className="font-bold text-[#64DFDF]">5,000 Wh / sol (100%)</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-[#140A07] overflow-hidden">
                      <div
                        style={{ width: `${solarMetrics.percentOfInitial}%` }}
                        className="h-full bg-gradient-to-r from-[#E76F51] via-[#F4A261] to-[#64DFDF] transition-all duration-200"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#F3E5D8]/85">
                        {lang === 'en' ? 'Selected Sol Energy:' : 'Năng lượng tại thời điểm chọn:'}
                      </span>
                      <span className="font-bold text-[#FFD1A6]">
                        {solarMetrics.wattHoursPerSol.toLocaleString()} Wh / sol
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right 6 Cols: Classroom Energy Trade-Off Activity */}
                <div className="lg:col-span-6 rounded-2xl border border-[#F4A261]/35 bg-[#1A0D09] p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-[#341C14] text-[11px] font-bold text-[#64DFDF]">
                      {lang === 'en'
                        ? 'Simplified Educational Classroom Scenario'
                        : 'Mô Phỏng Giáo Dục Dành Cho Lớp Học'}
                    </span>
                    <span className="text-xs font-bold text-[#FFD1A6]">
                      {lang === 'en' ? 'Available:' : 'Quỹ điện:'}{' '}
                      {solarMetrics.wattHoursPerSol} Wh
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#FFF8F2]">
                    {lang === 'en'
                      ? 'Mission Planner Lab: How Would You Spend InSight’s Remaining Electricity?'
                      : 'Thử Thách Kỹ Sư: Bạn Sẽ Phân Bổ Nguồn Điện Ít Ỏi Còn Lại Như Thế Nào?'}
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span>
                          {lang === 'en'
                            ? '1. Survival Electronics Heaters (Min 150 Wh to avoid freezing)'
                            : '1. Bộ Sưởi Bảo Vệ Mạch Điện (Tối thiểu 150 Wh để không đóng băng)'}
                        </span>
                        <span className="text-[#FFD1A6]">{powerInputs.survivalHeatersWh} Wh</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={400}
                        step={20}
                        value={powerInputs.survivalHeatersWh}
                        onChange={(e) =>
                          setPowerInputs((p) => ({
                            ...p,
                            survivalHeatersWh: Number(e.target.value),
                          }))
                        }
                        className="w-full accent-[#F4A261]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span>
                          {lang === 'en'
                            ? '2. SEIS Seismometer Marsquake Listening (Min 120 Wh)'
                            : '2. Máy Đo Địa Chấn SEIS Lắng Nghe Động Đất (Tối thiểu 120 Wh)'}
                        </span>
                        <span className="text-[#64DFDF]">{powerInputs.seisSeismometerWh} Wh</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={400}
                        step={20}
                        value={powerInputs.seisSeismometerWh}
                        onChange={(e) =>
                          setPowerInputs((p) => ({
                            ...p,
                            seisSeismometerWh: Number(e.target.value),
                          }))
                        }
                        className="w-full accent-[#64DFDF]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span>
                          {lang === 'en'
                            ? '3. UHF Orbiter Relay Antenna (Min 80 Wh to send data home)'
                            : '3. Ăng-ten UHF Truyền Dữ Liệu Về Trái Đất (Tối thiểu 80 Wh)'}
                        </span>
                        <span className="text-[#FFD1A6]">{powerInputs.uhfTelemetryWh} Wh</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={300}
                        step={20}
                        value={powerInputs.uhfTelemetryWh}
                        onChange={(e) =>
                          setPowerInputs((p) => ({
                            ...p,
                            uhfTelemetryWh: Number(e.target.value),
                          }))
                        }
                        className="w-full accent-[#F4A261]"
                      />
                    </div>
                  </div>

                  {/* Live Evaluation Readout */}
                  <div className="p-3.5 rounded-xl bg-[#26140E] border border-[#F4A261]/35 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between font-bold">
                      <span>
                        {lang === 'en' ? 'Allocated:' : 'Đã dùng:'} {powerEval.allocatedWh} /{' '}
                        {powerEval.availableWh} Wh
                      </span>
                      <span
                        className={
                          powerEval.status === 'OPTIMAL_SCIENCE'
                            ? 'text-[#64DFDF]'
                            : 'text-[#F4A261]'
                        }
                      >
                        {powerEval.status === 'OPTIMAL_SCIENCE'
                          ? lang === 'en'
                            ? '✓ Optimal Science Mode'
                            : '✓ Tối Ưu Thu Thập Địa Chấn'
                          : powerEval.status === 'OVER_BUDGET'
                            ? lang === 'en'
                              ? '⚠ Over Energy Budget (Battery Drain!)'
                              : '⚠ Vượt Quá Quỹ Điện (Sập Nguồn!)'
                            : powerEval.status === 'FREEZE_FAILURE'
                              ? lang === 'en'
                                ? '❄ Cold Electronics Risk (<150 Wh Heaters)'
                                : '❄ Nguy Cơ Đóng Băng Mạch (<150 Wh Sưởi)'
                              : lang === 'en'
                                ? 'Survival Standby Mode'
                                : 'Chế Độ Ngủ Đông Duy Trì'}
                      </span>
                    </div>
                    <p className="text-[#F3E5D8]/85 leading-relaxed">
                      {lang === 'en'
                        ? 'Real JPL Decision in 2022: Engineers disabled fault-protection heaters in InSight’s final months so SEIS could keep recording marsquakes until December 15, 2022!'
                        : 'Quyết định thực tế của JPL năm 2022: Các kỹ sư đã tắt bộ sưởi bảo vệ lỗi trong những tháng cuối để SEIS tiếp tục ghi nhận động đất cho đến ngày 15/12/2022!'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ChapterBackdropWrapper>
        )}

        {/* ===================================================================
            PAGE 10: ABANDONED, BUT NOT FORGOTTEN (Quiz, Huy hiệu 4D & Hồ sơ Giám khảo)
           =================================================================== */}
        {isPageVisible(9) && (
          <ChapterBackdropWrapper chapterIndex={9} lang={lang}>
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-full bg-[#3A1F16] border border-[#F4A261]/45 text-xs font-bold text-[#FFD1A6]">
                  {lang === 'en'
                    ? 'PAGE 10 OF 10 · ABANDONED, BUT NOT FORGOTTEN (QUIZ, 4D BADGE & JUDGE LEDGER)'
                    : 'TRANG 10 / 10 · BỊ BỎ LẠI NHƯNG KHÔNG BỊ LÃNG QUÊN (QUIZ, HUY HIỆU 4D & HỒ SƠ)'}
                </span>
                <a
                  href="https://www.jpl.nasa.gov/news/nasa-retires-insight-mars-lander-mission-after-years-of-science/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 rounded-full bg-[#1C0E0A] border border-[#64DFDF]/45 text-xs font-bold text-[#64DFDF] hover:bg-[#2B1610]"
                >
                  {lang === 'en' ? 'Verify at NASA/JPL ↗' : 'Kiểm chứng tại NASA/JPL ↗'}
                </a>
              </div>

              <div className="space-y-1.5">
                <h2 className="font-serif-editorial text-2xl sm:text-4xl font-bold text-[#FFF8F2]">
                  {lang === 'en'
                    ? 'My Radio Is Silent, Yet Every Student Who Explores My Data Keeps Me Alive'
                    : 'Đài Phát Của Tôi Đã Tắt, Nhưng Mỗi Học Sinh Mở Kho Dữ Liệu Đều Giữ Tôi Sống Mãi'}
                </h2>
                <p className="text-xs sm:text-sm text-[#F3E5D8]/90 max-w-3xl">
                  {lang === 'en'
                    ? 'Complete the 3-question InSight Knowledge Check and mint your personalized 4D Holographic Mission Badge to conclude my diary.'
                    : 'Hoàn thành 3 câu hỏi ôn tập kiến thức về InSight và khắc tên lên tấm Huy hiệu Sứ mệnh Hologram 4D của riêng bạn.'}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mobile-single-col-lock">
                {/* Left 7 Cols: 3-Question Knowledge Check */}
                <div className="lg:col-span-7 space-y-4">
                  {INSIGHT_QUIZ_QUESTIONS_3.map((q, qIdx) => {
                    const selected = quizAnswers[qIdx];
                    const isAnswered = selected !== null && selected !== undefined;
                    const isCorrect = selected === q.correctIndex;

                    return (
                      <div
                        key={q.id}
                        className="p-4 sm:p-5 rounded-2xl border border-[#F4A261]/30 bg-[#1B0E0A] space-y-3"
                      >
                        <div className="text-sm sm:text-base font-bold text-[#FFF8F2]">
                          {q.question[lang]}
                        </div>

                        <div className="space-y-2">
                          {q.options.map((opt, oIdx) => {
                            const chosen = selected === oIdx;
                            let btnStyle =
                              'bg-[#26140E] text-[#F3E5D8] border-[#F4A261]/25 hover:border-[#F4A261]/60';
                            if (isAnswered) {
                              if (oIdx === q.correctIndex) {
                                btnStyle =
                                  'bg-[#13322B] text-[#64DFDF] border-[#64DFDF] font-bold';
                              } else if (chosen) {
                                btnStyle = 'bg-[#3B1812] text-[#FFD1A6] border-[#E76F51]';
                              }
                            }
                            return (
                              <button
                                key={oIdx}
                                type="button"
                                data-testid={`quiz-q${qIdx}-opt${oIdx}`}
                                onClick={() => {
                                  const next = [...quizAnswers];
                                  next[qIdx] = oIdx;
                                  setQuizAnswers(next);
                                }}
                                className={`w-full p-3 rounded-xl border text-left text-xs sm:text-sm transition-all ${btnStyle}`}
                              >
                                {opt[lang]}
                              </button>
                            );
                          })}
                        </div>

                        {isAnswered && (
                          <div className="p-3 rounded-xl bg-[#140A07] border border-[#64DFDF]/35 text-xs space-y-1">
                            <div
                              className={`font-bold ${
                                isCorrect ? 'text-[#64DFDF]' : 'text-[#F4A261]'
                              }`}
                            >
                              {isCorrect
                                ? lang === 'en'
                                  ? '✓ Verified NASA Answer!'
                                  : '✓ Câu trả lời chính xác!'
                                : lang === 'en'
                                  ? '→ Scientific Explanation:'
                                  : '→ Giải thích khoa học:'}
                            </div>
                            <p className="text-[#F3E5D8]/90">{q.explanation[lang]}</p>
                            <a
                              href={q.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block text-[#FFD1A6] font-semibold hover:underline"
                            >
                              Source: {q.sourceLabel} ↗
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {quizResult.complete && (
                    <div className="p-4 rounded-2xl bg-[#13322B] border border-[#64DFDF] flex items-center justify-between">
                      <div className="text-xs sm:text-sm font-bold text-[#FFF8F2]">
                        {lang === 'en'
                          ? `Mission Review Complete: ${quizResult.score} / ${quizResult.total} Verified!`
                          : `Hoàn thành Ôn tập Sứ mệnh: Đạt ${quizResult.score} / ${quizResult.total} câu!`}
                      </div>
                      <button
                        type="button"
                        onClick={() => setQuizAnswers([null, null, null])}
                        className="px-3 py-1 rounded-lg bg-[#101C26] text-[#64DFDF] text-xs font-bold"
                      >
                        {lang === 'en' ? 'Reset Quiz' : 'Làm lại'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Right 5 Cols: Upgraded 4D Interactive Holographic Mission Badge Generator */}
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

              {/* 3. Collapsible "Project Overview, Judge Q&A & Scientific Sources" Drawer */}
              <div className="rounded-2xl border border-[#F4A261]/35 bg-[#190D09] overflow-hidden">
                <button
                  type="button"
                  data-testid="toggle-judge-drawer-btn"
                  aria-expanded={isJudgeDrawerOpen}
                  onClick={() => setIsJudgeDrawerOpen((v) => !v)}
                  className="w-full px-5 py-4 flex items-center justify-between gap-3 bg-[#26140E] hover:bg-[#321B13] transition-colors text-left"
                >
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-[#64DFDF]">
                      {TEAM_METADATA.umbrellaProjectTitle}
                    </div>
                    <div className="text-sm sm:text-base font-bold text-[#FFF8F2]">
                      {lang === 'en'
                        ? 'Project Overview, NASA Space Apps Judge Q&A & 12 Primary Sources'
                        : 'Tổng Quan Dự Án, Hồ Sơ Giám Khảo NASA Space Apps & 12 Nguồn Tư Liệu Gốc'}
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-[#F4A261] text-[#1D0F0A] text-xs font-bold shrink-0">
                    {isJudgeDrawerOpen
                      ? lang === 'en'
                        ? '▲ Hide Drawer'
                        : '▲ Thu Gọn'
                      : lang === 'en'
                        ? '▼ Expand Judge Q&A & Sources'
                        : '▼ Mở Hồ Sơ & Nguồn NASA'}
                  </span>
                </button>

                {isJudgeDrawerOpen && (
                  <div className="p-5 space-y-6 border-t border-[#F4A261]/25">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {JUDGE_QA_ITEMS.map((item) => (
                        <div
                          key={item.id}
                          className="p-4 rounded-xl bg-[#130906] border border-[#F4A261]/25 space-y-1.5"
                        >
                          <div className="text-xs font-bold text-[#FFD1A6]">
                            {item.question[lang]}
                          </div>
                          <p className="text-xs text-[#F3E5D8]/85 leading-relaxed">
                            {item.answer[lang]}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {SCIENTIFIC_SOURCES.map((src) => (
                        <a
                          key={src.id}
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 rounded-xl bg-[#130906] border border-[#F4A261]/20 hover:border-[#64DFDF] transition-colors flex flex-col justify-between space-y-1.5"
                        >
                          <div>
                            <div className="flex items-center justify-between text-[10px] font-bold">
                              <span className="text-[#F4A261]">{src.category}</span>
                              <span className="text-[#64DFDF]">{src.identifier}</span>
                            </div>
                            <div className="text-xs font-bold text-[#FFF8F2] mt-0.5">
                              {src.title}
                            </div>
                          </div>
                          <span className="text-[11px] font-bold text-[#FFD1A6]">
                            Verify at NASA/JPL ↗
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ChapterBackdropWrapper>
        )}
      </main>

      {/* SINGLE DEDUPLICATED BOTTOM FOOTER (Umbrella Project & Team NAU EXPLORERS NS01048) */}
      <footer className="border-t border-[#F4A261]/25 bg-[#180C08] pb-24 pt-6 px-4 sm:px-8 text-xs text-[#F3E5D8]/80">
        <div className="max-w-[1320px] mx-auto space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="font-bold text-[#FFD1A6] text-sm">
                {TEAM_METADATA.projectTitle} — Subsystem of "{TEAM_METADATA.umbrellaProjectTitle}"
              </div>
              <div>
                <strong className="text-[#FFF8F2]">
                  Team {TEAM_METADATA.teamName} (Official ID: {TEAM_METADATA.officialTeamId})
                </strong>{' '}
                · {TEAM_METADATA.institution} · {TEAM_METADATA.localEvent}
              </div>
              <div className="text-[#FFD1A6]/90">
                {lang === 'en' ? 'Official Team Members (5): ' : 'Thành viên chính thức (5): '}
                {TEAM_METADATA.members.join(' · ')}
              </div>
            </div>

            <div className="flex flex-col md:items-end gap-1 shrink-0">
              <span className="text-[#64DFDF] font-bold">
                NSSDCA ID: {TEAM_METADATA.nssdcaId} · {TEAM_METADATA.license}
              </span>
              <span>{TEAM_METADATA.targetAudience[lang]}</span>
              <button
                type="button"
                onClick={() => setIsRefModalOpen(true)}
                className="text-[#FFD1A6] font-bold hover:underline text-left md:text-right"
              >
                {lang === 'en'
                  ? 'Open Full InSight Reference Desk (12 Sources) ↗'
                  : 'Mở Hồ Sơ Tư Liệu Khoa Học InSight (12 Nguồn) ↗'}
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* COMPACT MOBILE-SAFE BOTTOM 10-PAGE PROGRESS BAR (01 / 10 to 10 / 10) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#1B0D09]/95 backdrop-blur-md border-t border-[#F4A261]/30 px-2.5 sm:px-6 h-14 flex items-center justify-between gap-2">
        <button
          type="button"
          data-testid="prev-page-btn"
          disabled={currentPage === 0}
          onClick={() => goToPage(currentPage - 1)}
          className="px-3 py-1.5 rounded-xl bg-[#2E1811] text-[#FFD1A6] border border-[#F4A261]/35 text-xs font-bold disabled:opacity-40 hover:bg-[#422319] transition-colors shrink-0"
        >
          {lang === 'en' ? '← Prev' : '← Trước'}
        </button>

        {/* 10 Progress Dots */}
        <nav
          aria-label="10-page progress dots"
          className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-1"
        >
          {CHAPTER_TITLES.map((ch, idx) => {
            const active = currentPage === idx;
            return (
              <button
                key={ch.num}
                type="button"
                aria-label={`Go to page ${ch.num}: ${ch.title[lang]}`}
                onClick={() => goToPage(idx)}
                className={`h-2.5 rounded-full transition-all shrink-0 ${
                  active
                    ? 'w-6 sm:w-8 bg-[#F4A261]'
                    : 'w-2.5 bg-[#F4A261]/35 hover:bg-[#F4A261]/70'
                }`}
              />
            );
          })}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <span
            data-testid="page-counter-label"
            className="text-xs font-extrabold text-[#FFD1A6] whitespace-nowrap"
          >
            {String(currentPage + 1).padStart(2, '0')} / 10
          </span>
          <button
            type="button"
            data-testid="next-page-btn"
            disabled={currentPage === 9}
            onClick={() => goToPage(currentPage + 1)}
            className="px-3 py-1.5 rounded-xl bg-[#F4A261] text-[#1D0F0A] text-xs font-bold disabled:opacity-40 hover:bg-[#FFD1A6] transition-colors shrink-0"
          >
            {lang === 'en' ? 'Next →' : 'Tiếp →'}
          </button>
        </div>
      </div>

      {/* Reference Desk & Judge Ledger Modal */}
      <ReferenceDeskModal
        isOpen={isRefModalOpen}
        onClose={() => setIsRefModalOpen(false)}
        lang={lang}
      />
    </div>
  );
}

export default App;
