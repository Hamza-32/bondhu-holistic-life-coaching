import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/PageHeader';
import { cn } from '@/lib/utils';
import { GAMES } from './shared/games';

/** Arcade hub. Each game is its own lazy-loaded route under /app/arcade/:game. */
export function ArcadePage() {
  const { t } = useTranslation();
  return (
    <div>
      <PageHeader title={t('pages.arcade.title')} subtitle={t('pages.arcade.subtitle')} />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GAMES.map(({ slug, key, icon: Icon, tint }) => (
          <li key={slug}>
            <Link
              to={`/app/arcade/${slug}`}
              className="group flex h-full flex-col rounded-2xl border bg-card p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lifted"
            >
              <span className={cn('flex size-12 items-center justify-center rounded-xl', tint)}>
                <Icon className="size-6" aria-hidden />
              </span>
              <h2 className="mt-5 text-lg font-semibold">{t(`games.${key}.title`)}</h2>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">
                {t(`games.${key}.tagline`)}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                {t('arcade.play')}
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ArcadePage;
