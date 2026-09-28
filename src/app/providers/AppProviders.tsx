import { useSyncExternalStore, type ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { VercelInsights } from '@/components/VercelInsights';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { queryClient } from '@/lib/queryClient';
import { resolveTheme, useUiStore } from '@/stores/useUiStore';
import { ThemeSync } from './ThemeSync';

const noopSubscribe = () => () => undefined;

/** False during server rendering and hydration, true afterwards. */
function useHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

function ThemedToaster() {
  const theme = useUiStore((s) => s.theme);
  const hydrated = useHydrated();
  const prefersDark =
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
  // The theme depends on browser-only state, so render after hydration (no mismatch).
  if (!hydrated) return null;
  return (
    <Toaster
      theme={resolveTheme(theme, prefersDark)}
      position="top-center"
      richColors
      closeButton
      toastOptions={{ className: 'font-sans' }}
    />
  );
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeSync />
        {children}
        <ThemedToaster />
        <VercelInsights />
      </AuthProvider>
    </QueryClientProvider>
  );
}
