export type Language = 'en' | 'vi';

export interface GisLandmark {
  id: 'insight' | 'opportunity' | 'apollo11';
  body: 'mars' | 'moon';
  nssdcaId: string;
  lat: number;
  lon: number;
  coordsLabel: string;
  elevationLabel: string;
  name: Record<Language, string>;
  siteName: Record<Language, string>;
  missionDates: Record<Language, string>;
  statusBadge: Record<Language, string>;
  statusTone: 'amber' | 'emerald' | 'slate';
  geology: Record<Language, string>;
  summary: Record<Language, string>;
  keyMetric: Record<Language, string>;
  nasaPhotoId: 'PIA22876' | 'PIA23177' | 'AS11-40-5952';
  sourceUrl: string;
}

export interface HardwareHotspot {
  id: 'seis' | 'arrays' | 'hp3' | 'arm' | 'uhf' | 'twins' | 'legs';
  position3D: [number, number, number];
  shortLabel: string;
  code: string;
  title: Record<Language, string>;
  specs: Record<Language, string>;
  description: Record<Language, string>;
}

export const TEAM_METADATA = {
  projectTitle:
    'SILENT MONUMENTS: Voices from the Moon & Mars — InSight’s Last Diary & Off-World Artifacts',
  teamName: 'NAU EXPLORERS',
  teamId: 'NS01048',
  institution: {
    en: 'Nghe An University (Trường Đại học Nghệ An), Vietnam',
    vi: 'Trường Đại học Nghệ An (Nghe An University), Việt Nam',
  },
  localEvent: {
    en: 'NASA Space Apps Challenge Hanoi 2026 (14–15 November 2026)',
    vi: 'NASA Space Apps Challenge Hà Nội 2026 (14–15/11/2026)',
  },
  challenge: {
    en: 'Challenge 01: Abandoned but not Forgotten — Storytelling about NASA’s Discarded Equipment on the Moon and Mars',
    vi: 'Thử thách 01: Bị bỏ lại nhưng không bị lãng quên — Kể chuyện về thiết bị NASA trên Mặt Trăng và Sao Hỏa',
  },
  members: [
    'Nguyễn Hoàng Hà',
    'Nguyễn Đình Mạnh',
    'Nguyễn Bảo Trọng',
    'Phùng Thảo My',
    'Nguyễn Thị Thanh Lan',
  ],
  targetAudience: {
    en: 'School-age space enthusiasts (ages 10–15) and STEM educators',
    vi: 'Học sinh yêu thích vũ trụ (10–15 tuổi) và giáo viên STEM',
  },
  license: 'Apache License 2.0 (OSI-approved)',
};

