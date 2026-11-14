import React from 'react';
import { MapPin, Navigation, Clock, Phone, ExternalLink, Sparkles } from 'lucide-react';
import { useSiteContent } from '../context/SiteContentContext.js';

export const VisitUsSection: React.FC = () => {
  const { content } = useSiteContent();
  const contact = content?.contact;

  const address =
    contact?.address ||
    'Divire Ads TV, Near Maharaja Palace, Dhand Road, HUDA Sector 20, Kaithal, Haryana 136027, India';
  const phone = contact?.phone || '+91 83074-81063';
  const workingHours = contact?.workingHours || 'Monday–Saturday, 10:00 AM–5:00 PM';
  
  // Exact verified Google Maps location link (source of truth)
  const exactMapsLocationUrl =
    contact?.googleMapsUrl || 'https://maps.app.goo.gl/YL1wE7CMfU1p3krh7?g_st=ic';

  // Embed URL centered specifically on the verified office location (HUDA Sector 20, Dhand Road, near Maharaja Palace)
  const mapEmbedUrl =
    contact?.googleMapsEmbedUrl ||
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3463.5042!2d76.422755!3d29.814238!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3911e1efb3a33b41%3A0xa4644b9639a81d12!2sKaithal%20Breaking%20tv!5e0!3m2!1sen!2sin!4v1710000000000!5m2!1sen!2sin';

  return (
    <section id="visit-us" className="py-16 sm:py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Underlined Green Heading */}
            <div>
              <div className="inline-block">
                <span className="text-sm font-semibold tracking-wider text-[#28651B] uppercase block">
                  Visit Us
                </span>
                <div className="h-0.5 w-12 bg-[#28651B] mt-1 rounded-full" />
              </div>
            </div>

            {/* Large Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-bold text-neutral-900 leading-[1.2] tracking-tight">
              We’re Here to Help Your{' '}
              <span className="text-[#D9A51B] relative inline-block">
                Brand
                <span
                  className="absolute bottom-1 left-0 w-full h-2 bg-[#D9A51B]/20 -z-10 rounded-xs"
                  aria-hidden="true"
                />
              </span>{' '}
              Grow.
            </h2>

            {/* Supporting Text */}
            <p className="text-base text-neutral-600 leading-relaxed font-normal">
              Visit our office or get in touch — we’d love to meet you and discuss your ideas.
            </p>

            {/* Location Card Info */}
            <div className="bg-[#F2F5F0] border border-neutral-200/80 rounded-2xl p-6 space-y-4 shadow-2xs">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-full bg-[#D9A51B] flex items-center justify-center shrink-0 shadow-sm">
                  <MapPin className="w-6 h-6 text-[#1C4813]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900">
                    Divire Ads TV
                  </h3>
                  <p className="text-sm text-neutral-700 font-medium mt-0.5 leading-snug">
                    {address}
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    Serving businesses locally in Haryana and nationwide across India.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-200/60 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-600">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#28651B]" />
                  <span>{workingHours}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#28651B]" />
                  <a href={`tel:${phone.replace(/[^0-9+]/g, '')}`} className="hover:text-[#28651B] font-medium">
                    {phone}
                  </a>
                </div>
              </div>
            </div>

            {/* Directions & Maps Action Buttons */}
            <div className="pt-1 flex flex-wrap items-center gap-4">
              {/* Connected directly to exact verified Google Maps location */}
              <a
                href={exactMapsLocationUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Get Directions to Divire Ads TV on Google Maps"
                className="inline-flex items-center gap-2 bg-[#28651B] hover:bg-[#1C4813] text-white font-medium text-sm sm:text-base px-6 py-3 rounded-full transition-all duration-150 shadow-sm hover:shadow-md cursor-pointer group active:scale-95"
              >
                <Navigation className="w-4 h-4 text-[#D9A51B] group-hover:rotate-12 transition-transform" />
                <span>Get Directions</span>
              </a>

              {/* Connected directly to exact verified Google Maps location */}
              <a
                href={exactMapsLocationUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open Divire Ads TV verified location in Google Maps"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-700 hover:text-[#28651B] px-4 py-3 rounded-full hover:bg-neutral-100 transition-colors"
              >
                <span>Open in Maps</span>
                <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
              </a>
            </div>

          </div>

          {/* Right Column: Google Maps Embed with labelled location marker */}
          <div className="lg:col-span-7">
            <div className="relative rounded-3xl overflow-hidden border border-neutral-200/90 shadow-xl bg-neutral-100 p-2 sm:p-2.5">
              
              <div className="relative w-full h-[380px] sm:h-[430px] rounded-2xl overflow-hidden bg-neutral-200">
                {/* Embedded Map showing exact office location */}
                <iframe
                  title="Divire Ads TV Location - Near Maharaja Palace, HUDA Sector 20, Kaithal"
                  src={mapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full object-cover"
                />

                {/* Floating interactive location marker labelled 'Divire Ads TV' */}
                <div className="absolute top-3.5 left-3.5 sm:top-4 sm:left-4 z-20 pointer-events-auto">
                  <a
                    href={exactMapsLocationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Click marker to open Divire Ads TV verified location in Google Maps"
                    className="flex items-center gap-3 bg-white/95 hover:bg-white text-neutral-900 pl-3 pr-4 py-2.5 rounded-2xl shadow-xl border-2 border-[#28651B]/20 hover:border-[#28651B] backdrop-blur-md transition-all duration-200 hover:scale-105 group/marker focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#28651B] cursor-pointer"
                  >
                    <div className="relative flex items-center justify-center">
                      <span className="absolute -inset-1 rounded-full bg-[#D9A51B]/50 animate-ping opacity-75" />
                      <div className="relative w-9 h-9 rounded-xl bg-[#28651B] group-hover/marker:bg-[#1C4813] flex items-center justify-center text-[#D9A51B] shadow-sm transition-colors">
                        <MapPin className="w-5 h-5 fill-current" />
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black tracking-tight text-[#28651B] uppercase">
                          Divire Ads TV
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#25D366]" title="Verified Location" />
                      </div>
                      <p className="text-[11px] font-medium text-neutral-600 line-clamp-1">
                        Near Maharaja Palace, HUDA Sector 20
                      </p>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-neutral-400 group-hover/marker:text-[#28651B] transition-colors ml-1" />
                  </a>
                </div>

                {/* Center pin callout marker labelled Divire Ads TV */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full -mt-2 z-10 pointer-events-auto">
                  <a
                    href={exactMapsLocationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Open Divire Ads TV in Google Maps"
                    className="flex flex-col items-center group/pin cursor-pointer transition-transform duration-200 hover:scale-110"
                  >
                    <div className="bg-[#28651B] text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-xl border-2 border-[#D9A51B] flex items-center gap-1.5 whitespace-nowrap mb-1">
                      <Sparkles className="w-3 h-3 text-[#D9A51B]" />
                      <span>Divire Ads TV</span>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-[#28651B] border-2 border-white shadow-xl flex items-center justify-center text-[#D9A51B]">
                      <MapPin className="w-4 h-4 fill-current" />
                    </div>
                    <div className="w-2 h-1 bg-[#1C4813] rounded-full mt-0.5 opacity-70" />
                  </a>
                </div>

              </div>

              {/* Bottom location pin indicator */}
              <div className="mt-2.5 px-3 py-2.5 flex items-center justify-between text-xs text-neutral-600 bg-[#F2F5F0] rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#28651B] shrink-0" />
                  <span className="font-semibold text-neutral-900">Divire Ads TV Office</span>
                  <span className="text-neutral-400">·</span>
                  <span className="line-clamp-1">Near Maharaja Palace, Dhand Road, HUDA Sector 20</span>
                </div>
                <a
                  href={exactMapsLocationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#28651B] hover:text-[#1C4813] hover:underline font-semibold whitespace-nowrap ml-2 flex items-center gap-1"
                >
                  <span>Open in Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
