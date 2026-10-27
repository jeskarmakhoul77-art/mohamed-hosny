import React, { useState, useMemo } from 'react';
import { Language, PortfolioSlot } from '../types';
import { translations } from '../translations';
import { Image as ImageIcon, ZoomIn, ChevronRight, ChevronLeft, X, MessageCircle, FolderOpen } from 'lucide-react';

interface PortfolioSectionProps {
  currentLang: Language;
  slots: PortfolioSlot[];
  onOpenWhatsApp: (serviceName?: string) => void;
}

export const PortfolioSection: React.FC<PortfolioSectionProps> = ({
  currentLang,
  slots,
  onOpenWhatsApp
}) => {
  const t = translations[currentLang];
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);
  const [slotImageErrors, setSlotImageErrors] = useState<Record<string, boolean>>({});

  const categories = useMemo(() => [
    { id: 'all', label: t.portfolioCategoryAll },
    { id: 'plumbing', label: t.portfolioCategoryPlumbing },
    { id: 'electrical', label: t.portfolioCategoryElectrical },
    { id: 'plastering', label: t.portfolioCategoryPlastering },
    { id: 'ceramics', label: t.portfolioCategoryCeramics },
    { id: 'gypsum', label: t.portfolioCategoryGypsum },
    { id: 'painting', label: t.portfolioCategoryPainting },
    { id: 'interior', label: t.portfolioCategoryInterior },
    { id: 'commercial', label: t.portfolioCategoryCommercial },
  ], [t]);

  const filteredSlots = useMemo(() => {
    if (selectedCategory === 'all') return slots;
    return slots.filter((s) => s.category === selectedCategory);
  }, [slots, selectedCategory]);

  const activeSlot = activeLightboxIndex !== null ? filteredSlots[activeLightboxIndex] : null;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeLightboxIndex !== null && activeLightboxIndex > 0) {
      setActiveLightboxIndex(activeLightboxIndex - 1);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeLightboxIndex !== null && activeLightboxIndex < filteredSlots.length - 1) {
      setActiveLightboxIndex(activeLightboxIndex + 1);
    }
  };

  return (
    <section id="portfolio" className="py-16 lg:py-24 bg-[#F7F5F0] text-[#242424] border-b border-[#D1B995]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#B89B6A] mb-2">
              <span className="w-5 h-[1.5px] bg-[#B89B6A]" />
              <span>{t.portfolioKicker}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1F4A3B]">
              {t.portfolioTitle}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#5C5C5C] leading-relaxed">
              {t.portfolioSubtitle}
            </p>
          </div>

          <div className="shrink-0 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#1F4A3B] text-[#D1B995] border border-[#D1B995]/40 rounded-sm text-xs font-semibold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#D1B995]" />
              <span>{t.portfolioPrimaryBadge}</span>
            </div>
            <div className="hidden lg:flex items-center gap-2 font-mono text-[11px] text-[#1F4A3B] bg-white px-3.5 py-2 rounded-xs border border-[#D1B995]/30">
              <FolderOpen className="w-3.5 h-3.5 text-[#B89B6A]" />
              <span>public/assets/projects/{'{category}'}/{'{slotKey}'}.jpg</span>
            </div>
          </div>
        </div>

        {/* Category Filters (Clean Segmented Tabs per Frontend Design Rule) */}
        <div className="mb-10 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <div className="flex items-center gap-1.5 p-1.5 bg-[#EAE5D9] rounded-sm">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setActiveLightboxIndex(null);
                  }}
                  className={`px-3.5 py-2 text-xs font-medium rounded-sm transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#1F4A3B] text-[#F7F5F0] shadow-sm font-semibold'
                      : 'text-[#242424] hover:text-[#1F4A3B] hover:bg-white/40'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 40-Slot Grid (Showing filtered slots with unique slotKeys) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredSlots.map((slot, index) => {
            const title = currentLang === 'ar' ? slot.titleAr : slot.titleEn;
            const categoryLabel = currentLang === 'ar' ? slot.categoryLabelAr : slot.categoryLabelEn;

            return (
              <div
                key={slot.id}
                onClick={() => setActiveLightboxIndex(index)}
                className="group relative flex flex-col bg-white border border-[#D1B995]/25 hover:border-[#D1B995] rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                {/* Visual Ratio Container */}
                <div className="relative aspect-[4/3] bg-[#162C26] overflow-hidden">
                  {slot.imageUrl && !slotImageErrors[slot.slotKey] ? (
                    <img
                      src={slot.imageUrl}
                      alt={title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={() => setSlotImageErrors((prev) => ({ ...prev, [slot.slotKey]: true }))}
                    />
                  ) : (
                    /* Designated Slot Placeholder with slotKey & target path */
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-[#1F4A3B] text-[#F7F5F0]">
                      <div className="w-10 h-10 rounded-full border border-[#D1B995]/30 bg-[#162C26] flex items-center justify-center text-[#D1B995] mb-2 group-hover:scale-110 transition-transform">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      
                      {/* Slot Key Badge */}
                      <span className="text-[11px] font-mono font-bold tracking-wider text-[#D1B995] bg-[#152B24] px-2.5 py-0.5 rounded-xs border border-[#D1B995]/30">
                        {slot.slotKey}
                      </span>
                      
                      <p className="text-[10px] font-mono text-[#F7F5F0]/60 mt-1.5 truncate max-w-full px-2">
                        {slot.defaultFilePath}
                      </p>
                    </div>
                  )}

                  {/* Slot Number & Key Badge */}
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-[#152B24]/90 backdrop-blur-xs text-[#D1B995] text-[10px] font-mono font-bold rounded-sm border border-[#D1B995]/20">
                    {slot.slotKey}
                  </div>

                  {/* Hover Inspect Overlay */}
                  <div className="absolute inset-0 bg-[#1F4A3B]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#152B24] border border-[#D1B995]/40 text-xs text-[#D1B995] rounded-sm">
                      <ZoomIn className="w-3.5 h-3.5" />
                      <span>{t.viewDetails}</span>
                    </div>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-4 flex flex-col flex-1 justify-between">
                  <div>
                    {/* Unboxed Metadata */}
                    <div className="flex items-center justify-between text-[11px] text-[#B89B6A] font-medium mb-1">
                      <span>{categoryLabel}</span>
                      <span className="font-mono text-[10px] opacity-75">{slot.slotKey}</span>
                    </div>
                    <h3 className="text-sm font-bold text-[#1F4A3B] line-clamp-2 leading-snug">
                      {title}
                    </h3>
                  </div>

                  <p className="mt-2 text-xs text-[#5C5C5C] line-clamp-2 leading-relaxed">
                    {currentLang === 'ar' ? slot.descriptionAr : slot.descriptionEn}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Lightbox Modal with Slot Key Info */}
        {activeSlot && (
          <div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
            onClick={() => setActiveLightboxIndex(null)}
          >
            <div
              className="relative max-w-4xl w-full bg-[#152B24] border border-[#D1B995]/40 rounded-sm overflow-hidden text-[#F7F5F0] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Bar */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-[#D1B995]/20 bg-[#0D1A16]">
                <div className="flex items-center gap-2.5 text-xs">
                  <span className="font-mono text-[#D1B995] font-bold px-2 py-0.5 bg-[#1F4A3B] rounded-xs border border-[#D1B995]/40">
                    {activeSlot.slotKey}
                  </span>
                  <span className="text-[#F7F5F0]/40">·</span>
                  <span className="text-[#F7F5F0]/80">
                    {currentLang === 'ar' ? activeSlot.categoryLabelAr : activeSlot.categoryLabelEn} (#{activeSlot.id} / 40)
                  </span>
                </div>
                <button
                  onClick={() => setActiveLightboxIndex(null)}
                  className="p-1 text-[#F7F5F0]/70 hover:text-white rounded-sm cursor-pointer"
                  aria-label={t.closeModal}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Lightbox Visual */}
              <div className="relative aspect-[16/10] bg-black flex items-center justify-center">
                {activeSlot.imageUrl ? (
                  <img
                    src={activeSlot.imageUrl}
                    alt={currentLang === 'ar' ? activeSlot.titleAr : activeSlot.titleEn}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="p-8 text-center flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full border border-[#D1B995]/40 bg-[#162C26] flex items-center justify-center text-[#D1B995] mb-3">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                    
                    <span className="text-xs font-mono font-bold text-[#D1B995] bg-[#1F4A3B] px-3 py-1 rounded-xs border border-[#D1B995]/40 mb-2">
                      {activeSlot.slotKey}
                    </span>

                    <p className="text-base font-bold text-[#F7F5F0]">
                      {t.awaitingAuthenticPhoto}
                    </p>
                    
                    <p className="mt-2 text-xs text-[#F7F5F0]/70 max-w-md">
                      {t.authenticPlaceholderNotice}
                    </p>

                    <div className="mt-4 px-3 py-1.5 bg-[#0D1A16] border border-[#D1B995]/30 text-[11px] font-mono text-[#D1B995] rounded-sm">
                      {currentLang === 'ar' ? 'المسار المطلوب: ' : 'Target Path: '}
                      <strong>{activeSlot.defaultFilePath}</strong>
                    </div>
                  </div>
                )}

                {/* Left/Right Controls */}
                {activeLightboxIndex !== null && activeLightboxIndex > 0 && (
                  <button
                    onClick={handlePrev}
                    className="absolute left-3 p-2 rounded-full bg-[#152B24]/80 text-[#D1B995] hover:bg-[#152B24] border border-[#D1B995]/40 cursor-pointer"
                    aria-label={t.prevPhoto}
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                )}
                {activeLightboxIndex !== null && activeLightboxIndex < filteredSlots.length - 1 && (
                  <button
                    onClick={handleNext}
                    className="absolute right-3 p-2 rounded-full bg-[#152B24]/80 text-[#D1B995] hover:bg-[#152B24] border border-[#D1B995]/40 cursor-pointer"
                    aria-label={t.nextPhoto}
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                )}
              </div>

              {/* Caption Footer & WhatsApp Inquire Button */}
              <div className="p-5 bg-[#1F4A3B] border-t border-[#D1B995]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-base font-bold text-[#F7F5F0]">
                    {currentLang === 'ar' ? activeSlot.titleAr : activeSlot.titleEn}
                  </h4>
                  <p className="text-xs text-[#F7F5F0]/80 mt-1 max-w-2xl">
                    {currentLang === 'ar' ? activeSlot.descriptionAr : activeSlot.descriptionEn}
                  </p>
                  <p className="text-[10px] font-mono text-[#D1B995]/80 mt-1">
                    Slot Key: {activeSlot.slotKey} · File: {activeSlot.defaultFilePath}
                  </p>
                </div>
                <button
                  onClick={() => {
                    const catName = currentLang === 'ar' ? activeSlot.categoryLabelAr : activeSlot.categoryLabelEn;
                    const slotName = currentLang === 'ar' ? activeSlot.titleAr : activeSlot.titleEn;
                    setActiveLightboxIndex(null);
                    onOpenWhatsApp(`${catName} — ${slotName} (${activeSlot.slotKey})`);
                  }}
                  className="shrink-0 px-5 py-3 bg-[#D1B995] hover:bg-[#E5D1B0] text-[#1F4A3B] text-xs font-bold uppercase rounded-sm flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <MessageCircle className="w-4 h-4 fill-current/20" />
                  <span>{t.requestSlotQuote}</span>
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
};
