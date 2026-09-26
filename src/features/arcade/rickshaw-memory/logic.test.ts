import { describe, expect, it } from 'vitest';
import { deal, LEVELS, score } from './logic';

describe('deal', () => {
  it('deals every chosen motif exactly twice with unique ids', () => {
    for (const { pairs } of Object.values(LEVELS)) {
      const deck = deal(pairs);
      expect(deck).toHaveLength(pairs * 2);
      expect(new Set(deck.map((c) => c.id)).size).toBe(pairs * 2);
      const counts = new Map<string, number>();
      for (const c of deck) counts.set(c.motif, (counts.get(c.motif) ?? 0) + 1);
      expect(counts.size).toBe(pairs);
      expect([...counts.values()].every((n) => n === 2)).toBe(true);
    }
  });

  it('is deterministic for a given random source', () => {
    const seeded = () => {
      let x = 42;
      return () => ((x = (x * 16807) % 2147483647) - 1) / 2147483646;
    };
    expect(deal(6, seeded())).toEqual(deal(6, seeded()));
  });
});

describe('score', () => {
  it('rewards fewer moves, less time and harder levels', () => {
    expect(score('easy', 6, 0)).toBe(600);
    expect(score('easy', 10, 30)).toBe(600 - 40 - 30);
    expect(score('hard', 12, 0)).toBe(3000);
    expect(score('medium', 8, 20)).toBeGreaterThan(score('easy', 6, 20));
  });

  it('never drops below 10', () => {
    expect(score('easy', 500, 5000)).toBe(10);
  });
});
