import React from 'react';
import {
  Users,
  Send,
  MessageSquare,
  Briefcase,
  Layers,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
  ExternalLink,
  PlusCircle,
  UploadCloud,
  FileEdit,
} from 'lucide-react';
import { DashboardStats, RecentActivity } from '../../types.js';

interface DashboardOverviewTabProps {
  stats: DashboardStats | null;
  activities: RecentActivity[];
  onNavigateTab: (tabId: string) => void;
  onRefresh: () => void;
}

export const DashboardOverviewTab: React.FC<DashboardOverviewTabProps> = ({
  stats,
  activities,
  onNavigateTab,
  onRefresh,
}) => {
  const statCards = [
    {
      title: 'Total Website Visitors',
      value: stats?.totalVisitors.toLocaleString() || '4,850',
      subtitle: `+${stats?.visitorsToday || 142} today`,
      icon: Users,
      color: 'from-emerald-500/10 to-emerald-500/5 text-emerald-700 border-emerald-200',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      title: 'Form Submissions',
      value: stats?.totalSubmissions || '0',
      subtitle: `${stats?.newLeads || 0} unread leads`,
      icon: Send,
      color: 'from-amber-500/10 to-amber-500/5 text-amber-700 border-amber-200',
      badgeColor: 'bg-amber-100 text-amber-800',
      actionTab: 'leads',
    },
    {
      title: 'Client Inquiries',
      value: stats?.totalInquiries || '0',
      subtitle: `${stats?.convertedLeads || 0} converted to clients`,
      icon: MessageSquare,
      color: 'from-blue-500/10 to-blue-500/5 text-blue-700 border-blue-200',
      badgeColor: 'bg-blue-100 text-blue-800',
      actionTab: 'leads',
    },
    {
      title: 'Active Services',
      value: stats?.totalServices || '5',
      subtitle: 'Managed across agency',
      icon: Layers,
      color: 'from-purple-500/10 to-purple-500/5 text-purple-700 border-purple-200',
      badgeColor: 'bg-purple-100 text-purple-800',
      actionTab: 'content',
    },
    {
      title: 'Marketing Projects',
      value: stats?.totalProjects || '3',
      subtitle: `${stats?.activeProjects || 2} in active production`,
      icon: Briefcase,
      color: 'from-[#28651B]/15 to-[#28651B]/5 text-[#1C4813] border-[#28651B]/20',
      badgeColor: 'bg-[#F2F5F0] text-[#1C4813]',
      actionTab: 'projects',
    },
    {
      title: 'Inquiry Conversion',
      value: stats?.conversionRate || '25.0%',
      subtitle: 'Lead to customer ratio',
      icon: TrendingUp,
      color: 'from-amber-600/10 to-amber-600/5 text-amber-800 border-amber-200',
      badgeColor: 'bg-amber-50 text-amber-900',
    },
  ];

  const chartData = stats?.chartData || [
    { day: 'Mon', visitors: 110, inquiries: 3 },
    { day: 'Tue', visitors: 145, inquiries: 4 },
    { day: 'Wed', visitors: 132, inquiries: 2 },
    { day: 'Thu', visitors: 168, inquiries: 6 },
    { day: 'Fri', visitors: 195, inquiries: 5 },
    { day: 'Sat', visitors: 220, inquiries: 8 },
    { day: 'Sun', visitors: 180, inquiries: 4 },
  ];

  const maxVisitors = Math.max(...chartData.map((d) => d.visitors), 250);

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#1C4813] via-[#28651B] to-[#1C4813] text-white p-6 sm:p-8 overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#D9A51B]/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-[#D9A51B]/20 border border-[#D9A51B]/40 px-3 py-1 rounded-full text-xs font-semibold text-[#D9A51B]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Agency Executive Control</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Welcome back, Administrator
            </h1>
            <p className="text-sm text-neutral-200 leading-relaxed font-normal">
              Manage your entire digital marketing agency, live customer leads, marketing projects, and website content from one central system.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigateTab('leads')}
              className="inline-flex items-center gap-2 bg-[#D9A51B] hover:bg-[#C49214] text-[#1C4813] font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>View Inquiries</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('content')}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all border border-white/20 cursor-pointer"
            >
              <FileEdit className="w-4 h-4" />
              <span>Edit Website</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('media')}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all border border-white/20 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Media Library</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6 Key Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`p-5 rounded-2xl bg-gradient-to-br ${card.color} border shadow-xs transition-all hover:shadow-md flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-xs">
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                  {card.value}
                </span>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${card.badgeColor}`}>
                  {card.subtitle}
                </span>
              </div>

              {card.actionTab && (
                <button
                  type="button"
                  onClick={() => onNavigateTab(card.actionTab!)}
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-neutral-700 hover:text-[#28651B] transition-colors cursor-pointer group"
                >
                  <span>Manage {card.title}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Two Column Grid: Weekly Performance Chart & Live Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Weekly Traffic & Leads Chart */}
        <div className="lg:col-span-7 bg-white dark:bg-neutral-800 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-700 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                Weekly Traffic &amp; Inquiries
              </h2>
              <p className="text-xs text-neutral-500">
                Visitor volume vs customer inquiries over the past 7 days
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium">
              <span className="inline-flex items-center gap-1.5 text-neutral-600 dark:text-neutral-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#28651B]" /> Visitors
              </span>
              <span className="inline-flex items-center gap-1.5 text-neutral-600 dark:text-neutral-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D9A51B]" /> Inquiries
              </span>
            </div>
          </div>

          {/* Simple Clean Responsive Bar Chart */}
          <div className="pt-6 pb-2">
            <div className="h-48 flex items-end justify-between gap-2 sm:gap-4 px-2 border-b border-neutral-200 dark:border-neutral-700">
              {chartData.map((d, i) => {
                const visitorHeight = Math.round((d.visitors / maxVisitors) * 100);
                const inquiryHeight = Math.min(Math.round((d.inquiries / 10) * 100), 100);

                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 bg-neutral-900 text-white text-[10px] rounded-lg py-1 px-2 whitespace-nowrap z-20 pointer-events-none shadow-md">
                      {d.visitors} visitors · {d.inquiries} leads
                    </div>

                    <div className="w-full flex items-end justify-center gap-1 h-40">
                      {/* Visitors bar */}
                      <div
                        style={{ height: `${visitorHeight}%` }}
                        className="w-full max-w-[20px] bg-[#28651B] hover:bg-[#1C4813] rounded-t-md transition-all duration-300 shadow-2xs"
                      />
                      {/* Inquiries bar */}
                      <div
                        style={{ height: `${inquiryHeight}%` }}
                        className="w-full max-w-[12px] bg-[#D9A51B] hover:bg-[#C49214] rounded-t-md transition-all duration-300 shadow-2xs"
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-neutral-500 mt-2">
                      {d.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-700/60 flex items-center justify-between text-xs text-neutral-500">
            <span>Average conversion rate: <strong className="text-neutral-800 dark:text-neutral-200">{stats?.conversionRate}</strong></span>
            <button
              type="button"
              onClick={onRefresh}
              className="text-[#28651B] hover:underline font-semibold cursor-pointer"
            >
              Refresh Data
            </button>
          </div>
        </div>

        {/* Right Column: Recent Activities Feed */}
        <div className="lg:col-span-5 bg-white dark:bg-neutral-800 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-700 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                Recent Activities
              </h2>
              <p className="text-xs text-neutral-500">
                Audit trail of leads and content updates
              </p>
            </div>
            <Clock className="w-4 h-4 text-neutral-400" />
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto max-h-[320px] pr-1">
            {activities.length === 0 ? (
              <p className="text-xs text-neutral-400 text-center py-10">No recent activity logged.</p>
            ) : (
              activities.map((act) => {
                const badgeBg =
                  act.type === 'inquiry'
                    ? 'bg-amber-100 text-amber-800'
                    : act.type === 'project'
                    ? 'bg-blue-100 text-blue-800'
                    : act.type === 'client'
                    ? 'bg-purple-100 text-purple-800'
                    : act.type === 'auth'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-emerald-100 text-emerald-800';

                return (
                  <div
                    key={act.id}
                    className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-750 border border-neutral-100 dark:border-neutral-700/80 flex items-start gap-3 transition-colors hover:bg-neutral-100/80"
                  >
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${badgeBg}`}>
                      {act.type}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <h4 className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                          {act.title}
                        </h4>
                        <span className="text-[10px] text-neutral-400 shrink-0">
                          {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-0.5 line-clamp-2">
                        {act.description}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
