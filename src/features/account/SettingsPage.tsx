import { useId, useState, type ReactNode } from 'react';
import { Download, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/features/auth/context';
import { useProfile } from '@/features/profile/api';
import { currentLanguage, type Language } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useUiStore, type Theme } from '@/stores/useUiStore';
import { useDeleteAccount, useExportData } from './api';

function Section({
  title,
  description,
  children,
  danger,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  danger?: boolean;
}) {
  return (
    <section
      className={cn(
        'rounded-2xl border bg-card p-5 shadow-soft sm:p-6',
        danger && 'border-destructive/40',
      )}
    >
      <h2 className={cn('text-lg font-semibold', danger && 'text-destructive')}>{title}</h2>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly { value: T; label: string; lang?: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-2">
      <span className="text-sm font-medium">{label}</span>
      <div role="radiogroup" aria-label={label} className="inline-flex rounded-lg border p-0.5">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            lang={o.lang}
            onClick={() => onChange(o.value)}
            className={cn(
              'rounded-md px-3 py-1 text-sm font-medium transition-colors',
              value === o.value ? 'bg-primary text-primary-foreground' : 'hover:bg-muted',
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function DeleteAccount() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const remove = useDeleteAccount();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const inputId = useId();
  const word = t('settings.delete.confirmWord');
  const matches = typed.trim().toLowerCase() === word.toLowerCase();

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setTyped('');
      }}
    >
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 aria-hidden />
          {t('settings.delete.button')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('settings.delete.title')}</DialogTitle>
          <DialogDescription>{t('settings.delete.body')}</DialogDescription>
        </DialogHeader>
        <form
          id="delete-account"
          onSubmit={(e) => {
            e.preventDefault();
            if (!matches) return;
            remove.mutate(undefined, {
              onSuccess: () => {
                toast.success(t('settings.delete.done'));
                void navigate('/', { replace: true });
              },
              onError: () => toast.error(t('settings.delete.failed')),
            });
          }}
        >
          <label htmlFor={inputId} className="text-sm">
            {t('settings.delete.typeToConfirm', { word })}
          </label>
          <Input
            id={inputId}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoComplete="off"
            className="mt-2"
          />
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            form="delete-account"
            variant="destructive"
            disabled={!matches || remove.isPending}
          >
            {t('settings.delete.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { state } = useAuth();
  const profile = useProfile();
  const exportData = useExportData();
  const theme = useUiStore((s) => s.theme);
  const setTheme = useUiStore((s) => s.setTheme);
  const sound = useUiStore((s) => s.soundEnabled);
  const setSound = useUiStore((s) => s.setSoundEnabled);
  const isDemo = profile.data?.is_demo === true;
  const email = state.status === 'signedIn' ? state.user.email : undefined;

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader title={t('settings.title')} subtitle={t('settings.subtitle')} />

      <Section title={t('settings.account.title')}>
        <dl className="grid gap-3 text-sm sm:grid-cols-[10rem_1fr]">
          <dt className="text-muted-foreground">{t('settings.account.name')}</dt>
          <dd className="font-medium">{profile.data?.display_name}</dd>
          <dt className="text-muted-foreground">{t('settings.account.alias')}</dt>
          <dd className="font-medium">{profile.data?.anonymous_alias}</dd>
          <dt className="text-muted-foreground">{t('settings.account.email')}</dt>
          <dd className="font-medium">{isDemo ? t('settings.account.demo') : (email ?? '–')}</dd>
        </dl>
      </Section>

      <Section title={t('settings.preferences.title')}>
        <Segmented<Language>
          label={t('settings.preferences.language')}
          value={currentLanguage()}
          onChange={(lang) => void i18n.changeLanguage(lang)}
          options={[
            { value: 'en', label: 'English', lang: 'en' },
            { value: 'bn', label: 'বাংলা', lang: 'bn' },
          ]}
        />
        <Segmented<Theme>
          label={t('settings.preferences.theme')}
          value={theme}
          onChange={setTheme}
          options={[
            { value: 'light', label: t('theme.light') },
            { value: 'dark', label: t('theme.dark') },
            { value: 'system', label: t('theme.system') },
          ]}
        />
        <Segmented<'on' | 'off'>
          label={t('settings.preferences.sound')}
          value={sound ? 'on' : 'off'}
          onChange={(v) => setSound(v === 'on')}
          options={[
            { value: 'on', label: t('settings.preferences.on') },
            { value: 'off', label: t('settings.preferences.off') },
          ]}
        />
      </Section>

      <Section title={t('settings.data.title')} description={t('settings.data.body')}>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            disabled={exportData.isPending}
            onClick={() =>
              exportData.mutate(undefined, {
                onSuccess: () => toast.success(t('settings.data.done')),
                onError: () => toast.error(t('common.loadFailed')),
              })
            }
          >
            <Download aria-hidden />
            {t('settings.data.export')}
          </Button>
          <Link to="/privacy" className="text-sm font-medium text-primary hover:underline">
            {t('settings.data.privacy')}
          </Link>
        </div>
      </Section>

      <Section
        danger
        title={t('settings.delete.sectionTitle')}
        description={t('settings.delete.sectionBody')}
      >
        <DeleteAccount />
      </Section>
    </div>
  );
}

export default SettingsPage;
