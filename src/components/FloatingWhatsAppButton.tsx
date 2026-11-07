import React from 'react';
import { Language } from '../types';
import { DISPLAY_WHATSAPP_NUMBER, OFFICIAL_WHATSAPP_LINK } from '../config/businessConfig';
import { MessageCircle } from 'lucide-react';

interface FloatingWhatsAppButtonProps {
  currentLang: Language;
  onOpenWhatsApp: (serviceName?: string) => void;
}

export const FloatingWhatsAppButton: React.FC<FloatingWhatsAppButtonProps> = ({
  currentLang,
  onOpenWhatsApp
}) => {
  const isRtl = currentLang === 'ar';

  return (
    <aside
      aria-label={isRtl ? 'زر واتساب للتواصل المباشر' : 'Direct WhatsApp Floating Button'}
      className="fixed bottom-6 end-6 z-40 flex items-center group animate-fadeIn"
    >
      <a
        href={OFFICIAL_WHATSAPP_LINK}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          e.preventDefault();
          onOpenWhatsApp(isRtl ? 'استفسار عام عبر واتساب' : 'General WhatsApp Inquiry');
        }}
        className="flex items-center gap-2.5 px-4 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full shadow-2xl hover:shadow-[0_8px_30px_rgb(37,211,102,0.45)] transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer border-2 border-white/30 backdrop-blur-xs focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/40"
        title={isRtl ? `تواصل عبر واتساب: ${DISPLAY_WHATSAPP_NUMBER}` : `WhatsApp: ${DISPLAY_WHATSAPP_NUMBER}`}
      >
        {/* Pulsing indicator & WhatsApp Icon */}
        <div className="relative flex items-center justify-center">
          <span className="absolute -top-1 -end-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
          </span>
          <MessageCircle className="w-6 h-6 fill-current text-white" />
        </div>

        {/* Text & Visible Phone Number */}
        <div className="flex flex-col text-start leading-none">
          <span className="text-[11px] font-medium tracking-wide text-white/90">
            {isRtl ? 'تواصل عبر واتساب' : 'Chat on WhatsApp'}
          </span>
          <span
            className="text-xs font-bold font-mono text-white tracking-wider mt-0.5"
            dir="ltr"
          >
            {DISPLAY_WHATSAPP_NUMBER}
          </span>
        </div>
      </a>
    </aside>
  );
};
