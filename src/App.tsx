/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Language, ApartmentStageSlot, PortfolioSlot, VideoSlot } from './types';
import {
  getStoredApartmentStages,
  getStoredPortfolioSlots,
  getStoredVideoSlots
} from './services/bookingStorage';
import { fetchAndApplyRemoteManifest } from './services/mediaStorage';
import {
  getStoredWhatsAppNumber,
  buildWhatsAppLink,
  BUSINESS_CONFIG
} from './config/businessConfig';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { MeetOwnerSection } from './components/MeetOwnerSection';
import { ApartmentCaseStudy } from './components/ApartmentCaseStudy';
import { PortfolioSection } from './components/PortfolioSection';
import { VideoLibrary } from './components/VideoLibrary';
import { ServicesSection } from './components/ServicesSection';
import { ProjectProcess } from './components/ProjectProcess';
import { AboutSection } from './components/AboutSection';
import { EngineerProfileSection } from './components/EngineerProfileSection';
import { SiteInspectionFeeSection } from './components/SiteInspectionFeeSection';
import { Footer } from './components/Footer';
import { WhatsAppConfigModal } from './components/WhatsAppConfigModal';
import { MediaSlotsModal } from './components/MediaSlotsModal';
import { PolicyModal } from './components/PolicyModal';
import { ImageModal } from './components/ImageModal';

