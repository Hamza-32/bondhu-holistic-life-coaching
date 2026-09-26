import { ArrowLeft, Check } from 'lucide-react';
import { Link, Outlet } from 'react-router';
import { useTranslation } from 'react-i18next';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Shapla } from '@/components/illustrations/Shapla';
import { isSupabaseConfigured } from '@/lib/supabase';
import { SetupNotice } from './SetupNotice';

/** Split-screen layout for sign-in, sign-up and password flows. */
export function AuthLayout() {
  const { t } = useTranslation();
  const points = t('auth.layout.points', { returnObjects: true });

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_1.1fr]">
      {/* Brand panel (desktop) */}
      <aside className="relative hidden overflow-hidden bg-linear-to-br from-brand to-brand-strong p-12 text-brand-foreground lg:flex lg:flex-col">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 [background-image:radial-gradient(rgb(255_255_255/0.1)_1px,transparent_1px)] [background-size:22px_22px]"
        />
        <Shapla className="pointer-events-none absolute -right-16 -bottom-10 size-96 opacity-20" />

        <Link to="/" className="relative flex items-center gap-2 text-xl font-bold">
          <span className="flex size-9 items-center justify-center rounded-xl bg-white/15">
            <Shapla className="size-7" />
          </span>
          {t('app.name')}
        </Link>

        <div className="relative my-auto max-w-md">
          <p className="text-sm font-semibold tracking-wider text-white/70 uppercase">
            {t('auth.layout.quoteLabel')}
          </p>
          <blockquote className="mt-4 text-3xl leading-snug font-bold text-balance">
            “{t('auth.layout.quote')}”
          </blockquote>
          <ul className="mt-10 space-y-3">
            {points.map((p) => (
              <li key={p} className="flex items-center gap-3 text-white/90">
                <span className="flex size-6 items-center justify-center rounded-full bg-white/15">
                  <Check className="size-3.5" aria-hidden />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Form side */}
      <div className="flex flex-col">
        <header className="flex h-16 items-center justify-between px-4 sm:px-8">
          <Logo className="lg:hidden" />
          <Link
            to="/"
            className="hidden items-center gap-1.5 rounded-lg px-2 py-1 text-sm text-muted-foreground hover:text-foreground lg:inline-flex"
          >
            <ArrowLeft className="size-4" aria-hidden />
            {t('auth.layout.backHome')}
          </Link>
          <div className="flex items-center gap-1">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </header>
        <main
          id="main"
          tabIndex={-1}
          className="flex flex-1 items-center justify-center px-4 py-10 outline-none sm:px-8"
        >
          <div className="w-full max-w-sm">
            {isSupabaseConfigured ? <Outlet /> : <SetupNotice />}
          </div>
        </main>
      </div>
    </div>
  );
}
