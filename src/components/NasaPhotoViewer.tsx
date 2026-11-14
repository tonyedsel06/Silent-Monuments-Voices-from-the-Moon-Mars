import React, { useEffect, useState } from 'react';
import { Language } from '../data/bilingualContent';
import { DIRECT_NASA_PHOTO_URLS } from '../utils/nasaMedia';

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
      en: 'InSight’s First Selfie on Mars (Sol 10)',
      vi: 'Bức Ảnh Tự Chụp Đầu Tiên Của InSight (Sol 10)',
    },
    date: '6 Dec 2018',
    credit: 'NASA / JPL-Caltech · PIA22876',
    caption: {
      en: 'Stitched from 11 elbow-camera frames. The clean decagonal solar wings gleam dark blue, generating ~5,000 Wh of energy per Martian sol.',
      vi: 'Ghép từ 11 khung hình camera khuỷu tay. Hai cánh pin mặt trời còn sáng bóng màu xanh thẫm, tạo ra ~5.000 Wh điện mỗi sol.',
    },
    archiveUrl: 'https://science.nasa.gov/photojournal/insights-first-selfie/',
  },
  PIA25287: {
    id: 'PIA25287',
    title: {
      en: 'InSight’s Final Dust-Covered Selfie (Sol 1211)',
      vi: 'Bức Ảnh Tự Chụp Cuối Cùng Dưới Lớp Bụi Đỏ (Sol 1211)',
    },
    date: '24 Apr 2022',
    credit: 'NASA / JPL-Caltech · PIA25287',
    caption: {
      en: 'Captured before the robotic arm moved to its retirement pose. Thick iron-oxide dust coats the deck, cutting daily power down to ~500 Wh/sol.',
      vi: 'Chụp trước khi cánh tay robot thu về tư thế nghỉ. Lớp bụi oxit sắt phủ dày trên mặt pin làm công suất giảm còn ~500 Wh/sol.',
    },
    archiveUrl: 'https://science.nasa.gov/photojournal/insights-final-selfie/',
  },
  PIA22948: {
    id: 'PIA22948',
    title: {
      en: 'SEIS Seismometer Deployed on Elysium Planitia',
      vi: 'Máy Đo Địa Chấn SEIS Đặt Trên Đất Elysium Planitia',
    },
    date: '19 Dec 2018',
    credit: 'NASA / JPL-Caltech / CNES · PIA22948',
    caption: {
      en: 'The copper-colored hexagonal thermal enclosure of SEIS resting on Martian soil 1.63 meters ahead of the lander deck.',
      vi: 'Lớp vỏ cách nhiệt màu đồng hình lục giác của SEIS nằm trực tiếp trên nền đất Sao Hỏa cách thân trạm 1,63 mét.',
    },
    archiveUrl: 'https://science.nasa.gov/mission/insight/science-instruments/',
  },
  PIA23177: {
    id: 'PIA23177',
    title: {
      en: 'Opportunity’s Final Panorama at Perseverance Valley',
      vi: 'Toàn Cảnh Cuối Cùng Của Opportunity Tại Thung Lũng Perseverance',
    },
    date: 'May–June 2018',
    credit: 'NASA / JPL-Caltech / Cornell · PIA23177',
    caption: {
      en: 'Recorded across Sols 5084–5111 just before a planet-encircling dust storm darkened the sky above Meridiani Planum.',
      vi: 'Ghi lại từ Sol 5084–5111 ngay trước khi cơn bão bụi toàn cầu làm tối sầm bầu trời Meridiani Planum.',
    },
    archiveUrl: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2003-032A',
  },
  'AS11-40-5952': {
    id: 'AS11-40-5952',
    title: {
      en: 'Apollo 11 Lunar Laser Ranging Retroreflector (LRRR)',
      vi: 'Gương Phản Xạ Laser Mặt Trăng Apollo 11 (LRRR)',
    },
    date: '20 July 1969',
    credit: 'NASA / JSC · AS11-40-5952',
    caption: {
      en: 'Photographed at Mare Tranquillitatis (0.674°N, 23.473°E). Its 100 fused-silica corner-cube prisms still reflect Earth laser pulses in 2026.',
      vi: 'Chụp tại Biển Tĩnh Lặng (0,674°B, 23,473°Đ). Mảng 100 lăng kính góc thạch anh vẫn phản xạ xung laser từ Trái Đất năm 2026.',
    },
    archiveUrl: 'https://nssdc.gsfc.nasa.gov/nmc/experiment/display.action?id=1969-059C-03',
  },
};

const urlCache: Partial<Record<NasaPhotoId, string>> = {
  PIA22876: DIRECT_NASA_PHOTO_URLS.PIA22876,
  PIA25287: DIRECT_NASA_PHOTO_URLS.PIA25287,
  PIA22948: DIRECT_NASA_PHOTO_URLS.PIA22948,
  PIA23177: DIRECT_NASA_PHOTO_URLS.PIA23177,
  'AS11-40-5952': DIRECT_NASA_PHOTO_URLS['AS11-40-5952'],
};

