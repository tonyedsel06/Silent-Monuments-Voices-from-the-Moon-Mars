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
  nasaPhotoId: string;
}

export interface HardwareHotspot {
  id: 'seis' | 'wts' | 'arrays' | 'arm' | 'hp3' | 'uhf';
  position3D: [number, number, number];
  code: string;
  title: Record<Language, string>;
  specs: Record<Language, string>;
  description: Record<Language, string>;
}

export const TEAM_METADATA = {
  projectTitle: 'SILENT MONUMENTS: Voices from the Moon & Mars — InSight’s Last Diary & Off-World Artifacts',
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
      en: 'Landed 26 Nov 2018 · Last Signal 15 Dec 2022',
      vi: 'Hạ cánh 26/11/2018 · Tín hiệu cuối 15/12/2022',
    },
    statusBadge: {
      en: 'SILENT MONUMENT · ACTIVE ARCHIVE',
      vi: 'ĐÀI TƯỞNG NIỆM TĨNH LẶNG · KHO DỮ LIỆU SỐNG',
    },
    statusTone: 'amber',
    geology: {
      en: 'Smooth Hesperian volcanic plains covered by a 3-to-5-meter impact-fragmented regolith layer over fractured basalt flows.',
      vi: 'Đồng bằng núi lửa kỷ Hesperian bằng phẳng, phủ lớp đất đá vụn (regolith) dày 3–5 mét nằm trên nền đá bazan nứt nẻ.',
    },
    summary: {
      en: 'Stationary planetary seismological station. Placed the first seismometer directly on Martian soil, recording 1,319 marsquakes and measuring the liquid iron-alloy core before iron-oxide dust starved its decagonal solar arrays.',
      vi: 'Trạm địa chấn cố định đầu tiên đặt ống nghe trực tiếp lên mặt đất Sao Hỏa. Ghi nhận 1.319 trận động đất Sao Hỏa và đo đạc lõi sắt lỏng trước khi lớp bụi đỏ phủ kín hai cánh pin mặt trời hình thập giác.',
    },
    keyMetric: {
      en: '1,319 marsquakes cataloged · 1,440 Martian sols operated',
      vi: '1.319 động đất Sao Hỏa · 1.440 ngày Sao Hỏa (sol) hoạt động',
    },
    nasaPhotoId: 'PIA22876',
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
      en: 'Meridiani Planum / Perseverance Valley, Mars',
      vi: 'Đồng bằng Meridiani / Thung lũng Perseverance, Sao Hỏa',
    },
    missionDates: {
      en: 'Landed 25 Jan 2004 · Last Signal 10 June 2018',
      vi: 'Hạ cánh 25/01/2004 · Tín hiệu cuối 10/06/2018',
    },
    statusBadge: {
      en: 'SILENT MONUMENT · 5,111 SOLS',
      vi: 'ĐÀI TƯỞNG NIỆM TĨNH LẶNG · 5.111 SOL',
    },
    statusTone: 'amber',
    geology: {
      en: 'Ancient sulfate-rich sedimentary outcrops embedded with spherical gray hematite concretions ("blueberries") formed in acidic groundwater.',
      vi: 'Các vỉa đá trầm tích giàu muối sunfat cổ đại chứa những viên kết hạch hematit xám hình cầu ("việt quất") hình thành trong môi trường nước ngầm.',
    },
    summary: {
      en: 'Engineered for a 90-sol warranty, Opportunity drove 45.16 km across four craters over 14.4 Earth years. A planet-encircling dust storm in June 2018 raised atmospheric opacity (tau > 10.8), cutting off sunlight to its solar deck.',
      vi: 'Được thiết kế cho 90 sol nhưng đã lăn bánh 45,16 km qua bốn miệng hố va chạm suốt 14,4 năm Trái Đất. Cơn bão bụi toàn cầu tháng 6/2018 đã che khuất hoàn toàn ánh nắng chiếu xuống tấm pin.',
    },
    keyMetric: {
      en: '45.16 km off-world marathon · 57x planned lifespan',
      vi: 'Hành trình 45,16 km · Vượt 57 lần tuổi thọ thiết kế',
    },
    nasaPhotoId: 'PIA23177',
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
      en: 'Apollo 11 Lunar Laser Ranging Retroreflector (LRRR)',
      vi: 'Gương Phản xạ Laser Mặt Trăng Apollo 11 (LRRR)',
    },
    siteName: {
      en: 'Mare Tranquillitatis (Sea of Tranquility), Moon',
      vi: 'Biển Tĩnh Lặng (Mare Tranquillitatis), Mặt Trăng',
    },
    missionDates: {
      en: 'Deployed 20 July 1969 · Active in 2026 (57+ Years)',
      vi: 'Lắp đặt 20/07/1969 · Đang hoạt động năm 2026 (Hơn 57 năm)',
    },
    statusBadge: {
      en: 'STILL ACTIVE · PASSIVE OPTICAL',
      vi: 'VẪN ĐANG HOẠT ĐỘNG · QUANG HỌC THỤ ĐỘNG',
    },
    statusTone: 'emerald',
    geology: {
      en: 'Dark flood basalt lunar mare plains formed 3.8 billion years ago, blanketed in fine silicate regolith with zero atmospheric wind.',
      vi: 'Đồng bằng bazan tối màu hình thành cách đây 3,8 tỷ năm, phủ lớp bụi silicat mịn và hoàn toàn không có gió khí quyển.',
    },
    summary: {
      en: 'A 46-cm anodized aluminum tray holding 100 fused-silica corner-cube prisms placed by Buzz Aldrin and Neil Armstrong. Because it needs zero electrical power, Earth observatories bounce green laser pulses off it tonight to measure lunar distance to millimeter precision.',
      vi: 'Khay nhôm 46 cm gắn 100 lăng kính góc thạch anh tinh khiết do Neil Armstrong và Buzz Aldrin đặt xuống. Không cần bất kỳ nguồn điện hay tấm pin nào, nó vẫn phản xạ chùm tia laser xanh từ Trái Đất mỗi đêm với độ chính xác từng milimét.',
    },
    keyMetric: {
      en: '0 Watts required · Proves Moon recedes 3.8 cm/year',
      vi: 'Tiêu thụ 0 Watt điện · Chứng minh Mặt Trăng lùi xa 3,8 cm/năm',
    },
    nasaPhotoId: 'AS11-40-5952',
  },
];

