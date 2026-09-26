import type { TileState } from './logic';

export const STATE_CLASS: Record<TileState, string> = {
  correct: 'border-emerald-600 bg-emerald-600 text-white',
  present: 'border-amber-500 bg-amber-500 text-white',
  absent: 'border-slate-500 bg-slate-500 text-white dark:border-slate-600 dark:bg-slate-600',
};
