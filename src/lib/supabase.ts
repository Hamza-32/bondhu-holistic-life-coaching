import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { envResult } from './env';

export type TypedSupabaseClient = SupabaseClient<Database>;

/**
 * The browser Supabase client, or `null` when the environment is not configured
 * (the app then shows setup instructions instead of crashing).
 */
export const supabase: TypedSupabaseClient | null = envResult.ok
  ? createClient<Database>(envResult.env.VITE_SUPABASE_URL, envResult.env.VITE_SUPABASE_ANON_KEY, {
      auth: {
        flowType: 'pkce',
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'bondhu-auth',
      },
    })
  : null;

export const isSupabaseConfigured = supabase !== null;

/** Returns the client or throws. Use inside code paths that run only when configured. */
export function requireSupabase(): TypedSupabaseClient {
  if (!supabase) {
    throw new Error('Supabase is not configured. Copy .env.example to .env.local and fill it in.');
  }
  return supabase;
}
