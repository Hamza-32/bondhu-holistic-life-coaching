import { Delete } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { TileState, WordLang } from './logic';
import { STATE_CLASS } from './styles';

const LAYOUTS: Record<WordLang, readonly string[][]> = {
  en: [Array.from('QWERTYUIOP'), Array.from('ASDFGHJKL'), Array.from('ZXCVBNM')],
  bn: [
    ['অ', 'আ', 'ই', 'ঈ', 'উ', 'ঊ', 'ঋ', 'এ', 'ঐ', 'ও', 'ঔ'],
    ['া', 'ি', 'ী', 'ু', 'ূ', 'ৃ', 'ে', 'ৈ', 'ো', 'ৌ', 'ং', 'ঃ', 'ঁ'],
    ['ক', 'খ', 'গ', 'ঘ', 'ঙ', 'চ', 'ছ', 'জ', 'ঝ', 'ঞ', 'ট', 'ঠ'],
    ['ড', 'ঢ', 'ণ', 'ত', 'থ', 'দ', 'ধ', 'ন', 'প', 'ফ', 'ব', 'ভ'],
    ['ম', 'য', 'র', 'ল', 'শ', 'ষ', 'স', 'হ', 'ড়', 'ঢ়', 'য়', 'ৎ'],
  ],
};

/** Vowel signs and marks attach to the previous letter; show them on a dotted circle. */
const COMBINING = /^\p{M}$/u;

export function Keyboard({
  lang,
  states,
  disabled,
  onKey,
  onEnter,
  onBackspace,
}: {
  lang: WordLang;
  states: ReadonlyMap<string, TileState>;
  disabled: boolean;
  onKey: (key: string) => void;
  onEnter: () => void;
  onBackspace: () => void;
}) {
  const { t } = useTranslation();
  const base =
    'flex h-11 min-w-0 flex-1 touch-manipulation items-center justify-center rounded-md border text-sm font-semibold select-none disabled:opacity-50 sm:h-12 sm:text-base';

  return (
    <div
      role="group"
      aria-label={t('games.shobdo.keyboard')}
      className="mx-auto max-w-xl space-y-1.5"
    >
      {LAYOUTS[lang].map((row, r) => (
        <div key={r} className="flex gap-1">
          {row.map((key) => {
            const state = states.get(key.normalize('NFC')) ?? states.get(key);
            return (
              <button
                key={key}
                type="button"
                disabled={disabled}
                onClick={() => onKey(key)}
                aria-label={state ? `${key}, ${t(`games.shobdo.states.${state}`)}` : key}
                className={cn(base, state ? STATE_CLASS[state] : 'bg-muted hover:bg-accent')}
                lang={lang}
              >
                {COMBINING.test(key) ? `◌${key}` : key}
              </button>
            );
          })}
        </div>
      ))}
      <div className="flex gap-1">
        <button
          type="button"
          disabled={disabled}
          onClick={onEnter}
          className={cn(base, 'flex-[2] bg-primary text-primary-foreground hover:bg-primary/90')}
        >
          {t('games.shobdo.enter')}
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onBackspace}
          aria-label={t('games.shobdo.backspace')}
          className={cn(base, 'flex-[2] bg-muted hover:bg-accent')}
        >
          <Delete className="size-5" aria-hidden />
        </button>
      </div>
    </div>
  );
}