export const INSIGHT_HOTSPOTS: HardwareHotspot[] = [
  {
    id: 'seis',
    position3D: [1.45, -0.62, 0.9],
    code: 'SEIS · CNES/JPL',
    title: {
      en: 'SEIS Seismometer (Planet’s Stethoscope)',
      vi: 'Máy đo địa chấn SEIS (Ống nghe hành tinh)',
    },
    specs: {
      en: 'Mass: 29 kg · Sensitivity: < 10⁻¹⁰ m/s² (smaller than a hydrogen atom)',
      vi: 'Khối lượng: 29 kg · Độ nhạy: < 10⁻¹⁰ m/s² (nhỏ hơn bán kính nguyên tử hydro)',
    },
    description: {
      en: 'Placed directly on Elysium Planitia regolith 1.63 meters from the lander deck on Dec 19, 2018. Contains three pendulum Very Broad Band (VBB) sensors sealed inside a titanium vacuum sphere.',
      vi: 'Được cánh tay robot đặt trực tiếp lên đất Sao Hỏa cách thân trạm 1,63 mét vào ngày 19/12/2018. Bên trong quả cầu chân không bằng titan là 3 cảm biến con lắc dải tần cực rộng.',
    },
  },
  {
    id: 'wts',
    position3D: [1.45, -0.35, 0.9],
    code: 'WTS · THERMAL DOME',
    title: {
      en: 'Wind and Thermal Shield (WTS)',
      vi: 'Lồng Chắn Gió và Nhiệt độ (WTS)',
    },
    specs: {
      en: 'Diameter: 66 cm · Aerodynamic gold-Chainmail skirt + thermal blanket',
      vi: 'Đường kính: 66 cm · Váy xích kim loại ôm sát địa hình + lớp cách nhiệt',
    },
    description: {
      en: 'Lowered over SEIS on Feb 2, 2019. Blocks Martian wind gusts and cushions the 90°C daily temperature swing so thermal expansion does not mask faint seismic tremors.',
      vi: 'Hạ xuống chụp lên trên SEIS ngày 02/02/2019. Ngăn gió Sao Hỏa làm rung cảm biến và giảm sốc nhiệt chênh lệch 90°C giữa ngày và đêm.',
    },
  },
  {
    id: 'arrays',
    position3D: [-2.15, 0.25, 0.0],
    code: 'ULTRAFLX · 2.15m WINGS',
    title: {
      en: 'Twin Decagonal Solar Arrays',
      vi: 'Cặp Cánh Pin Mặt Trời Hình Thập Giác',
    },
    specs: {
      en: 'Span: 6.0 m · Area: 7.3 m² · Output: ~5,000 Wh/sol clean → ~500 Wh/sol dusty',
      vi: 'Sải cánh: 6,0 m · Diện tích: 7,3 m² · Công suất: ~5.000 Wh/sol → ~500 Wh/sol khi phủ bụi',
    },
    description: {
      en: 'Unfolded like paper fans minutes after touchdown. Because Mars orbits 1.5x farther from the Sun than Earth, InSight needed broad wings—which also acted like wide dinner plates catching falling iron-oxide dust.',
      vi: 'Xòe ra như hai chiếc quạt giấy ngay sau khi chạm đất. Vì Sao Hỏa ở xa Mặt Trời gấp 1,5 lần Trái Đất, InSight cần diện tích thu sáng lớn—nhưng cũng chính bề mặt rộng này đã hứng trọn bụi sắt oxit lắng xuống.',
    },
  },
  {
    id: 'arm',
    position3D: [0.65, 0.55, 0.55],
    code: 'IDA · 1.8m GRAPPLE',
    title: {
      en: 'Instrument Deployment Arm (IDA) & IDC Camera',
      vi: 'Cánh tay Robot Triển khai Thiết bị (IDA) & Camera IDC',
    },
    specs: {
      en: 'Reach: 1.8 meters · 4 degrees of freedom · 5-finger mechanical grapple claw',
      vi: 'Tầm với: 1,8 mét · 4 bậc tự do · Móc gắp cơ khí 5 ngón',
    },
    description: {
      en: 'Lifted SEIS, the Wind Shield, and HP³ off the upper deck and set them gently on the ground. Its elbow-mounted camera (IDC) stitched together the iconic 2018 and 2022 lander selfies.',
      vi: 'Nâng SEIS, lồng chắn gió WTS và mũi khoan HP³ từ mặt boong đặt xuống nền đất. Camera gắn ở khuỷu tay (IDC) đã chụp ghép những bức ảnh tự sướng lịch sử năm 2018 và 2022.',
    },
  },
  {
    id: 'hp3',
    position3D: [-0.85, -0.58, 1.05],
    code: 'HP³ · DLR HEAT PROBE',
    title: {
      en: 'HP³ "The Mole" Heat Flow Probe',
      vi: 'Mũi khoan Nhiệt lượng HP³ ("Chuột Chũi")',
    },
    specs: {
      en: 'Target Depth: 5.0 m · Actual Final Depth: ~40 cm · Internal tungsten hammer',
      vi: 'Độ sâu mục tiêu: 5,0 m · Độ sâu thực tế: ~40 cm · Búa đập vonfram bên trong',
    },
    description: {
      en: 'A 40-cm self-hammering spike designed to measure heat escaping Mars’ interior. Unexpectedly cohesive, cement-like duricrust soil denied the probe the friction it needed, turning a setback into a vital soil-mechanics discovery.',
      vi: 'Cọc tự đóng dài 40 cm được chế tạo để đo dòng nhiệt thoát ra từ lòng Sao Hỏa. Lớp đất đóng vảng kết dính bất ngờ (duricrust) khiến mũi khoan thiếu ma sát thành vách, biến một giới hạn kỹ thuật thành dữ liệu địa cơ học quý giá.',
    },
  },
  {
    id: 'uhf',
    position3D: [-0.55, 0.68, -0.45],
    code: 'UHF & RISE · TELEMETRY',
    title: {
      en: 'UHF Helical Antenna & RISE X-Band Transponder',
      vi: 'Ăng-ten Xoắn UHF & Thiết bị Vô tuyến RISE',
    },
    specs: {
      en: 'Relay: Mars Reconnaissance Orbiter & Odyssey · Doppler precision: < 10 cm',
      vi: 'Tiếp sóng: Tàu quỹ đạo MRO & Odyssey · Độ chính xác Doppler: < 10 cm',
    },
    description: {
      en: 'Beamed daily seismic logs up to passing Mars orbiters and tracked tiny wobbles in Mars’ north pole spin axis (nutation), proving the planet’s 1,830-km core is molten liquid.',
      vi: 'Truyền dữ liệu địa chấn lên các tàu quỹ đạo bay ngang qua và đo độ đảo trục quay cực nhỏ của Sao Hỏa, chứng minh lõi hành tinh (bán kính ~1.830 km) ở trạng thái lỏng.',
    },
  },
];

