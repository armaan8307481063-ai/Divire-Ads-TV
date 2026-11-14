import React from 'react';

export const BrandTaglineStrip: React.FC = () => {
  return (
    <section className="bg-white py-5 sm:py-6 border-y border-neutral-100 overflow-hidden" aria-label="Brand Motto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-3 sm:gap-6 text-center">
          {/* Subtle gold line on left */}
          <div className="hidden sm:block flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#D9A51B]/60 to-[#D9A51B]" />
          
          <div className="flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm md:text-base font-semibold tracking-wide sm:tracking-widest uppercase">
            <img
              src="/logo.jpg"
              alt="Divire Ads TV"
              className="h-7 sm:h-8 w-auto object-contain rounded-md shadow-2xs bg-white"
              referrerPolicy="no-referrer"
            />
            <span className="text-[#28651B]">DIVIRE</span>
            <span className="text-[#D9A51B] font-extrabold">ADS</span>
            <span className="text-[#28651B]">TV</span>
            <span className="text-[#D9A51B] mx-1" aria-hidden="true">—</span>
            <span className="text-neutral-700 font-medium tracking-normal sm:tracking-wider normal-case sm:uppercase">
              Connecting Through Creativity
            </span>
          </div>

          {/* Subtle gold line on right */}
          <div className="hidden sm:block flex-1 h-[1px] bg-gradient-to-l from-transparent via-[#D9A51B]/60 to-[#D9A51B]" />
        </div>
      </div>
    </section>
  );
};
