import React from 'react';
import { Language } from '../types';
import { MessageCircle, ShieldCheck, ArrowRight, ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';

interface SiteInspectionFeeSectionProps {
  currentLang: Language;
  onOpenWhatsApp: (serviceName?: string) => void;
}

export const SiteInspectionFeeSection: React.FC<SiteInspectionFeeSectionProps> = ({
  currentLang,
  onOpenWhatsApp
}) => {
  const isRtl = currentLang === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const inspectionNoticeHeadline = currentLang === 'ar'
    ? 'معاينة هندسية دقيقة للموقع.'
    : 'Comprehensive On-Site Engineering Inspection.';

  const inspectionNoticeBody = currentLang === 'ar'
    ? 'رفع المقاسات الإنشائية والمعمارية وإعداد تقرير فني شامل للوحدة قبل بدء التنفيذ.'
    : 'Accurate architectural surveying and preliminary engineering assessment for your space.';

  const sectionKicker = currentLang === 'ar' ? 'الشفافية الهندسية والتعاقدية' : 'Engineering Transparency & Terms';
  const sectionTitle = currentLang === 'ar' ? 'معاينة هندسية دقيقة وإشراف فني مباشر' : 'Rigorous Engineering Site Inspection & Technical Oversight';
  const ctaLabel = currentLang === 'ar' ? 'احجز موعد المعاينة عبر واتساب' : 'Book Site Inspection on WhatsApp';

  const benefits = currentLang === 'ar' ? [
    'رفع المقاسات الإنشائية والمعمارية بدقة متناهية بميزان الليزر',
    'فحص التأسيسات الحالية للسباكة والكهرباء وتحديد متطلبات السلامة',
    'استشارة معمارية واقتراح حلول توزيع الفراغات المثالية لنمط حياتك',
    'تقديم دراسة فنية ومقايسة واضحة لكافة بنود ومواصفات المشروع'
  ] : [
    'Precise architectural laser dimensioning and structural survey',
    'Diagnostic assessment of existing MEP infrastructure and safety requirements',
    'Bespoke architectural consultation on optimal spatial flow and materials',
    'Detailed technical quotation and itemized specification review'
  ];

  return (
    <section id="inspection-fee" className="py-16 lg:py-20 bg-[#152B24] text-[#F7F5F0] border-t border-b border-[#D1B995]/30 relative overflow-hidden">
      {/* Subtle architectural background texture accent */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#D1B995_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#1F4A3B] to-[#12251F] border border-[#D1B995]/40 rounded-sm p-8 sm:p-12 shadow-2xl">
          
          {/* Header Badge */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold tracking-wider uppercase text-[#D1B995] mb-4">
            <span className="w-5 h-[1.5px] bg-[#D1B995]" />
            <span>{sectionKicker}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#F7F5F0] mb-6 leading-tight">
            {sectionTitle}
          </h2>

          {/* Core Mandated Fee Statement Callout */}
          <div className="bg-[#152B24]/90 border-l-4 rtl:border-l-0 rtl:border-r-4 border-[#D1B995] p-5 sm:p-6 rounded-xs mb-8 shadow-inner">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-sm bg-[#D1B995] text-[#152B24] flex items-center justify-center shrink-0 font-bold text-xl">
                ✓
              </div>
              <div>
                <p className="text-lg sm:text-xl font-bold text-[#D1B995] leading-snug">
                  {inspectionNoticeHeadline}
                </p>
                <p className="text-sm sm:text-base font-semibold text-[#F7F5F0] mt-1 leading-relaxed">
                  {inspectionNoticeBody}
                </p>
                <p className="text-xs text-[#F7F5F0]/70 mt-2 font-normal">
                  {currentLang === 'ar'
                    ? 'نضمن لك استثماراً مضموناً في المعاينة الفنية الموثقة دون أي تكلفة إضافية عند بدء التنفيذ.'
                    : 'A transparent engineering survey with 100% cost deduction upon contract signing.'}
                </p>
              </div>
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-[#F7F5F0]/90">
                <CheckCircle2 className="w-4 h-4 text-[#D1B995] shrink-0 mt-0.5" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          {/* Action CTA */}
          <div className="pt-4 border-t border-[#D1B995]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-[#F7F5F0]/70 font-mono">
              {currentLang === 'ar'
                ? 'القاهرة والجيزة وكافة أنحاء مصر · تواصل مباشر مع المهندس التنفيذي'
                : 'Cairo, Giza & across Egypt · Direct booking with supervising engineer'}
            </div>

            <button
              onClick={() => onOpenWhatsApp(currentLang === 'ar' ? 'حجز معاينة هندسية ميدانية' : 'Site Inspection Booking')}
              className="inline-flex items-center justify-center gap-3 px-8 py-4 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#1F4A3B] bg-[#D1B995] hover:bg-[#E5D1B0] transition-all rounded-sm shadow-lg cursor-pointer group whitespace-nowrap"
            >
              <MessageCircle className="w-5 h-5 text-[#1F4A3B] fill-current/20 group-hover:scale-110 transition-transform" />
              <span>{ctaLabel}</span>
              <ArrowIcon className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};
