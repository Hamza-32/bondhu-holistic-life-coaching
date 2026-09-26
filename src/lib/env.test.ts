import { describe, expect, it } from 'vitest';
import { parseEnv } from './env';

const KEY = 'sb_publishable_abcdefghijklmnopqrstuvwxyz';

describe('parseEnv', () => {
  it('accepts a hosted project URL and publishable key', () => {
    const result = parseEnv({
      VITE_SUPABASE_URL: 'https://abc.supabase.co',
      VITE_SUPABASE_ANON_KEY: KEY,
    });
    expect(result.ok).toBe(true);
  });

  it('allows plain http only for localhost', () => {
    expect(
      parseEnv({ VITE_SUPABASE_URL: 'http://127.0.0.1:54321', VITE_SUPABASE_ANON_KEY: KEY }).ok,
    ).toBe(true);
    expect(
      parseEnv({ VITE_SUPABASE_URL: 'http://abc.supabase.co', VITE_SUPABASE_ANON_KEY: KEY }).ok,
    ).toBe(false);
  });

  it('rejects missing values and secret keys with readable issues', () => {
    const missing = parseEnv({});
    expect(missing.ok).toBe(false);
    if (!missing.ok) expect(missing.issues.join('\n')).toMatch(/VITE_SUPABASE_URL/);

    const secret = parseEnv({
      VITE_SUPABASE_URL: 'https://abc.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'sb_secret_abcdefghijklmnopqrstuvwxyz',
    });
    expect(secret.ok).toBe(false);
    if (!secret.ok) expect(secret.issues.join('\n')).toMatch(/secret key/);
  });
});
