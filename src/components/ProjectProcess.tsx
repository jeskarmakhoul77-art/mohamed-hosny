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
    <section id="process" className="py-16 lg:py-24 bg-[#FAF8F5] text-[#242424] border-b border-[#D1B995]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#B89B6A] mb-2">
            <span className="w-5 h-[1.5px] bg-[#B89B6A]" />
            <span>{t.processKicker}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1F4A3B]">
            {t.processTitle}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#5C5C5C] leading-relaxed">
            {t.processSubtitle}
          </p>
        </div>

        {/* 7-Step Architectural Process Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {WORK_PROCESS_STEPS.map((step) => {
            const title = currentLang === 'ar' ? step.titleAr : step.titleEn;
            const desc = currentLang === 'ar' ? step.descAr : step.descEn;

            return (
              <div
                key={step.step}
                className="relative p-6 bg-white border border-[#D1B995]/30 rounded-sm shadow-xs flex flex-col justify-between"
              >
                <div>
                  {/* Step Index Numerals */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold font-mono text-[#D1B995]">
                      {step.step}
                    </span>
                    <span className="w-6 h-[1.5px] bg-[#D1B995]/40" />
                  </div>

                  <h3 className="text-base font-bold text-[#1F4A3B] mb-2 leading-snug">
                    {title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#5C5C5C] leading-relaxed">
                    {desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#F2EEE5] flex items-center gap-1 text-[11px] font-medium text-[#1F4A3B]">
                  <Check className="w-3.5 h-3.5 text-[#B89B6A]" />
                  <span>{currentLang === 'ar' ? 'مرحلة معتمدة' : 'Standard Protocol'}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Process Disclaimer */}
        <div className="mt-10 p-4 bg-white border border-[#D1B995]/30 rounded-sm flex items-start gap-3 text-xs text-[#5C5C5C]">
          <Info className="w-4 h-4 text-[#B89B6A] shrink-0 mt-0.5" />
          <span>{t.processDisclaimer}</span>
        </div>

      </div>
    </section>
  );
};
