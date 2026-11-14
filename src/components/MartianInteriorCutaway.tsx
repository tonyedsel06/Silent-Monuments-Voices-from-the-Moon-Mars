import React, { useState } from 'react';
import { Language } from '../data/bilingualContent';

type InteriorLayerId = 'crust' | 'mantle' | 'core';

interface LayerSpec {
  id: InteriorLayerId;
  title: Record<Language, string>;
  depthLabel: Record<Language, string>;
  seismicVelocity: string;
  uncertaintyNote: Record<Language, string>;
  description: Record<Language, string>;
}

const INTERIOR_LAYERS: LayerSpec[] = [
  {
    id: 'crust',
    title: {
      en: '1. Fractured Basaltic Crust (24–72 km Thick)',
      vi: '1. Lớp Vỏ Bazan Phân tầng (Dày ~24–72 km)',
    },
    depthLabel: {
      en: 'Depth: 0 to ~39 km beneath InSight (Global avg 24–72 km)',
      vi: 'Độ sâu: 0 đến ~39 km dưới chân InSight (Trung bình toàn cầu 24–72 km)',
    },
    seismicVelocity: 'Vp ≈ 3.5 – 6.2 km/s · Vs ≈ 2.0 – 3.5 km/s',
    uncertaintyNote: {
      en: 'Uncertainty Margin: Two-layer vs. three-layer crustal sub-models depend on local porosity and impact fracturing.',
      vi: 'Biên độ sai số: Mô hình vỏ 2 lớp hay 3 lớp phụ thuộc vào độ rỗng và mức độ nứt vỡ do thiên thạch tại từng vùng.',
    },
    description: {
      en: 'Rich in radioactive heat-producing elements. Directly beneath Elysium Planitia, SEIS detected three distinct crustal interfaces where seismic waves change speed.',
      vi: 'Giàu các nguyên tố phóng xạ sinh nhiệt. Ngay bên dưới đồng bằng Elysium Planitia, SEIS phát hiện các ranh giới phân lớp rõ rệt nơi vận tốc sóng địa chấn thay đổi.',
    },
  },
  {
    id: 'mantle',
    title: {
      en: '2. Silicate Lithosphere & Mantle (~1,560 km Thick)',
      vi: '2. Thạch quyển & Lớp Manti Silicat (Dày ~1.560 km)',
    },
    depthLabel: {
      en: 'Depth: ~40 km down to ~1,560 km',
      vi: 'Độ sâu: ~40 km xuống tới ~1.560 km',
    },
    seismicVelocity: 'Vp ≈ 7.3 – 8.2 km/s · Vs ≈ 4.1 – 4.5 km/s',
    uncertaintyNote: {
      en: 'Uncertainty Margin: Thermal gradient derived from seismic lithosphere thickness (~400–500 km) rather than direct 5-m HP³ heat flow.',
      vi: 'Biên độ sai số: Độ dốc nhiệt được suy ra gián tiếp từ độ dày thạch quyển địa chấn (~400–500 km) do mũi khoan HP³ dừng ở 40 cm.',
    },
    description: {
      en: 'Unlike Earth, Mars lacks active plate tectonics; its rigid outer lithosphere forms a single thick stagnant lid over a slowly convecting iron-rich silicate mantle.',
      vi: 'Khác với Trái Đất, Sao Hỏa không có kiến tạo mảng dịch chuyển; lớp thạch quyển cứng bên ngoài tạo thành một "nắp đậy" liền khối bao bọc lớp manti silicat giàu sắt.',
    },
  },
  {
    id: 'core',
    title: {
      en: '3. Molten Liquid Iron-Nickel-Sulfur Core (~1,830 km Radius)',
      vi: '3. Lõi Hợp kim Sắt–Niken–Lưu huỳnh Lỏng (Bán kính ~1.830 km)',
    },
    depthLabel: {
      en: 'Radius: ~1,830 ± 40 km (Over half of Mars’ total radius)',
      vi: 'Bán kính: ~1.830 ± 40 km (Lớn hơn một nửa bán kính Sao Hỏa)',
    },
    seismicVelocity: 'S-waves blocked (Vs = 0 km/s in liquid) · P-waves refracted',
    uncertaintyNote: {
      en: 'Uncertainty Margin: Recent 2023–2025 seismic re-analyses suggest a possible thin molten silicate layer blanketing a ~1,650–1,830 km metallic core.',
      vi: 'Biên độ sai số: Các phân tích địa chấn mới (2023–2025) cho thấy có thể tồn tại một lớp silicat nóng chảy mỏng bao quanh lõi kim loại ~1.650–1.830 km.',
    },
    description: {
      en: 'Confirmed by S-wave reflections (ScS) and RISE radio nutation tracking. Because shear S-waves cannot travel through liquid, the core casts a seismic shadow zone while bending P-waves.',
      vi: 'Được xác nhận nhờ sóng phản xạ ScS và phép đo vô tuyến RISE. Vì sóng ngang S không thể truyền qua chất lỏng, lõi Sao Hỏa chặn đứng sóng S và bẻ cong đường truyền của sóng dọc P.',
    },
  },
];

