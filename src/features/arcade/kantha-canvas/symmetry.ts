export interface Point {
  x: number;
  y: number;
}

export interface Stroke {
  points: Point[];
  color: string;
  size: number;
  stitch: boolean;
  segments: number;
  mirror: boolean;
}

/** Logical canvas size; the centre of symmetry is the middle. */
export const SIZE = 600;
const CENTER = SIZE / 2;

export const SEGMENTS = [4, 6, 8, 12] as const;

export const PALETTES = {
  classic: ['#b3261e', '#1f3a93', '#d99a1e', '#2f7d4f', '#1a1a1a'],
  indigo: ['#0f2a6b', '#2f5cb8', '#6f9be0', '#b7c9ef', '#c0392b'],
  sunset: ['#c2185b', '#e65100', '#f9a825', '#6a1b9a', '#3e2723'],
  forest: ['#1b5e20', '#558b2f', '#9e9d24', '#795548', '#00695c'],
} as const;

export type PaletteId = keyof typeof PALETTES;

/** Every rotated (and optionally mirrored) copy of a point around the centre. */
export function symmetricPoints(p: Point, segments: number, mirror: boolean): Point[] {
  const dx = p.x - CENTER;
  const dy = p.y - CENTER;
  const out: Point[] = [];
  for (let i = 0; i < segments; i++) {
    const a = (i * 2 * Math.PI) / segments;
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    out.push({ x: CENTER + dx * cos - dy * sin, y: CENTER + dx * sin + dy * cos });
    if (mirror) out.push({ x: CENTER + dx * cos + dy * sin, y: CENTER + dx * sin - dy * cos });
  }
  return out;
}

/**
 * A generated motif for keyboard users: a petal or wave between two radii inside one segment,
 * which the symmetry then repeats. `random` returns numbers in [0, 1).
 */
export function generateMotif(random: () => number, style: Omit<Stroke, 'points'>): Stroke {
  const inner = 30 + random() * 150;
  const outer = Math.min(CENTER - 20, inner + 40 + random() * 100);
  const spread = (Math.PI / style.segments) * (0.3 + random() * 0.6);
  const wave = random() < 0.5;
  const points: Point[] = [];
  const steps = 24;
  for (let s = 0; s <= steps; s++) {
    const f = s / steps;
    const r = inner + (outer - inner) * f;
    // Petal: swell out and back; wave: gentle zig-zag.
    const angle = wave ? Math.sin(f * Math.PI * 3) * spread * 0.5 : Math.sin(f * Math.PI) * spread;
    points.push({
      x: CENTER + r * Math.cos(angle - Math.PI / 2),
      y: CENTER + r * Math.sin(angle - Math.PI / 2),
    });
  }
  return { ...style, points };
}
