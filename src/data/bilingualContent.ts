export type Language = 'en' | 'vi';

export interface BilingualText {
  en: string;
  vi: string;
}

export interface InSightSubsystemSpec {
  id:
    | 'solar'
    | 'seis'
    | 'hp3'
    | 'ida'
    | 'cameras'
    | 'rise'
    | 'twins'
    | 'uhf'
    | 'legs_tethers';
  number: string;
  shortLabel: string;
  piaLabel: string;
  title: BilingualText;
  specBadge: BilingualText;
  description: BilingualText;
  engineeringLesson: BilingualText;
  /** 2D percentage coordinates on the official PIA17358 diagram (x%, y%) */
  diagramCoord: { x: number; y: number };
}

export interface JourneyMilestone {
  id: string;
  dateLabel: BilingualText;
  title: BilingualText;
  telemetryBadge: BilingualText;
  story: BilingualText;
  imageUrl: string;
  fallbackUrl: string;
  imageCredit: string;
  sourceUrl: string;
}

export interface DiscoveryCardItem {
  id: string;
  badge: BilingualText;
  title: BilingualText;
  metric: string;
  summary: BilingualText;
  detail: BilingualText;
  imageUrl: string;
  imageCredit: string;
  sourceUrl: string;
}

export interface QuizQuestionItem {
  id: string;
  question: BilingualText;
  options: BilingualText[];
  correctIndex: number;
  explanation: BilingualText;
  sourceLabel: string;
  sourceUrl: string;
}

export interface ScientificSourceItem {
  id: string;
  category: 'NASA Mission Page' | 'JPL News & Discovery' | 'Photojournal & Audio';
  title: string;
  identifier: string;
  url: string;
  summary: BilingualText;
}

export interface JudgeQaItem {
  id: string;
  question: BilingualText;
  answer: BilingualText;
}

export const TEAM_METADATA = {
  projectTitle: 'INSIGHT: THE LAST DIARY FROM MARS',
  umbrellaProjectTitle:
    "ABANDONED BUT NOT FORGOTTEN: NASA's Discarded Equipment on the Moon and Mars",
  challengeName:
    '2026 NASA International Space Apps Challenge · Challenge 01: Abandoned But Not Forgotten',
  teamName: 'NAU EXPLORERS',
  officialTeamId: 'NS01048',
  nssdcaId: '2018-042A',
  institution: 'Nghe An University (Trường Đại học Nghệ An), Vietnam',
  localEvent: 'NASA Space Apps Challenge Hanoi 2026 (14–15 November 2026)',
  targetAudience: {
    en: 'School-age space enthusiasts (ages 10–15) and STEM educators',
    vi: 'Học sinh yêu thích vũ trụ (10–15 tuổi) và giáo viên STEM',
  },
  license: 'Apache License 2.0 (OSI-approved)',
  members: [
    'Nguyễn Hoàng Hà',
    'Nguyễn Đình Mạnh',
    'Nguyễn Bảo Trọng',
    'Phùng Thảo My',
    'Nguyễn Thị Thanh Lan',
  ],
};

export const CHAPTER_TITLES: {
  num: string;
  title: BilingualText;
  subtitle: BilingualText;
  verifyUrl: string;
  verifyLabel: string;
}[] = [
  {
    num: '01',
    title: {
      en: 'The Last Diary',
      vi: 'Nhật Ký Cuối Cùng Từ Sao Hỏa',
    },
    subtitle: {
      en: 'Elysium Planitia (4.502°N, 135.623°E) · NSSDCA 2018-042A',
      vi: 'Đồng bằng Elysium Planitia (4,502°B, 135,623°Đ) · NSSDCA 2018-042A',
    },
    verifyUrl: 'https://science.nasa.gov/mission/insight/',
    verifyLabel: 'science.nasa.gov/mission/insight',
  },
  {
    num: '02',
    title: {
      en: 'Meet InSight',
      vi: 'Làm Quen Với InSight',
    },
    subtitle: {
      en: 'Why I Had No Wheels: Stationary Geophysical Lander vs. Rolling Rover',
      vi: 'Vì sao tôi không có bánh xe: Trạm địa vật lý cố định và Xe tự hành',
    },
    verifyUrl: 'https://science.nasa.gov/photojournal/the-insight-lander/',
    verifyLabel: 'NASA Photojournal PIA19664',
  },
  {
    num: '03',
    title: {
      en: 'The Journey to Mars',
      vi: 'Hành Trình 485 Triệu Km Tới Hành Tinh Đỏ',
    },
    subtitle: {
      en: 'From Vandenberg Liftoff (May 2018) to Touchdown & Final Signal (Dec 2022)',
      vi: 'Từ ngày rời bệ phóng (05/2018) đến lúc hạ cánh và tín hiệu cuối (12/2022)',
    },
    verifyUrl:
      'https://www.nasa.gov/news-release/nasa-insight-lander-arrives-on-martian-surface-to-learn-what-lies-beneath/',
    verifyLabel: 'NASA Touchdown Release',
  },
  {
    num: '04',
    title: {
      en: 'The Mission',
      vi: 'Ba Sứ Mệnh Khám Phá Lòng Đất Đỏ',
    },
    subtitle: {
      en: 'SEIS Seismic Investigation · HP³ Heat Transport · RISE Radio Geodesy',
      vi: 'Địa chấn SEIS · Dòng nhiệt HP³ · Trắc địa vô tuyến RISE',
    },
    verifyUrl: 'https://science.nasa.gov/mission/insight/science/',
    verifyLabel: 'NASA InSight Science Objectives',
  },
  {
    num: '05',
    title: {
      en: 'Inside My Body',
      vi: 'Giải Phẫu Cơ Thể Tôi (3D & Sơ Đồ PIA17358)',
    },
    subtitle: {
      en: '9 Clickable Hardware Subsystems · 3D Rig & Pre-Warmed NASA Eyes Live View',
      vi: '9 Hệ thống thiết bị · Mô hình 3D & NASA Eyes 3D Trực tiếp',
    },
    verifyUrl: 'https://science.nasa.gov/mission/insight/science-instruments/',
    verifyLabel: 'NASA InSight Instruments',
  },
  {
    num: '06',
    title: {
      en: 'The Heart of Mars',
      vi: 'Trái Tim Sao Hỏa: Vỏ – Lớp Phủ – Lõi',
    },
    subtitle: {
      en: 'Interactive Planetary Cutaway · Crust (24–72 km), Mantle (1,550 km) & Liquid Core (1,830 km)',
      vi: 'Mặt cắt hành tinh · Lớp Vỏ (24–72 km), Lớp Phủ (1.550 km) & Lõi Lỏng (1.830 km)',
    },
    verifyUrl: 'https://science.nasa.gov/mission/insight/science-highlights/',
    verifyLabel: 'NASA InSight Science Highlights',
  },
  {
    num: '07',
    title: {
      en: 'Listening to the Planet',
      vi: 'Lắng Nghe Nhịp Đập Của Một Hành Tinh',
    },
    subtitle: {
      en: 'P-Wave vs. S-Wave Core Shadow Simulator & Official NASA JPL Martian Wind Audio',
      vi: 'Mô phỏng sóng P / sóng S qua Lõi Lỏng & Âm thanh gió Sao Hỏa từ NASA JPL',
    },
    verifyUrl: 'https://science.nasa.gov/resource/listen-to-nasas-insight-at-work-on-mars/',
    verifyLabel: 'NASA Audio Archive & JPL Video',
  },
  {
    num: '08',
    title: {
      en: 'The Secrets I Left Behind',
      vi: 'Những Bí Mật Chấn Động Tôi Để Lại',
    },
    subtitle: {
      en: 'August 2025 Lumpy Mantle Breakthrough (PIA26636), 1,319 Quakes & Buried Ice',
      vi: 'Phát hiện Lớp Phủ Lổn Nhổn (8/2025 · PIA26636), 1.319 Trận Động Đất & Băng Ngầm',
    },
    verifyUrl:
      'https://www.nasa.gov/missions/insight/nasa-marsquake-data-reveals-lumpy-nature-of-red-planets-interior/',
    verifyLabel: 'NASA Aug 2025 Mantle Study',
  },
  {
    num: '09',
    title: {
      en: 'When the Lights Went Out',
      vi: 'Khi Ánh Sáng Tắt Dần Dưới Lớp Bụi Đỏ',
    },
    subtitle: {
      en: '2018 vs. 2022 Dust Selfie Scrubber (5,000 Wh → 500 Wh) & Classroom Energy Lab',
      vi: 'So sánh bụi phủ 2018 – 2022 (5.000 Wh → 500 Wh) & Bài toán Quản lý Năng lượng',
    },
    verifyUrl:
      'https://science.nasa.gov/resource/insights-power-generation-after-landing-and-spring-2022/',
    verifyLabel: 'NASA Power & Retirement Log',
  },
  {
    num: '10',
    title: {
      en: 'Abandoned, But Not Forgotten',
      vi: 'Bị Bỏ Lại Nhưng Không Bị Lãng Quên',
    },
    subtitle: {
      en: '3-Question Review, 4D Holographic Mission Badge & Judge Reference Drawer',
      vi: '3 Câu hỏi Ôn tập, Huy hiệu Hologram 4D & Hồ sơ Giám khảo Space Apps',
    },
    verifyUrl:
      'https://www.jpl.nasa.gov/news/nasa-retires-insight-mars-lander-mission-after-years-of-science/',
    verifyLabel: 'JPL Mission Legacy Archive',
  },
];

