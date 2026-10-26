import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { HERO_SLIDES, HeroSlide } from '../config/businessConfig';
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
  const slideIntervalRef = useRef<number | null>(null);

  // Auto-advance slides every 5.5 seconds if playing
  useEffect(() => {
    if (!isPlaying) {
      if (slideIntervalRef.current) clearInterval(slideIntervalRef.current);
      return;
    }

    slideIntervalRef.current = window.setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500);

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

  return (
    <section className="relative overflow-hidden bg-[#152B24] text-[#F7F5F0] min-h-[580px] lg:min-h-[640px] flex items-center border-b border-[#D1B995]/25">
      {/* 1. Cinematic Background Slideshow Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        {HERO_SLIDES.map((slide, index) => {
          const isActive = index === currentSlideIndex;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <img
                src={slide.imageUrl}
                alt={currentLang === 'ar' ? slide.titleAr : slide.titleEn}
                className={`w-full h-full object-cover object-center transform transition-transform duration-[7000ms] ease-out motion-reduce:transform-none ${
                  isActive ? 'scale-105' : 'scale-100'
                }`}
                loading={index === 0 ? 'eager' : 'lazy'}
                referrerPolicy="no-referrer"
              />
            </div>
          );
        })}

        {/* Architectural Vignette & Text Scrim Overlay — Lighter to reveal craftsmanship */}
        <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#152B24] via-[#152B24]/40 to-[#152B24]/20" />
        <div className="absolute inset-0 z-20 bg-gradient-to-r rtl:bg-gradient-to-l from-[#152B24]/90 via-[#152B24]/50 to-transparent" />
      </div>

      {/* 2. Main Hero Foreground Content */}
      <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Main Editorial Text Column */}
          <div className="lg:col-span-8 flex flex-col items-start space-y-6">
            
            {/* Architectural Kicker & Service Area */}
            <div className="inline-flex flex-wrap items-center gap-2.5 text-xs font-semibold tracking-wider uppercase text-[#D1B995] bg-[#152B24]/80 px-3.5 py-1.5 rounded-sm border border-[#D1B995]/30 backdrop-blur-sm">
              <span className="w-5 h-[1.5px] bg-[#D1B995]" />
              <span>{t.heroTagline}</span>
              <span className="text-[#F7F5F0]/40">·</span>
              <span className="inline-flex items-center gap-1 text-[#F7F5F0]/90">
                <MapPin className="w-3 h-3 text-[#D1B995]" />
                {currentLang === 'ar' ? 'القاهرة ومصر' : 'Cairo & Egypt'}
              </span>
            </div>

            {/* Headline with clean drop shadow */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#F7F5F0] leading-[1.2] text-balance drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)]">
              {t.heroHeadline}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#F7F5F0] leading-relaxed max-w-2xl font-light drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)]">
              {t.heroSubheadline}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2 w-full sm:w-auto">
              {/* Primary WhatsApp Booking Button */}
              <button
                onClick={() => onOpenWhatsApp(currentLang === 'ar' ? 'تشطيب شقق متكامل' : 'Full Apartment Fit-Out')}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 text-sm font-bold uppercase tracking-wider text-[#1F4A3B] bg-[#D1B995] hover:bg-[#E5D1B0] transition-all rounded-sm shadow-lg cursor-pointer whitespace-nowrap focus-visible:ring-2 focus-visible:ring-white group"
              >
                <MessageCircle className="w-5 h-5 text-[#1F4A3B] fill-current/20 group-hover:scale-110 transition-transform" />
                <span>{t.heroPrimaryCta}</span>
              </button>

              {/* Secondary Explore Work Button */}
              <a
                href="#apartment-case-study"
                className="inline-flex items-center justify-center gap-2 px-6 py-4 text-sm font-semibold text-[#F7F5F0] hover:text-[#D1B995] bg-[#152B24]/60 hover:bg-[#152B24] border border-[#F7F5F0]/25 hover:border-[#D1B995] transition-all rounded-sm cursor-pointer whitespace-nowrap backdrop-blur-xs"
              >
                <span>{t.heroSecondaryCta}</span>
                <ArrowIcon className="w-4 h-4" />
              </a>
            </div>

          </div>

          {/* Right Floating Slide Card & Interactive Controls */}
          <div className="lg:col-span-4 flex flex-col justify-end items-end space-y-4">
            
            {/* Active Slide Architectural Mood Card */}
            <div className="w-full bg-[#152B24]/85 border border-[#D1B995]/30 rounded-sm p-4 backdrop-blur-md shadow-xl text-xs space-y-2">
              <div className="flex items-center justify-between text-[#D1B995] text-[10px] uppercase font-mono font-bold tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  {t.slideshowBadge}
                </span>
                <span>
                  0{activeSlide.id} / 0{HERO_SLIDES.length}
                </span>
              </div>
              <p className="font-bold text-sm text-[#F7F5F0]">
                {currentLang === 'ar' ? activeSlide.titleAr : activeSlide.titleEn}
              </p>
              <p className="text-[11px] text-[#F7F5F0]/70 leading-relaxed">
                {currentLang === 'ar' ? activeSlide.captionAr : activeSlide.captionEn}
              </p>
              <div className="pt-2 border-t border-[#F7F5F0]/10 flex items-center gap-1.5 text-[10px] text-[#D1B995]">
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
