import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';

interface UiState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

/**
 * Client-only UI preferences. Domain data does not belong here (see docs/ARCHITECTURE.md §6.1).
 * The storage key and shape are read by the pre-paint script in index.html; keep them in sync.
 */
export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'bondhu-ui', version: 1 },
  ),
);

export function resolveTheme(theme: Theme, prefersDark: boolean): 'light' | 'dark' {
  if (theme === 'system') return prefersDark ? 'dark' : 'light';
  return theme;
}