// PAGE 03: 6 Interactive Mission Milestones
export const JOURNEY_MILESTONES: JourneyMilestone[] = [
  {
    id: 'launch-2018',
    dateLabel: {
      en: '05 May 2018 · Liftoff',
      vi: '05/05/2018 · Rời Bệ Phóng',
    },
    title: {
      en: 'Launch from Vandenberg with Twin MarCO CubeSats',
      vi: 'Khởi hành từ Vandenberg cùng cặp vệ tinh MarCO',
    },
    telemetryBadge: {
      en: 'Atlas V 401 · First Interplanetary Launch from US West Coast',
      vi: 'Atlas V 401 · Chuyến phóng liên hành tinh đầu tiên từ Bờ Tây Hoa Kỳ',
    },
    story: {
      en: 'At 4:05 a.m. PDT, I lifted off through thick California coastal fog aboard an Atlas V rocket. Riding alongside me were MarCO-A and MarCO-B ("WALL-E" and "EVE")—two briefcase-sized CubeSats testing whether miniature spacecraft could relay live landing data across deep space.',
      vi: 'Lúc 4:05 sáng, tôi rời bệ phóng xuyên qua màn sương dày đặc ở bờ biển California trên tên lửa Atlas V. Đồng hành cùng tôi là hai vệ tinh nhỏ cỡ chiếc cặp xách tay MarCO-A và MarCO-B ("WALL-E" và "EVE") làm nhiệm vụ truyền tín hiệu trực tiếp xuyên không gian sâu.',
    },
    imageUrl:
      'https://assets.science.nasa.gov/content/dam/science/psd/mars/downloadable_items/3/8/38686_Mars-InSight-Solar-Panels-Open-pia196641.jpg',
    fallbackUrl: '/assets/aistudio/PIA22227_ae4c0612.jpg',
    imageCredit: 'NASA / JPL-Caltech / Lockheed Martin · PIA19664',
    sourceUrl: 'https://science.nasa.gov/mission/insight/',
  },
  {
    id: 'touchdown-2018',
    dateLabel: {
      en: '26 Nov 2018 · Sol 0 Touchdown',
      vi: '26/11/2018 · Hạ Cánh Sol 0',
    },
    title: {
      en: '485 Million km Cruise & 6.5 Minutes of Fire to Elysium Planitia',
      vi: 'Hành trình 485 triệu km & 6,5 phút nghẹt thở xuống Elysium Planitia',
    },
    telemetryBadge: {
      en: 'Entry Speed: 19,800 km/h (12,300 mph) · Heat Shield: 1,500°C',
      vi: 'Tốc độ vào khí quyển: 19.800 km/h · Lá chắn nhiệt: 1.500°C',
    },
    story: {
      en: 'After cruising 485 million km (300 million miles), I hit the Martian atmosphere at 19,800 km/h. In 6.5 automated minutes, my heat shield withstood 1,500°C, my supersonic parachute deployed, and 12 retrorockets set me gently onto the flat lava plains of Elysium Planitia. Sixteen minutes later, my decagonal solar arrays unfurled while engineers cheered in JPL Mission Control.',
      vi: 'Sau chặng đường 485 triệu km, tôi lao vào khí quyển Sao Hỏa ở vận tốc 19.800 km/h. Trong 6,5 phút hoàn toàn tự động, lá chắn nhiệt chịu đựng mức nhiệt 1.500°C, dù siêu thanh bung mở và 12 động cơ phản lực đưa tôi chạm đất êm ái tại đồng bằng Elysium Planitia trong tiếng reo hò vỡ òa tại phòng điều khiển JPL.',
    },
    imageUrl: '/assets/aistudio/31124964067_d0e24e6e8c_k_a48b32e4.webp',
    fallbackUrl: '/assets/aistudio/PIA22227_ae4c0612.jpg',
    imageCredit: 'NASA / JPL-Caltech · Mission Control Celebration (26 Nov 2018)',
    sourceUrl:
      'https://www.nasa.gov/news-release/nasa-insight-lander-arrives-on-martian-surface-to-learn-what-lies-beneath/',
  },
  {
    id: 'seis-deployed-2018',
    dateLabel: {
      en: '19 Dec 2018 · Sol 22',
      vi: '19/12/2018 · Sol 22',
    },
    title: {
      en: 'First Seismometer Ever Placed Directly on Another Planet’s Soil',
      vi: 'Máy đo địa chấn đầu tiên được đặt trực tiếp lên mặt đất hành tinh khác',
    },
    telemetryBadge: {
      en: 'Reach: 1.636 m from Deck · WTS Dome Lowered 02 Feb 2019 (Sol 66)',
      vi: 'Khoảng cách: 1,636 m từ thân trạm · Úp vòm chắn gió ngày 02/02/2019',
    },
    story: {
      en: 'Using my 1.8-meter robotic arm and five-fingered grapple, I lifted the copper-clad SEIS seismometer off my deck and set it directly onto Martian soil 1.636 meters away. On Sol 66, I lowered the white-and-gold Wind and Thermal Shield over SEIS to block wind noise and 90°C daily temperature swings.',
      vi: 'Bằng cánh tay robot dài 1,8 mét và móc gắp 5 ngón, tôi nhấc máy đo địa chấn SEIS ra khỏi boong tàu và đặt trực tiếp xuống đất đỏ cách thân trạm 1,636 mét. Đến ngày Sol 66, tôi chụp lồng chắn gió và nhiệt (WTS) lên trên để cách âm và chống chọi biên độ nhiệt 90°C mỗi ngày.',
    },
    imageUrl: 'https://images-assets.nasa.gov/image/PIA22948/PIA22948~orig.jpg',
    fallbackUrl: '/assets/aistudio/PIA17358_fig1_cb1bbe9d.jpg',
    imageCredit: 'NASA / JPL-Caltech / CNES · PIA22948',
    sourceUrl: 'https://science.nasa.gov/mission/insight/science-instruments/',
  },
  {
    id: 'first-quake-2019',
    dateLabel: {
      en: '06 Apr 2019 · Sol 128',
      vi: '06/04/2019 · Sol 128',
    },
    title: {
      en: 'First Confirmed Marsquake: Birth of Martian Seismology',
      vi: 'Trận động đất Sao Hỏa đầu tiên được ghi nhận',
    },
    telemetryBadge: {
      en: 'Sol 128 Event · Followed by 1,318 More Marsquakes',
      vi: 'Sự kiện Sol 128 · Mở đầu cho tổng cộng 1.319 trận động đất Sao Hỏa',
    },
    story: {
      en: 'On Martian Sol 128, SEIS detected a faint, unmistakable trembling from deep inside the planet—humanity’s first confirmed marsquake. Over the next three and a half years, I recorded 1,319 quakes, including a magnitude 4.7 monster on May 4, 2022 (Sol 1222).',
      vi: 'Vào ngày Sol 128, SEIS bắt được một rung chấn nhỏ nhưng vô cùng rõ ràng vọng lên từ lòng hành tinh—trận động đất Sao Hỏa đầu tiên được xác nhận. Trong hơn 3 năm tiếp theo, tôi ghi nhận tổng cộng 1.319 trận động đất, bao gồm chấn động mạnh tới 4,7 độ vào ngày 04/05/2022.',
    },
    imageUrl:
      '/assets/aistudio/e1-pia26636-illustration-cutaway-showing-asteroid-debris-in-mars-mantle_c4336fdb.webp',
    fallbackUrl: '/assets/aistudio/PIA19811_1a033482.jpg',
    imageCredit: 'NASA / JPL-Caltech · PIA26636',
    sourceUrl: 'https://science.nasa.gov/resource/listen-to-nasas-insight-at-work-on-mars/',
  },
  {
    id: 'final-contact-2022',
    dateLabel: {
      en: '15 Dec 2022 · Sol 1440',
      vi: '15/12/2022 · Sol 1440',
    },
    title: {
      en: 'Final Radio Transmission Beneath a Blanket of Red Dust',
      vi: 'Tín hiệu vô tuyến cuối cùng dưới lớp bụi sắt đỏ',
    },
    telemetryBadge: {
      en: 'Power Drop: ~5,000 Wh/sol (2018) → ~500 Wh/sol (2022)',
      vi: 'Điện năng suy giảm: ~5.000 Wh/sol (2018) → ~500 Wh/sol (2022)',
    },
    story: {
      en: 'Fine iron-oxide dust gradually veiled my twin solar wings, cutting daily electricity by 90%. Engineers prioritized SEIS over survival heaters to capture every last quake until my batteries finally drained. I sent my last signal home on December 15, 2022.',
      vi: 'Bụi oxit sắt mịn phủ dày lên hai cánh pin mặt trời khiến sản lượng điện giảm tới 90%. Các kỹ sư đã quyết định tắt bộ sưởi bảo vệ để ưu tiên từng giọt điện cuối cùng cho máy địa chấn SEIS. Tôi gửi tín hiệu cuối cùng về Trái Đất vào ngày 15/12/2022.',
    },
    imageUrl: 'https://images-assets.nasa.gov/image/PIA25287/PIA25287~medium.jpg',
    fallbackUrl: 'https://images-assets.nasa.gov/image/PIA22876/PIA22876~medium.jpg',
    imageCredit: 'NASA / JPL-Caltech · PIA25287 (Final Selfie)',
    sourceUrl:
      'https://science.nasa.gov/resource/insights-power-generation-after-landing-and-spring-2022/',
  },
  {
    id: 'mission-concluded-2022',
    dateLabel: {
      en: '21 Dec 2022 & Aug 2025 Breakthrough',
      vi: '21/12/2022 & Phát hiện Tháng 8/2025',
    },
    title: {
      en: 'Mission Concluded — Yet My Archive StillMakes Discoveries',
      vi: 'Sứ mệnh khép lại — Nhưng kho dữ liệu vẫn tiếp tục lên tiếng',
    },
    telemetryBadge: {
      en: '4 Years, 25 Days Active · Aug 2025 Science Mantle Study',
      vi: '4 Năm, 25 Ngày Hoạt động · Công bố Khoa học Tháng 8/2025',
    },
    story: {
      en: 'After two missed communication passes, NASA officially concluded my mission on December 21, 2022. Yet my open-access seismic archive continues to rewrite textbooks—including the August 2025 discovery that Mars’ mantle preserves 4.5-billion-year-old protoplanet impact fragments.',
      vi: 'Sau hai phiên liên lạc không hồi đáp, NASA chính thức khép lại sứ mệnh vào ngày 21/12/2022. Thế nhưng kho dữ liệu địa chấn mở của tôi vẫn liên tục tạo nên đột phá—tiêu biểu là phát hiện tháng 8/2025 về những mảnh vỡ hành tinh nguyên thủy 4,5 tỷ năm tuổi nằm sâu trong lớp phủ Sao Hỏa.',
    },
    imageUrl:
      '/assets/aistudio/1-pia26635-illustration-giant-asteroid-impacting-ancient-mars_782be599.webp',
    fallbackUrl: '/assets/aistudio/PIA22227_ae4c0612.jpg',
    imageCredit: 'NASA / JPL-Caltech · PIA26635',
    sourceUrl:
      'https://www.jpl.nasa.gov/news/nasa-retires-insight-mars-lander-mission-after-years-of-science/',
  },
];

