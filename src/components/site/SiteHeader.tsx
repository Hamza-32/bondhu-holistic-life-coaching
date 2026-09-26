import { useEffect, useState } from 'react';
import { Menu } from 'lucide-react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/Container';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { HelpNowButton } from '@/features/safety/HelpNow';
import { cn } from '@/lib/utils';
import { SITE_SECTIONS } from './sections';

function useScrolled(threshold = 8) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);
  return scrolled;
}

export function SiteHeader() {
  const { t } = useTranslation();
  const scrolled = useScrolled();

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b transition-colors duration-300',
        scrolled ? 'border-border bg-background/80 backdrop-blur-lg' : 'border-transparent',
      )}
    >
      <Container className="flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav aria-label={t('nav.primary')} className="hidden md:block">
          <ul className="flex items-center gap-1">
            {SITE_SECTIONS.map((s) => (
              <li key={s.key}>
                <a
                  href={s.href}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {t(`landing.nav.${s.key}`)}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          <HelpNowButton className="mr-1" />
          <LanguageToggle />
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
            <Link to="/login">{t('landing.nav.signIn')}</Link>
          </Button>
          <Button asChild size="sm" className="ml-1 hidden rounded-lg md:inline-flex">
            <Link to="/signup">{t('landing.nav.getStarted')}</Link>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label={t('landing.nav.menu')}
              >
                <Menu aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-sm">
              <SheetHeader>
                <SheetTitle>{t('landing.nav.menuTitle')}</SheetTitle>
                <SheetDescription className="sr-only">{t('app.tagline')}</SheetDescription>
              </SheetHeader>
              <nav aria-label={t('nav.mobile')} className="px-4">
                <ul className="space-y-1">
                  {SITE_SECTIONS.map((s) => (
                    <li key={s.key}>
                      <SheetClose asChild>
                        <a
                          href={s.href}
                          className="block rounded-lg px-3 py-3 text-base font-medium hover:bg-muted"
                        >
                          {t(`landing.nav.${s.key}`)}
                        </a>
                      </SheetClose>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="mt-auto grid gap-2 p-4">
                <SheetClose asChild>
                  <Button asChild variant="outline" size="lg">
                    <Link to="/login">{t('landing.nav.signIn')}</Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button asChild size="lg">
                    <Link to="/signup">{t('landing.nav.getStarted')}</Link>
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </Container>
    </header>
  );
}
