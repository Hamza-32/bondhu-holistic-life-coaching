import { describe, expect, it } from 'vitest';
import { levelForXp, levelProgress } from './level';

describe('levels (mirrors private.level_for_xp)', () => {
  it('starts at level 1 and levels up every 500 XP', () => {
    expect([0, 499, 500, 1250].map(levelForXp)).toEqual([1, 1, 2, 3]);
    expect(levelForXp(-10)).toBe(1);
  });

  it('reports progress within the current level', () => {
    expect(levelProgress(620)).toEqual({ into: 120, needed: 500, percent: 24 });
    expect(levelProgress(1000)).toEqual({ into: 0, needed: 500, percent: 0 });
  });
});