// PAGE 05: 9 Clickable Hardware Subsystems matching NASA diagram PIA17358
export const INSIGHT_SUBSYSTEMS_9: InSightSubsystemSpec[] = [
  {
    id: 'solar',
    number: '01',
    shortLabel: 'SOLAR ARRAYS',
    piaLabel: 'UltraFlex Solar Wings (2x)',
    title: {
      en: 'UltraFlex Decagonal Solar Arrays (2x Wings)',
      vi: 'Hai Cánh Pin Mặt Trời Hình Thập Giác UltraFlex',
    },
    specBadge: {
      en: 'Diameter: 2.15 m each · Total Span: 6.0 m · Peak Output: ~5,000 Wh/sol',
      vi: 'Đường kính: 2,15 m mỗi cánh · Sải rộng: 6,0 m · Công suất đỉnh: ~5.000 Wh/sol',
    },
    description: {
      en: 'Unfolded like vintage paper fans 16 minutes after touchdown. Because Mars receives less than half the sunlight Earth gets, these wide decagonal wings powered every instrument until red iron-oxide dust reduced output by 90% in 2022.',
      vi: 'Bung mở như hai chiếc quạt giấy 16 phút sau khi chạm đất. Do ánh nắng tại Sao Hỏa yếu hơn một nửa so với Trái Đất, đôi cánh rộng này cung cấp toàn bộ năng lượng cho trạm cho đến khi bụi đỏ làm giảm 90% công suất vào năm 2022.',
    },
    engineeringLesson: {
      en: 'Dust-clearing attempts using the robotic arm to trickle sand into the wind temporarily boosted energy by ~30 Wh/sol in 2021.',
      vi: 'Năm 2021, các kỹ sư đã dùng cánh tay robot rải cát theo chiều gió để cuốn bớt bụi mịn, giúp hồi phục khoảng 30 Wh điện mỗi ngày.',
    },
    diagramCoord: { x: 22, y: 25 },
  },
  {
    id: 'seis',
    number: '02',
    shortLabel: 'SEIS & WTS',
    piaLabel: 'WTS / SEIS',
    title: {
      en: 'SEIS Seismometer & Wind and Thermal Shield (WTS)',
      vi: 'Máy Đo Địa Chấn SEIS & Lồng Chắn Gió Nhiệt (WTS)',
    },
    specBadge: {
      en: 'Mass: 29 kg · Sensitivity: <10⁻¹⁰ m/s² (Smaller than a Hydrogen Atom)',
      vi: 'Khối lượng: 29 kg · Độ nhạy: <10⁻¹⁰ m/s² (Nhỏ hơn kích thước nguyên tử Hydro)',
    },
    description: {
      en: 'Built by CNES (France) with JPL and European partners, SEIS houses three ultra-sensitive vacuum pendulum sensors inside a copper-colored thermal blanket, covered by the white-and-gold WTS aerodynamic dome and chainmail skirt.',
      vi: 'Do CNES (Pháp) chế tạo cùng NASA/JPL, SEIS chứa 3 con lắc chân không siêu nhạy bên trong lớp vỏ cách nhiệt màu đồng, được bảo vệ bởi vòm khí động học WTS màu trắng-vàng và chân váy kim loại ôm sát mặt đất.',
    },
    engineeringLesson: {
      en: 'Placing SEIS directly on the soil and shielding it with WTS reduced thermal & wind noise by 100x, unlocking 1,319 marsquake detections.',
      vi: 'Đặt SEIS trực tiếp xuống đất và chụp vòm WTS giúp giảm nhiễu gió và nhiệt độ tới 100 lần, cho phép phát hiện 1.319 trận động đất Sao Hỏa.',
    },
    diagramCoord: { x: 70, y: 37 },
  },
  {
    id: 'hp3',
    number: '03',
    shortLabel: 'HP³ MOLE',
    piaLabel: 'HP³ / Heat Flow Probe',
    title: {
      en: 'HP³ ("The Mole") Heat Flow and Physical Properties Package',
      vi: 'Mũi Khoan Nhiệt Lượng HP³ ("Chuột Chũi")',
    },
    specBadge: {
      en: 'Target Depth: 5 m · Reached Depth: ~40 cm · Built by DLR (Germany)',
      vi: 'Độ sâu mục tiêu: 5 m · Độ sâu đạt được: ~40 cm · Chế tạo bởi DLR (Đức)',
    },
    description: {
      en: 'A self-hammering 40-cm mechanical spike designed to burrow 5 meters underground trailing a temperature-sensor ribbon to measure heat escaping from Mars’ interior.',
      vi: 'Mũi đục cơ học tự búa dài 40 cm được thiết kế để đào sâu 5 mét xuống lòng đất, kéo theo dây cáp gắn cảm biến nhiệt nhằm đo dòng nhiệt thoát ra từ tâm Sao Hỏa.',
    },
    engineeringLesson: {
      en: 'Elysium Planitia had a cement-like duricrust layer that lacked loose sand friction. Pushing the Mole with the robotic arm scoop finally buried it to ~40 cm—teaching vital soil-mechanics lessons for future astronauts.',
      vi: 'Đất tại Elysium Planitia kết dính như vỏ cứng (duricrust) thay vì cát rời tạo ma sát. Các kỹ sư đã dùng gàu của cánh tay robot ép phụ trợ giúp mũi khoan lún xuống ~40 cm—để lại bài học cơ học đất vô giá cho tương lai.',
    },
    diagramCoord: { x: 30, y: 47 },
  },
  {
    id: 'ida',
    number: '04',
    shortLabel: 'IDA & GRAPPLE',
    piaLabel: 'IDA & GRAPPLE',
    title: {
      en: 'Instrument Deployment Arm (IDA) & Five-Fingered Grapple',
      vi: 'Cánh Tay Robot (IDA) & Móc Gắp 5 Ngón Cơ Học',
    },
    specBadge: {
      en: 'Reach: 1.8 meters · 4 Shoulder/Elbow/Wrist Motors · Wax-Actuated Grapple',
      vi: 'Tầm với: 1,8 mét · 4 Động cơ khớp vai/khuỷu/cổ tay · Móc gắp giãn nở sáp nhiệt',
    },
    description: {
      en: 'A 1.8-meter titanium-and-composite robotic crane with a small scoop and a five-fingered grapple suspended on a cable to lift SEIS, WTS, and HP³ off the deck onto Martian soil.',
      vi: 'Cần cẩu robot dài 1,8 mét tích hợp gàu xúc nhỏ và móc gắp 5 ngón treo trên dây cáp, có nhiệm vụ nhấc SEIS, lồng chắn WTS và mũi khoan HP³ đặt xuống nền đất Sao Hỏa.',
    },
    engineeringLesson: {
      en: 'Beyond deploying instruments, the arm acted as an improvised repair tool—pushing the HP³ Mole and pouring sand to clean the solar panels.',
      vi: 'Không chỉ hạ đặt thiết bị, cánh tay robot còn trở thành công cụ ứng cứu linh hoạt—từ việc ép mũi khoan HP³ cho tới rải cát làm sạch pin mặt trời.',
    },
    diagramCoord: { x: 40, y: 17 },
  },
  {
    id: 'cameras',
    number: '05',
    shortLabel: 'IDC & ICC',
    piaLabel: 'IDC & ICC Cameras',
    title: {
      en: 'Instrument Deployment Camera (IDC) & Context Camera (ICC)',
      vi: 'Camera Cánh Tay (IDC) & Camera Toàn Cảnh Góc Rộng (ICC)',
    },
    specBadge: {
      en: 'IDC: 45° FOV Color on Elbow · ICC: 124° Fisheye Under Deck Edge',
      vi: 'IDC: Góc nhìn 45° gắn trên khuỷu tay · ICC: Góc siêu rộng 124° dưới mép boong',
    },
    description: {
      en: 'The elbow-mounted IDC captured high-resolution 3D stereo mosaics of the workspace and stitched 11 frames together to take InSight’s famous 2018 and 2022 selfies, while the chest-mounted ICC provided wide-angle views.',
      vi: 'Camera IDC gắn trên khuỷu tay chụp ảnh lập thể 3D mặt đất và ghép 11 khung hình tạo nên bức ảnh selfie lịch sử năm 2018 và 2022, trong khi camera ICC dưới gầm boong quan sát toàn cảnh 124°.',
    },
    engineeringLesson: {
      en: 'Stereo image pairs allowed JPL engineers to build millimeter-accurate 3D terrain meshes in California before lowering SEIS onto Mars.',
      vi: 'Cặp ảnh lập thể giúp kỹ sư JPL dựng mô hình mặt đất 3D chính xác tới từng milimét tại California trước khi hạ đặt SEIS.',
    },
    diagramCoord: { x: 42, y: 24 },
  },
  {
    id: 'rise',
    number: '06',
    shortLabel: 'RISE HORNS',
    piaLabel: 'RISE ANTENNA',
    title: {
      en: 'RISE Rotation and Interior Structure Experiment (X-Band Horns)',
      vi: 'Ăng-ten Sừng X-Band Thí Nghiệm Trắc Địa RISE',
    },
    specBadge: {
      en: 'X-Band Doppler Tracking · Precision: <2 cm Across 300 Million km',
      vi: 'Đo hiệu ứng Doppler băng tần X · Độ chính xác: <2 cm từ khoảng cách 300 triệu km',
    },
    description: {
      en: 'Two medium-gain horn antennas on the lander deck bounced X-band radio signals directly back to NASA’s Deep Space Network dishes on Earth to measure tiny wobbles (nutation) in Mars’ spin axis.',
      vi: 'Hai ăng-ten hình sừng trên mặt boong phản xạ trực tiếp sóng vô tuyến băng tần X về mạng lưới ăng-ten Không gian Sâu (DSN) tại Trái Đất để đo độ chao đảo cực nhỏ của trục quay Sao Hỏa.',
    },
    engineeringLesson: {
      en: 'RISE proved Mars’ core sloshes as it spins—confirming an ~1,830-km-radius molten liquid iron-alloy core!',
      vi: 'RISE chứng minh lõi Sao Hỏa sóng sánh khi hành tinh tự quay—xác nhận độc lập lõi hợp kim sắt lỏng có bán kính ~1.830 km!',
    },
    diagramCoord: { x: 60, y: 22 },
  },
  {
    id: 'twins',
    number: '07',
    shortLabel: 'TWINS & APSS',
    piaLabel: 'TWINS & PRESSURE INLET',
    title: {
      en: 'TWINS Weather Booms & APSS Pressure/Magnetic Sensors',
      vi: 'Cần Khí Tượng TWINS, Cảm Biến Áp Suất APSS & Từ Kế',
    },
    specBadge: {
      en: 'Continuous Wind, Temperature, Barometric Pressure & Magnetic Field Log',
      vi: 'Đo liên tục Gió, Nhiệt độ, Áp suất khí quyển & Từ trường vỏ Sao Hỏa',
    },
    description: {
      en: 'Two white mast booms facing opposite directions measured wind speed and air temperature, while the silver dome Pressure Inlet in the center of the deck detected passing dust devils and infrasound waves.',
      vi: 'Hai cần khí tượng màu trắng hướng ngược chiều nhau đo tốc độ gió và nhiệt độ, kết hợp cùng cổng thu áp suất ở giữa mặt boong giúp phát hiện hàng ngàn cơn lốc bụi và sóng hạ âm.',
    },
    engineeringLesson: {
      en: 'Because wind gusts shake the ground, APSS allowed scientists to separate real underground marsquakes from surface wind vibrations.',
      vi: 'Nhờ đo chính xác từng cơn gió giật và lốc bụi, APSS giúp các nhà khoa học phân biệt rõ đâu là rung chấn gió bề mặt, đâu là động đất thật từ lòng hành tinh.',
    },
    diagramCoord: { x: 52, y: 21 },
  },
  {
    id: 'uhf',
    number: '08',
    shortLabel: 'UHF ANTENNA',
    piaLabel: 'UHF ANTENNA',
    title: {
      en: 'UHF Helical Relay Antenna (Orbiter Data Link)',
      vi: 'Ăng-ten Xoắn UHF Truyền Dữ Liệu Qua Tàu Quỹ Đạo',
    },
    specBadge: {
      en: 'Relayed via Mars Reconnaissance Orbiter & MAVEN to NASA DSN',
      vi: 'Truyền tiếp sức qua tàu quỹ đạo MRO & MAVEN về Trái Đất',
    },
    description: {
      en: 'The cylindrical drum-like UHF antenna on the upper deck beamed gigabytes of daily seismic waveforms and photographs up to NASA’s Mars Reconnaissance Orbiter and ESA’s Trace Gas Orbiter passing overhead.',
      vi: 'Ăng-ten hình trụ tròn trên mặt boong phát toàn bộ dữ liệu địa chấn và hình ảnh lên các tàu quỹ đạo bay ngang bầu trời Sao Hỏa để chuyển tiếp tốc độ cao về Trái Đất.',
    },
    engineeringLesson: {
      en: 'Even though InSight’s radio went silent on Dec 15, 2022, every megabyte transmitted by the UHF antenna is preserved forever in NASA’s Planetary Data System.',
      vi: 'Dù ăng-ten này đã ngừng phát sóng từ ngày 15/12/2022, toàn bộ kho dữ liệu nó gửi về đã được lưu trữ vĩnh viễn cho nhân loại.',
    },
    diagramCoord: { x: 58, y: 25 },
  },
  {
    id: 'legs_tethers',
    number: '09',
    shortLabel: 'LEGS & TETHERS',
    piaLabel: 'TETHERS & LANDING LEGS',
    title: {
      en: 'Flat-Ribbon Science Tethers & Shock-Absorbing Landing Legs',
      vi: 'Dây Cáp Dẹt Tethers & Ba Chân Đáp Hấp Thụ Xung Lực',
    },
    specBadge: {
      en: '3 Crushable-Honeycomb Titanium Legs · Multi-Line Kapton Science Tethers',
      vi: '3 Chân đáp lõi tổ ong hấp thụ lực · Dây cáp truyền dữ liệu Kapton dẹt',
    },
    description: {
      en: 'Three telescoping legs with circular titanium footpads anchored InSight motionless in the regolith, while golden flat-ribbon tethers connected SEIS and HP³ back to the lander’s electronics box.',
      vi: 'Ba chân đáp bằng titan gắn đệm tròn giúp InSight bám chặt bất động trên nền đất, trong khi hai dải cáp dẹt màu vàng óng kết nối SEIS và HP³ với bộ xử lý trung tâm trên boong tàu.',
    },
    engineeringLesson: {
      en: 'Why no wheels? Wheels and motors creak when temperatures shift. Three rigid legs gave SEIS a rock-steady acoustic anchor.',
      vi: 'Vì sao không dùng bánh xe? Khớp bánh xe co giãn vì nhiệt sẽ gây tiếng động giả. Ba chân đáp cố định giúp tạo điểm tựa tĩnh lặng tuyệt đối cho máy địa chấn.',
    },
    diagramCoord: { x: 51, y: 36 },
  },
];

