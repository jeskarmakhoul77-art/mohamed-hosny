import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { HERO_SLIDES, HeroSlide, DISPLAY_WHATSAPP_NUMBER, OFFICIAL_WHATSAPP_LINK } from '../config/businessConfig';
import { BrandLogo } from './BrandLogo';
import {
  MessageCircle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  MapPin,
  ChevronRight,
  ChevronLeft,
  Pause,
  Play,
  Sparkles,
  Info
} from 'lucide-react';

interface HeroProps {
  currentLang: Language;
  onOpenWhatsApp: (serviceName?: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ currentLang, onOpenWhatsApp }) => {
  const t = translations[currentLang];
  const isRtl = currentLang === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [slideImageErrors, setSlideImageErrors] = useState<Record<number, boolean>>({});
  const slideIntervalRef = useRef<number | null>(null);

  // Preload all 4 hero images on mount so slides appear instantaneously with zero flash
  useEffect(() => {
    HERO_SLIDES.forEach((slide) => {
      const img = new Image();
      img.src = slide.imageUrl;
    });
  }, []);

  // Auto-advance slides every 6 seconds if playing
  useEffect(() => {
    if (!isPlaying) {
      if (slideIntervalRef.current) clearInterval(slideIntervalRef.current);
      return;
    }

    slideIntervalRef.current = window.setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);

    return () => {
      if (slideIntervalRef.current) clearInterval(slideIntervalRef.current);
    };
  }, [isPlaying]);

  const activeSlide: HeroSlide = HERO_SLIDES[currentSlideIndex];

  const handlePrevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const handleNextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const handleImageError = (slideId: number, failedUrl: string) => {
    console.warn(`[Hero] Failed to load slide #${slideId} from URL: ${failedUrl}. Using original fallback slide.`);
    setSlideImageErrors((prev) => ({ ...prev, [slideId]: true }));
  };

  return (
    <section className="relative overflow-hidden bg-[#152B24] text-[#F7F5F0] min-h-[480px] sm:min-h-[520px] lg:min-h-[560px] flex items-center border-b border-[#D1B995]/25">
      {/* 1. Cinematic Background Slideshow Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        {HERO_SLIDES.map((slide, index) => {
          const isActive = index === currentSlideIndex;
          const isError = slideImageErrors[slide.id];
          const imageSrc = isError ? HERO_SLIDES[0].imageUrl : slide.imageUrl;

          return (
            <div
              key={slide.id}
              aria-hidden={!isActive}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img
                src={imageSrc}
                alt={currentLang === 'ar' ? slide.titleAr : slide.titleEn}
                onError={() => handleImageError(slide.id, slide.imageUrl)}
                className={`w-full h-full object-cover object-center transform transition-transform duration-[7000ms] ease-out motion-reduce:transform-none ${
                  isActive ? 'scale-105' : 'scale-100'
                }`}
                loading="eager"
                decoding="async"
                referrerPolicy="no-referrer"
              />
            </div>
          );
        })}

        {/* Architectural Vignette & Text Scrim Overlay — High contrast for text, fully luminous for photography */}
        <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#152B24]/85 via-[#152B24]/40 to-[#152B24]/20" />
        <div className="absolute inset-0 z-20 bg-gradient-to-r rtl:bg-gradient-to-l from-[#152B24]/80 via-[#152B24]/35 to-transparent" />
      </div>

      {/* 2. Main Hero Foreground Content */}
      <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-14 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          {/* Main Editorial Text Column */}
          <div className="lg:col-span-8 flex flex-col items-start space-y-4 sm:space-y-5">
            
            {/* Architectural Kicker & Service Area */}
            <div className="inline-flex flex-wrap items-center gap-2 text-[11px] sm:text-xs font-semibold tracking-wider uppercase text-[#D1B995] bg-[#152B24]/85 px-3 py-1 rounded-xs border border-[#D1B995]/30 backdrop-blur-sm shadow-xs">
              <span className="w-4 h-[1.5px] bg-[#D1B995]" />
              <span>{t.heroTagline}</span>
              <span className="text-[#F7F5F0]/40">·</span>
              <span className="inline-flex items-center gap-1 text-[#F7F5F0]/90">
                <MapPin className="w-3 h-3 text-[#D1B995]" />
                {currentLang === 'ar' ? 'القاهرة ومصر' : 'Cairo & Egypt'}
              </span>
            </div>

            {/* Headline with clean drop shadow */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-[2.75rem] font-bold tracking-tight text-[#F7F5F0] leading-[1.2] text-balance drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              {t.heroHeadline}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-[#F7F5F0]/95 leading-relaxed max-w-2xl font-normal drop-shadow-[0_1px_6px_rgba(0,0,0,0.7)]">
              {t.heroSubheadline}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1 w-full sm:w-auto">
              {/* Primary WhatsApp Booking Button */}
              <a
                href={OFFICIAL_WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenWhatsApp(currentLang === 'ar' ? 'تشطيب شقق متكامل' : 'Full Apartment Fit-Out');
                }}
                title={currentLang === 'ar' ? `واتساب: ${DISPLAY_WHATSAPP_NUMBER}` : `WhatsApp: ${DISPLAY_WHATSAPP_NUMBER}`}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#1F4A3B] bg-[#D1B995] hover:bg-[#E5D1B0] transition-all rounded-xs shadow-md cursor-pointer whitespace-nowrap focus-visible:ring-2 focus-visible:ring-white group"
              >
                <MessageCircle className="w-4 h-4 text-[#1F4A3B] fill-current/20 group-hover:scale-110 transition-transform" />
                <span>{t.heroPrimaryCta}</span>
              </a>

              {/* Secondary Explore Work Button */}
              <a
                href="#inbox-gallery"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 text-xs sm:text-sm font-semibold text-[#F7F5F0] hover:text-[#D1B995] bg-[#152B24]/70 hover:bg-[#152B24] border border-[#F7F5F0]/25 hover:border-[#D1B995] transition-all rounded-xs cursor-pointer whitespace-nowrap backdrop-blur-xs"
              >
                <span>{t.heroSecondaryCta}</span>
                <ArrowIcon className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>

          {/* Right Floating Slide Card & Interactive Controls */}
          <div className="lg:col-span-4 flex flex-col justify-end items-end space-y-4">
            
            {/* Active Slide Architectural Mood Card */}
            <div className="w-full bg-[#152B24]/85 border border-[#D1B995]/30 rounded-xs p-3 sm:p-3.5 backdrop-blur-md shadow-lg text-xs space-y-1.5">
              <div className="flex items-center justify-between text-[#D1B995] text-[10px] uppercase font-mono font-bold tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  {t.slideshowBadge}
                </span>
                <span>
                  0{activeSlide.id} / 0{HERO_SLIDES.length}
                </span>
              </div>
              <p className="font-bold text-xs sm:text-sm text-[#F7F5F0]">
                {currentLang === 'ar' ? activeSlide.titleAr : activeSlide.titleEn}
              </p>
              <p className="text-[11px] text-[#F7F5F0]/75 leading-relaxed line-clamp-2">
                {currentLang === 'ar' ? activeSlide.captionAr : activeSlide.captionEn}
              </p>
              <div className="pt-1.5 border-t border-[#F7F5F0]/10 flex items-center gap-1.5 text-[10px] text-[#D1B995]">
                <Info className="w-3 h-3 shrink-0" />
                <span className="truncate">{t.slideshowDisclaimer}</span>
              </div>
            </div>

            {/* Slideshow Controller Bar */}
            <div className="flex items-center gap-2 bg-[#152B24]/90 border border-[#D1B995]/30 rounded-sm p-1.5 text-xs text-[#F7F5F0] backdrop-blur-sm">
              <button
                onClick={handlePrevSlide}
                className="p-1.5 hover:text-[#D1B995] rounded-xs transition-colors cursor-pointer"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Dots */}
              <div className="flex items-center gap-1.5 px-2">
                {HERO_SLIDES.map((slide, idx) => (
                  <button
                    key={slide.id}
                    onClick={() => setCurrentSlideIndex(idx)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      idx === currentSlideIndex
                        ? 'w-6 bg-[#D1B995]'
                        : 'w-1.5 bg-[#F7F5F0]/40 hover:bg-[#F7F5F0]/70'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={handleNextSlide}
                className="p-1.5 hover:text-[#D1B995] rounded-xs transition-colors cursor-pointer"
                aria-label="Next Slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-1.5 hover:text-[#D1B995] border-l border-[#F7F5F0]/20 pl-2 rtl:border-l-0 rtl:border-r rtl:pl-1.5 rtl:pr-2 transition-colors cursor-pointer"
                aria-label={isPlaying ? t.slideshowPause : t.slideshowPlay}
                title={isPlaying ? t.slideshowPause : t.slideshowPlay}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              </button>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
