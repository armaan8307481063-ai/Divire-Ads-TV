import React, { useState } from 'react';

interface DivireLogoProps {
  variant?: 'full' | 'compact' | 'monogram' | 'typography';
  className?: string;
  light?: boolean;
}

const OFFICIAL_LOGO_SRC = '/Images/photo-output.jpeg';
const FALLBACK_LOGO_SRC = '/logo.jpg';

export const DivireLogo: React.FC<DivireLogoProps> = ({
  variant = 'compact',
  className = '',
  light = false,
}) => {
  const [currentSrc, setCurrentSrc] = useState(OFFICIAL_LOGO_SRC);
  const [imageError, setImageError] = useState(false);

  // Exact true logo color theme
  const brandGreen = light ? '#FFFFFF' : '#1C4E19';
  const brandGold = '#D9A51B';
  const brandTagline = light ? '#E5E7EB' : '#1F2937';

  const handleImgError = () => {
    if (currentSrc !== FALLBACK_LOGO_SRC) {
      setCurrentSrc(FALLBACK_LOGO_SRC);
    } else {
      setImageError(true);
    }
  };

  // Typography-only lockup written in the exact font & colors of the true logo, centered
  const renderTypographyLockup = () => (
    <div className="flex flex-col items-center justify-center text-center select-none">
      {/* Brand Title centered with symmetrical Gold Hyphen Accents */}
      <div className="flex items-center justify-center gap-2 w-full text-center">
        <span
          className="w-3.5 sm:w-5 h-[2px] rounded-full inline-block"
          style={{ backgroundColor: brandGold }}
          aria-hidden="true"
        />
        <span className="text-xl sm:text-2xl font-black tracking-wider leading-none whitespace-nowrap text-center">
          <span style={{ color: brandGreen }}>DIVIRE </span>
          <span style={{ color: brandGold }}>ADS </span>
          <span style={{ color: brandGreen }}>TV</span>
        </span>
        <span
          className="w-3.5 sm:w-5 h-[2px] rounded-full inline-block"
          style={{ backgroundColor: brandGold }}
          aria-hidden="true"
        />
      </div>

      {/* Tagline centered directly beneath in True Logo Font and Colors */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-1.5 w-full text-center">
        <span
          className="w-2.5 sm:w-3.5 h-[1.5px] rounded-full inline-block"
          style={{ backgroundColor: brandGold }}
          aria-hidden="true"
        />
        <span
          className="text-[9px] sm:text-[10px] font-semibold tracking-[0.25em] uppercase whitespace-nowrap leading-none text-center"
          style={{ color: brandTagline }}
        >
          Connecting Through Creativity
        </span>
        <span
          className="w-2.5 sm:w-3.5 h-[1.5px] rounded-full inline-block"
          style={{ backgroundColor: brandGold }}
          aria-hidden="true"
        />
      </div>
    </div>
  );

  // Fallback SVG icon if image fails
  const renderSvgEmblem = () => (
    <svg
      viewBox="0 0 160 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-12 h-11 shrink-0 drop-shadow-sm"
      aria-hidden="true"
    >
      <line x1="88" y1="52" x2="81" y2="38" stroke={brandGreen} strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="80" cy="36" r="3" fill={brandGreen} />
      <line x1="96" y1="52" x2="105" y2="34" stroke={brandGreen} strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="106" cy="33" r="3" fill={brandGreen} />
      <rect x="78" y="52" width="62" height="46" rx="8" stroke={brandGreen} strokeWidth="7" fill="none" />
      <path
        d="M26 36 H52 C68 36 78 48 78 64 C78 78 67 92 51 92 H26 V36 Z M40 50 V78 H50 C58 78 63 72 63 64 C63 56 58 50 50 50 H40 Z"
        fill={brandGreen}
      />
      <path d="M26 92 L50 48 L64 74 C58 70 48 76 43 83 L34 92 H26 Z" fill={brandGold} />
      <path d="M26 92 C42 85 70 65 112 36 C92 48 65 72 44 92 H26 Z" fill={brandGold} />
      <path d="M110 24 C116 27 122 34 125 42" stroke={brandGold} strokeWidth="5" strokeLinecap="round" />
      <path d="M118 16 C128 21 136 30 141 42" stroke={brandGold} strokeWidth="5" strokeLinecap="round" />
    </svg>
  );

  // Typography-only variant
  if (variant === 'typography') {
    return <div className={`flex items-center ${className}`}>{renderTypographyLockup()}</div>;
  }

  // Compact variant for Header Navigation (with Emblem + Written Brand Name)
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-3 sm:gap-4 py-1 ${className}`}>
        {/* Emblem from True Logo with original image background and rounded card frame */}
        <div className="relative h-12 w-12 sm:h-14 sm:w-14 rounded-2xl overflow-hidden shrink-0 bg-white p-1 shadow-xs border border-neutral-100 flex items-center justify-center">
          {!imageError ? (
            <img
              src={currentSrc}
              alt="Divire Ads TV Logo"
              className="w-full h-full object-cover object-top scale-125"
              referrerPolicy="no-referrer"
              onError={handleImgError}
              loading="eager"
            />
          ) : (
            renderSvgEmblem()
          )}
        </div>

        {/* Name of marketing agency written in the exact font and colour theme */}
        {renderTypographyLockup()}
      </div>
    );
  }

  // Monogram badge variant
  if (variant === 'monogram') {
    return (
      <div className={`relative h-12 w-12 rounded-xl overflow-hidden shrink-0 bg-white p-1 shadow-2xs border border-neutral-100 ${className}`}>
        {!imageError ? (
          <img
            src={currentSrc}
            alt="Divire Ads TV Emblem"
            className="w-full h-full object-cover object-top scale-125"
            referrerPolicy="no-referrer"
            onError={handleImgError}
          />
        ) : (
          renderSvgEmblem()
        )}
      </div>
    );
  }

  // Full prominent logo variant for Footer and Modals
  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      <div className="relative w-48 sm:w-60 h-auto rounded-3xl overflow-hidden p-3 bg-white shadow-2xl border border-white/30 mb-5 flex items-center justify-center transition-all duration-300 hover:scale-103">
        {!imageError ? (
          <img
            src={currentSrc}
            alt="Divire Ads TV - Official Brand Logo"
            className="w-full h-auto object-contain rounded-2xl drop-shadow-xs"
            referrerPolicy="no-referrer"
            onError={handleImgError}
            loading="eager"
          />
        ) : (
          renderSvgEmblem()
        )}
      </div>

      {/* Styled brand name in true colors */}
      {renderTypographyLockup()}
    </div>
  );
};
