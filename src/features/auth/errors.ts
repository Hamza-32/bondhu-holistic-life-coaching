import { AuthError } from '@supabase/supabase-js';

export type AuthErrorKey =
  | 'auth.errors.invalidCredentials'
  | 'auth.errors.emailNotConfirmed'
  | 'auth.errors.userExists'
  | 'auth.errors.weakPassword'
  | 'auth.errors.rateLimited'
  | 'auth.errors.providerDisabled'
  | 'auth.errors.samePassword'
  | 'auth.errors.network'
  | 'auth.errors.generic';

/** Thrown when sign-up "succeeds" for an email that already has an account (Supabase hides this). */
export class UserExistsError extends Error {
  constructor() {
    super('user_already_exists');
    this.name = 'UserExistsError';
  }
}

const BY_CODE: Record<string, AuthErrorKey> = {
  invalid_credentials: 'auth.errors.invalidCredentials',
  email_not_confirmed: 'auth.errors.emailNotConfirmed',
  user_already_exists: 'auth.errors.userExists',
  email_exists: 'auth.errors.userExists',
  weak_password: 'auth.errors.weakPassword',
  over_request_rate_limit: 'auth.errors.rateLimited',
  over_email_send_rate_limit: 'auth.errors.rateLimited',
  over_sms_send_rate_limit: 'auth.errors.rateLimited',
  provider_disabled: 'auth.errors.providerDisabled',
  same_password: 'auth.errors.samePassword',
};

/** Map any auth failure to a translatable, user-friendly message key. */
export function authErrorKey(error: unknown): AuthErrorKey {
  if (error instanceof UserExistsError) return 'auth.errors.userExists';

  if (error instanceof AuthError) {
    if (error.code && error.code in BY_CODE) return BY_CODE[error.code] ?? 'auth.errors.generic';
    if (error.status === 429) return 'auth.errors.rateLimited';
    if (error.name === 'AuthRetryableFetchError' || error.status === 0)
      return 'auth.errors.network';
    if (/provider is not enabled/i.test(error.message)) return 'auth.errors.providerDisabled';
    if (/invalid login credentials/i.test(error.message)) return 'auth.errors.invalidCredentials';
  }

  if (error instanceof TypeError && /fetch/i.test(error.message)) return 'auth.errors.network';
  return 'auth.errors.generic';
}