// PAGE 06: 3 Interior Layers of Mars
export interface MartianLayerSpec {
  id: 'crust' | 'mantle' | 'core';
  name: BilingualText;
  depthRange: BilingualText;
  temperature: BilingualText;
  composition: BilingualText;
  summary: BilingualText;
  seismicProof: BilingualText;
}

export const MARTIAN_INTERIOR_LAYERS: MartianLayerSpec[] = [
  {
    id: 'crust',
    name: {
      en: '1. The Crust (Lớp Vỏ Sao Hỏa)',
      vi: '1. Lớp Vỏ Hành Tinh (The Crust)',
    },
    depthRange: {
      en: 'Thickness: ~24 to 72 km (15–45 miles) · 3 Sub-layers at Elysium Planitia',
      vi: 'Độ dày: ~24 đến 72 km · Gồm 3 tầng phụ bên dưới Elysium Planitia',
    },
    temperature: {
      en: 'Surface: -20°C to -100°C · Base of Crust: ~250°C',
      vi: 'Bề mặt: -20°C đến -100°C · Đáy lớp vỏ: ~250°C',
    },
    composition: {
      en: 'Fractured basaltic volcanic rock, heavily cratered, dry upper regolith & magnetized ancient minerals.',
      vi: 'Đá núi lửa bazan nứt nẻ, nhiều hố va chạm, phủ bụi regolith khô và lưu giữ từ trường cổ đại.',
    },
    summary: {
      en: 'Unlike Earth, Mars does not have moving tectonic plates that recycle its crust. Its single stagnant lid acts as a geological roof preserving 4.5 billion years of solar system history.',
      vi: 'Không giống Trái Đất có các mảng kiến tạo liên tục tái tạo vỏ, Sao Hỏa có một lớp vỏ liền khối đóng vai trò như "mái vòm thời gian" bảo tồn lịch sử 4,5 tỷ năm.',
    },
    seismicProof: {
      en: 'Reflected P and S seismic waves directly beneath InSight revealed three distinct crustal layers extending ~39 km deep at the landing site.',
      vi: 'Sóng phản xạ P và S ngay bên dưới chân InSight cho thấy 3 tầng địa chất rõ rệt kéo dài tới độ sâu ~39 km tại vị trí đổ bộ.',
    },
  },
  {
    id: 'mantle',
    name: {
      en: '2. The "Lumpy" Mantle (Lớp Phủ Lổn Nhổn)',
      vi: '2. Lớp Phủ "Lổn Nhổn" (The Mantle)',
    },
    depthRange: {
      en: 'Thickness: ~1,550 km (960 miles) beneath the crust',
      vi: 'Độ dày: ~1.550 km nằm ngay dưới lớp vỏ',
    },
    temperature: {
      en: 'Up to ~1,500°C (2,732°F) · Sluggish thermal convection',
      vi: 'Lên tới ~1.500°C (2.732°F) · Đối lưu nhiệt rất chậm',
    },
    composition: {
      en: 'Solid silicate rock embedded with preserved ancient impact fragments up to 4 km wide (Aug 2025 discovery).',
      vi: 'Đá silicat rắn chứa hàng loạt khối mảnh vỡ thiên thạch cổ đại rộng tới 4 km (phát hiện tháng 8/2025).',
    },
    summary: {
      en: 'In August 2025, scientists analyzing InSight’s high-frequency marsquakes discovered that Mars’ mantle is not smooth like a mixed smoothie—it is a "lumpy" rocky brownie preserving primordial protoplanet debris from 4.5 billion years ago!',
      vi: 'Tháng 8/2025, phân tích sóng địa chấn tần số cao của InSight tiết lộ lớp phủ Sao Hỏa không đồng nhất mà "lổn nhổn" những khối đá cổ đại từ các vụ va chạm cách đây 4,5 tỷ năm!',
    },
    seismicProof: {
      en: 'High-frequency seismic waves from 8 marsquakes slowed down and scattered as they passed through 1-to-4-km compositional lumps deep in the mantle.',
      vi: 'Sóng địa chấn tần số cao từ 8 trận động đất bị chậm lại và tán xạ khi đi qua các khối dị thường rộng 1–4 km nằm sâu trong lớp phủ.',
    },
  },
  {
    id: 'core',
    name: {
      en: '3. The Molten Core (Lõi Sắt Nóng Chảy)',
      vi: '3. Lõi Hợp Kim Sắt Nóng Chảy (The Core)',
    },
    depthRange: {
      en: 'Radius: ~1,830 km (1,140 miles) — Larger & less dense than pre-mission models',
      vi: 'Bán kính: ~1.830 km — Lớn hơn và nhẹ hơn các mô hình dự đoán trước đây',
    },
    temperature: {
      en: '~1,800°C to 2,000°C · Fully molten liquid alloy',
      vi: '~1.800°C đến 2.000°C · Hợp kim lỏng hoàn toàn',
    },
    composition: {
      en: 'Liquid iron and nickel enriched with lighter elements: sulfur, carbon, oxygen, and hydrogen.',
      vi: 'Sắt và niken nóng chảy pha trộn tỷ lệ lớn các nguyên tố nhẹ: lưu huỳnh, cacbon, oxy và hydro.',
    },
    summary: {
      en: 'Mars’ core occupies more than half the planet’s radius! Because it is rich in lighter elements, its melting point stays low enough that the core remains completely liquid today.',
      vi: 'Lõi Sao Hỏa chiếm hơn một nửa bán kính hành tinh! Do chứa nhiều nguyên tố nhẹ, nhiệt độ nóng chảy giảm xuống giúp toàn bộ lõi vẫn ở trạng thái lỏng cho tới ngày nay.',
    },
    seismicProof: {
      en: 'Secondary (S) shear waves cannot travel through liquids—creating an S-wave "shadow zone" that allowed SEIS and RISE to measure the 1,830 km liquid core.',
      vi: 'Sóng ngang (sóng S) không thể truyền qua chất lỏng—tạo ra "vùng tối địa chấn" giúp SEIS và RISE đo chính xác bán kính lõi lỏng 1.830 km.',
    },
  },
];

