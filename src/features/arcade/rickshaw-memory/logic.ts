export const MOTIFS = [
  'peacock',
  'lotus',
  'parrot',
  'fish',
  'star',
  'moon',
  'paisley',
  'heart',
  'sun',
  'bell',
  'wheel',
  'leaf',
] as const;

export type MotifId = (typeof MOTIFS)[number];

export const LEVELS = {
  easy: { pairs: 6, cols: 4, multiplier: 1 },
  medium: { pairs: 8, cols: 4, multiplier: 1.5 },
  hard: { pairs: 12, cols: 6, multiplier: 2.5 },
} as const;

export type Level = keyof typeof LEVELS;

export interface Card {
  id: number;
  motif: MotifId;
}

/** Unbiased shuffle via random sort keys (`random` is injectable for tests). */
function shuffle<T>(items: readonly T[], random: () => number): T[] {
  return items
    .map((item) => ({ item, key: random() }))
    .sort((a, b) => a.key - b.key)
    .map(({ item }) => item);
}

/** A shuffled deck with `pairs` pairs drawn from the motif set. */
export function deal(pairs: number, random: () => number = Math.random): Card[] {
  const chosen = shuffle(MOTIFS, random).slice(0, pairs);
  return shuffle([...chosen, ...chosen], random).map((motif, id) => ({ id, motif }));
}

/**
 * Higher is better. A perfect game (one move per pair) scores 100 points per pair; each wasted
 * move costs 10 and each second 1, scaled by difficulty. Never below 10 so finishing always counts.
 */
export function score(level: Level, moves: number, seconds: number) {
  const { pairs, multiplier } = LEVELS[level];
  const raw = pairs * 100 - Math.max(0, moves - pairs) * 10 - seconds;
  return Math.max(10, Math.round(raw * multiplier));
}
