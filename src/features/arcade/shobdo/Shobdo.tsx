import { useState } from 'react';
import { Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { dhakaDateKey, formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useRecordGame } from '../shared/api';
import { GameShell } from '../shared/GameShell';
import { getGame } from '../shared/games';
import { usePersonalBest } from '../shared/personalBest';
import { useSound } from '../shared/sound';
import { useKeydown } from '../shared/useKeydown';
import { Keyboard } from './Keyboard';
import {
  answerFor,
  evaluate,
  graphemes,
  isValidGuess,
  keyStates,
  MAX_GUESSES,
  puzzleNumber,
  shareText,
  type WordLang,
} from './logic';
import { loadPuzzle, savePuzzle } from './storage';
import { STATE_CLASS } from './styles';

const GAME = getGame('shobdo');
const BENGALI_CHAR = /^[ঀ-৿]$/;

function Puzzle({
  lang,
  puzzle,
  onSolved,
}: {
  lang: WordLang;
  puzzle: number;
  onSolved: () => void;
}) {
  const { t } = useTranslation();
  const answer = answerFor(lang, puzzle);
  const [saved, setSaved] = useState(() => loadPuzzle(lang, puzzle));
  const [current, setCurrent] = useState('');
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [shareFallback, setShareFallback] = useState<string | null>(null);
  const record = useRecordGame();
  const play = useSound();

  const rows = saved.guesses.map((g) => {
    const units = graphemes(g);
    return { units, states: evaluate(units, answer) };
  });
  const won = saved.guesses.at(-1) === answer.join('');
  const over = won || saved.guesses.length >= MAX_GUESSES;
  const currentUnits = graphemes(current);
  const keys = keyStates(rows, answer);

  const type = (key: string, timeStamp: number) => {
    if (over) return;
    // Functional update so fast typing never reads a stale value.
    setCurrent((c) => {
      const next = (c + key).normalize('NFC');
      return graphemes(next).length > answer.length ? c : next;
    });
    setStartedAt((s) => s ?? timeStamp);
    play('key');
  };

  const backspace = () => {
    if (over) return;
    setCurrent((c) => Array.from(c).slice(0, -1).join(''));
  };

  const submit = (timeStamp: number) => {
    if (over) return;
    if (currentUnits.length < answer.length) {
      toast.error(t('games.shobdo.tooShort'));
      return;
    }
    if (!isValidGuess(lang, currentUnits)) {
      toast.error(t('games.shobdo.invalid'));
      return;
    }
    const guesses = [...saved.guesses, currentUnits.join('')];
    const solved = guesses.at(-1) === answer.join('');
    const finished = solved || guesses.length >= MAX_GUESSES;
    const next = { puzzle, guesses, recorded: saved.recorded || finished };
    setSaved(next);
    savePuzzle(lang, next);
    setCurrent('');
    if (finished && !saved.recorded) {
      if (solved) {
        play('win');
        onSolved();
      }
      record.mutate({
        game_code: GAME.code,
        score: solved ? MAX_GUESSES + 1 - guesses.length : 0,
        duration_seconds: startedAt === null ? 0 : (timeStamp - startedAt) / 1000,
      });
    }
  };

  useKeydown((e) => {
    if (e.key === 'Enter') submit(e.timeStamp);
    else if (e.key === 'Backspace') backspace();
    else if (lang === 'en' && /^[a-z]$/i.test(e.key)) type(e.key.toUpperCase(), e.timeStamp);
    else if (lang === 'bn' && BENGALI_CHAR.test(e.key)) type(e.key, e.timeStamp);
    else return;
    e.preventDefault();
  });

  const share = async () => {
    const text = shareText(
      lang,
      puzzle,
      rows.map((r) => r.states),
      won,
    );
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t('games.shobdo.copied'));
    } catch {
      toast.error(t('games.shobdo.shareFailed'));
      setShareFallback(text);
    }
  };

  const lengthNote =
    lang === 'bn' ? 'games.shobdo.lengthNoteBn' : ('games.shobdo.lengthNote' as const);

  return (
    <div className="rounded-3xl border bg-card p-4 shadow-soft sm:p-6">
      <p className="mb-4 text-center text-sm text-muted-foreground">
        #{formatNumber(puzzle)} ·{' '}
        {t(lengthNote, { count: answer.length, formatted: formatNumber(answer.length) })}
      </p>
      <ol
        aria-label={t('games.shobdo.board')}
        className="mx-auto mb-6 w-fit space-y-1.5"
        lang={lang}
      >
        {Array.from({ length: MAX_GUESSES }, (_, r) => {
          const row = rows[r];
          const isCurrent = r === rows.length && !over;
          const units = row?.units ?? (isCurrent ? currentUnits : []);
          return (
            <li key={r} className="flex gap-1.5">
              {Array.from({ length: answer.length }, (_, c) => {
                const letter = units[c];
                const state = row?.states[c];
                return (
                  <span
                    key={c}
                    aria-label={
                      letter
                        ? t('games.shobdo.tile', {
                            letter,
                            state: t(`games.shobdo.states.${state ?? 'empty'}`),
                          })
                        : t('games.shobdo.states.empty')
                    }
                    role="img"
                    style={{ transitionDelay: state ? `${c * 120}ms` : undefined }}
                    className={cn(
                      'flex size-12 items-center justify-center rounded-lg border-2 text-2xl font-bold uppercase motion-safe:transition-colors motion-safe:duration-500 sm:size-14',
                      state
                        ? STATE_CLASS[state]
                        : letter
                          ? 'border-foreground/40'
                          : 'border-border',
                    )}
                  >
                    {letter}
                  </span>
                );
              })}
            </li>
          );
        })}
      </ol>

      {over ? (
        <div role="status" className="mb-6 rounded-2xl bg-secondary p-5 text-center">
          <p className="text-lg font-semibold">
            {won
              ? t('games.shobdo.winTitle')
              : t('games.shobdo.loseTitle', { word: answer.join('') })}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{t('games.shobdo.comeBack')}</p>
          <Button className="mt-4" onClick={() => void share()}>
            <Share2 aria-hidden />
            {t('games.shobdo.share')}
          </Button>
          {shareFallback && (
            <textarea
              readOnly
              value={shareFallback}
              aria-label={t('games.shobdo.share')}
              className="mt-3 block h-40 w-full rounded-lg border bg-background p-2 font-mono text-sm"
              onFocus={(e) => e.currentTarget.select()}
            />
          )}
        </div>
      ) : null}

      <Keyboard
        lang={lang}
        states={keys}
        disabled={over}
        onKey={(k) => type(k, performance.now())}
        onEnter={() => submit(performance.now())}
        onBackspace={backspace}
      />
    </div>
  );
}