// PAGE 08: 4 Major Scientific Discoveries
export const INSIGHT_DISCOVERIES_4: DiscoveryCardItem[] = [
  {
    id: 'lumpy-mantle-2025',
    badge: {
      en: 'Discovery 01 · Aug 2025 Science Study',
      vi: 'Khám phá 01 · Nghiên cứu Science 08/2025',
    },
    title: {
      en: 'The "Lumpy" Mantle Time Capsule (4.5-Billion-Year Impact Debris)',
      vi: 'Hộp Thời Gian Trong Lớp Phủ "Lổn Nhổn" (Mảnh Vỡ 4,5 Tỷ Năm)',
    },
    metric: '4 km Mantle Fragments',
    summary: {
      en: 'High-frequency marsquake waves revealed giant chunks of ancient impact debris preserved inside Mars’ stagnant mantle for 4.5 billion years.',
      vi: 'Sóng địa chấn tần số cao phát hiện những khối mảnh vỡ khổng lồ rộng tới 4 km từ thuở sơ khai Hệ Mặt Trời nằm nguyên vẹn trong lớp phủ.',
    },
    detail: {
      en: 'When Mars was under 100 million years old, Mars-sized protoplanets slammed into it, melting vast magma oceans and injecting crust and impactor fragments deep underground. Because Mars lacks plate tectonics, those lumps never stirred away!',
      vi: 'Khi Sao Hỏa mới hình thành chưa đầy 100 triệu năm, các thiên thể lớn va vào hành tinh tạo nên biển dung nham và đẩy các mảnh vỡ xuống sâu. Vì không có kiến tạo mảng, các khối đá này vẫn còn nguyên sau 4,5 tỷ năm!',
    },
    imageUrl:
      '/assets/aistudio/e1-pia26636-illustration-cutaway-showing-asteroid-debris-in-mars-mantle_c4336fdb.webp',
    imageCredit: 'NASA / JPL-Caltech · PIA26636',
    sourceUrl:
      'https://www.nasa.gov/missions/insight/nasa-marsquake-data-reveals-lumpy-nature-of-red-planets-interior/',
  },
  {
    id: 'cerberus-fossae-quakes',
    badge: {
      en: 'Discovery 02 · Planetary Seismology',
      vi: 'Khám phá 02 · Địa chấn học Hành tinh',
    },
    title: {
      en: '1,319 Marsquakes & Active Faults at Cerberus Fossae',
      vi: '1.319 Trận Động Đất & Đứt Gãy Hoạt Động Cerberus Fossae',
    },
    metric: '1,319 Quakes · Max Mag 4.7',
    summary: {
      en: 'InSight proved Mars is seismically active today, with deep volcanic dikes and cooling faults cracking the crust at Cerberus Fossae.',
      vi: 'InSight chứng minh Sao Hỏa vẫn đang sống động về mặt địa chất, với hàng loạt trận động đất phát sinh từ vùng đứt gãy Cerberus Fossae.',
    },
    detail: {
      en: 'On May 4, 2022 (Sol 1222), SEIS recorded a magnitude 4.7 marsquake that reverberated through the planet for over 6 hours—the strongest seismic event ever recorded on another planet.',
      vi: 'Ngày 04/05/2022 (Sol 1222), SEIS ghi nhận trận động đất mạnh 4,7 độ làm rung chuyển toàn bộ Sao Hỏa suốt hơn 6 giờ đồng hồ—chấn động mạnh nhất từng được ghi lại ngoài Trái Đất.',
    },
    imageUrl: 'https://images-assets.nasa.gov/image/PIA23623/PIA23623~medium.jpg',
    imageCredit: 'NASA / JPL-Caltech / U. Arizona · PIA23623',
    sourceUrl: 'https://science.nasa.gov/mission/insight/science-highlights/',
  },
  {
    id: 'meteorite-water-ice',
    badge: {
      en: 'Discovery 03 · Acoustic Impact Locating',
      vi: 'Khám phá 03 · Định vị Va chạm Thiên thạch',
    },
    title: {
      en: 'Fresh Meteorite Impacts Excavating Subsurface Water Ice',
      vi: 'Thiên Thạch Va Chạm Làm Lộ Ra Các Khối Băng Nước Ngầm',
    },
    metric: '150-m New Craters',
    summary: {
      en: 'SEIS heard the acoustic boom and ground shaking of meteoroids striking Mars, guiding orbiters to newly blasted craters ringed by bright water ice.',
      vi: 'SEIS lắng nghe cả sóng âm khí quyển lẫn rung chấn đất khi thiên thạch lao xuống, chỉ đường cho tàu quỹ đạo chụp được các hố va chạm mới lộ ra băng trắng.',
    },
    detail: {
      en: 'On Dec 24, 2021, a meteoroid excavated a 150-meter crater in Amazonis Planitia, throwing boulder-sized blocks of buried water ice onto the surface closer to the equator than ever seen before.',
      vi: 'Ngày 24/12/2021, một thiên thạch tạo ra hố sâu rộng 150 mét tại Amazonis Planitia, hất tung những tảng băng nước ngầm lên bề mặt ở vĩ độ gần xích đạo nhất từng được phát hiện.',
    },
    imageUrl:
      '/assets/aistudio/1-pia26635-illustration-giant-asteroid-impacting-ancient-mars_782be599.webp',
    imageCredit: 'NASA / JPL-Caltech · PIA26635',
    sourceUrl: 'https://science.nasa.gov/mission/insight/science-highlights/',
  },
  {
    id: 'magnetic-crust-ghosts',
    badge: {
      en: 'Discovery 04 · Ancient Planetary Dynamo',
      vi: 'Khám phá 04 · Từ trường Cổ đại',
    },
    title: {
      en: 'Crustal Magnetism 10× Stronger Than Orbiters Predicted',
      vi: 'Từ Trường Vỏ Mạnh Gấp 10 Lần Dự Đoán Từ Vệ Tinh',
    },
    metric: '10× Stronger Local Field',
    summary: {
      en: 'InSight’s first surface magnetometer on Mars found ancient magnetized rocks deep beneath Elysium Planitia—evidence of a powerful early global magnetic shield.',
      vi: 'Từ kế mặt đất đầu tiên trên Sao Hỏa phát hiện các tầng đá cổ bên dưới Elysium Planitia nhiễm từ mạnh gấp 10 lần ảnh đo từ quỹ đạo.',
    },
    detail: {
      en: 'Billions of years ago, Mars’ molten core generated a global magnetic field similar to Earth’s that protected its early atmosphere and liquid surface water before the dynamo shut down.',
      vi: 'Hàng tỷ năm trước, lõi lỏng Sao Hỏa từng tạo ra từ trường toàn cầu mạnh mẽ giống Trái Đất, che chở cho bầu khí quyển dày và đại dương cổ đại trước khi lụi tàn.',
    },
    imageUrl: '/assets/aistudio/PIA19811_1a033482.jpg',
    imageCredit: 'NASA / JPL-Caltech · PIA19811',
    sourceUrl: 'https://science.nasa.gov/mission/insight/science-highlights/',
  },
];

