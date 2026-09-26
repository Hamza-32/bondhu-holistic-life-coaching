import { describe, expect, it } from 'vitest';
import { dailyAverages, overallAverage, trend } from './aggregate';

// 2026-09-26 12:00 in Dhaka (UTC+6).
const NOW = new Date('2026-09-26T06:00:00Z');

describe('dailyAverages', () => {
  it('returns one point per day, oldest first, with gaps for empty days', () => {
    const points = dailyAverages(
      [
        { score: 4, created_at: '2026-09-26T03:00:00Z' },
        { score: 2, created_at: '2026-09-26T04:00:00Z' },
        { score: 5, created_at: '2026-09-24T10:00:00Z' },
      ],
      3,
      NOW,
    );
    expect(points).toEqual([
      { date: '2026-09-24', average: 5, count: 1 },
      { date: '2026-09-25', average: null, count: 0 },
      { date: '2026-09-26', average: 3, count: 2 },
    ]);
  });

  it('groups by the Bangladesh date, not UTC', () => {
    // 20:00 UTC on the 25th is 02:00 on the 26th in Dhaka.
    const points = dailyAverages([{ score: 1, created_at: '2026-09-25T20:00:00Z' }], 2, NOW);
    expect(points.at(-1)).toEqual({ date: '2026-09-26', average: 1, count: 1 });
  });
});

describe('overallAverage and trend', () => {
  it('ignores empty days and reports the change between halves', () => {
    const points = [
      { date: 'a', average: 2, count: 1 },
      { date: 'b', average: null, count: 0 },
      { date: 'c', average: 4, count: 1 },
      { date: 'd', average: 5, count: 1 },
    ];
    expect(overallAverage(points)).toBe(3.7);
    expect(trend(points)).toBe(2.5);
    expect(overallAverage([])).toBeNull();
    expect(trend([{ date: 'a', average: null, count: 0 }])).toBeNull();
  });
});
