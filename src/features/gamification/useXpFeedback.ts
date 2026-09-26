import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useProfile } from '@/features/profile/api';
import { formatNumber } from '@/lib/format';

/** Confetti for a level-up, loaded on demand and skipped entirely for reduced motion. */
function celebrate() {
  void import('canvas-confetti').then(({ default: confetti }) =>
    confetti({
      particleCount: 120,
      spread: 75,
      origin: { y: 0.35 },
      colors: ['#006a4e', '#3dbe8b', '#f4845f', '#f4c20d'],
      disableForReducedMotion: true,
    }),
  );
}

/**
 * Turns server-side XP changes into gentle toasts ("+10 XP", "Level 3!"). The first load only
 * records the baseline, so opening the app never shows a toast.
 */
export function useXpFeedback() {
  const { t } = useTranslation();
  const profile = useProfile();
  const last = useRef<{ xp: number; level: number } | null>(null);
  const xp = profile.data?.xp;
  const level = profile.data?.level;

  useEffect(() => {
    if (xp === undefined || level === undefined) return;
    const previous = last.current;
    last.current = { xp, level };
    if (!previous) return;

    const gained = xp - previous.xp;
    if (level > previous.level) {
      celebrate();
      toast.success(t('gamification.levelUp', { level: formatNumber(level) }), {
        description: t('gamification.xpGained', { xp: formatNumber(gained) }),
      });
    } else if (gained > 0) {
      toast(t('gamification.xpGained', { xp: formatNumber(gained) }));
    }
  }, [xp, level, t]);
}