export function Shobdo() {
  const { t, i18n } = useTranslation();
  const [lang, setLang] = useState<WordLang>(i18n.language.startsWith('bn') ? 'bn' : 'en');
  // The day is fixed when the page opens, so a puzzle never changes under the player.
  const [puzzle] = useState(() => puzzleNumber(dhakaDateKey(new Date())));
  const { best, increment } = usePersonalBest(GAME.code);

  return (
    <GameShell
      game={GAME}
      personalBest={best}
      toolbar={
        <div
          role="radiogroup"
          aria-label={t('games.shobdo.language')}
          className="inline-flex rounded-lg border p-0.5"
        >
          {(['en', 'bn'] as const).map((l) => (
            <button
              key={l}
              type="button"
              role="radio"
              aria-checked={lang === l}
              onClick={() => setLang(l)}
              className={cn(
                'rounded-md px-3 py-1 text-sm font-medium transition-colors',
                lang === l ? 'bg-primary text-primary-foreground' : 'hover:bg-muted',
              )}
            >
              {l === 'en' ? t('games.shobdo.english') : t('games.shobdo.bangla')}
            </button>
          ))}
        </div>
      }
    >
      <Puzzle key={lang} lang={lang} puzzle={puzzle} onSolved={increment} />
    </GameShell>
  );
}

export default Shobdo;
