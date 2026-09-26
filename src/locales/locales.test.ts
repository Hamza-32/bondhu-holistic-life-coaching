import { describe, expect, it } from 'vitest';
import bn from './bn.json';
import en from './en.json';

/**
 * Flatten nested translations into dotted keys, e.g. `nav.home` or `landing.faq.items.0.q`.
 * Arrays recurse by index, so list lengths and the fields of list items are checked too.
 */
function flattenKeys(value: unknown, prefix = ''): string[] {
  if (value === null || typeof value !== 'object') return [prefix];
  const entries = Array.isArray(value)
    ? value.map((child, i) => [String(i), child] as const)
    : Object.entries(value);
  return entries.flatMap(([key, child]) => flattenKeys(child, prefix ? `${prefix}.${key}` : key));
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

  it('Bangla has exactly the same keys (and list lengths) as English', () => {
    expect(bnKeys).toEqual(enKeys);
  });

  it('has no empty translations', () => {
    for (const key of bnKeys) {
      const value = leafAt(bn, key);
      expect(typeof value, key).toBe('string');
      expect(String(value).trim(), key).not.toBe('');
    }
  });

  it('keeps interpolation placeholders consistent between languages', () => {
    const placeholders = (s: unknown) => (String(s).match(/\{\{\w+\}\}/g) ?? []).sort();
    for (const key of enKeys) {
      expect(placeholders(leafAt(bn, key)), key).toEqual(placeholders(leafAt(en, key)));
    }
  });
});
