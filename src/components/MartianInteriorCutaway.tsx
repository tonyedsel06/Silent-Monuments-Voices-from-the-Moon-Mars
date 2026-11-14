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
      vi: '1. Lớp Vỏ Bazan Phân Tầng (Dày ~24–72 km)',
    },
    depthLabel: {
      en: '0 to ~39 km beneath InSight · Global average 24–72 km',
      vi: '0 đến ~39 km dưới chân InSight · Trung bình toàn cầu 24–72 km',
    },
    seismicVelocity: 'Vp ≈ 3.5 – 6.2 km/s · Vs ≈ 2.0 – 3.5 km/s',
    uncertaintyNote: {
      en: 'Two-layer vs. three-layer crustal sub-models depend on local impact fracturing.',
      vi: 'Mô hình vỏ 2 lớp hay 3 lớp phụ thuộc vào mức độ nứt vỡ địa chất từng vùng.',
    },
    description: {
      en: 'Directly beneath Elysium Planitia, SEIS detected three distinct crustal boundaries where seismic waves speed up.',
      vi: 'Ngay bên dưới đồng bằng Elysium Planitia, SEIS phát hiện ba ranh giới phân lớp rõ rệt nơi sóng địa chấn đổi vận tốc.',
    },
  },
  {
    id: 'mantle',
    title: {
      en: '2. Silicate Lithosphere & Mantle (~1,560 km Thick)',
      vi: '2. Thạch Quyển & Lớp Manti Silicat (Dày ~1.560 km)',
    },
    depthLabel: {
      en: 'Depth: ~40 km down to ~1,560 km',
      vi: 'Độ sâu: ~40 km xuống tới ~1.560 km',
    },
    seismicVelocity: 'Vp ≈ 7.3 – 8.2 km/s · Vs ≈ 4.1 – 4.5 km/s',
    uncertaintyNote: {
      en: 'Thermal gradient inferred from seismic lithosphere thickness (~400–500 km).',
      vi: 'Độ dốc nhiệt được suy ra từ độ dày thạch quyển địa chấn (~400–500 km).',
    },
    description: {
      en: 'Mars lacks shifting tectonic plates; its rigid outer shell forms a single thick lid over a slowly convecting silicate mantle.',
      vi: 'Sao Hỏa không có kiến tạo mảng dịch chuyển; lớp vỏ ngoài tạo thành một nắp đậy liền khối bao bọc lớp manti silicat.',
    },
  },
  {
    id: 'core',
    title: {
      en: '3. Molten Liquid Iron-Alloy Core (~1,830 km Radius)',
      vi: '3. Lõi Hợp Kim Sắt Nóng Chảy (Bán Kính ~1.830 km)',
    },
    depthLabel: {
      en: 'Radius: ~1,830 ± 40 km (More than half of Mars’ radius)',
      vi: 'Bán kính: ~1.830 ± 40 km (Lớn hơn một nửa bán kính Sao Hỏa)',
    },
    seismicVelocity: 'Shear S-waves blocked (Vs = 0) · P-waves refracted',
    uncertaintyNote: {
      en: 'Recent seismic models also test a thin molten silicate layer blanketing the metallic core.',
      vi: 'Các mô hình mới cũng kiểm chứng khả năng có một lớp silicat nóng chảy mỏng bao quanh lõi kim loại.',
    },
    description: {
      en: 'Confirmed by S-wave reflections and RISE radio tracking. Because shear waves cannot pass through liquid, the molten core casts a clear seismic shadow.',
      vi: 'Xác nhận nhờ sóng phản xạ ScS và phép đo vô tuyến RISE. Vì sóng ngang không truyền qua chất lỏng, lõi nóng chảy tạo vùng bóng địa chấn rõ nét.',
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
      {/* Left 7 cols: Interactive Martian Interior Cutaway */}
      <div className="lg:col-span-7 rounded-2xl border border-[#F4A261]/25 bg-[#23140F]/95 p-5 flex flex-col justify-between shadow-2xl">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <span className="text-xs font-semibold text-[#64DFDF]">
              {lang === 'en'
                ? 'Conceptual Planetary Cutaway'
                : 'Lát cắt Cấu trúc Nội tâm Sao Hỏa'}
            </span>
            <a
              href="https://science.nasa.gov/mission/insight/science/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 rounded-full bg-[#311B13] border border-[#FFD1A6]/30 text-xs font-semibold text-[#FFD1A6] hover:bg-[#42251A]"
            >
              {lang === 'en' ? 'Source: NASA Science ↗' : 'Nguồn: NASA Science ↗'}
            </a>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
            {INTERIOR_LAYERS.map((layer) => {
              const active = layer.id === selectedLayer;
              return (
                <button
                  key={layer.id}
                  type="button"
                  onClick={() => setSelectedLayer(layer.id)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors uppercase ${
                    active
                      ? 'bg-[#F4A261] text-[#1F110C] border-[#F4A261]'
                      : 'bg-[#2C1812] text-[#F3E5D8] border-[#F4A261]/20 hover:border-[#F4A261]/50'
                  }`}
                >
                  {layer.id}
                </button>
              );
            })}
          </div>

          <div className="relative rounded-xl border border-[#F4A261]/25 bg-[#1B0E0A] p-3 flex items-center justify-center">
            <svg
              viewBox="0 0 540 310"
              className="w-full max-h-[270px]"
              role="img"
              aria-label="Martian Interior Cutaway Diagram with P-wave and S-wave ray paths"
            >
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
              <circle
                cx="270"
                cy="155"
                r="116"
                fill="#9E4328"
                stroke={selectedLayer === 'mantle' ? '#64DFDF' : '#FFD1A6'}
                strokeWidth={selectedLayer === 'mantle' ? '3.5' : '1.2'}
                className="cursor-pointer"
                onClick={() => setSelectedLayer('mantle')}
              />
              <circle
                cx="270"
                cy="155"
                r="66"
                fill="#F4A261"
                stroke={selectedLayer === 'core' ? '#64DFDF' : '#FFF8F2'}
                strokeWidth={selectedLayer === 'core' ? '4' : '2'}
                className="cursor-pointer"
                onClick={() => setSelectedLayer('core')}
              />

              <circle cx="145" cy="112" r="6" fill="#64DFDF" />
              <text
                x="18"
                y="105"
                fill="#64DFDF"
                fontSize="11.5"
                fontWeight="600"
                fontFamily="Plus Jakarta Sans, sans-serif"
              >
                Marsquake Source
              </text>

              <polygon points="270,15 263,26 277,26" fill="#FFD1A6" />
              <text
                x="284"
                y="23"
                fill="#FFD1A6"
                fontSize="11.5"
                fontWeight="600"
                fontFamily="Plus Jakarta Sans, sans-serif"
              >
                InSight SEIS (4.5°N)
              </text>

              <path d="M145 112 Q210 92 270 23" fill="none" stroke="#64DFDF" strokeWidth="2.2" />
              <path
                d="M145 112 Q205 122 228 106 Q252 68 270 23"
                fill="none"
                stroke="#FFD1A6"
                strokeWidth="2"
                strokeDasharray="5 3"
              />
              <path
                d="M145 112 Q182 132 206 142 L334 168 Q368 182 395 190"
                fill="none"
                stroke="#FFF8F2"
                strokeWidth="1.8"
                strokeDasharray="3 3"
              />

              <text
                x="225"
                y="159"
                fill="#1F110C"
                fontSize="12"
                fontWeight="700"
                fontFamily="Plus Jakarta Sans, sans-serif"
              >
                Core ~1,830 km
              </text>
              <text
                x="244"
                y="80"
                fill="#FFF8F2"
                fontSize="11"
                fontWeight="600"
                fontFamily="Plus Jakarta Sans, sans-serif"
              >
                Mantle
              </text>
              <text
                x="24"
                y="296"
                fill="#F3E5D8"
                fontSize="10.5"
                fontFamily="Plus Jakarta Sans, sans-serif"
              >
                Solid Cyan: Direct P/S · Dashed Gold: Core-Reflected ScS · Dotted: Refracted P-Wave
              </text>
            </svg>
          </div>
        </div>

        <div className="mt-4 p-4 rounded-xl border border-[#F4A261]/25 bg-[#2C1812]">
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
            <h3 className="text-base font-bold text-[#FFF8F2]">{activeLayer.title[lang]}</h3>
            <span className="text-xs font-semibold text-[#64DFDF]">
              {activeLayer.seismicVelocity}
            </span>
          </div>
          <div className="text-xs font-semibold text-[#F4A261] mb-1.5">
            {activeLayer.depthLabel[lang]}
          </div>
          <p className="text-sm text-[#F3E5D8] leading-relaxed mb-2">
            {activeLayer.description[lang]}
          </p>
          <p className="text-xs text-[#F3E5D8]/75 border-t border-[#F4A261]/15 pt-2">
            {activeLayer.uncertaintyNote[lang]}
          </p>
        </div>
      </div>

      {/* Right 5 cols: The HP³ "Mole" Story */}
      <div className="lg:col-span-5 rounded-2xl border border-[#F4A261]/25 bg-[#23140F]/95 p-5 flex flex-col justify-between shadow-2xl">
        <div>
          <div className="text-xs font-semibold text-[#F4A261] uppercase tracking-wider mb-1">
            {lang === 'en' ? 'Engineering Case · HP³ Heat Probe' : 'Hồ sơ Kỹ thuật · Mũi khoan HP³'}
          </div>
          <h3 className="text-xl font-bold text-[#FFF8F2] mb-2">
            {lang === 'en'
              ? 'When Engineering Hits a Wall: The 40-cm Duricrust Lesson'
              : 'Khi Kỹ Thuật Gặp Tường Đá: Bài Học Ở Độ Sâu 40 cm'}
          </h3>
          <p className="text-sm text-[#F3E5D8] leading-relaxed mb-4">
            {lang === 'en'
              ? 'Built by DLR to hammer 5 meters deep, the 40-cm "Mole" needed loose sand falling around its hull for recoil friction. Instead, it hit cemented Martian duricrust and stopped at ~40 cm.'
              : 'Do DLR chế tạo để đóng sâu 5 mét, mũi khoan "Chuột Chũi" dài 40 cm cần cát rời ôm quanh thân để tạo ma sát. Nhưng đất Sao Hỏa lại kết dính cứng như xi măng khiến nó dừng ở ~40 cm.'}
          </p>

          <div className="p-4 rounded-xl border border-[#F4A261]/25 bg-[#1B0E0A] mb-4">
            <div className="flex items-center justify-between text-xs font-semibold mb-2">
              <span className="text-[#F3E5D8]">
                {lang === 'en' ? 'Subsurface Depth Comparison:' : 'Đối chiếu độ sâu dưới mặt đất:'}
              </span>
              <span className="text-[#FFD1A6]">
                {hp3DepthCm === 40
                  ? lang === 'en'
                    ? 'Actual: ~40 cm (Duricrust)'
                    : 'Thực tế: ~40 cm (Đất kết dính)'
                  : lang === 'en'
                    ? 'Target: 500 cm (5.0 m)'
                    : 'Mục tiêu: 500 cm (5,0 m)'}
              </span>
            </div>

            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setHp3DepthCm(40)}
                className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg border transition-colors ${
                  hp3DepthCm === 40
                    ? 'bg-[#F4A261] text-[#1F110C] border-[#F4A261]'
                    : 'bg-[#2C1812] text-[#F3E5D8] border-[#F4A261]/20'
                }`}
              >
                {lang === 'en' ? 'Actual (~40 cm)' : 'Thực tế (~40 cm)'}
              </button>
              <button
                type="button"
                onClick={() => setHp3DepthCm(500)}
                className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg border transition-colors ${
                  hp3DepthCm === 500
                    ? 'bg-[#64DFDF] text-[#111C28] border-[#64DFDF]'
                    : 'bg-[#2C1812] text-[#F3E5D8] border-[#F4A261]/20'
                }`}
              >
                {lang === 'en' ? 'Planned (500 cm)' : 'Thiết kế (500 cm)'}
              </button>
            </div>

            <div className="relative h-36 rounded-lg border border-[#F4A261]/20 bg-[#140B08] overflow-hidden p-3">
              <div className="absolute inset-x-0 top-0 h-11 bg-[#5C291C]/75 border-b border-dashed border-[#F4A261]/50 flex items-center px-3 text-xs font-medium text-[#FFD1A6]">
                {lang === 'en'
                  ? '0–40 cm: Cemented Salt Duricrust'
                  : '0–40 cm: Tầng đất muối kết dính cứng'}
              </div>
              <div className="absolute inset-x-0 top-11 bottom-0 flex items-center px-3 text-xs text-[#F3E5D8]/75">
                {lang === 'en'
                  ? '40–500 cm: Deep Fragmented Regolith Zone'
                  : '40–500 cm: Tầng đất đá bazan mục tiêu'}
              </div>
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

        <div className="p-3.5 rounded-xl border border-[#F4A261]/20 bg-[#2C1812] text-xs text-[#F3E5D8] leading-relaxed">
          <strong className="text-[#FFD1A6] block mb-1">
            {lang === 'en'
              ? 'Why Every Setback Teaches Us:'
              : 'Bài học quý giá cho các sứ mệnh sau:'}
          </strong>
          {lang === 'en'
            ? 'By pressing the robotic arm scoop against the soil to bury the probe at 40 cm, engineers measured Martian soil thermal conductivity and cohesion—vital data for future astronaut habitats.'
            : 'Nhờ dùng gàu múc cánh tay robot ép lên mặt đất để chôn kín mũi khoan ở mức 40 cm, các kỹ sư đã đo được độ dẫn nhiệt và lực kết dính thực tế của đất Sao Hỏa.'}
        </div>
      </div>
    </div>
  );
};
