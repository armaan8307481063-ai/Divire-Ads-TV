import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  LogOut,
  Search,
  Download,
  RefreshCw,
  Phone,
  MessageCircle,
  Trash2,
  X,
  Lock,
  Loader2,
  Calendar,
  Mail,
  Building,
  CheckCircle2,
  Clock,
  Sparkles,
  Edit3,
  Database,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import { ContactInquiry, InquiryStatus } from '../types.js';
import {
  SUPABASE_SQL_SCHEMA,
  SUPABASE_URL,
  subscribeToSupabaseInquiries,
  fetchDirectInquiriesFromSupabase,
} from '../lib/supabase.js';

import { sanitizeToken, getAuthHeaders } from '../lib/authHeader.js';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose }) => {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return sanitizeToken(localStorage.getItem('divire_admin_token'));
    } catch {
      return null;
    }
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [serviceFilter, setServiceFilter] = useState<string>('All');
  const [stats, setStats] = useState({ total: 0, new: 0, contacted: 0, converted: 0, archived: 0 });

  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState('');
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  const fetchInquiries = useCallback(async () => {
    const validToken = sanitizeToken(token);
    if (!validToken) {
      if (token) {
        setToken(null);
        try { localStorage.removeItem('divire_admin_token'); } catch {}
      }
      return;
    }
    setLoadingInquiries(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('q', searchQuery.trim());
      if (statusFilter !== 'All') params.append('status', statusFilter);
      if (serviceFilter !== 'All') params.append('service', serviceFilter);

      const qs = params.toString();
      const endpoint = qs ? `/api/admin/inquiries?${qs}` : '/api/admin/inquiries';

      const res = await fetch(endpoint, {
        headers: getAuthHeaders(validToken),
      });

      if (res.status === 401 || res.status === 403) {
        setToken(null);
        try { localStorage.removeItem('divire_admin_token'); } catch {}
        return;
      }

      const json = await res.json();
      if (json && json.success) {
        let loaded = json.data || [];
        if (loaded.length === 0) {
          try {
            const direct = await fetchDirectInquiriesFromSupabase();
            if (direct.length > 0) loaded = direct;
          } catch {}
        }
        setInquiries(loaded);
        if (json.stats) setStats(json.stats);
      }
    } catch (err) {
      console.error('Failed to load inquiries:', err);
      try {
        const direct = await fetchDirectInquiriesFromSupabase();
        if (direct.length > 0) setInquiries(direct);
      } catch {}
    } finally {
      setLoadingInquiries(false);
    }
  }, [token, searchQuery, statusFilter, serviceFilter]);

  useEffect(() => {
    if (isOpen && token) {
      fetchInquiries();
    }
  }, [isOpen, token, fetchInquiries]);

  // Realtime subscription for instant updates
  useEffect(() => {
    if (!isOpen || !token) return;
    const unsub = subscribeToSupabaseInquiries(() => {
      fetchInquiries();
    });
    return () => unsub();
  }, [isOpen, token, fetchInquiries]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Invalid credentials');
      }

      setToken(json.token);
      localStorage.setItem('divire_admin_token', json.token);
      setPasswordInput('');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setLoginError(err.message);
      } else {
        setLoginError('Authentication failed');
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('divire_admin_token');
  };

  const handleStatusChange = async (id: string, newStatus: InquiryStatus) => {
    const validToken = sanitizeToken(token);
    if (!validToken) return;
    setStatusUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(validToken),
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setInquiries((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
        );
        fetchInquiries();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleSaveNotes = async (id: string) => {
    const validToken = sanitizeToken(token);
    if (!validToken) return;
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(validToken),
        },
        body: JSON.stringify({ notes: notesDraft }),
      });

      if (res.ok) {
        setInquiries((prev) =>
          prev.map((item) => (item.id === id ? { ...item, notes: notesDraft } : item))
        );
        setEditingNotesId(null);
      }
    } catch (err) {
      console.error('Failed to save notes:', err);
    }
  };

  const handleDelete = async (id: string) => {
    const validToken = sanitizeToken(token);
    if (!validToken) return;
    if (!window.confirm('Are you sure you want to delete this enquiry? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(validToken),
      });

      if (res.ok) {
        setInquiries((prev) => prev.filter((item) => item.id !== id));
        fetchInquiries();
      }
    } catch (err) {
      console.error('Failed to delete inquiry:', err);
    }
  };

  const handleExportCsv = () => {
    const validToken = sanitizeToken(token);
    if (!validToken) return;
    // Download directly via authenticated endpoint
    window.open(`/api/admin/export-csv?token=${encodeURIComponent(validToken)}`, '_blank');
  };

  const [supabaseStatus, setSupabaseStatus] = useState<{
    connected: boolean;
    projectUrl: string;
    tables: Record<string, boolean>;
    message: string;
  } | null>(null);
  const [testingSupabase, setTestingSupabase] = useState(false);
  const [syncingSupabase, setSyncingSupabase] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const handleTestSupabase = async () => {
    const validToken = sanitizeToken(token);
    if (!validToken) return;
    setTestingSupabase(true);
    setSyncMessage(null);
    try {
      const res = await fetch('/api/admin/supabase-status', {
        headers: getAuthHeaders(validToken),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setSupabaseStatus(json.data);
      }
    } catch (err) {
      console.error('Failed to test Supabase:', err);
    } finally {
      setTestingSupabase(false);
    }
  };

  const handleSyncSupabase = async () => {
    const validToken = sanitizeToken(token);
    if (!validToken) return;
    setSyncingSupabase(true);
    setSyncMessage(null);
    try {
      const res = await fetch('/api/admin/supabase-sync', {
        method: 'POST',
        headers: getAuthHeaders(validToken),
      });
      const json = await res.json();
      if (json.success) {
        setSyncMessage(`Synced ${json.syncedCount} of ${json.totalCount} enquiries to Supabase!`);
      } else {
        setSyncMessage(json.error || 'Sync failed');
      }
    } catch (err) {
      setSyncMessage(err instanceof Error ? err.message : 'Error syncing');
    } finally {
      setSyncingSupabase(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-6xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-neutral-200">
        
        {/* Header Bar */}
        <div className="px-6 py-4.5 bg-[#1C4813] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#D9A51B] flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5 text-[#1C4813]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                Divire Ads TV — Admin Console
              </h2>
              <p className="text-xs text-neutral-300">
                Lead Management &amp; Client Inquiries
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {token && (
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-neutral-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              aria-label="Close Admin Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        {!token ? (
          /* Login Screen */
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center flex-1 overflow-y-auto">
            <div className="w-full max-w-md bg-[#F2F5F0] p-8 rounded-3xl border border-neutral-200 text-center shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-[#28651B] text-[#D9A51B] flex items-center justify-center mx-auto mb-4 shadow-md">
                <Lock className="w-7 h-7" />
              </div>

              <h3 className="text-xl font-bold text-neutral-900 mb-2">
                Administrator Sign In
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 mb-6">
                Enter your administrative key to view client inquiries, manage status, and export reports.
              </p>

              {loginError && (
                <div className="mb-4 p-3 rounded-xl bg-red-100 border border-red-200 text-red-800 text-xs">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <input
                    type="password"
                    placeholder="Enter Admin Password (default: divire2025)"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    required
                    autoFocus
                    className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#28651B] text-sm text-neutral-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full bg-[#28651B] hover:bg-[#1C4813] text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loginLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Unlock Dashboard</span>
                  )}
                </button>
              </form>

              <p className="text-[11px] text-neutral-500 mt-4">
                Tip: Default password is <code className="bg-neutral-200 px-1.5 py-0.5 rounded text-neutral-800 font-mono">divire2025</code> (changeable via .env).
              </p>
            </div>
          </div>
        ) : (
          /* Main Dashboard */
          <div className="flex-1 flex flex-col overflow-hidden bg-neutral-50">
            
            {/* Top Stats Strip */}
            <div className="p-4 sm:p-6 bg-white border-b border-neutral-200">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="bg-[#F2F5F0] p-3 rounded-2xl border border-neutral-200">
                  <span className="text-[11px] font-semibold text-neutral-600 uppercase">Total Inquiries</span>
                  <p className="text-xl font-bold text-neutral-900 mt-0.5 tabular-nums">{stats.total}</p>
                </div>
                <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200">
                  <span className="text-[11px] font-semibold text-amber-700 uppercase">New Leads</span>
                  <p className="text-xl font-bold text-amber-900 mt-0.5 tabular-nums">{stats.new}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-2xl border border-blue-200">
                  <span className="text-[11px] font-semibold text-blue-700 uppercase">Contacted</span>
                  <p className="text-xl font-bold text-blue-900 mt-0.5 tabular-nums">{stats.contacted}</p>
                </div>
                <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200">
                  <span className="text-[11px] font-semibold text-emerald-700 uppercase">Converted</span>
                  <p className="text-xl font-bold text-emerald-900 mt-0.5 tabular-nums">{stats.converted}</p>
                </div>
                <div className="bg-neutral-100 p-3 rounded-2xl border border-neutral-200 col-span-2 sm:col-span-1">
                  <span className="text-[11px] font-semibold text-neutral-600 uppercase">Archived</span>
                  <p className="text-xl font-bold text-neutral-800 mt-0.5 tabular-nums">{stats.archived}</p>
                </div>
              </div>

              {/* Supabase Backend Integration Banner */}
              <div className="mt-3.5 p-3.5 bg-gradient-to-r from-emerald-950/5 via-emerald-900/10 to-amber-950/5 rounded-2xl border border-emerald-800/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#28651B] text-[#D9A51B] flex items-center justify-center shrink-0 shadow-xs">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-neutral-900">Supabase Backend</span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                        Connected
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-600 truncate max-w-md">
                      Project: <code className="text-[#28651B] font-mono font-medium">yozpuxvrcvuvfxfhggsq.supabase.co</code> · Tables: <code className="font-mono">orders</code>, <code className="font-mono">inquiries</code>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleTestSupabase}
                    disabled={testingSupabase}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-200 px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer"
                  >
                    {testingSupabase ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                    <span>Test Ping</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSyncSupabase}
                    disabled={syncingSupabase}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1C4813] bg-[#D9A51B]/20 hover:bg-[#D9A51B]/30 border border-[#D9A51B]/40 px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer"
                  >
                    {syncingSupabase ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
                    <span>Sync to Supabase</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowSqlModal(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#28651B] hover:bg-[#1C4813] px-3 py-1.5 rounded-xl transition-colors shadow-2xs cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#D9A51B]" />
                    <span>SQL Schema</span>
                  </button>
                </div>
              </div>

              {/* Live sync/status toast feedback if triggered */}
              {(syncMessage || supabaseStatus) && (
                <div className="mt-2 px-3 py-2 bg-neutral-100 rounded-xl text-xs text-neutral-700 flex items-center justify-between border border-neutral-200">
                  <span className="font-medium">
                    {syncMessage || supabaseStatus?.message}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSyncMessage(null);
                      setSupabaseStatus(null);
                    }}
                    className="text-neutral-400 hover:text-neutral-700 text-xs ml-2 cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Action & Filter Toolbar */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-2">
                
                {/* Search */}
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by client, brand, phone, email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-neutral-100 hover:bg-white focus:bg-white border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-[#28651B]"
                  />
                </div>

                {/* Status Segmented Control */}
                <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl text-xs font-medium overflow-x-auto">
                  {['All', 'New', 'Contacted', 'Converted', 'Archived'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                        statusFilter === st
                          ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                          : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                {/* Service Filter */}
                <select
                  value={serviceFilter}
                  onChange={(e) => setServiceFilter(e.target.value)}
                  className="px-3 py-2 bg-neutral-100 border border-neutral-200 rounded-xl text-xs text-neutral-800 focus:outline-hidden focus:ring-2 focus:ring-[#28651B]"
                >
                  <option value="All">All Services</option>
                  <option value="Social Media Management">Social Media</option>
                  <option value="Content Creation">Content Creation</option>
                  <option value="Google & Meta Ads">Google &amp; Meta Ads</option>
                  <option value="Paid Advertising">Paid Advertising</option>
                  <option value="Website Design">Website Design</option>
                  <option value="SEO and Branding">SEO &amp; Branding</option>
                </select>

                {/* Buttons: Refresh & Export */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={fetchInquiries}
                    disabled={loadingInquiries}
                    title="Refresh data"
                    className="p-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-700 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingInquiries ? 'animate-spin' : ''}`} />
                  </button>

                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="inline-flex items-center gap-1.5 bg-[#D9A51B] hover:bg-[#C49214] text-[#1C4813] font-semibold text-xs px-3.5 py-2 rounded-xl transition-colors shadow-2xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                </div>

              </div>
            </div>

            {/* Inquiries List View */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {loadingInquiries ? (
                <div className="py-20 flex flex-col items-center justify-center text-neutral-400">
                  <Loader2 className="w-8 h-8 animate-spin text-[#28651B] mb-2" />
                  <p className="text-sm">Loading enquiries database...</p>
                </div>
              ) : inquiries.length === 0 ? (
                <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-neutral-300 p-8">
                  <Sparkles className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                  <h4 className="text-base font-semibold text-neutral-800">No enquiries found</h4>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1">
                    {searchQuery || statusFilter !== 'All' || serviceFilter !== 'All'
                      ? 'Try adjusting your search query or status filter.'
                      : 'Submitted form submissions will appear here instantly.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {inquiries.map((inq) => {
                    const statusBadgeColors: Record<InquiryStatus, string> = {
                      New: 'bg-amber-100 text-amber-800 border-amber-300',
                      Contacted: 'bg-blue-100 text-blue-800 border-blue-300',
                      Converted: 'bg-emerald-100 text-emerald-800 border-emerald-300',
                      Rejected: 'bg-red-100 text-red-800 border-red-300',
                      Archived: 'bg-neutral-100 text-neutral-700 border-neutral-300',
                    };

                    return (
                      <div
                        key={inq.id}
                        className="bg-white rounded-2xl p-5 border border-neutral-200/90 shadow-2xs hover:shadow-xs transition-shadow"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          {/* Client Header Info */}
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-base font-bold text-neutral-900">
                                {inq.name}
                              </h4>
                              <span className="text-neutral-400">·</span>
                              <span className="text-sm font-semibold text-[#28651B] flex items-center gap-1">
                                <Building className="w-3.5 h-3.5" />
                                {inq.brandName}
                              </span>
                              <span
                                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${statusBadgeColors}`}
                              >
                                {inq.status}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 pt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                                {new Date(inq.createdAt).toLocaleString('en-IN', {
                                  dateStyle: 'medium',
                                  timeStyle: 'short',
                                })}
                              </span>
                              <span className="flex items-center gap-1">
                                <Mail className="w-3.5 h-3.5 text-neutral-400" />
                                <a href={`mailto:${inq.email}`} className="text-neutral-700 hover:text-[#28651B] underline">
                                  {inq.email}
                                </a>
                              </span>
                              <span className="flex items-center gap-1">
                                <Phone className="w-3.5 h-3.5 text-neutral-400" />
                                <a href={`tel:${inq.phone}`} className="text-neutral-700 hover:text-[#28651B] font-medium">
                                  {inq.phone}
                                </a>
                              </span>
                            </div>
                          </div>

                          {/* Quick Response Actions */}
                          <div className="flex items-center gap-2 self-start">
                            {/* WhatsApp Direct */}
                            <a
                              href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(
                                inq.name
                              )},%20this%20is%20Divire%20Ads%20TV%20following%20up%20on%20your%20marketing%20inquiry.`}
                              target="_blank"
                              rel="noreferrer"
                              title="Chat on WhatsApp"
                              className="p-2 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors flex items-center gap-1 text-xs font-semibold"
                            >
                              <MessageCircle className="w-4 h-4 fill-emerald-600" />
                              <span className="hidden md:inline">WhatsApp</span>
                            </a>

                            {/* Direct Call */}
                            <a
                              href={`tel:${inq.phone}`}
                              title="Call client"
                              className="p-2 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors flex items-center gap-1 text-xs font-semibold"
                            >
                              <Phone className="w-4 h-4" />
                              <span className="hidden md:inline">Call</span>
                            </a>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => handleDelete(inq.id)}
                              title="Delete inquiry"
                              className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Services Badges */}
                        <div className="mt-3.5 pt-3 border-t border-neutral-100">
                          <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5">
                            Services Needed:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {inq.services.map((srv) => (
                              <span
                                key={srv}
                                className="text-xs font-medium px-2.5 py-1 bg-[#F2F5F0] text-[#1C4813] rounded-lg border border-neutral-200/60"
                              >
                                {srv}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Client Message */}
                        {inq.message && (
                          <div className="mt-3 p-3 bg-neutral-50 rounded-xl text-xs text-neutral-700 border border-neutral-150">
                            <span className="font-semibold text-neutral-900 block mb-0.5">Note from client:</span>
                            {inq.message}
                          </div>
                        )}

                        {/* Status Update & Internal Notes */}
                        <div className="mt-4 pt-3 border-t border-neutral-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
                          {/* Status Picker */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-neutral-600">Update Status:</span>
                            <div className="flex items-center gap-1">
                              {(['New', 'Contacted', 'Converted', 'Archived'] as InquiryStatus[]).map((st) => (
                                <button
                                  key={st}
                                  type="button"
                                  disabled={statusUpdatingId === inq.id || inq.status === st}
                                  onClick={() => handleStatusChange(inq.id, st)}
                                  className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-colors cursor-pointer ${
                                    inq.status === st
                                      ? 'bg-[#28651B] text-white border-[#28651B] shadow-2xs'
                                      : 'bg-white text-neutral-700 hover:bg-neutral-100 border-neutral-200'
                                  }`}
                                >
                                  {st}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Notes */}
                          <div className="flex items-center gap-2">
                            {editingNotesId === inq.id ? (
                              <div className="flex items-center gap-1.5 w-full md:w-auto">
                                <input
                                  type="text"
                                  value={notesDraft}
                                  onChange={(e) => setNotesDraft(e.target.value)}
                                  placeholder="Add follow-up notes..."
                                  className="text-xs px-2.5 py-1 bg-white border border-neutral-300 rounded-lg w-48 sm:w-64 focus:outline-hidden focus:ring-1 focus:ring-[#28651B]"
                                  autoFocus
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveNotes(inq.id)}
                                  className="text-xs bg-[#28651B] text-white px-2.5 py-1 rounded-lg hover:bg-[#1C4813] font-medium"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingNotesId(null)}
                                  className="text-xs text-neutral-500 hover:text-neutral-800 px-1"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-xs text-neutral-600">
                                {inq.notes ? (
                                  <span className="bg-amber-50 text-amber-900 border border-amber-200/80 px-2 py-0.5 rounded-md max-w-xs truncate">
                                    📝 {inq.notes}
                                  </span>
                                ) : (
                                  <span className="text-neutral-400 italic">No notes</span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingNotesId(inq.id);
                                    setNotesDraft(inq.notes || '');
                                  }}
                                  className="text-[#28651B] hover:underline inline-flex items-center gap-1 font-medium cursor-pointer"
                                >
                                  <Edit3 className="w-3 h-3" />
                                  <span>{inq.notes ? 'Edit' : 'Add Note'}</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

        {/* Supabase SQL Schema Modal */}
        {showSqlModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-neutral-200 flex flex-col max-h-[85vh]">
              <div className="px-6 py-4 bg-[#1C4813] text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Database className="w-5 h-5 text-[#D9A51B]" />
                  <div>
                    <h3 className="text-sm font-bold">Supabase PostgreSQL Schema</h3>
                    <p className="text-[11px] text-neutral-300">Run this once in your Supabase SQL Editor</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSqlModal(false)}
                  className="p-1 rounded-lg text-neutral-300 hover:text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 overflow-y-auto flex-1 space-y-3 text-xs text-neutral-700">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 leading-relaxed">
                  <strong>Instructions:</strong> Open your Supabase Dashboard (<a href="https://supabase.com/dashboard/project/yozpuxvrcvuvfxfhggsq/sql/new" target="_blank" rel="noreferrer" className="underline font-semibold text-[#1C4813] hover:text-[#28651B]">Open SQL Editor for yozpuxvrcvuvfxfhggsq ↗</a>) &gt; Paste this script &gt; Click <strong>Run</strong>.
                </div>

                <div className="relative">
                  <pre className="p-4 bg-neutral-900 text-neutral-100 rounded-2xl font-mono text-[11px] overflow-x-auto leading-relaxed border border-neutral-800 max-h-72">
                    {SUPABASE_SQL_SCHEMA}
                  </pre>
                  <button
                    type="button"
                    onClick={handleCopySql}
                    className="absolute top-3 right-3 inline-flex items-center gap-1.5 bg-[#D9A51B] hover:bg-[#C49214] text-[#1C4813] font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm transition-all"
                  >
                    {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSql ? 'Copied!' : 'Copy SQL'}</span>
                  </button>
                </div>
              </div>

              <div className="px-6 py-3 bg-neutral-100 border-t border-neutral-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSqlModal(false)}
                  className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-medium text-xs rounded-xl"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#28651B] hover:bg-[#1C4813] text-white font-medium text-xs rounded-xl"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-[#D9A51B]" /> : <Copy className="w-3.5 h-3.5 text-[#D9A51B]" />}
                  <span>{copiedSql ? 'Copied to Clipboard' : 'Copy Query'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
