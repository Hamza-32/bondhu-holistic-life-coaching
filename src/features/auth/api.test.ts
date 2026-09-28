import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserExistsError } from './errors';
import {
  requestPasswordReset,
  sendMagicLink,
  signInWithGoogle,
  signInWithPassword,
  signOut,
  signUpWithPassword,
  updatePassword,
} from './api';

const mocks = vi.hoisted(() => ({
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  signInWithOtp: vi.fn(),
  signInWithOAuth: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  updateUser: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
  requireSupabase: () => ({ auth: mocks }),
}));

vi.mock('@/lib/i18n', () => ({ currentLanguage: () => 'en' }));

beforeEach(() => {
  for (const mock of Object.values(mocks)) mock.mockReset().mockResolvedValue({ error: null });
});

describe('auth API', () => {
  it('signs in and out with password credentials', async () => {
    await signInWithPassword({ email: 'nadia@example.com', password: 'bondhu2026' });
    await signOut();

    expect(mocks.signInWithPassword).toHaveBeenCalledWith({
      email: 'nadia@example.com',
      password: 'bondhu2026',
    });
    expect(mocks.signOut).toHaveBeenCalledOnce();
  });

  it('signs up with profile metadata and reports whether confirmation is needed', async () => {
    mocks.signUp.mockResolvedValueOnce({
      data: { user: { identities: [{}] }, session: null },
      error: null,
    });

    await expect(
      signUpWithPassword({
        displayName: 'Nadia',
        email: 'nadia@example.com',
        password: 'bondhu2026',
        confirmPassword: 'bondhu2026',
      }),
    ).resolves.toEqual({ needsConfirmation: true });
    expect(mocks.signUp).toHaveBeenCalledWith({
      email: 'nadia@example.com',
      password: 'bondhu2026',
      options: {
        emailRedirectTo: 'http://localhost:3000/auth/callback',
        data: { display_name: 'Nadia', locale: 'en' },
      },
    });
  });

  it('recognises Supabase duplicate-sign-up protection', async () => {
    mocks.signUp.mockResolvedValueOnce({
      data: { user: { identities: [] }, session: null },
      error: null,
    });

    await expect(
      signUpWithPassword({
        displayName: 'Nadia',
        email: 'nadia@example.com',
        password: 'bondhu2026',
        confirmPassword: 'bondhu2026',
      }),
    ).rejects.toBeInstanceOf(UserExistsError);
  });

  it('builds safe callback URLs for email, Google and password reset flows', async () => {
    await sendMagicLink('nadia@example.com');
    await signInWithGoogle('/app/journal?tab=recent');
    await requestPasswordReset('nadia@example.com');
    await updatePassword('newbondhu2026');

    expect(mocks.signInWithOtp).toHaveBeenCalledWith({
      email: 'nadia@example.com',
      options: {
        emailRedirectTo: 'http://localhost:3000/auth/callback',
        shouldCreateUser: true,
        data: { locale: 'en' },
      },
    });
    expect(mocks.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000/auth/callback?next=%2Fapp%2Fjournal%3Ftab%3Drecent',
      },
    });
    expect(mocks.resetPasswordForEmail).toHaveBeenCalledWith('nadia@example.com', {
      redirectTo: 'http://localhost:3000/reset-password',
    });
    expect(mocks.updateUser).toHaveBeenCalledWith({ password: 'newbondhu2026' });
  });

  it.each([
    [
      'sign in',
      () => signInWithPassword({ email: 'n@example.com', password: 'x' }),
      mocks.signInWithPassword,
    ],
    ['magic link', () => sendMagicLink('n@example.com'), mocks.signInWithOtp],
    ['Google', () => signInWithGoogle('/app'), mocks.signInWithOAuth],
    ['reset request', () => requestPasswordReset('n@example.com'), mocks.resetPasswordForEmail],
    ['password update', () => updatePassword('bondhu2027'), mocks.updateUser],
    ['sign out', () => signOut(), mocks.signOut],
  ])('propagates the %s error', async (_label, action, mock) => {
    const error = new Error('auth failed');
    mock.mockResolvedValueOnce({ error });
    await expect(action()).rejects.toBe(error);
  });
});
