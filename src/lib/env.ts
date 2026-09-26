/**
 * Public, browser-safe configuration. Only the Supabase URL and the publishable (anon) key may
 * appear here: both are designed to be public and are protected by Row Level Security.
 * The service-role key must never be given a VITE_ prefix or used in client code.
 *
 * Validated by hand rather than with Zod so the validation library stays out of the startup
 * bundle (it loads only with the pages that have forms).
 */
export interface Env {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
}

export type EnvResult = { ok: true; env: Env } | { ok: false; issues: string[] };

function urlIssue(value: unknown): string | null {
  if (typeof value !== 'string' || !value) return 'Required';
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return 'Must be a valid URL';
  }
  const local = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
  if (url.protocol === 'https:' || (url.protocol === 'http:' && local)) return null;
  return 'Must use https (http is allowed only for localhost)';
}

function keyIssue(value: unknown): string | null {
  if (typeof value !== 'string' || !value) return 'Required';
  if (value.startsWith('sb_secret_')) return 'This is a secret key. Use the publishable key.';
  if (value.length < 20) return 'Looks too short to be a Supabase publishable/anon key';
  return null;
}

export function parseEnv(source: Record<string, unknown>): EnvResult {
  const issues = [
    ['VITE_SUPABASE_URL', urlIssue(source.VITE_SUPABASE_URL)],
    ['VITE_SUPABASE_ANON_KEY', keyIssue(source.VITE_SUPABASE_ANON_KEY)],
  ]
    .filter(([, issue]) => issue !== null)
    .map(([name, issue]) => `${name ?? ''}: ${issue ?? ''}`);
  if (issues.length > 0) return { ok: false, issues };
  return {
    ok: true,
    env: {
      VITE_SUPABASE_URL: String(source.VITE_SUPABASE_URL),
      VITE_SUPABASE_ANON_KEY: String(source.VITE_SUPABASE_ANON_KEY),
    },
  };
}

export const envResult = parseEnv(import.meta.env);