export const GIS_LANDMARKS: GisLandmark[] = [
  {
    id: 'insight',
    body: 'mars',
    nssdcaId: '2018-042A',
    lat: 4.502,
    lon: 135.623,
    coordsLabel: '4.502°N, 135.623°E',
    elevationLabel: '-2,655 m MOLA',
    name: {
      en: 'InSight Geophysical Lander',
      vi: 'Trạm Đổ bộ Địa vật lý InSight',
    },
    siteName: {
      en: 'Elysium Planitia, Mars',
      vi: 'Đồng bằng Elysium Planitia, Sao Hỏa',
    },
    missionDates: {
      en: 'Landed 26 Nov 2018 · Final Signal 15 Dec 2022',
      vi: 'Hạ cánh 26/11/2018 · Tín hiệu cuối 15/12/2022',
    },
    statusBadge: {
      en: 'Silent Monument · Active Archive',
      vi: 'Đài tưởng niệm · Kho dữ liệu sống',
    },
    statusTone: 'amber',
    geology: {
      en: 'Smooth volcanic plains blanketed by 3–5 meters of impact-fragmented basaltic regolith.',
      vi: 'Đồng bằng núi lửa bằng phẳng phủ lớp đất đá bazan vụn dày 3–5 mét.',
    },
    summary: {
      en: 'Placed the first seismometer directly on Martian soil, recording 1,319 marsquakes and sizing Mars’ molten core before red dust veiled its solar wings.',
      vi: 'Đặt ống nghe địa chấn đầu tiên lên đất Sao Hỏa, ghi lại 1.319 trận động đất và đo lõi sắt lỏng trước khi bụi đỏ phủ kín hai cánh pin.',
    },
    keyMetric: {
      en: '1,319 marsquakes · 1,440 Martian sols',
      vi: '1.319 động đất Sao Hỏa · 1.440 sol hoạt động',
    },
    nasaPhotoId: 'PIA22876',
    sourceUrl: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2018-042A',
  },
  {
    id: 'opportunity',
    body: 'mars',
    nssdcaId: '2003-032A',
    lat: -1.946,
    lon: 354.473,
    coordsLabel: '1.946°S, 354.473°E',
    elevationLabel: '-1,380 m MOLA',
    name: {
      en: 'Opportunity Rover (MER-B)',
      vi: 'Xe Tự hành Opportunity (MER-B)',
    },
    siteName: {
      en: 'Perseverance Valley, Meridiani Planum',
      vi: 'Thung lũng Perseverance, Meridiani Planum',
    },
    missionDates: {
      en: 'Landed 25 Jan 2004 · Final Signal 10 June 2018',
      vi: 'Hạ cánh 25/01/2004 · Tín hiệu cuối 10/06/2018',
    },
    statusBadge: {
      en: 'Silent Monument · 5,111 Sols',
      vi: 'Đài tưởng niệm · 5.111 Sol',
    },
    statusTone: 'amber',
    geology: {
      en: 'Ancient sulfate outcrops rich in spherical hematite concretions ("blueberries") formed in liquid water.',
      vi: 'Các vỉa trầm tích giàu kết hạch hematit hình cầu ("việt quất") hình thành trong nước ngầm cổ đại.',
    },
    summary: {
      en: 'Built for a 90-sol mission, Opportunity drove 45.16 km over 14.4 years until a planet-encircling 2018 dust storm turned noon into night.',
      vi: 'Thiết kế cho 90 sol nhưng đã đi 45,16 km suốt 14,4 năm, trước khi cơn bão bụi toàn cầu tháng 6/2018 che khuất hoàn toàn Mặt Trời.',
    },
    keyMetric: {
      en: '45.16 km driven · 57× planned lifespan',
      vi: 'Hành trình 45,16 km · Vượt 57 lần thiết kế',
    },
    nasaPhotoId: 'PIA23177',
    sourceUrl: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2003-032A',
  },
  {
    id: 'apollo11',
    body: 'moon',
    nssdcaId: '1969-059C',
    lat: 0.674,
    lon: 23.473,
    coordsLabel: '0.674°N, 23.473°E',
    elevationLabel: '-1,890 m LRO',
    name: {
      en: 'Apollo 11 Lunar Laser Retroreflector (LRRR)',
      vi: 'Gương Phản xạ Laser Mặt Trăng Apollo 11',
    },
    siteName: {
      en: 'Mare Tranquillitatis (Sea of Tranquility)',
      vi: 'Biển Tĩnh Lặng (Mare Tranquillitatis), Mặt Trăng',
    },
    missionDates: {
      en: 'Deployed 20 July 1969 · Still Active in 2026',
      vi: 'Đặt ngày 20/07/1969 · Vẫn hoạt động năm 2026',
    },
    statusBadge: {
      en: 'Still Active · Passive Optical',
      vi: 'Đang hoạt động · Quang học thụ động',
    },
    statusTone: 'emerald',
    geology: {
      en: 'Dark basaltic lunar mare plains formed 3.8 billion years ago on an airless, storm-free world.',
      vi: 'Đồng bằng bazan tối màu 3,8 tỷ năm tuổi trên Mặt Trăng không có gió và bão bụi.',
    },
    summary: {
      en: '100 fused-silica corner-cube prisms left by Armstrong and Aldrin. Requiring zero watts of electricity, it still reflects Earth laser pulses tonight.',
      vi: '100 lăng kính góc thạch anh do Armstrong và Aldrin đặt lại. Không cần một giọt điện nào, nó vẫn phản xạ tia laser từ Trái Đất mỗi đêm.',
    },
    keyMetric: {
      en: '0 Watts needed · Moon recedes 3.8 cm/yr',
      vi: '0 Watt điện · Mặt Trăng lùi xa 3,8 cm/năm',
    },
    nasaPhotoId: 'AS11-40-5952',
    sourceUrl: 'https://nssdc.gsfc.nasa.gov/nmc/experiment/display.action?id=1969-059C-03',
  },
];

