/*
 * Anonymous alias suggestions, e.g. "Calm Shapla 42".
 * Keep these lists identical to private.random_alias() in
 * supabase/migrations/20260926000300_profiles.sql (a test enforces this).
 */
export const ALIAS_ADJECTIVES = [
  'Calm',
  'Brave',
  'Kind',
  'Bright',
  'Gentle',
  'Quiet',
  'Hopeful',
  'Steady',
  'Curious',
  'Warm',
  'Clever',
  'Cheerful',
] as const;

export const ALIAS_NOUNS = [
  'Shapla',
  'Doel',
  'Hilsa',
  'Kadam',
  'Nouka',
  'River',
  'Tiger',
  'Kathal',
  'Ghuri',
  'Banyan',
  'Mango',
  'Borsha',
] as const;

function pick<T>(items: readonly T[], random: () => number): T {
  const item = items[Math.floor(random() * items.length)];
  if (item === undefined) throw new Error('empty list');
  return item;
}

export function generateAlias(random: () => number = Math.random): string {
  const number = 10 + Math.floor(random() * 90);
  return `${pick(ALIAS_ADJECTIVES, random)} ${pick(ALIAS_NOUNS, random)} ${number}`;
}
