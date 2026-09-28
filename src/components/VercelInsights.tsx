import { lazy, Suspense, useEffect, useState } from 'react';

const Insights = lazy(async () => {
  const [{ Analytics }, { SpeedInsights }] = await Promise.all([
    import('@vercel/analytics/react'),
    import('@vercel/speed-insights/react'),
  ]);

  return {
    default: function LoadedInsights() {
      return (
        <>
          <Analytics debug={false} />
          <SpeedInsights debug={false} />
        </>
      );
    },
  };
});

/**
 * Production-only telemetry. Loading is delayed until after hydration and initial paint so the
 * monitoring code never competes with Bondhu's interactive app or prerendered landing page.
 */
export function VercelInsights() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!import.meta.env.PROD) return;
    const timer = window.setTimeout(() => setReady(true), 1500);
    return () => window.clearTimeout(timer);
  }, []);

  if (!ready) return null;
  return (
    <Suspense fallback={null}>
      <Insights />
    </Suspense>
  );
}
