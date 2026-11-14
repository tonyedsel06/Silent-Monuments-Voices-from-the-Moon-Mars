import React from 'react';
import { Language, OFFICIAL_REFERENCES, TEAM_METADATA } from '../data/bilingualContent';

interface ReferenceDeskModalProps {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
}

export const ReferenceDeskModal: React.FC<ReferenceDeskModalProps> = ({
  lang,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Reference Desk, Representational Integrity & Transparency Ledger"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 overflow-y-auto"
    >
      <div className="w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl border border-[#F4A261]/35 bg-[#23140F] overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F4A261]/25 bg-[#2C1812] shrink-0">
          <div>
            <span className="text-xs font-semibold text-[#F4A261] block">
              NASA SPACE APPS CHALLENGE HANOI 2026 · TEAM {TEAM_METADATA.teamName} ({TEAM_METADATA.teamId})
            </span>
            <h2 className="text-xl font-bold text-[#FFF8F2]">
              {lang === 'en'
                ? 'Reference Desk, Representational Integrity & Transparency Ledger'
                : 'Bàn Tra Cứu Tài Liệu, Tính Minh Bạch Khoa Học & Bản Quyền Mở'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-[#3D2219] text-[#FFF8F2] hover:bg-[#4E2C20]"
          >
            {lang === 'en' ? 'Return to Story ✕' : 'Quay lại Câu chuyện ✕'}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Team & Institution Official Registration Block */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl border border-[#F4A261]/25 bg-[#2C1812]">
            <div>
              <div className="text-xs font-bold text-[#64DFDF] mb-1">
                {lang === 'en' ? 'OFFICIAL TEAM REGISTRATION' : 'THÔNG TIN ĐỘI THI CHÍNH THỨC'}
              </div>
              <div className="text-base font-bold text-[#FFF8F2]">
                {TEAM_METADATA.teamName} · ID:{' '}
                <span className="text-[#F4A261]">{TEAM_METADATA.teamId}</span>
              </div>
              <div className="text-xs text-[#F3E5D8] mt-1">
                {TEAM_METADATA.institution[lang]}
              </div>
              <div className="text-xs text-[#F3E5D8]/80 mt-0.5">
                {TEAM_METADATA.localEvent[lang]}
              </div>
              <div className="text-xs font-semibold text-[#FFD1A6] mt-2">
                {lang === 'en' ? 'License:' : 'Giấy phép mở:'} {TEAM_METADATA.license}
              </div>
            </div>

            <div>
              <div className="text-xs font-bold text-[#F4A261] mb-1">
                {lang === 'en' ? 'OFFICIAL TEAM MEMBERS (5)' : 'THÀNH VIÊN CHÍNH THỨC (5)'}
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-[#FFF8F2] font-medium">
                {TEAM_METADATA.members.map((member, idx) => (
                  <li key={member}>
                    0{idx + 1}. {member}
                  </li>
                ))}
              </ul>
              <div className="text-xs text-[#F3E5D8]/80 mt-2">
                {lang === 'en' ? 'Target Audience:' : 'Đối tượng:'}{' '}
                {TEAM_METADATA.targetAudience[lang]}
              </div>
            </div>
          </div>

          {/* Representational Integrity Matrix */}
          <div className="rounded-xl border border-[#F4A261]/25 bg-[#2C1812] p-4">
            <h3 className="text-sm font-bold text-[#FFD1A6] mb-3">
              {lang === 'en'
                ? 'REPRESENTATIONAL INTEGRITY MATRIX (VERIFIED TELEMETRY VS. EDUCATIONAL SIMULATION)'
                : 'MA TRẬN MINH BẠCH KHOA HỌC (DỮ LIỆU GỐC NASA VS. MÔ PHỎNG GIÁO DỤC)'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
              <div className="p-3.5 rounded-xl bg-[#1D100C] border border-[#F4A261]/20">
                <strong className="text-[#F4A261] block mb-1">
                  {lang === 'en' ? 'Verified NASA/NSSDCA Telemetry' : 'Dữ liệu gốc NASA/NSSDCA đã xác minh'}
                </strong>
                <p className="text-[#F3E5D8]">
                  {lang === 'en'
                    ? 'Spacecraft NSSDCA IDs (2018-042A, 2003-032A, 1969-059C), coordinates (4.502°N 135.623°E; 1.946°S 354.473°E; 0.674°N 23.473°E), mission dates, 1,319 marsquakes, ~5,000 Wh to ~500 Wh solar power drop, ~1,830 km liquid core radius, ~40 cm HP³ mole depth, and 3.8 cm/yr lunar recession.'
                    : 'Mã định danh NSSDCA (2018-042A, 2003-032A, 1969-059C), tọa độ đổ bộ, ngày tháng sứ mệnh, 1.319 trận động đất Sao Hỏa, mức giảm điện từ ~5.000 Wh xuống ~500 Wh/sol, lõi lỏng ~1.830 km, độ sâu HP³ ~40 cm và tốc độ Mặt Trăng lùi xa 3,8 cm/năm.'}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#1D100C] border border-[#F4A261]/20">
                <strong className="text-[#64DFDF] block mb-1">
                  {lang === 'en' ? 'Educational Simulation & Narrative Voice' : 'Mô phỏng Giáo dục & Giọng kể Nhật ký'}
                </strong>
                <p className="text-[#F3E5D8]">
                  {lang === 'en'
                    ? 'First-person diary voice (spacecraft do not literally speak), procedural Three.js 3D models, conceptual planetary cutaway proportions, Web Audio 60× synthesized seismic waveforms, and the classroom 500 Wh power allocation exercise are pedagogical models for learners aged 10–15.'
                    : 'Giọng kể nhật ký ngôi thứ nhất, mô hình 3D Three.js, lát cắt hành tinh minh họa, bộ tổng hợp âm thanh Web Audio 60× và bài tập phân bổ 500 Wh điện là mô hình sư phạm dành cho học sinh 10–15 tuổi.'}
                </p>
              </div>
            </div>
          </div>

          {/* 12 Primary NASA, JPL & NSSDCA Sources */}
          <div>
            <h3 className="text-sm font-bold text-[#FFF8F2] mb-3">
              {lang === 'en'
                ? '12 PRIMARY NASA, JPL-CALTECH & NSSDCA ARCHIVE CITATIONS'
                : '12 NGUỒN DỮ LIỆU GỐC TỪ NASA, JPL-CALTECH & NSSDCA'}
            </h3>
            <ol className="space-y-2.5">
              {OFFICIAL_REFERENCES.map((ref) => (
                <li
                  key={ref.id}
                  className="p-3.5 rounded-xl border border-[#F4A261]/20 bg-[#2C1812] text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <span className="text-[#F4A261] font-bold">
                      {String(ref.id).padStart(2, '0')} · {ref.category}
                    </span>
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#64DFDF] font-semibold hover:underline break-all"
                    >
                      {ref.url} ↗
                    </a>
                  </div>
                  <div className="font-semibold text-[#FFF8F2] mb-0.5">{ref.title}</div>
                  <div className="text-[#F3E5D8]/80">{ref.verifiedFact}</div>
                </li>
              ))}
            </ol>
          </div>

          {/* AI Assistance & Open Source Disclosure */}
          <div className="p-4 rounded-xl border border-[#F4A261]/25 bg-[#1D100C] text-xs text-[#F3E5D8] leading-relaxed">
            <strong className="text-[#FFF8F2] block mb-1">
              {lang === 'en'
                ? 'AI ASSISTANCE & OPEN SOURCE LICENSE DISCLOSURE'
                : 'TUYÊN BỐ MINH BẠCH CÔNG CỤ AI & GIẤY PHÉP MÃ NGUỒN MỞ'}
            </strong>
            {lang === 'en'
              ? 'Developed by Team NAU EXPLORERS (Official Team ID: NS01048, Nghe An University) for the 2026 NASA International Space Apps Challenge Hanoi. All mission facts, NSSDCA identifiers, coordinates, and scientific disclosures were verified against primary NASA/JPL archives. Released under the OSI-approved Apache License 2.0.'
              : 'Được phát triển bởi Đội NAU EXPLORERS (Mã đội: NS01048, Trường Đại học Nghệ An) cho cuộc thi NASA International Space Apps Challenge Hà Nội 2026. Toàn bộ số liệu sứ mệnh, mã NSSDCA và tọa độ được đối chiếu với hồ sơ gốc của NASA/JPL. Phát hành theo giấy phép mở Apache License 2.0.'}
          </div>
        </div>
      </div>
    </div>
  );
};
