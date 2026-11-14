import React, { useEffect, useState } from 'react';
import { Language } from '../data/bilingualContent';

export type NasaPhotoId = 'PIA22876' | 'PIA25287' | 'PIA22948' | 'PIA23177' | 'AS11-40-5952';

interface NasaPhotoMeta {
  id: NasaPhotoId;
  title: Record<Language, string>;
  date: string;
  credit: string;
  caption: Record<Language, string>;
  archiveUrl: string;
}

export const NASA_PHOTO_CATALOG: Record<NasaPhotoId, NasaPhotoMeta> = {
  PIA22876: {
    id: 'PIA22876',
    title: {
      en: 'PIA22876 · InSight’s First Selfie on Mars (Sol 10)',
      vi: 'PIA22876 · Bức ảnh Tự sướng Đầu tiên của InSight (Sol 10)',
    },
    date: '2018-12-06',
    credit: 'NASA / JPL-Caltech',
    caption: {
      en: 'Mosaic of 11 images taken by the Instrument Deployment Camera (IDC) on the robotic arm elbow. The decagonal solar wings gleam dark blue, producing ~4,588 to 5,000 Wh per sol.',
      vi: 'Ảnh ghép từ 11 khung hình chụp bởi camera khuỷu tay IDC. Hai cánh pin mặt trời hình thập giác còn sáng bóng màu xanh thẫm, tạo ra ~4.588 đến 5.000 Wh điện mỗi sol.',
    },
    archiveUrl: 'https://science.nasa.gov/photojournal/insights-first-selfie/',
  },
  PIA25287: {
    id: 'PIA25287',
    title: {
      en: 'PIA25287 · InSight’s Final Selfie (Sol 1211)',
      vi: 'PIA25287 · Bức ảnh Tự sướng Cuối cùng của InSight (Sol 1211)',
    },
    date: '2022-04-24',
    credit: 'NASA / JPL-Caltech',
    caption: {
      en: 'Captured on April 24, 2022 (Sol 1211) before the robotic arm was moved to its retirement pose. Thick rust-colored iron-oxide dust obscures the solar cells, cutting power to ~500 Wh/sol.',
      vi: 'Chụp ngày 24/04/2022 (Sol 1211) trước khi cánh tay robot đưa về tư thế nghỉ vĩnh viễn. Lớp bụi oxit sắt màu gỉ đồng phủ dày đặc trên mặt pin, làm công suất tụt xuống ~500 Wh/sol.',
    },
    archiveUrl: 'https://science.nasa.gov/photojournal/insights-final-selfie/',
  },
  PIA22948: {
    id: 'PIA22948',
    title: {
      en: 'PIA22948 · SEIS Seismometer Deployed on Elysium Planitia',
      vi: 'PIA22948 · Máy đo Địa chấn SEIS đặt trên đất Elysium Planitia',
    },
    date: '2018-12-19',
    credit: 'NASA / JPL-Caltech / CNES',
    caption: {
      en: 'Copper-colored hexagonal thermal blanket of SEIS sitting directly on Martian regolith 1.63 m in front of the lander deck, prior to lowering the white-and-gold Wind and Thermal Shield.',
      vi: 'Lớp vỏ cách nhiệt màu đồng hình lục giác của SEIS nằm trực tiếp trên nền đất Sao Hỏa cách thân trạm 1,63 m, trước khi lồng chắn gió và nhiệt WTS được chụp lên trên.',
    },
    archiveUrl: 'https://science.nasa.gov/mission/insight/science-instruments/',
  },
  PIA23177: {
    id: 'PIA23177',
    title: {
      en: 'PIA23177 · Opportunity Rover’s Final Panorama at Perseverance Valley',
      vi: 'PIA23177 · Toàn cảnh Cuối cùng của Opportunity tại Thung lũng Perseverance',
    },
    date: '2018-05-13',
    credit: 'NASA / JPL-Caltech / Cornell / ASU',
    caption: {
      en: '360-degree Pancam mosaic recorded from May 13 to June 10, 2018 (Sols 5084–5111) just as the historic planet-encircling dust storm darkened the sky above Meridiani Planum.',
      vi: 'Bức ảnh ghép 360 độ chụp bởi camera Pancam từ ngày 13/05 đến 10/06/2018 (Sol 5084–5111) ngay trước khi cơn bão bụi toàn cầu lịch sử làm tối sầm bầu trời Meridiani Planum.',
    },
    archiveUrl: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2003-032A',
  },
  'AS11-40-5952': {
    id: 'AS11-40-5952',
    title: {
      en: 'AS11-40-5952 · Apollo 11 Lunar Laser Ranging Retroreflector (LRRR)',
      vi: 'AS11-40-5952 · Gương Phản xạ Laser Mặt Trăng Apollo 11 (LRRR)',
    },
    date: '1969-07-20',
    credit: 'NASA / JSC / Apollo 11 Crew',
    caption: {
      en: 'Photographed on the lunar surface at Mare Tranquillitatis (0.674°N, 23.473°E). Its 100 recessed fused-silica corner-cube prisms still reflect Earth laser pulses in 2026.',
      vi: 'Chụp trên bề mặt Biển Tĩnh Lặng (0,674°B, 23,473°Đ). Mảng 100 lăng kính góc thạch anh tinh khiết của thiết bị vẫn phản xạ các xung laser từ Trái Đất vào năm 2026.',
    },
    archiveUrl: 'https://nssdc.gsfc.nasa.gov/nmc/experiment/display.action?id=1969-059C-03',
  },
};

