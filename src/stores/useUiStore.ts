import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';

interface UiState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  /** Game sounds. Off by default (build plan §5). */
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  /** Vibration cues in breathing exercises, where the device supports it. */
  hapticsEnabled: boolean;
  setHapticsEnabled: (enabled: boolean) => void;
}

/**
 * Client-only UI preferences. Domain data does not belong here (see docs/ARCHITECTURE.md §6.1).
 * The storage key and the `theme` field are read by the pre-paint script in index.html.
 */
export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
      soundEnabled: false,
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      hapticsEnabled: true,
      setHapticsEnabled: (hapticsEnabled) => set({ hapticsEnabled }),
    }),
    { name: 'bondhu-ui', version: 1 },
  ),
);

export function resolveTheme(theme: Theme, prefersDark: boolean): 'light' | 'dark' {
  if (theme === 'system') return prefersDark ? 'dark' : 'light';
  return theme;
}
