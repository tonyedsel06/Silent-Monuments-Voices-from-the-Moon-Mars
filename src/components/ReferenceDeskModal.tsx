import React from 'react';
import {
  JUDGE_QA_ITEMS,
  Language,
  SCIENTIFIC_SOURCES,
  TEAM_METADATA,
} from '../data/bilingualContent';

interface ReferenceDeskModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const ReferenceDeskModal: React.FC<ReferenceDeskModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reference-desk-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md"
    >
      <div className="relative w-full max-w-4xl max-h-[88vh] rounded-2xl border border-[#F4A261]/40 bg-[#1F110C] text-[#FFF8F2] shadow-2xl flex flex-col overflow-hidden">
        {/* Sticky Modal Header */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-[#F4A261]/25 bg-[#2A1610]">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#64DFDF]">
              {TEAM_METADATA.umbrellaProjectTitle}
            </div>
            <h2
              id="reference-desk-modal-title"
              className="font-serif-editorial text-lg sm:text-2xl font-bold text-[#FFF8F2]"
            >
              {lang === 'en'
                ? 'InSight (2018-042A) Reference Desk & Space Apps Judge Ledger'
                : 'Hồ Sơ Tham Chiếu Khoa Học InSight (2018-042A) & Giám Khảo Space Apps'}
            </h2>
          </div>

          <button
            type="button"
            data-testid="close-reference-desk-btn"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-[#3B2016] text-[#FFD1A6] border border-[#F4A261]/40 text-xs font-bold hover:bg-[#4F2B1E] transition-colors shrink-0"
          >
            {lang === 'en' ? '✕ Close' : '✕ Đóng'}
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Team & Subsystem Metadata Card */}
          <div className="p-4 rounded-xl bg-[#29150E] border border-[#F4A261]/30 space-y-2 text-xs">
            <div className="font-bold text-[#FFD1A6] text-sm">
              {TEAM_METADATA.projectTitle} · NSSDCA ID: {TEAM_METADATA.nssdcaId}
            </div>
            <p className="text-[#F3E5D8]/90">
              <strong>{lang === 'en' ? 'Team:' : 'Đội thi:'}</strong> {TEAM_METADATA.teamName} (ID:{' '}
              {TEAM_METADATA.officialTeamId}) · {TEAM_METADATA.institution}
            </p>
            <p className="text-[#F3E5D8]/90">
              <strong>{lang === 'en' ? 'Members:' : 'Thành viên:'}</strong>{' '}
              {TEAM_METADATA.members.join(' · ')}
            </p>
            <p className="text-[#64DFDF]">
              <strong>
                {lang === 'en'
                  ? 'Scientific Integrity Note:'
                  : 'Chú thích Minh bạch Khoa học:'}
              </strong>{' '}
              {lang === 'en'
                ? 'First-person narration ("I am InSight") is a creative pedagogical device designed for learners aged 10–15. Every coordinate, date, power figure, and seismic discovery is strictly anchored to primary NASA/JPL records.'
                : 'Giọng kể ngôi thứ nhất ("Tôi là InSight") là phương pháp sư phạm giúp học sinh 10–15 tuổi dễ tiếp thu. Mọi tọa độ, ngày tháng, thông số điện năng và phát hiện địa chấn đều dựa hoàn toàn vào hồ sơ gốc của NASA/JPL.'}
            </p>
          </div>

          {/* Space Apps Judge Q&A Section */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-[#FFD1A6] uppercase tracking-wider">
              {lang === 'en'
                ? 'NASA Space Apps Judge Q&A Summary'
                : 'Tóm Tắt Hồ Sơ Dự Thi NASA Space Apps'}
            </h3>
            <div className="space-y-3">
              {JUDGE_QA_ITEMS.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-[#160B08] border border-[#F4A261]/25 space-y-1.5"
                >
                  <div className="text-xs sm:text-sm font-bold text-[#FFF8F2]">
                    {item.question[lang]}
                  </div>
                  <p className="text-xs text-[#F3E5D8]/85 leading-relaxed">
                    {item.answer[lang]}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 12 Primary NASA/JPL Citations */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-[#64DFDF] uppercase tracking-wider">
              {lang === 'en'
                ? 'Verified Primary NASA / JPL / NSSDCA References (12 Sources)'
                : 'Danh Mục 12 Nguồn Tư Liệu Gốc NASA / JPL / NSSDCA'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {SCIENTIFIC_SOURCES.map((src) => (
                <div
                  key={src.id}
                  className="p-3.5 rounded-xl bg-[#160B08] border border-[#F4A261]/25 flex flex-col justify-between space-y-2"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <span className="font-bold text-[#F4A261]">{src.category}</span>
                      <span className="text-[#64DFDF] font-semibold">{src.identifier}</span>
                    </div>
                    <div className="text-xs font-bold text-[#FFF8F2]">{src.title}</div>
                    <p className="text-[11px] text-[#F3E5D8]/80 leading-relaxed">
                      {src.summary[lang]}
                    </p>
                  </div>
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#FFD1A6] hover:underline"
                  >
                    {lang === 'en' ? 'Open Official NASA Source ↗' : 'Mở Nguồn NASA Chính Thức ↗'}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
