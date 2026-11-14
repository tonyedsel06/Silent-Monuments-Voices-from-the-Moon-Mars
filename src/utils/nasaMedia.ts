// Verified NASA Image & Planetary Mosaic Registry with Instant Preloading

export interface ChapterBackdropMeta {
  chapterIndex: number;
  piaId: string;
  theme: 'mars' | 'moon';
  primaryUrl: string;
  fallbackUrl: string;
  credit: string;
  sourceUrl: string;
  caption: {
    en: string;
    vi: string;
  };
}

// Verified direct NASA Image Archive URLs (images-assets.nasa.gov) for all 10 Chapters
export const CHAPTER_BACKDROPS: ChapterBackdropMeta[] = [
  {
    chapterIndex: 0,
    piaId: 'PIA23201',
    theme: 'mars',
    primaryUrl: 'https://images-assets.nasa.gov/image/PIA23201/PIA23201~orig.jpg',
    fallbackUrl: 'https://images-assets.nasa.gov/image/PIA22876/PIA22876~medium.jpg',
    credit: 'NASA / JPL-Caltech · PIA23201',
    sourceUrl: 'https://images.nasa.gov/details/PIA23201',
    caption: {
      en: 'InSight Martian Sunrise & Sunset at Elysium Planitia (Sol 145)',
      vi: 'Bình minh và hoàng hôn trên đồng bằng Elysium Planitia do InSight ghi lại (Sol 145)',
    },
  },
  {
    chapterIndex: 1,
    piaId: 'PIA04591',
    theme: 'moon',
    primaryUrl: 'https://images-assets.nasa.gov/image/PIA04591/PIA04591~orig.jpg',
    fallbackUrl: 'https://images-assets.nasa.gov/image/PIA00405/PIA00405~small.jpg',
    credit: 'NASA / JPL / USGS · PIA04591',
    sourceUrl: 'https://images.nasa.gov/details/PIA04591',
    caption: {
      en: 'Global Mars & Lunar Orbital Imagery from NASA Planetary Archives',
      vi: 'Ảnh chụp toàn cầu Sao Hỏa và Mặt Trăng từ quỹ đạo của NASA',
    },
  },
  {
    chapterIndex: 2,
    piaId: 'PIA22875',
    theme: 'mars',
    primaryUrl: 'https://images-assets.nasa.gov/image/PIA22875/PIA22875~medium.jpg',
    fallbackUrl: 'https://images-assets.nasa.gov/image/PIA22876/PIA22876~medium.jpg',
    credit: 'NASA / JPL-Caltech · PIA22875',
    sourceUrl: 'https://images.nasa.gov/details/PIA22875',
    caption: {
      en: 'InSight’s Instrument Deployment Workspace at Elysium Planitia',
      vi: 'Không gian mặt đất phía trước trạm đổ bộ InSight tại Elysium Planitia',
    },
  },
  {
    chapterIndex: 3,
    piaId: 'PIA22948',
    theme: 'mars',
    primaryUrl: 'https://images-assets.nasa.gov/image/PIA22948/PIA22948~orig.jpg',
    fallbackUrl: 'https://images-assets.nasa.gov/image/PIA23047/PIA23047~orig.jpg',
    credit: 'NASA / JPL-Caltech / CNES · PIA22948',
    sourceUrl: 'https://images.nasa.gov/details/PIA22948',
    caption: {
      en: 'SEIS Copper-Covered Seismometer Deployed Directly on Martian Soil',
      vi: 'Máy đo địa chấn SEIS phủ lớp cách nhiệt màu đồng đặt trên nền đất Sao Hỏa',
    },
  },
  {
    chapterIndex: 4,
    piaId: 'PIA23623',
    theme: 'mars',
    primaryUrl: 'https://images-assets.nasa.gov/image/PIA23623/PIA23623~medium.jpg',
    fallbackUrl: 'https://images-assets.nasa.gov/image/PIA22948/PIA22948~orig.jpg',
    credit: 'NASA / JPL-Caltech / U. Arizona · PIA23623',
    sourceUrl: 'https://images.nasa.gov/details/PIA23623',
    caption: {
      en: 'Cerberus Fossae Tectonic Fault System — Epicenter of Major Marsquakes',
      vi: 'Hệ thống đứt gãy kiến tạo Cerberus Fossae — Tâm chấn của các trận động đất Sao Hỏa',
    },
  },
  {
    chapterIndex: 5,
    piaId: 'PIA23047',
    theme: 'mars',
    primaryUrl: 'https://images-assets.nasa.gov/image/PIA23047/PIA23047~orig.jpg',
    fallbackUrl: 'https://images-assets.nasa.gov/image/PIA22948/PIA22948~orig.jpg',
    credit: 'NASA / JPL-Caltech / DLR · PIA23047',
    sourceUrl: 'https://images.nasa.gov/details/PIA23047',
    caption: {
      en: 'SEIS Wind Shield & HP³ Heat Flow Probe Deployed on Elysium Planitia',
      vi: 'Lồng chắn gió WTS và mũi khoan nhiệt lượng HP³ trên mặt đất Sao Hỏa',
    },
  },
  {
    chapterIndex: 6,
    piaId: 'PIA25287',
    theme: 'mars',
    primaryUrl: 'https://images-assets.nasa.gov/image/PIA25287/PIA25287~medium.jpg',
    fallbackUrl: 'https://images-assets.nasa.gov/image/PIA23177/PIA23177~medium.jpg',
    credit: 'NASA / JPL-Caltech · PIA25287',
    sourceUrl: 'https://images.nasa.gov/details/PIA25287',
    caption: {
      en: 'InSight’s Final Dust-Blanketed Selfie on Sol 1211 (April 2022)',
      vi: 'Bức ảnh tự chụp cuối cùng của InSight dưới lớp bụi đỏ ngày Sol 1211 (4/2022)',
    },
  },
  {
    chapterIndex: 7,
    piaId: 'AS11-40-5952',
    theme: 'moon',
    primaryUrl: 'https://images-assets.nasa.gov/image/as11-40-5874/as11-40-5874~medium.jpg',
    fallbackUrl: 'https://images-assets.nasa.gov/image/PIA00405/PIA00405~small.jpg',
    credit: 'NASA / JSC · AS11-40-5952 / AS11-40-5874',
    sourceUrl: 'https://images.nasa.gov/details/as11-40-5874',
    caption: {
      en: 'Apollo 11 Lunar Laser Ranging Retroreflector at Mare Tranquillitatis',
      vi: 'Gương phản xạ Laser Apollo 11 trên bề mặt Biển Tĩnh Lặng (Mặt Trăng)',
    },
  },
  {
    chapterIndex: 8,
    piaId: 'AS08-14-2383',
    theme: 'moon',
    primaryUrl: 'https://images-assets.nasa.gov/image/as08-14-2383/as08-14-2383~medium.jpg',
    fallbackUrl: 'https://images-assets.nasa.gov/image/as11-40-5874/as11-40-5874~medium.jpg',
    credit: 'NASA / Apollo 8 · AS08-14-2383',
    sourceUrl: 'https://images.nasa.gov/details/as08-14-2383',
    caption: {
      en: 'Earthrise Above the Lunar Horizon — Connecting Deep Space Telemetry Home',
      vi: 'Trái Đất mọc trên đường chân trời Mặt Trăng — Sợi dây kết nối tri thức nhân loại',
    },
  },
  {
    chapterIndex: 9,
    piaId: 'PIA24420',
    theme: 'mars',
    primaryUrl: 'https://images-assets.nasa.gov/image/PIA24420/PIA24420~medium.jpg',
    fallbackUrl: 'https://images-assets.nasa.gov/image/PIA23201/PIA23201~orig.jpg',
    credit: 'NASA / JPL-Caltech · PIA24420',
    sourceUrl: 'https://images.nasa.gov/details/PIA24420',
    caption: {
      en: 'Martian Horizon Panorama — Continuing the Legacy of Planetary Exploration',
      vi: 'Toàn cảnh chân trời Sao Hỏa — Tiếp nối di sản thám hiểm hành tinh',
    },
  },
];

