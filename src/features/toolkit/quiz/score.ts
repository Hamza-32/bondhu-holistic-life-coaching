import type { Archetype } from '../api';

/** Majority vote; ties go to the archetype chosen first. */
export function scoreQuiz(answers: readonly Archetype[]): Archetype {
  const counts = new Map<Archetype, number>();
  for (const a of answers) counts.set(a, (counts.get(a) ?? 0) + 1);
  let best: Archetype = answers[0] ?? 'tech';
  for (const a of answers) if ((counts.get(a) ?? 0) > (counts.get(best) ?? 0)) best = a;
  return best;
}
