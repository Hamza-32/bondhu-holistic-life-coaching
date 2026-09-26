import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Illustration = 'journal' | 'mood' | 'community' | 'search';

/** Small original line illustrations in the brand palette (decorative). */
function Art({ kind }: { kind: Illustration }) {
  const stroke = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 3,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  } as const;
  return (
    <svg viewBox="0 0 120 96" className="h-24 w-28 text-primary" aria-hidden>
      <ellipse cx="60" cy="88" rx="40" ry="5" className="fill-muted" />
      {kind === 'journal' && (
        <>
          <rect
            x="30"
            y="14"
            width="56"
            height="68"
            rx="6"
            className="fill-secondary"
            {...stroke}
          />
          <path d="M40 14v68" {...stroke} />
          <path d="M50 32h26M50 44h26M50 56h16" {...stroke} className="text-primary/60" />
          <path
            d="M84 30l14-14 6 6-14 14-8 2z"
            className="fill-coral-soft text-coral"
            {...stroke}
          />
        </>
      )}
      {kind === 'mood' && (
        <>
          <circle cx="50" cy="44" r="22" className="fill-secondary" {...stroke} />
          <path d="M42 50c4 5 12 5 16 0" {...stroke} />
          <circle cx="43" cy="40" r="2" className="fill-current" />
          <circle cx="57" cy="40" r="2" className="fill-current" />
          <path
            d="M74 26c2-8 16-8 18 0 7 0 9 10 2 12H74c-6-1-6-11 0-12z"
            className="fill-coral-soft text-coral"
            {...stroke}
          />
          <path d="M24 20l-4-4M50 12V6M76 58l4 4" {...stroke} className="text-coral" />
        </>
      )}
      {kind === 'community' && (
        <>
          <path
            d="M18 24h46a6 6 0 0 1 6 6v20a6 6 0 0 1-6 6H38l-12 10v-10h-8a6 6 0 0 1-6-6V30a6 6 0 0 1 6-6z"
            className="fill-secondary"
            {...stroke}
          />
          <path
            d="M78 40h22a6 6 0 0 1 6 6v16a6 6 0 0 1-6 6h-4v8l-10-8h-8a6 6 0 0 1-6-6V46a6 6 0 0 1 6-6z"
            className="fill-coral-soft text-coral"
            {...stroke}
          />
          <path d="M28 36h28M28 44h18" {...stroke} className="text-primary/60" />
        </>
      )}
      {kind === 'search' && (
        <>
          <circle cx="52" cy="42" r="22" className="fill-secondary" {...stroke} />
          <path d="M68 58l20 20" {...stroke} strokeWidth={5} />
          <path d="M44 42h16" {...stroke} className="text-primary/60" />
        </>
      )}
    </svg>
  );
}

export function EmptyState({
  illustration,
  title,
  body,
  action,
  className,
}: {
  illustration: Illustration;
  title: string;
  body?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center rounded-2xl border border-dashed px-6 py-10 text-center',
        className,
      )}
    >
      <Art kind={illustration} />
      <p className="mt-4 font-semibold">{title}</p>
      {body && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