export const INSIGHT_HOTSPOTS: HardwareHotspot[] = [
  {
    id: 'arrays',
    position3D: [-2.15, 0.28, 0.0],
    shortLabel: 'SOLAR',
    code: 'SOLAR · Twin UltraFlex Wings',
    title: {
      en: 'Twin Decagonal Solar Arrays',
      vi: 'Cặp Cánh Pin Mặt Trời Hình Thập Giác',
    },
    specs: {
      en: 'Span: 6.0 m · Area: 7.3 m² · ~5,000 Wh/sol clean → ~500 Wh/sol dusty',
      vi: 'Sải cánh: 6,0 m · Diện tích: 7,3 m² · ~5.000 Wh/sol → ~500 Wh/sol khi phủ bụi',
    },
    description: {
      en: 'Unfolded like twin decagonal fans after landing. Their wide 2.15-meter wings captured weak Martian sunlight—and slowly collected falling iron-oxide dust over 1,440 sols.',
      vi: 'Xòe ra như hai chiếc quạt thập giác rộng 2,15 mét để gom ánh nắng yếu ớt của Sao Hỏa—nhưng cũng hứng trọn lớp bụi oxit sắt lắng xuống suốt 1.440 sol.',
    },
  },
  {
    id: 'seis',
    position3D: [1.45, -0.38, 0.9],
    shortLabel: 'SEIS',
    code: 'SEIS · Copper Dome & WTS Shield',
    title: {
      en: 'SEIS Seismometer & Wind/Thermal Shield',
      vi: 'Máy Đo Địa Chấn SEIS & Vòm Chắn Gió Nhiệt',
    },
    specs: {
      en: 'Mass: 29 kg · Sensitivity: < 10⁻¹⁰ m/s² (atomic scale)',
      vi: 'Khối lượng: 29 kg · Độ nhạy: < 10⁻¹⁰ m/s² (cỡ nguyên tử)',
    },
    description: {
      en: 'Set on Martian soil 1.63 m from the deck beneath a metallic dome and gold chainmail skirt. Its vacuum-sealed pendulums detected 1,319 marsquakes.',
      vi: 'Đặt trực tiếp trên đất Sao Hỏa cách thân trạm 1,63 m dưới vòm kim loại và váy xích vàng. Các con lắc chân không đã bắt được 1.319 trận động đất.',
    },
  },
  {
    id: 'hp3',
    position3D: [-0.85, -0.52, 1.05],
    shortLabel: 'HP³',
    code: 'HP³ · DLR Heat Flow Probe',
    title: {
      en: 'HP³ "The Mole" Heat Flow Probe',
      vi: 'Mũi Khoan Nhiệt Lượng HP³ ("Chuột Chũi")',
    },
    specs: {
      en: 'Target: 5.0 m · Final Depth: ~40 cm · Tungsten hammer mechanism',
      vi: 'Mục tiêu: 5,0 m · Độ sâu thực tế: ~40 cm · Búa đập vonfram',
    },
    description: {
      en: 'Designed to hammer 5 meters deep, the spike met unexpectedly cemented Martian duricrust at 40 cm—yielding crucial soil-mechanics data for future astronauts.',
      vi: 'Thiết kế để đóng sâu 5 mét nhưng gặp lớp đất kết dính cứng ở mức 40 cm—mang lại dữ liệu cơ học đất quý giá cho các sứ mệnh tương lai.',
    },
  },
  {
    id: 'arm',
    position3D: [0.68, 0.58, 0.55],
    shortLabel: 'IDA',
    code: 'IDA · 1.8m Robotic Arm & Camera',
    title: {
      en: 'Instrument Deployment Arm (IDA) & IDC Camera',
      vi: 'Cánh Tay Robot (IDA) & Camera Khuỷu Tay IDC',
    },
    specs: {
      en: 'Reach: 1.8 meters · 4 joints · 5-finger mechanical grapple',
      vi: 'Tầm với: 1,8 mét · 4 khớp xoay · Móc gắp cơ khí 5 ngón',
    },
    description: {
      en: 'Lifted SEIS, the Wind Shield, and HP³ onto the ground, then used its elbow camera to stitch together InSight’s iconic 2018 and 2022 selfies.',
      vi: 'Nâng SEIS, vòm chắn gió và mũi khoan HP³ đặt xuống nền đất, đồng thời dùng camera khuỷu tay chụp những bức ảnh tự chụp lịch sử.',
    },
  },
  {
    id: 'uhf',
    position3D: [0.45, 0.52, -0.48],
    shortLabel: 'RISE',
    code: 'RISE & UHF · X-Band Geodesy',
    title: {
      en: 'RISE X-Band Transponder & UHF Helical Antenna',
      vi: 'Thiết Bị Vô Tuyến RISE & Ăng-ten UHF',
    },
    specs: {
      en: 'Doppler precision: < 10 cm · Orbiter relay link',
      vi: 'Độ chính xác Doppler: < 10 cm · Tiếp sóng tàu quỹ đạo',
    },
    description: {
      en: 'Tracked tiny wobbles in Mars’ rotation axis as it orbited the Sun, proving the planet’s 1,830-km core is molten liquid metal.',
      vi: 'Đo độ đảo cực nhỏ của trục quay Sao Hỏa, chứng minh lõi hành tinh có bán kính ~1.830 km là kim loại nóng chảy.',
    },
  },
  {
    id: 'twins',
    position3D: [-0.55, 0.62, -0.42],
    shortLabel: 'TWINS',
    code: 'TWINS · APSS Weather Boom',
    title: {
      en: 'TWINS Wind, Temperature & Pressure Sensors',
      vi: 'Cảm Biến Thời Tiết, Gió & Áp Suất TWINS',
    },
    specs: {
      en: 'Continuous wind speed, air temperature & magnetic monitoring',
      vi: 'Đo tốc độ gió, nhiệt độ và từ trường liên tục',
    },
    description: {
      en: 'Monitored daily Martian gusts and passing dust devils so seismologists could filter wind vibrations out of delicate marsquake recordings.',
      vi: 'Theo dõi gió và lốc bụi mỗi ngày để các nhà địa chấn học lọc bỏ nhiễu khí quyển khỏi tín hiệu động đất Sao Hỏa.',
    },
  },
  {
    id: 'legs',
    position3D: [0.0, -0.58, 1.15],
    shortLabel: 'LEGS',
    code: 'LEGS · Shock-Absorbing Tripod',
    title: {
      en: 'Three Titanium-Aluminum Crushable Landing Legs',
      vi: 'Ba Chân Trụ Giảm Chấn Hợp Kim Titan – Nhôm',
    },
    specs: {
      en: '3 circular footpads · Motionless seismic anchor on basalt soil',
      vi: '3 bàn đạp tròn · Điểm tựa tĩnh lặng tuyệt đối trên nền đất',
    },
    description: {
      en: 'Absorbed touchdown impact on November 26, 2018 and anchored the lander in total stillness so no wheel motor noise could disturb SEIS.',
      vi: 'Hấp thụ xung lực tiếp đất ngày 26/11/2018 và giữ toàn bộ thân trạm đứng yên tuyệt đối để không gây tạp âm cơ học.',
    },
  },
];

