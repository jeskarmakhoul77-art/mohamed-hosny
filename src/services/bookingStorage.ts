import { ApartmentStageSlot, PortfolioSlot, VideoSlot } from '../types';
import {
  getSavedApartmentStages,
  saveLocalApartmentStages,
  getSavedPortfolioSlots,
  saveLocalPortfolioSlots,
  getSavedVideoSlots,
  saveLocalVideoSlots,
  clearAllMediaBlobs
} from './mediaStorage';

export function getStoredApartmentStages(): ApartmentStageSlot[] {
  return getSavedApartmentStages();
}

export function saveApartmentStages(stages: ApartmentStageSlot[]): void {
  saveLocalApartmentStages(stages);
}

export function getStoredPortfolioSlots(): PortfolioSlot[] {
  return getSavedPortfolioSlots();
}

export function savePortfolioSlots(slots: PortfolioSlot[]): void {
  saveLocalPortfolioSlots(slots);
}

export function getStoredVideoSlots(): VideoSlot[] {
  return getSavedVideoSlots();
}

export function saveVideoSlots(slots: VideoSlot[]): void {
  saveLocalVideoSlots(slots);
}

export function resetAllMediaOverrides(): void {
  try {
    localStorage.removeItem('mh_apartment_override_v2');
    localStorage.removeItem('mh_portfolio_override_v2');
    localStorage.removeItem('mh_videos_override_v2');
    localStorage.removeItem('mh_apartment_override_v3');
    localStorage.removeItem('mh_portfolio_override_v3');
    localStorage.removeItem('mh_videos_override_v3');
    clearAllMediaBlobs();
  } catch {
    // ignore
  }
}
