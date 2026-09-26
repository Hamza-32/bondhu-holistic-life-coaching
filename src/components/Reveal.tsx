import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Seconds to wait before animating, for staggering siblings. */
  delay?: number;
}

/**
 * Fades content up as it scrolls into view, once. Plain CSS + IntersectionObserver, so the
 * landing page does not need the animation library. The hidden starting state applies only
 * with `motion-safe`, so reduced-motion users always see the content immediately.
 */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -64px 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-reveal={shown ? 'shown' : 'hidden'}
      style={{ transitionDelay: `${delay}s` }}
      className={cn(
        'motion-safe:transition-[opacity,translate] motion-safe:duration-700 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]',
        'motion-safe:data-[reveal=hidden]:translate-y-6 motion-safe:data-[reveal=hidden]:opacity-0',
        className,
      )}
    >
      {children}
    </div>
  );
}
