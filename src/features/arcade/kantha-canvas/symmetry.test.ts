import { describe, expect, it } from 'vitest';
import { generateMotif, SIZE, symmetricPoints } from './symmetry';

const C = SIZE / 2;

describe('symmetricPoints', () => {
  it('rotates a point into every segment around the centre', () => {
    const pts = symmetricPoints({ x: C + 100, y: C }, 4, false);
    expect(pts).toHaveLength(4);
    const rounded = pts.map((p) => [Math.round(p.x - C), Math.round(p.y - C)]);
    expect(rounded).toEqual([
      [100, 0],
      [0, 100],
      [-100, 0],
      [0, -100],
    ]);
  });

  it('adds a mirrored copy per segment', () => {
    const pts = symmetricPoints({ x: C + 30, y: C + 40 }, 6, true);
    expect(pts).toHaveLength(12);
    // Every copy stays the same distance from the centre.
    for (const p of pts) expect(Math.hypot(p.x - C, p.y - C)).toBeCloseTo(50);
    // The first mirror is the reflection across the x axis.
    expect(pts[1]?.x).toBeCloseTo(C + 30);
    expect(pts[1]?.y).toBeCloseTo(C - 40);
  });
});

describe('generateMotif', () => {
  it('stays inside the cloth and keeps the chosen style', () => {
    let x = 0.1;
    const random = () => (x = (x * 9301 + 0.4927) % 1);
    for (let i = 0; i < 20; i++) {
      const stroke = generateMotif(random, {
        color: '#b3261e',
        size: 3,
        stitch: true,
        segments: 8,
        mirror: true,
      });
      expect(stroke.color).toBe('#b3261e');
      expect(stroke.points.length).toBeGreaterThan(10);
      for (const p of stroke.points) {
        expect(Math.hypot(p.x - C, p.y - C)).toBeLessThanOrEqual(C - 19);
      }
    }
  });
});
