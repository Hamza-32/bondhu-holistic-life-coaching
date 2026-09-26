import { useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { resetLegacyUserData } from '@/stores/useBondhuStore';
import { AuthContext, type AuthState } from './context';

const LAST_USER_KEY = 'bondhu-last-user';

function toState(session: Session | null): AuthState {
  return session
    ? { status: 'signedIn', session, user: session.user }
    : { status: 'signedOut', session: null, user: null };
}

/**
 * Local (pre-Supabase) data belongs to whoever used this device last. Clear it when a different
 * account signs in, so one person never sees another's journal. Removed with the legacy store.
 */
function guardLegacyDataFor(userId: string) {
  try {
    const last = localStorage.getItem(LAST_USER_KEY);
    if (last !== userId) {
      resetLegacyUserData();
      localStorage.setItem(LAST_USER_KEY, userId);
    }
  } catch {
    // Storage unavailable (private mode): nothing persisted, nothing to clear.
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<AuthState>(() =>
    supabase
      ? { status: 'loading', session: null, user: null }
      : { status: 'unconfigured', session: null, user: null },
  );
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    if (!supabase) return;

    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (data.session) guardLegacyDataFor(data.session.user.id);
      setState(toState(data.session));
    });

    // Keep this callback synchronous: awaiting Supabase calls inside it can deadlock the client.
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') setIsRecovery(true);
      if (event === 'SIGNED_OUT') {
        queryClient.clear();
        resetLegacyUserData();
        setIsRecovery(false);
      }
      if (session) guardLegacyDataFor(session.user.id);
      setState(toState(session));
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [queryClient]);

  const value = useMemo(() => ({ state, isRecovery }), [state, isRecovery]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
