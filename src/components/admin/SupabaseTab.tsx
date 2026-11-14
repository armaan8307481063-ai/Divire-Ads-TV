import React, { useState } from 'react';
import {
  Database,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Server,
  Code2,
} from 'lucide-react';
import { SUPABASE_SQL_SCHEMA, SUPABASE_URL } from '../../lib/supabase.js';
import { getAuthHeaders } from '../../lib/authHeader.js';

interface SupabaseTabProps {
  token: string;
}

export const SupabaseTab: React.FC<SupabaseTabProps> = ({ token }) => {
  const [status, setStatus] = useState<{
    connected: boolean;
    projectUrl: string;
    tables: Record<string, boolean>;
    message: string;
  } | null>(null);
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  const handleTestConnection = async () => {
    setTesting(true);
    setSyncResult(null);
    try {
      const res = await fetch('/api/admin/supabase-status', {
        headers: getAuthHeaders(token),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setStatus(json.data);
      }
    } catch (err) {
      console.error('Error checking Supabase:', err);
    } finally {
      setTesting(false);
    }
  };

  const handleSyncToSupabase = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch('/api/admin/supabase-sync', {
        method: 'POST',
        headers: getAuthHeaders(token),
      });
      const json = await res.json();
      if (json.success) {
        setSyncResult(`Successfully synced ${json.syncedCount} of ${json.totalCount} inquiries into Supabase tables!`);
      } else {
        setSyncResult(json.error || 'Failed to sync with Supabase.');
      }
    } catch {
      setSyncResult('Network error during Supabase sync.');
    } finally {
      setSyncing(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Overview Card */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-[#28651B] flex items-center justify-center font-bold">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  Supabase Cloud Backend
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  Configured
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5 font-mono">
                {SUPABASE_URL}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
            >
              {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              <span>Test Connection</span>
            </button>

            <button
              type="button"
              onClick={handleSyncToSupabase}
              disabled={syncing}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#28651B] hover:bg-[#1C4813] text-white text-xs font-semibold transition-all shadow-2xs cursor-pointer"
            >
              {syncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5 text-[#D9A51B]" />}
              <span>Sync All Inquiries</span>
            </button>
          </div>
        </div>

        {/* Sync or status feedback */}
        {syncResult && (
          <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
            <span>{syncResult}</span>
            <button
              type="button"
              onClick={() => setSyncResult(null)}
              className="text-emerald-600 hover:text-emerald-900 ml-2"
            >
              ×
            </button>
          </div>
        )}

        {status && (
          <div className="mt-4 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs space-y-2">
            <div className="flex items-center gap-2 font-semibold text-neutral-800 dark:text-neutral-200">
              {status.connected ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600" />
              )}
              <span>{status.message}</span>
            </div>
            <div className="text-neutral-500 dark:text-neutral-400">
              Tables verification: Inquiries ({status.tables?.inquiries ? 'Found' : 'Ready to create'}), Orders ({status.tables?.orders ? 'Found' : 'Ready to create'})
            </div>
          </div>
        )}
      </div>

      {/* SQL Migration Script Box */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-[#28651B]" />
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                Supabase SQL Setup Script
              </h3>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Run this script once in your Supabase SQL Editor to enable the tables with Row-Level Security (RLS).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://supabase.com/dashboard/project/yozpuxvrcvuvfxfhggsq/sql/new"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs font-semibold rounded-xl transition-colors"
            >
              <span>Open Supabase SQL Editor</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              type="button"
              onClick={handleCopySql}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#D9A51B] hover:bg-[#C49214] text-[#1C4813] text-xs font-bold rounded-xl transition-colors shadow-2xs cursor-pointer"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSql ? 'Copied!' : 'Copy SQL'}</span>
            </button>
          </div>
        </div>

        <div className="relative">
          <pre className="p-4 bg-neutral-900 text-neutral-100 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed border border-neutral-800 max-h-72">
            {SUPABASE_SQL_SCHEMA}
          </pre>
        </div>
      </div>
    </div>
  );
};
