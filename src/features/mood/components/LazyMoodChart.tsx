import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import type { MoodPoint } from '../aggregate';

// Recharts is heavy; load it only when a chart is actually on screen.
const MoodChart = lazy(() => import('./MoodChart').then((m) => ({ default: m.MoodChart })));

export function LazyMoodChart(props: { points: MoodPoint[]; days: number }) {
  return (
    <Suspense fallback={<Skeleton className="h-56" />}>
      <MoodChart {...props} />
    </Suspense>
  );
}
