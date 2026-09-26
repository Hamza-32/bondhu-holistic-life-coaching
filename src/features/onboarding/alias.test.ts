import { describe, expect, it } from 'vitest';
import { generateAlias } from './alias';

// The word lists are checked against the SQL migration in supabase/tests/alias-parity.test.ts.

describe('generateAlias', () => {
  it('produces "Adjective Noun NN" within the database length limits', () => {
    for (let i = 0; i < 200; i++) {
      const alias = generateAlias();
      expect(alias).toMatch(/^[A-Z][a-z]+ [A-Z][a-z]+ [1-9]\d$/);
      expect(alias.length).toBeGreaterThanOrEqual(3);
      expect(alias.length).toBeLessThanOrEqual(40);
    }
  });

  it('covers the edges of the random range', () => {
    expect(generateAlias(() => 0)).toBe('Calm Shapla 10');
    expect(generateAlias(() => 0.999999)).toBe('Cheerful Borsha 99');
  });
});
