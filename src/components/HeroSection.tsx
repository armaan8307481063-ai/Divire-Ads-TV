import React from 'react';
import { Share2, Video, Target, ArrowRight, MessageCircle, Sparkles, Globe } from 'lucide-react';
import { useSiteContent } from '../context/SiteContentContext.js';

interface HeroSectionProps {
  onFillFormClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onFillFormClick }) => {
  const { content } = useSiteContent();
  const hero = content?.hero;

  const eyebrow = hero?.eyebrow || 'Marketing Agency';
  const headlineStart = hero?.headlineStart || 'Turn Your Brand Into a';
  const headlineHighlight = hero?.headlineHighlight || 'Business';
  const headlineEnd = hero?.headlineEnd || 'People Remember.';
  const description = hero?.description || 'Creative content, social media growth & strategic marketing for ambitious brands.';
  const primaryCta = hero?.primaryCtaText || 'Get Started';
  const heroImg = hero?.heroImage || '/src/assets/images/hero_digital_marketing_1791888552925.jpg';
  const whatsappUrl = content?.socialLinks?.whatsapp || "https://wa.me/918307481063?text=Hi%20Divire%20Ads%20TV,%20I'd%20like%20to%20discuss%20marketing%20for%20my%20brand.";

  // Service cards from content.services (top 3)
  const topServices = (content?.services && content.services.length > 0)
    ? content.services.slice(0, 3)
    : [
        { id: '1', title: 'Social Media', shortDesc: 'Grow your audience. Boost your presence.', iconName: 'Share2' },
        { id: '2', title: 'Creative Content', shortDesc: 'Scroll-stopping content that gets results.', iconName: 'Video' },
        { id: '3', title: 'Brand Strategy', shortDesc: 'Smart strategies for long-term growth.', iconName: 'Target' },
      ];

  const renderIcon = (name: string) => {
    switch (name) {
      case 'Video':
        return <Video className="w-5 h-5 text-[#D9A51B]" />;
      case 'Target':
        return <Target className="w-5 h-5 text-[#D9A51B]" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-[#D9A51B]" />;
      case 'Globe':
        return <Globe className="w-5 h-5 text-[#D9A51B]" />;
      default:
        return <Share2 className="w-5 h-5 text-[#D9A51B]" />;
    }
  };

  return (
    <section id="home" className="relative pt-8 pb-16 lg:pt-14 lg:pb-20 overflow-hidden bg-white">
      {/* Subtle organic green background accent shapes */}
      <div
        className="absolute top-10 right-0 -z-10 w-96 h-96 bg-[#28651B]/5 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-10 left-0 -z-10 w-80 h-80 bg-[#D9A51B]/5 rounded-full blur-2xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Two-Column Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-6">
            
            {/* Eyebrow & Golden Divider */}
            <div className="inline-flex flex-col items-start space-y-1.5">
              <span className="text-xs font-semibold tracking-[0.25em] text-[#28651B] uppercase">
                {eyebrow}
              </span>
              <div className="w-full h-0.5 bg-[#D9A51B] rounded-full" />
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-bold text-neutral-900 leading-[1.18] tracking-tight">
              {headlineStart}{' '}
              <span className="text-[#D9A51B]">
                {headlineHighlight}
              </span>{' '}
              {headlineEnd}
            </h1>

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg text-neutral-600 leading-relaxed max-w-2xl font-normal">
              {description}
            </p>

            {/* Quick Action CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={onFillFormClick}
                className="inline-flex items-center gap-2 bg-[#28651B] hover:bg-[#1C4813] text-white font-medium text-sm sm:text-base px-6 py-3 rounded-full transition-all duration-150 shadow-sm hover:shadow-md cursor-pointer group"
              >
                <span>{primaryCta}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 border border-[#28651B]/30 hover:border-[#28651B] bg-white text-[#28651B] font-medium text-sm sm:text-base px-5 py-3 rounded-full transition-colors shadow-xs"
              >
                <MessageCircle className="w-4 h-4 text-[#28651B]" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>

            {/* Three Service Cards arranged horizontally on desktop */}
            <div className="w-full pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {topServices.map((srv) => (
                  <div
                    key={srv.id}
                    className="bg-[#F2F5F0] hover:bg-[#EBF1E8] border border-neutral-200/60 rounded-xl p-4.5 transition-all duration-200 flex flex-col justify-between group shadow-2xs"
                  >
                    <div>
                      <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center mb-3 shadow-2xs group-hover:scale-105 transition-transform">
                        {renderIcon(srv.iconName)}
                      </div>
                      <h2 className="text-sm font-semibold text-neutral-900 mb-1">
                        {srv.title}
                      </h2>
                      <p className="text-xs text-neutral-600 leading-snug">
                        {srv.shortDesc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Visual Mockup */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md lg:max-w-none">
              
              {/* Organic visual backdrop accents */}
              <div
                className="absolute -top-4 -right-4 w-32 h-32 bg-[#D9A51B]/15 rounded-full filter blur-xl -z-10"
                aria-hidden="true"
              />
              <div
                className="absolute -bottom-6 -left-6 w-44 h-44 bg-[#28651B]/15 rounded-full filter blur-2xl -z-10"
                aria-hidden="true"
              />

              {/* Main Card with Image */}
              <div className="relative rounded-2xl overflow-hidden bg-white shadow-xl border border-neutral-200/80 p-2 sm:p-2.5">
                <div className="relative rounded-xl overflow-hidden aspect-4/3 bg-neutral-100">
                  <img
                    src={heroImg}
                    alt="Divire Ads TV creative workspace with editing suite and social media growth showcase"
                    className="w-full h-full object-cover object-center transform hover:scale-102 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                    loading="eager"
                  />
                  {/* Subtle lighting vignette */}
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none"
                    aria-hidden="true"
                  />
                </div>

                {/* Floating Micro-Badge with Official Logo */}
                <div className="mt-3 px-3 py-2 bg-[#F2F5F0] rounded-xl flex items-center justify-between text-xs text-neutral-700">
                  <div className="flex items-center gap-2">
                    <img
                      src="/logo.jpg"
                      alt="Divire Ads TV"
                      className="w-6 h-6 object-contain rounded-md shadow-2xs bg-white"
                      referrerPolicy="no-referrer"
                    />
                    <span className="font-semibold text-neutral-900">Divire Ads TV</span>
                  </div>
                  <span className="text-neutral-500 font-normal">Connecting Through Creativity</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
