import { describe, expect, it } from 'vitest';
import { moveFocus } from './grid';

describe('moveFocus', () => {
  // 3 × 4 grid:  0 1 2 3 / 4 5 6 7 / 8 9 10 11
  it('moves in four directions and stops at the edges', () => {
    expect(moveFocus(5, 'ArrowLeft', 3, 4)).toBe(4);
    expect(moveFocus(5, 'ArrowRight', 3, 4)).toBe(6);
    expect(moveFocus(5, 'ArrowUp', 3, 4)).toBe(1);
    expect(moveFocus(5, 'ArrowDown', 3, 4)).toBe(9);
    expect(moveFocus(4, 'ArrowLeft', 3, 4)).toBe(4);
    expect(moveFocus(11, 'ArrowDown', 3, 4)).toBe(11);
  });

  it('jumps to the row ends and ignores other keys', () => {
    expect(moveFocus(6, 'Home', 3, 4)).toBe(4);
    expect(moveFocus(6, 'End', 3, 4)).toBe(7);
    expect(moveFocus(6, 'a', 3, 4)).toBeNull();
  });
});
