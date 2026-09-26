import { dhakaDateKey } from '@/lib/format';

export interface MoodPoint {
  /** YYYY-MM-DD in Asia/Dhaka. */
  date: string;
  /** Average score that day (1–5), or null when nothing was logged. */
  average: number | null;
  count: number;
}

/**
 * Daily average mood for the last `days` days (oldest first), grouped by Bangladesh date.
 * Days without entries are kept as gaps (average null) so charts show them honestly.
 */
export function dailyAverages(
  entries: readonly { score: number; created_at: string }[],
  days: number,
  now: Date = new Date(),
): MoodPoint[] {
  const buckets = new Map<string, { sum: number; count: number }>();
  for (const e of entries) {
    const key = dhakaDateKey(e.created_at);
    const b = buckets.get(key) ?? { sum: 0, count: 0 };
    b.sum += e.score;
    b.count += 1;
    buckets.set(key, b);
  }

  const points: MoodPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = dhakaDateKey(new Date(now.getTime() - i * 24 * 3600 * 1000));
    const b = buckets.get(date);
    points.push({
      date,
      average: b ? Math.round((b.sum / b.count) * 10) / 10 : null,
      count: b?.count ?? 0,
    });
  }
  return points;
}

/** Mean of the non-empty days, or null. */
export function overallAverage(points: readonly MoodPoint[]): number | null {
  const filled = points.filter((p) => p.average !== null);
  if (filled.length === 0) return null;
  const total = filled.reduce((sum, p) => sum + (p.average ?? 0), 0);
  return Math.round((total / filled.length) * 10) / 10;
}

/** Difference between the second and first half of the period (positive = improving). */
export function trend(points: readonly MoodPoint[]): number | null {
  const mid = Math.floor(points.length / 2);
  const first = overallAverage(points.slice(0, mid));
  const second = overallAverage(points.slice(mid));
  if (first === null || second === null) return null;
  return Math.round((second - first) * 10) / 10;
}
