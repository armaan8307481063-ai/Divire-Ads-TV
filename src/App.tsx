import React, { useState, useEffect } from 'react';
import { MessageCircle, ArrowUp } from 'lucide-react';
import { Navbar } from './components/Navbar.js';
import { HeroSection } from './components/HeroSection.js';
import { BrandTaglineStrip } from './components/BrandTaglineStrip.js';
import { ContactEnquirySection } from './components/ContactEnquirySection.js';
import { VisitUsSection } from './components/VisitUsSection.js';
import { Footer } from './components/Footer.js';
import { LegalModals } from './components/LegalModals.js';
import { AdminDashboardApp } from './components/admin/AdminDashboardApp.js';
import { SiteContentProvider } from './context/SiteContentContext.js';

export default function App() {
  const [isAdminView, setIsAdminView] = useState(() => {
    return (
      window.location.pathname === '/admin' ||
      window.location.pathname.startsWith('/admin/') ||
      window.location.hash === '#admin'
    );
  });
  const [legalModal, setLegalModal] = useState<'privacy' | 'terms' | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Synchronize route changes for /admin or #admin
  useEffect(() => {
    const handleLocationChange = () => {
      const isAdmin =
        window.location.pathname === '/admin' ||
        window.location.pathname.startsWith('/admin/') ||
        window.location.hash === '#admin';
      setIsAdminView(isAdmin);
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Scroll to top button visibility listener
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openAdmin = () => {
    setIsAdminView(true);
    window.history.pushState({}, '', '/admin');
  };

  const closeAdmin = () => {
    setIsAdminView(false);
    window.history.pushState({}, '', '/');
  };

  const scrollToEnquiry = () => {
    const el = document.getElementById('enquiry-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If viewing the Admin Panel route
  if (isAdminView) {
    return (
      <SiteContentProvider>
        <AdminDashboardApp onExit={closeAdmin} />
      </SiteContentProvider>
    );
  }

  // Otherwise, render the complete public website
  return (
    <SiteContentProvider>
      <div className="min-h-screen flex flex-col bg-white text-neutral-900 selection:bg-[#D9A51B]/30 selection:text-[#28651B]">
        {/* Top Header & Sticky Navigation */}
        <Navbar onOpenAdmin={openAdmin} />

        {/* Main Content Area */}
        <main className="flex-1">
          {/* Hero Section */}
          <HeroSection onFillFormClick={scrollToEnquiry} />

          {/* Brand Tagline Strip */}
          <BrandTaglineStrip />

          {/* Contact and Enquiry Section */}
          <ContactEnquirySection />

          {/* Visit Us / Google Maps Section */}
          <VisitUsSection />
        </main>

        {/* Footer */}
        <Footer
          onOpenPrivacy={() => setLegalModal('privacy')}
          onOpenTerms={() => setLegalModal('terms')}
          onOpenAdmin={openAdmin}
        />

        {/* Floating WhatsApp Quick Action Button */}
        <aside aria-label="Floating Actions">
          <a
            href="https://wa.me/918307481063?text=Hi%20Divire%20Ads%20TV,%20I'd%20like%20to%20grow%20my%20brand!"
            target="_blank"
            rel="noreferrer"
            aria-label="Direct WhatsApp Chat with Divire Ads TV"
            className="fixed bottom-6 right-6 z-40 bg-[#25D366] hover:bg-[#20ba59] text-white p-3.5 rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center group focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-[#25D366]/40"
          >
            <MessageCircle className="w-6 h-6 fill-white" />
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap text-xs font-bold pl-0 group-hover:pl-2">
              Chat on WhatsApp
            </span>
          </a>

          {/* Floating Scroll To Top Button */}
          {showScrollTop && (
            <button
              type="button"
              onClick={scrollToTop}
              aria-label="Scroll to top of page"
              className="fixed bottom-22 right-7 z-40 bg-white/90 hover:bg-white text-neutral-700 hover:text-[#28651B] p-2.5 rounded-full shadow-md border border-neutral-200 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-xs"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          )}
        </aside>

        {/* Legal Modals (Privacy Policy / Terms of Service) */}
        <LegalModals
          type={legalModal}
          onClose={() => setLegalModal(null)}
        />
      </div>
    </SiteContentProvider>
  );
}
