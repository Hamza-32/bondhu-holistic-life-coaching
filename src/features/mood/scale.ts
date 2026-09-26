import { Annoyed, Frown, Laugh, Meh, Smile, type LucideIcon } from 'lucide-react';

export interface MoodLevel {
  score: 1 | 2 | 3 | 4 | 5;
  key: 'veryLow' | 'low' | 'okay' | 'good' | 'great';
  icon: LucideIcon;
  /** Tailwind classes for the selected state (theme-aware tokens only). */
  selected: string;
}

const OKAY: MoodLevel = {
  score: 3,
  key: 'okay',
  icon: Meh,
  selected: 'border-border bg-muted text-foreground',
};

export const MOOD_LEVELS: readonly MoodLevel[] = [
  { score: 1, key: 'veryLow', icon: Frown, selected: 'border-coral bg-coral-soft text-coral' },
  {
    score: 2,
    key: 'low',
    icon: Annoyed,
    selected:
      'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
  },
  OKAY,
  { score: 4, key: 'good', icon: Smile, selected: 'border-primary/60 bg-secondary text-primary' },
  {
    score: 5,
    key: 'great',
    icon: Laugh,
    selected: 'border-primary bg-primary text-primary-foreground',
  },
];

export function moodLevel(score: number): MoodLevel {
  return MOOD_LEVELS.find((l) => l.score === Math.round(score)) ?? OKAY;
}
