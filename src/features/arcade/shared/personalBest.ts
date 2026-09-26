import { useCallback, useState } from 'react';
import type { GameCode } from './api';

const KEY = 'bondhu-arcade-best';

type Bests = Partial<Record<GameCode, number>>;

function read(): Bests {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? '{}');
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

/** Personal best (higher is better) or session count, kept on this device for instant feedback. */
export function usePersonalBest(game: GameCode) {
  const [best, setBest] = useState<number | null>(() => read()[game] ?? null);

  /** Record a score; returns true when it beats the previous best. */
  const submit = useCallback(
    (score: number) => {
      const all = read();
      const previous = all[game];
      if (previous !== undefined && score <= previous) return false;
      all[game] = score;
      try {
        localStorage.setItem(KEY, JSON.stringify(all));
      } catch {
        // Storage full or blocked: the database still has the score.
      }
      setBest(score);
      return true;
    },
    [game],
  );

  /** For count-based games: add one finished session. */
  const increment = useCallback(() => submit((read()[game] ?? 0) + 1), [game, submit]);

  return { best, submit, increment };
}