export const CHAPTER_TITLES: { num: string; title: Record<Language, string>; subtitle: Record<Language, string> }[] = [
  {
    num: '01',
    title: { en: 'The Message After Silence', vi: 'Tín hiệu sau sự im lặng' },
    subtitle: { en: 'Elysium Planitia · Sol 1440 to 2026', vi: 'Elysium Planitia · Sol 1440 đến 2026' },
  },
  {
    num: '02',
    title: { en: 'Planetary GIS Observatory', vi: 'Đài quan sát Bản đồ GIS Hành tinh' },
    subtitle: { en: 'MOLA Mars & LRO Moon Coordinate Registry', vi: 'Hệ tọa độ Sao Hỏa MOLA & Mặt Trăng LRO' },
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
    subtitle: { en: 'Seismic Oscilloscope & 60x Web Audio Sonification', vi: 'Dao động ký Địa chấn & Âm thanh hóa 60x' },
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
    title: { en: 'Explorer Challenge & Transparency Ledger', vi: 'Thử thách Nhà thám hiểm & Sổ cái Minh bạch' },
    subtitle: { en: '4-Question Review, Mission Patch & Primary Archives', vi: '4 Câu hỏi Ôn tập, Huy hiệu Sứ mệnh & Nguồn dữ liệu' },
  },
];

