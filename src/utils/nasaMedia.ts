// Verified 4K/8K NASA/JPL InSight (2018-042A) Image Registry with Instant Local & CDN Fallbacks

export interface ChapterBackdropMeta {
  chapterIndex: number;
  piaId: string;
  primaryUrl: string;
  fallbackUrl: string;
  credit: string;
  sourceUrl: string;
  caption: {
    en: string;
    vi: string;
  };
}

export const INSIGHT_MEDIA_ASSETS = {
  PIA22227_LOCAL: '/assets/aistudio/PIA22227_ae4c0612.jpg',
  PIA22227_NASA: 'https://images-assets.nasa.gov/image/PIA22227/PIA22227~orig.jpg',
  PIA19664_NASA:
    'https://assets.science.nasa.gov/content/dam/science/psd/mars/downloadable_items/3/8/38686_Mars-InSight-Solar-Panels-Open-pia196641.jpg',
  PIA17358_LOCAL: '/assets/aistudio/PIA17358_fig1_cb1bbe9d.jpg',
  PIA17358_NASA: 'https://images-assets.nasa.gov/image/PIA17358/PIA17358~orig.jpg',
  PIA19811_LOCAL: '/assets/aistudio/PIA19811_1a033482.jpg',
  PIA19811_NASA: 'https://images-assets.nasa.gov/image/PIA19811/PIA19811~orig.jpg',
  JPL_TOUCHDOWN_LOCAL: '/assets/aistudio/31124964067_d0e24e6e8c_k_a48b32e4.webp',
  PIA26636_LOCAL:
    '/assets/aistudio/e1-pia26636-illustration-cutaway-showing-asteroid-debris-in-mars-mantle_c4336fdb.webp',
  PIA26636_NASA: 'https://images-assets.nasa.gov/image/PIA26636/PIA26636~orig.jpg',
  PIA26635_LOCAL:
    '/assets/aistudio/1-pia26635-illustration-giant-asteroid-impacting-ancient-mars_782be599.webp',
  PIA26635_NASA: 'https://images-assets.nasa.gov/image/PIA26635/PIA26635~orig.jpg',
  PIA22876_ORIG: 'https://images-assets.nasa.gov/image/PIA22876/PIA22876~orig.jpg',
  PIA22876_MED: 'https://images-assets.nasa.gov/image/PIA22876/PIA22876~medium.jpg',
  PIA25287_ORIG: 'https://images-assets.nasa.gov/image/PIA25287/PIA25287~orig.jpg',
  PIA25287_MED: 'https://images-assets.nasa.gov/image/PIA25287/PIA25287~medium.jpg',
  PIA22948_ORIG: 'https://images-assets.nasa.gov/image/PIA22948/PIA22948~orig.jpg',
  PIA23201_ORIG: 'https://images-assets.nasa.gov/image/PIA23201/PIA23201~orig.jpg',
  PIA23623_MED: 'https://images-assets.nasa.gov/image/PIA23623/PIA23623~medium.jpg',
};

