/**
 * Original motifs drawn for Bondhu in the spirit of Dhaka rickshaw art: bold outlines, saturated
 * reds, greens and yellows. Hand-authored SVG, no third-party artwork.
 */
import type { MotifId } from './logic';

const INK = '#1f2937';
const RED = '#d7263d';
const GREEN = '#1b998b';
const YELLOW = '#f4c20d';
const BLUE = '#2e86de';
const PINK = '#e84393';
const ORANGE = '#f77f00';

const line = {
  stroke: INK,
  strokeWidth: 2,
  strokeLinejoin: 'round',
  strokeLinecap: 'round',
} as const;

function Shapes({ motif }: { motif: MotifId }) {
  switch (motif) {
    case 'peacock':
      return (
        <>
          {[-60, -30, 0, 30, 60].map((a) => (
            <g key={a} transform={`rotate(${a} 32 44)`}>
              <ellipse cx="32" cy="20" rx="6" ry="13" fill={GREEN} {...line} />
              <circle cx="32" cy="14" r="3.5" fill={BLUE} {...line} strokeWidth={1.5} />
            </g>
          ))}
          <path
            d="M28 54c-4-8 0-14 4-18 2-3 1-8 2-10 3 0 4 3 3 6-1 4-2 7 1 11 3 4 2 9-1 11z"
            fill={BLUE}
            {...line}
          />
          <circle cx="35.5" cy="26" r="1" fill={INK} />
          <path d="M38 27l4 1-4 1" fill={ORANGE} {...line} strokeWidth={1.5} />
        </>
      );
    case 'lotus':
      return (
        <>
          <path d="M32 50C20 44 16 32 18 22c8 4 13 13 14 28z" fill={PINK} {...line} />
          <path d="M32 50c12-6 16-18 14-28-8 4-13 13-14 28z" fill={PINK} {...line} />
          <path d="M32 50c-6-10-6-24 0-36 6 12 6 26 0 36z" fill="#f8a5c2" {...line} />
          <path d="M14 52c10 4 26 4 36 0" fill="none" {...line} stroke={GREEN} strokeWidth={3} />
        </>
      );
    case 'parrot':
      return (
        <>
          <path
            d="M26 16c10-4 18 4 16 14-1 8-6 14-4 24-8-2-16-10-16-20 0-7 1-15 4-18z"
            fill={GREEN}
            {...line}
          />
          <path d="M34 32c4 6 4 14 2 22" fill="none" {...line} stroke={YELLOW} strokeWidth={3} />
          <path d="M40 18c5 0 8 3 7 8-2-2-4-2-6-1z" fill={RED} {...line} />
          <circle cx="35" cy="20" r="2" fill="white" {...line} strokeWidth={1.2} />
          <circle cx="35" cy="20" r="0.8" fill={INK} />
          <path d="M22 56l6-6 4 6" fill="none" {...line} />
        </>
      );
    case 'fish':
      return (
        <>
          <path d="M8 32c8-12 28-14 38 0-10 14-30 12-38 0z" fill={ORANGE} {...line} />
          <path d="M46 32l12-10v20z" fill={RED} {...line} />
          <path
            d="M22 26c3 4 3 8 0 12M30 25c3 4 3 10 0 14"
            fill="none"
            {...line}
            strokeWidth={1.5}
          />
          <circle cx="15" cy="30" r="2.2" fill="white" {...line} strokeWidth={1.2} />
          <circle cx="15" cy="30" r="0.9" fill={INK} />
        </>
      );
    case 'star':
      return (
        <>
          <path
            d="M32 6l6 14 14-6-6 14 14 6-14 6 6 14-14-6-6 14-6-14-14 6 6-14-14-6 14-6-6-14 14 6z"
            fill={YELLOW}
            {...line}
          />
          <circle cx="32" cy="32" r="6" fill={RED} {...line} />
        </>
      );
    case 'moon':
      return (
        <>
          <path d="M40 10a22 22 0 1 0 0 44 18 18 0 1 1 0-44z" fill={YELLOW} {...line} />
          <path
            d="M46 24l2 5 5 1-4 3 1 5-4-3-4 3 1-5-4-3 5-1z"
            fill={RED}
            {...line}
            strokeWidth={1.5}
          />
        </>
      );
    case 'paisley':
      return (
        <>
          <path
            d="M34 56C16 56 12 36 22 24c8-10 22-10 24-22 6 14 6 30-2 42-3 6-6 12-10 12z"
            fill={RED}
            {...line}
          />
          <path
            d="M32 48c-9 0-11-10-6-16 4-5 10-5 12-11 3 7 2 15-1 21-1 3-3 6-5 6z"
            fill={YELLOW}
            {...line}
            strokeWidth={1.5}
          />
          <circle cx="31" cy="38" r="3" fill={GREEN} {...line} strokeWidth={1.2} />
        </>
      );
    case 'heart':
      return (
        <>
          <path
            d="M32 54C8 38 8 18 20 14c6-2 10 2 12 6 2-4 6-8 12-6 12 4 12 24-12 40z"
            fill={RED}
            {...line}
          />
          <path
            d="M32 42c-10-7-10-15-5-17 3-1 4 1 5 3 1-2 2-4 5-3 5 2 5 10-5 17z"
            fill={PINK}
            {...line}
            strokeWidth={1.5}
          />
        </>
      );
    case 'sun':
      return (
        <>
          {Array.from({ length: 12 }, (_, i) => (
            <path
              key={i}
              d="M32 4l4 10h-8z"
              transform={`rotate(${i * 30} 32 32)`}
              fill={i % 2 ? RED : ORANGE}
              {...line}
              strokeWidth={1.5}
            />
          ))}
          <circle cx="32" cy="32" r="14" fill={YELLOW} {...line} />
          <path d="M26 35c3 3 9 3 12 0" fill="none" {...line} strokeWidth={1.5} />
          <circle cx="27" cy="29" r="1.3" fill={INK} />
          <circle cx="37" cy="29" r="1.3" fill={INK} />
        </>
      );
    case 'bell':
      return (
        <>
          <path d="M32 8v6" {...line} />
          <path
            d="M18 46c2-4 2-10 2-16 0-8 5-14 12-14s12 6 12 14c0 6 0 12 2 16z"
            fill={YELLOW}
            {...line}
          />
          <path d="M14 46h36v4H14z" fill={ORANGE} {...line} />
          <circle cx="32" cy="54" r="4" fill={RED} {...line} />
          <path d="M24 30h16M23 37h18" fill="none" {...line} stroke={RED} strokeWidth={2.5} />
        </>
      );
    case 'wheel':
      return (
        <>
          <circle cx="32" cy="32" r="24" fill="none" {...line} stroke={INK} strokeWidth={5} />
          <circle cx="32" cy="32" r="21" fill="none" stroke={RED} strokeWidth={2} />
          {Array.from({ length: 12 }, (_, i) => (
            <path
              key={i}
              d="M32 32V11"
              transform={`rotate(${i * 30} 32 32)`}
              stroke="#6b7280"
              strokeWidth={1.5}
            />
          ))}
          <circle cx="32" cy="32" r="6" fill={GREEN} {...line} />
          <circle cx="32" cy="32" r="2" fill={YELLOW} />
        </>
      );
    case 'leaf':
      return (
        <>
          <path d="M12 52C12 28 28 10 54 10c0 26-18 42-42 42z" fill={GREEN} {...line} />
          <path
            d="M12 52L44 20M24 40l-2-10M24 40l10 2M34 30l-1-9M34 30l9 1"
            fill="none"
            {...line}
            stroke="#d1fae5"
            strokeWidth={1.8}
          />
        </>
      );
  }
}

export function Motif({ motif, className }: { motif: MotifId; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <Shapes motif={motif} />
    </svg>
  );
}

/** Card back: a small rickshaw-panel pattern. */
export function CardBack({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <rect x="2" y="2" width="60" height="60" rx="8" fill={RED} />
      <rect
        x="7"
        y="7"
        width="50"
        height="50"
        rx="5"
        fill="none"
        stroke={YELLOW}
        strokeWidth="2"
        strokeDasharray="4 3"
      />
      {[0, 90, 180, 270].map((a) => (
        <path
          key={a}
          d="M32 16c4 6 4 10 0 16-4-6-4-10 0-16z"
          transform={`rotate(${a} 32 32)`}
          fill={GREEN}
          stroke={YELLOW}
          strokeWidth="1"
        />
      ))}
      <circle cx="32" cy="32" r="4" fill={YELLOW} />
    </svg>
  );
}
