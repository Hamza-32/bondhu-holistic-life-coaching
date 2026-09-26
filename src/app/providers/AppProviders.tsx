import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { MotionConfig } from 'motion/react';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { queryClient } from '@/lib/queryClient';
import { resolveTheme, useUiStore } from '@/stores/useUiStore';
import { ThemeSync } from './ThemeSync';

function ThemedToaster() {
  const theme = useUiStore((s) => s.theme);
  const prefersDark =
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
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
        {/* reducedMotion="user" makes every motion component honour prefers-reduced-motion. */}
        <MotionConfig reducedMotion="user">
          <ThemeSync />
          {children}
          <ThemedToaster />
        </MotionConfig>
      </AuthProvider>
    </QueryClientProvider>
  );
}
