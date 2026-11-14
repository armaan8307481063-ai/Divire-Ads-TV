import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MessageSquare,
} from 'lucide-react';
import { InquiryFormData } from '../types.js';
import { supabase } from '../lib/supabase.js';
import { useSiteContent } from '../context/SiteContentContext.js';

export const ContactEnquirySection: React.FC = () => {
  const { content } = useSiteContent();
  const contact = content?.contact;

  const availableServices = (content?.services && content.services.length > 0)
    ? content.services.map((s) => s.title)
    : [
        'Social Media Management',
        'Content Creation',
        'Google & Meta Ads',
        'Paid Advertising',
        'Website Design',
        'SEO and Branding',
      ];

  const address = contact?.address || 'Kaithal, Haryana';
  const phone = contact?.phone || '+91 83074-81063';
  const email = contact?.email || 'divireadstv@gmail.com';
  const workingHours = contact?.workingHours || 'Monday–Saturday, 10:00 AM–5:00 PM';
  const whatsappUrl = content?.socialLinks?.whatsapp || `https://wa.me/${phone.replace(/[^0-9]/g, '')}`;

  const [formData, setFormData] = useState<InquiryFormData>({
    name: '',
    brandName: '',
    email: '',
    phone: '',
    services: [],
    message: '',
    honeypot: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ id: string; name: string } | null>(null);

  const handleServiceToggle = (service: string) => {
    setFormData((prev) => {
      const exists = prev.services.includes(service);
      return {
        ...prev,
        services: exists
          ? prev.services.filter((s) => s !== service)
          : [...prev.services, service],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Client-side quick checks
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setErrorMessage('Please enter your full name (minimum 2 characters).');
      return;
    }
    if (!formData.brandName.trim()) {
      setErrorMessage('Please enter your business or brand name.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    const cleanPhone = formData.phone.replace(/[^0-9+]/g, '');
    if (!cleanPhone || cleanPhone.length < 8) {
      setErrorMessage('Please enter a valid WhatsApp or phone number.');
      return;
    }
    if (formData.services.length === 0) {
      setErrorMessage('Please select at least one service you need help with.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to submit enquiry. Please try again.');
      }

      setSuccessData({
        id: json.inquiry?.id || 'DIVIRE-ENQ',
        name: formData.name,
      });

      // Direct client-side sync to Supabase backend tables (orders / inquiries)
      try {
        const sbPayload = {
          id: json.inquiry?.id || `divire-${Date.now()}`,
          name: formData.name.trim(),
          brand_name: formData.brandName.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          services: formData.services,
          message: formData.message ? formData.message.trim() : '',
          status: 'New',
          created_at: new Date().toISOString(),
        };

        (async () => {
          try {
            const { error } = await supabase.from('orders').insert([sbPayload]);
            if (error && error.code === 'PGRST205') {
              await supabase.from('inquiries').insert([sbPayload]);
            }
          } catch {
            // Handled silently; backend server already safely stored it
          }
        })();
      } catch {
        // Handled silently
      }

      // Reset form fields
      setFormData({
        name: '',
        brandName: '',
        email: '',
        phone: '',
        services: [],
        message: '',
        honeypot: '',
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('An unexpected error occurred. Please try again or reach out on WhatsApp.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="enquiry-section"
      className="bg-[#28651B] text-white py-16 sm:py-20 lg:py-24 relative overflow-hidden"
    >
      {/* Background glow effects */}
      <div
        className="absolute top-0 right-1/4 w-96 h-96 bg-[#D9A51B]/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-0 w-80 h-80 bg-black/20 rounded-full blur-2xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-0 items-start">
          
          {/* Left Column: Contact Details */}
          <div id="contact-details" className="lg:col-span-5 lg:pr-12 space-y-8">
            <div className="space-y-4">
              <span className="text-xs font-semibold tracking-[0.25em] text-[#D9A51B] uppercase">
                Direct Contact
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-bold text-white leading-[1.2] tracking-tight">
                Let's Grow Your{' '}
                <span className="text-[#D9A51B]">Brand Together.</span>
              </h2>
              <p className="text-neutral-200 text-sm sm:text-base leading-relaxed max-w-md font-normal">
                Have a business, idea, or brand that needs better marketing? Let's talk about how Divire Ads TV can help you grow.
              </p>
            </div>

            {/* Contact Information List with circular gold icons */}
            <div className="space-y-5 pt-2">
              
              {/* Visit Us */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#D9A51B] flex items-center justify-center shrink-0 shadow-md">
                  <MapPin className="w-5 h-5 text-[#1C4813]" />
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider text-neutral-300 block font-medium">
                    Visit Us
                  </span>
                  <p className="text-base font-semibold text-white mt-0.5">
                    {address}
                  </p>
                </div>
              </div>

              {/* Call / WhatsApp */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#D9A51B] flex items-center justify-center shrink-0 shadow-md">
                  <Phone className="w-5 h-5 text-[#1C4813]" />
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider text-neutral-300 block font-medium">
                    Call / WhatsApp
                  </span>
                  <a
                    href={`tel:${phone.replace(/[^0-9+]/g, '')}`}
                    className="text-base font-semibold text-white hover:text-[#D9A51B] transition-colors mt-0.5 block"
                  >
                    {phone}
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#D9A51B] flex items-center justify-center shrink-0 shadow-md">
                  <Mail className="w-5 h-5 text-[#1C4813]" />
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider text-neutral-300 block font-medium">
                    Email
                  </span>
                  <a
                    href={`mailto:${email}`}
                    className="text-base font-semibold text-white hover:text-[#D9A51B] transition-colors mt-0.5 block break-all"
                  >
                    {email}
                  </a>
                </div>
              </div>

              {/* Working Hours */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#D9A51B] flex items-center justify-center shrink-0 shadow-md">
                  <Clock className="w-5 h-5 text-[#1C4813]" />
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider text-neutral-300 block font-medium">
                    Working Hours
                  </span>
                  <p className="text-sm font-semibold text-white mt-0.5">
                    {workingHours}
                  </p>
                </div>
              </div>

            </div>

            {/* WhatsApp Quick Action Button */}
            <div className="pt-4">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2.5 bg-[#D9A51B] hover:bg-[#C49214] text-[#1C4813] font-semibold text-sm sm:text-base px-6 py-3.5 rounded-full transition-transform active:scale-95 shadow-md"
              >
                <MessageSquare className="w-5 h-5 fill-current" />
                <span>Message on WhatsApp</span>
              </a>
            </div>

          </div>

          {/* Vertical Gold Divider (Desktop) */}
          <div className="hidden lg:flex lg:col-span-1 justify-center self-stretch">
            <div className="w-[1.5px] bg-gradient-to-b from-[#D9A51B]/20 via-[#D9A51B] to-[#D9A51B]/20 h-full rounded-full" />
          </div>

          {/* Right Column: "Tell Us About Your Business" Form */}
          <div className="lg:col-span-6 lg:pl-8">
            <div className="bg-white text-neutral-900 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl border border-neutral-100">
              
              <div className="mb-6">
                <h3 className="text-2xl sm:text-[1.75rem] font-bold text-neutral-900 tracking-tight">
                  Tell Us About Your Business
                </h3>
                <p className="text-sm text-neutral-600 mt-1">
                  Fill in the details below and we will get back to you with a personalized growth plan.
                </p>
              </div>

              {/* Success Notification Banner */}
              {successData && (
                <div className="mb-6 p-5 rounded-2xl bg-[#F2F5F0] border border-[#28651B]/30 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-[#28651B] shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="text-base font-semibold text-[#1C4813]">
                        Thank You, {successData.name}!
                      </h4>
                      <p className="text-xs sm:text-sm text-neutral-700">
                        Your inquiry has been submitted. Our team will review your requirements and reach out within 24 hours.
                      </p>
                      <div className="pt-2 flex flex-wrap items-center gap-3">
                        <a
                          href="https://wa.me/918307481063?text=Hi%20Divire%20Ads%20TV,%20I%20just%20submitted%20an%20enquiry%20form%20for%20my%20business!"
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#28651B] hover:underline"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Fast-track via WhatsApp &rarr;</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => setSuccessData(null)}
                          className="text-xs text-neutral-500 hover:text-neutral-800 underline ml-auto"
                        >
                          Submit another enquiry
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Alert */}
              {errorMessage && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {/* Honeypot field for bot protection (hidden from humans) */}
                <input
                  type="text"
                  name="website_url"
                  tabIndex={-1}
                  autoComplete="off"
                  value={formData.honeypot}
                  onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
                  className="hidden"
                  aria-hidden="true"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label htmlFor="client-name" className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="client-name"
                      type="text"
                      required
                      placeholder="e.g. Rahul Verma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-[#F2F5F0]/60 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#28651B] focus:border-transparent text-sm text-neutral-900 transition-colors"
                    />
                  </div>

                  {/* Business / Brand Name */}
                  <div>
                    <label htmlFor="brand-name" className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                      Brand / Business <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="brand-name"
                      type="text"
                      required
                      placeholder="e.g. Verma Enterprises"
                      value={formData.brandName}
                      onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-[#F2F5F0]/60 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#28651B] focus:border-transparent text-sm text-neutral-900 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email Address */}
                  <div>
                    <label htmlFor="client-email" className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="client-email"
                      type="email"
                      required
                      placeholder="rahul@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-[#F2F5F0]/60 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#28651B] focus:border-transparent text-sm text-neutral-900 transition-colors"
                    />
                  </div>

                  {/* Phone / WhatsApp */}
                  <div>
                    <label htmlFor="client-phone" className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                      Phone / WhatsApp <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="client-phone"
                      type="tel"
                      required
                      placeholder="+91 98765-43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-[#F2F5F0]/60 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#28651B] focus:border-transparent text-sm text-neutral-900 transition-colors"
                    />
                  </div>
                </div>

                {/* Service Checkboxes */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-2 uppercase tracking-wider">
                    What do you need help with? <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {availableServices.map((service) => {
                      const isChecked = formData.services.includes(service);
                      return (
                        <label
                          key={service}
                          className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer select-none text-xs sm:text-sm font-medium transition-all ${
                            isChecked
                              ? 'bg-[#F2F5F0] border-[#28651B] text-[#1C4813] shadow-2xs'
                              : 'bg-white border-neutral-200/80 hover:border-neutral-300 text-neutral-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleServiceToggle(service)}
                            className="w-4 h-4 rounded text-[#28651B] accent-[#28651B] focus:ring-[#28651B] cursor-pointer"
                          />
                          <span>{service}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Optional Message */}
                <div>
                  <label htmlFor="client-message" className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                    Additional Details / Goals (Optional)
                  </label>
                  <textarea
                    id="client-message"
                    rows={3}
                    placeholder="Tell us about your target audience, timeline, or current marketing challenges..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-[#F2F5F0]/60 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#28651B] focus:border-transparent text-sm text-neutral-900 transition-colors resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#D9A51B] hover:bg-[#C49214] text-[#1C4813] font-bold text-base py-3.5 px-6 rounded-xl transition-all duration-150 flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer active:scale-99"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Submitting Enquiry...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Submit Enquiry</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-center text-neutral-500 mt-2">
                  🔒 We respect your privacy. Your information is confidential and never shared with third parties.
                </p>
              </form>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
