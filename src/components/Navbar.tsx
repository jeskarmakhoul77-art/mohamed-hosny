import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { BrandLogo } from './BrandLogo';
import { Globe, Menu, X, MessageCircle } from 'lucide-react';

interface NavbarProps {
  currentLang: Language;
  onToggleLang: () => void;
  onOpenWhatsApp: (serviceName?: string) => void;
  onOpenMediaSlots?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLang,
  onToggleLang,
  onOpenWhatsApp,
  onOpenMediaSlots
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = translations[currentLang];

  const navLinks = [
    { href: '#services', label: t.navServices },
    { href: '#apartment-case-study', label: t.navApartment },
    { href: '#portfolio', label: t.navPortfolio },
    { href: '#videos', label: t.navVideos },
    { href: '#inbox-gallery', label: t.navInboxGallery },
    { href: '#process', label: t.navProcess },
    { href: '#about', label: t.navAbout },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#1F4A3B]/95 backdrop-blur-md border-b border-[#D1B995]/20 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-20">
          {/* Zone 1: Brand Wordmark & Geometric Monogram */}
          <a
            href="#"
            className="flex items-center gap-3 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D1B995] rounded-sm py-1"
            aria-label="Mohamed Hosny Home"
          >
            <BrandLogo variant="compact" theme="dark" lang={currentLang} />
          </a>

          {/* Zone 2: Nav Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#F7F5F0]/85">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="whitespace-nowrap shrink-0 hover:text-[#D1B995] transition-colors py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-[#D1B995] hover:after:w-full after:transition-all"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Zone 3: Primary Action & Controls */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Media Manager Link for Authorized Management */}
            {onOpenMediaSlots && (
              <button
                onClick={onOpenMediaSlots}
                className="hidden xl:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#D1B995] hover:text-white bg-[#152B24] border border-[#D1B995]/40 hover:border-[#D1B995] rounded-sm transition-colors whitespace-nowrap cursor-pointer shadow-xs"
                title={currentLang === 'ar' ? 'إدارة صور وفيديوهات الموقع' : 'Manage project media'}
              >
                <span>{currentLang === 'ar' ? 'مدير الوسائط' : 'Media Manager'}</span>
              </button>
            )}

            {/* Language Switcher */}
            <button
              onClick={onToggleLang}
              className="inline-flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold text-[#F7F5F0] hover:text-[#D1B995] bg-[#152B24] border border-[#D1B995]/25 hover:border-[#D1B995] rounded-sm transition-colors whitespace-nowrap cursor-pointer focus-visible:ring-2 focus-visible:ring-[#D1B995]"
              aria-label="Switch Language"
            >
              <Globe className="w-3.5 h-3.5 text-[#D1B995]" />
              <span className="font-sans uppercase">{currentLang === 'ar' ? 'English' : 'عربي'}</span>
            </button>

            {/* Primary Action Button -> Direct WhatsApp Booking */}
            <button
              onClick={() => onOpenWhatsApp(currentLang === 'ar' ? 'تشطيب شقق متكامل' : 'Full Apartment Fit-Out')}
              className="hidden sm:inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold tracking-wide uppercase text-[#1F4A3B] bg-[#D1B995] hover:bg-[#E5D1B0] transition-colors rounded-sm shadow-sm whitespace-nowrap cursor-pointer focus-visible:ring-2 focus-visible:ring-white"
            >
              <MessageCircle className="w-4 h-4 fill-current/20" />
              <span>{t.bookSiteVisitBtn}</span>
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#F7F5F0] hover:text-[#D1B995] focus-visible:ring-2 focus-visible:ring-[#D1B995] rounded-sm"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#152B24] border-b border-[#D1B995]/20 px-6 py-6 space-y-4 shadow-xl">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-[#F7F5F0] hover:text-[#D1B995] py-1 border-b border-[#F7F5F0]/5"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="pt-2 flex flex-col gap-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenWhatsApp(currentLang === 'ar' ? 'تشطيب شقق متكامل' : 'Full Apartment Fit-Out');
              }}
              className="w-full py-3 text-center text-xs font-bold uppercase tracking-wider text-[#1F4A3B] bg-[#D1B995] hover:bg-[#E5D1B0] rounded-sm flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 fill-current/20" />
              <span>{t.bookViaWhatsApp}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
