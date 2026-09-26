import { z } from 'zod';

/**
 * Public, browser-safe configuration. Only the Supabase URL and the publishable (anon) key may
 * appear here: both are designed to be public and are protected by Row Level Security.
 * The service-role key must never be given a VITE_ prefix or used in client code.
 */
export const envSchema = z.object({
  VITE_SUPABASE_URL: z
    .url({ protocol: /^https?$/ })
    .refine(
      (url) => url.startsWith('https://') || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?/.test(url),
      'Must use https (http is allowed only for localhost)',
    ),
  VITE_SUPABASE_ANON_KEY: z
    .string()
    .min(20, 'Looks too short to be a Supabase publishable/anon key')
    .refine(
      (key) => !key.startsWith('sb_secret_'),
      'This is a secret key. Use the publishable key.',
    ),
});

export type Env = z.infer<typeof envSchema>;

export type EnvResult = { ok: true; env: Env } | { ok: false; issues: string[] };

export function parseEnv(source: Record<string, unknown>): EnvResult {
  const result = envSchema.safeParse(source);
  if (result.success) return { ok: true, env: result.data };
  return {
    ok: false,
    issues: result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
  };
}

export const envResult = parseEnv(import.meta.env);
