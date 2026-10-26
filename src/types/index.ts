/**
 * Types for Mohamed Hosny — Construction & Interior Design
 */

export type Language = 'ar' | 'en';

export type ProjectType = 'apartment' | 'villa' | 'shop' | 'office' | 'other';

export type PortfolioCategory =
  | 'plumbing'
  | 'electrical'
  | 'plastering'
  | 'ceramics'
  | 'gypsum'
  | 'painting'
  | 'interior'
  | 'commercial';

export interface ApartmentStageSlot {
  stageNumber: 1 | 2 | 3 | 4 | 5;
  slotKey: string; // e.g. 'apartment-stage-01'
  defaultFilePath: string; // e.g. '/assets/projects/apartment/stage-01.jpg'
  titleAr: string;
  titleEn: string;
  phaseLabelAr: string;
  phaseLabelEn: string;
  descriptionAr: string;
  descriptionEn: string;
  imageUrl?: string;
  isPlaceholder: boolean;
  notes?: string;
}

export interface PortfolioSlot {
  id: number; // 1 to 40
  slotKey: string; // e.g. 'plumbing-01', 'plumbing-02'
  defaultFilePath: string; // e.g. '/assets/projects/plumbing/plumbing-01.jpg'
  category: PortfolioCategory;
  categoryLabelAr: string;
  categoryLabelEn: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  imageUrl?: string;
  isPlaceholder: boolean;
}

export type VideoSlotType =
  | 'owner_intro'
  | 'client_interview'
  | 'finishing_process'
  | 'completed_apartment'
  | 'commercial_project';

export interface VideoSlot {
  id: 1 | 2 | 3 | 4 | 5;
  slotKey: string; // e.g. 'video-01-owner-intro'
  defaultFilePath: string; // e.g. '/assets/videos/video-01-owner-intro.mp4'
  slotType: VideoSlotType;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  posterUrl?: string;
  videoUrl?: string;
  isAvailable: boolean;
  notesAr: string;
  notesEn: string;
}

export interface BusinessConfig {
  brandName: string;
  descriptorEn: string;
  descriptorAr: string;
  brandLineEn: string;
  brandLineAr: string;
  siteVisitFeeEgp: number;
  whatsappNumber: string;
  instapayAddress: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankIban: string;
  bankName: string;
  serviceAreaAr: string;
  serviceAreaEn: string;
  email: string;
}
