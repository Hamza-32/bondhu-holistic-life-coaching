import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.doUnmock('./env');
  vi.resetModules();
});

describe('Supabase client configuration', () => {
  it('fails clearly when public configuration is missing', async () => {
    vi.doMock('./env', () => ({ envResult: { ok: false, issues: ['missing'] } }));
    const module = await import('./supabase');

    expect(module.isSupabaseConfigured).toBe(false);
    expect(() => module.requireSupabase()).toThrow(/Supabase is not configured/);
  });

  it('creates and returns a client from validated public configuration', async () => {
    vi.doMock('./env', () => ({
      envResult: {
        ok: true,
        env: {
          VITE_SUPABASE_URL: 'https://test-project.supabase.co',
          VITE_SUPABASE_ANON_KEY: 'test-publishable-key-0123456789',
        },
      },
    }));
    const module = await import('./supabase');

    expect(module.isSupabaseConfigured).toBe(true);
    expect(module.requireSupabase()).toBe(module.supabase);
  });
});
