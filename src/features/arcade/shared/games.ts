import {
  Brush,
  Flower2,
  Grid3x3,
  Sailboat,
  SpellCheck2,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import type { GameCode, LeaderboardMode } from './api';

export type GameSlug =
  'shapla-breath' | 'rickshaw-memory' | 'nouka-drift' | 'shobdo' | 'kantha-canvas' | 'bubble-pop';

export interface GameInfo {
  slug: GameSlug;
  code: GameCode;
  /** i18n namespace under `games.*`. */
  key: 'shaplaBreath' | 'rickshawMemory' | 'noukaDrift' | 'shobdo' | 'kanthaCanvas' | 'bubblePop';
  icon: LucideIcon;
  leaderboard: LeaderboardMode;
  /** Tailwind tint for the hub card. */
  tint: string;
}

export const GAMES: readonly GameInfo[] = [
  {
    slug: 'shapla-breath',
    code: 'shapla_breath',
    key: 'shaplaBreath',
    icon: Flower2,
    leaderboard: 'total',
    tint: 'bg-coral-soft text-coral',
  },
  {
    slug: 'bubble-pop',
    code: 'bubble_pop',
    key: 'bubblePop',
    icon: Sparkles,
    leaderboard: 'total',
    tint: 'bg-secondary text-primary',
  },
  {
    slug: 'rickshaw-memory',
    code: 'rickshaw_memory',
    key: 'rickshawMemory',
    icon: Grid3x3,
    leaderboard: 'best',
    tint: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
  },
  {
    slug: 'shobdo',
    code: 'shobdo',
    key: 'shobdo',
    icon: SpellCheck2,
    leaderboard: 'total',
    tint: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
  },
  {
    slug: 'nouka-drift',
    code: 'nouka_drift',
    key: 'noukaDrift',
    icon: Sailboat,
    leaderboard: 'best',
    tint: 'bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300',
  },
  {
    slug: 'kantha-canvas',
    code: 'kantha_canvas',
    key: 'kanthaCanvas',
    icon: Brush,
    leaderboard: 'total',
    tint: 'bg-secondary text-primary',
  },
];

export function gameBySlug(slug: string | undefined): GameInfo | undefined {
  return GAMES.find((g) => g.slug === slug);
}

/** Registry lookup for a known slug (throws on a typo, which tests catch). */
export function getGame(slug: GameSlug): GameInfo {
  const game = gameBySlug(slug);
  if (!game) throw new Error(`Unknown game: ${slug}`);
  return game;
}