// 10-Page Backdrop Registry (100% Dedicated to NASA InSight 2018-042A)
export const CHAPTER_BACKDROPS: ChapterBackdropMeta[] = [
  {
    chapterIndex: 0,
    piaId: 'PIA22227',
    primaryUrl: INSIGHT_MEDIA_ASSETS.PIA22227_LOCAL,
    fallbackUrl: INSIGHT_MEDIA_ASSETS.PIA22227_NASA,
    credit: 'NASA / JPL-Caltech · PIA22227',
    sourceUrl: 'https://science.nasa.gov/mission/insight/',
    caption: {
      en: 'Page 01: InSight Resting on Elysium Planitia Beneath the Martian Sun (PIA22227)',
      vi: 'Trang 01: Trạm đổ bộ InSight yên nghỉ trên đồng bằng Elysium Planitia (PIA22227)',
    },
  },
  {
    chapterIndex: 1,
    piaId: 'PIA19664',
    primaryUrl: INSIGHT_MEDIA_ASSETS.PIA19664_NASA,
    fallbackUrl: INSIGHT_MEDIA_ASSETS.PIA22227_LOCAL,
    credit: 'NASA / JPL-Caltech / Lockheed Martin · PIA19664',
    sourceUrl: 'https://science.nasa.gov/photojournal/the-insight-lander/',
    caption: {
      en: 'Page 02: InSight Stationary Geophysical Lander with Twin Decagonal Solar Wings (PIA19664)',
      vi: 'Trang 02: Trạm địa vật lý cố định InSight với đôi cánh pin mặt trời hình thập giác (PIA19664)',
    },
  },
  {
    chapterIndex: 2,
    piaId: 'JPL-EDL-2018',
    primaryUrl: INSIGHT_MEDIA_ASSETS.JPL_TOUCHDOWN_LOCAL,
    fallbackUrl: INSIGHT_MEDIA_ASSETS.PIA23201_ORIG,
    credit: 'NASA / JPL-Caltech · Touchdown Confirmation (26 Nov 2018)',
    sourceUrl:
      'https://www.nasa.gov/news-release/nasa-insight-lander-arrives-on-martian-surface-to-learn-what-lies-beneath/',
    caption: {
      en: 'Page 03: JPL Mission Control Celebrating InSight’s Safe Touchdown on Mars',
      vi: 'Trang 03: Trung tâm Điều khiển JPL vỡ òa khi InSight hạ cánh thành công xuống Sao Hỏa',
    },
  },
  {
    chapterIndex: 3,
    piaId: 'PIA19811',
    primaryUrl: INSIGHT_MEDIA_ASSETS.PIA19811_LOCAL,
    fallbackUrl: INSIGHT_MEDIA_ASSETS.PIA19811_NASA,
    credit: 'NASA / JPL-Caltech · PIA19811',
    sourceUrl: 'https://science.nasa.gov/mission/insight/science/',
    caption: {
      en: 'Page 04: Three Core Investigations Probing the Martian Subsurface (PIA19811)',
      vi: 'Trang 04: Ba trụ cột khoa học khảo sát lòng đất Sao Hỏa (PIA19811)',
    },
  },
  {
    chapterIndex: 4,
    piaId: 'PIA17358',
    primaryUrl: INSIGHT_MEDIA_ASSETS.PIA17358_LOCAL,
    fallbackUrl: INSIGHT_MEDIA_ASSETS.PIA17358_NASA,
    credit: 'NASA / JPL-Caltech · PIA17358',
    sourceUrl: 'https://science.nasa.gov/mission/insight/science-instruments/',
    caption: {
      en: 'Page 05: Annotated Anatomy of InSight’s 9 Scientific Subsystems (PIA17358)',
      vi: 'Trang 05: Sơ đồ giải phẫu 9 hệ thống thiết bị khoa học của InSight (PIA17358)',
    },
  },
  {
    chapterIndex: 5,
    piaId: 'PIA26636',
    primaryUrl: INSIGHT_MEDIA_ASSETS.PIA26636_LOCAL,
    fallbackUrl: INSIGHT_MEDIA_ASSETS.PIA26636_NASA,
    credit: 'NASA / JPL-Caltech · PIA26636',
    sourceUrl: 'https://science.nasa.gov/mission/insight/science-highlights/',
    caption: {
      en: 'Page 06: Inside the Heart of Mars — Crust, Lumpy Mantle & Molten Core (PIA26636)',
      vi: 'Trang 06: Trái tim Sao Hỏa — Lớp Vỏ, Lớp Phủ lổn nhổn và Lõi Sắt nóng chảy (PIA26636)',
    },
  },
  {
    chapterIndex: 6,
    piaId: 'PIA22948',
    primaryUrl: INSIGHT_MEDIA_ASSETS.PIA22948_ORIG,
    fallbackUrl: INSIGHT_MEDIA_ASSETS.PIA22227_LOCAL,
    credit: 'NASA / JPL-Caltech / CNES · PIA22948',
    sourceUrl: 'https://science.nasa.gov/resource/listen-to-nasas-insight-at-work-on-mars/',
    caption: {
      en: 'Page 07: SEIS Deployed on Elysium Planitia Listening to Martian Wind & Quakes (PIA22948)',
      vi: 'Trang 07: Máy đo địa chấn SEIS lắng nghe gió và nhịp đập Sao Hỏa (PIA22948)',
    },
  },
  {
    chapterIndex: 7,
    piaId: 'PIA26635',
    primaryUrl: INSIGHT_MEDIA_ASSETS.PIA26635_LOCAL,
    fallbackUrl: INSIGHT_MEDIA_ASSETS.PIA26635_NASA,
    credit: 'NASA / JPL-Caltech · PIA26635 & PIA26636',
    sourceUrl:
      'https://www.nasa.gov/missions/insight/nasa-marsquake-data-reveals-lumpy-nature-of-red-planets-interior/',
    caption: {
      en: 'Page 08: Ancient Protoplanet Impacts & 4.5-Billion-Year Mantle Time Capsule (PIA26635)',
      vi: 'Trang 08: Va chạm thiên thạch cổ đại và hộp thời gian 4,5 tỷ năm trong lớp phủ (PIA26635)',
    },
  },
  {
    chapterIndex: 8,
    piaId: 'PIA25287',
    primaryUrl: INSIGHT_MEDIA_ASSETS.PIA25287_MED,
    fallbackUrl: INSIGHT_MEDIA_ASSETS.PIA22876_MED,
    credit: 'NASA / JPL-Caltech · PIA22876 & PIA25287',
    sourceUrl:
      'https://science.nasa.gov/resource/insights-power-generation-after-landing-and-spring-2022/',
    caption: {
      en: 'Page 09: InSight’s Dust-Blanketed Solar Arrays in 2022 — From 5,000 Wh to 500 Wh (PIA25287)',
      vi: 'Trang 09: Cánh pin phủ đầy bụi đỏ năm 2022 — Khi điện năng giảm từ 5.000 Wh xuống 500 Wh (PIA25287)',
    },
  },
  {
    chapterIndex: 9,
    piaId: 'PIA23201',
    primaryUrl: INSIGHT_MEDIA_ASSETS.PIA22227_LOCAL,
    fallbackUrl: INSIGHT_MEDIA_ASSETS.PIA23201_ORIG,
    credit: 'NASA / JPL-Caltech · NSSDCA 2018-042A',
    sourceUrl:
      'https://www.jpl.nasa.gov/news/nasa-retires-insight-mars-lander-mission-after-years-of-science/',
    caption: {
      en: 'Page 10: Abandoned, But Not Forgotten — InSight’s Enduring Legacy on Mars',
      vi: 'Trang 10: Bị bỏ lại nhưng không bị lãng quên — Di sản bất tử của InSight trên Sao Hỏa',
    },
  },
];

