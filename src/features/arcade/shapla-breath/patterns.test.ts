import { describe, expect, it } from 'vitest';
import { PATTERNS, phaseAt } from './patterns';

describe('phaseAt', () => {
  it('walks through box breathing 4-4-4-4', () => {
    expect(phaseAt(PATTERNS.box, 0)).toMatchObject({
      phase: { kind: 'inhale' },
      remaining: 4,
      cycle: 0,
    });
    expect(phaseAt(PATTERNS.box, 5)).toMatchObject({ phase: { kind: 'hold' }, remaining: 3 });
    expect(phaseAt(PATTERNS.box, 12)).toMatchObject({ phase: { kind: 'rest' }, remaining: 4 });
    expect(phaseAt(PATTERNS.box, 16)).toMatchObject({ phase: { kind: 'inhale' }, cycle: 1 });
  });

  it('handles the uneven 4-7-8 pattern (19 s cycle)', () => {
    expect(phaseAt(PATTERNS['478'], 4)).toMatchObject({ phase: { kind: 'hold' }, remaining: 7 });
    expect(phaseAt(PATTERNS['478'], 11)).toMatchObject({ phase: { kind: 'exhale' }, remaining: 8 });
    expect(phaseAt(PATTERNS['478'], 19)).toMatchObject({ phase: { kind: 'inhale' }, cycle: 1 });
  });
});
