/** Original shapla (water lily) drawn from rotated petals. Decorative. */
const OUTER = Array.from({ length: 8 }, (_, i) => i * 45);
const INNER = Array.from({ length: 6 }, (_, i) => i * 60 + 30);

export function ShaplaFlower({ className }: { className?: string }) {
  return (
    <svg viewBox="-100 -100 200 200" className={className} aria-hidden>
      <defs>
        <radialGradient id="shapla-outer" cx="0" cy="0" r="1" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#fff1ec" />
          <stop offset="100%" stopColor="#ef6c5a" />
        </radialGradient>
        <linearGradient id="shapla-inner" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffe3dc" />
          <stop offset="100%" stopColor="#f08a79" />
        </linearGradient>
      </defs>
      <circle r="92" fill="#3dbe8b" opacity="0.12" />
      {OUTER.map((deg) => (
        <path
          key={`o${deg}`}
          d="M0 -8 C 18 -30, 18 -70, 0 -88 C -18 -70, -18 -30, 0 -8 Z"
          fill="url(#shapla-outer)"
          stroke="#d9543f"
          strokeOpacity="0.25"
          transform={`rotate(${deg})`}
        />
      ))}
      {INNER.map((deg) => (
        <path
          key={`i${deg}`}
          d="M0 -6 C 12 -22, 12 -48, 0 -60 C -12 -48, -12 -22, 0 -6 Z"
          fill="url(#shapla-inner)"
          transform={`rotate(${deg})`}
        />
      ))}
      <circle r="14" fill="#f6c453" />
      {Array.from({ length: 10 }, (_, i) => (
        <circle
          key={i}
          r="2.2"
          fill="#e0a526"
          cx={Math.cos((i / 10) * Math.PI * 2) * 8}
          cy={Math.sin((i / 10) * Math.PI * 2) * 8}
        />
      ))}
    </svg>
  );
}
