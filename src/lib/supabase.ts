import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Local storage key prefixes for client offline persistence
export const LOCAL_STORAGE_KEYS = {
  USER: 'krushiscan_user_session',
  CROPS: 'krushiscan_crops',
  SCANS: 'krushiscan_scans',
  RECOVERY: 'krushiscan_recovery',
  ORDERS: 'krushiscan_orders',
  BOOKMARKS: 'krushiscan_bookmarks',
  INQUIRIES: 'krushiscan_inquiries',
  NOTIFICATIONS: 'krushiscan_notifications',
};
