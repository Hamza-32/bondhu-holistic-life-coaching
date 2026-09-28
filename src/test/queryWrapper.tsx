import type { ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContext, type AuthState } from '@/features/auth/context';

export const TEST_USER_ID = '00000000-0000-4000-8000-0000000000aa';

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  });
}

export function signedInState(id = TEST_USER_ID): AuthState {
  const user = { id, email: 'test@example.com' } as User;
  return { status: 'signedIn', user, session: { user } as Session };
}

/** Wrapper for renderHook: a fresh QueryClient and an auth context (signed in by default). */
export function createWrapper({
  queryClient = createTestQueryClient(),
  auth = signedInState(),
}: { queryClient?: QueryClient; auth?: AuthState } = {}) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider value={{ state: auth, isRecovery: false }}>
          {children}
        </AuthContext.Provider>
      </QueryClientProvider>
    );
  }
  return { Wrapper, queryClient };
}
