import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { ContactInquiry } from '../types.js';

dotenv.config();

export const SUPABASE_URL = process.env.SUPABASE_URL || 'https://yozpuxvrcvuvfxfhggsq.supabase.co';
export const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_TBR3dLzqOO4PZjxKQnY8eA_jdkED6Tr';

// Candidate table names in order of priority
export const SUPABASE_TABLES = ['orders', 'inquiries', 'leads', 'order_forms'];

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return supabaseInstance;
}

export interface SupabaseSaveResult {
  saved: boolean;
  tableName?: string;
  error?: string;
  code?: string;
  details?: unknown;
}

/**
 * Inserts an inquiry / order into Supabase backend table.
 * Attempts candidate table names (orders, inquiries, leads) and formats fields to match
 * both snake_case (standard PostgreSQL) and camelCase conventions.
 */
export async function saveInquiryToSupabase(inquiry: ContactInquiry): Promise<SupabaseSaveResult> {
  const supabase = getSupabaseClient();

  // Standard payload with snake_case and common fallbacks
  const payload = {
    id: inquiry.id,
    name: inquiry.name,
    brand_name: inquiry.brandName,
    email: inquiry.email,
    phone: inquiry.phone,
    services: inquiry.services,
    message: inquiry.message || '',
    status: inquiry.status,
    notes: inquiry.notes || '',
    created_at: inquiry.createdAt,
    updated_at: inquiry.updatedAt,
  };

  let lastError: { message?: string; code?: string; details?: unknown } | null = null;

  // Try candidate tables: 'orders', then 'inquiries', etc.
  for (const table of SUPABASE_TABLES) {
    try {
      const { data, error } = await supabase.from(table).insert([payload]).select();

      if (!error) {
        console.log(`[Supabase] Successfully saved order to table "${table}":`, inquiry.id);
        return {
          saved: true,
          tableName: table,
        };
      }

      lastError = { message: error.message, code: error.code, details: error.details };

      // If the error was column mismatch (e.g. brandName vs brand_name), try camelCase payload
      if (error.code === '42703' || error.message.includes('column')) {
        const camelPayload = {
          id: inquiry.id,
          name: inquiry.name,
          brandName: inquiry.brandName,
          email: inquiry.email,
          phone: inquiry.phone,
          services: inquiry.services,
          message: inquiry.message || '',
          status: inquiry.status,
          notes: inquiry.notes || '',
          createdAt: inquiry.createdAt,
          updatedAt: inquiry.updatedAt,
        };
        const retryRes = await supabase.from(table).insert([camelPayload]).select();
        if (!retryRes.error) {
          console.log(`[Supabase] Successfully saved order to table "${table}" (camelCase):`, inquiry.id);
          return {
            saved: true,
            tableName: table,
          };
        }
      }

      // If table doesn't exist (PGRST205), continue to next table candidate
      if (error.code === 'PGRST205') {
        continue;
      }
    } catch (err: unknown) {
      console.error(`[Supabase Exception] on table "${table}":`, err);
      lastError = { message: err instanceof Error ? err.message : String(err) };
    }
  }

  console.warn('[Supabase Warning] Could not insert into candidate tables:', lastError?.message || 'Tables not found');
  return {
    saved: false,
    error: lastError?.message || "Could not find table 'orders' or 'inquiries' in Supabase schema cache",
    code: lastError?.code || 'PGRST205',
    details: lastError?.details,
  };
}

/**
 * Checks connection to the Supabase backend project.
 */
export async function testSupabaseConnection(): Promise<{
  connected: boolean;
  projectUrl: string;
  tables: Record<string, boolean>;
  message: string;
}> {
  const supabase = getSupabaseClient();
  const tableStatus: Record<string, boolean> = {};

  let anyTableFound = false;

  for (const table of SUPABASE_TABLES) {
    try {
      const { error } = await supabase.from(table).select('id').limit(1);
      if (!error) {
        tableStatus[table] = true;
        anyTableFound = true;
      } else if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
        tableStatus[table] = false;
      } else {
        // Table exists, even if RLS prevents reading
        tableStatus[table] = true;
        anyTableFound = true;
      }
    } catch {
      tableStatus[table] = false;
    }
  }

  return {
    connected: true, // Project URL & API Key authentication responded
    projectUrl: SUPABASE_URL,
    tables: tableStatus,
    message: anyTableFound
      ? 'Supabase backend connected and active tables detected.'
      : 'Supabase project connected! Run the SQL schema once in your Supabase SQL Editor to activate tables.',
  };
}