// Direct NASA Image URLs for Hardware Cards & Viewers
export const DIRECT_NASA_PHOTO_URLS: Record<string, string> = {
  PIA22227: INSIGHT_MEDIA_ASSETS.PIA22227_LOCAL,
  PIA19664: INSIGHT_MEDIA_ASSETS.PIA19664_NASA,
  PIA17358: INSIGHT_MEDIA_ASSETS.PIA17358_LOCAL,
  PIA19811: INSIGHT_MEDIA_ASSETS.PIA19811_LOCAL,
  PIA26636: INSIGHT_MEDIA_ASSETS.PIA26636_LOCAL,
  PIA26635: INSIGHT_MEDIA_ASSETS.PIA26635_LOCAL,
  JPL_TOUCHDOWN: INSIGHT_MEDIA_ASSETS.JPL_TOUCHDOWN_LOCAL,
  PIA22876: INSIGHT_MEDIA_ASSETS.PIA22876_MED,
  PIA25287: INSIGHT_MEDIA_ASSETS.PIA25287_MED,
  PIA22948: INSIGHT_MEDIA_ASSETS.PIA22948_ORIG,
  PIA23201: INSIGHT_MEDIA_ASSETS.PIA23201_ORIG,
};

let preloaded = false;

export function preloadCriticalNasaAssets(): void {
  if (preloaded || typeof window === 'undefined') return;
  preloaded = true;

  const urlsToPreload = [
    ...CHAPTER_BACKDROPS.map((b) => b.primaryUrl),
    ...Object.values(DIRECT_NASA_PHOTO_URLS),
  ];

  const uniqueUrls = Array.from(new Set(urlsToPreload));
  uniqueUrls.forEach((url) => {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
  });
}
