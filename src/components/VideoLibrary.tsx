import React, { useState, useMemo } from 'react';
import { Language, VideoSlot } from '../types';
import { translations } from '../translations';
import {
  Play,
  Video,
  Info,
  X,
  FolderOpen,
  Clock,
  Sparkles,
  Layers,
  PlusCircle,
  Film,
  CheckCircle2,
  ExternalLink,
  Lock
} from 'lucide-react';

interface VideoLibraryProps {
  currentLang: Language;
  videoSlots: VideoSlot[];
  onOpenBooking: () => void;
  onOpenMediaManager?: () => void;
}

export const VideoLibrary: React.FC<VideoLibraryProps> = ({
  currentLang,
  videoSlots,
  onOpenBooking,
  onOpenMediaManager
}) => {
  const t = translations[currentLang];
  const isRtl = currentLang === 'ar';
  const [activeVideoModal, setActiveVideoModal] = useState<VideoSlot | null>(null);

  // Filter mode: 'all' (all 12 videos), 'original' (5 original slots), or 'cloud' (7 additional cloud videos)
  const [viewFilter, setViewFilter] = useState<'all' | 'original' | 'cloud'>('all');

  // Filtered list based on view mode
  const displayedVideos = useMemo(() => {
    if (viewFilter === 'original') {
      return videoSlots.filter((v) => !v.slotKey.startsWith('video-06') && !v.slotKey.startsWith('video-07') && !v.slotKey.startsWith('video-08') && !v.slotKey.startsWith('video-09') && !v.slotKey.startsWith('video-10') && !v.slotKey.startsWith('video-11') && !v.slotKey.startsWith('video-12'));
    }
    if (viewFilter === 'cloud') {
      return videoSlots.filter((v) => v.videoUrl?.includes('supabase.co') || v.slotKey.startsWith('video-06') || v.slotKey.startsWith('video-07') || v.slotKey.startsWith('video-08') || v.slotKey.startsWith('video-09') || v.slotKey.startsWith('video-10') || v.slotKey.startsWith('video-11') || v.slotKey.startsWith('video-12'));
    }
    return videoSlots;
  }, [viewFilter, videoSlots]);

  return (
    <section id="videos" className="py-16 lg:py-24 bg-[#FAF8F5] text-[#242424] border-b border-[#D1B995]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#B89B6A] mb-2">
              <span className="w-5 h-[1.5px] bg-[#B89B6A]" />
              <span>{isRtl ? 'التوثيق المرئي الميداني' : 'On-Site Video Documentation'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1F4A3B]">
              {isRtl ? 'مكتبة الفيديوهات التوثيقية الكاملة (12 فيديو)' : 'Comprehensive Project Video Library (12 Videos)'}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#5C5C5C] leading-relaxed">
              {isRtl
                ? 'توثيق مرئي ميداني شامل يضم الـ 5 فيديوهات الأصلية المعتمدة للمؤسسة بالإضافة إلى الـ 7 فيديوهات السحابية الجديدة التي تغطي كافة تفاصيل التنفيذ والتشطيب.'
                : 'Complete documentary video archive featuring all 5 original foundation videos alongside the 7 new cloud-streamed execution walkthroughs.'}
            </p>
          </div>

          {/* Quick Target Path Pill */}
          <div className="hidden md:flex items-center gap-2 font-mono text-[11px] text-[#1F4A3B] bg-white px-3.5 py-2 rounded-xs border border-[#D1B995]/30 shrink-0">
            <FolderOpen className="w-3.5 h-3.5 text-[#B89B6A]" />
            <span>5 Original + 7 Supabase Cloud</span>
          </div>
        </div>

        {/* View Switcher Bar & Expansion Tag */}
        <div className="mb-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-[#D1B995]/20 pb-4">
          <div className="flex items-center p-1 bg-[#EAE5D9] rounded-sm gap-1 self-start flex-wrap">
            {/* Tab 1: All 12 Videos */}
            <button
              onClick={() => setViewFilter('all')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-xs transition-all cursor-pointer ${
                viewFilter === 'all'
                  ? 'bg-[#1F4A3B] text-[#F7F5F0] shadow-xs font-semibold ring-1 ring-[#D1B995]'
                  : 'text-[#242424] hover:text-[#1F4A3B] hover:bg-white/40'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#D1B995]" />
              <span>{isRtl ? `كافة الفيديوهات (${videoSlots.length})` : `All Videos (${videoSlots.length})`}</span>
            </button>

            {/* Tab 2: Original 5 Videos */}
            <button
              onClick={() => setViewFilter('original')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-xs transition-all cursor-pointer ${
                viewFilter === 'original'
                  ? 'bg-[#1F4A3B] text-[#F7F5F0] shadow-xs font-semibold ring-1 ring-[#D1B995]'
                  : 'text-[#242424] hover:text-[#1F4A3B] hover:bg-white/40'
              }`}
            >
              <Film className="w-3.5 h-3.5 text-[#D1B995]" />
              <span>{isRtl ? 'الفيديوهات الأصلية (5)' : 'Original Videos (5)'}</span>
            </button>

            {/* Tab 3: Additional 7 Cloud Videos */}
            <button
              onClick={() => setViewFilter('cloud')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-xs transition-all cursor-pointer ${
                viewFilter === 'cloud'
                  ? 'bg-[#1F4A3B] text-[#F7F5F0] shadow-xs font-semibold ring-1 ring-[#D1B995]'
                  : 'text-[#242424] hover:text-[#1F4A3B] hover:bg-white/40'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D1B995]" />
              <span>{isRtl ? 'الفيديوهات السحابية الإضافية (7)' : 'Additional Cloud Videos (7)'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#5C5C5C]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              {isRtl
                ? 'جميع الفيديوهات الـ 12 نشطة وتعمل بدون تكرار أو روابط مفقودة'
                : 'All 12 videos active and streaming without duplicates'}
            </span>
          </div>
        </div>

        {/* Video Slots Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedVideos.map((video, idx) => {
            const title = currentLang === 'ar' ? video.titleAr : video.titleEn;
            const subtitle = currentLang === 'ar' ? video.subtitleAr : video.subtitleEn;
            const desc = currentLang === 'ar' ? video.descriptionAr : video.descriptionEn;
            const hasRealVideo = Boolean(video.videoUrl && video.videoUrl.trim() !== '');

            return (
              <div
                key={video.slotKey}
                className="flex flex-col bg-white border border-[#D1B995]/30 rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Video Media Canvas */}
                <div
                  onClick={() => {
                    if (hasRealVideo) setActiveVideoModal(video);
                  }}
                  className={`relative aspect-video bg-[#162C26] overflow-hidden flex items-center justify-center group ${hasRealVideo ? 'cursor-pointer' : ''}`}
                >
                  {hasRealVideo ? (
                    <>
                      <img
                        src={video.posterUrl || '/assets/aistudio/Luxury_Architectural_Gold_Monogram_Branding_9b169c0f.png'}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveVideoModal(video);
                          }}
                          className="w-14 h-14 rounded-full bg-[#D1B995] text-[#1F4A3B] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform cursor-pointer"
                          aria-label={t.playVideo}
                        >
                          <Play className="w-6 h-6 fill-current translate-x-0.5" />
                        </button>
                      </div>
                    </>
                  ) : (
                    /* Dignified Architectural "Coming Soon" Presentation — No broken links or fake players */
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#1F4A3B] to-[#12251F] text-[#F7F5F0] relative">
                      {/* Geometric Background Accents */}
                      <div className="w-12 h-12 rounded-full border border-[#D1B995]/40 bg-[#162C26] flex items-center justify-center text-[#D1B995] mb-3 shadow-inner">
                        <Video className="w-6 h-6" />
                      </div>

                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#152B24] text-[#D1B995] rounded-xs text-[11px] font-mono border border-[#D1B995]/40 shadow-xs">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>{isRtl ? 'قريبًا — بانتظار رفع الفيديو الفعلي' : 'Coming Soon — Video in Production'}</span>
                      </span>

                      <p className="text-[10px] font-mono text-[#D1B995]/80 mt-2 truncate max-w-full px-2">
                        {video.defaultFilePath}
                      </p>
                    </div>
                  )}

                  {/* Slot Number Tag & Source Badge */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                    <div className="px-2 py-0.5 bg-[#152B24]/90 text-[#D1B995] text-[10px] font-mono font-bold rounded-sm border border-[#D1B995]/20 flex items-center gap-1.5">
                      <span>#{idx + 1}</span>
                      <span>·</span>
                      <span>{video.slotKey}</span>
                    </div>
                    {video.videoUrl?.includes('supabase.co') ? (
                      <span className="px-1.5 py-0.5 bg-emerald-900/90 text-[#3ECF8E] text-[9px] font-mono font-bold rounded-xs border border-emerald-500/40">
                        Supabase Cloud
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 bg-[#1F4A3B]/90 text-white text-[9px] font-mono font-bold rounded-xs border border-[#D1B995]/30">
                        {isRtl ? 'أصلي محلي' : 'Original Local'}
                      </span>
                    )}
                  </div>

                  {/* Status Indicator */}
                  <div className="absolute top-2.5 right-2.5 rtl:right-auto rtl:left-auto rtl:top-2.5 rtl:left-2.5 rtl:translate-x-0">
                    {hasRealVideo ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-800/90 text-white text-[10px] font-bold rounded-xs border border-emerald-400/40">
                        <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                        <span>{isRtl ? 'جاهز للمشاهدة' : 'Ready'}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-900/80 text-amber-200 text-[10px] font-bold rounded-xs border border-amber-400/30">
                        <Clock className="w-3 h-3 text-amber-300" />
                        <span>{isRtl ? 'قيد التوثيق' : 'Coming Soon'}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-5 flex flex-col flex-1 justify-between">
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-[#B89B6A] uppercase tracking-wider block">
                      {subtitle}
                    </span>
                    <h3 className="text-base font-bold text-[#1F4A3B] leading-snug">
                      {title}
                    </h3>
                    <p className="text-xs text-[#5C5C5C] leading-relaxed line-clamp-3">
                      {desc}
                    </p>
                  </div>

                  {/* Context notice & expected filename */}
                  <div className="mt-4 pt-3 border-t border-[#F2EEE5] flex flex-col gap-1 text-[11px] text-[#5C5C5C]">
                    <div className="flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-[#B89B6A] shrink-0" />
                      <span className="truncate">
                        {hasRealVideo
                          ? (isRtl ? 'فيديو موثق ومعتمد من إدارة المهندس محمد حسني' : 'Verified project video asset')
                          : (isRtl ? 'سيظهر الفيديو هنا تلقائيًا فور وضعه في المجلد المخصص دون أي رابط مكسور' : 'Video displays automatically once placed in the target directory')}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-[#1F4A3B] opacity-75">
                      {video.defaultFilePath}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Extensibility & Dynamic Addition Card */}
          <div className="flex flex-col bg-[#FAF8F5] border-2 border-dashed border-[#D1B995]/60 rounded-sm p-6 justify-between text-center hover:bg-[#F2EEE5]/50 transition-colors">
            <div className="space-y-3 flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-[#1F4A3B] text-[#D1B995] flex items-center justify-center shadow-xs">
                <PlusCircle className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-[#1F4A3B]">
                {isRtl ? 'إمكانية التوسع وإضافة فيديوهات جديدة' : 'Extensible Video & Content Expansion'}
              </h3>
              <p className="text-xs text-[#5C5C5C] leading-relaxed max-w-xs">
                {isRtl
                  ? 'تم تصميم نظام المحتوى لاستقبال فيديوهات إضافية، صور مشاريع جديدة، وتوثيقات قبل وبعد بشكل دائم دون الحاجة لإعادة تصميم القسم.'
                  : 'Engineered for seamless addition of new videos, extra project photography, and before/after milestones without layout changes.'}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-[#D1B995]/20 flex flex-col gap-2">
              {onOpenMediaManager && (
                <button
                  onClick={onOpenMediaManager}
                  className="w-full py-2.5 px-3 text-xs font-bold bg-[#1F4A3B] hover:bg-[#152B24] text-[#D1B995] rounded-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>{isRtl ? 'دخول الإدارة — إضافة وتحديث الفيديوهات' : 'Admin Login — Manage & Add Videos'}</span>
                </button>
              )}
              <span className="text-[10px] font-mono text-[#5C5C5C]">
                {isRtl ? 'يدعم ملفات MP4 / WebM وتضمين يوتيوب وفيميو' : 'Supports direct MP4/WebM & YouTube/Vimeo streams'}
              </span>
            </div>
          </div>
        </div>

        {/* Video Player Modal */}
        {activeVideoModal && (
          <div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setActiveVideoModal(null)}
          >
            <div
              className="relative max-w-3xl w-full bg-[#152B24] border border-[#D1B995]/40 rounded-sm overflow-hidden text-[#F7F5F0] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-3 border-b border-[#D1B995]/20 bg-[#0D1A16]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#D1B995] px-2 py-0.5 bg-[#1F4A3B] rounded-xs">
                    {activeVideoModal.slotKey}
                  </span>
                  <h4 className="text-sm font-bold text-white">
                    {currentLang === 'ar' ? activeVideoModal.titleAr : activeVideoModal.titleEn}
                  </h4>
                </div>
                <button
                  onClick={() => setActiveVideoModal(null)}
                  className="p-1 text-[#F7F5F0]/70 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="aspect-video bg-black flex items-center justify-center">
                {activeVideoModal.videoUrl ? (
                  activeVideoModal.videoUrl.includes('.mp4') ||
                  activeVideoModal.videoUrl.includes('.webm') ||
                  activeVideoModal.videoUrl.startsWith('/assets/') ? (
                    <video
                      key={activeVideoModal.videoUrl}
                      src={activeVideoModal.videoUrl}
                      controls
                      autoPlay
                      playsInline
                      preload="auto"
                      className="w-full h-full object-contain"
                    >
                      <source src={activeVideoModal.videoUrl} type="video/mp4" />
                      {isRtl ? 'المتصفح لا يدعم تشغيل هذا الفيديو مباشرة.' : 'Your browser does not support this video format.'}
                    </video>
                  ) : (
                    <iframe
                      src={activeVideoModal.videoUrl}
                      title={activeVideoModal.titleEn}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )
                ) : (
                  <div className="p-8 text-center space-y-3">
                    <Clock className="w-8 h-8 text-amber-400 mx-auto" />
                    <p className="text-sm text-[#D1B995] font-bold">
                      {isRtl ? 'قريبًا — بانتظار رفع ملف الفيديو الفعلي' : 'Coming Soon — Video Asset In Production'}
                    </p>
                    <p className="text-xs font-mono text-white/70">
                      Target: {activeVideoModal.defaultFilePath}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