// Direct NASA Image URLs for Hardware Cards & Viewers
export const DIRECT_NASA_PHOTO_URLS: Record<string, string> = {
  PIA22876: 'https://images-assets.nasa.gov/image/PIA22876/PIA22876~medium.jpg',
  PIA25287: 'https://images-assets.nasa.gov/image/PIA25287/PIA25287~medium.jpg',
  PIA22948: 'https://images-assets.nasa.gov/image/PIA22948/PIA22948~orig.jpg',
  PIA23177: 'https://images-assets.nasa.gov/image/PIA23177/PIA23177~medium.jpg',
  'AS11-40-5952': 'https://images-assets.nasa.gov/image/as11-40-5874/as11-40-5874~medium.jpg',
  PIA23201: 'https://images-assets.nasa.gov/image/PIA23201/PIA23201~orig.jpg',
  PIA04591: 'https://images-assets.nasa.gov/image/PIA04591/PIA04591~orig.jpg',
  PIA00405: 'https://images-assets.nasa.gov/image/PIA00405/PIA00405~small.jpg',
  PIA22875: 'https://images-assets.nasa.gov/image/PIA22875/PIA22875~medium.jpg',
  PIA23623: 'https://images-assets.nasa.gov/image/PIA23623/PIA23623~medium.jpg',
  PIA23047: 'https://images-assets.nasa.gov/image/PIA23047/PIA23047~orig.jpg',
  'AS08-14-2383': 'https://images-assets.nasa.gov/image/as08-14-2383/as08-14-2383~medium.jpg',
  PIA24420: 'https://images-assets.nasa.gov/image/PIA24420/PIA24420~medium.jpg',
};

// Real NASA Planetary Global Mosaic Textures
export const PLANETARY_MOSAIC_URLS = {
  marsGlobal: [
    'https://images-assets.nasa.gov/image/PIA04591/PIA04591~orig.jpg',
    'https://images-assets.nasa.gov/image/PIA23201/PIA23201~orig.jpg',
  ],
  moonGlobal: [
    'https://images-assets.nasa.gov/image/PIA00405/PIA00405~small.jpg',
    'https://images-assets.nasa.gov/image/as11-40-5874/as11-40-5874~medium.jpg',
  ],
  corsWebglMoon:
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg',
};

let preloaded = false;

export function preloadCriticalNasaAssets(): void {
  if (preloaded || typeof window === 'undefined') return;
  preloaded = true;

  const urlsToPreload = [
    ...CHAPTER_BACKDROPS.map((b) => b.primaryUrl),
    ...Object.values(DIRECT_NASA_PHOTO_URLS),
    ...PLANETARY_MOSAIC_URLS.marsGlobal,
    ...PLANETARY_MOSAIC_URLS.moonGlobal,
  ];

  const uniqueUrls = Array.from(new Set(urlsToPreload));
  uniqueUrls.forEach((url) => {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
  });
}
