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
  const [showAllServices, setShowAllServices] = React.useState(false);

  const displayedServices = showAllServices ? CORE_SERVICES : CORE_SERVICES.slice(0, 3);

  return (
    <section id="services" className="py-10 sm:py-12 lg:py-14 bg-[#F7F5F0] text-[#242424] border-b border-[#D1B995]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#B89B6A] mb-1.5">
              <span className="w-5 h-[1.5px] bg-[#B89B6A]" />
              <span>{t.servicesKicker}</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-[#1F4A3B]">
              {t.servicesTitle}
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#5C5C5C] leading-relaxed">
              {t.servicesSubtitle}
            </p>
          </div>

          <button
            onClick={() => onOpenWhatsApp(currentLang === 'ar' ? 'تشطيب شقق متكامل' : 'Full Apartment Fit-Out')}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#1F4A3B] bg-[#D1B995] hover:bg-[#E5D1B0] transition-colors rounded-xs shadow-xs cursor-pointer whitespace-nowrap self-start md:self-auto"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-current/20" />
            <span>{t.bookSiteVisitBtn}</span>
            <ArrowIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Services Grid — Sleek, Compact Horizontal Rectangles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5">
          {displayedServices.map((srv) => {
            const IconComponent = ICON_MAP[srv.icon] || Home;
            const title = currentLang === 'ar' ? srv.titleAr : srv.titleEn;
            const summary = currentLang === 'ar' ? srv.summaryAr : srv.summaryEn;

            return (
              <div
                key={srv.id}
                className={`relative p-3 sm:p-3.5 rounded-xs border transition-all flex items-start gap-3 text-[#F7F5F0] shadow-2xs hover:shadow-sm ${
                  srv.featured
                    ? 'bg-gradient-to-br from-[#1F4A3B] via-[#1A382E] to-[#132720] border-[#D1B995]/50 ring-1 ring-[#D1B995]/20'
                    : 'bg-gradient-to-br from-[#1B3E32] via-[#163329] to-[#122820] border-[#D1B995]/30 hover:border-[#D1B995]/60'
                }`}
              >
                {/* Icon Box */}
                <div
                  className={`w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-xs flex items-center justify-center transition-colors ${
                    srv.featured
                      ? 'bg-[#152B24] text-[#D1B995] border border-[#D1B995]/50'
                      : 'bg-[#152B24]/80 text-[#D1B995] border border-[#D1B995]/30'
                  }`}
                >
                  <IconComponent className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>

                {/* Content & Action */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-1.5 mb-1">
                      <h3 className="text-xs sm:text-sm font-bold leading-tight text-[#F7F5F0] truncate">
                        {title}
                      </h3>
                      {srv.featured ? (
                        <span className="shrink-0 text-[8px] font-bold uppercase tracking-wider text-[#D1B995] bg-[#152B24]/90 px-1.5 py-0.5 rounded-xs border border-[#D1B995]/30">
                          {t.coreOfferingBadge}
                        </span>
                      ) : (
                        <span className="shrink-0 text-[9px] font-mono text-[#D1B995]/70">
                          0{srv.id}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] sm:text-xs leading-relaxed text-[#F7F5F0]/80 line-clamp-2">
                      {summary}
                    </p>
                  </div>

                  <div className="mt-2 pt-1.5 border-t border-[#D1B995]/15 flex items-center justify-between">
                    <button
                      onClick={() => onOpenWhatsApp(title)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#D1B995] hover:text-[#E5D1B0] transition-colors cursor-pointer group"
                    >
                      <MessageCircle className="w-3 h-3 fill-current/20 group-hover:scale-110 transition-transform" />
                      <span>{t.requestServiceQuote}</span>
                      <ArrowIcon className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Services Expansion Toggle — 3 initial services with Show More / Show Less */}
        <div className="mt-6 text-center">
          <button
            onClick={() => setShowAllServices(!showAllServices)}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-[#1F4A3B] bg-white hover:bg-[#F2ECE4] border border-[#D1B995]/50 rounded-xs transition-all shadow-xs cursor-pointer"
          >
            <span>
              {showAllServices
                ? (isRtl ? 'عرض أقل' : 'Show Less')
                : (isRtl ? 'عرض المزيد (كافة الـ 11 خدمة)' : 'Show More (All 11 Services)')}
            </span>
          </button>
        </div>

      </div>
    </section>
  );
};