// PAGE 10: 3-Question Knowledge Check (100% InSight Dedicated)
export const INSIGHT_QUIZ_QUESTIONS_3: QuizQuestionItem[] = [
  {
    id: 'q1-seis',
    question: {
      en: '1. What did InSight’s copper-shielded SEIS instrument measure, and why did the lander have three rigid legs instead of wheels?',
      vi: '1. Thiết bị SEIS của InSight đo đại lượng gì, và vì sao trạm đổ bộ dùng 3 chân cố định thay vì bánh xe?',
    },
    options: [
      {
        en: 'It measured Martian cloud heights and ran out of titanium wheels before launch.',
        vi: 'Đo độ cao đám mây Sao Hỏa và thiếu bánh xe titan trước ngày phóng.',
      },
      {
        en: 'It measured microscopic ground vibrations from 1,319 marsquakes and needed a completely motionless anchor free of wheel creaks.',
        vi: 'Đo rung chấn mặt đất siêu nhỏ từ 1.319 trận động đất Sao Hỏa và cần một điểm tựa hoàn toàn tĩnh lặng, không bị rung bởi khớp bánh xe.',
      },
      {
        en: 'It drilled 50 kilometers deep to pump liquid iron onto the lander deck.',
        vi: 'Khoan sâu 50 km để hút sắt lỏng lên mặt boong tàu.',
      },
    ],
    correctIndex: 1,
    explanation: {
      en: 'Correct! SEIS detected ground motions smaller than a hydrogen atom (<10⁻¹⁰ m/s²) across 1,319 marsquakes. A stationary three-legged platform eliminated mechanical wheel noise.',
      vi: 'Chính xác! SEIS phát hiện các rung động nhỏ hơn cả nguyên tử Hydro (<10⁻¹⁰ m/s²) qua 1.319 trận động đất. Thiết kế 3 chân tĩnh giúp loại bỏ hoàn toàn tạp âm cơ học.',
    },
    sourceLabel: 'NASA InSight Instruments (SEIS)',
    sourceUrl: 'https://science.nasa.gov/mission/insight/science-instruments/',
  },
  {
    id: 'q2-dust-power',
    question: {
      en: '2. Why did InSight’s daily solar electricity drop from ~5,000 Wh per sol in 2018 down to ~500 Wh per sol by 2022?',
      vi: '2. Vì sao sản lượng điện mặt trời mỗi ngày của InSight giảm từ ~5.000 Wh/sol năm 2018 xuống chỉ còn ~500 Wh/sol vào năm 2022?',
    },
    options: [
      {
        en: 'Mars moved twice as far away from the Sun in 2022.',
        vi: 'Sao Hỏa bay ra xa Mặt Trời gấp đôi vào năm 2022.',
      },
      {
        en: 'The robotic arm accidentally unplugged one of the solar wings.',
        vi: 'Cánh tay robot vô tình rút phích cắm của một bên cánh pin.',
      },
      {
        en: 'Fine red iron-oxide Martian dust steadily settled onto the twin 2.15-meter decagonal solar panels over 1,440 sols.',
        vi: 'Lớp bụi oxit sắt màu đỏ mịn lắng đọng dày dần lên hai cánh pin mặt trời rộng 2,15 mét suốt 1.440 ngày Sao Hỏa.',
      },
    ],
    correctIndex: 2,
    explanation: {
      en: 'Spot on! Over four Earth years (1,440 sols), airborne Martian dust coated the solar arrays, reducing energy by 90% until final contact on December 15, 2022.',
      vi: 'Hoàn toàn chính xác! Qua hơn 4 năm (1.440 sol), bụi mịn trong khí quyển Sao Hỏa phủ kín bề mặt pin, làm giảm 90% điện năng cho đến tín hiệu cuối cùng ngày 15/12/2022.',
    },
    sourceLabel: 'NASA InSight Power Generation Resource',
    sourceUrl:
      'https://science.nasa.gov/resource/insights-power-generation-after-landing-and-spring-2022/',
  },
  {
    id: 'q3-interior-mantle',
    question: {
      en: '3. What did InSight’s seismic waves (and the August 2025 study) reveal about Mars’ deep mantle and core?',
      vi: '3. Sóng địa chấn của InSight (cùng công bố tháng 8/2025) đã tiết lộ điều gì về Lớp Phủ và Lõi của Sao Hỏa?',
    },
    options: [
      {
        en: 'Mars has a large (~1,830 km radius) liquid iron-alloy core that blocks S-waves, and a "lumpy" mantle preserving 4.5-billion-year-old impact fragments.',
        vi: 'Sao Hỏa có lõi hợp kim sắt lỏng lớn (bán kính ~1.830 km) chặn sóng S, và lớp phủ "lổn nhổn" lưu giữ các mảnh vỡ va chạm 4,5 tỷ năm tuổi.',
      },
      {
        en: 'Mars is hollow inside and filled with frozen nitrogen gas.',
        vi: 'Bên trong Sao Hỏa hoàn toàn rỗng và chứa đầy khí nitơ đóng băng.',
      },
      {
        en: 'Mars has fast-moving ocean tectonic plates identical to modern Earth.',
        vi: 'Sao Hỏa có các mảng kiến tạo đại dương dịch chuyển nhanh giống hệt Trái Đất hiện đại.',
      },
    ],
    correctIndex: 0,
    explanation: {
      en: 'Bravo! S-wave shadow zones and RISE radio tracking confirmed a ~1,830-km liquid core, while scrambled high-frequency waves revealed 4-km primordial fragments preserved in the mantle.',
      vi: 'Xuất sắc! Vùng tối sóng S và dữ liệu RISE xác nhận lõi lỏng bán kính ~1.830 km, trong khi sóng tần số cao tiết lộ các khối mảnh vỡ nguyên thủy rộng tới 4 km trong lớp phủ.',
    },
    sourceLabel: 'NASA Aug 2025 Lumpy Mantle Study',
    sourceUrl:
      'https://www.nasa.gov/missions/insight/nasa-marsquake-data-reveals-lumpy-nature-of-red-planets-interior/',
  },
];

