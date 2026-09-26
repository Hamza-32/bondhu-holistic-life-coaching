import { FlaskConical } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { signOut } from '@/features/auth/api';
import { useProfile } from '@/features/profile/api';

/** Shown across the app while exploring a demo sandbox. */
export function DemoBanner() {
  const { t } = useTranslation();
  const profile = useProfile();
  const navigate = useNavigate();
  if (profile.data?.is_demo !== true) return null;

  return (
    <div
      role="note"
      className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-secondary px-4 py-2 text-center text-sm text-secondary-foreground"
    >
      <FlaskConical className="size-4 shrink-0" aria-hidden />
      <span>{t('demo.banner')}</span>
      <button
        type="button"
        className="font-semibold underline underline-offset-2"
        onClick={() => {
          void signOut().finally(() => void navigate('/signup'));
        }}
      >
        {t('demo.createAccount')}
      </button>
    </div>
  );
}
