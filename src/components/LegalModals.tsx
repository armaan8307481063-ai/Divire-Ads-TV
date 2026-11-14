import React from 'react';
import { X, ShieldCheck, FileText } from 'lucide-react';

interface LegalModalProps {
  type: 'privacy' | 'terms' | null;
  onClose: () => void;
}

export const LegalModals: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white text-neutral-900 w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-neutral-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4.5 bg-[#1C4813] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            {type === 'privacy' ? (
              <ShieldCheck className="w-5 h-5 text-[#D9A51B]" />
            ) : (
              <FileText className="w-5 h-5 text-[#D9A51B]" />
            )}
            <h3 className="text-base sm:text-lg font-bold">
              {type === 'privacy' ? 'Privacy Policy' : 'Terms of Service'} — Divire Ads TV
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            aria-label="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-4 text-xs sm:text-sm text-neutral-700 leading-relaxed">
          {type === 'privacy' ? (
            <>
              <p className="font-semibold text-neutral-900">
                Effective Date: October 2025 | Divire Ads TV, Kaithal, Haryana
              </p>
              <h4 className="font-bold text-neutral-900 text-sm">1. Information We Collect</h4>
              <p>
                When you submit an enquiry through our website, we collect your name, business/brand name, email address, phone/WhatsApp number, and marketing preferences. This information is gathered solely to provide consulting proposals and digital marketing services.
              </p>

              <h4 className="font-bold text-neutral-900 text-sm">2. How We Use Your Data</h4>
              <p>
                Your contact details are used exclusively to follow up on your marketing consultation requests, schedule discovery meetings, and deliver client communications. We never sell, rent, or trade your personal or business data to any third parties.
              </p>

              <h4 className="font-bold text-neutral-900 text-sm">3. Data Security &amp; Confidentiality</h4>
              <p>
                We implement strict administrative and technical safeguards to secure your business briefs, creative assets, and lead inquiries. Access is restricted to authorized agency management.
              </p>

              <h4 className="font-bold text-neutral-900 text-sm">4. Contact Information</h4>
              <p>
                If you have questions about our privacy practices, please contact us at{' '}
                <a href="mailto:divireadstv@gmail.com" className="text-[#28651B] underline font-semibold">
                  divireadstv@gmail.com
                </a>{' '}
                or call +91 83074-81063.
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold text-neutral-900">
                Terms of Service | Divire Ads TV, Kaithal, Haryana
              </p>
              <h4 className="font-bold text-neutral-900 text-sm">1. Engagement of Services</h4>
              <p>
                Divire Ads TV provides digital marketing, social media management, creative content production, and advertising services subject to formal service proposals and statements of work agreed upon with clients.
              </p>

              <h4 className="font-bold text-neutral-900 text-sm">2. Intellectual Property</h4>
              <p>
                All creative content, video edits, graphic assets, and campaign deliverables produced for paid client engagements become the client’s property upon full settlement of project invoices, with the agency retaining the customary right to showcase work in its portfolio.
              </p>

              <h4 className="font-bold text-neutral-900 text-sm">3. Website Inquiries &amp; Consultations</h4>
              <p>
                Submitting an inquiry form through our website constitutes a request for discussion and does not create a binding marketing retainer until an explicit agreement has been executed.
              </p>

              <h4 className="font-bold text-neutral-900 text-sm">4. Jurisdiction</h4>
              <p>
                Any matters arising under these terms are governed in accordance with the laws applicable in Kaithal, Haryana, India.
              </p>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-neutral-100 flex justify-end shrink-0 border-t border-neutral-200">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs sm:text-sm font-semibold bg-[#28651B] hover:bg-[#1C4813] text-white rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
