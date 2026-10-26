import React, { useState } from 'react';
import { ApartmentStageSlot, Language } from '../types';
import { translations } from '../translations';
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  ArrowLeft,
  Image as ImageIcon,
  AlertCircle,
  MessageCircle,
  FolderOpen
} from 'lucide-react';

interface ApartmentCaseStudyProps {
  currentLang: Language;
  stages: ApartmentStageSlot[];
  onOpenWhatsApp: (serviceName?: string) => void;
  onSelectImage: (title: string, desc: string, imageUrl?: string) => void;
}

export const ApartmentCaseStudy: React.FC<ApartmentCaseStudyProps> = ({
  currentLang,
  stages,
  onOpenWhatsApp,
  onSelectImage
}) => {
  const t = translations[currentLang];
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [stageImageErrors, setStageImageErrors] = useState<Record<string, boolean>>({});
  const activeStage = stages[activeStageIndex];
  const isRtl = currentLang === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <section id="apartment-case-study" className="py-16 lg:py-24 bg-[#FAF8F5] text-[#242424] border-b border-[#D1B995]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#B89B6A] mb-2">
              <span className="w-5 h-[1.5px] bg-[#B89B6A]" />
              <span>{t.apartmentKicker}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1F4A3B]">
              {t.apartmentTitle}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#5C5C5C] leading-relaxed">
              {t.apartmentSubtitle}
            </p>
          </div>

          <div className="shrink-0">
            <button
              onClick={() => onOpenWhatsApp(currentLang === 'ar' ? 'تشطيب شقة متكامل (مماثل لدراسة الحالة)' : 'Full Apartment Fit-Out (Similar Project)')}
              className="inline-flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#1F4A3B] bg-[#D1B995] hover:bg-[#E5D1B0] transition-colors rounded-sm shadow-sm cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-current/20" />
              <span>{t.requestSimilarProject}</span>
              <ArrowIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Authenticity Notice & Slot Format Instruction */}
        <div className="mb-8 p-4 bg-[#F2EEE5] border border-[#D1B995]/40 rounded-sm text-xs text-[#5C5C5C] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-[#B89B6A] shrink-0" />
            <span>{t.apartmentAuthenticNotice}</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-[#1F4A3B] bg-white px-3 py-1.5 rounded-xs border border-[#D1B995]/30">
            <FolderOpen className="w-3.5 h-3.5 text-[#B89B6A]" />
            <span>public/assets/projects/apartment/</span>
          </div>
        </div>

        {/* 5-Stage Chronological Progress Bar (Desktop & Tablet) */}
        <div className="mb-10 bg-white border border-[#D1B995]/30 rounded-sm p-4 shadow-sm">
          <div className="grid grid-cols-5 gap-2 text-center">
            {stages.map((stage, idx) => {
              const isActive = idx === activeStageIndex;
              const isPassed = idx < activeStageIndex;
              return (
                <button
                  key={stage.stageNumber}
                  onClick={() => setActiveStageIndex(idx)}
                  className={`flex flex-col items-center p-3 rounded-sm transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-[#1F4A3B] text-[#F7F5F0] shadow-md'
                      : 'hover:bg-[#F2EEE5] text-[#242424]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-[11px] font-bold">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${
                        isActive
                          ? 'bg-[#D1B995] text-[#1F4A3B]'
                          : isPassed
                          ? 'bg-[#1F4A3B] text-white'
                          : 'bg-[#F2EEE5] text-[#5C5C5C]'
                      }`}
                    >
                      {stage.stageNumber}
                    </span>
                    <span className={isActive ? 'text-[#D1B995]' : 'text-[#5C5C5C]'}>
                      {currentLang === 'ar' ? stage.phaseLabelAr : stage.phaseLabelEn}
                    </span>
                  </div>
                  <span className="text-xs font-semibold line-clamp-1">
                    {currentLang === 'ar' ? stage.titleAr : stage.titleEn}
                  </span>
                  <span className="text-[10px] font-mono text-[#D1B995] opacity-80 mt-1">
                    {stage.slotKey}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Stage Showcase Card */}
        <div className="bg-white border border-[#D1B995]/30 rounded-sm overflow-hidden shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            
            {/* Visual Slot */}
            <div className="lg:col-span-7 relative aspect-[4/3] sm:aspect-[16/10] bg-[#162C26] flex items-center justify-center overflow-hidden">
              {activeStage.imageUrl && !stageImageErrors[activeStage.slotKey] ? (
                <img
                  src={activeStage.imageUrl}
                  alt={currentLang === 'ar' ? activeStage.titleAr : activeStage.titleEn}
                  className="w-full h-full object-cover cursor-pointer hover:scale-102 transition-transform duration-500"
                  onError={() => setStageImageErrors((prev) => ({ ...prev, [activeStage.slotKey]: true }))}
                  onClick={() =>
                    onSelectImage(
                      currentLang === 'ar' ? activeStage.titleAr : activeStage.titleEn,
                      currentLang === 'ar' ? activeStage.descriptionAr : activeStage.descriptionEn,
                      activeStage.imageUrl
                    )
                  }
                />
              ) : (
                /* Clear honest placeholder for this stage with Slot Key and Target Path */
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-[#1F4A3B] to-[#152B24] text-[#F7F5F0]">
                  <div className="w-14 h-14 rounded-full border border-[#D1B995]/40 bg-[#162C26] flex items-center justify-center text-[#D1B995] mb-3">
                    <ImageIcon className="w-7 h-7" />
                  </div>
                  
                  {/* Slot Key Badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#152B24] border border-[#D1B995]/40 rounded-xs mb-2">
                    <span className="text-[11px] font-mono font-bold text-[#D1B995]">
                      {activeStage.slotKey}
                    </span>
                    <span className="text-white/40">|</span>
                    <span className="text-[11px] font-mono text-white/80">
                      0{activeStage.stageNumber} / 05
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-[#F7F5F0] mt-1">
                    {currentLang === 'ar' ? activeStage.titleAr : activeStage.titleEn}
                  </h4>
                  
                  <p className="text-xs text-[#F7F5F0]/70 mt-2 max-w-sm">
                    {currentLang === 'ar'
                      ? 'خانة مخصصة لرفع الصورة الفوتوغرافية الحقيقية لهذه المرحلة من الشقة.'
                      : 'Designated slot awaiting genuine photographic asset of this stage.'}
                  </p>

                  <div className="mt-4 px-3 py-1.5 bg-[#152B24]/90 border border-[#D1B995]/30 text-[11px] font-mono text-[#D1B995] rounded-sm flex items-center gap-1.5">
                    <span>{currentLang === 'ar' ? 'المسار المطلوب: ' : 'Target Path: '}</span>
                    <strong>{activeStage.defaultFilePath}</strong>
                  </div>
                </div>
              )}

              {/* Stage Counter Overlay */}
              <div className="absolute top-4 left-4 px-2.5 py-1 bg-[#152B24]/90 backdrop-blur-sm border border-[#D1B995]/30 text-[#D1B995] text-xs font-mono font-bold rounded-sm">
                {activeStage.slotKey}
              </div>
            </div>

            {/* Stage Description & Milestone Details */}
            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-white text-[#242424]">
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-[#B89B6A]">
                  {currentLang === 'ar' ? activeStage.phaseLabelAr : activeStage.phaseLabelEn} · {activeStage.slotKey}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#1F4A3B]">
                  {currentLang === 'ar' ? activeStage.titleAr : activeStage.titleEn}
                </h3>
                <p className="text-sm text-[#5C5C5C] leading-relaxed">
                  {currentLang === 'ar' ? activeStage.descriptionAr : activeStage.descriptionEn}
                </p>

                <div className="pt-4 border-t border-[#F2EEE5] space-y-2.5 text-xs text-[#5C5C5C]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#1F4A3B] shrink-0" />
                    <span>{currentLang === 'ar' ? 'إشراف مباشر وفحص هندسي للمرحلة' : 'Supervised execution & engineering review'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#1F4A3B] shrink-0" />
                    <span>{currentLang === 'ar' ? 'التسليم طبقاً للمخطط الزمني المعتمد' : 'Aligned strictly with agreed milestones'}</span>
                  </div>
                </div>
              </div>

              {/* Navigation Arrows for Stages & Direct WhatsApp CTA */}
              <div className="pt-6 mt-6 border-t border-[#F2EEE5] space-y-4">
                <div className="flex items-center justify-between">
                  <button
                    disabled={activeStageIndex === 0}
                    onClick={() => setActiveStageIndex((prev) => Math.max(0, prev - 1))}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#1F4A3B] border border-[#1F4A3B]/20 rounded-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F2EEE5] cursor-pointer"
                  >
                    <ChevronRight className={`w-4 h-4 ${isRtl ? '' : 'rotate-180'}`} />
                    <span>{currentLang === 'ar' ? 'المرحلة السابقة' : 'Previous Stage'}</span>
                  </button>

                  <span className="text-xs font-mono text-[#5C5C5C]">
                    {activeStageIndex + 1} / 5
                  </span>

                  <button
                    disabled={activeStageIndex === stages.length - 1}
                    onClick={() => setActiveStageIndex((prev) => Math.min(stages.length - 1, prev + 1))}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#1F4A3B] border border-[#1F4A3B]/20 rounded-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F2EEE5] cursor-pointer"
                  >
                    <span>{currentLang === 'ar' ? 'المرحلة التالية' : 'Next Stage'}</span>
                    <ChevronLeft className={`w-4 h-4 ${isRtl ? '' : 'rotate-180'}`} />
                  </button>
                </div>

                <button
                  onClick={() => onOpenWhatsApp(`${currentLang === 'ar' ? 'استفسار عن تشطيب المرحلة: ' : 'Stage Inquiry: '}${currentLang === 'ar' ? activeStage.titleAr : activeStage.titleEn} (${activeStage.slotKey})`)}
                  className="w-full py-2.5 text-xs font-bold uppercase tracking-wider text-[#1F4A3B] bg-[#D1B995] hover:bg-[#E5D1B0] transition-colors rounded-sm flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <MessageCircle className="w-4 h-4 fill-current/20" />
                  <span>{currentLang === 'ar' ? 'استفسر عن هذه المرحلة عبر واتساب' : 'Inquire About This Stage via WhatsApp'}</span>
                </button>
              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
