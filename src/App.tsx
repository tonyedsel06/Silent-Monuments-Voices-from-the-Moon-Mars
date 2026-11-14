import React, { useEffect, useRef, useState } from 'react';
import {
  CHAPTER_TITLES,
  GIS_LANDMARKS,
  GisLandmark,
  HardwareHotspot,
  INSIGHT_HOTSPOTS,
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
import { NasaPhotoViewer } from './components/NasaPhotoViewer';
import { PlanetaryGisGlobe3D } from './components/PlanetaryGisGlobe3D';
import { InSightLander3D } from './components/InSightLander3D';
import { SeismicSonificationLab } from './components/SeismicSonificationLab';
import { MartianInteriorCutaway } from './components/MartianInteriorCutaway';
import { LunarLaserRangingLab } from './components/LunarLaserRangingLab';
import { ReferenceDeskModal } from './components/ReferenceDeskModal';

export default function App() {
  // Default language on load: 100% English ('en')
  const [lang, setLang] = useState<Language>('en');
  const [currentChapter, setCurrentChapter] = useState<number>(0); // 0 to 9 (Chapters 01 to 10)
  const [displayMode, setDisplayMode] = useState<'chapter' | 'all'>('chapter');
  const [isRefModalOpen, setIsRefModalOpen] = useState<boolean>(false);

  // Chapter 01 cursor-reactive Martian horizon canvas
  const heroCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const cursorRef = useRef({ x: 0.5, y: 0.5 });

  // Chapter 02 GIS state
  const [gisBody, setGisBody] = useState<'mars' | 'moon'>('mars');
  const [selectedLandmarkId, setSelectedLandmarkId] = useState<GisLandmark['id']>('insight');

  // Chapter 03 Lander vs Rover comparison state
  const [architectureTab, setArchitectureTab] = useState<'lander' | 'rover'>('lander');

  // Chapter 04 3D Lander Hotspot & Quick Discovery Challenge
  const [selectedHotspotId, setSelectedHotspotId] = useState<HardwareHotspot['id']>('seis');
  const [ch4Choice, setCh4Choice] = useState<'seis' | 'panel' | 'camera' | null>(null);

  // Chapter 07 Dust & Power Scrubber (0% to 90%) + Power Trade-Off Lab
  const [dustPercent, setDustPercent] = useState<number>(75);
  const [powerAlloc, setPowerAlloc] = useState({
    survivalHeatersWh: 200,
    seisSeismometerWh: 180,
    uhfTelemetryWh: 90,
    hp3MoleWh: 0,
  });

  // Chapter 09 Baseline Comparison Toggle
  const [baselineView, setBaselineView] = useState<'comparison' | 'raw' | 'solution'>('comparison');

  // Chapter 10 Quiz & Explorer Certificate Generator
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([null, null, null, null]);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [explorerName, setExplorerName] = useState<string>('');
  const [generatedCallsign, setGeneratedCallsign] = useState<string>('EXPLORER-NS01048');

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

  // Keyboard navigation (ArrowLeft / ArrowRight)
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

  // Chapter 01 Martian horizon & iron-oxide dust canvas
  useEffect(() => {
    const canvas = heroCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const particles = Array.from({ length: 42 }, (_, i) => ({
      x: ((i * 73) % 100) / 100,
      y: ((i * 41) % 100) / 100,
      r: 1.2 + (i % 3) * 0.9,
      vx: 0.0004 + (i % 4) * 0.00018,
      vy: -0.00015 + (i % 3) * 0.0001,
    }));

    let animId = 0;
    const renderHorizon = () => {
      const w = canvas.width;
      const h = canvas.height;
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, '#070B14');
      skyGrad.addColorStop(0.55, '#1B192E');
      skyGrad.addColorStop(0.85, '#592920');
      skyGrad.addColorStop(1, '#8C3F2B');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Sun glow shifted slightly by cursor
      const sunX = w * (0.74 + (cursorRef.current.x - 0.5) * 0.06);
      const sunY = h * (0.36 + (cursorRef.current.y - 0.5) * 0.06);
      const sunGrad = ctx.createRadialGradient(sunX, sunY, 4, sunX, sunY, 95);
      sunGrad.addColorStop(0, 'rgba(255, 209, 166, 0.85)');
      sunGrad.addColorStop(0.4, 'rgba(244, 162, 97, 0.28)');
      sunGrad.addColorStop(1, 'rgba(244, 162, 97, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 95, 0, Math.PI * 2);
      ctx.fill();

      // Elysium Planitia ridge silhouette
      ctx.fillStyle = '#381914';
      ctx.beginPath();
      ctx.moveTo(0, h * 0.74);
      ctx.quadraticCurveTo(w * 0.28, h * 0.67, w * 0.55, h * 0.73);
      ctx.quadraticCurveTo(w * 0.82, h * 0.77, w, h * 0.71);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();

      // InSight Lander & SEIS Silhouette on the horizon
      const lx = w * 0.34;
      const ly = h * 0.72;
      ctx.strokeStyle = '#FFD1A6';
      ctx.lineWidth = 2;
      // Legs
      ctx.beginPath();
      ctx.moveTo(lx - 18, ly);
      ctx.lineTo(lx - 28, ly + 18);
      ctx.moveTo(lx + 18, ly);
      ctx.lineTo(lx + 28, ly + 18);
      ctx.moveTo(lx, ly);
      ctx.lineTo(lx, ly + 19);
      ctx.stroke();
      // Deck & Solar Wings
      ctx.fillStyle = '#F4A261';
      ctx.fillRect(lx - 24, ly - 8, 48, 10);
      ctx.fillStyle = '#1E3A5F';
      ctx.strokeStyle = '#F4A261';
      ctx.beginPath();
      ctx.ellipse(lx - 54, ly - 4, 24, 9, 0, 0, Math.PI * 2);
      ctx.ellipse(lx + 54, ly - 4, 24, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Deployed SEIS WTS Dome
      ctx.fillStyle = '#FFD1A6';
      ctx.beginPath();
      ctx.arc(lx + 92, ly + 16, 11, Math.PI, 0);
      ctx.fill();

      // Floating iron-oxide dust particles reacting to cursor
      particles.forEach((p) => {
        p.x = (p.x + p.vx + (cursorRef.current.x - 0.5) * 0.0012 + 1) % 1;
        p.y = (p.y + p.vy + 1) % 1;
        ctx.fillStyle = 'rgba(255, 209, 166, 0.55)';
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(renderHorizon);
    };

    renderHorizon();
    return () => cancelAnimationFrame(animId);
  }, [currentChapter, displayMode]);

  const isChapterVisible = (idx: number) => displayMode === 'all' || currentChapter === idx;

  return (
    <div className="min-h-screen flex flex-col bg-[#070B14] text-[#F8F9FA]">
      {/* Sticky Top Navigation Bar (Strict 3-Zone Contract) */}
      <header className="sticky top-0 z-40 border-b border-slate-800/90 bg-[#070B14]/95">
        <div className="max-w-[1360px] mx-auto px-3 sm:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              goToChapter(0);
            }}
            className="text-xs sm:text-base font-bold tracking-tight text-white whitespace-nowrap shrink-0"
          >
            SILENT MONUMENTS · NS01048
          </a>

          {/* Zone 2: 5 Concise Single-Line Navigation Links */}
          <nav
            aria-label="Chapter group navigation"
            className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-300"
          >
            <button
              type="button"
              onClick={() => goToChapter(0)}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                currentChapter <= 1 ? 'text-[#F4A261] underline underline-offset-8' : ''
              }`}
            >
              {lang === 'en' ? '01–02. GIS & Diary' : '01–02. Nhật ký & GIS'}
            </button>
            <button
              type="button"
              onClick={() => goToChapter(3)}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                currentChapter === 2 || currentChapter === 3
                  ? 'text-[#F4A261] underline underline-offset-8'
                  : ''
              }`}
            >
              {lang === 'en' ? '03–04. 3D Lander' : '03–04. Giải phẫu 3D'}
            </button>
            <button
              type="button"
              onClick={() => goToChapter(4)}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                currentChapter === 4 || currentChapter === 5
                  ? 'text-[#F4A261] underline underline-offset-8'
                  : ''
              }`}
            >
              {lang === 'en' ? '05–06. Seismic Core' : '05–06. Địa chấn & Lõi'}
            </button>
            <button
              type="button"
              onClick={() => goToChapter(6)}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                currentChapter === 6 || currentChapter === 7
                  ? 'text-[#F4A261] underline underline-offset-8'
                  : ''
              }`}
            >
              {lang === 'en' ? '07–08. Dust & Moon Laser' : '07–08. Bụi đỏ & Laser'}
            </button>
            <button
              type="button"
              onClick={() => goToChapter(9)}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                currentChapter >= 8 ? 'text-[#F4A261] underline underline-offset-8' : ''
              }`}
            >
              {lang === 'en' ? '09–10. Impact & Ledger' : '09–10. Tác động & Hồ sơ'}
            </button>
          </nav>

          {/* Zone 3: Bilingual Segmented Switcher [ EN | VI ] + Reference Desk */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <div
              role="group"
              aria-label="Language switcher"
              className="flex items-center bg-[#121C2E] p-0.5 rounded-lg border border-slate-700"
            >
              <button
                type="button"
                onClick={() => setLang('en')}
                aria-pressed={lang === 'en'}
                className={`px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-mono font-bold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  lang === 'en'
                    ? 'bg-[#F4A261] text-[#070B14]'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang('vi')}
                aria-pressed={lang === 'vi'}
                className={`px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-mono font-bold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  lang === 'vi'
                    ? 'bg-[#F4A261] text-[#070B14]'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                VI
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsRefModalOpen(true)}
              className="px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-mono font-semibold rounded-lg bg-[#121C2E] text-[#FFD1A6] border border-slate-700 hover:border-[#F4A261] transition-colors whitespace-nowrap shrink-0"
            >
              {lang === 'en' ? 'Reference Desk' : 'Nguồn Tư liệu'}
            </button>
          </div>
        </div>
      </header>

      {/* Sub-header Chapter Jump Strip & Reading Mode Toggle */}
      <div className="border-b border-slate-800/70 bg-[#0A101E]">
        <div className="max-w-[1360px] mx-auto px-3 sm:px-8 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 font-mono text-slate-300 overflow-hidden py-0.5">
            <span className="text-[#F4A261] font-semibold shrink-0">
              {lang === 'en' ? 'TEAM NAU EXPLORERS (NS01048)' : 'ĐỘI NAU EXPLORERS (NS01048)'}
            </span>
            <span className="text-slate-600 hidden sm:inline">·</span>
            <span className="text-slate-400 truncate hidden sm:inline">
              {lang === 'en'
                ? 'Nghe An University · Space Apps Hanoi 2026'
                : 'Trường Đại học Nghệ An · Space Apps Hà Nội 2026'}
            </span>
          </div>

          <div className="flex items-center gap-2 max-w-full">
            <button
              type="button"
              onClick={() =>
                setDisplayMode((m) => (m === 'chapter' ? 'all' : 'chapter'))
              }
              className="px-2.5 py-1 text-[11px] font-mono rounded bg-[#121C2E] text-slate-300 hover:text-white border border-slate-800 truncate max-w-[350px] sm:max-w-none"
            >
              {displayMode === 'chapter'
                ? lang === 'en'
                  ? 'Mode: Focused Chapter (Switch to Full 10-Chapter Scroll)'
                  : 'Chế độ: Từng chương (Chuyển sang Cuộn toàn bộ 10 chương)'
                : lang === 'en'
                  ? 'Mode: Full 10-Chapter Scroll (Switch to Focused Chapter)'
                  : 'Chế độ: Cuộn 10 chương (Chuyển sang Xem từng chương)'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <main id="top" className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-8 py-8 space-y-16">
        {/* ================================================================
            CHAPTER 01: THE MESSAGE AFTER SILENCE
           ================================================================ */}
        {isChapterVisible(0) && (
          <section
            id="chapter-section-0"
            aria-labelledby="ch01-heading"
            className="space-y-8"
          >
            {/* Mandatory First-Person Pedagogical Disclosure Banner */}
            <div className="p-3.5 rounded-xl border border-[#F4A261]/40 bg-[#121C2E]/90 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div>
                <span className="font-mono font-semibold text-[#F4A261] mr-2">
                  {lang === 'en'
                    ? '[REPRESENTATIONAL INTEGRITY DISCLOSURE]'
                    : '[MINH BẠCH KHOA HỌC & PHƯƠNG PHÁP KỂ CHUYỆN]'}
                </span>
                <span className="text-slate-200">
                  {lang === 'en'
                    ? 'Creative first-person narration for learners aged 10–15. The spacecraft did not literally speak; every mission date, coordinate, and measurement is anchored in primary NASA/JPL and NSSDCA archives.'
                    : 'Lời kể ngôi thứ nhất mang tính sư phạm dành cho học sinh 10–15 tuổi. Tàu vũ trụ thực tế không biết nói; mọi ngày tháng, tọa độ và số liệu đo đạc đều bám sát hồ sơ gốc của NASA/JPL và NSSDCA.'}
                </span>
              </div>
              <span className="font-mono text-[#64DFDF] shrink-0">
                NSSDCA: 2018-042A · 2003-032A · 1969-059C
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* Left 7 cols: First-Person Opening & Editorial Context */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                <div>
                  <div className="text-xs font-mono text-[#F4A261] tracking-wider uppercase mb-2">
                    {lang === 'en'
                      ? 'CHAPTER 01 / 10 · ELYSIUM PLANITIA, MARS (4.502°N, 135.623°E)'
                      : 'CHƯƠNG 01 / 10 · ĐỒNG BẰNG ELYSIUM PLANITIA, SAO HỎA (4,502°B, 135,623°Đ)'}
                  </div>
                  <h1
                    id="ch01-heading"
                    className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white leading-[1.08] mb-5"
                  >
                    {lang === 'en' ? (
                      <>
                        My radio is quiet.{' '}
                        <span className="text-[#F4A261]">My seismic archive is still speaking.</span>
                      </>
                    ) : (
                      <>
                        Ăng-ten của tôi đã lặng tiếng.{' '}
                        <span className="text-[#F4A261]">Nhưng kho dữ liệu địa chấn vẫn lên tiếng.</span>
                      </>
                    )}
                  </h1>

                  <div className="space-y-4 text-base sm:text-lg text-slate-200 leading-relaxed max-w-2xl">
                    <p>
                      {lang === 'en'
                        ? 'I am InSight (NSSDCA ID: 2018-042A). My three shock-absorbing titanium feet still rest in the rust-red basaltic dust of Elysium Planitia, 1.63 meters behind the copper-colored Wind and Thermal Shield I lowered onto the ground in 2018.'
                        : 'Tôi là trạm đổ bộ địa vật lý InSight (Mã NSSDCA: 2018-042A). Ba chân trụ giảm chấn bằng titan của tôi vẫn đứng vững trên lớp bụi đá bazan đỏ thẫm của đồng bằng Elysium Planitia, cách chiếc lồng chắn gió màu đồng 1,63 mét mà cánh tay tôi đã đặt xuống nền đất năm 2018.'}
                    </p>
                    <p>
                      {lang === 'en'
                        ? 'On December 15, 2022, fine iron-oxide dust finally choked my twin decagonal solar arrays. My batteries dropped below operating voltage, and my X-band transmitter fell silent. Yet across the Moon and Mars, dozens of silent human artifacts remain exactly where their crews and flight engineers left them—not as forgotten scrap, but as permanent scientific monuments and active optical beacons.'
                        : 'Ngày 15 tháng 12 năm 2022, lớp bụi mịn oxit sắt cuối cùng đã phủ kín hai cánh pin mặt trời hình thập giác. Điện áp ắc-quy tụt xuống dưới ngưỡng vận hành và bộ phát sóng băng tần X của tôi ngừng đập. Thế nhưng khắp Mặt Trăng và Sao Hỏa, hàng chục thiết bị vẫn nằm lại đúng nơi con người đã đặt xuống—không phải phế liệu bị lãng quên, mà là những cột mốc khoa học vĩnh cửu.'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => goToChapter(1)}
                    className="px-5 py-3 text-sm font-mono font-bold rounded-xl bg-[#F4A261] text-[#070B14] hover:bg-[#FFD1A6] transition-colors"
                  >
                    {lang === 'en'
                      ? 'Explore Chapter 02: Planetary GIS Observatory →'
                      : 'Khám phá Chương 02: Đài Quan sát GIS Hành tinh →'}
                  </button>
                  <button
                    type="button"
                    onClick={() => goToChapter(3)}
                    className="px-4 py-3 text-sm font-mono font-semibold rounded-xl border border-slate-700 bg-[#121C2E] text-slate-200 hover:border-[#F4A261] transition-colors"
                  >
                    {lang === 'en' ? 'Inspect 3D InSight Lander' : 'Xem Mô hình 3D InSight'}
                  </button>
                </div>
              </div>

              {/* Right 5 cols: Interactive Martian Horizon Canvas + Telemetry & Official Team Card */}
              <div className="lg:col-span-5 flex flex-col rounded-xl border border-slate-800 bg-[#0B1220] overflow-hidden">
                <div
                  className="relative flex-1 min-h-[290px] bg-[#070B14]"
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    cursorRef.current = {
                      x: (e.clientX - rect.left) / rect.width,
                      y: (e.clientY - rect.top) / rect.height,
                    };
                  }}
                >
                  <canvas
                    ref={heroCanvasRef}
                    width={560}
                    height={320}
                    data-testid="martian-horizon-canvas"
                    className="w-full h-full block object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-[#070B14]/85 border border-slate-700 px-2.5 py-1 rounded text-[11px] font-mono text-[#FFD1A6]">
                    {lang === 'en'
                      ? 'INTERACTIVE MARTIAN HORIZON · MOVE CURSOR TO DRIFT DUST'
                      : 'ĐƯỜNG CHÂN TRỜI SAO HỎA · DI CHUỘT ĐỂ TƯƠNG TÁC HẠT BỤI'}
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 bg-[#070B14]/85 border border-slate-800 px-3 py-1.5 rounded flex items-center justify-between text-[11px] font-mono text-slate-300">
                    <span>4.502°N, 135.623°E</span>
                    <span className="text-[#F4A261]">-2,655 m MOLA</span>
                    <span className="text-[#64DFDF]">1,319 MARSQUAKES</span>
                  </div>
                </div>

                <div className="p-4 bg-[#0E1729] border-t border-slate-800 space-y-2 shrink-0">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#64DFDF] font-semibold">
                      {TEAM_METADATA.teamName} · ID: {TEAM_METADATA.teamId}
                    </span>
                    <span className="text-slate-400">
                      {lang === 'en' ? 'Space Apps Hanoi 2026' : 'Space Apps Hà Nội 2026'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {lang === 'en'
                      ? `Curated by ${TEAM_METADATA.members.join(', ')} at ${TEAM_METADATA.institution.en}.`
                      : `Thực hiện bởi ${TEAM_METADATA.members.join(', ')} — ${TEAM_METADATA.institution.vi}.`}
                  </p>
                </div>
              </div>
            </div>

            {/* Live Mission Elapsed Telemetry Strip (Calculated to Nov 14, 2026) */}
            <div className="rounded-xl border border-slate-800 bg-[#0B1220] p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <span className="text-xs font-mono text-[#F4A261] font-semibold">
                  {lang === 'en'
                    ? '[VERIFIED NASA/NSSDCA DATA · LIVE MISSION ELAPSED TELEMETRY AS OF 14 NOV 2026]'
                    : '[DỮ LIỆU ĐÃ XÁC MINH NASA/NSSDCA · ĐỒNG HỒ SỨ MỆNH TÍNH ĐẾN 14/11/2026]'}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {lang === 'en'
                    ? 'EPOCH: 2026-11-14T00:00:00Z (HANOI HACKATHON BENCHMARK)'
                    : 'MỐC THỜI GIAN: 14/11/2026 (MỐC THI SPACE APPS HÀ NỘI)'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Card 1: Apollo 11 LRRR */}
                <div className="p-4 rounded-lg border border-slate-800 bg-[#0E1729]">
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="text-[#64DFDF] font-semibold">
                      NSSDCA: {missionClocks.apollo11.nssdcaId}
                    </span>
                    <span className="text-[#64DFDF]">
                      {lang === 'en' ? '● STILL ACTIVE' : '● ĐANG HOẠT ĐỘNG'}
                    </span>
                  </div>
                  <div className="text-base font-semibold text-white mb-2">
                    {lang === 'en'
                      ? 'Apollo 11 Lunar Laser Retroreflector'
                      : 'Gương Phản xạ Laser Mặt Trăng Apollo 11'}
                  </div>
                  <div className="text-3xl font-mono font-bold text-white tabular-nums">
                    {missionClocks.apollo11.yearsOnSurface}
                    <span className="text-xs font-mono text-slate-400 ml-1.5">
                      {lang === 'en'
                        ? `YEARS (${missionClocks.apollo11.daysOnSurface.toLocaleString()} DAYS)`
                        : `NĂM (${missionClocks.apollo11.daysOnSurface.toLocaleString()} NGÀY)`}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    {lang === 'en'
                      ? 'Deployed 20 July 1969 at Mare Tranquillitatis (0.674°N, 23.473°E). Zero electrical power needed.'
                      : 'Đặt ngày 20/07/1969 tại Biển Tĩnh Lặng (0,674°B, 23,473°Đ). Hoạt động với 0 Watt điện.'}
                  </p>
                </div>

                {/* Card 2: Opportunity Rover */}
                <div className="p-4 rounded-lg border border-slate-800 bg-[#0E1729]">
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="text-[#F4A261] font-semibold">
                      NSSDCA: {missionClocks.opportunity.nssdcaId}
                    </span>
                    <span className="text-[#FFD1A6]">
                      {lang === 'en' ? '▲ SILENT MONUMENT' : '▲ ĐÀI TƯỞNG NIỆM TĨNH LẶNG'}
                    </span>
                  </div>
                  <div className="text-base font-semibold text-white mb-2">
                    {lang === 'en'
                      ? 'Opportunity Rover (MER-B)'
                      : 'Xe Tự hành Opportunity (MER-B)'}
                  </div>
                  <div className="text-3xl font-mono font-bold text-white tabular-nums">
                    {missionClocks.opportunity.yearsOnSurface}
                    <span className="text-xs font-mono text-slate-400 ml-1.5">
                      {lang === 'en'
                        ? 'YEARS ACTIVE · 45.16 KM DRIVEN'
                        : 'NĂM HOẠT ĐỘNG · LĂN BÁNH 45,16 KM'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    {lang === 'en'
                      ? 'Operated 5,111 Martian sols (planned for 90 sols) until the June 10, 2018 planet-encircling dust storm.'
                      : 'Hoạt động 5.111 sol (thiết kế 90 sol) cho tới cơn bão bụi toàn cầu ngày 10/06/2018.'}
                  </p>
                </div>

                {/* Card 3: InSight Lander */}
                <div className="p-4 rounded-lg border border-slate-800 bg-[#0E1729]">
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="text-[#F4A261] font-semibold">
                      NSSDCA: {missionClocks.insight.nssdcaId}
                    </span>
                    <span className="text-[#FFD1A6]">
                      {lang === 'en'
                        ? '▲ SILENT MONUMENT · ACTIVE ARCHIVE'
                        : '▲ TĨNH LẶNG · KHO DỮ LIỆU SỐNG'}
                    </span>
                  </div>
                  <div className="text-base font-semibold text-white mb-2">
                    {lang === 'en'
                      ? 'InSight Mars Geophysical Lander'
                      : 'Trạm Đổ bộ Địa vật lý InSight'}
                  </div>
                  <div className="text-3xl font-mono font-bold text-white tabular-nums">
                    {missionClocks.insight.daysOnSurface.toLocaleString()}
                    <span className="text-xs font-mono text-slate-400 ml-1.5">
                      {lang === 'en'
                        ? `DAYS ON MARS (${missionClocks.insight.daysSinceLastSignal?.toLocaleString()} SILENT)`
                        : `NGÀY TRÊN SAO HỎA (${missionClocks.insight.daysSinceLastSignal?.toLocaleString()} NGÀY TĨNH LẶNG)`}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    {lang === 'en'
                      ? 'Landed 26 Nov 2018; final signal 15 Dec 2022. Recorded 1,319 marsquakes that mapped Mars’ interior.'
                      : 'Hạ cánh 26/11/2018; tín hiệu cuối 15/12/2022. Ghi nhận 1.319 động đất Sao Hỏa.'}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ================================================================
            CHAPTER 02: PLANETARY GIS OBSERVATORY
           ================================================================ */}
        {isChapterVisible(1) && (
          <section
            id="chapter-section-1"
            aria-labelledby="ch02-heading"
            className="space-y-8 pt-4 border-t border-slate-800/60"
          >
            <div className="max-w-3xl">
              <div className="text-xs font-mono text-[#F4A261] uppercase tracking-wider mb-2">
                {lang === 'en'
                  ? 'CHAPTER 02 / 10 · OFF-WORLD ARTIFACT COORDINATE REGISTRY'
                  : 'CHƯƠNG 02 / 10 · HỆ THỐNG TỌA ĐỘ ĐỊA LÝ (GIS) CÁC DI SẢN KHÔNG GIAN'}
              </div>
              <h2
                id="ch02-heading"
                className="text-3xl sm:text-4xl font-semibold text-white mb-3"
              >
                {lang === 'en'
                  ? 'Planetary GIS Observatory: Where Do Our Explorers Rest?'
                  : 'Đài Quan sát GIS Hành tinh: Những Nhà Thám hiểm Đang Yên nghỉ Ở Đâu?'}
              </h2>
              <p className="text-base text-slate-300 leading-relaxed">
                {lang === 'en'
                  ? 'Returning hardware from the Moon or Mars requires rocket fuel weighing ten times more than the science instruments themselves. Instead, NASA designs spacecraft to spend their entire lives on-site, beaming gigabytes of telemetry home across deep space. Switch between Mars MOLA and Moon LRO globes below to inspect three iconic sites.'
                  : 'Việc mang một thiết bị từ Mặt Trăng hay Sao Hỏa quay về Trái Đất đòi hỏi khối lượng nhiên liệu tên lửa nặng gấp hàng chục lần chính thiết bị đó. Vì vậy, NASA thiết kế các trạm thăm dò làm việc trọn đời tại chỗ và truyền dữ liệu về qua sóng vô tuyến. Hãy chuyển đổi giữa quả cầu GIS Sao Hỏa (MOLA) và Mặt Trăng (LRO) bên dưới để tra cứu 3 địa điểm lịch sử.'}
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

              {/* Selected Landmark Telemetry Dossier */}
              <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-[#0B1220] p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <span className="text-xs font-mono text-[#F4A261] font-semibold">
                    NSSDCA ID: {selectedLandmark.nssdcaId}
                  </span>
                  <span
                    className={`text-xs font-mono font-semibold ${
                      selectedLandmark.statusTone === 'emerald'
                        ? 'text-[#64DFDF]'
                        : 'text-[#FFD1A6]'
                    }`}
                  >
                    ● {selectedLandmark.statusBadge[lang]}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white">
                    {selectedLandmark.name[lang]}
                  </h3>
                  <div className="text-xs font-mono text-slate-400 mt-1">
                    {selectedLandmark.siteName[lang]} · {selectedLandmark.coordsLabel} ·{' '}
                    {selectedLandmark.elevationLabel}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#0E1729] border border-slate-800 text-xs font-mono text-[#FFD1A6]">
                  {selectedLandmark.missionDates[lang]}
                </div>

                <div className="space-y-2 text-sm text-slate-200 leading-relaxed">
                  <p>{selectedLandmark.summary[lang]}</p>
                  <p className="text-xs text-slate-400">
                    <strong className="text-slate-200">
                      {lang === 'en' ? 'Landing Site Geology: ' : 'Địa chất khu vực đổ bộ: '}
                    </strong>
                    {selectedLandmark.geology[lang]}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-[#070B14] border border-slate-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">
                    {lang === 'en' ? 'Primary Benchmark:' : 'Cột mốc tiêu biểu:'}
                  </span>
                  <span className="text-[#64DFDF] font-semibold">
                    {selectedLandmark.keyMetric[lang]}
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ================================================================
            CHAPTER 03: TOUCHDOWN AT ELYSIUM PLANITIA
           ================================================================ */}
        {isChapterVisible(2) && (
          <section
            id="chapter-section-2"
            aria-labelledby="ch03-heading"
            className="space-y-8 pt-4 border-t border-slate-800/60"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-6 space-y-5">
                <div className="text-xs font-mono text-[#F4A261] uppercase tracking-wider">
                  {lang === 'en'
                    ? 'CHAPTER 03 / 10 · MAY 5 TO NOVEMBER 26, 2018 (485 MILLION KM)'
                    : 'CHƯƠNG 03 / 10 · TỪ 05/05 ĐẾN 26/11/2018 (HÀNH TRÌNH 485 TRIỆU KM)'}
                </div>
                <h2
                  id="ch03-heading"
                  className="text-3xl sm:text-4xl font-semibold text-white"
                >
                  {lang === 'en'
                    ? 'Touchdown at Elysium Planitia: Why "The Flattest Parking Lot on Mars"?'
                    : 'Chạm xuống Elysium Planitia: Vì sao chọn "Bãi đỗ xe phẳng nhất Sao Hỏa"?'}
                </h2>
                <p className="text-base text-slate-200 leading-relaxed">
                  {lang === 'en'
                    ? 'Launched on May 5, 2018 from Vandenberg Air Force Base aboard an Atlas V-401 rocket, InSight cruised 484,773,006 kilometers before slamming into the Martian atmosphere at 19,800 km/h on November 26, 2018. Unlike curiosity-driven rovers that seek steep canyon walls, InSight needed a quiet, flat equatorial plain where its solar arrays could soak up sunlight and its robotic arm could place a seismometer on level soil free of boulders.'
                    : 'Phóng lên từ căn cứ Vandenberg ngày 05/05/2018 trên tên lửa đẩy Atlas V-401, InSight vượt qua quãng đường 484.773.006 km trước khi lao vào bầu khí quyển Sao Hỏa với vận tốc 19.800 km/h ngày 26/11/2018. Khác với các xe tự hành thích tìm đến những hẻm núi hiểm trở, InSight cần một đồng bằng xích đạo phẳng lặng để đón nắng mặt trời và đặt máy đo địa chấn lên nền đất không vướng đá tảng.'}
                </p>

                {/* Interactive "Lander vs. Rover" Engineering Comparison Card */}
                <div className="rounded-xl border border-slate-800 bg-[#0B1220] p-5">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-mono text-[#F4A261] font-semibold">
                      ENGINEERING ARCHITECTURE COMPARISON
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      [VERIFIED NASA/NSSDCA DATA]
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <button
                      type="button"
                      onClick={() => setArchitectureTab('lander')}
                      className={`py-2 px-3 rounded-lg text-xs font-mono font-semibold border transition-colors ${
                        architectureTab === 'lander'
                          ? 'bg-[#F4A261] text-[#070B14] border-[#F4A261]'
                          : 'bg-[#0E1729] text-slate-300 border-slate-800'
                      }`}
                    >
                      {lang === 'en'
                        ? 'Stationary Lander (InSight)'
                        : 'Trạm Đổ bộ Cố định (InSight)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setArchitectureTab('rover')}
                      className={`py-2 px-3 rounded-lg text-xs font-mono font-semibold border transition-colors ${
                        architectureTab === 'rover'
                          ? 'bg-[#64DFDF] text-[#070B14] border-[#64DFDF]'
                          : 'bg-[#0E1729] text-slate-300 border-slate-800'
                      }`}
                    >
                      {lang === 'en'
                        ? 'Mobile Surface Rover (Opportunity)'
                        : 'Xe Tự hành Di động (Opportunity)'}
                    </button>
                  </div>

                  {architectureTab === 'lander' ? (
                    <div className="space-y-2 text-sm text-slate-200">
                      <div className="font-semibold text-[#FFD1A6]">
                        {lang === 'en'
                          ? 'Why InSight Has Zero Wheels:'
                          : 'Vì sao InSight hoàn toàn không có bánh xe:'}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {lang === 'en'
                          ? 'A medical doctor cannot listen to your heartbeat while you are sprinting. Similarly, a planetary seismometer measuring vibrations smaller than a hydrogen atom (10⁻¹⁰ m/s²) requires absolute mechanical stillness and direct contact with the ground—not a rolling chassis with electric wheel motors.'
                          : 'Bác sĩ không thể dùng ống nghe nhịp tim khi bệnh nhân đang chạy nước rút. Tương tự, một máy đo địa chấn đo dao động nhỏ hơn nguyên tử hydro (10⁻¹⁰ m/s²) đòi hỏi sự tĩnh lặng cơ học tuyệt đối và tiếp xúc trực tiếp với mặt đất—chứ không thể đặt trên khung gầm có động cơ bánh xe gây rung.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 text-sm text-slate-200">
                      <div className="font-semibold text-[#64DFDF]">
                        {lang === 'en'
                          ? 'Why Opportunity Needed 6 Rocker-Bogie Wheels:'
                          : 'Vì sao Opportunity cần hệ thống 6 bánh xe Rocker-Bogie:'}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {lang === 'en'
                          ? 'Field geologists must walk from outcrop to crater rim to inspect rock layers. Opportunity drove 45.16 km across Meridiani Planum over 5,111 sols, grinding rock surfaces and discovering hematite "blueberries" that proved ancient liquid water once soaked Mars.'
                          : 'Nhà địa chất học thực địa phải đi qua từng vỉa đá và miệng hố va chạm. Opportunity đã lăn bánh 45,16 km suốt 5.111 sol, mài bề mặt đá và phát hiện các viên kết hạch hematit ("việt quất") chứng minh nước lỏng từng tồn tại trên Sao Hỏa.'}
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
          </section>
        )}

        {/* ================================================================
            CHAPTER 04: MEET INSIGHT & THE PLANET'S STETHOSCOPE
           ================================================================ */}
        {isChapterVisible(3) && (
          <section
            id="chapter-section-3"
            aria-labelledby="ch04-heading"
            className="space-y-8 pt-4 border-t border-slate-800/60"
          >
            <div className="max-w-3xl">
              <div className="text-xs font-mono text-[#F4A261] uppercase tracking-wider mb-2">
                {lang === 'en'
                  ? 'CHAPTER 04 / 10 · INSTRUMENT DEPLOYMENT & 3D HARDWARE ANATOMY'
                  : 'CHƯƠNG 04 / 10 · GIẢI PHẪU PHẦN CỨNG 3D & TRIỂN KHAI ỐNG NGHE SEIS'}
              </div>
              <h2
                id="ch04-heading"
                className="text-3xl sm:text-4xl font-semibold text-white mb-3"
              >
                {lang === 'en'
                  ? 'Meet InSight & The Planet’s Stethoscope (SEIS)'
                  : 'Giải phẫu 3D InSight & Chiếc Ống nghe Hành tinh (SEIS)'}
              </h2>
              <p className="text-base text-slate-300 leading-relaxed">
                {lang === 'en'
                  ? 'On December 19, 2018 (Sol 22), InSight’s 1.8-meter Instrument Deployment Arm reached out and set the French-built SEIS seismometer directly onto the Martian regolith—the first time in history a seismometer was placed directly on the ground of another planet. Forty-five sols later, the arm lowered the white-and-gold Wind and Thermal Shield over SEIS.'
                  : 'Ngày 19/12/2018 (Sol 22), cánh tay robot dài 1,8 mét của InSight đã vươn ra và đặt máy đo địa chấn SEIS trực tiếp xuống nền đất Sao Hỏa—lần đầu tiên trong lịch sử nhân loại một ống nghe địa chấn được đặt trực tiếp lên mặt đất của hành tinh khác. Bốn mươi lăm ngày sau, cánh tay tiếp tục hạ chiếc Lồng chắn gió và nhiệt WTS chụp lên trên SEIS.'}
              </p>
            </div>

            <InSightLander3D
              lang={lang}
              selectedHotspotId={selectedHotspotId}
              onSelectHotspot={setSelectedHotspotId}
              dustFactor={dustPercent / 100}
            />

            {/* Quick Discovery Challenge Card */}
            <div className="rounded-xl border border-slate-800 bg-[#0B1220] p-5">
              <div className="text-xs font-mono text-[#F4A261] font-semibold mb-1">
                {lang === 'en'
                  ? 'QUICK DISCOVERY CHALLENGE · CHECK YOUR INSTRUMENT KNOWLEDGE'
                  : 'THỬ THÁCH KHÁM PHÁ NHANH · KIỂM TRA HIỂU BIẾT VỀ THIẾT BỊ'}
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">
                {lang === 'en'
                  ? 'Which instrument on InSight detects ground motion smaller than the radius of a hydrogen atom?'
                  : 'Thiết bị nào của InSight phát hiện được rung động mặt đất nhỏ hơn cả bán kính một nguyên tử hydro?'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <button
                  type="button"
                  onClick={() => {
                    setCh4Choice('seis');
                    setSelectedHotspotId('seis');
                  }}
                  className={`p-3.5 rounded-lg border text-left transition-colors ${
                    ch4Choice === 'seis'
                      ? 'bg-[#16233B] border-[#64DFDF] text-white'
                      : 'bg-[#0E1729] border-slate-800 text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <strong className="block text-sm font-mono text-[#64DFDF]">
                    A. SEIS Seismometer
                  </strong>
                  <span className="text-xs text-slate-400">
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
                  className={`p-3.5 rounded-lg border text-left transition-colors ${
                    ch4Choice === 'panel'
                      ? 'bg-[#16233B] border-[#F4A261] text-white'
                      : 'bg-[#0E1729] border-slate-800 text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <strong className="block text-sm font-mono text-[#F4A261]">
                    B. Twin Decagonal Solar Arrays
                  </strong>
                  <span className="text-xs text-slate-400">
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
                  className={`p-3.5 rounded-lg border text-left transition-colors ${
                    ch4Choice === 'camera'
                      ? 'bg-[#16233B] border-[#F4A261] text-white'
                      : 'bg-[#0E1729] border-slate-800 text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <strong className="block text-sm font-mono text-[#F4A261]">
                    C. IDC Elbow Camera
                  </strong>
                  <span className="text-xs text-slate-400">
                    {lang === 'en'
                      ? 'Captures panoramic workspace photographs'
                      : 'Chụp ảnh toàn cảnh khu vực làm việc'}
                  </span>
                </button>
              </div>

              {ch4Choice && (
                <div
                  className={`p-3.5 rounded-lg border text-xs leading-relaxed font-mono ${
                    ch4Choice === 'seis'
                      ? 'bg-[#0D282A] border-[#64DFDF] text-[#64DFDF]'
                      : 'bg-[#231915] border-[#F4A261] text-[#FFD1A6]'
                  }`}
                >
                  {ch4Choice === 'seis'
                    ? lang === 'en'
                      ? '● CORRECT: SEIS (Seismic Experiment for Interior Structure) uses three pendulum sensors inside a titanium vacuum sphere to resolve ground displacements smaller than 0.05 nanometers—the size of a hydrogen atom.'
                      : '● CHÍNH XÁC: Máy đo địa chấn SEIS sử dụng 3 con lắc đặt trong quả cầu chân không bằng titan, phát hiện được độ dịch chuyển mặt đất nhỏ hơn 0,05 nanômét—tương đương kích thước nguyên tử hydro.'
                    : lang === 'en'
                      ? '▲ NOT QUITE: Solar arrays generate electricity and the IDC camera photographs the deck. Select A (SEIS Seismometer) to inspect the planet’s stethoscope.'
                      : '▲ CHƯA CHÍNH XÁC: Tấm pin mặt trời dùng để tạo ra điện và camera IDC dùng để chụp ảnh. Hãy chọn đáp án A (Máy đo địa chấn SEIS).'}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ================================================================
            CHAPTER 05: 1,319 HEARTBEATS OF MARS
           ================================================================ */}
        {isChapterVisible(4) && (
          <section
            id="chapter-section-4"
            aria-labelledby="ch05-heading"
            className="space-y-8 pt-4 border-t border-slate-800/60"
          >
            <div className="max-w-3xl">
              <div className="text-xs font-mono text-[#F4A261] uppercase tracking-wider mb-2">
                {lang === 'en'
                  ? 'CHAPTER 05 / 10 · SOL 128 FIRST MARSQUAKE (6 APRIL 2019) TO 1,319 EVENTS'
                  : 'CHƯƠNG 05 / 10 · TỪ TRẬN ĐỘNG ĐẤT SOL 128 (06/04/2019) ĐẾN 1.319 SỰ KIỆN'}
              </div>
              <h2
                id="ch05-heading"
                className="text-3xl sm:text-4xl font-semibold text-white mb-3"
              >
                {lang === 'en'
                  ? '1,319 Heartbeats of Mars: Listening to a Living World'
                  : '1.319 Nhịp tim của Sao Hỏa: Lắng nghe một Hành tinh Đang Sống'}
              </h2>
              <p className="text-base text-slate-300 leading-relaxed">
                {lang === 'en'
                  ? 'For four months after deployment, the Martian winds dominated the recordings. Then on April 6, 2019 (Sol 128), as the evening wind died down, SEIS recorded a faint, unmistakable subterranean rumble—humanity’s first confirmed marsquake. By the time InSight retired, its catalog held 1,319 marsquakes and meteorite impacts.'
                  : 'Suốt bốn tháng đầu sau khi đặt máy, tiếng gió Sao Hỏa chiếm lĩnh bản ghi. Rồi vào buổi chiều tĩnh gió ngày 06/04/2019 (Sol 128), SEIS đã bắt được một tiếng rền trầm đục từ lòng đất—trận động đất Sao Hỏa đầu tiên được nhân loại xác nhận. Tính đến khi kết thúc sứ mệnh, danh mục của InSight đã ghi nhận tổng cộng 1.319 trận động đất và va chạm thiên thạch.'}
              </p>
            </div>

            <SeismicSonificationLab lang={lang} />
          </section>
        )}

        {/* ================================================================
            CHAPTER 06: DEEP INSIDE THE RED PLANET & THE HP3 LESSON
           ================================================================ */}
        {isChapterVisible(5) && (
          <section
            id="chapter-section-5"
            aria-labelledby="ch06-heading"
            className="space-y-8 pt-4 border-t border-slate-800/60"
          >
            <div className="max-w-3xl">
              <div className="text-xs font-mono text-[#F4A261] uppercase tracking-wider mb-2">
                {lang === 'en'
                  ? 'CHAPTER 06 / 10 · PLANETARY TOMOGRAPHY & THE HP³ MOLE LESSON'
                  : 'CHƯƠNG 06 / 10 · CẮT LỚP ĐỊA CHẤN HỌC & BÀI HỌC TỪ MŨI KHOAN HP³'}
              </div>
              <h2
                id="ch06-heading"
                className="text-3xl sm:text-4xl font-semibold text-white mb-3"
              >
                {lang === 'en'
                  ? 'Deep Inside the Red Planet & When Engineering Hits a Wall'
                  : 'Nhìn Xuyên Lòng Đất Đỏ & Bài học Kỹ thuật từ Mũi khoan HP³'}
              </h2>
              <p className="text-base text-slate-300 leading-relaxed">
                {lang === 'en'
                  ? 'Just as an ultrasound maps inside the human body, primary compressional waves (P-waves) and secondary shear waves (S-waves) bend and reflect at boundaries between rock and liquid metal. Explore Mars’ three interior layers below, alongside an honest look at why the HP³ heat probe stopped at 40 cm.'
                  : 'Giống như sóng siêu âm giúp bác sĩ nhìn vào cơ thể, sóng dọc (sóng P) và sóng ngang (sóng S) sẽ khúc xạ và phản xạ khi gặp ranh giới giữa đá rắn và kim loại lỏng. Hãy khám phá 3 tầng cấu trúc bên trong Sao Hỏa cùng câu chuyện trung thực về lý do mũi khoan nhiệt HP³ dừng lại ở độ sâu 40 cm.'}
              </p>
            </div>

            <MartianInteriorCutaway lang={lang} />
          </section>
        )}

        {/* ================================================================
            CHAPTER 07: WHEN THE RED DUST FALLS (INSIGHT & OPPORTUNITY)
           ================================================================ */}
        {isChapterVisible(6) && (
          <section
            id="chapter-section-6"
            aria-labelledby="ch07-heading"
            className="space-y-8 pt-4 border-t border-slate-800/60"
          >
            <div className="max-w-3xl">
              <div className="text-xs font-mono text-[#F4A261] uppercase tracking-wider mb-2">
                {lang === 'en'
                  ? 'CHAPTER 07 / 10 · SOLAR POWER DECLINE (5,000 Wh → 500 Wh) & RESOURCE TRADE-OFF'
                  : 'CHƯƠNG 07 / 10 · SUY GIẢM ĐIỆN MẶT TRỜI (5.000 Wh → 500 Wh) & BÀI TOÁN PHÂN BỔ'}
              </div>
              <h2
                id="ch07-heading"
                className="text-3xl sm:text-4xl font-semibold text-white mb-3"
              >
                {lang === 'en'
                  ? 'When the Red Dust Falls: InSight & Opportunity’s Shared Fate'
                  : 'Khi Bụi Đỏ Che Khuất Mặt Trời: Số phận chung của InSight & Opportunity'}
              </h2>
              <p className="text-base text-slate-300 leading-relaxed">
                {lang === 'en'
                  ? 'Drag the Dust & Power Scrubber below from November 2018 (0% dust) to Spring 2022 (90% dust). Watch how fine iron-oxide grains coat the solar wings and force flight engineers into tough daily energy trade-offs.'
                  : 'Kéo thanh trượt Bụi & Năng lượng bên dưới từ tháng 11/2018 (0% bụi) đến mùa xuân năm 2022 (90% bụi). Quan sát lớp bụi oxit sắt phủ dần lên tấm pin mặt trời và đặt mình vào vị trí kỹ sư điều hành phải cân đối từng Watt-giờ điện cuối cùng.'}
              </p>
            </div>

            {/* Interactive Dust & Power Scrubber (2018 -> 2022) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-[#0B1220] p-5 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-mono text-[#F4A261] font-semibold">
                    [VERIFIED NASA/NSSDCA DATA · SOLAR ARRAY TELEMETRY]
                  </span>
                  <span className="text-xs font-mono text-slate-300">
                    {lang === 'en' ? solarMetrics.dateLabelEn : solarMetrics.dateLabelVi}
                  </span>
                </div>

                <div>
                  <label
                    htmlFor="dust-scrubber-input"
                    className="flex items-center justify-between text-sm font-semibold text-white mb-2"
                  >
                    <span>
                      {lang === 'en'
                        ? `Solar Array Dust Coating: ${solarMetrics.dustClamped}%`
                        : `Độ che phủ bụi trên cánh pin: ${solarMetrics.dustClamped}%`}
                    </span>
                    <span className="font-mono text-[#FFD1A6]">
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
                    className="w-full accent-[#F4A261] cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-1">
                    <span>0% Dust · Nov 2018 (~5,000 Wh/sol)</span>
                    <span>45% Dust · 2020 (~2,750 Wh/sol)</span>
                    <span>90% Dust · 2022 (~500 Wh/sol)</span>
                  </div>
                </div>

                {/* Live NASA Selfie Comparison with Dust Overlay */}
                <NasaPhotoViewer
                  photoId={dustPercent >= 65 ? 'PIA25287' : 'PIA22876'}
                  lang={lang}
                  dustOverlayOpacity={dustPercent < 65 ? dustPercent / 90 : 0}
                  compact
                />
              </div>

              {/* Right 5 cols: Classroom Mission Planner Power Allocation Lab */}
              <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-[#0B1220] p-5 space-y-4">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#64DFDF] font-semibold">
                    [EDUCATIONAL SIMULATION · RESOURCE LAB]
                  </span>
                  <span className="text-slate-400">
                    {lang === 'en' ? 'Classroom Exercise' : 'Bài tập phân bổ nguồn lực'}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-white">
                  {lang === 'en'
                    ? 'Mission Planner Power Budget Simulator'
                    : 'Mô phỏng Phân bổ Ngân sách Điện năng'}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {lang === 'en'
                    ? `Your solar arrays currently generate ${solarMetrics.wattHoursPerSol} Wh per sol. Allocate energy across subsystems without exceeding your daily budget.`
                    : `Cánh pin hiện tạo ra ${solarMetrics.wattHoursPerSol} Wh mỗi ngày Sao Hỏa. Hãy phân bổ điện cho các hệ thống sao cho không vượt quá ngân sách.`}{' '}
                </p>

                {/* Subsystem Allocation Controls */}
                <div className="space-y-3 text-xs">
                  <div>
                    <label
                      htmlFor="alloc-heaters"
                      className="flex justify-between font-mono text-slate-200 mb-1"
                    >
                      <span>
                        {lang === 'en'
                          ? '1. Survival Deck Heaters (-80°C night)'
                          : '1. Bộ sưởi ấm mạch điện (-80°C ban đêm)'}
                      </span>
                      <span className="text-[#FFD1A6]">{powerAlloc.survivalHeatersWh} Wh</span>
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
                      className="flex justify-between font-mono text-slate-200 mb-1"
                    >
                      <span>
                        {lang === 'en'
                          ? '2. SEIS Seismometer (Core Science)'
                          : '2. Máy đo địa chấn SEIS (Khoa học chính)'}
                      </span>
                      <span className="text-[#64DFDF]">{powerAlloc.seisSeismometerWh} Wh</span>
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
                      className="flex justify-between font-mono text-slate-200 mb-1"
                    >
                      <span>
                        {lang === 'en'
                          ? '3. UHF Orbiter Telemetry Radio'
                          : '3. Bộ phát sóng tiếp vận UHF'}
                      </span>
                      <span className="text-[#FFD1A6]">{powerAlloc.uhfTelemetryWh} Wh</span>
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

                {/* Quick 500 Wh Preset Button */}
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
                  className="w-full py-2 px-3 text-xs font-mono font-semibold rounded-lg border border-slate-700 bg-[#0E1729] text-slate-200 hover:border-[#F4A261]"
                >
                  {lang === 'en'
                    ? 'Load Spring 2022 Critical 500 Wh/sol Preset'
                    : 'Nạp kịch bản Mùa xuân 2022 (Chỉ còn 500 Wh/sol)'}
                </button>

                {/* Evaluation Result Box */}
                <div className="p-3.5 rounded-lg border border-slate-800 bg-[#070B14] font-mono text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">
                      {lang === 'en' ? 'Allocated / Available:' : 'Đã phân bổ / Khả dụng:'}
                    </span>
                    <span className="text-white font-bold">
                      {powerEvaluation.allocatedWh} / {powerEvaluation.availableWh} Wh
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">
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
                        ? '● OPTIMAL SCIENCE & SURVIVAL'
                        : powerEvaluation.status === 'OVER_BUDGET'
                          ? '✖ BATTERY DEPLETION (OVER BUDGET)'
                          : powerEvaluation.status === 'FREEZE_FAILURE'
                            ? '▲ THERMAL FREEZE RISK (<150 Wh Heaters)'
                            : '▲ SURVIVAL ONLY (LOW SCIENCE)'}
                    </span>
                  </div>
                </div>

                {/* Parallel Companion Card: Opportunity Rover */}
                <div className="p-3.5 rounded-lg border border-slate-800 bg-[#0E1729] text-xs space-y-1">
                  <div className="font-mono text-[#F4A261] font-semibold">
                    PARALLEL COMPANION · OPPORTUNITY ROVER (2003-032A)
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    {lang === 'en'
                      ? 'Why did Opportunity survive 5,111 sols while InSight lasted 1,440 sols? Meridiani Planum experienced frequent Martian wind gusts ("cleaning events") that swept dust off Opportunity’s solar panels—until the historic June 2018 planetary storm blocked out the Sun globally.'
                      : 'Vì sao Opportunity sống sót tới 5.111 sol trong khi InSight hoạt động 1.440 sol? Tại vùng Meridiani Planum thường xuyên có những cơn lốc bụi giúp thổi sạch mặt pin của Opportunity—cho đến khi cơn bão bụi toàn cầu tháng 6/2018 che khuất hoàn toàn Mặt Trời.'}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ================================================================
            CHAPTER 08: THE MIRROR THAT NEVER SLEEPS (APOLLO 11 LRRR)
           ================================================================ */}
        {isChapterVisible(7) && (
          <section
            id="chapter-section-7"
            aria-labelledby="ch08-heading"
            className="space-y-8 pt-4 border-t border-slate-800/60"
          >
            <div className="max-w-3xl">
              <div className="text-xs font-mono text-[#64DFDF] uppercase tracking-wider mb-2">
                {lang === 'en'
                  ? 'CHAPTER 08 / 10 · APOLLO 11 LUNAR LASER RANGING RETROREFLECTOR (1969-059C)'
                  : 'CHƯƠNG 08 / 10 · GƯƠNG PHẢN XẠ LASER MẶT TRĂNG APOLLO 11 (1969-059C)'}
              </div>
              <h2
                id="ch08-heading"
                className="text-3xl sm:text-4xl font-semibold text-white mb-3"
              >
                {lang === 'en'
                  ? 'The Mirror That Never Sleeps: Why 1969 Lunar Hardware Still Works Tonight'
                  : 'Tấm Gương Không Bao Giờ Ngủ: Vì sao Thiết bị Năm 1969 Vẫn Hoạt động Đêm Nay?'}
              </h2>
              <p className="text-base text-slate-300 leading-relaxed">
                {lang === 'en'
                  ? 'InSight fell silent on December 15, 2022 (officially retired December 21, 2022) because active electronics require electrical power. Yet on July 20, 1969, Apollo 11 astronauts left a passive array of 100 fused-silica corner-cube prisms at Mare Tranquillitatis (0.674°N, 23.473°E). With zero batteries and no atmosphere to stir up dust storms, it still reflects Earth laser pulses 57+ years later.'
                  : 'InSight lặng tiếng ngày 15/12/2022 (chính thức nghỉ hưu ngày 21/12/2022) vì các mạch điện tử chủ động luôn cần năng lượng. Thế nhưng ngày 20/07/1969, phi hành đoàn Apollo 11 đã đặt một khay gồm 100 lăng kính góc thạch anh thụ động tại Biển Tĩnh Lặng (0,674°B, 23,473°Đ). Không cần pin và nằm trên Mặt Trăng không có bão bụi khí quyển, nó vẫn phản xạ tia laser từ Trái Đất suốt hơn 57 năm qua.'}
              </p>
            </div>

            <LunarLaserRangingLab lang={lang} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <NasaPhotoViewer photoId="AS11-40-5952" lang={lang} compact />
              <NasaPhotoViewer photoId="PIA23177" lang={lang} compact />
            </div>
          </section>
        )}

        {/* ================================================================
            CHAPTER 09: WHY STORYTELLING MATTERS — BASELINE & IMPACT
           ================================================================ */}
        {isChapterVisible(8) && (
          <section
            id="chapter-section-8"
            aria-labelledby="ch09-heading"
            className="space-y-8 pt-4 border-t border-slate-800/60"
          >
            <div className="max-w-3xl">
              <div className="text-xs font-mono text-[#F4A261] uppercase tracking-wider mb-2">
                {lang === 'en'
                  ? 'CHAPTER 09 / 10 · BASELINE COMPARISON, VALIDITY & VIETNAMESE STEM ROADMAP'
                  : 'CHƯƠNG 09 / 10 · ĐỐI CHIẾU CƠ SỞ, TÍNH XÁC THỰC & LỘ TRÌNH GIÁO DỤC STEM'}
              </div>
              <h2
                id="ch09-heading"
                className="text-3xl sm:text-4xl font-semibold text-white mb-3"
              >
                {lang === 'en'
                  ? 'Why Storytelling Matters: Transforming Raw Catalogs into Spatial Inquiry'
                  : 'Vì sao Kể chuyện Khoa học Quan trọng: Từ Bảng Mã Thô đến Trải nghiệm Tương tác'}
              </h2>
              <p className="text-base text-slate-300 leading-relaxed">
                {lang === 'en'
                  ? 'For a 12-year-old student, NASA’s raw archival databases can feel impenetrable. Inspect the side-by-side comparison below to see how we bridge archival telemetry and middle-school STEM curiosity without sacrificing scientific rigor.'
                  : 'Đối với một học sinh 12 tuổi, các bảng dữ liệu lưu trữ thô rất khó tiếp cận. Hãy xem bảng đối chiếu song song bên dưới để thấy cách dự án kết nối dữ liệu gốc của NASA với trí tò mò khoa học của học sinh phổ thông mà vẫn giữ nguyên độ chính xác.'}
              </p>
            </div>

            {/* Baseline Toggle Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setBaselineView('comparison')}
                className={`px-3.5 py-2 text-xs font-mono font-semibold rounded-lg border transition-colors ${
                  baselineView === 'comparison'
                    ? 'bg-[#F4A261] text-[#070B14] border-[#F4A261]'
                    : 'bg-[#0E1729] text-slate-300 border-slate-800'
                }`}
              >
                {lang === 'en' ? 'Side-by-Side Comparison' : 'Đối chiếu Song song'}
              </button>
              <button
                type="button"
                onClick={() => setBaselineView('raw')}
                className={`px-3.5 py-2 text-xs font-mono font-semibold rounded-lg border transition-colors ${
                  baselineView === 'raw'
                    ? 'bg-[#F4A261] text-[#070B14] border-[#F4A261]'
                    : 'bg-[#0E1729] text-slate-300 border-slate-800'
                }`}
              >
                {lang === 'en'
                  ? 'Conventional Baseline (Raw NSSDCA ASCII)'
                  : 'Cơ sở Truyền thống (Bảng mã NSSDCA thô)'}
              </button>
              <button
                type="button"
                onClick={() => setBaselineView('solution')}
                className={`px-3.5 py-2 text-xs font-mono font-semibold rounded-lg border transition-colors ${
                  baselineView === 'solution'
                    ? 'bg-[#64DFDF] text-[#070B14] border-[#64DFDF]'
                    : 'bg-[#0E1729] text-slate-300 border-slate-800'
                }`}
              >
                {lang === 'en'
                  ? 'Our Solution (Silent Monuments GIS + Lab)'
                  : 'Giải pháp của Đội (Bản đồ GIS + Phòng Lab 3D)'}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {(baselineView === 'comparison' || baselineView === 'raw') && (
                <div className="rounded-xl border border-slate-800 bg-[#0B1220] p-5">
                  <div className="text-xs font-mono text-slate-400 mb-2">
                    CONVENTIONAL BASELINE · RAW ARCHIVAL TABLE
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3">
                    {lang === 'en'
                      ? 'What a Student Normally Faces: Uncontextualized ASCII Records'
                      : 'Những gì Học sinh Thường Gặp: Các Bảng Mã Kỹ thuật Rời rạc'}
                  </h3>
                  <pre className="p-4 rounded-lg bg-[#070B14] border border-slate-800 text-xs font-mono text-slate-400 overflow-x-auto leading-relaxed">
{`OBJECT_ID      : 2018-042A (INSIGHT)
TARGET_BODY    : MARS (4.5024 N, 135.6234 E, -2655m MOLA)
LAUNCH_EPOCH   : 2018-05-05T11:05:00Z (ATLAS V 401)
LANDING_EPOCH  : 2018-11-26T19:52:59Z
END_OF_MISSION : 2022-12-15 / 2022-12-21 (SOL 1440)
INSTRUMENTS    : SEIS (VBB/SP), HP3 (DLR), RISE (X-BAND)
POWER_DELTA    : ~5000 Wh/sol (SOL 10) -> ~500 Wh/sol (SOL 1211)
STATUS         : INACTIVE / DECOMMISSIONED SURFACE ASSET`}
                  </pre>
                  <p className="text-xs text-slate-400 mt-3">
                    {lang === 'en'
                      ? 'Limitation: Accurate for researchers, but provides zero spatial intuition, zero acoustic or visual feedback, and no explanation of why hardware remains on-site.'
                      : 'Hạn chế: Chính xác với nhà nghiên cứu nhưng thiếu trực quan không gian 3D, không có âm thanh địa chấn hay bài tập thực hành cho học sinh 10–15 tuổi.'}
                  </p>
                </div>
              )}

              {(baselineView === 'comparison' || baselineView === 'solution') && (
                <div className="rounded-xl border border-[#64DFDF]/40 bg-[#0B1220] p-5">
                  <div className="text-xs font-mono text-[#64DFDF] mb-2">
                    OUR SOLUTION · SILENT MONUMENTS (TEAM NAU EXPLORERS · NS01048)
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3">
                    {lang === 'en'
                      ? 'Spatial GIS + Interactive Engineering Trade-Offs + Bilingual Equity'
                      : 'Bản đồ GIS 3D + Mô phỏng Đánh đổi Năng lượng + Song ngữ Anh–Việt'}
                  </h3>
                  <ul className="space-y-2.5 text-xs text-slate-200 leading-relaxed">
                    <li>
                      <strong className="text-[#F4A261] font-mono">1. 3D GIS &amp; Hardware Context:</strong>{' '}
                      {lang === 'en'
                        ? 'Places 2018-042A, 2003-032A, and 1969-059C onto interactive MOLA/LRO globes and an articulated 3D InSight lander model.'
                        : 'Đặt trực tiếp các mã 2018-042A, 2003-032A và 1969-059C lên quả cầu địa hình 3D và mô hình trạm đổ bộ InSight.'}
                    </li>
                    <li>
                      <strong className="text-[#64DFDF] font-mono">2. Hands-On Physics Labs:</strong>{' '}
                      {lang === 'en'
                        ? 'Students hear 60x marsquake sonifications, scrub 2018–2022 solar dust accumulation, and time a 2.56-second lunar laser pulse.'
                        : 'Học sinh trực tiếp nghe âm thanh địa chấn 60x, kéo thanh trượt bụi phủ 2018–2022 và bấm giờ xung laser 2,56 giây tới Mặt Trăng.'}
                    </li>
                    <li>
                      <strong className="text-[#FFD1A6] font-mono">3. Representational Honesty:</strong>{' '}
                      {lang === 'en'
                        ? 'Explicit badges separate verified NASA/NSSDCA telemetry from conceptual simulations and first-person storytelling.'
                        : 'Gắn nhãn phân biệt rõ ràng giữa dữ liệu đo đạc gốc của NASA/NSSDCA và mô phỏng sư phạm.'}
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Scalable Roadmap */}
            <div className="rounded-xl border border-slate-800 bg-[#0B1220] p-5">
              <div className="text-xs font-mono text-[#F4A261] font-semibold mb-3">
                {lang === 'en'
                  ? 'MODULAR EXPANSION ROADMAP · BEYOND INSIGHT, OPPORTUNITY & APOLLO 11'
                  : 'LỘ TRÌNH MỞ RỘNG MÔ-ĐUN · TIẾP NỐI INSIGHT, OPPORTUNITY & APOLLO 11'}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-lg bg-[#0E1729] border border-slate-800">
                  <strong className="text-white block text-sm mb-1">
                    {lang === 'en'
                      ? 'Phase 1 · Ingenuity Mars Helicopter (2020-052B)'
                      : 'Giai đoạn 1 · Trực thăng Sao Hỏa Ingenuity (2020-052B)'}
                  </strong>
                  <p className="text-slate-300 leading-relaxed">
                    {lang === 'en'
                      ? 'After 72 flights at Jezero Crater, a rotor blade tip broke in Jan 2024. Ingenuity now serves as a stationary weather and avionics testbed in Valinor Hills for up to 20 years.'
                      : 'Sau 72 chuyến bay tại miệng hố Jezero, đầu cánh quạt bị gãy vào tháng 1/2024. Ingenuity hiện trở thành trạm thử nghiệm điện tử cố định tại đồi Valinor trong suốt 20 năm tới.'}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-[#0E1729] border border-slate-800">
                  <strong className="text-white block text-sm mb-1">
                    {lang === 'en'
                      ? 'Phase 2 · Voyager 1 & 2 Golden Records (1977-084A)'
                      : 'Giai đoạn 2 · Đĩa Vàng Voyager 1 & 2 (1977-084A)'}
                  </strong>
                  <p className="text-slate-300 leading-relaxed">
                    {lang === 'en'
                      ? 'Extending our power-budget simulator to RTG plutonium decay in interstellar space as engineers shut down heaters one by one beyond the heliopause.'
                      : 'Mở rộng mô phỏng quản lý nguồn điện sang nguồn đồng vị phóng xạ RTG ở không gian liên sao khi các kỹ sư tắt dần từng thiết bị.'}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-[#0E1729] border border-slate-800">
                  <strong className="text-white block text-sm mb-1">
                    {lang === 'en'
                      ? 'Phase 3 · Vietnamese STEM Classroom Kit (Nghe An University)'
                      : 'Giai đoạn 3 · Học liệu STEM Trường học Việt Nam (ĐH Nghệ An)'}
                  </strong>
                  <p className="text-slate-300 leading-relaxed">
                    {lang === 'en'
                      ? 'Offline-ready 45-minute bilingual lesson plans for middle-school physics teachers in Nghe An and across Vietnam covering seismic waves, solar energy, and optical reflection.'
                      : 'Bộ giáo án 45 phút song ngữ hoạt động không cần mạng internet dành cho giáo viên Vật lý và Khoa học tự nhiên THCS tại Nghệ An và Việt Nam.'}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ================================================================
            CHAPTER 10: EXPLORER CHALLENGE & TRANSPARENCY LEDGER
           ================================================================ */}
        {isChapterVisible(9) && (
          <section
            id="chapter-section-9"
            aria-labelledby="ch10-heading"
            className="space-y-8 pt-4 border-t border-slate-800/60"
          >
            <div className="max-w-3xl">
              <div className="text-xs font-mono text-[#F4A261] uppercase tracking-wider mb-2">
                {lang === 'en'
                  ? 'CHAPTER 10 / 10 · 4-QUESTION MISSION REVIEW, CERTIFICATE & DISCLOSURE LEDGER'
                  : 'CHƯƠNG 10 / 10 · 4 CÂU HỎI ÔN TẬP, CHỨNG NHẬN THÁM HIỂM & SỔ CÁI MINH BẠCH'}
              </div>
              <h2
                id="ch10-heading"
                className="text-3xl sm:text-4xl font-semibold text-white mb-3"
              >
                {lang === 'en'
                  ? 'Explorer Challenge & Full Transparency Ledger'
                  : 'Thử thách Nhà Thám hiểm & Sổ cái Minh bạch Toàn diện'}
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
                      className="rounded-xl border border-slate-800 bg-[#0B1220] p-5 space-y-3"
                    >
                      <h3 className="text-base font-semibold text-white">
                        {q.question[lang]}
                      </h3>
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
                              className={`w-full p-3 rounded-lg border text-left text-xs leading-relaxed transition-colors ${
                                chosen
                                  ? 'bg-[#16233B] border-[#F4A261] text-white font-semibold'
                                  : 'bg-[#0E1729] border-slate-800 text-slate-300 hover:border-slate-700'
                              }`}
                            >
                              {optText}
                            </button>
                          );
                        })}
                      </div>

                      {quizSubmitted && selected !== null && (
                        <div
                          className={`p-3 rounded-lg border text-xs font-mono leading-relaxed ${
                            isCorrect
                              ? 'bg-[#0D282A] border-[#64DFDF] text-[#64DFDF]'
                              : 'bg-[#231915] border-[#F4A261] text-[#FFD1A6]'
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
                    className="px-5 py-2.5 text-xs font-mono font-bold rounded-lg bg-[#F4A261] text-[#070B14] hover:bg-[#FFD1A6]"
                  >
                    {lang === 'en' ? 'VERIFY MISSION ANSWERS' : 'KIỂM TRA ĐÁP ÁN'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setQuizAnswers([null, null, null, null]);
                      setQuizSubmitted(false);
                    }}
                    className="px-4 py-2.5 text-xs font-mono font-semibold rounded-lg border border-slate-700 bg-[#0E1729] text-slate-200 hover:border-slate-500"
                  >
                    {lang === 'en' ? 'RESET QUIZ' : 'LÀM LẠI'}
                  </button>
                </div>

                {quizSubmitted && (
                  <div
                    role="status"
                    aria-live="polite"
                    className="p-4 rounded-xl border border-[#64DFDF]/50 bg-[#0E1729] text-sm"
                  >
                    {!quizEvaluation.complete ? (
                      <span className="text-[#FFD1A6] font-mono">
                        {lang === 'en'
                          ? '▲ Please select an answer for all 4 questions before verifying.'
                          : '▲ Vui lòng chọn đáp án cho cả 4 câu hỏi trước khi kiểm tra.'}
                      </span>
                    ) : (
                      <div className="space-y-1">
                        <strong className="text-[#64DFDF] font-mono block text-base">
                          {lang === 'en'
                            ? `Mission Review Score: ${quizEvaluation.score} / ${quizEvaluation.total}`
                            : `Điểm Ôn tập Sứ mệnh: ${quizEvaluation.score} / ${quizEvaluation.total}`}
                        </strong>
                        <p className="text-xs text-slate-300">
                          {lang === 'en'
                            ? 'The spacecraft fell silent, but their discoveries—and your curiosity—continue.'
                            : 'Những cỗ máy đã im lặng, nhưng khám phá của chúng—và sự tò mò khoa học của bạn—vẫn tiếp tục.'}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right 5 cols: Personalized "Junior Planetary Explorer" Digital Mission Patch Generator */}
              <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-[#0B1220] p-5 space-y-4">
                <div className="text-xs font-mono text-[#64DFDF] font-semibold">
                  JUNIOR PLANETARY EXPLORER · MISSION PATCH GENERATOR
                </div>
                <h3 className="text-lg font-semibold text-white">
                  {lang === 'en'
                    ? 'Generate Your Off-World Archivist Mission Badge'
                    : 'Tạo Huy hiệu Nhà Thám hiểm Hành tinh của Bạn'}
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === 'en'
                    ? 'Type your name or callsign below to mint an on-screen commemorative badge (rendered 100% locally in your browser; zero personal data is stored or transmitted).'
                    : 'Nhập tên hoặc biệt danh của bạn để tạo huy hiệu kỷ niệm ngay trên màn hình (xử lý 100% cục bộ trên trình duyệt; không lưu trữ hay gửi bất kỳ dữ liệu cá nhân nào).'}
                </p>

                <div className="space-y-2">
                  <label
                    htmlFor="explorer-name-input"
                    className="block text-xs font-mono text-slate-300"
                  >
                    {lang === 'en' ? 'Explorer Name / Callsign:' : 'Tên Nhà thám hiểm / Biệt danh:'}
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="explorer-name-input"
                      type="text"
                      maxLength={32}
                      value={explorerName}
                      onChange={(e) => setExplorerName(e.target.value)}
                      placeholder={
                        lang === 'en' ? 'e.g. Minh Anh · Grade 8' : 'VD: Minh Anh · Lớp 8A'
                      }
                      className="flex-1 px-3 py-2 rounded-lg bg-[#070B14] border border-slate-700 text-sm text-white focus:outline-none focus:border-[#F4A261]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const clean = explorerName.trim();
                        if (clean.length > 0) {
                          setGeneratedCallsign(clean.toUpperCase());
                        }
                      }}
                      className="px-3.5 py-2 text-xs font-mono font-bold rounded-lg bg-[#64DFDF] text-[#070B14] hover:bg-[#80FFDB] whitespace-nowrap shrink-0"
                    >
                      {lang === 'en' ? 'Mint Badge' : 'Tạo Huy hiệu'}
                    </button>
                  </div>
                </div>

                {/* SVG Digital Mission Patch Certificate */}
                <div className="p-4 rounded-xl border border-slate-800 bg-[#070B14] text-center space-y-3">
                  <svg
                    viewBox="0 0 320 220"
                    className="w-full max-w-[300px] mx-auto"
                    role="img"
                    aria-label="Junior Planetary Explorer Digital Mission Patch"
                  >
                    <polygon
                      points="160,10 295,62 295,158 160,210 25,158 25,62"
                      fill="#0E1729"
                      stroke="#F4A261"
                      strokeWidth="3"
                    />
                    <polygon
                      points="160,20 283,68 283,152 160,200 37,152 37,68"
                      fill="none"
                      stroke="#64DFDF"
                      strokeWidth="1.2"
                      strokeDasharray="4 3"
                    />
                    <circle cx="115" cy="95" r="24" fill="#9E4328" />
                    <circle cx="205" cy="95" r="16" fill="#64748B" />
                    <line
                      x1="115"
                      y1="95"
                      x2="205"
                      y2="95"
                      stroke="#64DFDF"
                      strokeWidth="2"
                      strokeDasharray="3 3"
                    />
                    <text
                      x="160"
                      y="48"
                      textAnchor="middle"
                      fill="#FFD1A6"
                      fontSize="10"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      SILENT MONUMENTS · SPACE APPS 2026
                    </text>
                    <text
                      x="160"
                      y="144"
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="13"
                      fontWeight="700"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {generatedCallsign}
                    </text>
                    <text
                      x="160"
                      y="164"
                      textAnchor="middle"
                      fill="#64DFDF"
                      fontSize="9.5"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      VERIFIED: 2018-042A · 2003-032A · 1969-059C
                    </text>
                    <text
                      x="160"
                      y="182"
                      textAnchor="middle"
                      fill="#94A3B8"
                      fontSize="8.5"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      TEAM NAU EXPLORERS · NS01048
                    </text>
                  </svg>
                </div>
              </div>
            </div>

            {/* Inline Full Transparency & Reference Ledger */}
            <div className="rounded-xl border border-slate-800 bg-[#0B1220] p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-mono text-[#F4A261] block">
                    OFFICIAL HACKATHON COMPLIANCE &amp; PRIMARY ARCHIVES
                  </span>
                  <h3 className="text-xl font-semibold text-white">
                    {lang === 'en'
                      ? 'Reference Desk, Team Roster & Apache 2.0 Open License Ledger'
                      : 'Sổ cái Tài liệu Tham khảo, Danh sách Đội thi & Giấy phép Mở Apache 2.0'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRefModalOpen(true)}
                  className="px-3.5 py-2 text-xs font-mono font-semibold rounded-lg bg-[#16233B] text-[#64DFDF] border border-[#64DFDF]/40 hover:bg-[#1E3050]"
                >
                  {lang === 'en' ? 'Open Full-Screen Ledger Modal ↗' : 'Mở Sổ cái Toàn màn hình ↗'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {OFFICIAL_REFERENCES.map((ref) => (
                  <a
                    key={ref.id}
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 rounded-lg border border-slate-800 bg-[#0E1729] hover:border-[#F4A261] transition-colors block"
                  >
                    <div className="text-[11px] font-mono text-[#F4A261] mb-1">
                      [{String(ref.id).padStart(2, '0')} · {ref.category}]
                    </div>
                    <div className="text-xs font-semibold text-white mb-1 line-clamp-2">
                      {ref.title}
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-2">
                      {ref.verifiedFact}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Official Team Metadata Footer */}
      <footer className="border-t border-slate-800/80 bg-[#080D18] py-6 px-4 sm:px-8 text-xs text-slate-400">
        <div className="max-w-[1360px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="font-mono text-slate-200 font-semibold">
              {TEAM_METADATA.projectTitle}
            </div>
            <div>
              <strong className="text-[#F4A261] font-mono">
                Team {TEAM_METADATA.teamName} (ID: {TEAM_METADATA.teamId})
              </strong>{' '}
              · {TEAM_METADATA.institution[lang]} · {TEAM_METADATA.localEvent[lang]}
            </div>
            <div className="text-slate-400">
              {lang === 'en' ? 'Team Members (5): ' : 'Thành viên (5): '}
              <span className="text-slate-200 font-mono">
                {TEAM_METADATA.members.join(' · ')}
              </span>
            </div>
          </div>

          <div className="text-left md:text-right font-mono space-y-1 shrink-0">
            <div className="text-[#64DFDF]">{TEAM_METADATA.license}</div>
            <div>
              {lang === 'en'
                ? 'Target Audience: Ages 10–15 & STEM Educators'
                : 'Đối tượng: Học sinh 10–15 tuổi & Giáo viên STEM'}
            </div>
          </div>
        </div>
      </footer>

      {/* Sticky Bottom Chapter Pager HUD (01 / 10 to 10 / 10, PREV, NEXT, Quick Chapter Dots) */}
      <div className="sticky bottom-0 z-40 border-t border-slate-800 bg-[#070B14]/95">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 h-14 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => goToChapter(currentChapter - 1)}
            disabled={currentChapter === 0}
            aria-label="Previous chapter"
            className="px-3.5 py-1.5 text-xs font-mono font-semibold rounded-lg border border-slate-700 bg-[#121C2E] text-white disabled:opacity-35 hover:border-[#F4A261] transition-colors whitespace-nowrap shrink-0"
          >
            {lang === 'en' ? '← PREV' : '← TRƯỚC'}
          </button>

          {/* 10 Chapter Quick Dots with Tooltips */}
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
                      : 'w-2.5 bg-slate-700 hover:bg-slate-500'
                  }`}
                />
              );
            })}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span
              data-testid="chapter-counter"
              className="text-xs font-mono font-bold text-[#FFD1A6] tabular-nums"
            >
              {String(currentChapter + 1).padStart(2, '0')} / 10
            </span>
            <button
              type="button"
              onClick={() => goToChapter(currentChapter + 1)}
              disabled={currentChapter === 9}
              aria-label="Next chapter"
              className="px-3.5 py-1.5 text-xs font-mono font-semibold rounded-lg border border-slate-700 bg-[#121C2E] text-white disabled:opacity-35 hover:border-[#F4A261] transition-colors whitespace-nowrap shrink-0"
            >
              {lang === 'en' ? 'NEXT →' : 'TIẾP →'}
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
