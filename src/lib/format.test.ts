import { describe, expect, it } from 'vitest';
import {
  dhakaDateKey,
  formatDate,
  formatDateTime,
  formatNumber,
  formatRelative,
  formatTime,
  intlLocale,
} from './format';

const DHAKA_MIDNIGHT = '2026-09-26T18:00:00.000Z';

describe('Bangladesh-aware formatting', () => {
  it('uses the requested English or Bangla locale', () => {
    expect(intlLocale('en')).toBe('en-GB');
    expect(intlLocale('bn')).toBe('bn-BD');
    expect(formatNumber(12_345, 'en')).toBe('12,345');
    expect(formatNumber(12_345, 'bn')).toContain('১২');
  });

  it('formats dates and times in Asia/Dhaka', () => {
    expect(
      formatDate(DHAKA_MIDNIGHT, { day: '2-digit', month: '2-digit', year: 'numeric' }, 'en'),
    ).toBe('27/09/2026');
    expect(formatTime(DHAKA_MIDNIGHT, 'en')).toBe('0:00');
    expect(formatDateTime(DHAKA_MIDNIGHT, 'en')).toBe('Sun 27 Sept, 0:00');
    expect(dhakaDateKey(DHAKA_MIDNIGHT)).toBe('2026-09-27');
  });

  it.each([
    [365 * 24 * 3600, 'next year'],
    [60 * 24 * 3600, 'in 2 months'],
    [14 * 24 * 3600, 'in 2 weeks'],
    [2 * 24 * 3600, 'in 2 days'],
    [2 * 3600, 'in 2 hours'],
    [5 * 60, 'in 5 minutes'],
    [10, 'this minute'],
  ])('selects an appropriate relative unit for %i seconds', (seconds, expected) => {
    const now = new Date('2026-01-01T00:00:00.000Z');
    const value = new Date(now.getTime() + seconds * 1000);
    expect(formatRelative(value, now, 'en')).toBe(expected);
  });
});
