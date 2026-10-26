import React from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { ShieldCheck, Compass, CheckCircle2, Clock } from 'lucide-react';

interface AboutSectionProps {
  currentLang: Language;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ currentLang }) => {
  const t = translations[currentLang];

  const pillars = [
    {
      icon: ShieldCheck,
      title: t.value1Title,
      desc: t.value1Desc
    },
    {
      icon: Compass,
      title: t.value2Title,
      desc: t.value2Desc
    },
    {
      icon: CheckCircle2,
      title: t.value3Title,
      desc: t.value3Desc
    },
    {
      icon: Clock,
      title: t.value4Title,
      desc: t.value4Desc
    }
  ];

  return (
    <section id="about" className="py-16 lg:py-24 bg-[#F7F5F0] text-[#242424] border-b border-[#D1B995]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Text narrative */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#B89B6A]">
              <span className="w-5 h-[1.5px] bg-[#B89B6A]" />
              <span>{t.aboutKicker}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1F4A3B]">
              {t.aboutTitle}
            </h2>

            <div className="space-y-4 text-sm sm:text-base text-[#5C5C5C] leading-relaxed">
              <p>{t.aboutParagraph1}</p>
              <p>{t.aboutParagraph2}</p>
            </div>

            {/* Operating Pillars */}
            <div className="pt-6 border-t border-[#D1B995]/20">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#1F4A3B] mb-4">
                {t.valuesTitle}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pillars.map((pillar, idx) => {
                  const Icon = pillar.icon;
                  return (
                    <div key={idx} className="p-3.5 bg-white border border-[#D1B995]/25 rounded-sm">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Icon className="w-4 h-4 text-[#B89B6A] shrink-0" />
                        <h4 className="text-xs font-bold text-[#1F4A3B]">
                          {pillar.title}
                        </h4>
                      </div>
                      <p className="text-xs text-[#5C5C5C] leading-relaxed">
                        {pillar.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Brand Board Asset Display */}
          <div className="lg:col-span-5">
            <div className="bg-[#152B24] border border-[#D1B995]/30 rounded-sm overflow-hidden p-2 shadow-xl">
              <div className="aspect-[4/3] overflow-hidden bg-[#162C26] rounded-xs">
                <img
                  src="/assets/aistudio/Luxury_Green_and_Gold_Brand_Identity_Board_6a9f8110.png"
                  alt="Mohamed Hosny — Luxury Green and Gold Brand Board"
                  className="w-full h-full object-cover object-top hover:scale-103 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-3 text-center">
                <p className="text-[11px] text-[#D1B995] font-semibold tracking-wider uppercase">
                  {currentLang === 'ar' ? 'لوحة الهوية والضوابط المعمارية المعتمدة' : 'Official Architectural Identity & Guidelines Board'}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