interface NasaPhotoViewerProps {
  photoId: NasaPhotoId;
  lang: Language;
  dustOverlayOpacity?: number;
  compact?: boolean;
}

export const NasaPhotoViewer: React.FC<NasaPhotoViewerProps> = ({
  photoId,
  lang,
  dustOverlayOpacity = 0,
  compact = false,
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(
    urlCache[photoId] ?? DIRECT_NASA_PHOTO_URLS[photoId] ?? null
  );
  const [imgLoaded, setImgLoaded] = useState(false);

  const meta = NASA_PHOTO_CATALOG[photoId];

  useEffect(() => {
    setImgLoaded(false);
    const direct = urlCache[photoId] ?? DIRECT_NASA_PHOTO_URLS[photoId];
    if (direct) {
      setImageUrl(direct);
    }
  }, [photoId]);

  const handleImageError = () => {
    // If direct asset URL fails, query images-api.nasa.gov as backup
    fetch(`https://images-api.nasa.gov/search?q=${encodeURIComponent(photoId)}&media_type=image`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('API error'))))
      .then((data) => {
        const href = data?.collection?.items?.[0]?.links?.[0]?.href;
        if (href && href !== imageUrl) {
          urlCache[photoId] = href;
          setImageUrl(href);
        } else {
          setImgLoaded(false);
        }
      })
      .catch(() => {
        setImgLoaded(false);
      });
  };

  return (
    <figure className="rounded-2xl border border-[#F4A261]/25 bg-[#291711]/90 overflow-hidden shadow-xl">
      <div
        className={`relative w-full ${
          compact ? 'aspect-[16/9]' : 'aspect-[16/10]'
        } bg-[#1E120E] overflow-hidden`}
      >
        {/* Instant high-detail schematic backdrop while high-res NASA photo decodes */}
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <svg
            viewBox="0 0 600 360"
            className="w-full h-full"
            role="img"
            aria-label={meta.title[lang]}
          >
            <defs>
              <linearGradient id={`bg-${photoId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={photoId === 'AS11-40-5952' ? '#1E293B' : '#3B1D14'} />
                <stop offset="100%" stopColor={photoId === 'AS11-40-5952' ? '#0F172A' : '#6D3426'} />
              </linearGradient>
            </defs>
            <rect width="600" height="360" fill={`url(#bg-${photoId})`} />
            <path d="M0 245 Q200 225 410 238 T600 232 L600 360 L0 360 Z" fill="#4A2518" />
            <text
              x="24"
              y="36"
              fill="#FFD1A6"
              fontSize="13"
              fontWeight="600"
              fontFamily="Plus Jakarta Sans, sans-serif"
            >
              {meta.credit}
            </text>
          </svg>
        </div>

        {/* Real High-Resolution NASA Photograph */}
        {imageUrl && (
          <img
            src={imageUrl}
            alt={meta.title[lang]}
            decoding="async"
            referrerPolicy="no-referrer"
            onLoad={() => setImgLoaded(true)}
            onError={handleImageError}
            className={`relative z-10 w-full h-full object-cover transition-opacity duration-500 ${
              imgLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Optional Martian Iron-Oxide Dust Coating Overlay (Chapter 07 Scrubber) */}
        {dustOverlayOpacity > 0.01 && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-150"
            style={{
              opacity: Math.min(0.84, dustOverlayOpacity * 0.9),
              background:
                'radial-gradient(circle at 50% 45%, rgba(168, 72, 42, 0.72), rgba(114, 45, 28, 0.90))',
            }}
          />
        )}

        {/* Clean Editorial Badges */}
        <div className="absolute top-3 left-3 z-30 flex items-center gap-2 bg-[#24140E]/85 px-3 py-1 rounded-full border border-[#F4A261]/35 text-xs font-semibold text-[#FFF8F2]">
          <span className="text-[#F4A261]">
            {lang === 'en' ? 'Verified NASA Archive' : 'Ảnh gốc Lưu trữ NASA'}
          </span>
          <span>·</span>
          <span>{photoId}</span>
        </div>

        <a
          href={meta.archiveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-3 right-3 z-30 bg-[#24140E]/85 hover:bg-[#3A2016] px-3 py-1 rounded-full border border-[#FFD1A6]/35 text-xs font-semibold text-[#FFD1A6] transition-colors"
        >
          {lang === 'en' ? 'Source: NASA/JPL ↗' : 'Nguồn: NASA/JPL ↗'}
        </a>
      </div>

      <figcaption className="p-4 border-t border-[#F4A261]/20 bg-[#23140F]/95">
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
          <strong className="text-sm font-semibold text-[#FFF8F2]">{meta.title[lang]}</strong>
          <span className="text-xs font-medium text-[#FFD1A6]/80">{meta.date}</span>
        </div>
        <p className="text-xs text-[#F3E5D8]/90 leading-relaxed">{meta.caption[lang]}</p>
      </figcaption>
    </figure>
  );
};