export const CHAPTER_TITLES: {
  num: string;
  title: Record<Language, string>;
  subtitle: Record<Language, string>;
}[] = [
  {
    num: '01',
    title: { en: 'The Message After Silence', vi: 'Tín hiệu sau sự im lặng' },
    subtitle: { en: 'Elysium Planitia · Sol 1440 to 2026', vi: 'Elysium Planitia · Sol 1440 đến 2026' },
  },
  {
    num: '02',
    title: { en: 'Planetary GIS Observatory', vi: 'Đài quan sát Bản đồ GIS Hành tinh' },
    subtitle: { en: 'Mars MOLA & Moon LRO Coordinate Registry', vi: 'Hệ tọa độ Sao Hỏa MOLA & Mặt Trăng LRO' },
  },
  {
    num: '03',
    title: { en: 'Touchdown at Elysium Planitia', vi: 'Chạm xuống đồng bằng Elysium Planitia' },
    subtitle: { en: '485 Million km Cruise & Why Stillness Matters', vi: 'Hành trình 485 triệu km & Vì sao cần đứng yên' },
  },
  {
    num: '04',
    title: { en: 'Meet InSight & The Planet’s Stethoscope', vi: 'Giải phẫu 3D InSight & Ống nghe SEIS' },
    subtitle: { en: 'Interactive 3D Hardware & NASA Eyes Live View', vi: 'Mô hình 3D Tương tác & NASA Eyes Trực tiếp' },
  },
  {
    num: '05',
    title: { en: '1,319 Heartbeats of Mars', vi: '1.319 Nhịp tim của Sao Hỏa' },
    subtitle: { en: 'Seismic Oscilloscope & 60× Audio Sonification', vi: 'Dao động ký Địa chấn & Âm thanh hóa 60×' },
  },
  {
    num: '06',
    title: { en: 'Deep Inside the Red Planet & The HP³ Lesson', vi: 'Nhìn xuyên lòng đất đỏ & Bài học mũi khoan HP³' },
    subtitle: { en: 'Crust, Mantle, Liquid Core & The 40-cm Duricrust Wall', vi: 'Vỏ, Manti, Lõi lỏng & Bức tường đất cứng 40 cm' },
  },
  {
    num: '07',
    title: { en: 'When the Red Dust Falls', vi: 'Khi bụi đỏ che khuất Mặt Trời' },
    subtitle: { en: '2018–2022 Solar Scrubber & Power Trade-Off Lab', vi: 'Thanh trượt Bụi phủ 2018–2022 & Bài toán Năng lượng' },
  },
  {
    num: '08',
    title: { en: 'The Mirror That Never Sleeps', vi: 'Tấm gương không bao giờ ngủ' },
    subtitle: { en: 'Apollo 11 Lunar Laser Ranging Lab (1969–2026)', vi: 'Phòng thí nghiệm Bắn tia Laser Mặt Trăng Apollo 11' },
  },
  {
    num: '09',
    title: { en: 'Why Storytelling Matters — Baseline & Impact', vi: 'Đối chiếu Cơ sở & Tác động Giáo dục STEM' },
    subtitle: { en: 'Raw NSSDCA Catalog vs. Spatial Inquiry Lab', vi: 'Bảng mã NSSDCA thô & Không gian Khám phá Tương tác' },
  },
  {
    num: '10',
    title: { en: 'Explorer Challenge & Mission Emblem', vi: 'Thử thách Nhà thám hiểm & Huy hiệu Sứ mệnh' },
    subtitle: { en: '4-Question Review, 8K Emblem & Primary Archives', vi: '4 Câu hỏi Ôn tập, Huy hiệu 8K & Nguồn dữ liệu' },
  },
];

