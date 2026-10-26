import React from 'react';

interface BrandLogoProps {
  variant?: 'full' | 'compact' | 'monogram-only';
  theme?: 'dark' | 'light';
  className?: string;
  lang?: 'ar' | 'en';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'full',
  theme = 'dark',
  className = '',
  lang = 'ar',
}) => {
  const isLight = theme === 'light';
  const textColor = isLight ? 'text-[#1F4A3B]' : 'text-[#F7F5F0]';
  const subtextColor = isLight ? 'text-[#B89B6A]' : 'text-[#D1B995]';

  // Crisp Geometric MH Architectural Monogram SVG
  const MonogramSVG = (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full fill-current"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E5D1B0" />
          <stop offset="45%" stopColor="#B89B6A" />
          <stop offset="70%" stopColor="#D7C9B2" />
          <stop offset="100%" stopColor="#9B7F51" />
        </linearGradient>
      </defs>
      {/* Geometric architectural M and H tower silhouette */}
      <g fill="url(#goldGrad)">
        {/* Left 'M' wing tower */}
        <polygon points="12,38 28,26 28,82 12,82" />
        <polygon points="28,26 48,46 48,82 32,82 32,46" />
        
        {/* Center / Right 'H' architectural pillar with roofline */}
        <polygon points="48,16 66,32 66,82 48,82" />
        <polygon points="66,32 82,42 82,82 66,82" />

        {/* Arch / connecting negative space detail */}
        <path
          d="M48,58 C48,50 66,50 66,58 L66,82 L48,82 Z"
          fill={theme === 'dark' ? '#1F4A3B' : '#F7F5F0'}
        />

        {/* Precision architectural foundation windows */}
        <rect x="52" y="66" width="4" height="4" fill="url(#goldGrad)" rx="0.5" />
        <rect x="58" y="66" width="4" height="4" fill="url(#goldGrad)" rx="0.5" />
        <rect x="52" y="73" width="4" height="4" fill="url(#goldGrad)" rx="0.5" />
        <rect x="58" y="73" width="4" height="4" fill="url(#goldGrad)" rx="0.5" />
      </g>
    </svg>
  );

  if (variant === 'monogram-only') {
    return (
      <div className={`relative inline-flex items-center justify-center ${className}`}>
        <div className="w-10 h-10">{MonogramSVG}</div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-3 ${className}`}>
        <div className="w-9 h-9 shrink-0">{MonogramSVG}</div>
        <div className="flex flex-col">
          <span className={`text-base font-bold tracking-[0.12em] uppercase font-['Plus_Jakarta_Sans'] ${textColor} whitespace-nowrap leading-none`}>
            MOHAMED HOSNY
          </span>
          <span className={`text-[9px] tracking-[0.2em] uppercase font-medium mt-1 ${subtextColor} whitespace-nowrap leading-none`}>
            {lang === 'ar' ? 'تشطيبات وتصميم داخلي' : 'CONSTRUCTION & DESIGN'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-3.5 ${className}`}>
      <div className="w-11 h-11 shrink-0 drop-shadow-sm">{MonogramSVG}</div>
      <div className="flex flex-col justify-center">
        <span className={`text-lg font-bold tracking-[0.14em] uppercase font-['Plus_Jakarta_Sans'] ${textColor} whitespace-nowrap leading-tight`}>
          MOHAMED HOSNY
        </span>
        <span className={`text-[10px] tracking-[0.24em] uppercase font-semibold mt-0.5 ${subtextColor} whitespace-nowrap leading-none`}>
          CONSTRUCTION & INTERIOR DESIGN
        </span>
      </div>
    </div>
  );
};
