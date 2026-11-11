import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { INBOX_INVENTORY, InventoryItem } from '../config/inboxInventoryData';
import {
  Search,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  MessageCircle,
  Sparkles,
  Layers
} from 'lucide-react';

interface InboxGallerySectionProps {
  currentLang: Language;
  onOpenWhatsApp: (serviceName?: string) => void;
  onSelectImage?: (title: string, desc: string, imageUrl?: string) => void;
}

export const InboxGallerySection: React.FC<InboxGallerySectionProps> = ({
  currentLang,
  onOpenWhatsApp
}) => {
  const t = translations[currentLang];
  const isRtl = currentLang === 'ar';

  // State: Category filter & search query
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Pagination state: Show 6 premier photos initially, progressively expand on demand
  const [visibleCount, setVisibleCount] = useState<number>(6);

  // Lightbox index state (tracks index inside filteredPhotos)
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);

  // Helper to ensure safe single-encoded URL for any spaces or special characters
  const getSafeImageUrl = (url: string): string => {
    try {
      return encodeURI(decodeURI(url));
    } catch {
      return encodeURI(url);
    }
  };

  // Visitor-friendly category tabs definition
  const categoryTabs = useMemo(() => {
    return [
      { key: 'all', labelAr: 'كافة الأعمال المنفذة (61)', labelEn: 'All Executed Works (61)' },
      { key: 'flooring', labelAr: 'الأرضيات والبورسلين', labelEn: 'Flooring & Tiles' },
      { key: 'interior', labelAr: 'التشطيب والتصميم الداخلي', labelEn: 'Interior & Fit-Out' },
      { key: 'electrical', labelAr: 'الكهرباء والتأسيسات', labelEn: 'Electrical' },
      { key: 'plumbing', labelAr: 'السباكة والصرف', labelEn: 'Plumbing' },
      { key: 'commercial', labelAr: 'المشاريع التجارية', labelEn: 'Commercial' },
      { key: 'gypsum', labelAr: 'الجبس بورد والأسقف', labelEn: 'Ceilings & Gypsum' },
      { key: 'painting_plastering', labelAr: 'الدهانات والمحارة', labelEn: 'Paint & Plaster' }
    ];
  }, []);

  // Filtered photos based on category & search query (strictly excludes AI-generated mockups from public executed works)
  const filteredPhotos = useMemo(() => {
    const filtered = INBOX_INVENTORY.filter((item: InventoryItem) => {
      // Exclude AI-generated concept mockups from visitor-facing executed projects
      if (item.categoryKey === 'brand_concept' || item.fileName.startsWith('Gemini_') || item.photoTypeEn.includes('AI Concept')) {
        return false;
      }

      // Category match
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'painting_plastering') {
          if (item.categoryKey !== 'painting' && item.categoryKey !== 'plastering') {
            return false;
          }
        } else if (item.categoryKey !== selectedCategory) {
          return false;
        }
      }

      // Search query match (description, category, stage, filename)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchAr =
          item.descriptionAr.toLowerCase().includes(q) ||
          item.categoryAr.toLowerCase().includes(q) ||
          item.stageAr.toLowerCase().includes(q);
        const matchEn =
          item.descriptionEn.toLowerCase().includes(q) ||
          item.categoryEn.toLowerCase().includes(q) ||
          item.stageEn.toLowerCase().includes(q);
        const matchFile = item.fileName.toLowerCase().includes(q);
        return matchAr || matchEn || matchFile;
      }

      return true;
    });

    // When viewing all works without a search query, prioritize 6 diverse premier real executed highlights
    if (selectedCategory === 'all' && !searchQuery.trim()) {
      const premierOrder = [7, 12, 6, 18, 2, 50];
      return [...filtered].sort((a, b) => {
        const idxA = premierOrder.indexOf(a.id);
        const idxB = premierOrder.indexOf(b.id);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return a.id - b.id;
      });
    }

    return filtered;
  }, [selectedCategory, searchQuery]);

  // Current active photo in lightbox
  const currentPhoto = activePhotoIndex !== null && filteredPhotos[activePhotoIndex]
    ? filteredPhotos[activePhotoIndex]
    : null;

  // Next / Prev navigation
  const handlePrev = useCallback(() => {
    if (activePhotoIndex === null || filteredPhotos.length === 0) return;
    setActivePhotoIndex((prev) => {
      if (prev === null) return 0;
      return prev === 0 ? filteredPhotos.length - 1 : prev - 1;
    });
  }, [activePhotoIndex, filteredPhotos.length]);

  const handleNext = useCallback(() => {
    if (activePhotoIndex === null || filteredPhotos.length === 0) return;
    setActivePhotoIndex((prev) => {
      if (prev === null) return 0;
      return prev === filteredPhotos.length - 1 ? 0 : prev + 1;
    });
  }, [activePhotoIndex, filteredPhotos.length]);

  const handleCloseLightbox = useCallback(() => {
    setActivePhotoIndex(null);
  }, []);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (activePhotoIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseLightbox();
      } else if (e.key === 'ArrowRight') {
        if (isRtl) handlePrev();
        else handleNext();
      } else if (e.key === 'ArrowLeft') {
        if (isRtl) handleNext();
        else handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePhotoIndex, isRtl, handlePrev, handleNext, handleCloseLightbox]);

  // Sliced photos visible on page (initially 6, expandable)
  const visiblePhotos = filteredPhotos.slice(0, visibleCount);

  return (
    <section id="inbox-gallery" className="py-12 lg:py-16 bg-[#FAF8F5] text-[#242424] relative overflow-hidden border-b border-[#D1B995]/20">
      {/* Decorative architectural grid lines */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#1F4A3B_1px,transparent_1px)] [background-size:28px_28px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header — Compacted & Sleek */}
        <div className="max-w-3xl mb-8 sm:mb-10">
          <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-[#1F4A3B] mb-2">
            <span className="w-5 h-[1.5px] bg-[#D1B995]" />
            <span>{t.inboxKicker}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1F4A3B] mb-2">
            {t.inboxTitle}
          </h2>

          <p className="text-xs sm:text-sm text-[#5C5C5C] leading-relaxed">
            {t.inboxSubtitle}
          </p>
        </div>

        {/* Visitor Filter Bar: Category Tabs & Clean Search */}
        <div className="mb-6 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            
            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 sm:pb-0 scrollbar-thin">
              {categoryTabs.map((tab) => {
                const isActive = selectedCategory === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setSelectedCategory(tab.key);
                      setVisibleCount(6);
                      setActivePhotoIndex(null);
                    }}
                    className={`whitespace-nowrap px-3 py-1.5 text-xs font-semibold rounded-xs transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-[#1F4A3B] text-[#F7F5F0] shadow-sm border border-[#1F4A3B]'
                        : 'bg-white text-[#5C5C5C] hover:bg-[#F2ECE4] hover:text-[#1F4A3B] border border-[#D1B995]/30'
                    }`}
                  >
                    {isRtl ? tab.labelAr : tab.labelEn}
                  </button>
                );
              })}
            </div>

            {/* Quick Search */}
            <div className="relative w-full sm:w-64 shrink-0">
              <Search className="w-3.5 h-3.5 text-[#5C5C5C] absolute top-1/2 -translate-y-1/2 start-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setVisibleCount(6);
                  setActivePhotoIndex(null);
                }}
                placeholder={t.inboxSearchPlaceholder}
                className="w-full ps-8 pe-4 py-1.5 text-xs bg-white border border-[#D1B995]/40 rounded-xs focus:outline-none focus:border-[#1F4A3B] text-[#242424] placeholder:text-[#5C5C5C]/60 shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setVisibleCount(6);
                  }}
                  className="absolute top-1/2 -translate-y-1/2 end-2.5 text-[#5C5C5C] hover:text-black text-xs font-bold"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Showing count indicator */}
          <div className="flex items-center justify-between text-[11px] text-[#5C5C5C] pt-2 border-t border-[#D1B995]/20">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#D1B995]" />
              <span>
                {isRtl
                  ? `يتم عرض ${visiblePhotos.length} من أصل ${filteredPhotos.length} صورة أصلية`
                  : `Displaying ${visiblePhotos.length} of ${filteredPhotos.length} authentic photos`}
              </span>
            </div>
            {selectedCategory !== 'all' && (
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setVisibleCount(6);
                }}
                className="text-[11px] text-[#1F4A3B] hover:text-[#D1B995] font-semibold underline underline-offset-4 cursor-pointer"
              >
                {isRtl ? 'عرض كافة الصور (62)' : 'Show all photos (62)'}
              </button>
            )}
          </div>
        </div>

        {/* Responsive Photo Grid (1 col mobile, 2 col small, 3 col tablet, 3 col desktop for sleek cards) */}
        {filteredPhotos.length === 0 ? (
          <div className="py-12 text-center bg-white border border-dashed border-[#D1B995]/50 rounded-xs p-6">
            <Layers className="w-8 h-8 text-[#D1B995] mx-auto mb-2 opacity-60" />
            <h3 className="text-sm font-bold text-[#1F4A3B] mb-1">
              {isRtl ? 'لا توجد صور مطابقة لبحثك' : 'No photos matching your search'}
            </h3>
            <p className="text-xs text-[#5C5C5C] mb-3">
              {isRtl ? 'جرّب البحث بكلمات أخرى أو اختر فئة أعمال مختلفة' : 'Try searching with other keywords or select a different category'}
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
                setVisibleCount(6);
              }}
              className="px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider bg-[#1F4A3B] text-[#F7F5F0] hover:bg-[#152B24] rounded-xs cursor-pointer"
            >
              {isRtl ? 'إعادة ضبط المعرض' : 'Reset Gallery'}
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4">
              {visiblePhotos.map((item) => {
                const globalIndex = filteredPhotos.indexOf(item);
                const safeUrl = getSafeImageUrl(item.url);
                const cardTitle = isRtl ? item.categoryAr : item.categoryEn;
                const cardStage = isRtl ? item.stageAr : item.stageEn;
                const cardDesc = isRtl ? item.descriptionAr : item.descriptionEn;

                return (
                  <div
                    key={item.id}
                    onClick={() => setActivePhotoIndex(globalIndex)}
                    className="group relative bg-white border border-[#D1B995]/30 hover:border-[#D1B995] rounded-xs overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col cursor-pointer"
                  >
                    {/* Image Container with 4:3 Aspect Ratio */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#1F4A3B]/5">
                      <img
                        src={safeUrl}
                        alt={cardDesc || cardTitle}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40 group-hover:opacity-70 transition-opacity" />

                      {/* Category Tag (Top-Start) */}
                      <div className="absolute top-2.5 start-2.5">
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#1F4A3B]/90 text-[#D1B995] border border-[#D1B995]/30 rounded-xs backdrop-blur-xs shadow-2xs">
                          {cardTitle}
                        </span>
                      </div>

                      {/* Hover Zoom Icon & Action Prompt (Centered) */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-9 h-9 rounded-full bg-[#1F4A3B]/90 border border-[#D1B995] text-[#D1B995] flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                          <ZoomIn className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    {/* Card Footer with Details — Sleek & Compact */}
                    <div className="p-2.5 sm:p-3 bg-white border-t border-[#D1B995]/20 flex flex-col justify-between flex-1">
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-[#1F4A3B] line-clamp-1 group-hover:text-[#8C6D3F] transition-colors">
                          {cardStage}
                        </h4>
                        <p className="text-[11px] text-[#5C5C5C] line-clamp-2 mt-0.5 leading-relaxed">
                          {cardDesc}
                        </p>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-[#D1B995]/15 flex items-center justify-between text-[10px] text-[#5C5C5C]/80">
                        <span className="font-medium">
                          {isRtl ? 'اضغط للتكبير والتفاصيل' : 'Click to enlarge'}
                        </span>
                        <span className="font-mono text-[#D1B995] font-bold">
                          #{item.id}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Progressive Reveal Controller: "Show More" / "Show Less" */}
            {filteredPhotos.length > 6 && (
              <div className="mt-8 pt-4 border-t border-[#D1B995]/20 flex flex-col sm:flex-row items-center justify-center gap-3">
                {visibleCount < filteredPhotos.length ? (
                  <button
                    onClick={() => setVisibleCount((prev) => Math.min(prev + 12, filteredPhotos.length))}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#1F4A3B] hover:bg-[#152B24] text-[#D1B995] hover:text-[#F7F5F0] border border-[#D1B995]/50 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xs shadow-md transition-all cursor-pointer group"
                  >
                    <span>
                      {isRtl
                        ? `عرض المزيد (${visibleCount} من ${filteredPhotos.length})`
                        : `Show More (${visibleCount} of ${filteredPhotos.length})`}
                    </span>
                    <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setVisibleCount(6);
                      const el = document.getElementById('inbox-gallery');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-[#F2ECE4] text-[#1F4A3B] border border-[#D1B995]/40 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xs shadow-2xs transition-all cursor-pointer group"
                  >
                    <span>
                      {isRtl ? 'عرض أقل (أبرز 6 أعمال فقط)' : 'Show Less (Top 6 Works Only)'}
                    </span>
                    <ChevronUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                  </button>
                )}

                {visibleCount < filteredPhotos.length && (
                  <button
                    onClick={() => setVisibleCount(filteredPhotos.length)}
                    className="w-full sm:w-auto text-xs text-[#1F4A3B] hover:text-[#8C6D3F] font-semibold underline underline-offset-4 px-3 py-2 cursor-pointer transition-colors"
                  >
                    {isRtl ? `عرض كافة الصور (${filteredPhotos.length})` : `Show all ${filteredPhotos.length} photos`}
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {/* Global Bottom CTA for the Gallery */}
        <div className="mt-14 sm:mt-16 text-center bg-[#1F4A3B] text-[#F7F5F0] rounded-sm p-8 sm:p-10 border border-[#D1B995]/40 shadow-xl max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#152B24] border border-[#D1B995]/30 rounded-xs text-[#D1B995] text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isRtl ? 'تنفيذ متكامل بمعايير هندسية' : 'Turnkey Engineering Standards'}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold mb-2">
            {isRtl ? 'هل تريد تشطيب شقتك أو مقرك التجاري بهذه الدقة؟' : 'Ready to finish your space with this precision?'}
          </h3>
          <p className="text-xs sm:text-sm text-[#F7F5F0]/80 max-w-2xl mx-auto mb-6 leading-relaxed">
            {isRtl
              ? 'تواصل مباشرة مع المهندس محمد حسني لحجز موعد معاينة ميدانية ورفع المقاسات الإنشائية والبدء في مشروعك.'
              : 'Connect directly with Eng. Mohamed Hosny to book an on-site technical inspection and survey your space.'}
          </p>
          <button
            onClick={() => onOpenWhatsApp(isRtl ? 'استفسار عن معرض الأعمال' : 'Portfolio Inquiry')}
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-[#D1B995] hover:bg-[#E5D1B0] text-[#1F4A3B] text-xs sm:text-sm font-bold uppercase tracking-wider rounded-sm transition-colors cursor-pointer shadow-lg"
          >
            <MessageCircle className="w-4 h-4 fill-current/20" />
            <span>{t.bookSiteVisitBtn}</span>
          </button>
        </div>
      </div>

      {/* Lightbox Modal (High-Resolution Zoom with Next / Prev Navigation) */}
      {currentPhoto && activePhotoIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 animate-fadeIn"
          onClick={handleCloseLightbox}
        >
          {/* Top Bar: Counter, Title, and Close Button */}
          <div
            className="w-full flex items-center justify-between text-white pb-3 sm:pb-4 border-b border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 bg-[#1F4A3B] text-[#D1B995] border border-[#D1B995]/40 text-xs font-bold rounded-xs">
                {isRtl ? currentPhoto.categoryAr : currentPhoto.categoryEn}
              </span>
              <span className="text-xs sm:text-sm text-white/70 font-mono">
                {isRtl
                  ? `صورة ${activePhotoIndex + 1} من ${filteredPhotos.length}`
                  : `Photo ${activePhotoIndex + 1} of ${filteredPhotos.length}`}
              </span>
            </div>

            <button
              onClick={handleCloseLightbox}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-sm transition-colors cursor-pointer"
              aria-label="Close Lightbox"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Main Visual Display with Navigation Arrows */}
          <div
            className="flex-1 flex items-center justify-between gap-2 sm:gap-4 my-auto relative max-h-[75vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Previous Button */}
            <button
              onClick={isRtl ? handleNext : handlePrev}
              className="p-2 sm:p-3 text-white/80 hover:text-white bg-black/50 hover:bg-black/80 border border-white/20 rounded-full transition-all cursor-pointer shrink-0 z-10"
              aria-label="Previous Photo"
            >
              <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>

            {/* Central Photo View */}
            <div className="flex-1 flex items-center justify-center h-full max-h-[75vh] overflow-hidden">
              <img
                src={getSafeImageUrl(currentPhoto.url)}
                alt={isRtl ? currentPhoto.descriptionAr : currentPhoto.descriptionEn}
                className="max-h-[70vh] sm:max-h-[74vh] max-w-full object-contain rounded-xs shadow-2xl select-none"
              />
            </div>

            {/* Next Button */}
            <button
              onClick={isRtl ? handlePrev : handleNext}
              className="p-2 sm:p-3 text-white/80 hover:text-white bg-black/50 hover:bg-black/80 border border-white/20 rounded-full transition-all cursor-pointer shrink-0 z-10"
              aria-label="Next Photo"
            >
              <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>
          </div>

          {/* Bottom Bar: Photo Description & Direct WhatsApp CTA */}
          <div
            className="w-full bg-[#152B24] text-[#F7F5F0] border border-[#D1B995]/30 rounded-sm p-4 sm:p-5 mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="max-w-2xl">
              <h4 className="font-bold text-sm sm:text-base text-[#D1B995] mb-1">
                {isRtl ? currentPhoto.stageAr : currentPhoto.stageEn}
              </h4>
              <p className="text-xs sm:text-sm text-[#F7F5F0]/85 leading-relaxed">
                {isRtl ? currentPhoto.descriptionAr : currentPhoto.descriptionEn}
              </p>
            </div>

            <div className="shrink-0 w-full sm:w-auto">
              <button
                onClick={() => {
                  const serviceName = isRtl
                    ? `استفسار عن ${currentPhoto.categoryAr} (${currentPhoto.stageAr})`
                    : `Inquiry about ${currentPhoto.categoryEn}`;
                  onOpenWhatsApp(serviceName);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#D1B995] hover:bg-[#E5D1B0] text-[#1F4A3B] text-xs font-bold uppercase tracking-wider rounded-sm transition-colors cursor-pointer shadow-md"
              >
                <MessageCircle className="w-4 h-4 fill-current/20" />
                <span>{t.inboxWhatsAppCta}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
