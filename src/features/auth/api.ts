import { currentLanguage } from '@/lib/i18n';
import { requireSupabase } from '@/lib/supabase';
import { UserExistsError } from './errors';
import { authRedirectUrl } from './redirect';
import type { SignInValues, SignUpValues } from './schemas';

/** Where email links and OAuth return to. Must be allow-listed in Supabase Auth settings. */
const CALLBACK_PATH = '/auth/callback';
const RESET_PATH = '/reset-password';

export async function signInWithPassword({ email, password }: SignInValues) {
  const { error } = await requireSupabase().auth.signInWithPassword({ email, password });
  if (error) throw error;
}

/**
 * Returns `needsConfirmation: true` when email confirmation is required (no session yet).
 */
export async function signUpWithPassword({ displayName, email, password }: SignUpValues) {
  const { data, error } = await requireSupabase().auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: authRedirectUrl(CALLBACK_PATH),
      data: { display_name: displayName, locale: currentLanguage() },
    },
  });
  if (error) throw error;
  // With confirmations on, Supabase returns a user with no identities for an existing email
  // (to avoid leaking which emails are registered). Tell the user to sign in instead.
  if (data.user && data.user.identities?.length === 0) throw new UserExistsError();
  return { needsConfirmation: data.session === null };
}

export async function sendMagicLink(email: string) {
  const { error } = await requireSupabase().auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: authRedirectUrl(CALLBACK_PATH),
      shouldCreateUser: true,
      data: { locale: currentLanguage() },
    },
  });
  if (error) throw error;
}

export async function signInWithGoogle(next: string) {
  const redirectTo = authRedirectUrl(`${CALLBACK_PATH}?next=${encodeURIComponent(next)}`);
  const { error } = await requireSupabase().auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  });
  if (error) throw error;
}

export async function requestPasswordReset(email: string) {
  const { error } = await requireSupabase().auth.resetPasswordForEmail(email, {
    redirectTo: authRedirectUrl(RESET_PATH),
  });
  if (error) throw error;
}

export async function updatePassword(password: string) {
  const { error } = await requireSupabase().auth.updateUser({ password });
  if (error) throw error;
}

export async function signOut() {
  const { error } = await requireSupabase().auth.signOut();
  if (error) throw error;
}
