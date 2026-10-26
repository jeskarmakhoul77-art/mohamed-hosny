import React from 'react';
import { X } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  imageUrl?: string;
}

export const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  imageUrl
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full bg-[#152B24] border border-[#D1B995]/40 rounded-sm overflow-hidden text-[#F7F5F0] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#D1B995]/20 bg-[#0D1A16]">
          <h4 className="text-sm font-bold text-[#D1B995]">{title}</h4>
          <button onClick={onClose} className="p-1 text-[#F7F5F0]/70 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-hidden bg-black flex items-center justify-center">
          {imageUrl ? (
            <img src={imageUrl} alt={title} className="max-h-[70vh] w-auto object-contain" />
          ) : (
            <div className="p-12 text-center text-xs text-[#D1B995]">
              خانة مخصصة لرفع الصورة الأصلية
            </div>
          )}
        </div>

        <div className="p-4 bg-[#1F4A3B] border-t border-[#D1B995]/20">
          <p className="text-xs text-[#F7F5F0]/80">{description}</p>
        </div>
      </div>
    </div>
  );
};
