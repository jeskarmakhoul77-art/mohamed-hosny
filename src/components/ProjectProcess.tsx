import React from 'react';
import { Language } from '../types';
import { WORK_PROCESS_STEPS } from '../data/portfolioData';
import { translations } from '../translations';
import { Check, Info } from 'lucide-react';

interface ProjectProcessProps {
  currentLang: Language;
}

export const ProjectProcess: React.FC<ProjectProcessProps> = ({ currentLang }) => {
  const t = translations[currentLang];

  return (
    <section id="process" className="py-10 sm:py-12 lg:py-14 bg-[#FAF8F5] text-[#242424] border-b border-[#D1B995]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#B89B6A] mb-1.5">
            <span className="w-5 h-[1.5px] bg-[#B89B6A]" />
            <span>{t.processKicker}</span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-[#1F4A3B]">
            {t.processTitle}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#5C5C5C] leading-relaxed">
            {t.processSubtitle}
          </p>
        </div>

        {/* 7-Step Architectural Process Timeline — Sleek Horizontal Strips */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5">
          {WORK_PROCESS_STEPS.map((step) => {
            const title = currentLang === 'ar' ? step.titleAr : step.titleEn;
            const desc = currentLang === 'ar' ? step.descAr : step.descEn;

            return (
              <div
                key={step.step}
                className="relative p-3 sm:p-3.5 bg-white border border-[#D1B995]/30 rounded-xs shadow-2xs hover:shadow-xs transition-shadow flex items-start gap-3"
              >
                {/* Step Index Numeral */}
                <div className="shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-xs bg-[#1F4A3B] text-[#D1B995] flex items-center justify-center font-bold font-mono text-xs sm:text-sm shadow-2xs">
                  {step.step}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1.5 mb-1">
                    <h3 className="text-xs sm:text-sm font-bold text-[#1F4A3B] leading-snug">
                      {title}
                    </h3>
                    <Check className="w-3.5 h-3.5 text-[#B89B6A] shrink-0" />
                  </div>

                  <p className="text-[11px] sm:text-xs text-[#5C5C5C] leading-relaxed line-clamp-2">
                    {desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Process Disclaimer */}
        <div className="mt-6 p-3 bg-white border border-[#D1B995]/30 rounded-xs flex items-start gap-2.5 text-xs text-[#5C5C5C]">
          <Info className="w-4 h-4 text-[#B89B6A] shrink-0 mt-0.5" />
          <span>{t.processDisclaimer}</span>
        </div>

      </div>
    </section>
  );
};
