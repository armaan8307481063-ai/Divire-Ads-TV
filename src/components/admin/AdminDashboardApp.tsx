import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  Users,
  FileEdit,
  Briefcase,
  Image as ImageIcon,
  Database,
  Settings,
  LogOut,
  ExternalLink,
  Sun,
  Moon,
  Menu,
  X,
  RefreshCw,
  Bell,
  Sparkles,
} from 'lucide-react';
import { AdminLogin } from './AdminLogin.js';
import { DashboardOverviewTab } from './DashboardOverviewTab.js';
import { LeadsManagementTab } from './LeadsManagementTab.js';
import { ContentManagementTab } from './ContentManagementTab.js';
import { ClientsProjectsTab } from './ClientsProjectsTab.js';
import { MediaLibraryTab } from './MediaLibraryTab.js';
import { SupabaseTab } from './SupabaseTab.js';
import { SettingsTab } from './SettingsTab.js';
import {
  DashboardStats,
  RecentActivity,
  ContactInquiry,
  AdminProfile,
} from '../../types.js';

import { sanitizeToken, getAuthHeaders } from '../../lib/authHeader.js';
import {
  subscribeToSupabaseInquiries,
  fetchDirectInquiriesFromSupabase,
} from '../../lib/supabase.js';

interface AdminDashboardAppProps {
  onExit?: () => void;
}

