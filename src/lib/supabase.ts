import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL =
  (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SUPABASE_URL ||
  'https://yozpuxvrcvuvfxfhggsq.supabase.co';

export const SUPABASE_ANON_KEY =
  (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_TBR3dLzqOO4PZjxKQnY8eA_jdkED6Tr';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const SUPABASE_SQL_SCHEMA = `-- Run this in Supabase -> SQL Editor (or New Query)
-- Project: https://yozpuxvrcvuvfxfhggsq.supabase.co

-- 1. Create 'orders' table
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    brand_name TEXT,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    services TEXT[] DEFAULT '{}',
    message TEXT,
    status TEXT DEFAULT 'New',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create 'inquiries' table (as secondary alias)
CREATE TABLE IF NOT EXISTS public.inquiries (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    brand_name TEXT,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    services TEXT[] DEFAULT '{}',
    message TEXT,
    status TEXT DEFAULT 'New',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- 4. Create policies to allow public orders / enquiry submissions
CREATE POLICY "Allow public insert into orders" 
ON public.orders FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

CREATE POLICY "Allow public insert into inquiries" 
ON public.inquiries FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- 5. Create policies to read data
CREATE POLICY "Allow public select on orders" 
ON public.orders FOR SELECT 
TO anon, authenticated 
USING (true);

CREATE POLICY "Allow public select on inquiries" 
ON public.inquiries FOR SELECT 
TO anon, authenticated 
USING (true);
`;

import type { ContactInquiry, InquiryStatus } from '../types.js';

/**
 * Maps raw database row (snake_case or camelCase) to ContactInquiry.
 */
export function mapSupabaseRowToInquiry(row: Record<string, unknown>): ContactInquiry {
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

  let status: InquiryStatus = 'New';
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
 * Direct client-side fetch from Supabase tables ('orders' & 'inquiries').
 */
export async function fetchDirectInquiriesFromSupabase(): Promise<ContactInquiry[]> {
  const seenIds = new Set<string>();
  const results: ContactInquiry[] = [];
  const candidateTables = ['orders', 'inquiries'];

  for (const table of candidateTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        for (const row of data) {
          const mapped = mapSupabaseRowToInquiry(row as Record<string, unknown>);
          if (!seenIds.has(mapped.id)) {
            seenIds.add(mapped.id);
            results.push(mapped);
          }
        }
      }
    } catch (err) {
      console.warn(`[Supabase Client] Could not query table "${table}":`, err);
    }
  }

  results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return results;
}

/**
 * Subscribes to Supabase Realtime changes on 'orders' and 'inquiries' tables.
 * Calls onChange callback whenever an INSERT, UPDATE, or DELETE happens in Supabase.
 */
export function subscribeToSupabaseInquiries(onChange: () => void): () => void {
  try {
    const channelName = `divire_realtime_${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('[Supabase Realtime] Event on orders:', payload.eventType);
          onChange();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inquiries' },
        (payload) => {
          console.log('[Supabase Realtime] Event on inquiries:', payload.eventType);
          onChange();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Supabase Realtime] Subscribed to orders and inquiries.');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn('[Supabase Realtime] Subscription initialization warning:', err);
    return () => {};
  }
}
