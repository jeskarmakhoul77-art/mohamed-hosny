import React, { useState, useMemo, useEffect } from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { INBOX_INVENTORY, InventoryItem, getInventoryStats } from '../config/inboxInventoryData';
import {
  PROPOSED_PORTFOLIO_MATCHES,
  ProposedSlotMatch,
  getProposedMatchingStats
} from '../config/proposedMatchingData';
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
  LayoutGrid,
  Table as TableIcon,
  AlertTriangle,
  FileCheck,
  Layers,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  Filter,
  ArrowRightLeft,
  ImageOff,
  ClipboardCheck,
  BadgeAlert,
  Info
} from 'lucide-react';

interface InboxGallerySectionProps {
  currentLang: Language;
  onOpenWhatsApp: (serviceName?: string) => void;
  onSelectImage?: (title: string, desc: string, imageUrl?: string) => void;
}

export const InboxGallerySection: React.FC<InboxGallerySectionProps> = ({
  currentLang,
  onOpenWhatsApp,
  onSelectImage
}) => {
  const t = translations[currentLang];
  const isRtl = currentLang === 'ar';

  // Overall Inventory Stats (Stage 1)
  const inventoryStats = useMemo(() => getInventoryStats(), []);

  // Proposed Matching Stats (Stage 2)
  const matchingStats = useMemo(() => getProposedMatchingStats(), []);

  // View mode:
  // - 'grid': Original 62-photo visual card grid (Stage 1 — Primary visual display)
  // - 'matching': Proposed 40-slot matching table (Stage 2)
  // - 'table': Original 62-photo engineering inventory table (Stage 1)
  const [viewMode, setViewMode] = useState<'grid' | 'matching' | 'table'>('grid');

  // Helper to ensure safe, single-encoded URI for images with spaces or special characters
  const getSafeImageUrl = (url: string | null | undefined): string => {
    if (!url) return '';
    try {
      const decoded = decodeURI(url);
      return encodeURI(decoded);
    } catch {
      return encodeURI(url);
    }
  };

  // Stage 1 Filters (Inventory)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string>('all');
  const [onlyNeedsReview, setOnlyNeedsReview] = useState(false);
  const [onlyDuplicates, setOnlyDuplicates] = useState(false);

  // Stage 2 Filters (Proposed Matching)
  const [matchingSearchQuery, setMatchingSearchQuery] = useState('');
  const [matchingCategoryFilter, setMatchingCategoryFilter] = useState<string>('all');
  const [matchingStatusFilter, setMatchingStatusFilter] = useState<'all' | 'candidate' | 'needs_review' | 'no_suitable_image'>('all');

  // Interaction states
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [activeLightboxItem, setActiveLightboxItem] = useState<{
    url: string;
    title: string;
    fileName: string;
    subtitle?: string;
    category?: string;
    stage?: string;
    description?: string;
    notes?: string;
    badgeText?: string;
    badgeColor?: string;
  } | null>(null);

  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // Filtered Inventory Items (Stage 1)
  const filteredInventoryItems = useMemo(() => {
    return INBOX_INVENTORY.filter((item) => {
      if (onlyNeedsReview && !item.needsReview) return false;
      if (onlyDuplicates && !item.isDuplicateOrSimilar) return false;
      if (selectedCategoryKey !== 'all' && item.categoryKey !== selectedCategoryKey) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchName = item.fileName.toLowerCase().includes(query);
        const matchDescAr = item.descriptionAr.toLowerCase().includes(query);
        const matchDescEn = item.descriptionEn.toLowerCase().includes(query);
        const matchStageAr = item.stageAr.toLowerCase().includes(query);
        const matchCatAr = item.categoryAr.toLowerCase().includes(query);
        return matchName || matchDescAr || matchDescEn || matchStageAr || matchCatAr;
      }
      return true;
    });
  }, [selectedCategoryKey, searchQuery, onlyNeedsReview, onlyDuplicates]);

  // Filtered Proposed Matching Slots (Stage 2)
  const filteredMatchingSlots = useMemo(() => {
    return PROPOSED_PORTFOLIO_MATCHES.filter((slot) => {
      // Category filter
      if (matchingCategoryFilter !== 'all' && slot.categoryKey !== matchingCategoryFilter) {
        return false;
      }
      // Status filter
      if (matchingStatusFilter !== 'all' && slot.reviewStatus !== matchingStatusFilter) {
        return false;
      }
      // Search match (slotKey, titles, candidate filename, descriptions)
      if (matchingSearchQuery.trim()) {
        const query = matchingSearchQuery.trim().toLowerCase();
        const matchKey = slot.slotKey.toLowerCase().includes(query);
        const matchTitleAr = slot.slotTitleAr.toLowerCase().includes(query);
        const matchTitleEn = slot.slotTitleEn.toLowerCase().includes(query);
        const matchCatAr = slot.categoryLabelAr.toLowerCase().includes(query);
        const matchFile = slot.candidateFileName ? slot.candidateFileName.toLowerCase().includes(query) : false;
        const matchRationale = slot.rationaleAr.toLowerCase().includes(query);
        return matchKey || matchTitleAr || matchTitleEn || matchCatAr || matchFile || matchRationale;
      }
      return true;
    });
  }, [matchingCategoryFilter, matchingStatusFilter, matchingSearchQuery]);

  // Copy Handler
  const handleCopy = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000);
    });
  };

  // Reset all filters for matching
  const handleResetMatchingFilters = () => {
    setMatchingSearchQuery('');
    setMatchingCategoryFilter('all');
    setMatchingStatusFilter('all');
  };

  // Reset all filters for inventory
  const handleResetInventoryFilters = () => {
    setSearchQuery('');
    setSelectedCategoryKey('all');
    setOnlyNeedsReview(false);
    setOnlyDuplicates(false);
  };

  // Category Color Map for Badges
  const getCategoryColor = (key: string) => {
    switch (key) {
      case 'flooring':
      case 'ceramics':
        return 'bg-amber-50 text-amber-900 border-amber-300';
      case 'interior':
        return 'bg-purple-50 text-purple-900 border-purple-300';
      case 'electrical':
        return 'bg-emerald-50 text-emerald-900 border-emerald-300';
      case 'plumbing':
        return 'bg-blue-50 text-blue-900 border-blue-300';
      case 'commercial':
        return 'bg-indigo-50 text-indigo-900 border-indigo-300';
      case 'gypsum':
        return 'bg-teal-50 text-teal-900 border-teal-300';
      case 'painting':
        return 'bg-pink-50 text-pink-900 border-pink-300';
      case 'plastering':
        return 'bg-stone-100 text-stone-900 border-stone-300';
      case 'brand_concept':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-zinc-100 text-zinc-800 border-zinc-300';
    }
  };

  return (
    <section id="inbox-gallery" className="py-16 lg:py-24 bg-[#FAF8F5] text-[#242424] border-b border-[#D1B995]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#B89B6A] mb-2">
              <span className="w-5 h-[1.5px] bg-[#B89B6A]" />
              <span>
                {viewMode === 'matching'
                  ? (isRtl ? 'المرحلة 2: جدول المطابقة المقترح لخانات المعرض الأربعين' : 'Stage 2: Proposed 40-Slot Matching Matrix')
                  : (isRtl ? 'المرحلة 1: الجرد والفرز الهندسي الميداني' : 'Stage 1: Field Audit & Engineering Inventory')}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1F4A3B]">
              {viewMode === 'matching'
                ? (isRtl ? 'جدول مطابقة الصور المقترحة لخانات المعرض الأربعين (للمراجعة والاعتماد)' : 'Proposed Photo Matching Matrix for the 40 Portfolio Slots (Audit & Review)')
                : (isRtl ? 'جرد وتصنيف الصور الميدانية الأصلية (62 صورة)' : 'Original Field Photos Audit & Inventory (62 Assets)')}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#5C5C5C] leading-relaxed">
              {viewMode === 'matching'
                ? (isRtl
                    ? 'جدول تدقيق هندسي يربط بين الصور الـ62 المفحوصة وخانات معرض الأعمال الأربعين عبر التخصصات الثمانية. تم استبعاد لقطات السوشيال ميديا، وتحديد درجة الثقة، مع ترك الخانات غير المتطابقة شاغرة لتصوير مواقع لاحقاً.'
                    : 'Systematic technical matching matrix proposing verified candidates for the 40 client portfolio slots. Excludes promotional screenshots, rates confidence, and explicitly flags missing slots for future site shoots.')
                : (isRtl
                    ? 'جرد منظم وشامل لكافة الصور الـ62 الواردة من المواقع المحفوظة في public/assets/inbox/، تم فحص محتواها الفعلي وتصنيفها هندسياً دون تعديل أو حذف أو نقل أي ملف، ودون ربط عشوائي بخانات المشاريع الأربعين.'
                    : 'Systematic visual inspection and engineering classification of all 62 raw site assets stored in public/assets/inbox/, without renaming, deleting, or arbitrarily distributing photos into the 40 primary project slots.')}
            </p>
          </div>

          {/* Verification Badges */}
          <div className="shrink-0 flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-sm text-xs font-semibold shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{isRtl ? '31 خانة جاهزة للاعتماد' : '31 Slots Ready for Review'}</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#F2EEE5] text-[#1F4A3B] border border-[#D1B995]/50 rounded-sm text-xs font-semibold shadow-xs">
              <Layers className="w-4 h-4 text-[#B89B6A]" />
              <span>{isRtl ? '8 تخصصات تنفيذية' : '8 Engineering Disciplines'}</span>
            </div>
          </div>
        </div>

        {/* Global Architectural Safety Callout Banner */}
        <div className="mb-8 p-4 bg-[#F2EEE5] border border-[#D1B995]/40 rounded-sm text-xs text-[#5C5C5C] flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start md:items-center gap-2.5">
            <ClipboardCheck className="w-4 h-4 text-[#B89B6A] shrink-0 mt-0.5 md:mt-0" />
            <span className="leading-relaxed">
              {isRtl
                ? 'ضمان سلامة المشروع: جدول المطابقة أدناه هو أداة استشارية للمراجعة والاعتماد فقط. لم يتم تعديل PORTFOLIO_SLOTS_MANIFEST ولم يتم ربط أي صورة فعلياً بخانات المعرض الأربعين، كما بقيت جميع ملفات inbox الـ62 سالمة دون أي نقل أو حذف.'
                : 'Project Safety Guarantee: The matching matrix below is an audit preview for review and sign-off only. PORTFOLIO_SLOTS_MANIFEST remains 100% untouched and unlinked, with all 62 inbox assets intact.'}
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-[#1F4A3B] bg-white px-3 py-1.5 rounded-xs border border-[#D1B995]/30 shrink-0">
            <span>40 Portfolio Slots • 62 Inbox Assets</span>
          </div>
        </div>

        {/* Triple Mode View Switcher */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D1B995]/20 pb-4">
          <div className="flex flex-wrap items-center p-1 bg-[#EAE5D9] rounded-sm gap-1">
            <button
              onClick={() => setViewMode('matching')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-xs transition-all cursor-pointer ${
                viewMode === 'matching'
                  ? 'bg-[#1F4A3B] text-[#F7F5F0] shadow-xs font-semibold ring-1 ring-[#D1B995]'
                  : 'text-[#242424] hover:text-[#1F4A3B] hover:bg-white/40'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-[#D1B995]" />
              <span>{isRtl ? 'جدول المطابقة المقترح (40 خانة)' : 'Proposed Matching Matrix (40 Slots)'}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-xs font-mono ${viewMode === 'matching' ? 'bg-white/20 text-white' : 'bg-[#D1B995]/30 text-[#1F4A3B]'}`}>
                {matchingStats.matchedCount}/40
              </span>
            </button>

            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-xs transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-[#1F4A3B] text-[#F7F5F0] shadow-xs font-semibold'
                  : 'text-[#242424] hover:text-[#1F4A3B] hover:bg-white/40'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>{isRtl ? 'جدول جرد الصور الميدانية (62)' : 'Field Inventory Table (62)'}</span>
            </button>

            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-xs transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#1F4A3B] text-[#F7F5F0] shadow-xs font-semibold'
                  : 'text-[#242424] hover:text-[#1F4A3B] hover:bg-white/40'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>{isRtl ? 'معاينة البطاقات المرئية (62)' : 'Visual Grid (62)'}</span>
            </button>
          </div>

          <div className="text-xs text-[#5C5C5C] font-mono flex items-center gap-2">
            <span>{isRtl ? 'الحالة الحالية:' : 'Active Phase:'}</span>
            <span className="font-bold text-[#1F4A3B] bg-white px-2.5 py-1 rounded-xs border border-[#D1B995]/30">
              {viewMode === 'matching'
                ? (isRtl ? 'المرحلة 2: دراسة المطابقة والاعتماد' : 'Stage 2: Candidate Matching')
                : (isRtl ? 'المرحلة 1: تدقيق وفحص الوارد' : 'Stage 1: Raw Inbox Audit')}
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: PROPOSED MATCHING TABLE FOR 40 SLOTS (STAGE 2 — PRIMARY REQUEST)   */}
        {/* ========================================================================= */}
        {viewMode === 'matching' && (
          <div className="space-y-6">

            {/* Stage 2 Executive Summary Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 bg-white border border-[#D1B995]/30 rounded-sm shadow-xs flex flex-col">
                <span className="text-[11px] font-semibold text-[#5C5C5C] uppercase tracking-wider">
                  {isRtl ? 'إجمالي خانات المعرض' : 'Total Portfolio Slots'}
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold font-mono text-[#1F4A3B]">{matchingStats.totalSlots}</span>
                  <span className="text-xs text-[#B89B6A]">{isRtl ? 'خانة موزعة على 8 تخصصات' : 'across 8 categories'}</span>
                </div>
                <span className="mt-1 text-[11px] text-[#5C5C5C]">
                  {isRtl ? '5 خانات متخصصة لكل تخصص هندسي' : '5 slots per engineering discipline'}
                </span>
              </div>

              <div
                onClick={() => {
                  setMatchingStatusFilter(matchingStatusFilter === 'candidate' ? 'all' : 'candidate');
                }}
                className={`p-4 border rounded-sm shadow-xs flex flex-col cursor-pointer transition-all ${
                  matchingStatusFilter === 'candidate'
                    ? 'bg-emerald-100/70 border-emerald-500 ring-2 ring-emerald-400'
                    : 'bg-white border-emerald-200 hover:border-emerald-400'
                }`}
              >
                <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {isRtl ? 'مرشحة للاعتماد (صور ملائمة)' : 'Candidate Matches'}
                  </span>
                  <span className="text-[10px] underline">{matchingStatusFilter === 'candidate' ? (isRtl ? 'إلغاء' : 'Clear') : (isRtl ? 'فلترة' : 'Filter')}</span>
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold font-mono text-emerald-700">{matchingStats.matchedCount}</span>
                  <span className="text-xs font-mono text-emerald-600">/ 40 ({Math.round((matchingStats.matchedCount / 40) * 100)}%)</span>
                </div>
                <span className="mt-1 text-[11px] text-emerald-700">
                  {isRtl ? `${matchingStats.highConfidenceCount} مرتفعة الثقة • ${matchingStats.mediumConfidenceCount} متوسطة الثقة` : `${matchingStats.highConfidenceCount} High • ${matchingStats.mediumConfidenceCount} Medium`}
                </span>
              </div>

              <div
                onClick={() => {
                  setMatchingStatusFilter(matchingStatusFilter === 'no_suitable_image' ? 'all' : 'no_suitable_image');
                }}
                className={`p-4 border rounded-sm shadow-xs flex flex-col cursor-pointer transition-all ${
                  matchingStatusFilter === 'no_suitable_image'
                    ? 'bg-rose-100/70 border-rose-500 ring-2 ring-rose-400'
                    : 'bg-white border-rose-200 hover:border-rose-400'
                }`}
              >
                <span className="text-[11px] font-semibold text-rose-800 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageOff className="w-3.5 h-3.5 text-rose-600" />
                    {isRtl ? 'خانات تحتاج تصوير موقع' : 'Needs Site Photo'}
                  </span>
                  <span className="text-[10px] underline">{matchingStatusFilter === 'no_suitable_image' ? (isRtl ? 'إلغاء' : 'Clear') : (isRtl ? 'فلترة' : 'Filter')}</span>
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold font-mono text-rose-800">{matchingStats.unmatchedCount}</span>
                  <span className="text-xs text-rose-700">{isRtl ? 'خانات شاغرة (دون حشو)' : 'vacant (zero filler)'}</span>
                </div>
                <span className="mt-1 text-[11px] text-rose-700">
                  {isRtl ? 'محارة (4)، دهانات (3)، سباكة (1)، جبس (1)' : 'Plaster (4), Paint (3), Plumb (1), Gypsum (1)'}
                </span>
              </div>

              <div
                onClick={() => {
                  setMatchingStatusFilter(matchingStatusFilter === 'needs_review' ? 'all' : 'needs_review');
                }}
                className={`p-4 border rounded-sm shadow-xs flex flex-col cursor-pointer transition-all ${
                  matchingStatusFilter === 'needs_review'
                    ? 'bg-amber-100/70 border-amber-500 ring-2 ring-amber-400'
                    : 'bg-white border-amber-200 hover:border-amber-400'
                }`}
              >
                <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    {isRtl ? 'تحتاج مراجعة بشرية' : 'Needs Human Review'}
                  </span>
                  <span className="text-[10px] underline">{matchingStatusFilter === 'needs_review' ? (isRtl ? 'إلغاء' : 'Clear') : (isRtl ? 'فلترة' : 'Filter')}</span>
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold font-mono text-amber-800">{matchingStats.needsReviewCount}</span>
                  <span className="text-xs text-amber-700">{isRtl ? 'حالات فنية مشتركة' : 'technical notes'}</span>
                </div>
                <span className="mt-1 text-[11px] text-amber-700">
                  {isRtl ? 'تشمل واجهة مشتركة ومطابقة نمط باركيه' : 'Shared facade & plank layout'}
                </span>
              </div>
            </div>

            {/* Discipline Fulfillment Matrix (Progress per Specialty) */}
            <div className="p-4 bg-white border border-[#D1B995]/30 rounded-sm shadow-xs">
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="font-bold text-[#1F4A3B] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#B89B6A]" />
                  <span>{isRtl ? 'توزيع الترشيحات حسب التخصصات الهندسية الثمانية:' : 'Candidate Distribution by Discipline:'}</span>
                </span>
                <span className="text-[#5C5C5C]">
                  {isRtl ? 'إجمالي متوفر: 31 من 40 خانة' : 'Total matched: 31 of 40 slots'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                {matchingStats.categoryBreakdown.map((cat) => {
                  const percent = Math.round((cat.matched / cat.total) * 100);
                  const isComplete = cat.matched === cat.total;
                  return (
                    <button
                      key={cat.key}
                      onClick={() => setMatchingCategoryFilter(matchingCategoryFilter === cat.key ? 'all' : cat.key)}
                      className={`p-2 rounded-xs border text-start transition-all cursor-pointer ${
                        matchingCategoryFilter === cat.key
                          ? 'border-[#1F4A3B] bg-[#1F4A3B] text-white shadow-xs'
                          : isComplete
                            ? 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-[#1F4A3B]'
                            : 'border-[#D1B995]/30 bg-[#FAF8F5] hover:bg-[#F2EEE5] text-[#242424]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-semibold mb-1">
                        <span className="truncate">{isRtl ? cat.labelAr : cat.labelEn}</span>
                        <span className={`text-[10px] font-mono font-bold ${matchingCategoryFilter === cat.key ? 'text-[#D1B995]' : isComplete ? 'text-emerald-700' : 'text-[#B89B6A]'}`}>
                          {cat.matched}/{cat.total}
                        </span>
                      </div>
                      <div className="w-full bg-black/10 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            matchingCategoryFilter === cat.key
                              ? 'bg-[#D1B995]'
                              : isComplete
                                ? 'bg-emerald-600'
                                : cat.matched >= 3
                                  ? 'bg-[#B89B6A]'
                                  : 'bg-amber-500'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter and Search Controls for Matching */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setMatchingCategoryFilter('all')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-xs transition-all whitespace-nowrap cursor-pointer ${
                    matchingCategoryFilter === 'all'
                      ? 'bg-[#1F4A3B] text-[#F7F5F0] shadow-xs font-semibold'
                      : 'bg-white border border-[#D1B995]/30 text-[#242424] hover:bg-[#F2EEE5]'
                  }`}
                >
                  {isRtl ? 'كافة التخصصات (40)' : 'All Disciplines (40)'}
                </button>

                {matchingStats.categoryBreakdown.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => setMatchingCategoryFilter(cat.key)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-xs transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                      matchingCategoryFilter === cat.key
                        ? 'bg-[#1F4A3B] text-[#F7F5F0] shadow-xs font-semibold'
                        : 'bg-white border border-[#D1B995]/30 text-[#242424] hover:bg-[#F2EEE5]'
                    }`}
                  >
                    <span>{isRtl ? cat.labelAr : cat.labelEn}</span>
                    <span className="text-[10px] px-1 bg-black/5 rounded-xs font-mono">
                      {cat.matched}/{cat.total}
                    </span>
                  </button>
                ))}
              </div>

              {/* Matching Search Box */}
              <div className="relative w-full md:w-80">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-[#B89B6A]">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={matchingSearchQuery}
                  onChange={(e) => setMatchingSearchQuery(e.target.value)}
                  placeholder={isRtl ? 'ابحث برقم الخانة (plumbing-01) أو العنوان...' : 'Search by slotKey (plumbing-01), title, or file...'}
                  className="w-full ps-9 pe-9 py-2 text-xs bg-white border border-[#D1B995]/40 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#1F4A3B] focus:border-[#1F4A3B] text-[#242424] placeholder:text-[#5C5C5C]/60"
                />
                {matchingSearchQuery && (
                  <button
                    onClick={() => setMatchingSearchQuery('')}
                    className="absolute inset-y-0 end-0 flex items-center pe-3 text-[#5C5C5C] hover:text-[#1F4A3B] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Status Reset & Counters */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#5C5C5C]">
              <div className="flex items-center gap-2">
                <span>{isRtl ? 'الخانات المعروضة حالياً:' : 'Showing slots:'}</span>
                <strong className="text-[#1F4A3B] font-semibold">{filteredMatchingSlots.length}</strong>
                <span>{isRtl ? 'من إجمالي' : 'of'}</span>
                <strong className="text-[#1F4A3B] font-semibold">40</strong>
                <span>{isRtl ? 'خانة معتمدة' : 'designated slots'}</span>

                {matchingStatusFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-800 rounded-xs text-[11px] font-semibold">
                    <Filter className="w-3 h-3 text-amber-600" />
                    <span>
                      {matchingStatusFilter === 'candidate' && (isRtl ? 'مرشحة للاعتماد فقط' : 'Candidates only')}
                      {matchingStatusFilter === 'no_suitable_image' && (isRtl ? 'تحتاج تصوير موقع فقط' : 'Missing photo only')}
                      {matchingStatusFilter === 'needs_review' && (isRtl ? 'تحتاج مراجعة فنية فقط' : 'Needs review only')}
                    </span>
                  </span>
                )}
              </div>

              {(matchingSearchQuery || matchingCategoryFilter !== 'all' || matchingStatusFilter !== 'all') && (
                <button
                  onClick={handleResetMatchingFilters}
                  className="text-[#B89B6A] hover:text-[#1F4A3B] hover:underline font-medium cursor-pointer"
                >
                  {isRtl ? 'إعادة ضبط فلاتر المطابقة' : 'Reset matching filters'}
                </button>
              )}
            </div>

            {/* ========================================================================= */}
            {/* THE PROPOSED MATCHING MATRIX TABLE                                        */}
            {/* ========================================================================= */}
            <div className="bg-white border border-[#D1B995]/30 rounded-sm shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-start text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#152B24] text-[#F7F5F0] border-b border-[#D1B995]/30">
                      <th className="py-3.5 px-3 text-center font-mono font-bold w-14">#</th>
                      <th className="py-3.5 px-3 text-start min-w-[150px]">{isRtl ? 'رقم الخانة ومفتاحها' : 'Slot Key & Discipline'}</th>
                      <th className="py-3.5 px-4 text-start min-w-[210px]">{isRtl ? 'عنوان الخانة والمواصفة الهندسية' : 'Slot Title & Engineering Spec'}</th>
                      <th className="py-3.5 px-3 text-center w-20">{isRtl ? 'المعاينة' : 'Thumbnail'}</th>
                      <th className="py-3.5 px-4 text-start min-w-[200px]">{isRtl ? 'اسم ملف الصورة المرشحة' : 'Candidate Filename'}</th>
                      <th className="py-3.5 px-4 text-start min-w-[230px]">{isRtl ? 'سبب الاختيار والمطابقة البصرية' : 'Selection Rationale & Content'}</th>
                      <th className="py-3.5 px-3 text-center min-w-[110px]">{isRtl ? 'درجة الثقة' : 'Confidence'}</th>
                      <th className="py-3.5 px-3 text-center min-w-[140px]">{isRtl ? 'حالة المراجعة' : 'Review Status'}</th>
                      <th className="py-3.5 px-3 text-center w-24">{isRtl ? 'إجراءات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D1B995]/20">
                    {filteredMatchingSlots.map((match) => {
                      const isCopiedName = copiedText === match.candidateFileName;
                      const hasImage = !!match.candidateUrl;

                      return (
                        <tr
                          key={match.slotId}
                          className={`hover:bg-[#FAF8F5] transition-colors ${
                            match.reviewStatus === 'no_suitable_image'
                              ? 'bg-rose-50/20'
                              : match.reviewStatus === 'needs_review'
                                ? 'bg-amber-50/20'
                                : ''
                          }`}
                        >
                          {/* Slot ID */}
                          <td className="py-3.5 px-3 text-center font-mono font-bold text-[#1F4A3B]">
                            #{String(match.slotId).padStart(2, '0')}
                          </td>

                          {/* Slot Key & Category Badge */}
                          <td className="py-3.5 px-3">
                            <div className="flex flex-col gap-1 items-start">
                              <span className="font-mono text-xs font-bold text-[#1F4A3B] bg-[#F2EEE5] px-2 py-0.5 rounded-xs border border-[#D1B995]/30">
                                {match.slotKey}
                              </span>
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.2 rounded-xs border ${getCategoryColor(
                                  match.categoryKey
                                )}`}
                              >
                                {isRtl ? match.categoryLabelAr : match.categoryLabelEn}
                              </span>
                            </div>
                          </td>

                          {/* Slot Title & Spec */}
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col gap-1 max-w-sm">
                              <span className="font-semibold text-xs text-[#1F4A3B]">
                                {isRtl ? match.slotTitleAr : match.slotTitleEn}
                              </span>
                              <p className="text-[11px] text-[#5C5C5C] leading-snug line-clamp-2">
                                {isRtl ? match.slotDescriptionAr : match.slotDescriptionEn}
                              </p>
                            </div>
                          </td>

                          {/* Candidate Thumbnail */}
                          <td className="py-3.5 px-2 text-center">
                            {hasImage ? (
                              <button
                                onClick={() => {
                                  setActiveLightboxItem({
                                    url: match.candidateUrl!,
                                    title: `${match.slotKey} • ${isRtl ? match.slotTitleAr : match.slotTitleEn}`,
                                    fileName: match.candidateFileName!,
                                    subtitle: isRtl ? match.categoryLabelAr : match.categoryLabelEn,
                                    description: isRtl ? match.rationaleAr : match.rationaleEn,
                                    notes: match.sharedNoteAr || (isRtl ? `درجة الثقة: ${match.confidenceAr}` : `Confidence: ${match.confidenceEn}`),
                                    badgeText: isRtl ? match.reviewStatusAr : match.reviewStatusEn,
                                    badgeColor: match.confidence === 'high' ? 'bg-emerald-600' : 'bg-amber-600'
                                  });
                                }}
                                className="relative group w-14 h-14 bg-[#162C26] rounded-xs overflow-hidden border border-[#D1B995]/30 hover:border-[#1F4A3B] mx-auto block cursor-pointer transition-all shadow-xs"
                                title={isRtl ? 'معاينة الصورة المرشحة' : 'Inspect candidate'}
                              >
                                <img
                                  src={getSafeImageUrl(match.candidateUrl)}
                                  alt={match.candidateFileName!}
                                  loading="lazy"
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-[#1F4A3B]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                  <ZoomIn className="w-3.5 h-3.5 text-[#D1B995]" />
                                </div>
                              </button>
                            ) : (
                              <div
                                className="w-14 h-14 bg-rose-50 border border-dashed border-rose-300 rounded-xs flex flex-col items-center justify-center mx-auto text-rose-500"
                                title={isRtl ? 'لا توجد صورة مناسبة في الوارد الـ62' : 'No matching photo in inbox'}
                              >
                                <ImageOff className="w-4 h-4 opacity-70" />
                                <span className="text-[9px] font-mono mt-0.5">{isRtl ? 'شاغرة' : 'Empty'}</span>
                              </div>
                            )}
                          </td>

                          {/* Candidate Filename */}
                          <td className="py-3.5 px-4">
                            {match.candidateFileName ? (
                              <div className="flex flex-col gap-1 max-w-xs">
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className="font-mono text-xs font-semibold text-[#1F4A3B] break-all select-all"
                                    title={match.candidateFileName}
                                  >
                                    {match.candidateFileName}
                                  </span>
                                  <button
                                    onClick={(e) => handleCopy(match.candidateFileName!, e)}
                                    className="p-1 text-[#B89B6A] hover:text-[#1F4A3B] hover:bg-[#F2EEE5] rounded-xs transition-colors shrink-0 cursor-pointer"
                                    title={isRtl ? 'نسخ اسم الملف' : 'Copy filename'}
                                  >
                                    {isCopiedName ? (
                                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>
                                <span className="font-mono text-[10px] text-[#5C5C5C] truncate">
                                  {match.candidateUrl}
                                </span>
                              </div>
                            ) : (
                              <div className="flex flex-col gap-0.5 text-rose-700">
                                <span className="text-xs font-semibold">{isRtl ? 'لا توجد صورة مناسبة' : 'No suitable image'}</span>
                                <span className="text-[10px] text-rose-600/80">{isRtl ? 'تتطلب تصوير موقع مستقبلي' : 'Site photo shoot required'}</span>
                              </div>
                            )}
                          </td>

                          {/* Selection Rationale */}
                          <td className="py-3.5 px-4">
                            <p className="text-xs text-[#242424] leading-relaxed max-w-md">
                              {isRtl ? match.rationaleAr : match.rationaleEn}
                            </p>
                            {match.isSharedOrDuplicateCandidate && (
                              <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-xs text-[10px] font-semibold">
                                <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                                <span>{isRtl ? match.sharedNoteAr : match.sharedNoteEn}</span>
                              </div>
                            )}
                          </td>

                          {/* Confidence Level */}
                          <td className="py-3.5 px-3 text-center">
                            {match.confidence === 'high' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xs text-[11px] font-bold">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span>{isRtl ? match.confidenceAr : match.confidenceEn}</span>
                              </span>
                            )}
                            {match.confidence === 'medium' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-300 rounded-xs text-[11px] font-bold">
                                <span className="w-2 h-2 rounded-full bg-amber-500" />
                                <span>{isRtl ? match.confidenceAr : match.confidenceEn}</span>
                              </span>
                            )}
                            {match.confidence === 'low' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 border border-gray-300 rounded-xs text-[11px] font-medium">
                                <span className="w-2 h-2 rounded-full bg-gray-400" />
                                <span>{isRtl ? match.confidenceAr : match.confidenceEn}</span>
                              </span>
                            )}
                          </td>

                          {/* Review Status */}
                          <td className="py-3.5 px-3 text-center">
                            {match.reviewStatus === 'candidate' && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100/70 text-emerald-900 border border-emerald-300 rounded-xs text-[11px] font-semibold">
                                <FileCheck className="w-3 h-3 text-emerald-700 shrink-0" />
                                <span>{isRtl ? 'مرشحة للاعتماد' : 'Candidate'}</span>
                              </span>
                            )}
                            {match.reviewStatus === 'needs_review' && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-xs text-[11px] font-bold">
                                <AlertTriangle className="w-3 h-3 text-amber-700 shrink-0" />
                                <span>{isRtl ? 'تحتاج مراجعة' : 'Needs Review'}</span>
                              </span>
                            )}
                            {match.reviewStatus === 'no_suitable_image' && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-rose-50 text-rose-800 border border-rose-200 rounded-xs text-[11px] font-semibold">
                                <ImageOff className="w-3 h-3 text-rose-600 shrink-0" />
                                <span>{isRtl ? 'لا توجد صورة' : 'No Image'}</span>
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {hasImage ? (
                                <>
                                  <button
                                    onClick={() => {
                                      setActiveLightboxItem({
                                        url: match.candidateUrl!,
                                        title: `${match.slotKey} • ${isRtl ? match.slotTitleAr : match.slotTitleEn}`,
                                        fileName: match.candidateFileName!,
                                        subtitle: isRtl ? match.categoryLabelAr : match.categoryLabelEn,
                                        description: isRtl ? match.rationaleAr : match.rationaleEn,
                                        notes: match.sharedNoteAr || (isRtl ? `درجة الثقة: ${match.confidenceAr}` : `Confidence: ${match.confidenceEn}`),
                                        badgeText: isRtl ? match.reviewStatusAr : match.reviewStatusEn,
                                        badgeColor: match.confidence === 'high' ? 'bg-emerald-600' : 'bg-amber-600'
                                      });
                                    }}
                                    className="p-1.5 bg-[#FAF8F5] hover:bg-[#F2EEE5] text-[#1F4A3B] border border-[#D1B995]/30 rounded-xs transition-colors cursor-pointer"
                                    title={isRtl ? 'معاينة بالحجم الكامل' : 'Zoom full view'}
                                  >
                                    <ZoomIn className="w-3.5 h-3.5" />
                                  </button>

                                  <a
                                    href={match.candidateUrl!}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 bg-[#FAF8F5] hover:bg-[#F2EEE5] text-[#5C5C5C] hover:text-[#1F4A3B] border border-[#D1B995]/30 rounded-xs transition-colors"
                                    title={isRtl ? 'فتح الملف الأصلي في نافذة جديدة' : 'Open raw image'}
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                </>
                              ) : (
                                <button
                                  onClick={() => {
                                    onOpenWhatsApp(
                                      isRtl
                                        ? `تنسيق تصوير ميداني للخانة الشاغرة: ${match.slotKey} (${match.slotTitleAr})`
                                        : `Coordination for vacant slot site shoot: ${match.slotKey} (${match.slotTitleEn})`
                                    );
                                  }}
                                  className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-xs transition-colors cursor-pointer"
                                  title={isRtl ? 'طلب تصوير موقع للخانة عبر واتساب' : 'Coordinate photo shoot'}
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredMatchingSlots.length === 0 && (
                <div className="py-12 text-center text-[#5C5C5C]">
                  <p className="text-sm font-semibold">{isRtl ? 'لا توجد خانات تطابق معايير البحث والفلترة' : 'No slots match the active filters'}</p>
                  <button
                    onClick={handleResetMatchingFilters}
                    className="mt-3 text-xs text-[#B89B6A] hover:underline font-bold cursor-pointer"
                  >
                    {isRtl ? 'إعادة ضبط الفلاتر' : 'Reset filters'}
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: ORIGINAL INVENTORY AUDIT TABLE (STAGE 1 — 100% PRESERVED)         */}
        {/* ========================================================================= */}
        {viewMode === 'table' && (
          <div className="space-y-6">

            {/* Stage 1 Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 bg-white border border-[#D1B995]/30 rounded-sm shadow-xs flex flex-col">
                <span className="text-[11px] font-semibold text-[#5C5C5C] uppercase tracking-wider">
                  {isRtl ? 'إجمالي الصور بالمجلد' : 'Total Inbox Assets'}
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold font-mono text-[#1F4A3B]">{inventoryStats.totalCount}</span>
                  <span className="text-xs font-mono text-[#B89B6A]">({inventoryStats.totalSizeMb} MB)</span>
                </div>
                <span className="mt-1 text-[11px] text-[#5C5C5C]">
                  {isRtl ? 'الأسماء والملفات محفوظة بالكامل' : '100% original filenames preserved'}
                </span>
              </div>

              <div className="p-4 bg-white border border-emerald-200 rounded-sm shadow-xs flex flex-col">
                <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {isRtl ? 'جاهزة للربط الفوري' : 'Ready for Slot Assignment'}
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold font-mono text-emerald-700">{inventoryStats.readyForSlotCount}</span>
                  <span className="text-xs font-mono text-emerald-600">/ 62</span>
                </div>
                <span className="mt-1 text-[11px] text-emerald-600/80">
                  {isRtl ? 'صور ميدانية حقيقية عالية الجودة' : 'High quality authentic site photos'}
                </span>
              </div>

              <div
                onClick={() => {
                  setOnlyNeedsReview(!onlyNeedsReview);
                  setOnlyDuplicates(false);
                }}
                className={`p-4 border rounded-sm shadow-xs flex flex-col cursor-pointer transition-all ${
                  onlyNeedsReview
                    ? 'bg-amber-100/70 border-amber-500 ring-2 ring-amber-400'
                    : 'bg-amber-50/60 border-amber-200 hover:border-amber-400'
                }`}
              >
                <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    {isRtl ? 'تحتاج مراجعة يدوية' : 'Needs Manual Review'}
                  </span>
                  <span className="text-[10px] underline">{onlyNeedsReview ? (isRtl ? 'إلغاء' : 'Clear') : (isRtl ? 'فلترة' : 'Filter')}</span>
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold font-mono text-amber-800">{inventoryStats.needsReviewCount}</span>
                  <span className="text-xs text-amber-700">
                    {isRtl ? '(مكرر + لقطات + علامات)' : '(Dupes + Promo + Marks)'}
                  </span>
                </div>
                <span className="mt-1 text-[11px] text-amber-700">
                  {isRtl ? 'محددة بملاحظات فنية دقيقة' : 'Carefully flagged with audit notes'}
                </span>
              </div>

              <div
                onClick={() => {
                  setOnlyDuplicates(!onlyDuplicates);
                  setOnlyNeedsReview(false);
                }}
                className={`p-4 border rounded-sm shadow-xs flex flex-col cursor-pointer transition-all ${
                  onlyDuplicates
                    ? 'bg-rose-100/70 border-rose-500 ring-2 ring-rose-400'
                    : 'bg-white border-[#D1B995]/30 hover:border-rose-300'
                }`}
              >
                <span className="text-[11px] font-semibold text-[#5C5C5C] uppercase tracking-wider flex items-center justify-between">
                  <span>{isRtl ? 'ملفات مكررة مطابقة' : 'Exact Byte Clones'}</span>
                  <span className="text-[10px] underline">{onlyDuplicates ? (isRtl ? 'إلغاء' : 'Clear') : (isRtl ? 'فلترة' : 'Filter')}</span>
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold font-mono text-[#1F4A3B]">{inventoryStats.duplicateOrSimilarCount}</span>
                  <span className="text-xs font-mono text-[#5C5C5C]">{isRtl ? 'ملف واحد مكرر' : '1 identical file'}</span>
                </div>
                <span className="mt-1 text-[11px] text-[#5C5C5C]">
                  {isRtl ? 'الصورة #46 نسخة طبق الأصل لـ #45' : 'Item #46 identical byte copy of #45'}
                </span>
              </div>
            </div>

            {/* Category Pills Toolbar for Inventory */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setSelectedCategoryKey('all')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-xs transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategoryKey === 'all'
                      ? 'bg-[#1F4A3B] text-[#F7F5F0] shadow-xs font-semibold'
                      : 'bg-white border border-[#D1B995]/30 text-[#242424] hover:bg-[#F2EEE5]'
                  }`}
                >
                  {isRtl ? 'الكل' : 'All'} ({inventoryStats.totalCount})
                </button>

                {inventoryStats.categoryCounts.map((cat) => {
                  const isSelected = selectedCategoryKey === cat.key;
                  return (
                    <button
                      key={cat.key}
                      onClick={() => setSelectedCategoryKey(cat.key)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-xs transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#1F4A3B] text-[#F7F5F0] shadow-xs font-semibold'
                          : 'bg-white border border-[#D1B995]/30 text-[#242424] hover:bg-[#F2EEE5]'
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full inline-block"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span>{isRtl ? cat.labelAr : cat.labelEn}</span>
                      <span className={`text-[10px] px-1 py-0.2 rounded-xs ${isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'}`}>
                        {cat.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Inventory Search Box */}
              <div className="relative w-full md:w-80">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-[#B89B6A]">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isRtl ? 'ابحث باسم الملف أو الوصف أو المرحلة...' : 'Search by filename, description, or stage...'}
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

            {/* Inventory Status Counter */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#5C5C5C]">
              <div className="flex items-center gap-2">
                <span>{isRtl ? 'معروض حالياً:' : 'Currently showing:'}</span>
                <strong className="text-[#1F4A3B] font-semibold">{filteredInventoryItems.length}</strong>
                <span>{isRtl ? 'من إجمالي' : 'of'}</span>
                <strong className="text-[#1F4A3B] font-semibold">{inventoryStats.totalCount}</strong>
                <span>{isRtl ? 'صورة أصلية' : 'original photos'}</span>

                {onlyNeedsReview && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-800 rounded-xs text-[11px] font-semibold">
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    {isRtl ? 'فلترة: تحتاج مراجعة فقط' : 'Filter: Needs Review Only'}
                  </span>
                )}
                {onlyDuplicates && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-100 text-rose-800 rounded-xs text-[11px] font-semibold">
                    {isRtl ? 'فلترة: مكرر فقط' : 'Filter: Duplicates Only'}
                  </span>
                )}
              </div>

              {(searchQuery || selectedCategoryKey !== 'all' || onlyNeedsReview || onlyDuplicates) && (
                <button
                  onClick={handleResetInventoryFilters}
                  className="text-[#B89B6A] hover:text-[#1F4A3B] hover:underline font-medium cursor-pointer"
                >
                  {isRtl ? 'إعادة ضبط الفلاتر' : 'Reset All Filters'}
                </button>
              )}
            </div>

            {/* Table */}
            <div className="bg-white border border-[#D1B995]/30 rounded-sm shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-start text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#152B24] text-[#F7F5F0] border-b border-[#D1B995]/30">
                      <th className="py-3 px-3 text-center font-mono font-bold w-14">#</th>
                      <th className="py-3 px-3 text-center w-20">{isRtl ? 'المعاينة' : 'Thumbnail'}</th>
                      <th className="py-3 px-4 text-start min-w-[220px]">{isRtl ? 'اسم الملف الأصلي والمسار' : 'Original Filename & Path'}</th>
                      <th className="py-3 px-3 text-start min-w-[170px]">{isRtl ? 'التصنيف المبدئي والتخصص' : 'Classification & Specialty'}</th>
                      <th className="py-3 px-4 text-start min-w-[240px]">{isRtl ? 'الوصف الفعلي لمحتوى الصورة' : 'Visual Content Description'}</th>
                      <th className="py-3 px-3 text-start min-w-[190px]">{isRtl ? 'ملاحظات الجرد والمراجعة' : 'Audit Notes & Status'}</th>
                      <th className="py-3 px-3 text-center w-28">{isRtl ? 'إجراءات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D1B995]/20">
                    {filteredInventoryItems.map((item) => {
                      const isCopiedName = copiedText === item.fileName;
                      const hasError = imageErrors[item.fileName];

                      return (
                        <tr
                          key={item.id}
                          className={`hover:bg-[#FAF8F5] transition-colors ${
                            item.needsReview ? 'bg-amber-50/20' : ''
                          }`}
                        >
                          <td className="py-3 px-3 text-center font-mono font-bold text-[#1F4A3B]">
                            #{String(item.id).padStart(2, '0')}
                          </td>

                          <td className="py-3 px-2 text-center">
                            <button
                              onClick={() => {
                                setActiveLightboxItem({
                                  url: item.url,
                                  title: `#${String(item.id).padStart(2, '0')} • ${item.fileName}`,
                                  fileName: item.fileName,
                                  subtitle: isRtl ? item.categoryAr : item.categoryEn,
                                  stage: isRtl ? item.stageAr : item.stageEn,
                                  description: isRtl ? item.descriptionAr : item.descriptionEn,
                                  notes: isRtl ? item.reviewNotesAr : item.reviewNotesEn,
                                  badgeText: item.needsReview ? (isRtl ? 'يحتاج مراجعة' : 'Needs Review') : (isRtl ? 'جاهز للربط' : 'Ready'),
                                  badgeColor: item.needsReview ? 'bg-amber-600' : 'bg-emerald-600'
                                });
                              }}
                              className="relative group w-14 h-14 bg-[#162C26] rounded-xs overflow-hidden border border-[#D1B995]/30 hover:border-[#1F4A3B] mx-auto block cursor-pointer transition-all shadow-xs"
                              title={isRtl ? 'تكبير الصورة وفحص التفاصيل' : 'Click to inspect in full resolution'}
                            >
                              {!hasError ? (
                                <img
                                  src={getSafeImageUrl(item.url)}
                                  alt={item.fileName}
                                  loading="lazy"
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                  onError={() => setImageErrors((prev) => ({ ...prev, [item.fileName]: true }))}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-red-300 font-mono text-[9px]">
                                  Err
                                </div>
                              )}
                              <div className="absolute inset-0 bg-[#1F4A3B]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                <ZoomIn className="w-3.5 h-3.5 text-[#D1B995]" />
                              </div>
                            </button>
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex flex-col gap-1 max-w-sm">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className="font-mono text-xs font-semibold text-[#1F4A3B] break-all select-all"
                                  title={item.fileName}
                                >
                                  {item.fileName}
                                </span>
                                <button
                                  onClick={(e) => handleCopy(item.fileName, e)}
                                  className="p-1 text-[#B89B6A] hover:text-[#1F4A3B] hover:bg-[#F2EEE5] rounded-xs transition-colors shrink-0 cursor-pointer"
                                  title={isRtl ? 'نسخ اسم الملف' : 'Copy filename'}
                                >
                                  {isCopiedName ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-[#5C5C5C] font-mono">
                                <span className="truncate max-w-[200px]" title={item.url}>{item.url}</span>
                                <span className="text-[#B89B6A] shrink-0 font-sans">({item.sizeKb} KB)</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <div className="flex flex-col gap-1.5 items-start">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-xs text-[11px] font-semibold border ${getCategoryColor(
                                  item.categoryKey
                                )}`}
                              >
                                {isRtl ? item.categoryAr : item.categoryEn}
                              </span>
                              <span className="text-[11px] text-[#5C5C5C] font-medium">
                                {isRtl ? item.stageAr : item.stageEn}
                              </span>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <p className="text-xs text-[#242424] leading-relaxed max-w-md">
                              {isRtl ? item.descriptionAr : item.descriptionEn}
                            </p>
                            <span className="mt-1 inline-block text-[10px] text-[#B89B6A] font-semibold">
                              {isRtl ? `نوع الملف: ${item.photoTypeAr}` : `Type: ${item.photoTypeEn}`}
                            </span>
                          </td>

                          <td className="py-3 px-3">
                            <div className="flex flex-col gap-1.5">
                              {item.needsReview ? (
                                <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-xs text-[11px] font-bold self-start">
                                  <AlertTriangle className="w-3 h-3 text-amber-700 shrink-0" />
                                  <span>{isRtl ? 'يحتاج مراجعة' : 'Needs Review'}</span>
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xs text-[11px] font-semibold self-start">
                                  <FileCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                                  <span>{isRtl ? 'جاهز للربط' : 'Ready'}</span>
                                </div>
                              )}

                              <span className="text-[11px] text-[#5C5C5C] leading-snug">
                                {isRtl ? item.reviewNotesAr : item.reviewNotesEn}
                              </span>

                              {item.isDuplicateOrSimilar && (
                                <span className="text-[10px] text-rose-700 font-semibold bg-rose-50 px-1.5 py-0.5 rounded-xs border border-rose-200 self-start">
                                  {isRtl ? item.duplicateNoteAr : item.duplicateNoteEn}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => {
                                  setActiveLightboxItem({
                                    url: item.url,
                                    title: `#${String(item.id).padStart(2, '0')} • ${item.fileName}`,
                                    fileName: item.fileName,
                                    subtitle: isRtl ? item.categoryAr : item.categoryEn,
                                    stage: isRtl ? item.stageAr : item.stageEn,
                                    description: isRtl ? item.descriptionAr : item.descriptionEn,
                                    notes: isRtl ? item.reviewNotesAr : item.reviewNotesEn,
                                    badgeText: item.needsReview ? (isRtl ? 'يحتاج مراجعة' : 'Needs Review') : (isRtl ? 'جاهز للربط' : 'Ready'),
                                    badgeColor: item.needsReview ? 'bg-amber-600' : 'bg-emerald-600'
                                  });
                                }}
                                className="p-1.5 bg-[#FAF8F5] hover:bg-[#F2EEE5] text-[#1F4A3B] border border-[#D1B995]/30 rounded-xs transition-colors cursor-pointer"
                                title={isRtl ? 'معاينة بالحجم الكامل' : 'Zoom full view'}
                              >
                                <ZoomIn className="w-3.5 h-3.5" />
                              </button>

                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 bg-[#FAF8F5] hover:bg-[#F2EEE5] text-[#5C5C5C] hover:text-[#1F4A3B] border border-[#D1B995]/30 rounded-xs transition-colors"
                                title={isRtl ? 'فتح الملف الأصلي في نافذة جديدة' : 'Open raw image'}
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>

                              <button
                                onClick={() => {
                                  onOpenWhatsApp(
                                    isRtl
                                      ? `استفسار عن الصورة الميدانية رقم #${item.id} (${item.fileName})`
                                      : `Inquiry on field photo #${item.id} (${item.fileName})`
                                  );
                                }}
                                className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xs transition-colors cursor-pointer"
                                title={isRtl ? 'استفسار عبر واتساب' : 'WhatsApp inquiry'}
                              >
                                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: ORIGINAL VISUAL CARD GRID (STAGE 1 — 100% PRESERVED)              */}
        {/* ========================================================================= */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredInventoryItems.map((item) => {
              const isCopied = copiedText === item.fileName;
              const hasError = imageErrors[item.fileName];

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setActiveLightboxItem({
                      url: item.url,
                      title: `#${String(item.id).padStart(2, '0')} • ${item.fileName}`,
                      fileName: item.fileName,
                      subtitle: isRtl ? item.categoryAr : item.categoryEn,
                      stage: isRtl ? item.stageAr : item.stageEn,
                      description: isRtl ? item.descriptionAr : item.descriptionEn,
                      notes: isRtl ? item.reviewNotesAr : item.reviewNotesEn,
                      badgeText: item.needsReview ? (isRtl ? 'يحتاج مراجعة' : 'Needs Review') : (isRtl ? 'جاهز للربط' : 'Ready'),
                      badgeColor: item.needsReview ? 'bg-amber-600' : 'bg-emerald-600'
                    });
                  }}
                  className={`group relative flex flex-col bg-white border rounded-sm overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer ${
                    item.needsReview
                      ? 'border-amber-300 hover:border-amber-500'
                      : 'border-[#D1B995]/30 hover:border-[#1F4A3B]'
                  }`}
                >
                  <div className="relative aspect-[4/3] bg-[#162C26] overflow-hidden">
                    {!hasError ? (
                      <img
                        src={getSafeImageUrl(item.url)}
                        alt={item.fileName}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={() => setImageErrors((prev) => ({ ...prev, [item.fileName]: true }))}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-[#F7F5F0]">
                        <span className="text-xs text-red-300 font-mono">Error loading</span>
                        <span className="text-[10px] font-mono opacity-70 truncate max-w-full px-2 mt-1">
                          {item.fileName}
                        </span>
                      </div>
                    )}

                    <div className="absolute top-2.5 start-2.5 px-2 py-0.5 bg-[#152B24]/90 backdrop-blur-xs text-[#D1B995] text-[10px] font-mono font-bold rounded-sm border border-[#D1B995]/30">
                      #{String(item.id).padStart(2, '0')}
                    </div>

                    <div className="absolute top-2.5 end-2.5 flex items-center gap-1.5">
                      {item.needsReview && (
                        <div className="px-1.5 py-0.5 bg-amber-500 text-white text-[9px] font-bold rounded-xs flex items-center gap-1 shadow-xs">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{isRtl ? 'مراجعة' : 'Review'}</span>
                        </div>
                      )}
                      <div className="px-2 py-0.5 bg-[#152B24]/90 backdrop-blur-xs text-[#F7F5F0] text-[10px] font-mono rounded-sm border border-[#D1B995]/20">
                        {item.sizeKb} KB
                      </div>
                    </div>

                    <div className="absolute inset-0 bg-[#1F4A3B]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#152B24] border border-[#D1B995]/40 text-xs text-[#D1B995] rounded-sm shadow-sm">
                        <ZoomIn className="w-3.5 h-3.5" />
                        <span>{isRtl ? 'معاينة بالحجم الكامل' : 'Inspect Full Resolution'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 flex flex-col flex-1 justify-between bg-white border-t border-[#D1B995]/15">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-xs border ${getCategoryColor(
                            item.categoryKey
                          )}`}
                        >
                          {isRtl ? item.categoryAr : item.categoryEn}
                        </span>
                        <span className="text-[10px] text-[#5C5C5C] font-mono truncate max-w-[120px]">
                          {isRtl ? item.stageAr : item.stageEn}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span
                          className="font-mono text-xs font-semibold text-[#1F4A3B] truncate"
                          title={item.fileName}
                        >
                          {item.fileName}
                        </span>
                        <button
                          onClick={(e) => handleCopy(item.fileName, e)}
                          className="p-1 text-[#B89B6A] hover:text-[#1F4A3B] hover:bg-[#F2EEE5] rounded-xs transition-colors shrink-0 cursor-pointer"
                          title={t.inboxCopyFilename}
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <p className="text-[11px] text-[#5C5C5C] line-clamp-2 leading-relaxed mb-2">
                        {isRtl ? item.descriptionAr : item.descriptionEn}
                      </p>
                    </div>

                    <div className="mt-2 pt-2.5 border-t border-[#D1B995]/15 flex items-center justify-between">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenWhatsApp(
                            isRtl
                              ? `استفسار عن صورة ميدانية رقم #${item.id}: ${item.fileName}`
                              : `Inquiry on field photo #${item.id}: ${item.fileName}`
                          );
                        }}
                        className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#1F4A3B] hover:text-[#B89B6A] transition-colors cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{t.inboxWhatsAppCta}</span>
                      </button>

                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 text-[#5C5C5C] hover:text-[#1F4A3B] rounded-xs transition-colors"
                        title={isRtl ? 'فتح في نافذة جديدة' : 'Open in new tab'}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ========================================================================= */}
        {/* UNIFIED LIGHTBOX MODAL FOR BOTH INVENTORY & MATCHING INSPECTION           */}
        {/* ========================================================================= */}
        {activeLightboxItem && (
          <div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
            onClick={() => setActiveLightboxItem(null)}
          >
            <div
              className="relative max-w-5xl w-full bg-[#152B24] border border-[#D1B995]/30 rounded-sm overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-3.5 bg-[#0F1E19] border-b border-[#D1B995]/20 text-[#F7F5F0]">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs sm:text-sm text-[#F7F5F0] truncate max-w-[280px] sm:max-w-md font-bold">
                    {activeLightboxItem.title}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleCopy(activeLightboxItem.fileName, e)}
                    className="p-1.5 text-[#D1B995] hover:text-white hover:bg-white/10 rounded-sm transition-colors cursor-pointer"
                    title={isRtl ? 'نسخ اسم الملف' : 'Copy filename'}
                  >
                    {copiedText === activeLightboxItem.fileName ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>

                  <a
                    href={activeLightboxItem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-[#D1B995] hover:text-white hover:bg-white/10 rounded-sm transition-colors"
                    title={isRtl ? 'فتح الملف الأصلي في نافذة جديدة' : 'Open raw image'}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => setActiveLightboxItem(null)}
                    className="p-1.5 text-[#F7F5F0] hover:text-[#D1B995] hover:bg-white/10 rounded-sm transition-colors cursor-pointer"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="relative flex items-center justify-center bg-black/60 min-h-[280px] max-h-[55vh] p-4 overflow-hidden">
                <img
                  src={getSafeImageUrl(activeLightboxItem.url)}
                  alt={activeLightboxItem.fileName}
                  className="max-h-[50vh] max-w-full object-contain mx-auto shadow-lg"
                />
              </div>

              <div className="p-4 sm:p-5 bg-[#0F1E19] border-t border-[#D1B995]/20 flex flex-col gap-3 text-xs text-[#F7F5F0]">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#D1B995]/15">
                  <div className="flex flex-wrap items-center gap-2">
                    {activeLightboxItem.subtitle && (
                      <span className="px-2.5 py-1 bg-[#1F4A3B] text-[#D1B995] border border-[#D1B995]/40 rounded-xs font-semibold text-xs">
                        {activeLightboxItem.subtitle}
                      </span>
                    )}
                    {activeLightboxItem.stage && (
                      <span className="px-2 py-0.5 bg-white/10 text-white rounded-xs text-[11px]">
                        {activeLightboxItem.stage}
                      </span>
                    )}
                  </div>

                  {activeLightboxItem.badgeText && (
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-white rounded-xs font-bold text-[11px] ${activeLightboxItem.badgeColor || 'bg-emerald-600'}`}>
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>{activeLightboxItem.badgeText}</span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] leading-relaxed">
                  {activeLightboxItem.description && (
                    <div className="bg-[#152B24] p-3 rounded-xs border border-[#D1B995]/20">
                      <strong className="block text-[#D1B995] font-semibold mb-1">
                        {isRtl ? 'المحتوى الفعلي وسبب المطابقة:' : 'Content & Rationale:'}
                      </strong>
                      <p className="text-[#F7F5F0]/90">
                        {activeLightboxItem.description}
                      </p>
                    </div>
                  )}

                  {activeLightboxItem.notes && (
                    <div className="bg-[#152B24] p-3 rounded-xs border border-[#D1B995]/20">
                      <strong className="block text-[#D1B995] font-semibold mb-1">
                        {isRtl ? 'الملاحظات الفنية:' : 'Technical Notes:'}
                      </strong>
                      <p className="text-[#F7F5F0]/90">
                        {activeLightboxItem.notes}
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="font-mono text-[10px] text-[#5C5C5C] truncate">
                    {activeLightboxItem.fileName} • {activeLightboxItem.url}
                  </span>

                  <button
                    onClick={() => {
                      onOpenWhatsApp(
                        isRtl
                          ? `استشارة حول مطابقة الصورة: ${activeLightboxItem.fileName} (${activeLightboxItem.title})`
                          : `Consultation regarding candidate match: ${activeLightboxItem.fileName}`
                      );
                    }}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#D1B995] hover:bg-[#E5D1B0] text-[#1F4A3B] font-bold rounded-sm transition-colors cursor-pointer text-xs uppercase shadow-sm"
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