export default function App() {
  // Language State with localStorage persistence (Default to Arabic as primary Egyptian market)
  const [currentLang, setCurrentLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('mh_lang_pref');
      return saved === 'en' ? 'en' : 'ar';
    } catch {
      return 'ar';
    }
  });

  // Keep <html> dir and lang synced
  useEffect(() => {
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    try {
      localStorage.setItem('mh_lang_pref', currentLang);
    } catch {
      // ignore
    }
  }, [currentLang]);

  const toggleLanguage = useCallback(() => {
    setCurrentLang((prev) => (prev === 'ar' ? 'en' : 'ar'));
  }, []);

  // Visual Slots State (45 photos + 5 videos)
  const [apartmentStages, setApartmentStages] = useState<ApartmentStageSlot[]>(() =>
    getStoredApartmentStages()
  );
  const [portfolioSlots, setPortfolioSlots] = useState<PortfolioSlot[]>(() =>
    getStoredPortfolioSlots()
  );
  const [videoSlots, setVideoSlots] = useState<VideoSlot[]>(() =>
    getStoredVideoSlots()
  );

  // Synchronize latest manifest from server / Supabase on boot so any visitor sees uploaded media
  useEffect(() => {
    fetchAndApplyRemoteManifest()
      .then((res) => {
        setApartmentStages(res.apartment);
        setPortfolioSlots(res.portfolio);
        setVideoSlots(res.videos);
      })
      .catch((err) => {
        console.warn('Could not sync remote media manifest', err);
      });
  }, []);

  const refreshVisualSlots = useCallback(() => {
    fetchAndApplyRemoteManifest()
      .then((res) => {
        setApartmentStages(res.apartment);
        setPortfolioSlots(res.portfolio);
        setVideoSlots(res.videos);
      })
      .catch(() => {
        setApartmentStages(getStoredApartmentStages());
        setPortfolioSlots(getStoredPortfolioSlots());
        setVideoSlots(getStoredVideoSlots());
      });
  }, []);

  // Modals state
  const [isConfigWhatsAppOpen, setIsConfigWhatsAppOpen] = useState(false);
  const [isMediaSlotsOpen, setIsMediaSlotsOpen] = useState(false);
  const [policyType, setPolicyType] = useState<'site_visit' | 'refund' | 'privacy' | null>(null);

  // Single Image Zoom Modal
  const [imageModalData, setImageModalData] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    imageUrl?: string;
  }>({
    isOpen: false,
    title: '',
    description: ''
  });

  const handleOpenImageModal = (title: string, description: string, imageUrl?: string) => {
    setImageModalData({
      isOpen: true,
      title,
      description,
      imageUrl
    });
  };

  /**
   * Unified WhatsApp opener:
   * Generates a prefilled bilingual message with contextual service name and optional
   * client fields (name, location, property type, area, current stage, and inspection fee acknowledgment).
   */
  const handleOpenWhatsApp = useCallback((serviceName?: string) => {
    const currentNumber = getStoredWhatsAppNumber();
    if (!currentNumber || currentNumber.trim() === '') {
      setIsConfigWhatsAppOpen(true);
      return;
    }

    const url = buildWhatsAppLink({
      serviceName,
      lang: currentLang
    });

    window.open(url, '_blank', 'noopener,noreferrer');
  }, [currentLang]);

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#242424] flex flex-col font-sans selection:bg-[#D1B995]/30 selection:text-[#1F4A3B]">
      {/* 1. Header Navigation with 3-Zone Contract & Direct WhatsApp CTA */}
      <Navbar
        currentLang={currentLang}
        onToggleLang={toggleLanguage}
        onOpenWhatsApp={handleOpenWhatsApp}
        onOpenMediaSlots={() => setIsMediaSlotsOpen(true)}
      />

      <main className="flex-1">
        {/* 2. Hero Section with Cinematic Architectural Slideshow & Direct WhatsApp CTA */}
        <Hero
          currentLang={currentLang}
          onOpenWhatsApp={handleOpenWhatsApp}
        />

        {/* 3. Introduction Video (Directly Below Hero — Slot 1) */}
        <MeetOwnerSection
          currentLang={currentLang}
          videoSlot={videoSlots[0]}
          onOpenWhatsApp={handleOpenWhatsApp}
        />

        {/* 4. Core Services (11 specialized services, each wired to WhatsApp) */}
        <ServicesSection
          currentLang={currentLang}
          onOpenWhatsApp={handleOpenWhatsApp}
        />

        {/* 5. Featured Project — Apartment from Start to Finish (5 Designated Stages) */}
        <ApartmentCaseStudy
          currentLang={currentLang}
          stages={apartmentStages}
          onOpenWhatsApp={handleOpenWhatsApp}
          onSelectImage={handleOpenImageModal}
        />

        {/* 6. Main Portfolio — Exactly 40 Designated Image Slots across 8 Categories */}
        <PortfolioSection
          currentLang={currentLang}
          slots={portfolioSlots}
          onOpenWhatsApp={handleOpenWhatsApp}
        />

        {/* 7. Video Library — Exactly 5 Designated Video Slots */}
        <VideoLibrary
          currentLang={currentLang}
          videoSlots={videoSlots}
          onOpenBooking={() => handleOpenWhatsApp(currentLang === 'ar' ? 'فيديوهات المشاريع والمعاينة' : 'Project Video Inquiry')}
        />

        {/* 8. Project Process (7 Sequential Stages) */}
        <ProjectProcess currentLang={currentLang} />

        {/* 9. About Mohamed Hosny & Operating Pillars */}
        <AboutSection currentLang={currentLang} />

        {/* 10. Engineering Leadership & Official Certificate — Eng. Mohamed Hosny */}
        <EngineerProfileSection
          currentLang={currentLang}
          onOpenWhatsApp={handleOpenWhatsApp}
          onSelectImage={handleOpenImageModal}
        />

        {/* 11. Dedicated Site Inspection Fee Section (Immediately before Footer) */}
        <SiteInspectionFeeSection
          currentLang={currentLang}
          onOpenWhatsApp={handleOpenWhatsApp}
        />
      </main>

      {/* 11. Refined Architectural Footer with Media Slots Directory Link */}
      <Footer
        currentLang={currentLang}
        onToggleLang={toggleLanguage}
        onOpenWhatsApp={handleOpenWhatsApp}
        onOpenPolicy={(type) => setPolicyType(type)}
        onOpenConfigWhatsApp={() => setIsConfigWhatsAppOpen(true)}
        onOpenMediaSlotsModal={() => setIsMediaSlotsOpen(true)}
      />

      {/* Modals */}
      <WhatsAppConfigModal
        isOpen={isConfigWhatsAppOpen}
        onClose={() => setIsConfigWhatsAppOpen(false)}
        currentLang={currentLang}
      />

      <MediaSlotsModal
        isOpen={isMediaSlotsOpen}
        onClose={() => setIsMediaSlotsOpen(false)}
        currentLang={currentLang}
        apartmentStages={apartmentStages}
        portfolioSlots={portfolioSlots}
        videoSlots={videoSlots}
        onRefreshData={refreshVisualSlots}
      />

      <PolicyModal
        isOpen={policyType !== null}
        onClose={() => setPolicyType(null)}
        currentLang={currentLang}
        policyType={policyType || 'site_visit'}
      />

      <ImageModal
        isOpen={imageModalData.isOpen}
        onClose={() => setImageModalData((prev) => ({ ...prev, isOpen: false }))}
        title={imageModalData.title}
        description={imageModalData.description}
        imageUrl={imageModalData.imageUrl}
      />
    </div>
  );
}
