import { WORDS } from './words';

export type WordLang = keyof typeof WORDS;
export type TileState = 'correct' | 'present' | 'absent';

export const MAX_GUESSES = 6;
/** Day 1 of the puzzle series (Asia/Dhaka calendar). */
const EPOCH = Date.UTC(2026, 0, 1);
/** Walk the list in a fixed scrambled order; must be coprime with both list lengths. */
const STEP = 7;

const segmenter = new Intl.Segmenter('bn', { granularity: 'grapheme' });

/** User-perceived letters (NFC), so a Bangla consonant with its vowel sign is one tile. */
export function graphemes(text: string): string[] {
  return Array.from(segmenter.segment(text.normalize('NFC')), (s) => s.segment);
}

/** Puzzle number (1-based) for a YYYY-MM-DD Dhaka date key. */
export function puzzleNumber(dateKey: string): number {
  return Math.round((Date.parse(`${dateKey}T00:00:00Z`) - EPOCH) / 86_400_000) + 1;
}

export function answerFor(lang: WordLang, puzzle: number): string[] {
  const list = WORDS[lang];
  const index = ((((puzzle - 1) * STEP) % list.length) + list.length) % list.length;
  return graphemes(list[index] ?? list[0]);
}

const LETTER = { en: /^[A-Z]$/, bn: /^[অ-হৎড়-য়][ঀ-৿]*$/ };

/** Every tile must be a letter of the chosen script (no dictionary check, by design). */
export function isValidGuess(lang: WordLang, units: readonly string[]) {
  return units.every((u) => LETTER[lang].test(u));
}

/** Wordle scoring: exact matches first, then remaining letters left to right. */
export function evaluate(guess: readonly string[], answer: readonly string[]): TileState[] {
  const states: TileState[] = guess.map((g, i) => (g === answer[i] ? 'correct' : 'absent'));
  const left = new Map<string, number>();
  answer.forEach((a, i) => {
    if (states[i] !== 'correct') left.set(a, (left.get(a) ?? 0) + 1);
  });
  guess.forEach((g, i) => {
    const n = left.get(g) ?? 0;
    if (states[i] === 'absent' && n > 0) {
      states[i] = 'present';
      left.set(g, n - 1);
    }
  });
  return states;
}

const RANK: Record<TileState, number> = { absent: 0, present: 1, correct: 2 };

/**
 * Colour for each keyboard key. A Bangla key is one code point inside a cluster, so it takes the
 * best state of the tiles that contain it, and is only greyed out when the answer lacks it
 * entirely (a wrong cluster may still share its consonant with the answer).
 */
export function keyStates(
  rows: readonly { units: readonly string[]; states: readonly TileState[] }[],
  answer: readonly string[],
): Map<string, TileState> {
  const answerChars = new Set(Array.from(answer.join('')));
  const result = new Map<string, TileState>();
  for (const { units, states } of rows) {
    units.forEach((unit, i) => {
      const state = states[i] ?? 'absent';
      for (const ch of unit) {
        const effective = state === 'absent' && answerChars.has(ch) ? null : state;
        if (!effective) continue;
        const prev = result.get(ch);
        if (!prev || RANK[effective] > RANK[prev]) result.set(ch, effective);
      }
    });
  }
  return result;
}

const EMOJI: Record<TileState, string> = { correct: '🟩', present: '🟨', absent: '⬜' };

export function shareText(
  lang: WordLang,
  puzzle: number,
  rows: readonly (readonly TileState[])[],
  won: boolean,
) {
  const header = `Bondhu Shobdo ${lang === 'bn' ? 'বাংলা' : 'EN'} #${puzzle} ${won ? rows.length : 'X'}/${MAX_GUESSES}`;
  return [header, ...rows.map((r) => r.map((s) => EMOJI[s]).join(''))].join('\n');
}
