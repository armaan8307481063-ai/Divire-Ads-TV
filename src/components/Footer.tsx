import React from 'react';
import { Lock } from 'lucide-react';
import { DivireLogo } from './DivireLogo.js';

interface FooterProps {
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenPrivacy,
  onOpenTerms,
  onOpenAdmin,
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1C4813] text-white pt-16 pb-12 border-t border-[#28651B]/40 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Centered Brand Area with Monogram and Decorative Lines */}
        <div className="flex flex-col items-center justify-center text-center">
          <DivireLogo variant="full" light className="mb-6" />

          {/* Quick Section Links */}
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-neutral-300 font-medium my-6">
            <a href="#home" className="hover:text-[#D9A51B] transition-colors">
              Home
            </a>
            <span className="text-white/20">·</span>
            <a href="#enquiry-section" className="hover:text-[#D9A51B] transition-colors">
              Enquiry Form
            </a>
            <span className="text-white/20">·</span>
            <a href="#visit-us" className="hover:text-[#D9A51B] transition-colors">
              Visit Us
            </a>
            <span className="text-white/20">·</span>
            <a href="#contact-details" className="hover:text-[#D9A51B] transition-colors">
              Contact
            </a>
          </div>

          {/* Thin decorative gold line */}
          <div className="w-full max-w-xl h-[1px] bg-gradient-to-r from-transparent via-[#D9A51B]/50 to-transparent my-4" />

          {/* Bottom Bar: Copyright & Legal */}
          <div className="w-full pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 gap-4">
            
            <p>
              &copy; {currentYear} Divire Ads TV. All rights reserved. Kaithal, Haryana.
            </p>

            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={onOpenPrivacy}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Privacy Policy
              </button>
              <button
                type="button"
                onClick={onOpenTerms}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Terms of Service
              </button>
              <button
                type="button"
                onClick={onOpenAdmin}
                className="hover:text-[#D9A51B] transition-colors inline-flex items-center gap-1 cursor-pointer"
              >
                <Lock className="w-3 h-3" />
                <span>Admin Portal</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </footer>
  );
};
