import { Heart } from 'lucide-react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/Container';
import { LogoMark } from '@/components/Logo';
import { SITE_SECTIONS } from './sections';

const linkClass = 'text-sm text-muted-foreground transition-colors hover:text-foreground';

export function SiteFooter() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30">
      <Container className="py-12 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <LogoMark />
              <span className="text-xl font-bold tracking-tight">{t('app.name')}</span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              {t('landing.footer.tagline')}
            </p>
          </div>

          <nav aria-labelledby="footer-product">
            <h2 id="footer-product" className="text-sm font-semibold">
              {t('landing.footer.product')}
            </h2>
            <ul className="mt-4 space-y-3">
              {SITE_SECTIONS.map((s) => (
                <li key={s.key}>
                  <a href={s.href} className={linkClass}>
                    {t(`landing.nav.${s.key}`)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-account">
            <h2 id="footer-account" className="text-sm font-semibold">
              {t('landing.footer.account')}
            </h2>
            <ul className="mt-4 space-y-3">
              <li>
                <Link to="/login" className={linkClass}>
                  {t('landing.nav.signIn')}
                </Link>
              </li>
              <li>
                <Link to="/signup" className={linkClass}>
                  {t('landing.nav.getStarted')}
                </Link>
              </li>
              <li>
                <Link to="/help" className={linkClass}>
                  {t('nav.resources')}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className={linkClass}>
                  {t('nav.privacy')}
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-12 rounded-xl border bg-card p-4 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">
            {t('landing.footer.importantTitle')}:{' '}
          </span>
          {t('landing.footer.disclaimer')}
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t pt-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>{t('landing.footer.rights', { year })}</p>
          <p className="flex items-center gap-1.5">
            <Heart className="size-3.5 text-coral" aria-hidden />
            {t('landing.footer.madeIn')}
          </p>
        </div>
      </Container>
    </footer>
  );
}
