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
      <div className="w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-700 bg-[#0B1220] overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0E1729] shrink-0">
          <div>
            <span className="text-xs font-mono text-[#F4A261] block">
              NASA SPACE APPS CHALLENGE HANOI 2026 · TEAM {TEAM_METADATA.teamName} ({TEAM_METADATA.teamId})
            </span>
            <h2 className="text-xl font-semibold text-white">
              {lang === 'en'
                ? 'Reference Desk, Representational Integrity & Transparency Ledger'
                : 'Bàn Tra cứu Tài liệu, Tính Minh bạch Khoa học & Bản quyền Mở'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-mono font-semibold rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700"
          >
            {lang === 'en' ? 'Return to Story ✕' : 'Quay lại Câu chuyện ✕'}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Team & Institution Official Registration Block */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl border border-slate-800 bg-[#0E1729]">
            <div>
              <div className="text-xs font-mono text-[#64DFDF] mb-1">
                {lang === 'en' ? 'OFFICIAL TEAM REGISTRATION' : 'THÔNG TIN ĐỘI THI CHÍNH THỨC'}
              </div>
              <div className="text-base font-bold text-white">
                {TEAM_METADATA.teamName} · ID: <span className="font-mono text-[#F4A261]">{TEAM_METADATA.teamId}</span>
              </div>
              <div className="text-xs text-slate-300 mt-1">
                {TEAM_METADATA.institution[lang]}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                {TEAM_METADATA.localEvent[lang]}
              </div>
              <div className="text-xs font-mono text-[#FFD1A6] mt-2">
                {lang === 'en' ? 'License:' : 'Giấy phép mã nguồn mở:'} {TEAM_METADATA.license}
              </div>
            </div>

            <div>
              <div className="text-xs font-mono text-[#F4A261] mb-1">
                {lang === 'en' ? 'OFFICIAL TEAM MEMBERS (5)' : 'THÀNH VIÊN CHÍNH THỨC (5)'}
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-200 font-medium">
                {TEAM_METADATA.members.map((member, idx) => (
                  <li key={member} className="font-mono">
                    0{idx + 1}. {member}
                  </li>
                ))}
              </ul>
              <div className="text-xs text-slate-400 mt-2">
                {lang === 'en' ? 'Target Audience:' : 'Đối tượng hướng tới:'} {TEAM_METADATA.targetAudience[lang]}
              </div>
            </div>
          </div>

          {/* Representational Integrity Matrix */}
          <div className="rounded-xl border border-slate-800 bg-[#0E1729] p-4">
            <h3 className="text-sm font-mono font-semibold text-[#FFD1A6] mb-3">
              {lang === 'en'
                ? 'REPRESENTATIONAL INTEGRITY MATRIX (VERIFIED TELEMETRY VS. EDUCATIONAL SIMULATION)'
                : 'MA TRẬN MINH BẠCH KHOA HỌC (DỮ LIỆU GỐC NASA VS. MÔ PHỎNG GIÁO DỤC)'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
              <div className="p-3 rounded-lg bg-[#070B14] border border-slate-800">
                <strong className="text-[#F4A261] font-mono block mb-1">
                  [VERIFIED NASA/NSSDCA DATA]
                </strong>
                <p className="text-slate-300">
                  {lang === 'en'
                    ? 'All spacecraft NSSDCA IDs (2018-042A, 2003-032A, 1969-059C), landing coordinates (4.502°N 135.623°E; 1.946°S 354.473°E; 0.674°N 23.473°E), mission dates (launch 5 May 2018, landing 26 Nov 2018, SEIS deployment 19 Dec 2018, Sol 128 first quake 6 Apr 2019, last contact 15 Dec 2022, retirement 21 Dec 2022), 1,319 total marsquakes, ~5,000 Wh to ~500 Wh solar power drop, ~1,830 km liquid core radius, ~40 cm HP³ mole depth, and 3.8 cm/yr lunar recession.'
                    : 'Toàn bộ mã định danh NSSDCA (2018-042A, 2003-032A, 1969-059C), tọa độ đổ bộ chính xác, ngày tháng sứ mệnh, tổng số 1.319 trận động đất Sao Hỏa, mức suy giảm điện năng từ ~5.000 Wh xuống ~500 Wh/sol, bán kính lõi lỏng ~1.830 km, độ sâu mũi khoan HP³ ~40 cm và tốc độ Mặt Trăng lùi xa 3,8 cm/năm.'}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-[#070B14] border border-slate-800">
                <strong className="text-[#64DFDF] font-mono block mb-1">
                  [EDUCATIONAL SIMULATION · NOT TO SCALE]
                </strong>
                <p className="text-slate-300">
                  {lang === 'en'
                    ? 'First-person diary voice (spacecraft do not literally feel or speak), procedural Three.js 3D models, conceptual planetary cutaway proportions, Web Audio 60x synthesized seismic waveforms, and the classroom 500 Wh power allocation exercise are pedagogical models designed for learners aged 10–15.'
                    : 'Giọng kể nhật ký ngôi thứ nhất (tàu vũ trụ thực tế không có cảm xúc hay lời nói), mô hình 3D Three.js, lát cắt hành tinh minh họa (không theo tỷ lệ thực), bộ tổng hợp âm thanh Web Audio 60x và bài tập phân bổ 500 Wh điện là các mô hình sư phạm dành cho học sinh 10–15 tuổi.'}
                </p>
              </div>
            </div>
          </div>

          {/* 12 Primary NASA, JPL & NSSDCA Sources */}
          <div>
            <h3 className="text-sm font-mono font-semibold text-white mb-3">
              {lang === 'en'
                ? '12 PRIMARY NASA, JPL-CALTECH & NSSDCA ARCHIVE CITATIONS'
                : '12 NGUỒN DỮ LIỆU GỐC TỪ NASA, JPL-CALTECH & NSSDCA'}
            </h3>
            <ol className="space-y-2.5">
              {OFFICIAL_REFERENCES.map((ref) => (
                <li
                  key={ref.id}
                  className="p-3 rounded-lg border border-slate-800 bg-[#0E1729] text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <span className="font-mono text-[#F4A261] font-semibold">
                      [{String(ref.id).padStart(2, '0')} · {ref.category}]
                    </span>
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[#64DFDF] hover:underline break-all"
                    >
                      {ref.url} ↗
                    </a>
                  </div>
                  <div className="font-semibold text-white mb-0.5">{ref.title}</div>
                  <div className="text-slate-400">{ref.verifiedFact}</div>
                </li>
              ))}
            </ol>
          </div>

          {/* AI Assistance & Open Source Disclosure */}
          <div className="p-4 rounded-xl border border-slate-800 bg-[#070B14] text-xs text-slate-300 leading-relaxed">
            <strong className="text-white font-mono block mb-1">
              {lang === 'en'
                ? 'AI ASSISTANCE & OPEN SOURCE LICENSE DISCLOSURE (HACKATHON COMPLIANCE)'
                : 'TUYÊN BỐ MINH BẠCH VỀ CÔNG CỤ AI & GIẤY PHÉP MÃ NGUỒN MỞ'}
            </strong>
            {lang === 'en'
              ? 'Developed by Team NAU EXPLORERS (Official Team ID: NS01048, Nghe An University) for the 2026 NASA International Space Apps Challenge Hanoi. Google AI Studio (Gemini) was used as a frontend coding and 3D WebGL engineering assistant; all mission facts, NSSDCA identifiers, coordinates, and scientific disclosures were manually verified against primary NASA/JPL archives. Released under the OSI-approved Apache License 2.0. Not an official NASA publication.'
              : 'Được phát triển bởi Đội NAU EXPLORERS (Mã đội: NS01048, Trường Đại học Nghệ An) cho cuộc thi NASA International Space Apps Challenge Hà Nội 2026. Google AI Studio (Gemini) được sử dụng hỗ trợ lập trình giao diện và đồ họa 3D WebGL; toàn bộ số liệu sứ mệnh, mã định danh NSSDCA, tọa độ và ghi chú khoa học đều được các thành viên kiểm chứng thủ công đối chiếu với hồ sơ gốc của NASA/JPL. Phát hành theo giấy phép mã nguồn mở Apache License 2.0.'}
          </div>
        </div>
      </div>
    </div>
  );
};
