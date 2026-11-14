import React, { useState } from 'react';
import {
  Language,
  MARTIAN_INTERIOR_LAYERS,
  MartianLayerSpec,
} from '../data/bilingualContent';
import { INSIGHT_MEDIA_ASSETS } from '../utils/nasaMedia';

interface MartianInteriorCutawayProps {
  lang: Language;
}

export const MartianInteriorCutaway: React.FC<MartianInteriorCutawayProps> = ({ lang }) => {
  const [selectedLayerId, setSelectedLayerId] = useState<MartianLayerSpec['id']>('core');
  const [showNasaCutawayPhoto, setShowNasaCutawayPhoto] = useState(false);

  const activeLayer =
    MARTIAN_INTERIOR_LAYERS.find((l) => l.id === selectedLayerId) ?? MARTIAN_INTERIOR_LAYERS[2];

  return (
    <div className="rounded-2xl border border-[#F4A261]/30 nasa-basalt-glass p-4 sm:p-6 space-y-5 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F4A261]/20 pb-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-[#382017] border border-[#F4A261]/40 text-xs font-bold text-[#FFD1A6]">
            {lang === 'en'
              ? 'Conceptual diagram · Not to scale'
              : 'Sơ đồ khái niệm · Không theo tỷ lệ thực'}
          </span>
          <span className="text-xs text-[#64DFDF] font-semibold">
            {lang === 'en'
              ? 'Verified by SEIS & RISE (2018–2025)'
              : 'Xác thực bởi SEIS & RISE (2018–2025)'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowNasaCutawayPhoto((v) => !v)}
            className="px-3 py-1.5 rounded-xl bg-[#341C14] border border-[#F4A261]/40 text-xs font-bold text-[#FFD1A6] hover:bg-[#48271C] transition-colors"
          >
            {showNasaCutawayPhoto
              ? lang === 'en'
                ? 'Show Interactive Layer SVG'
                : 'Hiện Sơ Đồ Tương Tác 3 Lớp'
              : lang === 'en'
                ? 'View NASA PIA26636 Cutaway Art'
                : 'Xem Ảnh Mặt Cắt NASA PIA26636'}
          </button>
          <a
            href="https://science.nasa.gov/mission/insight/science-highlights/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-[#1D0F0A] border border-[#F4A261]/30 text-xs font-semibold text-[#FFD1A6] hover:text-white transition-colors"
          >
            Verify at NASA/JPL ↗
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center mobile-single-col-lock">
        {/* Left 6 Cols: Interactive Concentric Planetary Cutaway or NASA PIA26636 Illustration */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center bg-[#180D09] rounded-2xl border border-[#F4A261]/25 p-4 min-h-[340px]">
          {showNasaCutawayPhoto ? (
            <div className="space-y-2 text-center">
              <img
                src={INSIGHT_MEDIA_ASSETS.PIA26636_LOCAL}
                onError={(e) => {
                  e.currentTarget.src = INSIGHT_MEDIA_ASSETS.PIA26636_NASA;
                }}
                alt="NASA PIA26636 Cutaway of Mars Lumpy Mantle and Molten Core"
                className="w-full max-h-[300px] object-contain rounded-xl"
              />
              <p className="text-[11px] text-[#F3E5D8]/80">
                {lang === 'en'
                  ? 'Official NASA/JPL-Caltech illustration (PIA26636) showing seismic waves passing through ancient asteroid debris in Mars’ mantle above the glowing liquid core.'
                  : 'Ảnh minh họa chính thức của NASA/JPL-Caltech (PIA26636) mô tả sóng địa chấn truyền qua các mảnh vỡ thiên thạch cổ đại trong lớp phủ phía trên lõi lỏng.'}
              </p>
            </div>
          ) : (
            <svg
              viewBox="0 0 380 340"
              className="w-full max-w-[340px] h-auto select-none"
              role="img"
              aria-label="Interactive cutaway of Mars showing Crust, Lumpy Mantle, and Liquid Core"
            >
              <defs>
                <radialGradient id="marsCrustGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="75%" stopColor="#9B4B2C" />
                  <stop offset="100%" stopColor="#C8643B" />
                </radialGradient>
                <radialGradient id="marsMantleGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="45%" stopColor="#7C2D12" />
                  <stop offset="100%" stopColor="#B45309" />
                </radialGradient>
                <radialGradient id="marsCoreGrad" cx="45%" cy="45%" r="55%">
                  <stop offset="0%" stopColor="#FEF08A" />
                  <stop offset="55%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#DC2626" />
                </radialGradient>
              </defs>

              {/* Outer Crust Circle (24–72 km) */}
              <circle
                cx="190"
                cy="175"
                r="138"
                fill="url(#marsCrustGrad)"
                stroke={selectedLayerId === 'crust' ? '#64DFDF' : '#F4A261'}
                strokeWidth={selectedLayerId === 'crust' ? 4 : 2}
                className="cursor-pointer transition-all"
                onClick={() => setSelectedLayerId('crust')}
              />

              {/* Middle "Lumpy" Mantle Circle (~1,550 km) */}
              <circle
                cx="190"
                cy="175"
                r="116"
                fill="url(#marsMantleGrad)"
                stroke={selectedLayerId === 'mantle' ? '#64DFDF' : '#FDBA74'}
                strokeWidth={selectedLayerId === 'mantle' ? 4 : 1.5}
                className="cursor-pointer transition-all"
                onClick={() => setSelectedLayerId('mantle')}
              />

              {/* Preserved 4.5-Billion-Year Impact Lumps in the Mantle */}
              {[
                { x: 118, y: 122, r: 7 },
                { x: 256, y: 115, r: 8 },
                { x: 268, y: 195, r: 6 },
                { x: 112, y: 215, r: 7.5 },
                { x: 162, y: 88, r: 6.5 },
                { x: 222, y: 92, r: 8 },
              ].map((lump, idx) => (
                <polygon
                  key={idx}
                  points={`${lump.x},${lump.y - lump.r} ${lump.x + lump.r},${lump.y} ${lump.x},${lump.y + lump.r} ${lump.x - lump.r},${lump.y}`}
                  fill="#FDE68A"
                  opacity="0.72"
                  className="pointer-events-none"
                />
              ))}

              {/* Inner Molten Liquid Iron-Alloy Core (~1,830 km radius) */}
              <circle
                cx="190"
                cy="175"
                r="72"
                fill="url(#marsCoreGrad)"
                stroke={selectedLayerId === 'core' ? '#64DFDF' : '#FEF08A'}
                strokeWidth={selectedLayerId === 'core' ? 4.5 : 2}
                className="cursor-pointer transition-all"
                onClick={() => setSelectedLayerId('core')}
              />

              {/* InSight Lander Marker at Top of Crust */}
              <g transform="translate(190, 34)">
                <polygon points="-10,4 10,4 6,-5 -6,-5" fill="#F4A261" stroke="#FFF8F2" strokeWidth="1.2" />
                <line x1="-22" y1="0" x2="22" y2="0" stroke="#64DFDF" strokeWidth="2.5" />
                <text
                  x="0"
                  y="-11"
                  textAnchor="middle"
                  fill="#FFD1A6"
                  fontSize="11"
                  fontWeight="700"
                >
                  InSight (4.5°N)
                </text>
              </g>

              {/* Layer Labels inside SVG */}
              <text
                x="190"
                y="58"
                textAnchor="middle"
                fill="#FFF8F2"
                fontSize="11"
                fontWeight="700"
                className="pointer-events-none"
              >
                {lang === 'en' ? 'CRUST (24–72 km)' : 'LỚP VỎ (24–72 km)'}
              </text>
              <text
                x="190"
                y="92"
                textAnchor="middle"
                fill="#FDE68A"
                fontSize="11"
                fontWeight="700"
                className="pointer-events-none"
              >
                {lang === 'en' ? 'LUMPY MANTLE (1,550 km)' : 'LỚP PHỦ LỔN NHỔN (1.550 km)'}
              </text>
              <text
                x="190"
                y="172"
                textAnchor="middle"
                fill="#1D0F0A"
                fontSize="12"
                fontWeight="800"
                className="pointer-events-none"
              >
                {lang === 'en' ? 'LIQUID CORE' : 'LÕI LỎNG'}
              </text>
              <text
                x="190"
                y="188"
                textAnchor="middle"
                fill="#1D0F0A"
                fontSize="11"
                fontWeight="700"
                className="pointer-events-none"
              >
                R ≈ 1,830 km
              </text>
            </svg>
          )}
        </div>

        {/* Right 6 Cols: 3 Layer Selector Buttons & Active Layer Telemetry Card */}
        <div className="lg:col-span-6 space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {MARTIAN_INTERIOR_LAYERS.map((layer) => {
              const isSelected = layer.id === selectedLayerId;
              return (
                <button
                  key={layer.id}
                  type="button"
                  data-testid={`interior-layer-btn-${layer.id}`}
                  onClick={() => setSelectedLayerId(layer.id)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-center ${
                    isSelected
                      ? 'bg-[#F4A261] text-[#1D0F0A] shadow-lg'
                      : 'bg-[#2C1710] text-[#F3E5D8] border border-[#F4A261]/30 hover:bg-[#3D2016]'
                  }`}
                >
                  {layer.id === 'crust'
                    ? lang === 'en'
                      ? '1. Crust'
                      : '1. Lớp Vỏ'
                    : layer.id === 'mantle'
                      ? lang === 'en'
                        ? '2. Mantle'
                        : '2. Lớp Phủ'
                      : lang === 'en'
                        ? '3. Liquid Core'
                        : '3. Lõi Lỏng'}
                </button>
              );
            })}
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#1B0E0A] border border-[#F4A261]/35 space-y-3">
            <h4 className="text-lg sm:text-xl font-bold text-[#FFF8F2]">
              {activeLayer.name[lang]}
            </h4>

            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-[#2D1811] text-[#FFD1A6] font-semibold">
                {activeLayer.depthRange[lang]}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#2D1811] text-[#64DFDF] font-semibold">
                {activeLayer.temperature[lang]}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#F3E5D8]/90 leading-relaxed">
              {activeLayer.summary[lang]}
            </p>

            <div className="p-3 rounded-xl bg-[#26140E] border border-[#64DFDF]/30 text-xs text-[#F3E5D8] space-y-1">
              <div className="font-bold text-[#64DFDF]">
                {lang === 'en'
                  ? 'Composition & Seismic Proof:'
                  : 'Thành Phần & Bằng Chứng Địa Chấn:'}
              </div>
              <p className="text-[#FFD1A6]/95">{activeLayer.composition[lang]}</p>
              <p className="text-[#F3E5D8]/85">{activeLayer.seismicProof[lang]}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
