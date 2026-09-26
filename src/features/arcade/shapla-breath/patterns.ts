export type PhaseKind = 'inhale' | 'hold' | 'exhale' | 'rest';

export interface Phase {
  kind: PhaseKind;
  seconds: number;
}

export const PATTERNS = {
  box: [
    { kind: 'inhale', seconds: 4 },
    { kind: 'hold', seconds: 4 },
    { kind: 'exhale', seconds: 4 },
    { kind: 'rest', seconds: 4 },
  ],
  '478': [
    { kind: 'inhale', seconds: 4 },
    { kind: 'hold', seconds: 7 },
    { kind: 'exhale', seconds: 8 },
  ],
} as const satisfies Record<string, readonly Phase[]>;

export type PatternId = keyof typeof PATTERNS;

/** Where in the pattern we are after `elapsed` seconds. */
export function phaseAt(pattern: readonly Phase[], elapsed: number) {
  const cycle = pattern.reduce((sum, p) => sum + p.seconds, 0);
  let t = elapsed % cycle;
  for (const [index, phase] of pattern.entries()) {
    if (t < phase.seconds)
      return { index, phase, remaining: phase.seconds - t, cycle: Math.floor(elapsed / cycle) };
    t -= phase.seconds;
  }
  throw new Error('Breathing pattern must not be empty');
}