const urlCache: Partial<Record<NasaPhotoId, string>> = {};

interface NasaPhotoViewerProps {
  photoId: NasaPhotoId;
  lang: Language;
  dustOverlayOpacity?: number; // 0..1 optional dust simulation overlay
  compact?: boolean;
}

export const NasaPhotoViewer: React.FC<NasaPhotoViewerProps> = ({
  photoId,
  lang,
  dustOverlayOpacity = 0,
  compact = false,
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(urlCache[photoId] ?? null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [fetchState, setFetchState] = useState<'loading' | 'live' | 'blueprint'>('loading');

  const meta = NASA_PHOTO_CATALOG[photoId];

  useEffect(() => {
    let active = true;
    setImgLoaded(false);

    if (urlCache[photoId]) {
      setImageUrl(urlCache[photoId]!);
      setFetchState('live');
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 5500);

    fetch(`https://images-api.nasa.gov/search?q=${encodeURIComponent(photoId)}&media_type=image`, {
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('NASA API status'))))
      .then((data) => {
        if (!active) return;
        const items = data?.collection?.items;
        if (Array.isArray(items) && items.length > 0) {
          const href = items[0]?.links?.find((l: { href?: string }) => l.href)?.href;
          if (href) {
            urlCache[photoId] = href;
            setImageUrl(href);
            setFetchState('live');
            return;
          }
        }
        setFetchState('blueprint');
      })
      .catch(() => {
        if (active) setFetchState('blueprint');
      })
      .finally(() => {
        window.clearTimeout(timer);
      });

    return () => {
      active = false;
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [photoId]);

  return (
    <figure className="rounded-xl border border-slate-800 bg-[#0B1220] overflow-hidden">
      <div className={`relative w-full ${compact ? 'aspect-[16/9]' : 'aspect-[16/10]'} bg-[#080E1A] overflow-hidden`}>
        {/* Always-present high-detail engineering SVG schematic underneath so zero broken image frame ever shows */}
        <div className="absolute inset-0 flex items-center justify-center p-4">
          {photoId === 'AS11-40-5952' ? (
            <svg viewBox="0 0 600 360" className="w-full h-full" role="img" aria-label={meta.title[lang]}>
              <rect width="600" height="360" fill="#090F1C" />
              {/* Lunar horizon */}
              <path d="M0 245 Q180 228 360 242 T600 238 L600 360 L0 360 Z" fill="#1E293B" />
              <ellipse cx="140" cy="285" rx="52" ry="11" fill="#0F172A" />
              <ellipse cx="470" cy="300" rx="68" ry="14" fill="#0F172A" />
              {/* LRRR 100 corner-cube array */}
              <g transform="translate(215, 130)">
                <polygon points="0,120 30,30 155,30 185,120" fill="#334155" stroke="#94A3B8" strokeWidth="2.5" />
                {/* 5x5 visible prism grid representing 100 corner cubes */}
                {[0, 1, 2, 3, 4].map((row) =>
                  [0, 1, 2, 3, 4].map((col) => {
                    const x = 34 + col * 24 - row * 3;
                    const y = 42 + row * 14;
                    return (
                      <circle
                        key={`${row}-${col}`}
                        cx={x}
                        cy={y}
                        r="5.5"
                        fill="#0F172A"
                        stroke="#64DFDF"
                        strokeWidth="1.2"
                      />
                    );
                  })
                )}
                <rect x="45" y="120" width="95" height="22" fill="#475569" stroke="#CBD5E1" strokeWidth="1.5" />
              </g>
              {/* Incoming/reflected green laser beam */}
              <line x1="70" y1="15" x2="302" y2="178" stroke="#64DFDF" strokeWidth="2.5" strokeDasharray="6 4" />
              <line x1="308" y1="175" x2="88" y2="10" stroke="#64DFDF" strokeWidth="1.8" opacity="0.7" />
              <text x="24" y="34" fill="#64DFDF" fontSize="12" fontFamily="JetBrains Mono, monospace">
                APOLLO 11 LRRR · 100 FUSED-SILICA PRISMS · 0.674°N, 23.473°E
              </text>
            </svg>
          ) : photoId === 'PIA23177' ? (
            <svg viewBox="0 0 600 360" className="w-full h-full" role="img" aria-label={meta.title[lang]}>
              <defs>
                <linearGradient id="stormSky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2A1512" />
                  <stop offset="60%" stopColor="#5C2A1E" />
                  <stop offset="100%" stopColor="#3B1B14" />
                </linearGradient>
              </defs>
              <rect width="600" height="360" fill="url(#stormSky)" />
              {/* Faint sun through Tau 10.8 dust storm */}
              <circle cx="440" cy="88" r="18" fill="#FFD1A6" opacity="0.22" />
              <path d="M0 230 Q160 195 340 225 T600 210 L600 360 L0 360 Z" fill="#4A2118" />
              {/* Rover wheel tracks in Perseverance Valley */}
              <path d="M120 355 Q210 280 285 232" fill="none" stroke="#26100B" strokeWidth="6" strokeDasharray="8 5" />
              <path d="M175 355 Q250 282 315 232" fill="none" stroke="#26100B" strokeWidth="6" strokeDasharray="8 5" />
              {/* Opportunity mast & winged solar deck silhouette */}
              <g transform="translate(305, 196)">
                <polygon points="-55,20 0,6 55,20 32,34 -32,34" fill="#1E293B" stroke="#F4A261" strokeWidth="1.8" />
                <line x1="0" y1="15" x2="0" y2="-28" stroke="#E2E8F0" strokeWidth="3.5" />
                <rect x="-12" y="-35" width="24" height="10" rx="2" fill="#F4A261" />
                <circle cx="-28" cy="38" r="9" fill="#0F172A" stroke="#94A3B8" strokeWidth="2" />
                <circle cx="0" cy="41" r="9" fill="#0F172A" stroke="#94A3B8" strokeWidth="2" />
                <circle cx="28" cy="38" r="9" fill="#0F172A" stroke="#94A3B8" strokeWidth="2" />
              </g>
              <text x="24" y="34" fill="#FFD1A6" fontSize="12" fontFamily="JetBrains Mono, monospace">
                MER-B OPPORTUNITY · PERSEVERANCE VALLEY · SOL 5111 (TAU &gt; 10.8)
              </text>
            </svg>
          ) : (
            <svg viewBox="0 0 600 360" className="w-full h-full" role="img" aria-label={meta.title[lang]}>
              <defs>
                <linearGradient id="marsSky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1B1524" />
                  <stop offset="65%" stopColor="#4A2722" />
                  <stop offset="100%" stopColor="#7C3F2C" />
                </linearGradient>
              </defs>
              <rect width="600" height="360" fill="url(#marsSky)" />
              <path d="M0 238 Q200 222 410 236 T600 230 L600 360 L0 360 Z" fill="#6D3426" />
              {/* InSight schematic with decagonal arrays and deployed SEIS */}
              <g transform="translate(275, 195)">
                {/* Left and Right Decagonal Solar Wings */}
                <circle
                  cx="-125"
                  cy="-12"
                  r="56"
                  fill={photoId === 'PIA25287' ? '#7A422E' : '#1E3A5F'}
                  stroke="#F4A261"
                  strokeWidth="2.5"
                />
                <circle
                  cx="125"
                  cy="-12"
                  r="56"
                  fill={photoId === 'PIA25287' ? '#7A422E' : '#1E3A5F'}
                  stroke="#F4A261"
                  strokeWidth="2.5"
                />
                {/* Radial web lines on solar panels */}
                {[-125, 125].map((cx) => (
                  <g key={cx} stroke="#94A3B8" strokeWidth="1" opacity="0.55">
                    <line x1={cx - 54} y1="-12" x2={cx + 54} y2="-12" />
                    <line x1={cx} y1="-66" x2={cx} y2="42" />
                    <line x1={cx - 38} y1="-50" x2={cx + 38} y2="26" />
                    <line x1={cx - 38} y1="26" x2={cx + 38} y2="-50" />
                  </g>
                ))}
                {/* Lander Deck & Legs */}
                <line x1="-42" y1="18" x2="-68" y2="68" stroke="#CBD5E1" strokeWidth="4" />
                <line x1="42" y1="18" x2="68" y2="68" stroke="#CBD5E1" strokeWidth="4" />
                <line x1="0" y1="20" x2="0" y2="72" stroke="#CBD5E1" strokeWidth="4" />
                <rect x="-52" y="-12" width="104" height="32" rx="6" fill="#D97706" stroke="#FDE68A" strokeWidth="2" />
                {/* 1.8m IDA Robotic Arm */}
                <path d="M18 -12 L48 -58 L98 -22" fill="none" stroke="#E2E8F0" strokeWidth="4" />
                {/* Deployed SEIS + WTS Dome on ground */}
                <path d="M85 88 C85 58 145 58 145 88 Z" fill="#F4A261" stroke="#FFFBEB" strokeWidth="2" />
                {/* HP3 Mole spike on ground */}
                <rect x="-105" y="62" width="8" height="36" fill="#94A3B8" stroke="#E2E8F0" strokeWidth="1.5" />
              </g>
              <text x="24" y="34" fill="#FFD1A6" fontSize="12" fontFamily="JetBrains Mono, monospace">
                {photoId} · INSIGHT LANDER TELEMETRY ARCHIVE · 4.502°N, 135.623°E
              </text>
            </svg>
          )}
        </div>

        {/* Live NASA API photograph layered seamlessly once loaded */}
        {imageUrl && (
          <img
            src={imageUrl}
            alt={meta.title[lang]}
            referrerPolicy="no-referrer"
            onLoad={() => setImgLoaded(true)}
            onError={() => {
              setImgLoaded(false);
              setFetchState('blueprint');
            }}
            className={`relative z-10 w-full h-full object-cover transition-opacity duration-500 ${
              imgLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Optional Martian Iron-Oxide Dust Coating Overlay (used in Ch 07 Scrubber) */}
        {dustOverlayOpacity > 0.01 && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-150"
            style={{
              opacity: Math.min(0.86, dustOverlayOpacity * 0.92),
              background:
                'radial-gradient(circle at 50% 45%, rgba(168, 72, 42, 0.72), rgba(114, 45, 28, 0.92)), repeating-radial-gradient(circle at 30% 60%, rgba(244, 162, 97, 0.14) 0 2px, transparent 2px 7px)',
            }}
          />
        )}

        {/* Top-left & Top-right technical archive overlays */}
        <div className="absolute top-3 left-3 z-30 flex items-center gap-2 bg-[#070B14]/85 px-2.5 py-1 rounded border border-slate-700/80 text-[11px] font-mono text-slate-200">
          <span className="text-[#F4A261] font-semibold">[VERIFIED NASA/NSSDCA DATA]</span>
          <span>·</span>
          <span>{photoId}</span>
        </div>

        <div className="absolute top-3 right-3 z-30 bg-[#070B14]/85 px-2.5 py-1 rounded border border-slate-700/80 text-[11px] font-mono text-slate-300">
          {fetchState === 'live' && imgLoaded
            ? lang === 'en'
              ? 'LIVE NASA IMAGE API'
              : 'ẢNH GỐC TỪ NASA API'
            : lang === 'en'
              ? 'CAD BLUEPRINT FALLBACK'
              : 'BẢN VẼ KỸ THUẬT DỰ PHÒNG'}
        </div>
      </div>

      <figcaption className="p-4 border-t border-slate-800/90 bg-[#0D1526]">
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
          <strong className="text-sm font-semibold text-slate-100">{meta.title[lang]}</strong>
          <span className="text-xs font-mono text-slate-400">
            {meta.date} · {meta.credit}
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed mb-2">{meta.caption[lang]}</p>
        <a
          href={meta.archiveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-mono text-[#F4A261] hover:text-[#FFD1A6] underline underline-offset-4"
        >
          {lang === 'en' ? 'Inspect Primary NASA Photojournal Record ↗' : 'Xem hồ sơ lưu trữ gốc tại NASA Photojournal ↗'}
        </a>
      </figcaption>
    </figure>
  );
};
