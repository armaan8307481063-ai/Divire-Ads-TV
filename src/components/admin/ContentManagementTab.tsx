import React, { useState, useEffect } from 'react';
import {
  FileText,
  Save,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  Layers,
  Briefcase,
  Star,
  MapPin,
  Share2,
  RefreshCw,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';
import { SiteContent, ServiceItem, PortfolioProject, TestimonialItem } from '../../types.js';
import { getAuthHeaders } from '../../lib/authHeader.js';

interface ContentManagementTabProps {
  token: string;
  onContentSaved: () => void;
}

export const ContentManagementTab: React.FC<ContentManagementTabProps> = ({ token, onContentSaved }) => {
  const [activeSubTab, setActiveSubTab] = useState<'hero' | 'about' | 'services' | 'portfolio' | 'testimonials' | 'contact' | 'social'>('hero');
  const [content, setContent] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Modals for CRUD on arrays
  const [serviceModal, setServiceModal] = useState<ServiceItem | null>(null);
  const [portfolioModal, setPortfolioModal] = useState<PortfolioProject | null>(null);
  const [testimonialModal, setTestimonialModal] = useState<TestimonialItem | null>(null);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/content', {
        headers: getAuthHeaders(token),
      });
      const json = await res.json();
      if (json.success) {
        setContent(json.data);
      }
    } catch (err) {
      setError('Failed to fetch website content.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [token]);

  const handleSave = async (updatedData?: Partial<SiteContent>) => {
    if (!content) return;
    setSaving(true);
    setError(null);
    setMessage(null);

    const payload = updatedData ? { ...content, ...updatedData } : content;

    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(token),
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to save content.');
      }

      setContent(json.data);
      setMessage('Website content updated and published live!');
      onContentSaved();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error saving content');
    } finally {
      setSaving(false);
    }
  };

  // Service CRUD helpers
  const handleSaveService = (service: ServiceItem) => {
    if (!content) return;
    const exists = content.services.some((s) => s.id === service.id);
    let newServices: ServiceItem[];
    if (exists) {
      newServices = content.services.map((s) => (s.id === service.id ? service : s));
    } else {
      newServices = [...content.services, service];
    }
    setContent({ ...content, services: newServices });
    handleSave({ services: newServices });
    setServiceModal(null);
  };

  const handleDeleteService = (id: string) => {
    if (!content) return;
    if (!window.confirm('Delete this service?')) return;
    const newServices = content.services.filter((s) => s.id !== id);
    setContent({ ...content, services: newServices });
    handleSave({ services: newServices });
  };

  // Portfolio CRUD helpers
  const handleSavePortfolio = (project: PortfolioProject) => {
    if (!content) return;
    const exists = content.portfolio.some((p) => p.id === project.id);
    let newPortfolio: PortfolioProject[];
    if (exists) {
      newPortfolio = content.portfolio.map((p) => (p.id === project.id ? project : p));
    } else {
      newPortfolio = [...content.portfolio, project];
    }
    setContent({ ...content, portfolio: newPortfolio });
    handleSave({ portfolio: newPortfolio });
    setPortfolioModal(null);
  };

  const handleDeletePortfolio = (id: string) => {
    if (!content) return;
    if (!window.confirm('Delete this portfolio project?')) return;
    const newPortfolio = content.portfolio.filter((p) => p.id !== id);
    setContent({ ...content, portfolio: newPortfolio });
    handleSave({ portfolio: newPortfolio });
  };

  // Testimonials CRUD helpers
  const handleSaveTestimonial = (testimonial: TestimonialItem) => {
    if (!content) return;
    const exists = content.testimonials.some((t) => t.id === testimonial.id);
    let newTestimonials: TestimonialItem[];
    if (exists) {
      newTestimonials = content.testimonials.map((t) => (t.id === testimonial.id ? testimonial : t));
    } else {
      newTestimonials = [...content.testimonials, testimonial];
    }
    setContent({ ...content, testimonials: newTestimonials });
    handleSave({ testimonials: newTestimonials });
    setTestimonialModal(null);
  };

  const handleDeleteTestimonial = (id: string) => {
    if (!content) return;
    if (!window.confirm('Delete this client testimonial?')) return;
    const newTestimonials = content.testimonials.filter((t) => t.id !== id);
    setContent({ ...content, testimonials: newTestimonials });
    handleSave({ testimonials: newTestimonials });
  };

  if (loading || !content) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#28651B] mx-auto mb-2" />
        <p className="text-xs text-neutral-500">Loading website content editor...</p>
      </div>
    );
  }

  const subTabs = [
    { id: 'hero', label: 'Homepage & Hero' },
    { id: 'about', label: 'About Us' },
    { id: 'services', label: `Services (${content.services.length})` },
    { id: 'portfolio', label: `Portfolio (${content.portfolio.length})` },
    { id: 'testimonials', label: `Testimonials (${content.testimonials.length})` },
    { id: 'contact', label: 'Contact Details' },
    { id: 'social', label: 'Social Media Links' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Header & Save Button */}
      <div className="bg-white dark:bg-neutral-800 rounded-3xl p-5 border border-neutral-200 dark:border-neutral-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
            Website Content Management
          </h1>
          <p className="text-xs text-neutral-500">
            Edit copy, images, services, and contact info. Changes immediately publish live to Divire Ads TV.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchContent}
            disabled={saving}
            className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 hover:bg-neutral-100 text-neutral-700 dark:text-neutral-200 transition-colors cursor-pointer"
            title="Reload from server"
          >
            <RefreshCw className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-[#28651B] hover:bg-[#1C4813] text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-70"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-[#D9A51B]" />}
            <span>Save &amp; Publish Live</span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      {message && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 text-xs sm:text-sm flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Sub-Tab Navigation Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-neutral-200 dark:border-neutral-700">
        {subTabs.map((st) => (
          <button
            key={st.id}
            type="button"
            onClick={() => setActiveSubTab(st.id as any)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === st.id
                ? 'bg-[#28651B] text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            {st.label}
          </button>
        ))}
      </div>

      {/* 1. HOMEPAGE & HERO EDITOR */}
      {activeSubTab === 'hero' && (
        <div className="bg-white dark:bg-neutral-800 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-neutral-900 dark:text-white pb-3 border-b border-neutral-100 dark:border-neutral-700">
            Hero Section Copy &amp; Media
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                Eyebrow Label
              </label>
              <input
                type="text"
                value={content.hero.eyebrow}
                onChange={(e) => setContent({ ...content, hero: { ...content.hero, eyebrow: e.target.value } })}
                className="w-full px-4 py-2.5 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-xl text-sm text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#28651B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                Primary CTA Button Label
              </label>
              <input
                type="text"
                value={content.hero.primaryCtaText}
                onChange={(e) => setContent({ ...content, hero: { ...content.hero, primaryCtaText: e.target.value } })}
                className="w-full px-4 py-2.5 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-xl text-sm text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#28651B]"
              />
            </div>
          </div>

          {/* Headline parts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                Headline (Beginning)
              </label>
              <input
                type="text"
                value={content.hero.headlineStart}
                onChange={(e) => setContent({ ...content, hero: { ...content.hero, headlineStart: e.target.value } })}
                className="w-full px-4 py-2.5 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-xl text-sm text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#28651B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-600 dark:text-[#D9A51B] uppercase tracking-wider mb-1.5">
                Highlighted Word (Gold)
              </label>
              <input
                type="text"
                value={content.hero.headlineHighlight}
                onChange={(e) => setContent({ ...content, hero: { ...content.hero, headlineHighlight: e.target.value } })}
                className="w-full px-4 py-2.5 bg-amber-50/50 dark:bg-neutral-700 border border-amber-200 dark:border-neutral-600 rounded-xl text-sm font-bold text-amber-900 dark:text-[#D9A51B] focus:ring-2 focus:ring-[#D9A51B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                Headline (End)
              </label>
              <input
                type="text"
                value={content.hero.headlineEnd}
                onChange={(e) => setContent({ ...content, hero: { ...content.hero, headlineEnd: e.target.value } })}
                className="w-full px-4 py-2.5 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-xl text-sm text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#28651B]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
              Supporting Hero Sub-headline
            </label>
            <textarea
              rows={2}
              value={content.hero.description}
              onChange={(e) => setContent({ ...content, hero: { ...content.hero, description: e.target.value } })}
              className="w-full px-4 py-2.5 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-xl text-sm text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#28651B]"
            />
          </div>

          {/* Hero Image URL & Preview */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
              Hero Visual Image URL
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="text"
                value={content.hero.heroImage}
                onChange={(e) => setContent({ ...content, hero: { ...content.hero, heroImage: e.target.value } })}
                placeholder="/src/assets/images/... or /uploads/..."
                className="flex-1 px-4 py-2.5 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-xl text-sm text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#28651B]"
              />
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-neutral-300 shrink-0 bg-neutral-100">
                <img
                  src={content.hero.heroImage}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/logo.jpg';
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. ABOUT US EDITOR */}
      {activeSubTab === 'about' && (
        <div className="bg-white dark:bg-neutral-800 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-5">
          <h3 className="text-base font-bold text-neutral-900 dark:text-white pb-3 border-b border-neutral-100 dark:border-neutral-700">
            About Us &amp; Agency Story
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                Brand Tagline
              </label>
              <input
                type="text"
                value={content.about.tagline}
                onChange={(e) => setContent({ ...content, about: { ...content.about, tagline: e.target.value } })}
                className="w-full px-4 py-2.5 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-xl text-sm text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                Main About Title
              </label>
              <input
                type="text"
                value={content.about.title}
                onChange={(e) => setContent({ ...content, about: { ...content.about, title: e.target.value } })}
                className="w-full px-4 py-2.5 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-xl text-sm text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
              Detailed Description
            </label>
            <textarea
              rows={3}
              value={content.about.description}
              onChange={(e) => setContent({ ...content, about: { ...content.about, description: e.target.value } })}
              className="w-full px-4 py-2.5 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-xl text-sm text-neutral-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                Agency Mission
              </label>
              <textarea
                rows={2}
                value={content.about.mission}
                onChange={(e) => setContent({ ...content, about: { ...content.about, mission: e.target.value } })}
                className="w-full px-4 py-2.5 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-xl text-sm text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                Agency Vision
              </label>
              <textarea
                rows={2}
                value={content.about.vision}
                onChange={(e) => setContent({ ...content, about: { ...content.about, vision: e.target.value } })}
                className="w-full px-4 py-2.5 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-xl text-sm text-neutral-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. SERVICES CRUD */}
      {activeSubTab === 'services' && (
        <div className="bg-white dark:bg-neutral-800 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-700">
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Services Offered
              </h3>
              <p className="text-xs text-neutral-500">Add, edit, or delete agency marketing services</p>
            </div>
            <button
              type="button"
              onClick={() =>
                setServiceModal({
                  id: `srv-${Date.now()}`,
                  title: '',
                  shortDesc: '',
                  fullDesc: '',
                  iconName: 'Share2',
                  highlighted: false,
                  order: content.services.length + 1,
                })
              }
              className="inline-flex items-center gap-1.5 bg-[#28651B] text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Service</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {content.services.map((srv) => (
              <div
                key={srv.id}
                className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-750 border border-neutral-200 dark:border-neutral-700 flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#28651B] dark:text-[#D9A51B] uppercase tracking-wider">
                      {srv.iconName}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setServiceModal(srv)}
                        className="p-1 text-neutral-500 hover:text-[#28651B] cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteService(srv.id)}
                        className="p-1 text-neutral-500 hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white mt-1">{srv.title}</h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-0.5">{srv.shortDesc}</p>
                  <p className="text-[11px] text-neutral-400 mt-2 line-clamp-2">{srv.fullDesc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. PORTFOLIO CRUD */}
      {activeSubTab === 'portfolio' && (
        <div className="bg-white dark:bg-neutral-800 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-700">
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Portfolio Projects
              </h3>
              <p className="text-xs text-neutral-500">Showcase past client results and marketing campaigns</p>
            </div>
            <button
              type="button"
              onClick={() =>
                setPortfolioModal({
                  id: `port-${Date.now()}`,
                  title: '',
                  category: 'Social Media & Performance Ads',
                  description: '',
                  client: '',
                  imageUrl: '/src/assets/images/hero_digital_marketing_1791888552925.jpg',
                  resultsMetric: '+200% Growth',
                  order: content.portfolio.length + 1,
                })
              }
              className="inline-flex items-center gap-1.5 bg-[#28651B] text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Portfolio Project</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {content.portfolio.map((proj) => (
              <div
                key={proj.id}
                className="rounded-2xl bg-neutral-50 dark:bg-neutral-750 border border-neutral-200 dark:border-neutral-700 overflow-hidden flex flex-col justify-between"
              >
                <div className="h-32 bg-neutral-200 relative">
                  <img src={proj.imageUrl} alt={proj.title} className="w-full h-full object-cover" />
                  <span className="absolute bottom-2 left-2 text-[10px] font-bold bg-[#28651B] text-white px-2 py-0.5 rounded-md">
                    {proj.resultsMetric}
                  </span>
                </div>
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-neutral-500 font-semibold uppercase">{proj.category}</span>
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white">{proj.title}</h4>
                    <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1 line-clamp-2">{proj.description}</p>
                    <p className="text-[11px] text-neutral-400 mt-1">Client: {proj.client}</p>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200/60">
                    <button
                      type="button"
                      onClick={() => setPortfolioModal(proj)}
                      className="text-xs font-semibold text-[#28651B] hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePortfolio(proj.id)}
                      className="text-xs font-semibold text-red-600 hover:underline cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. TESTIMONIALS CRUD */}
      {activeSubTab === 'testimonials' && (
        <div className="bg-white dark:bg-neutral-800 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-700">
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Client Testimonials &amp; Reviews
              </h3>
              <p className="text-xs text-neutral-500">Customer social proof and verified agency ratings</p>
            </div>
            <button
              type="button"
              onClick={() =>
                setTestimonialModal({
                  id: `test-${Date.now()}`,
                  clientName: '',
                  clientRole: 'Director',
                  clientCompany: '',
                  quote: '',
                  rating: 5,
                  featured: true,
                })
              }
              className="inline-flex items-center gap-1.5 bg-[#28651B] text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Testimonial</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {content.testimonials.map((test) => (
              <div
                key={test.id}
                className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-750 border border-neutral-200 dark:border-neutral-700 flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex text-amber-500">
                      {'★'.repeat(test.rating)}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setTestimonialModal(test)}
                        className="p-1 text-neutral-500 hover:text-[#28651B] cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTestimonial(test.id)}
                        className="p-1 text-neutral-500 hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 italic mt-2">"{test.quote}"</p>
                </div>
                <div className="pt-2 border-t border-neutral-200/60">
                  <h5 className="text-xs font-bold text-neutral-900 dark:text-white">{test.clientName}</h5>
                  <span className="text-[10px] text-neutral-500">{test.clientRole}, {test.clientCompany}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. CONTACT & LOCATION DETAILS */}
      {activeSubTab === 'contact' && (
        <div className="bg-white dark:bg-neutral-800 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-5">
          <h3 className="text-base font-bold text-neutral-900 dark:text-white pb-3 border-b border-neutral-100 dark:border-neutral-700">
            Agency Contact &amp; Location
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                Physical Office Address
              </label>
              <input
                type="text"
                value={content.contact.address}
                onChange={(e) => setContent({ ...content, contact: { ...content.contact, address: e.target.value } })}
                className="w-full px-4 py-2.5 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-xl text-sm text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                Office Hours
              </label>
              <input
                type="text"
                value={content.contact.workingHours}
                onChange={(e) => setContent({ ...content, contact: { ...content.contact, workingHours: e.target.value } })}
                className="w-full px-4 py-2.5 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-xl text-sm text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                Phone Number / Call Direct
              </label>
              <input
                type="text"
                value={content.contact.phone}
                onChange={(e) => setContent({ ...content, contact: { ...content.contact, phone: e.target.value } })}
                className="w-full px-4 py-2.5 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-xl text-sm text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                Official Agency Email
              </label>
              <input
                type="email"
                value={content.contact.email}
                onChange={(e) => setContent({ ...content, contact: { ...content.contact, email: e.target.value } })}
                className="w-full px-4 py-2.5 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-xl text-sm text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
              Google Maps Embed URL (iframe src)
            </label>
            <input
              type="text"
              value={content.contact.googleMapsEmbedUrl}
              onChange={(e) => setContent({ ...content, contact: { ...content.contact, googleMapsEmbedUrl: e.target.value } })}
              className="w-full px-4 py-2.5 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-xl text-xs font-mono text-neutral-900 dark:text-white"
            />
          </div>
        </div>
      )}

      {/* 7. SOCIAL MEDIA LINKS */}
      {activeSubTab === 'social' && (
        <div className="bg-white dark:bg-neutral-800 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-neutral-900 dark:text-white pb-3 border-b border-neutral-100 dark:border-neutral-700">
            Social Media Handles &amp; Links
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                Instagram URL
              </label>
              <input
                type="text"
                value={content.socialLinks.instagram}
                onChange={(e) => setContent({ ...content, socialLinks: { ...content.socialLinks, instagram: e.target.value } })}
                className="w-full px-4 py-2.5 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-xl text-sm text-neutral-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                WhatsApp Chat Link
              </label>
              <input
                type="text"
                value={content.socialLinks.whatsapp}
                onChange={(e) => setContent({ ...content, socialLinks: { ...content.socialLinks, whatsapp: e.target.value } })}
                className="w-full px-4 py-2.5 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-xl text-sm text-neutral-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                YouTube Channel
              </label>
              <input
                type="text"
                value={content.socialLinks.youtube}
                onChange={(e) => setContent({ ...content, socialLinks: { ...content.socialLinks, youtube: e.target.value } })}
                className="w-full px-4 py-2.5 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-xl text-sm text-neutral-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                LinkedIn Company Page
              </label>
              <input
                type="text"
                value={content.socialLinks.linkedin}
                onChange={(e) => setContent({ ...content, socialLinks: { ...content.socialLinks, linkedin: e.target.value } })}
                className="w-full px-4 py-2.5 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-xl text-sm text-neutral-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* SERVICE EDIT MODAL */}
      {serviceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-800 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-neutral-200 dark:border-neutral-700 space-y-4">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              {serviceModal.title ? 'Edit Service' : 'Add New Service'}
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Service Title</label>
                <input
                  type="text"
                  value={serviceModal.title}
                  onChange={(e) => setServiceModal({ ...serviceModal, title: e.target.value })}
                  placeholder="e.g. Influencer Collaborations"
                  className="w-full px-3 py-2 border rounded-xl bg-neutral-50 dark:bg-neutral-700 text-sm"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Short Description</label>
                <input
                  type="text"
                  value={serviceModal.shortDesc}
                  onChange={(e) => setServiceModal({ ...serviceModal, shortDesc: e.target.value })}
                  placeholder="e.g. Partner with viral creators."
                  className="w-full px-3 py-2 border rounded-xl bg-neutral-50 dark:bg-neutral-700 text-sm"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  value={serviceModal.fullDesc}
                  onChange={(e) => setServiceModal({ ...serviceModal, fullDesc: e.target.value })}
                  placeholder="Detailed breakdown of what this service covers..."
                  className="w-full px-3 py-2 border rounded-xl bg-neutral-50 dark:bg-neutral-700 text-sm"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setServiceModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveService(serviceModal)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#28651B] text-white cursor-pointer"
              >
                Save Service
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PORTFOLIO EDIT MODAL */}
      {portfolioModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-800 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-neutral-200 dark:border-neutral-700 space-y-4">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              {portfolioModal.title ? 'Edit Portfolio Project' : 'Add Portfolio Project'}
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Project Title</label>
                <input
                  type="text"
                  value={portfolioModal.title}
                  onChange={(e) => setPortfolioModal({ ...portfolioModal, title: e.target.value })}
                  placeholder="e.g. Diwali Mega Viral Campaign"
                  className="w-full px-3 py-2 border rounded-xl bg-neutral-50 dark:bg-neutral-700 text-sm"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Client Name</label>
                <input
                  type="text"
                  value={portfolioModal.client}
                  onChange={(e) => setPortfolioModal({ ...portfolioModal, client: e.target.value })}
                  placeholder="e.g. Sharma Sweets"
                  className="w-full px-3 py-2 border rounded-xl bg-neutral-50 dark:bg-neutral-700 text-sm"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Results Metric Badge</label>
                <input
                  type="text"
                  value={portfolioModal.resultsMetric}
                  onChange={(e) => setPortfolioModal({ ...portfolioModal, resultsMetric: e.target.value })}
                  placeholder="e.g. +300% Online Orders"
                  className="w-full px-3 py-2 border rounded-xl bg-neutral-50 dark:bg-neutral-700 text-sm"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Image URL</label>
                <input
                  type="text"
                  value={portfolioModal.imageUrl}
                  onChange={(e) => setPortfolioModal({ ...portfolioModal, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl bg-neutral-50 dark:bg-neutral-700 text-sm"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setPortfolioModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSavePortfolio(portfolioModal)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#28651B] text-white cursor-pointer"
              >
                Save Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TESTIMONIAL EDIT MODAL */}
      {testimonialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-800 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-neutral-200 dark:border-neutral-700 space-y-4">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              {testimonialModal.clientName ? 'Edit Testimonial' : 'Add Testimonial'}
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Client Name</label>
                <input
                  type="text"
                  value={testimonialModal.clientName}
                  onChange={(e) => setTestimonialModal({ ...testimonialModal, clientName: e.target.value })}
                  placeholder="e.g. Rohit Sharma"
                  className="w-full px-3 py-2 border rounded-xl bg-neutral-50 dark:bg-neutral-700 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">Client Role</label>
                  <input
                    type="text"
                    value={testimonialModal.clientRole}
                    onChange={(e) => setTestimonialModal({ ...testimonialModal, clientRole: e.target.value })}
                    placeholder="e.g. Owner"
                    className="w-full px-3 py-2 border rounded-xl bg-neutral-50 dark:bg-neutral-700 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Company</label>
                  <input
                    type="text"
                    value={testimonialModal.clientCompany}
                    onChange={(e) => setTestimonialModal({ ...testimonialModal, clientCompany: e.target.value })}
                    placeholder="e.g. Sharma Sweets"
                    className="w-full px-3 py-2 border rounded-xl bg-neutral-50 dark:bg-neutral-700 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold mb-1">Client Quote / Review</label>
                <textarea
                  rows={3}
                  value={testimonialModal.quote}
                  onChange={(e) => setTestimonialModal({ ...testimonialModal, quote: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl bg-neutral-50 dark:bg-neutral-700 text-sm"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setTestimonialModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveTestimonial(testimonialModal)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#28651B] text-white cursor-pointer"
              >
                Save Review
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
