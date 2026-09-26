import { createContext, useContext } from 'react';
import type { Session, User } from '@supabase/supabase-js';

export type AuthState =
  | { status: 'loading'; session: null; user: null }
  | { status: 'unconfigured'; session: null; user: null }
  | { status: 'signedOut'; session: null; user: null }
  | { status: 'signedIn'; session: Session; user: User };

export interface AuthContextValue {
  state: AuthState;
  /** True after arriving from a password-recovery email link. */
  isRecovery: boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>');
  return value;
}
