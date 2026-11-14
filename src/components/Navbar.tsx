import React, { useState } from 'react';
import { Menu, X, PhoneCall, ShieldCheck } from 'lucide-react';
import { DivireLogo } from './DivireLogo.js';

interface NavbarProps {
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAdmin }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-xs border-b border-neutral-100 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-22 py-1">
          {/* Official Divire Ads TV Logo */}
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              scrollTo('home');
            }}
            aria-label="Divire Ads TV Home"
            className="focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#28651B] rounded-xl transition-transform active:scale-98"
          >
            <DivireLogo variant="compact" />
          </a>

          {/* Dark Green Horizontal Navigation Bar on the Right (Desktop) */}
          <div className="hidden lg:flex items-center">
            <nav
              className="bg-[#28651B] text-white px-6 py-2.5 rounded-full flex items-center gap-7 shadow-sm transition-all"
              aria-label="Main Navigation"
            >
              <button
                type="button"
                onClick={() => scrollTo('home')}
                className="text-sm font-medium hover:text-[#D9A51B] transition-colors whitespace-nowrap cursor-pointer"
              >
                Home
              </button>
              <button
                type="button"
                onClick={() => scrollTo('enquiry-section')}
                className="text-sm font-medium hover:text-[#D9A51B] transition-colors whitespace-nowrap cursor-pointer"
              >
                Fill Form
              </button>
              <button
                type="button"
                onClick={() => scrollTo('visit-us')}
                className="text-sm font-medium hover:text-[#D9A51B] transition-colors whitespace-nowrap cursor-pointer"
              >
                Visit Us
              </button>
              <button
                type="button"
                onClick={() => scrollTo('contact-details')}
                className="text-sm font-medium hover:text-[#D9A51B] transition-colors whitespace-nowrap cursor-pointer"
              >
                Contact Us
              </button>

              <div className="h-4 w-px bg-white/20" aria-hidden="true" />

              {/* Call Now Button */}
              <a
                href="tel:+918307481063"
                className="flex items-center gap-1.5 text-xs font-semibold text-[#1C4813] bg-[#D9A51B] hover:bg-[#C49214] px-3.5 py-1.5 rounded-full transition-transform active:scale-95 whitespace-nowrap shadow-xs"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>+91 83074-81063</span>
              </a>
            </nav>

            {/* Quick Admin Portal Button */}
            <button
              type="button"
              onClick={onOpenAdmin}
              title="Admin Portal"
              className="ml-3 p-2 text-neutral-400 hover:text-[#28651B] hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
              aria-label="Open Admin Dashboard"
            >
              <ShieldCheck className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={onOpenAdmin}
              title="Admin Portal"
              className="p-2 text-neutral-500 hover:text-[#28651B] rounded-lg cursor-pointer"
              aria-label="Admin Portal"
            >
              <ShieldCheck className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-lg text-neutral-700 hover:text-[#28651B] hover:bg-neutral-100 focus:outline-hidden focus:ring-2 focus:ring-[#28651B] cursor-pointer"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-neutral-200 px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <div className="bg-[#28651B] rounded-2xl p-4 text-white space-y-3 shadow-inner">
            <button
              type="button"
              onClick={() => scrollTo('home')}
              className="block w-full text-left py-2 px-3 rounded-lg text-sm font-medium hover:bg-white/10 hover:text-[#D9A51B] transition-colors"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => scrollTo('enquiry-section')}
              className="block w-full text-left py-2 px-3 rounded-lg text-sm font-medium hover:bg-white/10 hover:text-[#D9A51B] transition-colors"
            >
              Fill Form
            </button>
            <button
              type="button"
              onClick={() => scrollTo('visit-us')}
              className="block w-full text-left py-2 px-3 rounded-lg text-sm font-medium hover:bg-white/10 hover:text-[#D9A51B] transition-colors"
            >
              Visit Us
            </button>
            <button
              type="button"
              onClick={() => scrollTo('contact-details')}
              className="block w-full text-left py-2 px-3 rounded-lg text-sm font-medium hover:bg-white/10 hover:text-[#D9A51B] transition-colors"
            >
              Contact Us
            </button>

            <div className="pt-2 border-t border-white/15">
              <a
                href="tel:+918307481063"
                className="flex items-center justify-center gap-2 w-full text-center text-sm font-semibold text-[#1C4813] bg-[#D9A51B] py-2.5 rounded-xl shadow-xs"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call +91 83074-81063</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
