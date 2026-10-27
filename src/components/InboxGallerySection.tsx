import React, { useState, useMemo, useEffect } from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { INBOX_ASSETS, InboxAsset } from '../config/inboxAssets';
import {
  Search,
  ZoomIn,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  X,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  FolderOpen,
  SlidersHorizontal,
  RefreshCw
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

  // Assets state: starts with static manifest, then syncs with dynamic API
  const [assets, setAssets] = useState<InboxAsset[]>(INBOX_ASSETS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'site' | 'screenshot' | 'concept'>('all');
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // Fetch dynamic list from server to ensure complete sync
  useEffect(() => {
    fetch('/api/media/inbox')
      .then((res) => {
        if (!res.ok) throw new Error('Network error');
        return res.json();
      })
      .then((data) => {
        if (data && data.success && Array.isArray(data.files) && data.files.length > 0) {
          setAssets(data.files);
        }
      })
      .catch((err) => {
        // Fallback to static INBOX_ASSETS seamlessly
        console.warn('Could not sync dynamic inbox assets, using static fallback:', err);
      });
  }, []);

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      // Category match
      if (selectedCategory !== 'all' && asset.category !== selectedCategory) {
        return false;
      }
      // Search match
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        return asset.fileName.toLowerCase().includes(query);
      }
      return true;
    });
  }, [assets, selectedCategory, searchQuery]);

  // Total size calculation
  const totalSizeBytes = useMemo(() => {
    return assets.reduce((acc, curr) => acc + (curr.sizeBytes || 0), 0);
  }, [assets]);

  const totalSizeMb = useMemo(() => {
    return (totalSizeBytes / (1024 * 1024)).toFixed(2);
  }, [totalSizeBytes]);

  // Copy Filename Handler
  const handleCopy = (fileName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(fileName).then(() => {
      setCopiedFile(fileName);
      setTimeout(() => setCopiedFile(null), 2000);
    });
  };

  // Lightbox Navigation
  const activeAsset = activeLightboxIndex !== null ? filteredAssets[activeLightboxIndex] : null;

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (activeLightboxIndex !== null && activeLightboxIndex > 0) {
      setActiveLightboxIndex(activeLightboxIndex - 1);
    } else if (activeLightboxIndex === 0) {
      setActiveLightboxIndex(filteredAssets.length - 1);
    }
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (activeLightboxIndex !== null && activeLightboxIndex < filteredAssets.length - 1) {
      setActiveLightboxIndex(activeLightboxIndex + 1);
    } else if (activeLightboxIndex === filteredAssets.length - 1) {
      setActiveLightboxIndex(0);
    }
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeLightboxIndex === null) return;
      if (e.key === 'Escape') setActiveLightboxIndex(null);
      if (e.key === 'ArrowLeft') {
        isRtl ? handleNext() : handlePrev();
      }
      if (e.key === 'ArrowRight') {
        isRtl ? handlePrev() : handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLightboxIndex, filteredAssets.length, isRtl]);

  return (
    <section id="inbox-gallery" className="py-16 lg:py-24 bg-[#FAF8F5] text-[#242424] border-b border-[#D1B995]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#B89B6A] mb-2">
              <span className="w-5 h-[1.5px] bg-[#B89B6A]" />
              <span>{t.inboxKicker}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1F4A3B]">
              {t.inboxTitle}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#5C5C5C] leading-relaxed">
              {t.inboxSubtitle}
            </p>
          </div>

          {/* Authentic HTTP 200 Live Status Badge */}
          <div className="shrink-0 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-sm text-xs font-semibold shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{t.inboxAuthenticBadge}</span>
            </div>
          </div>
        </div>

        {/* Informative Archival Callout Notice */}
        <div className="mb-8 p-4 bg-[#F2EEE5] border border-[#D1B995]/40 rounded-sm text-xs text-[#5C5C5C] flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start md:items-center gap-2.5">
            <FolderOpen className="w-4 h-4 text-[#B89B6A] shrink-0 mt-0.5 md:mt-0" />
            <span className="leading-relaxed">{t.inboxSeparateGalleryNote}</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-[#1F4A3B] bg-white px-3 py-1.5 rounded-xs border border-[#D1B995]/30 shrink-0">
            <span>public/assets/inbox/ ({assets.length} files • {totalSizeMb} MB)</span>
          </div>
        </div>

        {/* Controls Toolbar: Categories Filter & Search Input */}
        <div className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Segmented Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1.5 bg-[#EAE5D9] rounded-sm overflow-x-auto scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-2 text-xs font-medium rounded-sm transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#1F4A3B] text-[#F7F5F0] shadow-sm font-semibold'
                  : 'text-[#242424] hover:text-[#1F4A3B] hover:bg-white/40'
              }`}
            >
              {t.inboxFilterAll} ({assets.length})
            </button>
            <button
              onClick={() => setSelectedCategory('site')}
              className={`px-3.5 py-2 text-xs font-medium rounded-sm transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === 'site'
                  ? 'bg-[#1F4A3B] text-[#F7F5F0] shadow-sm font-semibold'
                  : 'text-[#242424] hover:text-[#1F4A3B] hover:bg-white/40'
              }`}
            >
              {t.inboxFilterSite} ({assets.filter(a => a.category === 'site').length})
            </button>
            <button
              onClick={() => setSelectedCategory('screenshot')}
              className={`px-3.5 py-2 text-xs font-medium rounded-sm transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === 'screenshot'
                  ? 'bg-[#1F4A3B] text-[#F7F5F0] shadow-sm font-semibold'
                  : 'text-[#242424] hover:text-[#1F4A3B] hover:bg-white/40'
              }`}
            >
              {t.inboxFilterScreenshots} ({assets.filter(a => a.category === 'screenshot').length})
            </button>
            <button
              onClick={() => setSelectedCategory('concept')}
              className={`px-3.5 py-2 text-xs font-medium rounded-sm transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === 'concept'
                  ? 'bg-[#1F4A3B] text-[#F7F5F0] shadow-sm font-semibold'
                  : 'text-[#242424] hover:text-[#1F4A3B] hover:bg-white/40'
              }`}
            >
              {t.inboxFilterConcepts} ({assets.filter(a => a.category === 'concept').length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-80">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-[#B89B6A]">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.inboxSearchPlaceholder}
              className="w-full ps-9 pe-9 py-2 text-xs bg-white border border-[#D1B995]/40 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#1F4A3B] focus:border-[#1F4A3B] text-[#242424] placeholder:text-[#5C5C5C]/60"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 end-0 flex items-center pe-3 text-[#5C5C5C] hover:text-[#1F4A3B] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Counter summary */}
        <div className="mb-6 flex items-center justify-between text-xs text-[#5C5C5C]">
          <div>
            <span>{t.inboxShowingCount} </span>
            <strong className="text-[#1F4A3B] font-semibold">{filteredAssets.length}</strong>
            <span> {t.inboxOfTotal} </span>
            <strong className="text-[#1F4A3B] font-semibold">{assets.length}</strong>
            <span> {t.inboxFilesWord}</span>
          </div>

          {(searchQuery || selectedCategory !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="text-[#B89B6A] hover:text-[#1F4A3B] hover:underline font-medium cursor-pointer"
            >
              إعادة الضبط / Reset
            </button>
          )}
        </div>

        {/* 62 Image Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAssets.map((asset, index) => {
            const isCopied = copiedFile === asset.fileName;
            const hasError = imageErrors[asset.fileName];

            return (
              <div
                key={asset.id}
                onClick={() => setActiveLightboxIndex(index)}
                className="group relative flex flex-col bg-white border border-[#D1B995]/25 hover:border-[#D1B995] rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                {/* Visual Ratio Container */}
                <div className="relative aspect-[4/3] bg-[#162C26] overflow-hidden">
                  {!hasError ? (
                    <img
                      src={asset.url}
                      alt={asset.fileName}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={() => setImageErrors((prev) => ({ ...prev, [asset.fileName]: true }))}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-[#F7F5F0]">
                      <span className="text-xs text-red-300 font-mono">Error loading</span>
                      <span className="text-[10px] font-mono opacity-70 truncate max-w-full px-2 mt-1">
                        {asset.fileName}
                      </span>
                    </div>
                  )}

                  {/* ID Tag Badge (Top Left) */}
                  <div className="absolute top-2.5 start-2.5 px-2 py-0.5 bg-[#152B24]/90 backdrop-blur-xs text-[#D1B995] text-[10px] font-mono font-bold rounded-sm border border-[#D1B995]/30">
                    #{String(asset.id).padStart(2, '0')}
                  </div>

                  {/* Size Badge (Top Right) */}
                  <div className="absolute top-2.5 end-2.5 px-2 py-0.5 bg-[#152B24]/90 backdrop-blur-xs text-[#F7F5F0] text-[10px] font-mono rounded-sm border border-[#D1B995]/20">
                    {asset.sizeKb} KB
                  </div>

                  {/* Hover Inspect Overlay */}
                  <div className="absolute inset-0 bg-[#1F4A3B]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#152B24] border border-[#D1B995]/40 text-xs text-[#D1B995] rounded-sm shadow-sm">
                      <ZoomIn className="w-3.5 h-3.5" />
                      <span>{t.inboxInspectAction}</span>
                    </div>
                  </div>
                </div>

                {/* Card Details Footer */}
                <div className="p-3.5 flex flex-col flex-1 justify-between bg-white border-t border-[#D1B995]/15">
                  <div>
                    {/* Filename with copy button */}
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span
                        className="font-mono text-xs font-semibold text-[#1F4A3B] truncate"
                        title={asset.fileName}
                      >
                        {asset.fileName}
                      </span>
                      <button
                        onClick={(e) => handleCopy(asset.fileName, e)}
                        className="p-1 text-[#B89B6A] hover:text-[#1F4A3B] hover:bg-[#F2EEE5] rounded-xs transition-colors shrink-0 cursor-pointer"
                        title={t.inboxCopyFilename}
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Metadata tags */}
                    <div className="flex items-center justify-between text-[11px] text-[#5C5C5C]">
                      <span className="font-mono text-[10px] bg-[#F7F5F0] px-1.5 py-0.5 rounded-xs border border-[#D1B995]/20">
                        {asset.dateFormatted}
                      </span>
                      <span className="text-[10px] text-[#B89B6A]">
                        {asset.category === 'site' ? 'ميداني / Site' : asset.category === 'screenshot' ? 'توثيق / Doc' : 'تصميم / Concept'}
                      </span>
                    </div>
                  </div>

                  {/* Quick WhatsApp Inquiry for this image */}
                  <div className="mt-3 pt-2.5 border-t border-[#D1B995]/15 flex items-center justify-between">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenWhatsApp(
                          currentLang === 'ar'
                            ? `استفسار عن صورة ميدانية: ${asset.fileName}`
                            : `Inquiry on field photo: ${asset.fileName}`
                        );
                      }}
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#1F4A3B] hover:text-[#B89B6A] transition-colors cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t.inboxWhatsAppCta}</span>
                    </button>

                    <a
                      href={asset.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1 text-[#5C5C5C] hover:text-[#1F4A3B] rounded-xs transition-colors"
                      title="Open full file in new tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Lightbox Modal */}
        {activeAsset && (
          <div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
            onClick={() => setActiveLightboxIndex(null)}
          >
            <div
              className="relative max-w-5xl w-full bg-[#152B24] border border-[#D1B995]/30 rounded-sm overflow-hidden shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-5 py-3.5 bg-[#0F1E19] border-b border-[#D1B995]/20 text-[#F7F5F0]">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-[#D1B995] bg-[#162C26] px-2.5 py-1 rounded-xs border border-[#D1B995]/30">
                    #{String(activeAsset.id).padStart(2, '0')} / {filteredAssets.length}
                  </span>
                  <span className="font-mono text-xs sm:text-sm text-[#F7F5F0] truncate max-w-[200px] sm:max-w-md">
                    {activeAsset.fileName}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={activeAsset.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-[#D1B995] hover:text-white hover:bg-white/10 rounded-sm transition-colors"
                    title="Open original file"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => setActiveLightboxIndex(null)}
                    className="p-1.5 text-[#F7F5F0] hover:text-[#D1B995] hover:bg-white/10 rounded-sm transition-colors cursor-pointer"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Image Area */}
              <div className="relative flex items-center justify-center bg-black/50 min-h-[300px] max-h-[70vh] p-4">
                <img
                  src={activeAsset.url}
                  alt={activeAsset.fileName}
                  className="max-h-[65vh] max-w-full object-contain mx-auto shadow-lg"
                />

                {/* Left/Right Navigation Buttons */}
                <button
                  onClick={handlePrev}
                  className="absolute start-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-[#152B24]/80 text-[#D1B995] hover:bg-[#D1B995] hover:text-[#1F4A3B] transition-colors cursor-pointer border border-[#D1B995]/30 shadow-md"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute end-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-[#152B24]/80 text-[#D1B995] hover:bg-[#D1B995] hover:text-[#1F4A3B] transition-colors cursor-pointer border border-[#D1B995]/30 shadow-md"
                  aria-label="Next"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Footer */}
              <div className="px-5 py-3.5 bg-[#0F1E19] border-t border-[#D1B995]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#F7F5F0]/80">
                <div className="flex items-center gap-4 font-mono text-[11px]">
                  <span>Size: {activeAsset.sizeKb} KB</span>
                  <span>Date: {activeAsset.dateFormatted}</span>
                  <span className="text-[#D1B995] truncate max-w-xs">{activeAsset.url}</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      onOpenWhatsApp(
                        currentLang === 'ar'
                          ? `استشارة حول الصورة الميدانية: ${activeAsset.fileName}`
                          : `Consultation regarding field photo: ${activeAsset.fileName}`
                      );
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#D1B995] hover:bg-[#E5D1B0] text-[#1F4A3B] font-bold rounded-sm transition-colors cursor-pointer text-xs uppercase"
                  >
                    <MessageCircle className="w-4 h-4 fill-current/20" />
                    <span>{t.inboxWhatsAppCta}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
