import React from 'react';
import { MediaManagerModal } from './MediaManager/MediaManagerModal';
import { ApartmentStageSlot, Language, PortfolioSlot, VideoSlot } from '../types';

interface MediaSlotsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
  apartmentStages: ApartmentStageSlot[];
  portfolioSlots: PortfolioSlot[];
  videoSlots: VideoSlot[];
  onRefreshData: () => void;
}

export const MediaSlotsModal: React.FC<MediaSlotsModalProps> = (props) => {
  return <MediaManagerModal {...props} />;
};
