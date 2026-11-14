import React, { useState } from 'react';
import {
  Search,
  Download,
  RefreshCw,
  Phone,
  MessageCircle,
  Mail,
  Building,
  Calendar,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Filter,
  Check,
  X,
  Loader2,
} from 'lucide-react';
import { ContactInquiry, InquiryStatus } from '../../types.js';
import { getAuthHeaders, sanitizeToken } from '../../lib/authHeader.js';

interface LeadsManagementTabProps {
  inquiries: ContactInquiry[];
  loading: boolean;
  onRefresh: () => void;
  token: string;
}

export const LeadsManagementTab: React.FC<LeadsManagementTabProps> = ({
  inquiries,
  loading,
  onRefresh,
  token,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [serviceFilter, setServiceFilter] = useState<string>('All');

  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Dynamic list of services extracted from live records plus defaults
  const availableServices = React.useMemo(() => {
    const set = new Set<string>();
    inquiries.forEach((inq) => {
      inq.services.forEach((s) => {
        if (s && s.trim()) set.add(s.trim());
      });
    });
    [
      'Social Media Management',
      'Google & Meta Paid Ads',
      'Content Creation',
      'Website Design',
      'SEO and Branding',
      'Paid Advertising',
    ].forEach((s) => set.add(s));
    return Array.from(set);
  }, [inquiries]);

  // Filter inquiries
  const filtered = inquiries.filter((inq) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      inq.name.toLowerCase().includes(q) ||
      inq.brandName.toLowerCase().includes(q) ||
      inq.email.toLowerCase().includes(q) ||
      inq.phone.includes(q) ||
      (inq.message && inq.message.toLowerCase().includes(q)) ||
      (inq.notes && inq.notes.toLowerCase().includes(q)) ||
      inq.services.some((s) => s.toLowerCase().includes(q));

    const matchesStatus =
      statusFilter === 'All' || inq.status.toLowerCase() === statusFilter.toLowerCase();

    const matchesService =
      serviceFilter === 'All' ||
      inq.services.some((s) => s.toLowerCase().includes(serviceFilter.toLowerCase()));

    return matchesSearch && matchesStatus && matchesService;
  });

  const handleStatusChange = async (id: string, newStatus: InquiryStatus) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(token),
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveNotes = async (id: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(token),
        },
        body: JSON.stringify({ notes: notesDraft }),
      });
      if (res.ok) {
        setEditingNotesId(null);
        onRefresh();
      }
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string, clientName: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete lead from "${clientName}"?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(token),
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error('Failed to delete inquiry:', err);
    }
  };

  const handleExportCsv = () => {
    const validToken = sanitizeToken(token);
    if (!validToken) return;
    window.open(`/api/admin/export-csv?token=${encodeURIComponent(validToken)}`, '_blank');
  };

  const statusColors: Record<InquiryStatus, { bg: string; text: string; border: string }> = {
    New: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
    Contacted: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
    Converted: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' },
    Rejected: { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-300' },
    Archived: { bg: 'bg-neutral-100', text: 'text-neutral-700', border: 'border-neutral-300' },
  };

  return (
    <div className="space-y-5">
      
      {/* Header and Toolbar */}
      <div className="bg-white dark:bg-neutral-800 rounded-3xl p-5 border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
                Customer Leads &amp; Form Submissions
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Live Supabase Sync
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Showing <strong className="text-neutral-900 dark:text-white font-bold">{filtered.length}</strong> of{' '}
              <strong className="text-neutral-900 dark:text-white font-bold">{inquiries.length}</strong> total customer inquiries
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 hover:bg-neutral-100 text-neutral-700 dark:text-neutral-200 transition-colors cursor-pointer"
              title="Refresh leads list from Supabase"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-2 bg-[#D9A51B] hover:bg-[#C49214] text-[#1C4813] font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filter controls row */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-700/60">
          {/* Search bar */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by client name, brand, phone, email, service, or message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-neutral-100 dark:bg-neutral-700/60 hover:bg-white focus:bg-white dark:focus:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-xl text-xs sm:text-sm text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#28651B]"
            />
          </div>

          {/* Status selector */}
          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-700/60 border border-neutral-200 dark:border-neutral-600 rounded-xl text-xs text-neutral-800 dark:text-neutral-200 focus:outline-hidden focus:ring-2 focus:ring-[#28651B]"
            >
              <option value="All">All Statuses ({inquiries.length})</option>
              <option value="New">New ({inquiries.filter((i) => i.status === 'New').length})</option>
              <option value="Contacted">Contacted ({inquiries.filter((i) => i.status === 'Contacted').length})</option>
              <option value="Converted">Converted ({inquiries.filter((i) => i.status === 'Converted').length})</option>
              <option value="Rejected">Rejected ({inquiries.filter((i) => i.status === 'Rejected').length})</option>
              <option value="Archived">Archived ({inquiries.filter((i) => i.status === 'Archived').length})</option>
            </select>
          </div>

          {/* Service filter */}
          <div className="sm:col-span-3">
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-700/60 border border-neutral-200 dark:border-neutral-600 rounded-xl text-xs text-neutral-800 dark:text-neutral-200 focus:outline-hidden focus:ring-2 focus:ring-[#28651B]"
            >
              <option value="All">All Services</option>
              {availableServices.map((serviceName) => (
                <option key={serviceName} value={serviceName}>
                  {serviceName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Leads List / Cards */}
      {loading ? (
        <div className="py-24 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#28651B] mx-auto mb-2" />
          <p className="text-xs text-neutral-500">Loading live inquiries from Supabase...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-neutral-800 rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-700 p-8">
          <Sparkles className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-neutral-800 dark:text-neutral-200">
            {inquiries.length === 0 ? 'No customer enquiries found in database' : 'No matching leads'}
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1">
            {inquiries.length === 0
              ? 'New leads submitted by clients will appear here automatically via Supabase.'
              : 'Try clearing your search query or setting the status and service filters to "All".'}
          </p>
          <button
            type="button"
            onClick={onRefresh}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#28651B] text-white text-xs font-bold rounded-xl hover:bg-[#1C4813] transition-colors cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh from Supabase</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((inq) => {
            const colors = statusColors[inq.status] || statusColors.New;
            const cleanPhone = inq.phone.replace(/[^0-9]/g, '');

            return (
              <div
                key={inq.id}
                className="bg-white dark:bg-neutral-800 rounded-3xl p-5 sm:p-6 border border-neutral-200 dark:border-neutral-700 shadow-xs hover:shadow-md transition-all flex flex-col gap-4"
              >
                {/* Top Row: Client Info, Date, Status Dropdown */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-700/60">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#28651B] text-[#D9A51B] font-bold text-base flex items-center justify-center shrink-0 shadow-xs">
                      {inq.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                          {inq.name}
                        </h2>
                        <span className="text-xs text-neutral-500 font-medium flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-neutral-400" />
                          <span>{inq.brandName}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-neutral-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(inq.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(inq.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span>·</span>
                        <span className="font-mono text-[10px] text-neutral-400">{inq.id}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Status Dropdown */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {/* Status Select */}
                    <div className="relative">
                      <select
                        value={inq.status}
                        onChange={(e) => handleStatusChange(inq.id, e.target.value as InquiryStatus)}
                        disabled={updatingId === inq.id}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border cursor-pointer appearance-none pr-7 ${colors.bg} ${colors.text} ${colors.border}`}
                      >
                        <option value="New">🟡 New Lead</option>
                        <option value="Contacted">🔵 Contacted</option>
                        <option value="Converted">🟢 Converted</option>
                        <option value="Rejected">🔴 Rejected</option>
                        <option value="Archived">⚪ Archived</option>
                      </select>
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleDelete(inq.id, inq.name)}
                      className="p-1.5 rounded-xl text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                      title="Delete inquiry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Middle Row: Contact Links & Services */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Contact Direct Actions */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <a
                      href={`tel:${inq.phone}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 text-xs font-semibold text-neutral-800 dark:text-neutral-200 rounded-xl transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#28651B]" />
                      <span>{inq.phone}</span>
                    </a>

                    <a
                      href={`mailto:${inq.email}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 text-xs font-semibold text-neutral-800 dark:text-neutral-200 rounded-xl transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5 text-blue-600" />
                      <span>{inq.email}</span>
                    </a>

                    <a
                      href={`https://wa.me/${cleanPhone}?text=Hi%20${encodeURIComponent(inq.name)},%20thank%20you%20for%20contacting%20Divire%20Ads%20TV!`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#128C7E] dark:text-[#25D366] text-xs font-bold rounded-xl transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-current" />
                      <span>WhatsApp</span>
                    </a>
                  </div>

                  {/* Services requested pills */}
                  <div className="flex flex-wrap items-center gap-1.5 md:justify-end">
                    {inq.services.map((srv, sIdx) => (
                      <span
                        key={sIdx}
                        className="text-[11px] font-medium bg-[#F2F5F0] dark:bg-neutral-700 text-[#1C4813] dark:text-[#D9A51B] px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-600"
                      >
                        {srv}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Message Body */}
                {inq.message && (
                  <div className="p-3.5 bg-neutral-50 dark:bg-neutral-750 rounded-2xl border border-neutral-100 dark:border-neutral-700 text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    <span className="font-bold text-neutral-900 dark:text-white block mb-0.5">Customer Message:</span>
                    <p>{inq.message}</p>
                  </div>
                )}

                {/* Internal Notes Row */}
                <div className="pt-2 border-t border-neutral-100 dark:border-neutral-700/60 flex items-center justify-between text-xs">
                  {editingNotesId === inq.id ? (
                    <div className="w-full flex items-center gap-2">
                      <input
                        type="text"
                        value={notesDraft}
                        onChange={(e) => setNotesDraft(e.target.value)}
                        placeholder="Add internal follow-up notes (e.g. called client, quote sent)..."
                        className="flex-1 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-xl text-xs text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#28651B]"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveNotes(inq.id)}
                        className="inline-flex items-center gap-1 bg-[#28651B] text-white px-3 py-1.5 rounded-xl font-bold cursor-pointer"
                      >
                        <Check className="w-3 h-3" />
                        <span>Save</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingNotesId(null)}
                        className="p-1.5 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-full flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Internal Notes:</span>
                        {inq.notes ? (
                          <span className="bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800 px-2.5 py-0.5 rounded-lg text-xs font-medium">
                            📝 {inq.notes}
                          </span>
                        ) : (
                          <span className="text-neutral-400 italic text-xs">No notes added</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingNotesId(inq.id);
                          setNotesDraft(inq.notes || '');
                        }}
                        className="inline-flex items-center gap-1 text-[#28651B] dark:text-[#D9A51B] hover:underline font-bold text-xs cursor-pointer ml-3"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>{inq.notes ? 'Edit' : 'Add Note'}</span>
                      </button>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
