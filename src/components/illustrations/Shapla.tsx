import { cn } from '@/lib/utils';

/**
 * Original shapla (water lily, the national flower of Bangladesh) illustration.
 * Decorative: always rendered with aria-hidden.
 */
export function Shapla({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={cn('size-24', className)} aria-hidden>
      <defs>
        <linearGradient id="shapla-petal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffd9d1" />
          <stop offset="100%" stopColor="#ef6c5a" />
        </linearGradient>
        <linearGradient id="shapla-petal-back" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbe3dc" />
          <stop offset="100%" stopColor="#d9543f" />
        </linearGradient>
      </defs>
      {/* Lily pad */}
      <ellipse cx="60" cy="96" rx="46" ry="12" fill="#3dbe8b" opacity="0.35" />
      <path d="M18 96c10-9 26-13 42-13s32 4 42 13c-12 6-27 8-42 8s-30-2-42-8z" fill="#1f8a63" />
      {/* Back petals */}
      <path
        d="M60 22c-9 12-13 26-11 40 4 12 18 12 22 0 2-14-2-28-11-40z"
        fill="url(#shapla-petal-back)"
      />
      <path
        d="M26 44c4 15 12 27 24 34 12 4 19-8 12-18-9-10-22-15-36-16z"
        fill="url(#shapla-petal-back)"
      />
      <path
        d="M94 44c-4 15-12 27-24 34-12 4-19-8-12-18 9-10 22-15 36-16z"
        fill="url(#shapla-petal-back)"
      />
      {/* Front petals */}
      <path
        d="M38 58c2 14 9 24 22 30 13-6 20-16 22-30-9 3-16 9-22 18-6-9-13-15-22-18z"
        fill="url(#shapla-petal)"
      />
      <path d="M60 40c-6 10-8 21-5 32 2 7 8 7 10 0 3-11 1-22-5-32z" fill="#ffe9e3" />
      {/* Centre */}
      <circle cx="60" cy="76" r="5" fill="#f6c453" />
    </svg>
  );
}
