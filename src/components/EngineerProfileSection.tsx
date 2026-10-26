import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import {
  Award,
  ShieldCheck,
  Compass,
  FileCheck2,
  ZoomIn,
  MessageCircle,
  FolderOpen,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface EngineerProfileSectionProps {
  currentLang: Language;
  onOpenWhatsApp: (serviceName?: string) => void;
  onSelectImage?: (title: string, desc: string, imageUrl?: string) => void;
}

export const EngineerProfileSection: React.FC<EngineerProfileSectionProps> = ({
  currentLang,
  onOpenWhatsApp,
  onSelectImage
}) => {
  const t = translations[currentLang];
  const [imageError, setImageError] = useState(false);
  const certificatePath = '/assets/credentials/mohamed-hosny-engineering-degree.jpg';

  const handleOpenCertificateZoom = () => {
    if (onSelectImage && !imageError) {
      onSelectImage(
        currentLang === 'ar' ? 'المؤهل الهندسي المعتمد — المهندس محمد حسني' : 'Accredited Engineering Degree — Eng. Mohamed Hosny',
        currentLang === 'ar'
          ? 'شهادة المؤهل الهندسي والاعتماد المهني للمهندس محمد حسني المشرف العام على مشاريع المؤسسة.'
          : 'Official engineering qualification and credentials for Eng. Mohamed Hosny, lead engineer.',
        certificatePath
      );
    }
  };

  return (
    <section id="engineer-profile" className="py-16 lg:py-24 bg-[#FAF8F5] text-[#242424] border-b border-[#D1B995]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Kicker & Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#B89B6A] mb-2">
            <span className="w-5 h-[1.5px] bg-[#B89B6A]" />
            <span>{t.engSectionKicker}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1F4A3B]">
            {t.engSectionTitle}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#5C5C5C] leading-relaxed">
            {t.engSectionSubtitle}
          </p>
        </div>

        {/* Two-Column Grid: Biography & Engineering Pillars (Left/Right depending on Lang) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Column 1: Engineering Narrative & Core Technical Pillars (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 sm:p-8 bg-white border border-[#D1B995]/30 rounded-sm shadow-xs space-y-4">
              <div className="flex items-center gap-3 border-b border-[#F2EEE5] pb-4">
                <div className="w-10 h-10 rounded-sm bg-[#1F4A3B] text-[#D1B995] flex items-center justify-center shrink-0">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1F4A3B]">
                    {currentLang === 'ar' ? 'المهندس محمد حسني — المشرف العام والمدير التنفيذي' : 'Eng. Mohamed Hosny — Lead Project Engineer'}
                  </h3>
                  <p className="text-xs text-[#B89B6A] font-medium">
                    {currentLang === 'ar' ? 'إشراف ميداني هندسي مباشر على كافة مراحل العمل' : 'Direct on-site engineering supervision across all phases'}
                  </p>
                </div>
              </div>

              <p className="text-sm text-[#4A4A4A] leading-relaxed">
                {t.engBio1}
              </p>
              <p className="text-sm text-[#4A4A4A] leading-relaxed">
                {t.engBio2}
              </p>

              {/* 3 Technical Pillars */}
              <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-[#FAF8F5] border border-[#D1B995]/20 rounded-xs">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#1F4A3B] mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#B89B6A] shrink-0" />
                    <span>{t.engPillar1Title}</span>
                  </div>
                  <p className="text-[11px] text-[#5C5C5C] leading-snug">
                    {t.engPillar1Desc}
                  </p>
                </div>

                <div className="p-3 bg-[#FAF8F5] border border-[#D1B995]/20 rounded-xs">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#1F4A3B] mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#B89B6A] shrink-0" />
                    <span>{t.engPillar2Title}</span>
                  </div>
                  <p className="text-[11px] text-[#5C5C5C] leading-snug">
                    {t.engPillar2Desc}
                  </p>
                </div>

                <div className="p-3 bg-[#FAF8F5] border border-[#D1B995]/20 rounded-xs">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#1F4A3B] mb-1">
                    <FileCheck2 className="w-3.5 h-3.5 text-[#B89B6A] shrink-0" />
                    <span>{t.engPillar3Title}</span>
                  </div>
                  <p className="text-[11px] text-[#5C5C5C] leading-snug">
                    {t.engPillar3Desc}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-[#F2EEE5] flex flex-wrap items-center justify-between gap-4">
                <button
                  onClick={() => onOpenWhatsApp(currentLang === 'ar' ? 'استشارة هندسية مع المهندس محمد حسني' : 'Engineering Consultation with Eng. Mohamed Hosny')}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-[#1F4A3B] hover:bg-[#152B24] text-[#D1B995] text-xs font-bold uppercase tracking-wider rounded-sm transition-all shadow-sm cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-current/20" />
                  <span>{t.engConsultCta}</span>
                </button>
                <span className="text-xs text-[#5C5C5C] font-mono">
                  {currentLang === 'ar' ? 'استجابة سريعة عبر واتساب' : 'Direct WhatsApp Response'}
                </span>
              </div>
            </div>
          </div>

          {/* Column 2: Official Engineering Degree / Certificate Showcase (5 Cols) */}
          <div className="lg:col-span-5">
            <div className="bg-white border-2 border-[#D1B995]/40 rounded-sm p-4 sm:p-5 shadow-lg relative">
              
              {/* Header of Certificate Frame */}
              <div className="flex items-center justify-between border-b border-[#D1B995]/30 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#B89B6A]" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F4A3B]">
                      {t.engDegreeTitle}
                    </h4>
                    <span className="text-[10px] text-[#5C5C5C]">
                      {t.engDegreeSubtitle}
                    </span>
                  </div>
                </div>

                <div className="text-[10px] font-mono text-[#B89B6A] bg-[#152B24] px-2 py-0.5 rounded-xs text-[#D1B995]">
                  ENG-CREDENTIAL
                </div>
              </div>

              {/* Certificate Image Frame */}
              <div className="relative aspect-[4/3] bg-[#152B24] rounded-xs overflow-hidden border border-[#D1B995]/30 flex items-center justify-center group">
                {!imageError ? (
                  <>
                    <img
                      src={certificatePath}
                      alt={currentLang === 'ar' ? 'المؤهل والاعتماد الهندسي — المهندس محمد حسني' : 'Engineering Degree & Credential — Eng. Mohamed Hosny'}
                      className="w-full h-full object-contain p-2 group-hover:scale-102 transition-transform duration-500"
                      onError={() => setImageError(true)}
                    />
                    <div className="absolute inset-0 bg-[#152B24]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={handleOpenCertificateZoom}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#D1B995] text-[#1F4A3B] text-xs font-bold rounded-sm shadow-md cursor-pointer hover:bg-[#E5D1B0]"
                      >
                        <ZoomIn className="w-4 h-4" />
                        <span>{t.engDegreeInspectBtn}</span>
                      </button>
                    </div>
                  </>
                ) : (
                  /* Honest, dignified architectural placeholder until actual certificate is provided */
                  <div className="p-6 text-center text-[#F7F5F0] flex flex-col items-center justify-center space-y-3">
                    <div className="w-12 h-12 rounded-full border border-[#D1B995]/50 bg-[#1F4A3B] flex items-center justify-center text-[#D1B995]">
                      <Award className="w-6 h-6" />
                    </div>
                    
                    <div className="space-y-1 max-w-xs">
                      <h5 className="text-xs font-bold text-[#D1B995] tracking-wide">
                        {currentLang === 'ar' ? 'وثيقة المؤهل والاعتماد الهندسي' : 'Accredited Engineering Credential'}
                      </h5>
                      <p className="text-[11px] text-[#F7F5F0]/75 leading-relaxed">
                        {t.engDegreeAwaitingNotice}
                      </p>
                    </div>

                    <div className="pt-2">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#162C26] border border-[#D1B995]/30 rounded-xs text-[10px] font-mono text-[#D1B995]">
                        <FolderOpen className="w-3 h-3 text-[#B89B6A]" />
                        <span>{certificatePath}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Verified Credential Integrity Guarantee */}
              <div className="mt-4 pt-3 border-t border-[#F2EEE5] text-[11px] text-[#5C5C5C] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#1F4A3B] shrink-0" />
                <span>
                  {currentLang === 'ar'
                    ? 'توثيق رسمي صريح دون أي ادعاءات غير موثقة. تُعرض الشهادة فور مزامنتها مع المستودع.'
                    : 'Documented engineering verification. Genuine certificate displays automatically once synchronized.'}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