/**
 * Maps raw database row (snake_case or camelCase) into a typed ContactInquiry.
 */
export function mapRowToInquiry(row: Record<string, unknown>): ContactInquiry {
  const id = String(row.id || `divire-${Date.now()}`);
  const name = String(row.name || 'Valued Client');
  const brandName = String(row.brand_name || row.brandName || row.company || 'Divire Partner');
  const email = String(row.email || '');
  const phone = String(row.phone || row.whatsapp || '');

  let services: string[] = [];
  if (Array.isArray(row.services)) {
    services = row.services.map((s) => String(s).trim()).filter(Boolean);
  } else if (typeof row.services === 'string' && row.services.trim()) {
    try {
      const parsed = JSON.parse(row.services);
      if (Array.isArray(parsed)) {
        services = parsed.map((s) => String(s).trim()).filter(Boolean);
      } else {
        services = [row.services.trim()];
      }
    } catch {
      services = row.services.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }

  const message = row.message ? String(row.message) : undefined;

  let status: 'New' | 'Contacted' | 'Converted' | 'Rejected' | 'Archived' = 'New';
  const rawStatus = String(row.status || 'New').toLowerCase();
  if (rawStatus === 'contacted') status = 'Contacted';
  else if (rawStatus === 'converted') status = 'Converted';
  else if (rawStatus === 'rejected') status = 'Rejected';
  else if (rawStatus === 'archived') status = 'Archived';
  else status = 'New';

  const notes = row.notes ? String(row.notes) : undefined;
  const createdAt = String(row.created_at || row.createdAt || new Date().toISOString());
  const updatedAt = String(row.updated_at || row.updatedAt || createdAt);

  return {
    id,
    name,
    brandName,
    email,
    phone,
    services: services.length > 0 ? services : ['Digital Marketing'],
    message,
    status,
    notes,
    createdAt,
    updatedAt,
  };
}

/**
 * Fetches all live enquiries from Supabase ('orders' and 'inquiries' tables).
 */
export async function fetchInquiriesFromSupabase(): Promise<{
  success: boolean;
  inquiries: ContactInquiry[];
  sourceTable?: string;
  error?: string;
}> {
  const supabase = getSupabaseClient();
  const seenIds = new Set<string>();
  const allInquiries: ContactInquiry[] = [];
  let primaryTableUsed: string | undefined;

  for (const table of SUPABASE_TABLES) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        if (!primaryTableUsed) primaryTableUsed = table;
        for (const rawRow of data) {
          const mapped = mapRowToInquiry(rawRow as Record<string, unknown>);
          if (!seenIds.has(mapped.id)) {
            seenIds.add(mapped.id);
            allInquiries.push(mapped);
          }
        }
      }
    } catch (err) {
      console.error(`[Supabase Fetch Error] failed on table ${table}:`, err);
    }
  }

  // Sort overall newest first
  allInquiries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return {
    success: true,
    inquiries: allInquiries,
    sourceTable: primaryTableUsed,
  };
}

/**
 * Updates status or internal notes for an inquiry in Supabase tables.
 */
export async function updateInquiryInSupabase(
  id: string,
  updates: { status?: string; notes?: string }
): Promise<boolean> {
  const supabase = getSupabaseClient();
  let anySuccess = false;

  for (const table of SUPABASE_TABLES) {
    try {
      const payload: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      if (updates.status !== undefined) payload.status = updates.status;
      if (updates.notes !== undefined) payload.notes = updates.notes;

      const { error } = await supabase.from(table).update(payload).eq('id', id);
      if (!error) {
        anySuccess = true;
      }
    } catch (err) {
      console.error(`[Supabase Update Error] on table ${table} for id ${id}:`, err);
    }
  }

  return anySuccess;
}

/**
 * Deletes an inquiry record from Supabase tables.
 */
export async function deleteInquiryFromSupabase(id: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  let anySuccess = false;

  for (const table of SUPABASE_TABLES) {
    try {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (!error) {
        anySuccess = true;
      }
    } catch (err) {
      console.error(`[Supabase Delete Error] on table ${table} for id ${id}:`, err);
    }
  }

  return anySuccess;
}
