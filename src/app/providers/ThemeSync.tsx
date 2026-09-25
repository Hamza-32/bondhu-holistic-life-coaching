import { useEffect } from 'react';
import { resolveTheme, useUiStore } from '@/stores/useUiStore';

const DARK_QUERY = '(prefers-color-scheme: dark)';

/** Keeps the `dark` class on <html> in sync with the chosen theme and the OS preference. */
export function ThemeSync() {
  const theme = useUiStore((s) => s.theme);

  useEffect(() => {
    const media = window.matchMedia(DARK_QUERY);
    const apply = () => {
      const resolved = resolveTheme(theme, media.matches);
      document.documentElement.classList.toggle('dark', resolved === 'dark');
    };
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [theme]);

  return null;
}
