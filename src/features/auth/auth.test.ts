import { AuthApiError, AuthRetryableFetchError } from '@supabase/supabase-js';
import { describe, expect, it } from 'vitest';
import { authErrorKey, UserExistsError } from './errors';
import { safeNextPath } from './redirect';
import { newPasswordSchema, resetPasswordSchema, signInSchema, signUpSchema } from './schemas';

function firstError(result: { success: boolean; error?: { issues: { message: string }[] } }) {
  return result.error?.issues[0]?.message;
}

describe('auth schemas', () => {
  it('trims and validates email addresses', () => {
    expect(
      signInSchema.safeParse({ email: '  nadia@example.com ', password: 'x' }).data?.email,
    ).toBe('nadia@example.com');
    expect(firstError(signInSchema.safeParse({ email: 'not-an-email', password: 'x' }))).toBe(
      'auth.errors.emailInvalid',
    );
  });

  it('requires 8+ characters with a letter and a number for new passwords', () => {
    expect(firstError(newPasswordSchema.safeParse('short1'))).toBe('auth.errors.passwordShort');
    expect(firstError(newPasswordSchema.safeParse('onlyletters'))).toBe('auth.errors.passwordWeak');
    expect(firstError(newPasswordSchema.safeParse('12345678'))).toBe('auth.errors.passwordWeak');
    expect(newPasswordSchema.safeParse('bondhu2026').success).toBe(true);
    // Bangla letters count as letters.
    expect(newPasswordSchema.safeParse('বন্ধু১২৩৪5678').success).toBe(true);
  });

  it('checks that sign-up passwords match and a name is given', () => {
    const result = signUpSchema.safeParse({
      displayName: '   ',
      email: 'a@b.co',
      password: 'bondhu2026',
      confirmPassword: 'bondhu2027',
    });
    const messages = result.error?.issues.map((i) => i.message);
    expect(messages).toContain('auth.errors.nameRequired');
    expect(messages).toContain('auth.errors.passwordMismatch');
    expect(
      result.error?.issues.find((i) => i.message === 'auth.errors.passwordMismatch')?.path,
    ).toEqual(['confirmPassword']);
  });

  it('validates the reset form the same way', () => {
    expect(
      resetPasswordSchema.safeParse({ password: 'bondhu2026', confirmPassword: 'bondhu2026' })
        .success,
    ).toBe(true);
  });
});

describe('safeNextPath', () => {
  it('allows in-app paths', () => {
    expect(safeNextPath('/app/journal?tab=1')).toBe('/app/journal?tab=1');
  });

  it.each([
    ['missing', null],
    ['protocol-relative', '//evil.com'],
    ['backslash trick', '/\\evil.com'],
    ['absolute URL', 'https://evil.com'],
    ['javascript URL', 'javascript:alert(1)'],
    ['control characters', '/app\n//evil.com'],
    ['auth loop', '/login?next=/app'],
  ])('falls back to /app for %s', (_label, value) => {
    expect(safeNextPath(value)).toBe('/app');
  });
});

describe('authErrorKey', () => {
  it('maps Supabase error codes to friendly messages', () => {
    const err = new AuthApiError('Invalid login credentials', 400, 'invalid_credentials');
    expect(authErrorKey(err)).toBe('auth.errors.invalidCredentials');
    expect(authErrorKey(new AuthApiError('slow down', 429, undefined))).toBe(
      'auth.errors.rateLimited',
    );
    expect(authErrorKey(new AuthApiError('x', 422, 'email_not_confirmed'))).toBe(
      'auth.errors.emailNotConfirmed',
    );
  });

  it('recognises network failures and hidden duplicate sign-ups', () => {
    expect(authErrorKey(new AuthRetryableFetchError('Failed to fetch', 0))).toBe(
      'auth.errors.network',
    );
    expect(authErrorKey(new UserExistsError())).toBe('auth.errors.userExists');
    expect(authErrorKey(new Error('???'))).toBe('auth.errors.generic');
  });
});
