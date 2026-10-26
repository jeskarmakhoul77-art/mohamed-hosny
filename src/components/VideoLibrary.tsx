import React, { useState } from 'react';
import { Language, VideoSlot } from '../types';
import { translations } from '../translations';
import { Play, Video, Info, X, FolderOpen } from 'lucide-react';

interface VideoLibraryProps {
  currentLang: Language;
  videoSlots: VideoSlot[];
  onOpenBooking: () => void;
}

export const VideoLibrary: React.FC<VideoLibraryProps> = ({
  currentLang,
  videoSlots,
  onOpenBooking
}) => {
  const t = translations[currentLang];
  const [activeVideoModal, setActiveVideoModal] = useState<VideoSlot | null>(null);

  return (
    <section id="videos" className="py-16 lg:py-24 bg-[#FAF8F5] text-[#242424] border-b border-[#D1B995]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#B89B6A] mb-2">
              <span className="w-5 h-[1.5px] bg-[#B89B6A]" />
              <span>{t.videoLibraryKicker}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1F4A3B]">
              {t.videoLibraryTitle}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#5C5C5C] leading-relaxed">
              {t.videoLibrarySubtitle}
            </p>
          </div>

          <div className="hidden md:flex items-center gap-2 font-mono text-[11px] text-[#1F4A3B] bg-white px-3.5 py-2 rounded-xs border border-[#D1B995]/30">
            <FolderOpen className="w-3.5 h-3.5 text-[#B89B6A]" />
            <span>public/assets/videos/{'{slotKey}'}.mp4</span>
          </div>
        </div>

        {/* 5 Video Slots Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videoSlots.map((video) => {
            const title = currentLang === 'ar' ? video.titleAr : video.titleEn;
            const subtitle = currentLang === 'ar' ? video.subtitleAr : video.subtitleEn;
            const desc = currentLang === 'ar' ? video.descriptionAr : video.descriptionEn;
            const notes = currentLang === 'ar' ? video.notesAr : video.notesEn;

            return (
              <div
                key={video.id}
                className="flex flex-col bg-white border border-[#D1B995]/30 rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Video Media Container */}
                <div className="relative aspect-video bg-[#162C26] overflow-hidden flex items-center justify-center group">
                  {video.videoUrl ? (
                    <>
                      <img
                        src={video.posterUrl || '/assets/aistudio/Luxury_Architectural_Gold_Monogram_Branding_9b169c0f.png'}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <button
                          onClick={() => setActiveVideoModal(video)}
                          className="w-14 h-14 rounded-full bg-[#D1B995] text-[#1F4A3B] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform cursor-pointer"
                          aria-label={t.playVideo}
                        >
                          <Play className="w-6 h-6 fill-current translate-x-0.5" />
                        </button>
                      </div>
                    </>
                  ) : (
                    /* Designated Video Placeholder with slotKey */
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#1F4A3B] text-[#F7F5F0]">
                      <div className="w-12 h-12 rounded-full border border-[#D1B995]/30 bg-[#162C26] flex items-center justify-center text-[#D1B995] mb-2">
                        <Video className="w-6 h-6" />
                      </div>
                      
                      <span className="text-[11px] font-mono font-bold tracking-wider text-[#D1B995] bg-[#152B24] px-2.5 py-0.5 rounded-xs border border-[#D1B995]/30">
                        {video.slotKey}
                      </span>
                      
                      <p className="text-[10px] font-mono text-[#F7F5F0]/60 mt-1 truncate max-w-full px-2">
                        {video.defaultFilePath}
                      </p>
                    </div>
                  )}

                  {/* Slot Number Tag */}
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-[#152B24]/90 text-[#D1B995] text-[10px] font-mono font-bold rounded-sm border border-[#D1B995]/20">
                    {video.slotKey}
                  </div>
                </div>

                {/* Content */}
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

                  {/* Context note with slot path */}
                  <div className="mt-4 pt-3 border-t border-[#F2EEE5] flex flex-col gap-1 text-[11px] text-[#5C5C5C]">
                    <div className="flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-[#B89B6A] shrink-0" />
                      <span className="truncate">{notes}</span>
                    </div>
                    <span className="font-mono text-[10px] text-[#1F4A3B] opacity-75">
                      {video.defaultFilePath}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
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
                  activeVideoModal.videoUrl.endsWith('.mp4') ? (
                    <video
                      src={activeVideoModal.videoUrl}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                    />
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
                  <div className="p-8 text-center">
                    <p className="text-sm text-[#D1B995] font-bold">
                      {t.videoAwaitingUpload}
                    </p>
                    <p className="text-xs font-mono text-white/70 mt-1">
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
