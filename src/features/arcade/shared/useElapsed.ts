import { useEffect, useState } from 'react';

/**
 * Seconds elapsed while `running` is true; pausing keeps the count. To reset, remount the
 * component (games restart by changing their React `key`).
 */
export function useElapsed(running: boolean) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  return seconds;
}

/** m:ss using the given (locale-aware) number formatter. */
export function formatClock(total: number, format: (n: number) => string) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${format(m)}:${s < 10 ? format(0) : ''}${format(s)}`;
}