export const AdminDashboardApp: React.FC<AdminDashboardAppProps> = ({ onExit }) => {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return sanitizeToken(localStorage.getItem('divire_admin_token'));
    } catch {
      return null;
    }
  });
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('divire_admin_theme') === 'dark';
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Core Data
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [profile, setProfile] = useState<AdminProfile | null>(null);

  // Toggle Theme
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('divire_admin_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('divire_admin_theme', 'light');
    }
  }, [isDark]);

  // Fetch Dashboard Stats and Data
  const fetchAllData = useCallback(async () => {
    const validToken = sanitizeToken(token);
    if (!validToken) {
      if (token) {
        setToken(null);
        try { localStorage.removeItem('divire_admin_token'); } catch {}
      }
      return;
    }
    setLoadingData(true);
    try {
      const headers = getAuthHeaders(validToken);
      const [resStats, resActs, resInqs, resProf] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/admin/activities', { headers }),
        fetch('/api/admin/inquiries', { headers }),
        fetch('/api/admin/profile', { headers }),
      ]);

      if (resStats.status === 401 || resActs.status === 401) {
        setToken(null);
        try { localStorage.removeItem('divire_admin_token'); } catch {}
        return;
      }

      const jsonStats = await resStats.json();
      const jsonActs = await resActs.json();
      const jsonInqs = await resInqs.json();
      const jsonProf = await resProf.json();

      if (jsonStats.success) setStats(jsonStats.data);
      if (jsonActs.success) setActivities(jsonActs.data || []);
      
      let loadedInquiries: ContactInquiry[] = [];
      if (jsonInqs.success && Array.isArray(jsonInqs.data) && jsonInqs.data.length > 0) {
        loadedInquiries = jsonInqs.data;
      } else {
        // Direct Supabase fallback
        try {
          const directInqs = await fetchDirectInquiriesFromSupabase();
          if (directInqs.length > 0) {
            loadedInquiries = directInqs;
          }
        } catch (directErr) {
          console.warn('Direct Supabase fetch error:', directErr);
        }
      }
      setInquiries(loadedInquiries);

      if (jsonProf.success) setProfile(jsonProf.data);
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
      // Even on fetch error, attempt direct Supabase client query
      try {
        const directInqs = await fetchDirectInquiriesFromSupabase();
        if (directInqs.length > 0) {
          setInquiries(directInqs);
        }
      } catch {}
    } finally {
      setLoadingData(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchAllData();
    }
  }, [token, fetchAllData]);

  // Supabase Realtime Listener for instant lead updates
  useEffect(() => {
    if (!token) return;
    const unsubscribe = subscribeToSupabaseInquiries(() => {
      console.log('[Supabase Realtime] Event detected, refreshing inquiries...');
      fetchAllData();
    });
    return () => {
      unsubscribe();
    };
  }, [token, fetchAllData]);

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('divire_admin_token');
  };

  const handleExitToWebsite = () => {
    if (onExit) {
      onExit();
    } else {
      window.location.href = '/';
    }
  };

  // If not logged in, display the professional login screen
  if (!token) {
    return (
      <AdminLogin
        onLoginSuccess={(authToken, adminUser) => {
          setToken(authToken);
          if (adminUser) setProfile(adminUser);
        }}
        onBackToWebsite={handleExitToWebsite}
      />
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'leads', label: 'Leads & Inquiries', icon: Users, badge: stats?.newLeads ? `${stats.newLeads} new` : null },
    { id: 'content', label: 'Website Content', icon: FileEdit, badge: null },
    { id: 'clients_projects', label: 'Clients & Projects', icon: Briefcase, badge: null },
    { id: 'media', label: 'Media Library', icon: ImageIcon, badge: null },
    { id: 'supabase', label: 'Supabase Backend', icon: Database, badge: 'Live' },
    { id: 'settings', label: 'Admin Settings', icon: Settings, badge: null },
  ];

  return (
    <div className={`min-h-screen flex bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 ${isDark ? 'dark' : ''}`}>
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setSidebarOpen(false);
            }
          }}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden backdrop-blur-xs cursor-pointer"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-[#14370E] text-white flex flex-col justify-between transition-transform duration-300 ease-in-out shrink-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Brand Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-md">
                <img
                  src="/logo.png"
                  alt="Divire Ads TV"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback to stylized SVG if file not found
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                  Divire Ads TV
                </h1>
                <span className="text-[11px] font-semibold text-[#D9A51B] uppercase tracking-wider">
                  Admin Panel
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#28651B] text-white shadow-xs font-semibold'
                      : 'text-neutral-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#D9A51B]' : 'text-neutral-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-[#D9A51B] text-[#14370E]'
                          : 'bg-white/15 text-neutral-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Admin User Chip & Footer Links */}
          <div className="p-4 border-t border-white/10 bg-black/15 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#D9A51B] text-[#14370E] flex items-center justify-center font-bold text-sm shadow-xs">
                {profile?.name ? profile.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  {profile?.name || 'Administrator'}
                </p>
                <p className="text-[11px] text-neutral-300 truncate">
                  {profile?.email || 'divireadstv@gmail.com'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleExitToWebsite}
                title="Open Public Website"
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-2 bg-white/10 hover:bg-white/20 text-neutral-200 hover:text-white text-xs rounded-lg transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#D9A51B]" />
                <span>Live Site</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                title="Logout from dashboard"
                className="inline-flex items-center justify-center gap-1.5 py-1.5 px-3 bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="sr-only sm:not-sr-only sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top App Header */}
        <header className="sticky top-0 z-30 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl cursor-pointer"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white capitalize">
                {navItems.find((n) => n.id === activeTab)?.label || 'Dashboard'}
              </h2>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 hidden sm:block">
                Divire Ads TV Management Central
              </p>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2">
            {/* Refresh Button */}
            <button
              type="button"
              onClick={fetchAllData}
              disabled={loadingData}
              title="Refresh Data"
              className="p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin' : ''}`} />
            </button>

            {/* Dark / Light Toggle */}
            <button
              type="button"
              onClick={() => setIsDark(!isDark)}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 transition-colors cursor-pointer"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-600" />}
            </button>

            {/* Live Website Button */}
            <button
              type="button"
              onClick={handleExitToWebsite}
              className="inline-flex items-center gap-1.5 bg-[#28651B] hover:bg-[#1C4813] text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#D9A51B]" />
              <span className="hidden sm:inline">View Website</span>
            </button>
          </div>
        </header>

        {/* Tab Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardOverviewTab
              stats={stats}
              activities={activities}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onRefresh={fetchAllData}
            />
          )}

          {activeTab === 'leads' && (
            <LeadsManagementTab
              inquiries={inquiries}
              loading={loadingData}
              onRefresh={fetchAllData}
              token={token}
            />
          )}

          {activeTab === 'content' && (
            <ContentManagementTab
              token={token}
              onContentSaved={fetchAllData}
            />
          )}

          {activeTab === 'clients_projects' && (
            <ClientsProjectsTab token={token} />
          )}

          {activeTab === 'media' && (
            <MediaLibraryTab
              token={token}
              onSelectAsHeroImage={async (url) => {
                try {
                  await fetch('/api/admin/content', {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                      ...getAuthHeaders(token),
                    },
                    body: JSON.stringify({
                      hero: { heroImage: url },
                    }),
                  });
                  fetchAllData();
                  alert('Hero image updated successfully on the live website!');
                } catch (err) {
                  console.error('Failed to update hero image:', err);
                }
              }}
            />
          )}

          {activeTab === 'supabase' && (
            <SupabaseTab token={token} />
          )}

          {activeTab === 'settings' && (
            <SettingsTab
              token={token}
              onProfileUpdated={(updatedProf) => setProfile(updatedProf)}
            />
          )}
        </main>
      </div>
    </div>
  );
};