interface MartianInteriorCutawayProps {
  lang: Language;
}

export const MartianInteriorCutaway: React.FC<MartianInteriorCutawayProps> = ({ lang }) => {
  const [selectedLayer, setSelectedLayer] = useState<InteriorLayerId>('core');
  const [hp3DepthCm, setHp3DepthCm] = useState<number>(40);

  const activeLayer =
    INTERIOR_LAYERS.find((l) => l.id === selectedLayer) ?? INTERIOR_LAYERS[2];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* Left 7 cols: Interactive Martian Interior Cutaway & Seismic Ray Paths */}
      <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-[#0B1220] p-5 flex flex-col justify-between">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <span className="text-xs font-mono text-[#64DFDF] font-semibold">
              [EDUCATIONAL SIMULATION · CONCEPTUAL CUTAWAY · NOT TO SCALE]
            </span>
            <span className="text-xs font-mono text-[#F4A261]">
              [VERIFIED NASA/NSSDCA DATA: CORE ~1,830 KM]
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
            {INTERIOR_LAYERS.map((layer) => {
              const active = layer.id === selectedLayer;
              return (
                <button
                  key={layer.id}
                  type="button"
                  onClick={() => setSelectedLayer(layer.id)}
                  className={`py-2 px-3 rounded-lg font-mono text-xs font-semibold border transition-colors ${
                    active
                      ? 'bg-[#F4A261] text-[#070B14] border-[#F4A261]'
                      : 'bg-[#0E1729] text-slate-300 border-slate-800 hover:border-slate-600'
                  }`}
                >
                  {layer.id.toUpperCase()}
                </button>
              );
            })}
          </div>

          {/* Interactive SVG Planetary Cutaway with P-wave and S-wave refraction */}
          <div className="relative rounded-lg border border-slate-800 bg-[#070B14] p-3 flex items-center justify-center">
            <svg
              viewBox="0 0 540 310"
              className="w-full max-h-[280px]"
              role="img"
              aria-label="Martian Interior Cutaway Diagram with P-wave and S-wave ray paths"
            >
              {/* Outer Crust Circle */}
              <circle
                cx="270"
                cy="155"
                r="132"
                fill="#5A281D"
                stroke={selectedLayer === 'crust' ? '#64DFDF' : '#F4A261'}
                strokeWidth={selectedLayer === 'crust' ? '4' : '2'}
                className="cursor-pointer"
                onClick={() => setSelectedLayer('crust')}
              />
              {/* Silicate Mantle Circle */}
              <circle
                cx="270"
                cy="155"
                r="116"
                fill="#9E4328"
                stroke={selectedLayer === 'mantle' ? '#64DFDF' : '#E2E8F0'}
                strokeWidth={selectedLayer === 'mantle' ? '3.5' : '1.2'}
                className="cursor-pointer"
                onClick={() => setSelectedLayer('mantle')}
              />
              {/* Liquid Iron-Alloy Core (~1,830 km / ~54% of Mars radius) */}
              <circle
                cx="270"
                cy="155"
                r="66"
                fill="#F4A261"
                stroke={selectedLayer === 'core' ? '#64DFDF' : '#FFFBEB'}
                strokeWidth={selectedLayer === 'core' ? '4' : '2'}
                className="cursor-pointer"
                onClick={() => setSelectedLayer('core')}
              />

              {/* Quake Epicenter on left limb */}
              <circle cx="145" cy="112" r="6" fill="#64DFDF" />
              <text x="20" y="105" fill="#64DFDF" fontSize="11" fontFamily="JetBrains Mono, monospace">
                MARSQUAKE SOURCE
              </text>

              {/* InSight SEIS Receiver at top */}
              <polygon points="270,15 263,26 277,26" fill="#FFD1A6" />
              <text x="284" y="23" fill="#FFD1A6" fontSize="11" fontFamily="JetBrains Mono, monospace">
                INSIGHT SEIS (4.5°N)
              </text>

              {/* Mantle P & S curved paths to InSight */}
              <path
                d="M145 112 Q210 92 270 23"
                fill="none"
                stroke="#64DFDF"
                strokeWidth="2.2"
              />
              {/* Core-reflected ScS wave */}
              <path
                d="M145 112 Q205 122 228 106 Q252 68 270 23"
                fill="none"
                stroke="#FFD1A6"
                strokeWidth="2"
                strokeDasharray="5 3"
              />
              {/* Core-refracted PKP P-wave bending through liquid core */}
              <path
                d="M145 112 Q182 132 206 142 L334 168 Q368 182 395 190"
                fill="none"
                stroke="#F8F9FA"
                strokeWidth="1.8"
                strokeDasharray="3 3"
              />

              <text x="232" y="159" fill="#070B14" fontSize="12" fontWeight="700" fontFamily="JetBrains Mono, monospace">
                CORE ~1,830 km
              </text>
              <text x="236" y="80" fill="#FFFBEB" fontSize="11" fontFamily="JetBrains Mono, monospace">
                MANTLE
              </text>
              <text x="18" y="294" fill="#94A3B8" fontSize="10" fontFamily="JetBrains Mono, monospace">
                Solid Cyan: Direct P/S Wave · Dashed Gold: Core-Reflected ScS · Dotted White: Refracted Core P-Wave
              </text>
            </svg>
          </div>
        </div>

        {/* Selected Layer Telemetry Readout */}
        <div className="mt-4 p-4 rounded-lg border border-slate-800 bg-[#0E1729]">
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
            <h3 className="text-base font-semibold text-white">{activeLayer.title[lang]}</h3>
            <span className="text-xs font-mono text-[#64DFDF]">{activeLayer.seismicVelocity}</span>
          </div>
          <div className="text-xs font-mono text-[#F4A261] mb-2">{activeLayer.depthLabel[lang]}</div>
          <p className="text-sm text-slate-200 leading-relaxed mb-2">
            {activeLayer.description[lang]}
          </p>
          <p className="text-xs font-mono text-slate-400 border-t border-slate-800 pt-2">
            {activeLayer.uncertaintyNote[lang]}
          </p>
        </div>
      </div>

      {/* Right 5 cols: "When Engineering Hits a Wall — The HP³ 'Mole' Forensic Story" */}
      <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-[#0B1220] p-5 flex flex-col justify-between">
        <div>
          <div className="text-xs font-mono text-[#F4A261] font-semibold mb-1">
            FORENSIC ENGINEERING CASE · HP³ HEAT PROBE
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {lang === 'en'
              ? 'When Engineering Hits a Wall: The HP³ "Mole" Story'
              : 'Khi Kỹ thuật Gặp Tường Đá: Bài học từ Mũi khoan HP³'}
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed mb-4">
            {lang === 'en'
              ? 'Designed by the German Aerospace Center (DLR), the 40-cm "Mole" was built to hammer 5 meters (500 cm) underground to measure Mars’ internal heat flow. Instead, it stalled at just ~40 cm.'
              : 'Do Trung tâm Hàng không Vũ trụ Đức (DLR) chế tạo, mũi khoan tự đóng dài 40 cm ("Chuột Chũi") được thiết kế để xuyên sâu 5 mét (500 cm) nhằm đo dòng nhiệt lòng đất. Nhưng nó đã dừng lại ở độ sâu chỉ ~40 cm.'}
          </p>

          {/* Interactive Depth Comparison Visualizer */}
          <div className="p-4 rounded-lg border border-slate-800 bg-[#070B14] mb-4">
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="text-slate-300">
                {lang === 'en' ? 'Inspect Subsurface Regolith Profile:' : 'Khảo sát tầng đất dưới chân trạm:'}
              </span>
              <span className="text-[#FFD1A6] font-semibold">
                {hp3DepthCm === 40
                  ? lang === 'en'
                    ? 'ACTUAL DEPTH: 40 cm (Cohesive Duricrust)'
                    : 'ĐỘ SÂU THỰC TẾ: 40 cm (Lớp đất kết dính Duricrust)'
                  : lang === 'en'
                    ? 'DESIGN TARGET: 500 cm (5.0 Meters)'
                    : 'MỤC TIÊU THIẾT KẾ: 500 cm (5,0 Mét)'}
              </span>
            </div>

            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setHp3DepthCm(40)}
                className={`flex-1 py-1.5 px-2.5 text-xs font-mono rounded border transition-colors ${
                  hp3DepthCm === 40
                    ? 'bg-[#F4A261] text-[#070B14] font-semibold border-[#F4A261]'
                    : 'bg-[#0E1729] text-slate-300 border-slate-800'
                }`}
              >
                {lang === 'en' ? 'Actual: ~40 cm (Duricrust)' : 'Thực tế: ~40 cm (Đất đóng vảng)'}
              </button>
              <button
                type="button"
                onClick={() => setHp3DepthCm(500)}
                className={`flex-1 py-1.5 px-2.5 text-xs font-mono rounded border transition-colors ${
                  hp3DepthCm === 500
                    ? 'bg-[#64DFDF] text-[#070B14] font-semibold border-[#64DFDF]'
                    : 'bg-[#0E1729] text-slate-300 border-slate-800'
                }`}
              >
                {lang === 'en' ? 'Planned: 500 cm (5.0 m)' : 'Thiết kế: 500 cm (5,0 m)'}
              </button>
            </div>

            <div className="relative h-36 rounded border border-slate-800 bg-[#140D0B] overflow-hidden p-3">
              <div className="absolute inset-x-0 top-0 h-11 bg-[#5C291C]/70 border-b border-dashed border-[#F4A261]/50 flex items-center px-3 text-[11px] font-mono text-[#FFD1A6]">
                0–40 cm: Cemented Salt Duricrust (Lacks loose sand friction!)
              </div>
              <div className="absolute inset-x-0 top-11 bottom-0 flex items-center px-3 text-[11px] font-mono text-slate-400">
                40–500 cm: Deep Fragmented Regolith &amp; Basalt Target Zone
              </div>
              {/* Animated Mole Spike Indicator */}
              <div
                className="absolute right-8 w-4 bg-[#64DFDF] border border-white rounded-b transition-all duration-300"
                style={{
                  top: '4px',
                  height: hp3DepthCm === 40 ? '34px' : '128px',
                }}
              />
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-lg border border-slate-800 bg-[#0E1729] text-xs text-slate-300 leading-relaxed">
          <strong className="text-[#FFD1A6] block mb-1">
            {lang === 'en'
              ? 'Why Negative Results Matter in Science:'
              : 'Vì sao thất bại kỹ thuật lại là dữ liệu quý giá:'}
          </strong>
          {lang === 'en'
            ? 'The Mole needed loose sand falling around its hull to provide recoil friction. Instead, Elysium Planitia’s soil was cemented into a crusty "duricrust." By using the robotic arm scoop to press on the soil and bury the probe at 40 cm, engineers measured Martian soil thermal conductivity and cohesion—critical data for future astronaut habitats.'
            : 'Mũi khoan cần cát rời sập xuống ôm quanh thân để tạo ma sát chống giật lùi. Thế nhưng đất tại Elysium Planitia lại kết dính thành mảng cứng (duricrust). Nhờ dùng gàu múc trên cánh tay robot ép lên mặt đất để chôn kín mũi khoan ở mức 40 cm, các kỹ sư đã đo được độ dẫn nhiệt và lực kết dính thực tế của đất Sao Hỏa—dữ liệu sống còn khi xây căn cứ phi hành gia tương lai.'}
        </div>
      </div>
    </div>
  );
};
