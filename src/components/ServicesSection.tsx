import React from 'react';
import { Language } from '../types';
import { CORE_SERVICES } from '../data/portfolioData';
import { translations } from '../translations';
import {
  Home,
  Palette,
  Store,
  Hammer,
  Droplet,
  Zap,
  Layers,
  Grid,
  Layout,
  Brush,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  MessageCircle
} from 'lucide-react';

interface ServicesSectionProps {
  currentLang: Language;
  onOpenWhatsApp: (serviceName?: string) => void;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  home: Home,
  palette: Palette,
  store: Store,
  hammer: Hammer,
  droplet: Droplet,
  zap: Zap,
  layers: Layers,
  grid: Grid,
  layout: Layout,
  brush: Brush,
  'check-circle': CheckCircle2
};

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  currentLang,
  onOpenWhatsApp
}) => {
  const t = translations[currentLang];
  const isRtl = currentLang === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <section id="services" className="py-16 lg:py-24 bg-[#F7F5F0] text-[#242424] border-b border-[#D1B995]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#B89B6A] mb-2">
              <span className="w-5 h-[1.5px] bg-[#B89B6A]" />
              <span>{t.servicesKicker}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1F4A3B]">
              {t.servicesTitle}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#5C5C5C] leading-relaxed">
              {t.servicesSubtitle}
            </p>
          </div>

          <button
            onClick={() => onOpenWhatsApp(currentLang === 'ar' ? 'تشطيب شقق متكامل' : 'Full Apartment Fit-Out')}
            className="inline-flex items-center gap-2 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-[#1F4A3B] bg-[#D1B995] hover:bg-[#E5D1B0] transition-colors rounded-sm shadow-sm cursor-pointer whitespace-nowrap self-start md:self-auto"
          >
            <MessageCircle className="w-4 h-4 fill-current/20" />
            <span>{t.bookSiteVisitBtn}</span>
            <ArrowIcon className="w-4 h-4" />
          </button>
        </div>

        {/* 11 Services Grid — Harmonious Architectural Forest Green Palette */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CORE_SERVICES.map((srv) => {
            const IconComponent = ICON_MAP[srv.icon] || Home;
            const title = currentLang === 'ar' ? srv.titleAr : srv.titleEn;
            const summary = currentLang === 'ar' ? srv.summaryAr : srv.summaryEn;

            return (
              <div
                key={srv.id}
                className={`relative p-6 rounded-sm border transition-all flex flex-col justify-between text-[#F7F5F0] shadow-sm hover:shadow-md ${
                  srv.featured
                    ? 'bg-gradient-to-br from-[#1F4A3B] via-[#1A382E] to-[#132720] border-[#D1B995]/50 ring-1 ring-[#D1B995]/20'
                    : 'bg-gradient-to-br from-[#1B3E32] via-[#163329] to-[#122820] border-[#D1B995]/30 hover:border-[#D1B995]/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-11 h-11 rounded-sm flex items-center justify-center transition-colors ${
                        srv.featured
                          ? 'bg-[#152B24] text-[#D1B995] border border-[#D1B995]/50'
                          : 'bg-[#152B24]/80 text-[#D1B995] border border-[#D1B995]/30'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>

                    {/* Featured Offering Marker or Index Number */}
                    {srv.featured ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#D1B995] bg-[#152B24]/90 px-2.5 py-0.5 rounded-xs border border-[#D1B995]/30">
                        {t.coreOfferingBadge}
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono text-[#D1B995]/70">
                        0{srv.id}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold leading-snug mb-2 text-[#F7F5F0]">
                    {title}
                  </h3>

                  <p className="text-xs sm:text-sm leading-relaxed text-[#F7F5F0]/80">
                    {summary}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#D1B995]/20">
                  <button
                    onClick={() => onOpenWhatsApp(title)}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-[#D1B995] hover:text-[#E5D1B0] transition-colors cursor-pointer group"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-current/20 group-hover:scale-110 transition-transform" />
                    <span>{t.requestServiceQuote}</span>
                    <ArrowIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
