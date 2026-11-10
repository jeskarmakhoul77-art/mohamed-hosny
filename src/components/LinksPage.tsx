import React from 'react';
import { BrandLogo } from './BrandLogo';
import { Language } from '../types';
import { OFFICIAL_WHATSAPP_LINK, DISPLAY_WHATSAPP_NUMBER } from '../config/businessConfig';
import { 
  Globe, 
  MessageCircle, 
  Instagram, 
  Facebook, 
  Video, 
  Youtube, 
  Smartphone, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface LinksPageProps {
  currentLang: Language;
  onToggleLang: () => void;
  onNavigateHome: () => void;
}

export const LinksPage: React.FC<LinksPageProps> = ({
  currentLang,
  onToggleLang,
  onNavigateHome
}) => {
  const isAr = currentLang === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  const links = [
    {
      id: 'website',
      title: isAr ? 'الموقع الإلكتروني الرسمي' : 'Official Website',
      subtitle: isAr ? 'معرض الأعمال والمشاريع والخدمات الهندسية' : 'Full Portfolio, Case Studies & Services',
      icon: Globe,
      url: '/',
      isInternal: true,
      badge: isAr ? 'الرئيسية' : 'Home',
      badgeColor: 'bg-[#D1B995] text-[#1F4A3B]',
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        onNavigateHome();
      }
    },
    {
      id: 'whatsapp',
      title: isAr ? 'تواصل عبر واتساب الرسمي' : 'Official WhatsApp Chat',
      subtitle: isAr ? `حجز معاينة واستشارة هندسية (${DISPLAY_WHATSAPP_NUMBER})` : `Book Site Visit & Consultation (${DISPLAY_WHATSAPP_NUMBER})`,
      icon: MessageCircle,
      url: OFFICIAL_WHATSAPP_LINK,
      isInternal: false,
      badge: isAr ? 'مباشر' : 'Live',
      badgeColor: 'bg-emerald-600 text-white'
    },
    {
      id: 'instagram',
      title: isAr ? 'إنستغرام' : 'Instagram',
      subtitle: '@eng1mohamed_hosny — لقطات وفيديوهات تنفيذية من المواقع',
      icon: Instagram,
      url: 'https://www.instagram.com/eng1mohamed_hosny',
      isInternal: false,
      badge: 'Meta Verified'
    },
    {
      id: 'facebook',
      title: isAr ? 'فيسبوك' : 'Facebook',
      subtitle: isAr ? 'صفحة المهندس محمد حسني — مقالات وتحديثات المشاريع' : 'Eng. Mohamed Hosny Official Page',
      icon: Facebook,
      url: 'https://www.facebook.com/eng.mohamedhosny',
      isInternal: false,
      badge: isAr ? 'الصفحة الرسمية' : 'Official Page'
    },
    {
      id: 'tiktok',
      title: isAr ? 'تيك توك' : 'TikTok',
      subtitle: '@eng1mohamed_hosny — جولات ومراحل التشطيب السريع',
      icon: Video,
      url: 'https://www.tiktok.com/@eng1mohamed_hosny',
      isInternal: false,
      badge: 'Reels & Clips'
    },
    {
      id: 'youtube',
      title: isAr ? 'يوتيوب' : 'YouTube',
      subtitle: isAr ? 'قناة التوثيق الهندسي وجولات التسليم الكامل' : 'Engineering Documentation & Tours',
      icon: Youtube,
      url: 'https://www.youtube.com/@eng1mohamed_hosny',
      isInternal: false,
      badge: 'HD Videos'
    },
    {
      id: 'app',
      title: isAr ? 'تطبيق الهاتف الذكي' : 'Mobile Application',
      subtitle: isAr ? 'متابعة مراحل تشطيب شقتك خطوة بخطوة بالصور والفيديوهات' : 'Track your fit-out stages step-by-step',
      icon: Smartphone,
      url: '#',
      isInternal: true,
      isComingSoon: true,
      badge: isAr ? 'قريباً' : 'Coming Soon',
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
      }
    }
  ];

  return (
    <div className="min-h-screen bg-[#152B24] text-[#F7F5F0] flex flex-col justify-between py-10 px-4 sm:px-6 relative overflow-hidden selection:bg-[#D1B995]/30 selection:text-[#D1B995]">
      {/* Decorative architectural background grid */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#D1B995 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* Top Controls: Return Home & Language Switcher */}
      <header className="max-w-md w-full mx-auto flex items-center justify-between z-10 mb-6">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 text-xs text-[#D1B995] hover:text-white transition-colors py-1.5 px-3 rounded-full bg-[#1F4A3B]/60 border border-[#D1B995]/20 backdrop-blur-xs cursor-pointer"
        >
          <BackArrow className="w-3.5 h-3.5" />
          <span>{isAr ? 'العودة للموقع' : 'Back to Website'}</span>
        </button>

        <button
          onClick={onToggleLang}
          className="inline-flex items-center gap-1.5 text-xs text-[#F7F5F0]/80 hover:text-[#D1B995] transition-colors py-1.5 px-3 rounded-full bg-[#1F4A3B]/60 border border-[#D1B995]/20 backdrop-blur-xs cursor-pointer font-mono"
        >
          <Globe className="w-3.5 h-3.5 text-[#D1B995]" />
          <span>{isAr ? 'English' : 'عربي'}</span>
        </button>
      </header>

      {/* Profile & Branding Header */}
      <main className="max-w-md w-full mx-auto flex-1 flex flex-col items-center z-10">
        <div className="mb-4 transform hover:scale-105 transition-transform duration-300 cursor-pointer" onClick={onNavigateHome}>
          <BrandLogo variant="monogram-only" theme="dark" className="w-16 h-16" />
        </div>

        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-center text-[#F7F5F0]">
          {isAr ? 'المهندس محمد حسني' : 'Eng. Mohamed Hosny'}
        </h1>

        <div className="flex items-center gap-1.5 text-xs text-[#D1B995] font-semibold tracking-wider uppercase mt-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#D1B995]" />
          <span>{isAr ? 'المقاولات والتشطيبات والتصميم الداخلي' : 'Construction & Interior Design'}</span>
        </div>

        <p className="text-xs text-[#F7F5F0]/70 text-center mt-2 max-w-xs leading-relaxed">
          {isAr
            ? 'من الفكرة إلى التنفيذ — إشراف هندسي متكامل وتشطيبات معمارية راقية بالقاهرة ومصر.'
            : 'From Concept to Completion — Turnkey architectural fit-outs & premium interior design in Egypt.'}
        </p>

        {/* Links List */}
        <div className="w-full space-y-3 mt-6">
          {links.map((link) => {
            const IconComponent = link.icon;
            const isInactive = link.isComingSoon;

            return (
              <a
                key={link.id}
                href={link.url}
                target={link.isInternal ? '_self' : '_blank'}
                rel={link.isInternal ? undefined : 'noopener noreferrer'}
                onClick={link.onClick}
                className={`w-full group block p-3.5 sm:p-4 rounded-xl transition-all duration-200 border backdrop-blur-md ${
                  isInactive
                    ? 'bg-[#1F4A3B]/30 border-[#D1B995]/10 opacity-75 cursor-default'
                    : 'bg-[#1F4A3B]/80 hover:bg-[#1F4A3B] border-[#D1B995]/25 hover:border-[#D1B995] hover:shadow-lg hover:shadow-[#D1B995]/5 cursor-pointer transform hover:-translate-y-0.5'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`p-2.5 rounded-lg shrink-0 transition-colors ${
                    isInactive
                      ? 'bg-[#152B24] text-[#F7F5F0]/40'
                      : 'bg-[#152B24] text-[#D1B995] group-hover:bg-[#D1B995] group-hover:text-[#1F4A3B]'
                  }`}>
                    <IconComponent className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-sm font-bold text-[#F7F5F0] truncate group-hover:text-[#D1B995] transition-colors">
                        {link.title}
                      </h2>
                      {link.badge && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                          link.badgeColor || 'bg-[#152B24] text-[#D1B995] border border-[#D1B995]/20'
                        }`}>
                          {link.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#F7F5F0]/65 truncate mt-0.5" dir="auto">
                      {link.subtitle}
                    </p>
                  </div>
                </div>
              </a>
            );
          })}
        </div>

        {/* Direct WhatsApp Callout Pill */}
        <div className="w-full mt-6 p-4 rounded-xl bg-gradient-to-r from-emerald-950/80 to-[#1F4A3B]/90 border border-emerald-500/30 text-center shadow-md">
          <p className="text-xs text-emerald-200 font-semibold mb-1">
            {isAr ? 'لحجز معاينة هندسية ميدانية فورية:' : 'For Immediate On-Site Engineering Survey:'}
          </p>
          <a
            href={OFFICIAL_WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-bold text-white hover:text-emerald-300 transition-colors font-mono tracking-wider"
            dir="ltr"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>{DISPLAY_WHATSAPP_NUMBER}</span>
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-md w-full mx-auto text-center z-10 pt-8 pb-2 text-[11px] text-[#F7F5F0]/50">
        <p>© {new Date().getFullYear()} MOHAMED HOSNY — Construction & Interior Design</p>
        <p className="text-[10px] text-[#D1B995]/60 mt-1">
          {isAr ? 'القاهرة • الجيزة • جميع محافظات مصر' : 'Cairo • Giza • Across Egypt'}
        </p>
      </footer>
    </div>
  );
};
