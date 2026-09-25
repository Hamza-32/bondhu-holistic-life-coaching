import { describe, expect, it } from 'vitest';
import { resolveTheme, useUiStore } from './useUiStore';

describe('resolveTheme', () => {
  it('follows the OS preference for "system"', () => {
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
  });

  it('ignores the OS preference for explicit choices', () => {
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
  });
});

describe('useUiStore', () => {
  it('persists the theme under the key read by the index.html pre-paint script', () => {
    useUiStore.getState().setTheme('dark');
    const saved = JSON.parse(localStorage.getItem('bondhu-ui') ?? '{}') as {
      state?: { theme?: string };
    };
    expect(saved.state?.theme).toBe('dark');
  });
});
