import { ArrowRight } from 'lucide-react';
import { Link, Outlet } from 'react-router';
import { useTranslation } from 'react-i18next';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';

/** Layout for public marketing pages. The full landing page (FAQ, footer, demo) arrives in Phase 6. */
export function PublicLayout() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">
          <Logo />
          <div className="flex items-center gap-1">
            <LanguageToggle />
            <ThemeToggle />
            <Button asChild size="sm" className="ml-1">
              <Link to="/app">
                {t('nav.openApp')}
                <ArrowRight aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
      </header>
      <main
        id="main"
        tabIndex={-1}
        className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8"
      >
        <Outlet />
      </main>
    </div>
  );
}