export const QUIZ_QUESTIONS = [
  {
    id: 0,
    question: {
      en: '1. Why was InSight built as a stationary three-legged lander without wheels, unlike Opportunity?',
      vi: '1. Vì sao InSight được thiết kế là trạm đổ bộ 3 chân đứng yên không có bánh xe, khác với Opportunity?',
    },
    options: {
      en: [
        'NASA ran out of titanium wheels before the May 2018 launch.',
        'Its SEIS seismometer needed a quiet, motionless anchor to detect sub-atomic ground vibrations.',
        'Elysium Planitia is covered in liquid water oceans.',
      ],
      vi: [
        'NASA hết vật liệu chế tạo bánh xe titan trước ngày phóng.',
        'Máy đo địa chấn SEIS cần điểm tựa tĩnh lặng tuyệt đối để bắt các rung động nhỏ cỡ nguyên tử.',
        'Đồng bằng Elysium Planitia ngập nước lỏng.',
      ],
    },
    correctIndex: 1,
    explanation: {
      en: 'Verified (NASA/JPL SEIS Archive): A rolling rover creates mechanical noise. Sitting motionless on Elysium Planitia let SEIS detect quakes thousands of kilometers away.',
      vi: 'Chính xác (Hồ sơ NASA/JPL SEIS): Xe tự hành di chuyển tạo ra tạp âm cơ học. Đứng yên tại Elysium Planitia giúp SEIS lắng nghe sóng địa chấn từ cách xa hàng nghìn kilômét.',
    },
  },
  {
    id: 1,
    question: {
      en: '2. What caused InSight’s solar power to drop from ~5,000 Wh/sol in 2018 down to ~500 Wh/sol by 2022?',
      vi: '2. Nguyên nhân nào khiến sản lượng điện của InSight giảm từ ~5.000 Wh/sol năm 2018 xuống ~500 Wh/sol năm 2022?',
    },
    options: {
      en: [
        'The Sun cooled down by 90% between 2018 and 2022.',
        'Marsquakes cracked the wires inside the robotic arm.',
        'Fine iron-oxide Martian dust coated the twin decagonal solar panels over 1,440 sols.',
      ],
      vi: [
        'Mặt Trời giảm 90% nhiệt lượng chiếu sáng.',
        'Động đất Sao Hỏa làm đứt dây cáp trong cánh tay robot.',
        'Bụi mịn oxit sắt lắng đọng dày đặc trên hai cánh pin mặt trời suốt 1.440 sol.',
      ],
    },
    correctIndex: 2,
    explanation: {
      en: 'Verified (NASA PIA25287): Airborne Martian dust settled onto the 7.3 m² solar arrays, cutting daily energy by ~90% until final contact on December 15, 2022.',
      vi: 'Chính xác (Dữ liệu NASA PIA25287): Lớp bụi mịn phủ kín 7,3 m² diện tích pin mặt trời, làm mất ~90% lượng điện mỗi ngày cho đến tín hiệu cuối ngày 15/12/2022.',
    },
  },
  {
    id: 2,
    question: {
      en: '3. What did the 1,319 marsquakes recorded by SEIS and RISE reveal about Mars’ deep interior?',
      vi: '3. Dữ liệu từ 1.319 trận động đất Sao Hỏa (SEIS) và tín hiệu RISE đã tiết lộ điều gì về lòng Sao Hỏa?',
    },
    options: {
      en: [
        'Mars has a layered crust (~24–72 km), a silicate mantle, and a molten liquid iron-alloy core (~1,830 km radius).',
        'Mars is completely hollow inside like a table-tennis ball.',
        'Mars has a solid diamond core surrounded by frozen carbon dioxide.',
      ],
      vi: [
        'Sao Hỏa có vỏ phân tầng (~24–72 km), manti silicat và lõi hợp kim sắt nóng chảy (bán kính ~1.830 km).',
        'Bên trong Sao Hỏa hoàn toàn rỗng.',
        'Sao Hỏa có lõi kim cương rắn bao quanh bởi băng khô.',
      ],
    },
    correctIndex: 0,
    explanation: {
      en: 'Verified (Science / NASA InSight Models): Seismic reflections and radio nutation tracking proved Mars has a large liquid iron-alloy core ~1,830 km in radius.',
      vi: 'Chính xác (Mô hình Nội tâm Sao Hỏa của NASA): Sóng phản xạ địa chấn và phép đo vô tuyến chứng minh Sao Hỏa có lõi hợp kim sắt lỏng bán kính khoảng 1.830 km.',
    },
  },
  {
    id: 3,
    question: {
      en: '4. Why does the Apollo 11 Lunar Laser Retroreflector (1969-059C) still work in 2026 after 57+ years?',
      vi: '4. Vì sao Gương phản xạ Laser Apollo 11 (1969-059C) từ năm 1969 vẫn hoạt động tốt vào năm 2026?',
    },
    options: {
      en: [
        'Astronauts visit the Sea of Tranquility every five years to swap its batteries.',
        'It is a passive array of 100 corner-cube prisms requiring 0 Watts of electricity on an airless Moon.',
        'It runs on steam from lunar geysers.',
      ],
      vi: [
        'Phi hành gia quay lại Biển Tĩnh Lặng 5 năm một lần để thay pin.',
        'Đây là khay 100 lăng kính quang học thụ động không cần điện (0 Watt) trên Mặt Trăng không có bão bụi.',
        'Thiết bị chạy bằng hơi nước địa nhiệt trên Mặt Trăng.',
      ],
    },
    correctIndex: 1,
    explanation: {
      en: 'Verified (NSSDCA 1969-059C): Corner-cube prisms reflect incoming laser pulses straight back to Earth by pure optical geometry—zero batteries or solar panels needed.',
      vi: 'Chính xác (Hồ sơ NSSDCA 1969-059C): Các lăng kính góc phản xạ chùm tia laser quay ngược về Trái Đất nhờ định luật quang học—không cần pin hay nguồn điện.',
    },
  },
];

