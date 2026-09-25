import { useEffect, useId, useRef, useState, type SubmitEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { LogoMark } from '@/components/Logo';
import { useBondhuStore } from '@/stores/useBondhuStore';

/** Temporary name-only onboarding. Replaced by the full Supabase onboarding flow in Phase 2. */
export const Onboarding = () => {
  const { t } = useTranslation();
  const userName = useBondhuStore((s) => s.user.name);
  const setUserName = useBondhuStore((s) => s.setUserName);
  const [inputName, setInputName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const inputId = useId();
  const open = !userName;

  // Move focus into the dialog when it opens (it blocks the rest of the app).
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  if (!open) return null;

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = inputName.trim();
    if (name) setUserName(name);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-2xl bg-card p-8 text-center shadow-2xl"
      >
        <LogoMark className="mx-auto mb-6 size-16" />
        <h2 id={titleId} className="mb-2 text-3xl font-bold text-foreground">
          {t('onboarding.title')}
        </h2>
        <p className="mb-8 text-muted-foreground">{t('onboarding.subtitle')}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-left">
            <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-foreground">
              {t('onboarding.nameLabel')}
            </label>
            <input
              ref={inputRef}
              id={inputId}
              type="text"
              autoComplete="given-name"
              maxLength={50}
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              placeholder={t('onboarding.namePlaceholder')}
              className="w-full rounded-lg border border-input bg-background px-4 py-3 transition-all outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
            />
          </div>

          <button
            type="submit"
            disabled={!inputName.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-lg font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t('onboarding.submit')} <ArrowRight size={20} aria-hidden />
          </button>
        </form>
      </motion.div>
    </div>
  );
};
