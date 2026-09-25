import { useEffect } from 'react';
import { Flame, LogOut, MoreHorizontal } from 'lucide-react';
import { NavLink, Outlet, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { APP_NAV, type NavItem } from '@/app/navigation';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Logo } from '@/components/Logo';
import { Onboarding } from '@/components/Onboarding';
import { ThemeToggle } from '@/components/ThemeToggle';
import { XpNotification } from '@/components/XpNotification';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useBondhuStore } from '@/stores/useBondhuStore';

function SidebarLink({ item }: { item: NavItem }) {
  const { t } = useTranslation();
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.end ?? false}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-secondary text-secondary-foreground'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        )
      }
    >
      <Icon className="size-5" aria-hidden />
      {t(item.labelKey)}
    </NavLink>
  );
}

function StreakBadge({ streak }: { streak: number }) {
  const { t } = useTranslation();
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-coral-soft px-3 py-1 text-sm font-semibold text-coral">
      <Flame className="size-4" aria-hidden />
      {t('user.streak', { count: streak })}
    </span>
  );
}

function UserSummary() {
  const { t } = useTranslation();
  const user = useBondhuStore((s) => s.user);
  const logout = useBondhuStore((s) => s.logout);

  if (!user.name) return null;

  return (
    <div className="flex items-center gap-3">
      <div
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground"
        aria-hidden
      >
        {user.name.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{user.name}</p>
        <p className="text-xs text-muted-foreground">
          {t('user.level', { level: user.level })} · {t('user.xp', { xp: user.xp })}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={logout}
        aria-label={t('user.logout')}
        title={t('user.logout')}
      >
        <LogOut aria-hidden />
      </Button>
    </div>
  );
}

function MobileTabBar() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const tabs = APP_NAV.filter((item) => item.mobileTab);
  const more = APP_NAV.filter((item) => !item.mobileTab);
  const moreActive = more.some((item) => pathname.startsWith(item.to));

  const tabClass = (active: boolean) =>
    cn(
      'flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors',
      active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
    );

  return (
    <nav
      aria-label={t('nav.mobile')}
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <ul className="flex">
        {tabs.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.to} className="flex flex-1">
              <NavLink
                to={item.to}
                end={item.end ?? false}
                className={({ isActive }) => tabClass(isActive)}
              >
                <Icon className="size-5" aria-hidden />
                {t(item.labelKey)}
              </NavLink>
            </li>
          );
        })}
        <li className="flex flex-1">
          <DropdownMenu>
            <DropdownMenuTrigger className={tabClass(moreActive)}>
              <MoreHorizontal className="size-5" aria-hidden />
              {t('nav.more')}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" className="min-w-44">
              {more.map((item) => {
                const Icon = item.icon;
                return (
                  <DropdownMenuItem key={item.to} asChild>
                    <NavLink to={item.to}>
                      <Icon aria-hidden />
                      {t(item.labelKey)}
                    </NavLink>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </li>
      </ul>
    </nav>
  );
}

export function AppLayout() {
  const { t } = useTranslation();
  const userName = useBondhuStore((s) => s.user.name);
  const streak = useBondhuStore((s) => s.user.streak);
  const checkStreak = useBondhuStore((s) => s.checkStreak);

  // Legacy client-side streak check; moves to a database function in Phase 2.
  useEffect(() => {
    if (userName) checkStreak();
  }, [userName, checkStreak]);

  return (
    <div className="min-h-dvh">
      <Onboarding />

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-card lg:flex">
        <div className="flex h-16 items-center px-5">
          <Logo to="/app" />
        </div>
        <nav aria-label={t('nav.primary')} className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {APP_NAV.map((item) => (
              <li key={item.to}>
                <SidebarLink item={item} />
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t p-4">
          <UserSummary />
        </div>
      </aside>

      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">
            <Logo to="/app" className="lg:hidden" />
            <div className="hidden lg:block">{userName && <StreakBadge streak={streak} />}</div>
            <div className="flex items-center gap-1">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main
          id="main"
          tabIndex={-1}
          className="mx-auto w-full max-w-6xl px-4 pt-6 pb-28 outline-none sm:px-6 lg:px-8 lg:pt-8 lg:pb-12"
        >
          <Outlet />
        </main>
      </div>

      <MobileTabBar />
      <XpNotification />
    </div>
  );
}
