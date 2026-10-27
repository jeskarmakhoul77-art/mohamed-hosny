import React, { useState } from 'react';
import { Language, VideoSlot } from '../types';
import { translations } from '../translations';
import { Play, Video, Info, MessageCircle } from 'lucide-react';

interface MeetOwnerSectionProps {
  currentLang: Language;
  videoSlot: VideoSlot;
  onOpenWhatsApp: (serviceName?: string) => void;
}

export const MeetOwnerSection: React.FC<MeetOwnerSectionProps> = ({
  currentLang,
  videoSlot,
  onOpenWhatsApp
}) => {
  const t = translations[currentLang];
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="py-16 lg:py-24 bg-[#F7F5F0] text-[#242424] border-b border-[#D1B995]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#B89B6A] mb-2">
            <span className="w-5 h-[1.5px] bg-[#B89B6A]" />
            <span>{t.ownerSectionKicker}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1F4A3B]">
            {t.ownerSectionTitle}
          </h2>
          <p className="mt-4 text-base text-[#5C5C5C] leading-relaxed">
            {t.ownerIntroParagraph}
          </p>
        </div>

        {/* Video Presentation Card */}
        <div className="relative rounded-sm overflow-hidden border border-[#D1B995]/30 bg-[#152B24] shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            
            {/* Visual Player Canvas */}
            <div className="lg:col-span-8 relative aspect-video bg-[#0D1A16] flex items-center justify-center overflow-hidden group">
              {videoSlot.videoUrl ? (
                isPlaying ? (
                  <iframe
                    src={videoSlot.videoUrl}
                    title={currentLang === 'ar' ? videoSlot.titleAr : videoSlot.titleEn}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <>
                    <img
                      src={videoSlot.posterUrl || '/assets/aistudio/Luxury_Architectural_Gold_Monogram_Branding_9b169c0f.png'}
                      alt={currentLang === 'ar' ? videoSlot.titleAr : videoSlot.titleEn}
                      className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-[#152B24]/40 flex items-center justify-center">
                      <button
                        onClick={() => setIsPlaying(true)}
                        className="w-20 h-20 rounded-full bg-[#D1B995] text-[#1F4A3B] flex items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer focus-visible:ring-4 focus-visible:ring-white"
                        aria-label={t.playVideo}
                      >
                        <Play className="w-8 h-8 fill-current translate-x-0.5" />
                      </button>
                    </div>
                  </>
                )
              ) : (
                /* Honest replaceable placeholder awaiting upload */
                <div className="relative w-full h-full flex flex-col items-center justify-center p-8 text-center bg-[#152B24]/95 text-[#F7F5F0]">
                  <div className="w-16 h-16 rounded-full border border-[#D1B995]/40 bg-[#1F4A3B] flex items-center justify-center text-[#D1B995] mb-4">
                    <Video className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-[#D1B995]">
                    {t.ownerVideoPlaceholderText}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-[#F7F5F0]/70 max-w-md">
                    {t.ownerVideoInstruction}
                  </p>
                  <div className="mt-5 inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium bg-[#1F4A3B] border border-[#D1B995]/30 text-[#D1B995] rounded-sm">
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    <span>{currentLang === 'ar' ? 'خانة الفيديو رقم 01 — مخصصة لحديث مؤسس العمل' : 'Video Slot 01 — Reserved for Owner Presentation'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Video Side Context Column */}
            <div className="lg:col-span-4 p-6 sm:p-8 flex flex-col justify-between bg-[#1F4A3B] text-[#F7F5F0] border-t lg:border-t-0 lg:border-l lg:border-r border-[#D1B995]/20">
              <div className="space-y-4">
                <div className="text-[11px] font-semibold tracking-wider uppercase text-[#D1B995]">
                  {currentLang === 'ar' ? 'حديث الإدارة والمسؤولية' : 'Leadership & Direct Supervision'}
                </div>
                <h3 className="text-xl font-bold leading-snug text-[#F7F5F0]">
                  {currentLang === 'ar' ? videoSlot.titleAr : videoSlot.titleEn}
                </h3>
                <p className="text-xs sm:text-sm text-[#F7F5F0]/80 leading-relaxed">
                  {currentLang === 'ar' ? videoSlot.descriptionAr : videoSlot.descriptionEn}
                </p>
                
                <div className="pt-4 border-t border-[#F7F5F0]/10 space-y-2 text-xs text-[#F7F5F0]/75">
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D1B995] mt-1.5 shrink-0" />
                    <span>{currentLang === 'ar' ? 'معاينة شخصية للموقع واستماع لاحتياجات العميل' : 'Direct on-site consultation tailored to your space'}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D1B995] mt-1.5 shrink-0" />
                    <span>{currentLang === 'ar' ? 'مقايسة معلنة دون بنود مخفية أو زيادات مفاجئة' : 'Transparent line-item specification with no surprise costs'}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D1B995] mt-1.5 shrink-0" />
                    <span>{currentLang === 'ar' ? 'رسوم المعاينة (600 ج.م) تُخصم بالكامل عند التعاقد' : 'Inspection fee (600 EGP) is 100% credited upon contract'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-[#F7F5F0]/10">
                <button
                  onClick={() => onOpenWhatsApp(currentLang === 'ar' ? 'استشارة تشطيب مع المهندس محمد حسني' : 'Finishing Consultation with Eng. Mohamed Hosny')}
                  className="w-full py-3 px-4 text-xs font-bold tracking-wider uppercase bg-[#D1B995] hover:bg-[#E5D1B0] text-[#1F4A3B] transition-colors rounded-sm text-center flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <MessageCircle className="w-4 h-4 fill-current/20" />
                  <span>{t.bookSiteVisitBtn}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
