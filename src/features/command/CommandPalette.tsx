import { useEffect, useState, type ReactNode } from 'react';
import { Command } from 'cmdk';
import { Languages, LifeBuoy, LogOut, Moon, Search, Sun } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { APP_NAV } from '@/app/navigation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { GAMES } from '@/features/arcade/shared/games';
import { signOut } from '@/features/auth/api';
import { currentLanguage } from '@/lib/i18n';
import { resolveTheme, useUiStore } from '@/stores/useUiStore';

const itemClass =
  'flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm aria-selected:bg-secondary aria-selected:text-secondary-foreground [&_svg]:size-4 [&_svg]:text-muted-foreground';
const groupClass =
  '[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-muted-foreground';

function isMac() {
  return typeof navigator !== 'undefined' && /mac|iphone|ipad/i.test(navigator.userAgent);
}

function Item({
  onSelect,
  icon,
  children,
  keywords,
}: {
  onSelect: () => void;
  icon: ReactNode;
  children: string;
  keywords?: string[];
}) {
  return (
    <Command.Item className={itemClass} onSelect={onSelect} keywords={keywords} value={children}>
      {icon}
      {children}
    </Command.Item>
  );
}

/** ⌘K / Ctrl+K palette for jumping to any page or game and running quick actions. */
export function CommandPalette() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const theme = useUiStore((s) => s.theme);
  const setTheme = useUiStore((s) => s.setTheme);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const run = (action: () => void) => {
    setOpen(false);
    action();
  };
  const go = (to: string) => run(() => void navigate(to));
  const dark =
    resolveTheme(theme, window.matchMedia('(prefers-color-scheme: dark)').matches) === 'dark';

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        aria-label={t('command.open')}
        aria-keyshortcuts="Control+K Meta+K"
        className="gap-2 text-muted-foreground"
      >
        <Search aria-hidden />
        <span className="hidden md:inline">{t('command.search')}</span>
        <kbd className="hidden rounded border bg-muted px-1.5 font-mono text-[10px] md:inline">
          {isMac() ? '⌘K' : 'Ctrl K'}
        </kbd>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="top-[20%] translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-lg">
          <DialogTitle className="sr-only">{t('command.title')}</DialogTitle>
          <DialogDescription className="sr-only">{t('command.description')}</DialogDescription>
          <Command label={t('command.title')} className="flex flex-col">
            <div className="flex items-center gap-2 border-b px-3">
              <Search className="size-4 text-muted-foreground" aria-hidden />
              <Command.Input
                placeholder={t('command.placeholder')}
                className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <Command.List className="max-h-[60vh] overflow-y-auto p-2">
              <Command.Empty className="py-8 text-center text-sm text-muted-foreground">
                {t('command.empty')}
              </Command.Empty>

              <Command.Group heading={t('command.pages')} className={groupClass}>
                {APP_NAV.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Item
                      key={item.to}
                      icon={<Icon aria-hidden />}
                      onSelect={() => go(item.to)}
                      keywords={[item.to.replace('/app/', '')]}
                    >
                      {t(item.labelKey)}
                    </Item>
                  );
                })}
              </Command.Group>

              <Command.Group heading={t('command.games')} className={groupClass}>
                {GAMES.map((game) => {
                  const Icon = game.icon;
                  return (
                    <Item
                      key={game.slug}
                      icon={<Icon aria-hidden />}
                      onSelect={() => go(`/app/arcade/${game.slug}`)}
                      keywords={[game.slug, 'game', 'arcade']}
                    >
                      {t(`games.${game.key}.title`)}
                    </Item>
                  );
                })}
              </Command.Group>

              <Command.Group heading={t('command.actions')} className={groupClass}>
                <Item
                  icon={<LifeBuoy aria-hidden />}
                  onSelect={() => go('/app/resources')}
                  keywords={['help', 'crisis', 'helpline', '999']}
                >
                  {t('safety.helpNow')}
                </Item>
                <Item
                  icon={dark ? <Sun aria-hidden /> : <Moon aria-hidden />}
                  onSelect={() => run(() => setTheme(dark ? 'light' : 'dark'))}
                  keywords={['theme', 'dark', 'light']}
                >
                  {dark ? t('command.lightMode') : t('command.darkMode')}
                </Item>
                <Item
                  icon={<Languages aria-hidden />}
                  onSelect={() =>
                    run(() => void i18n.changeLanguage(currentLanguage() === 'en' ? 'bn' : 'en'))
                  }
                  keywords={['language', 'bangla', 'english', 'ভাষা']}
                >
                  {currentLanguage() === 'en' ? t('command.toBangla') : t('command.toEnglish')}
                </Item>
                <Item
                  icon={<LogOut aria-hidden />}
                  onSelect={() => run(() => void signOut().then(() => navigate('/')))}
                  keywords={['logout', 'sign out']}
                >
                  {t('user.logout')}
                </Item>
              </Command.Group>
            </Command.List>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
