import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { ALIAS_ADJECTIVES, ALIAS_NOUNS } from '../../src/features/onboarding/alias';

const MIGRATION = path.resolve(import.meta.dirname, '../migrations/20260926000300_profiles.sql');

/** Extract the two word lists from private.random_alias() in the SQL migration. */
function sqlWordLists(): string[][] {
  const sql = readFileSync(MIGRATION, 'utf8');
  const fn = sql.slice(sql.indexOf('function private.random_alias'));
  return [...fn.matchAll(/array\[([^\]]+)\]/g)]
    .slice(0, 2)
    .map((m) => m[1].split(',').map((word) => word.trim().replace(/^'|'$/g, '')));
}

describe('anonymous alias word lists', () => {
  it('are identical in the client suggester and the database generator', () => {
    const [adjectives, nouns] = sqlWordLists();
    expect(adjectives).toEqual([...ALIAS_ADJECTIVES]);
    expect(nouns).toEqual([...ALIAS_NOUNS]);
  });
});
