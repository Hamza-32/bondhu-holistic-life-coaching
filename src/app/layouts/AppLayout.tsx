import { LogOut, MoreHorizontal } from 'lucide-react';
import { motion } from 'motion/react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { APP_NAV, type NavItem } from '@/app/navigation';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { signOut } from '@/features/auth/api';
import { StreakChip } from '@/features/gamification/components';
import { useXpFeedback } from '@/features/gamification/useXpFeedback';
import { useProfile } from '@/features/profile/api';
import { HelpNowButton } from '@/features/safety/HelpNow';
import { DemoBanner } from '@/features/demo/DemoBanner';
import { CommandPalette } from '@/features/command/CommandPalette';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';

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

function useSignOut() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return async () => {
    try {
      await signOut();
      toast.success(t('auth.toast.signedOut'));
      void navigate('/', { replace: true });
    } catch {
      toast.error(t('auth.errors.generic'));
    }
  };
}

function Avatar({ name }: { name: string }) {
  return (
    <div
      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground"
      aria-hidden
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function UserSummary() {
  const { t } = useTranslation();
  const profile = useProfile();
  const handleSignOut = useSignOut();

  if (!profile.data) return null;

  return (
    <div className="flex items-center gap-3">
      <Avatar name={profile.data.display_name} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{profile.data.display_name}</p>
        <p className="text-xs text-muted-foreground">
          {t('user.level', { level: formatNumber(profile.data.level) })} ·{' '}
          {t('user.xp', { xp: formatNumber(profile.data.xp) })}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => void handleSignOut()}
        aria-label={t('user.logout')}
        title={t('user.logout')}
      >
        <LogOut aria-hidden />
      </Button>
    </div>
  );
}

/** Account menu for small screens, where the sidebar (and its sign-out button) is hidden. */
function MobileAccountMenu() {
  const { t } = useTranslation();
  const profile = useProfile();
  const handleSignOut = useSignOut();
  if (!profile.data) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="rounded-full lg:hidden"
        aria-label={profile.data.display_name}
      >
        <Avatar name={profile.data.display_name} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        <DropdownMenuLabel className="truncate">{profile.data.display_name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void handleSignOut()}>
          <LogOut aria-hidden />
          {t('user.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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
  const { pathname } = useLocation();
  const profile = useProfile();
  useXpFeedback();

  return (
    <div className="min-h-dvh">
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
          <DemoBanner />
          <div className="flex h-16 items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">
            <Logo to="/app" className="lg:hidden" />
            <div className="hidden lg:block">
              {profile.data && <StreakChip streak={profile.data.current_streak} />}
            </div>
            <div className="flex items-center gap-1">
              <CommandPalette />
              <HelpNowButton className="mr-1" />
              {/* On phones these live in Settings and the command palette, to keep the bar uncluttered. */}
              <div className="hidden items-center gap-1 sm:flex">
                <LanguageToggle />
                <ThemeToggle />
              </div>
              <MobileAccountMenu />
            </div>
          </div>
        </header>

        <main
          id="main"
          tabIndex={-1}
          className="mx-auto w-full max-w-6xl px-4 pt-6 pb-28 outline-none sm:px-6 lg:px-8 lg:pt-8 lg:pb-12"
        >
          {/* Subtle page transition; MotionConfig drops the movement for reduced motion. */}
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
          <footer className="mt-16 border-t pt-6 text-xs text-muted-foreground">
            <p>
              {t('safety.disclaimer')}{' '}
              <Link to="/privacy" className="font-medium underline-offset-2 hover:underline">
                {t('safety.privacy')}
              </Link>
            </p>
          </footer>
        </main>
      </div>

      <MobileTabBar />
    </div>
  );
}
