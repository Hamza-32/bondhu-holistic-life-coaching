import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { AuthContext, type AuthState } from './context';

function toState(session: Session | null): AuthState {
  return session
    ? { status: 'signedIn', session, user: session.user }
    : { status: 'signedOut', session: null, user: null };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<AuthState>(() =>
    supabase
      ? { status: 'loading', session: null, user: null }
      : { status: 'unconfigured', session: null, user: null },
  );
  const [isRecovery, setIsRecovery] = useState(false);
  const userId = useRef<string | null>(null);

  useEffect(() => {
    if (!supabase) return;

    // Never show one account's cached data to another: drop the cache whenever the user changes.
    const apply = (session: Session | null) => {
      const nextId = session?.user.id ?? null;
      if (userId.current !== nextId) queryClient.clear();
      userId.current = nextId;
      setState(toState(session));
    };

    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (active) apply(data.session);
    });

    // Keep this callback synchronous: awaiting Supabase calls inside it can deadlock the client.
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') setIsRecovery(true);
      if (event === 'SIGNED_OUT') setIsRecovery(false);
      apply(session);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [queryClient]);

  const value = useMemo(() => ({ state, isRecovery }), [state, isRecovery]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