// PAGE 10 & MODAL: Judge Q&A (Space Apps Challenge Official Criteria)
export const JUDGE_QA_ITEMS: JudgeQaItem[] = [
  {
    id: 'what-it-does',
    question: {
      en: '1. What does "INSIGHT: THE LAST DIARY FROM MARS" do, and how does it fit our umbrella project?',
      vi: '1. Phân hệ "INSIGHT: NHẬT KÝ CUỐI CÙNG TỪ SAO HỎA" hoạt động thế nào trong dự án tổng thể?',
    },
    answer: {
      en: 'This application is a dedicated 10-page interactive 3D & seismic storytelling subsystem under Team NAU EXPLORERS’ umbrella project "ABANDONED BUT NOT FORGOTTEN." It transforms NASA’s silent InSight Mars Lander (NSSDCA ID: 2018-042A) from a piece of discarded hardware on Elysium Planitia into an empathetic first-person scientific narrator for learners aged 10–15.',
      vi: 'Đây là phân hệ kể chuyện tương tác 3D & địa chấn gồm 10 trang chuyên sâu thuộc dự án "ABANDONED BUT NOT FORGOTTEN" của đội NAU EXPLORERS. Ứng dụng biến trạm đổ bộ InSight (NSSDCA ID: 2018-042A) đang nằm bất động trên đồng bằng Elysium Planitia thành một người kể chuyện khoa học ngôi thứ nhất đầy cảm xúc dành cho học sinh 10–15 tuổi.',
    },
  },
  {
    id: 'benefits-impact',
    question: {
      en: '2. What are the educational benefits and expected impact?',
      vi: '2. Lợi ích giáo dục và tác động kỳ vọng của dự án là gì?',
    },
    answer: {
      en: 'Middle-school students often think a spacecraft with a dead battery is "broken space junk." By letting learners manipulate the 9 hardware subsystems on PIA17358, simulate P-wave vs. S-wave shadow zones across Mars’ liquid core, scrub between the 2018 and 2022 dust selfies, and explore the August 2025 lumpy mantle discovery, students grasp how open-access NASA archives keep generating breakthroughs for decades.',
      vi: 'Học sinh thường nghĩ tàu vũ trụ cạn pin chỉ là "phế liệu". Khi trực tiếp tương tác với 9 thiết bị trên sơ đồ PIA17358, chạy mô phỏng sóng P/S qua lõi lỏng, kéo thanh trượt so sánh bụi phủ 2018–2022 và khám phá công bố lớp phủ lổn nhổn tháng 8/2025, các em hiểu rằng kho dữ liệu mở của NASA vẫn tiếp tục mang lại phát hiện mới suốt nhiều thập kỷ.',
    },
  },
  {
    id: 'tools-tech-creativity',
    question: {
      en: '3. What tools, technologies, and creative choices power this experience?',
      vi: '3. Công nghệ, công cụ và điểm sáng tạo nào được sử dụng?',
    },
    answer: {
      en: 'Built with React 19, TypeScript, Tailwind CSS, Three.js WebGL (with software-GL optimization and mobile touch-lock protection), Web Audio API real-time seismic synthesis, and a 4D CSS-perspective + HTML5 Canvas holographic mission badge generator. Creative first-person narration is paired with strict representational integrity notes and clickable [Verify at NASA/JPL ↗] citations on every page.',
      vi: 'Xây dựng bằng React 19, TypeScript, Tailwind CSS, Three.js WebGL (tối ưu hóa mượt mà kèm khóa cuộn cảm ứng trên điện thoại), Web Audio API tái tạo âm thanh địa chấn, và trình tạo Huy hiệu Hologram 4D trên Canvas. Giọng kể ngôi thứ nhất giàu cảm xúc luôn đi kèm chú thích minh bạch khoa học và nút [Kiểm chứng tại NASA/JPL ↗] trên từng trang.',
    },
  },
];

