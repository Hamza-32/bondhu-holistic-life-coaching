/** Must match private.level_for_xp() in the gamification migration. */
export const XP_PER_LEVEL = 500;

export function levelForXp(xp: number): number {
  return Math.floor(Math.max(0, xp) / XP_PER_LEVEL) + 1;
}

export function levelProgress(xp: number) {
  const into = Math.max(0, xp) % XP_PER_LEVEL;
  return { into, needed: XP_PER_LEVEL, percent: Math.round((into / XP_PER_LEVEL) * 100) };
}