export const QUIZ_QUESTIONS = [
  {
    id: 0,
    question: {
      en: '1. Why was InSight built as a stationary three-legged lander without wheels, unlike the Opportunity rover?',
      vi: '1. Vì sao InSight được thiết kế là trạm đổ bộ 3 chân đứng yên không có bánh xe, khác với xe tự hành Opportunity?',
    },
    options: {
      en: [
        'NASA ran out of titanium wheels before the May 2018 launch.',
        'Its SEIS seismometer required a quiet, motionless anchor to measure sub-atomic ground vibrations across the entire planet.',
        'Elysium Planitia is covered in liquid water oceans that wheels cannot cross.',
      ],
      vi: [
        'NASA hết vật liệu chế tạo bánh xe titan trước ngày phóng tháng 5/2018.',
        'Máy đo địa chấn SEIS cần một điểm tựa tĩnh lặng tuyệt đối trên mặt đất để bắt được các rung động nhỏ hơn nguyên tử hydro xuyên qua toàn hành tinh.',
        'Đồng bằng Elysium Planitia ngập nước lỏng nên bánh xe không thể di chuyển.',
      ],
    },
    correctIndex: 1,
    explanation: {
      en: 'Verified (NASA/JPL SEIS Archive): A rolling rover creates mechanical noise. By sitting still on Elysium Planitia and placing SEIS directly on the soil under a Wind and Thermal Shield, InSight could detect seismic waves from thousands of kilometers away.',
      vi: 'Chính xác (Hồ sơ NASA/JPL SEIS): Xe tự hành di chuyển sẽ tạo ra tạp âm cơ học. Nhờ đứng yên tại Elysium Planitia và đặt SEIS trực tiếp lên nền đất dưới lồng chắn gió WTS, InSight có thể lắng nghe sóng địa chấn từ cách xa hàng nghìn kilômét.',
    },
  },
  {
    id: 1,
    question: {
      en: '2. What caused InSight’s electrical power to drop from ~5,000 Wh/sol in late 2018 down to ~500 Wh/sol by 2022?',
      vi: '2. Nguyên nhân nào khiến sản lượng điện của InSight giảm từ ~5.000 Wh/sol cuối năm 2018 xuống chỉ còn ~500 Wh/sol vào năm 2022?',
    },
    options: {
      en: [
        'The Sun cooled down by 90% between 2018 and 2022.',
        'Martianquakes cracked the copper wires inside the robotic arm.',
        'Fine iron-oxide Martian dust settled onto the twin decagonal solar panels without strong cleaning gusts (dust devils) to sweep them clean.',
      ],
      vi: [
        'Mặt Trời giảm 90% nhiệt lượng chiếu sáng trong giai đoạn 2018–2022.',
        'Các trận động đất Sao Hỏa làm đứt dây đồng bên trong cánh tay robot.',
        'Bụi mịn oxit sắt lắng đọng dày đặc trên hai cánh pin mặt trời mà không có các cơn lốc bụi đủ mạnh quét sạch.',
      ],
    },
    correctIndex: 2,
    explanation: {
      en: 'Verified (NASA Power Generation Archive PIA25287): Over 1,440 sols, airborne Martian dust coated the 7.3 m² solar arrays, cutting daily energy by ~90% until the batteries depleted on December 15, 2022.',
      vi: 'Chính xác (Dữ liệu Năng lượng NASA PIA25287): Sau 1.440 sol, lớp bụi mịn trong khí quyển Sao Hỏa phủ kín 7,3 m² diện tích pin mặt trời, làm mất ~90% lượng điện mỗi ngày cho đến khi ắc-quy cạn kiệt vào ngày 15/12/2022.',
    },
  },
  {
    id: 2,
    question: {
      en: '3. What did the 1,319 marsquakes recorded by SEIS and the RISE radio transponder reveal about Mars’ deep interior?',
      vi: '3. Dữ liệu từ 1.319 trận động đất Sao Hỏa (SEIS) và tín hiệu vô tuyến RISE đã tiết lộ điều gì về cấu trúc sâu bên trong Sao Hỏa?',
    },
    options: {
      en: [
        'Mars has a layered crust (~24–72 km thick), a silicate mantle, and a large molten liquid iron-alloy core (~1,830 km radius).',
        'Mars is completely hollow inside like a ping-pong ball.',
        'Mars has no core at all—only frozen carbon dioxide ice all the way to the center.',
      ],
      vi: [
        'Sao Hỏa có lớp vỏ phân tầng (dày ~24–72 km), lớp manti silicat và một lõi hợp kim sắt nóng chảy kích thước lớn (bán kính ~1.830 km).',
        'Bên trong Sao Hỏa hoàn toàn rỗng như một quả bóng bàn.',
        'Sao Hỏa không có lõi kim loại mà chỉ toàn băng khí cacbonic đóng cứng tới tận tâm.',
      ],
    },
    correctIndex: 0,
    explanation: {
      en: 'Verified (Science / NASA InSight Interior Models 2021–2025): P-wave and S-wave reflections off the core-mantle boundary proved Mars possesses a liquid iron-alloy core enriched with lighter elements, ~1,830 km in radius.',
      vi: 'Chính xác (Mô hình Nội tâm Sao Hỏa của NASA / Tạp chí Science): Sự khúc xạ và phản xạ của sóng P và sóng S tại ranh giới manti–lõi đã chứng minh Sao Hỏa có lõi hợp kim sắt lỏng giàu nguyên tố nhẹ với bán kính khoảng 1.830 km.',
    },
  },
  {
    id: 3,
    question: {
      en: '4. Why does the Apollo 11 Lunar Laser Ranging Retroreflector (1969-059C) still operate in 2026 after 57+ years, while InSight and Opportunity fell silent?',
      vi: '4. Vì sao Gương phản xạ Laser Apollo 11 (1969-059C) từ năm 1969 vẫn hoạt động tốt vào năm 2026 sau hơn 57 năm, trong khi InSight và Opportunity đều đã ngừng hoạt động?',
    },
    options: {
      en: [
        'Apollo astronauts return to the Sea of Tranquility every five years to replace its AA batteries.',
        'It is a passive optical array of 100 fused-silica corner-cube prisms that requires 0 Watts of electricity and sits on an airless Moon free of global dust storms.',
        'It draws geothermal steam power from active lunar volcanoes.',
      ],
      vi: [
        'Các phi hành gia quay lại Biển Tĩnh Lặng 5 năm một lần để thay pin mới.',
        'Đây là thiết bị quang học thụ động gồm 100 lăng kính góc thạch anh không cần một giọt điện nào (0 Watt) và đặt trên Mặt Trăng không có bão bụi khí quyển.',
        'Thiết bị chạy bằng hơi nước địa nhiệt từ các núi lửa đang phun trào trên Mặt Trăng.',
      ],
    },
    correctIndex: 1,
    explanation: {
      en: 'Verified (NSSDCA 1969-059C): Corner-cube prisms reflect incoming laser photons straight back toward Earth observatories by pure optical geometry—zero batteries, zero transmitters, and zero solar panels required.',
      vi: 'Chính xác (Hồ sơ NSSDCA 1969-059C): Các lăng kính góc phản xạ chùm hạt photon laser quay ngược trở lại đài quan sát Trái Đất hoàn toàn nhờ định luật quang học hình học—không cần ắc-quy, không cần bộ phát sóng hay pin mặt trời.',
    },
  },
];