export const OFFICIAL_REFERENCES = [
  {
    id: 1,
    category: 'CHALLENGE BRIEF',
    title:
      '2026 NASA International Space Apps Challenge — "Abandoned but not Forgotten: Storytelling about NASA’s Discarded Equipment on the Moon and Mars"',
    url: 'https://www.spaceappschallenge.org/2026/challenges/nasas-discarded-equipment-storytelling/',
    verifiedFact:
      'Official challenge scope: humanizing silent lunar and Martian hardware through accurate science storytelling.',
  },
  {
    id: 2,
    category: 'NSSDCA CATALOG',
    title: 'NASA NSSDCA Master Catalog — InSight Lander (NSSDCA ID: 2018-042A)',
    url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2018-042A',
    verifiedFact:
      'Launch: 5 May 2018; Landing: 26 Nov 2018 at 4.502°N, 135.623°E (Elysium Planitia); Last Contact: 15 Dec 2022.',
  },
  {
    id: 3,
    category: 'NSSDCA CATALOG',
    title: 'NASA NSSDCA Master Catalog — Opportunity Rover / MER-B (NSSDCA ID: 2003-032A)',
    url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2003-032A',
    verifiedFact:
      'Landed 25 Jan 2004 at Meridiani Planum (1.946°S, 354.473°E); operated 5,111 sols (45.16 km) until 10 June 2018.',
  },
  {
    id: 4,
    category: 'NSSDCA CATALOG',
    title:
      'NASA NSSDCA Experiment Record — Apollo 11 Lunar Laser Ranging Retroreflector (NSSDCA ID: 1969-059C-03)',
    url: 'https://nssdc.gsfc.nasa.gov/nmc/experiment/display.action?id=1969-059C-03',
    verifiedFact:
      'Deployed 20 July 1969 at Mare Tranquillitatis (0.674°N, 23.473°E); 100 fused-silica corner-cube prisms; passive optical operation.',
  },
  {
    id: 5,
    category: 'NASA MISSION PORTAL',
    title: 'NASA Science — InSight Mars Lander Mission Overview & Science Objectives',
    url: 'https://science.nasa.gov/mission/insight/science/',
    verifiedFact:
      'Interior Exploration using Seismic Investigations, Geodesy and Heat Transport (crust, mantle, and core structure).',
  },
  {
    id: 6,
    category: 'INSTRUMENT ARCHIVE',
    title: 'NASA Science — InSight Science Instruments (SEIS, HP³, RISE, IDA, TWINS)',
    url: 'https://science.nasa.gov/mission/insight/science-instruments/',
    verifiedFact:
      'SEIS deployed 19 Dec 2018; WTS deployed 2 Feb 2019; HP³ mole reached ~40 cm depth in cohesive Martian duricrust.',
  },
  {
    id: 7,
    category: 'SEISMIC CATALOG',
    title: 'NASA/JPL Photojournal — Impactor Debris & 1,319 Total Recorded Marsquakes',
    url: 'https://science.nasa.gov/photojournal/impactor-debris-scattered-within-mars-mantle-artists-concept/',
    verifiedFact:
      'First likely marsquake recorded 6 April 2019 (Sol 128); total cataloged seismic events across mission: 1,319.',
  },
  {
    id: 8,
    category: 'POWER TELEMETRY',
    title: 'NASA Science Resource — InSight’s Power Generation After Landing and Spring 2022',
    url: 'https://science.nasa.gov/resource/insights-power-generation-after-landing-and-spring-2022/',
    verifiedFact:
      'Clean decagonal solar arrays produced ~5,000 Wh/sol after landing; dust reduced output to ~500 Wh/sol (~90% drop) by Spring 2022.',
  },
  {
    id: 9,
    category: 'SEISMIC AUDIO',
    title: 'NASA Science Resource — Listen to NASA’s InSight at Work on Mars (60× Sonification)',
    url: 'https://science.nasa.gov/resource/listen-to-nasas-insight-at-work-on-mars/',
    verifiedFact:
      'Sub-audible Martian ground vibrations sped up 60× to bring P/S waves into human hearing range.',
  },
  {
    id: 10,
    category: 'NASA PHOTOJOURNAL',
    title:
      'NASA/JPL Photojournal — PIA22876 (First Selfie, Dec 2018) & PIA25287 (Final Selfie, April 2022)',
    url: 'https://science.nasa.gov/photojournal/insights-final-selfie/',
    verifiedFact:
      'Visual verification of dust accumulation on the lander deck and solar wings between Sol 10 and Sol 1211.',
  },
  {
    id: 11,
    category: 'RETIREMENT DISPATCH',
    title:
      'NASA/JPL News Release — NASA Retires InSight Mars Lander Mission After Years of Science (21 Dec 2022)',
    url: 'https://www.jpl.nasa.gov/news/nasa-retires-insight-mars-lander-mission-after-years-of-science/',
    verifiedFact:
      'Final contact received 15 December 2022; mission formally declared complete on 21 December 2022.',
  },
  {
    id: 12,
    category: 'NASA 3D VISUALIZATION',
    title: 'NASA Eyes on the Solar System — Interactive 3D Spacecraft View (sc_insight)',
    url: 'https://eyes.nasa.gov/apps/solar-system/#/sc_insight',
    verifiedFact:
      'Official NASA/JPL real-time 3D web visualization of the InSight spacecraft geometry.',
  },
];