// 15 Verified Primary NASA/JPL Sources (100% Dedicated to InSight 2018-042A)
export const SCIENTIFIC_SOURCES: ScientificSourceItem[] = [
  {
    id: 'src-01',
    category: 'NASA Mission Page',
    title: 'NASA InSight Mars Lander — Official Mission Overview',
    identifier: 'NSSDCA: 2018-042A',
    url: 'https://science.nasa.gov/mission/insight/',
    summary: {
      en: 'Primary NASA Science portal covering InSight’s landing at Elysium Planitia (4.502°N, 135.623°E), 1,319 marsquakes, and mission timeline.',
      vi: 'Cổng thông tin chính thức của NASA về vị trí đổ bộ tại Elysium Planitia, 1.319 trận động đất và toàn bộ hành trình sứ mệnh InSight.',
    },
  },
  {
    id: 'src-02',
    category: 'Photojournal & Audio',
    title: 'The InSight Lander — Cleanroom Solar Array Deployment Test',
    identifier: 'PIA19664',
    url: 'https://science.nasa.gov/photojournal/the-insight-lander/',
    summary: {
      en: 'Official high-resolution photography of InSight’s twin 2.15-meter decagonal UltraFlex solar arrays unfolded inside Lockheed Martin’s cleanroom.',
      vi: 'Ảnh chụp độ phân giải cao hai cánh pin mặt trời hình thập giác rộng 2,15 mét của InSight bung mở trong phòng sạch.',
    },
  },
  {
    id: 'src-03',
    category: 'JPL News & Discovery',
    title: 'NASA InSight Lander Arrives on Martian Surface to Learn What Lies Beneath',
    identifier: 'Release 18-103 (26 Nov 2018)',
    url: 'https://www.nasa.gov/news-release/nasa-insight-lander-arrives-on-martian-surface-to-learn-what-lies-beneath/',
    summary: {
      en: 'Official touchdown press release documenting the 485-million-km cruise, MarCO CubeSat relay, and 6.5-minute EDL sequence.',
      vi: 'Thông cáo báo chí chính thức ghi lại hành trình 485 triệu km, cặp vệ tinh MarCO và 6,5 phút hạ cánh tự động xuống Sao Hỏa.',
    },
  },
  {
    id: 'src-04',
    category: 'NASA Mission Page',
    title: 'InSight Science Objectives — SEIS, HP³, and RISE',
    identifier: 'NASA Science · InSight Objectives',
    url: 'https://science.nasa.gov/mission/insight/science/',
    summary: {
      en: 'Detailed breakdown of how seismic waves, subsurface heat flow, and radio Doppler tracking probe rocky planet formation.',
      vi: 'Tài liệu chi tiết về 3 trụ cột khoa học: địa chấn SEIS, dòng nhiệt HP³ và trắc địa vô tuyến RISE.',
    },
  },
  {
    id: 'src-05',
    category: 'NASA Mission Page',
    title: 'InSight Science Instruments — SEIS, HP³, RISE, TWINS, APSS, IDA & Cameras',
    identifier: 'PIA17358 / Instruments',
    url: 'https://science.nasa.gov/mission/insight/science-instruments/',
    summary: {
      en: 'Technical specifications for InSight’s 9 hardware subsystems and annotated diagram PIA17358.',
      vi: 'Thông số kỹ thuật chuẩn xác của 9 hệ thống thiết bị trên trạm InSight kèm sơ đồ giải phẫu PIA17358.',
    },
  },
  {
    id: 'src-06',
    category: 'NASA Mission Page',
    title: 'InSight Science Highlights — Crust, Mantle, Liquid Core & Meteorite Impacts',
    identifier: 'NASA Science · Highlights',
    url: 'https://science.nasa.gov/mission/insight/science-highlights/',
    summary: {
      en: 'Synthesizes discoveries of Mars’ 3-layer crust (24–72 km), 1,830-km molten core, 10× crustal magnetic field, and ice-excavating impacts.',
      vi: 'Tổng hợp các khám phá về lớp vỏ 3 tầng (24–72 km), lõi lỏng 1.830 km, từ trường cổ mạnh gấp 10 lần và các hố thiên thạch lộ băng.',
    },
  },
  {
    id: 'src-07',
    category: 'JPL News & Discovery',
    title: 'NASA Marsquake Data Reveals Lumpy Nature of Red Planet’s Interior',
    identifier: 'PIA26636 & PIA26635 (Aug 2025)',
    url: 'https://www.nasa.gov/missions/insight/nasa-marsquake-data-reveals-lumpy-nature-of-red-planets-interior/',
    summary: {
      en: 'August 2025 Science study showing that Mars’ mantle preserves ancient protoplanet impact fragments up to 4 km wide from 4.5 billion years ago.',
      vi: 'Công bố tháng 8/2025 trên tạp chí Science chứng minh lớp phủ Sao Hỏa lưu giữ các khối mảnh vỡ rộng tới 4 km từ các vụ va chạm 4,5 tỷ năm trước.',
    },
  },
  {
    id: 'src-08',
    category: 'Photojournal & Audio',
    title: 'Sounds of Mars: NASA’s InSight Senses Martian Wind (Official JPL Video)',
    identifier: 'YouTube: yT50Q_Zbf3s',
    url: 'https://youtu.be/yT50Q_Zbf3s',
    summary: {
      en: 'Official Dec 2018 JPL audio/video release of Martian wind vibrations recorded by SEIS and APSS on Sol 4.',
      vi: 'Video và bản thu âm chính thức của JPL ghi lại tiếng gió Sao Hỏa thổi qua cánh pin mặt trời của InSight.',
    },
  },
  {
    id: 'src-09',
    category: 'Photojournal & Audio',
    title: 'Listen to NASA’s InSight at Work on Mars (Sol 128 & Sol 173 Marsquakes)',
    identifier: 'NASA Audio Resource',
    url: 'https://science.nasa.gov/resource/listen-to-nasas-insight-at-work-on-mars/',
    summary: {
      en: 'Sonified SEIS waveforms sped up 60× so human ears can hear the deep rumble of Martian quakes and wind gusts.',
      vi: 'Dữ liệu sóng địa chấn SEIS được tua nhanh 60 lần giúp tai người nghe rõ âm thanh trầm đục của động đất Sao Hỏa.',
    },
  },
  {
    id: 'src-10',
    category: 'Photojournal & Audio',
    title: 'InSight’s Power Generation After Landing and Spring 2022',
    identifier: 'PIA22876 vs. PIA25287',
    url: 'https://science.nasa.gov/resource/insights-power-generation-after-landing-and-spring-2022/',
    summary: {
      en: 'Official comparison of InSight’s clean solar panels in Dec 2018 (~5,000 Wh/sol) and dust-coated panels in 2022 (~500 Wh/sol).',
      vi: 'Đối chiếu chính thức giữa ảnh selfie cánh pin sạch bụi tháng 12/2018 (~5.000 Wh/sol) và khi phủ đầy bụi năm 2022 (~500 Wh/sol).',
    },
  },
  {
    id: 'src-11',
    category: 'JPL News & Discovery',
    title: 'NASA Retires InSight Mars Lander Mission After Years of Science',
    identifier: 'JPL News (21 Dec 2022)',
    url: 'https://www.jpl.nasa.gov/news/nasa-retires-insight-mars-lander-mission-after-years-of-science/',
    summary: {
      en: 'Documents InSight’s final signal on December 15, 2022 and official retirement on December 21, 2022 after 1,440 sols.',
      vi: 'Tài liệu tổng kết tín hiệu cuối cùng ngày 15/12/2022 và tuyên bố hoàn thành sứ mệnh ngày 21/12/2022 sau 1.440 ngày Sao Hỏa.',
    },
  },
  {
    id: 'src-12',
    category: 'NASA Mission Page',
    title: 'Official NASA Eyes on the Solar System — Live 3D InSight Spacecraft Model',
    identifier: 'eyes.nasa.gov/#/sc_insight',
    url: 'https://eyes.nasa.gov/apps/solar-system/#/sc_insight',
    summary: {
      en: 'Interactive WebGL 3D spacecraft model maintained by NASA JPL visualization team.',
      vi: 'Mô hình 3D tương tác trực tiếp của trạm đổ bộ InSight do đội ngũ trực quan hóa NASA JPL vận hành.',
    },
  },
];
