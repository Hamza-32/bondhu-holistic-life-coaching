import { describe, expect, it } from 'vitest';
import bn from './bn.json';
import en from './en.json';

/** Flatten nested translation objects into dotted keys, e.g. `nav.home`. Arrays count as leaves. */
function flattenKeys(value: unknown, prefix = ''): string[] {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    flattenKeys(child, prefix ? `${prefix}.${key}` : key),
  );
}

function leafAt(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((node, key) => {
    if (node && typeof node === 'object') return (node as Record<string, unknown>)[key];
    return undefined;
  }, obj);
}

describe('locales', () => {
  const enKeys = flattenKeys(en).sort();
  const bnKeys = flattenKeys(bn).sort();

  it('Bangla has exactly the same keys as English', () => {
    expect(bnKeys).toEqual(enKeys);
  });

  it('has no empty translations', () => {
    for (const key of bnKeys) {
      const value = leafAt(bn, key);
      if (Array.isArray(value)) {
        expect(value.length, key).toBeGreaterThan(0);
      } else {
        expect(String(value).trim(), key).not.toBe('');
      }
    }
  });

  it('keeps interpolation placeholders consistent between languages', () => {
    const placeholders = (s: unknown) => (String(s).match(/\{\{\w+\}\}/g) ?? []).sort();
    for (const key of enKeys) {
      expect(placeholders(leafAt(bn, key)), key).toEqual(placeholders(leafAt(en, key)));
    }
  });

  it('keeps list lengths equal between languages', () => {
    expect(bn.landing.reminders).toHaveLength(en.landing.reminders.length);
  });
});
