import type { WordLang } from './logic';

const KEY = 'bondhu-shobdo';

export interface SavedPuzzle {
  puzzle: number;
  guesses: string[];
  /** The finished result was sent to the database (so reloading never double-records). */
  recorded: boolean;
}

type Saved = Partial<Record<WordLang, SavedPuzzle>>;

function readAll(): Saved {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? '{}');
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

/** Today's progress for a language, or a fresh puzzle if the saved one is from another day. */
export function loadPuzzle(lang: WordLang, puzzle: number): SavedPuzzle {
  const saved = readAll()[lang];
  return saved?.puzzle === puzzle && Array.isArray(saved.guesses)
    ? saved
    : { puzzle, guesses: [], recorded: false };
}

export function savePuzzle(lang: WordLang, state: SavedPuzzle) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...readAll(), [lang]: state }));
  } catch {
    // Storage blocked: the game still works for this visit.
  }
}