export const OFFICIAL_REFERENCES = [
  {
    id: 1,
    category: 'CHALLENGE BRIEF',
    title: '2026 NASA International Space Apps Challenge — "Abandoned but not Forgotten: Storytelling about NASA’s Discarded Equipment on the Moon and Mars"',
    url: 'https://www.spaceappschallenge.org/2026/challenges/nasas-discarded-equipment-storytelling/',
    verifiedFact: 'Official challenge scope: humanizing silent/discarded lunar and Martian hardware through accurate science storytelling.',
  },
  {
    id: 2,
    category: 'NSSDCA CATALOG',
    title: 'NASA NSSDCA Master Catalog — InSight Lander (NSSDCA ID: 2018-042A)',
    url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2018-042A',
    verifiedFact: 'Launch: 5 May 2018; Landing: 26 Nov 2018 at 4.502°N, 135.623°E (Elysium Planitia); Last Contact: 15 Dec 2022.',
  },
  {
    id: 3,
    category: 'NSSDCA CATALOG',
    title: 'NASA NSSDCA Master Catalog — Opportunity Rover / MER-B (NSSDCA ID: 2003-032A)',
    url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2003-032A',
    verifiedFact: 'Landed 25 Jan 2004 at Meridiani Planum (1.946°S, 354.473°E); operated 5,111 sols (45.16 km) until 10 June 2018 global dust storm.',
  },
  {
    id: 4,
    category: 'NSSDCA CATALOG',
    title: 'NASA NSSDCA Experiment Record — Apollo 11 Lunar Laser Ranging Retroreflector (NSSDCA ID: 1969-059C-03)',
    url: 'https://nssdc.gsfc.nasa.gov/nmc/experiment/display.action?id=1969-059C-03',
    verifiedFact: 'Deployed 20 July 1969 at Mare Tranquillitatis (0.674°N, 23.473°E); 100 fused-silica corner-cube prisms; passive optical operation continuing in 2026 (~3.8 cm/yr lunar recession).',
  },
  {
    id: 5,
    category: 'NASA MISSION PORTAL',
    title: 'NASA Science — InSight Mars Lander Mission Overview & Science Objectives',
    url: 'https://science.nasa.gov/mission/insight/science/',
    verifiedFact: 'Interior Exploration using Seismic Investigations, Geodesy and Heat Transport (crust, mantle, and core structure).',
  },
  {
    id: 6,
    category: 'INSTRUMENT ARCHIVE',
    title: 'NASA Science — InSight Science Instruments (SEIS, HP³, RISE, IDA)',
    url: 'https://science.nasa.gov/mission/insight/science-instruments/',
    verifiedFact: 'SEIS deployed 19 Dec 2018; WTS deployed 2 Feb 2019; HP³ mole reached ~40 cm depth due to cohesive Martian duricrust.',
  },
  {
    id: 7,
    category: 'SEISMIC CATALOG',
    title: 'NASA/JPL Photojournal — Impactor Debris & 1,319 Total Recorded Marsquakes',
    url: 'https://science.nasa.gov/photojournal/impactor-debris-scattered-within-mars-mantle-artists-concept/',
    verifiedFact: 'First likely marsquake recorded 6 April 2019 (Sol 128); total cataloged seismic events across mission: 1,319.',
  },
  {
    id: 8,
    category: 'POWER TELEMETRY',
    title: 'NASA Science Resource — InSight’s Power Generation After Landing and Spring 2022',
    url: 'https://science.nasa.gov/resource/insights-power-generation-after-landing-and-spring-2022/',
    verifiedFact: 'Clean decagonal solar arrays produced ~5,000 Wh per Martian day (sol) after landing; dust accumulation reduced output to ~500 Wh/sol (~90% drop) by Spring 2022.',
  },
  {
    id: 9,
    category: 'SEISMIC AUDIO',
    title: 'NASA Science Resource — Listen to NASA’s InSight at Work on Mars (60x Sonification)',
    url: 'https://science.nasa.gov/resource/listen-to-nasas-insight-at-work-on-mars/',
    verifiedFact: 'Sub-audible Martian ground vibrations processed and sped up 60x to bring P/S waves into human hearing range.',
  },
  {
    id: 10,
    category: 'NASA PHOTOJOURNAL',
    title: 'NASA/JPL Photojournal — PIA22876 (First Selfie, Dec 2018) & PIA25287 (Final Selfie, April 2022)',
    url: 'https://science.nasa.gov/photojournal/insights-final-selfie/',
    verifiedFact: 'Visual verification of dust accumulation on the lander deck and solar wings between Sol 10 and Sol 1211.',
  },
  {
    id: 11,
    category: 'RETIREMENT DISPATCH',
    title: 'NASA/JPL News Release — NASA Retires InSight Mars Lander Mission After Years of Science (21 Dec 2022)',
    url: 'https://www.jpl.nasa.gov/news/nasa-retires-insight-mars-lander-mission-after-years-of-science/',
    verifiedFact: 'Final contact received 15 December 2022; mission formally declared complete on 21 December 2022 after two consecutive missed communication passes.',
  },
  {
    id: 12,
    category: 'NASA 3D VISUALIZATION',
    title: 'NASA Eyes on the Solar System — Interactive 3D Spacecraft View (sc_insight)',
    url: 'https://eyes.nasa.gov/apps/solar-system/#/sc_insight',
    verifiedFact: 'Official NASA/JPL real-time 3D web visualization of the InSight spacecraft geometry.',
  },
];
