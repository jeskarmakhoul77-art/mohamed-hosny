import React from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { BrandLogo } from './BrandLogo';
import { BUSINESS_CONFIG, FEE_POLICY, DISPLAY_WHATSAPP_NUMBER, OFFICIAL_WHATSAPP_LINK } from '../config/businessConfig';
import { Globe, MapPin, Settings, MessageCircle, CheckCircle2, FolderOpen, Lock } from 'lucide-react';

interface FooterProps {
  currentLang: Language;
  onToggleLang: () => void;
  onOpenWhatsApp: (serviceName?: string) => void;
  onOpenPolicy: (type: 'site_visit' | 'refund' | 'privacy') => void;
  onOpenConfigWhatsApp: () => void;
  onOpenMediaSlotsModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  currentLang,
  onToggleLang,
  onOpenWhatsApp,
  onOpenPolicy,
  onOpenConfigWhatsApp,
  onOpenMediaSlotsModal
}) => {
  const t = translations[currentLang];

  return (
    <footer className="bg-[#152B24] text-[#F7F5F0] pt-16 pb-12 border-t border-[#D1B995]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-[#F7F5F0]/10">
          
          {/* Brand Info & Geographic Area */}
          <div className="lg:col-span-5 space-y-4">
            <BrandLogo variant="full" theme="dark" lang={currentLang} />
            
            <p className="text-xs sm:text-sm text-[#F7F5F0]/75 leading-relaxed max-w-sm pt-2">
              {t.footerDesc}
            </p>

            <div className="flex items-center gap-2 text-xs text-[#D1B995] pt-1">
              <MapPin className="w-4 h-4 shrink-0" />
              <span>{currentLang === 'ar' ? BUSINESS_CONFIG.serviceAreaAr : BUSINESS_CONFIG.serviceAreaEn}</span>
            </div>

            {/* Direct WhatsApp Action with 01228744400 */}
            <div className="pt-2 space-y-2">
              <a
                href={OFFICIAL_WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenWhatsApp(currentLang === 'ar' ? 'تشطيب شقق متكامل' : 'Full Apartment Fit-Out');
                }}
                className="inline-flex items-center gap-2.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-sm transition-colors cursor-pointer shadow-md group"
              >
                <MessageCircle className="w-4 h-4 text-emerald-200 fill-current/20 group-hover:scale-110 transition-transform" />
                <span>{t.whatsappChatBtn}</span>
                <span className="font-mono text-emerald-100 bg-emerald-800/80 px-2 py-0.5 rounded-xs text-[11px] font-semibold tracking-wider" dir="ltr">
                  {DISPLAY_WHATSAPP_NUMBER}
                </span>
              </a>
              <div className="text-[11px] text-[#F7F5F0]/70 flex items-center gap-1.5 font-mono">
                <span className="text-[#D1B995] font-sans">{currentLang === 'ar' ? 'رقم الواتساب الرسمي:' : 'Official WhatsApp:'}</span>
                <a
                  href={OFFICIAL_WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-[#D1B995] transition-colors font-bold underline underline-offset-4"
                  dir="ltr"
                >
                  {DISPLAY_WHATSAPP_NUMBER}
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#D1B995]">
              {t.footerQuickLinks}
            </h4>
            <ul className="space-y-2 text-xs text-[#F7F5F0]/80">
              <li>
                <a href="#services" className="hover:text-[#D1B995] transition-colors">{t.navServices}</a>
              </li>
              <li>
                <a href="#apartment-case-study" className="hover:text-[#D1B995] transition-colors">{t.navApartment}</a>
              </li>
              <li>
                <a href="#inbox-gallery" className="hover:text-[#D1B995] transition-colors">{t.navInboxGallery}</a>
              </li>
              <li>
                <a href="#videos" className="hover:text-[#D1B995] transition-colors">{t.navVideos}</a>
              </li>
              <li>
                <a href="#process" className="hover:text-[#D1B995] transition-colors">{t.navProcess}</a>
              </li>
              <li>
                <a href="#about" className="hover:text-[#D1B995] transition-colors">{t.navAbout}</a>
              </li>
            </ul>
          </div>

          {/* Policies & Fee Guidelines */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#D1B995]">
              {t.footerPolicies}
            </h4>
            <ul className="space-y-2 text-xs text-[#F7F5F0]/80">
              <li>
                <button
                  onClick={() => onOpenPolicy('site_visit')}
                  className="hover:text-[#D1B995] transition-colors text-left rtl:text-right cursor-pointer"
                >
                  {t.policySiteVisit}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicy('refund')}
                  className="hover:text-[#D1B995] transition-colors text-left rtl:text-right cursor-pointer"
                >
                  {t.policyRefund}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicy('privacy')}
                  className="hover:text-[#D1B995] transition-colors text-left rtl:text-right cursor-pointer"
                >
                  {t.policyPrivacy}
                </button>
              </li>
            </ul>

            <div className="pt-2 text-[11px] text-[#F7F5F0]/60 space-y-1">
              <p>{currentLang === 'ar' ? FEE_POLICY.paymentNoticeAr : FEE_POLICY.paymentNoticeEn}</p>
            </div>
          </div>

          {/* Action Column */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#D1B995]">
              {currentLang === 'ar' ? 'ابدأ مشروعك' : 'Begin Your Space'}
            </h4>
            <p className="text-xs text-[#F7F5F0]/70 leading-relaxed">
              {currentLang === 'ar'
                ? 'تواصل مباشرة عبر واتساب لتحديد موعد المعاينة الهندسية لمشروعك.'
                : 'Connect directly on WhatsApp to coordinate your on-site engineering visit.'}
            </p>
            <a
              href={OFFICIAL_WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.preventDefault();
                onOpenWhatsApp(currentLang === 'ar' ? 'تشطيب شقق متكامل' : 'Full Apartment Fit-Out');
              }}
              className="w-full py-2.5 text-xs font-bold uppercase tracking-wider text-[#1F4A3B] bg-[#D1B995] hover:bg-[#E5D1B0] transition-colors rounded-sm text-center block cursor-pointer shadow-sm"
            >
              <div className="flex items-center justify-center gap-2">
                <MessageCircle className="w-4 h-4 fill-current/20" />
                <span>{t.bookSiteVisitBtn}</span>
              </div>
            </a>
            <div className="text-center pt-0.5">
              <a
                href={OFFICIAL_WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-mono text-[#D1B995] hover:text-white transition-colors underline underline-offset-2"
                dir="ltr"
              >
                {DISPLAY_WHATSAPP_NUMBER}
              </a>
            </div>

            {/* Quick Admin Triggers: Media Manager & WhatsApp Config */}
            <div className="pt-2 flex flex-col gap-1.5 text-center sm:text-right rtl:sm:text-left">
              <button
                onClick={onOpenMediaSlotsModal}
                className="inline-flex items-center gap-1.5 text-xs text-[#D1B995] hover:text-white font-semibold transition-colors cursor-pointer bg-[#152B24] border border-[#D1B995]/40 px-3 py-1.5 rounded-sm shadow-xs self-start sm:self-auto"
                title={t.mediaManagerDesc}
              >
                <Lock className="w-3.5 h-3.5 text-[#D1B995]" />
                <span>{currentLang === 'ar' ? 'دخول الإدارة (مدير الوسائط)' : 'Admin Portal (Media Manager)'}</span>
              </button>

              <button
                onClick={onOpenConfigWhatsApp}
                className="inline-flex items-center gap-1.5 text-[10px] text-[#F7F5F0]/40 hover:text-[#D1B995] transition-colors cursor-pointer"
                title={t.adminWhatsAppConfig}
              >
                <Settings className="w-3 h-3" />
                <span>{t.adminWhatsAppConfig}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#F7F5F0]/60">
          <div>
            {t.copyrightNotice}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onToggleLang}
              className="inline-flex items-center gap-1.5 text-xs text-[#D1B995] hover:text-white cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{currentLang === 'ar' ? 'English Version' : 'النسخة العربية'}</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
