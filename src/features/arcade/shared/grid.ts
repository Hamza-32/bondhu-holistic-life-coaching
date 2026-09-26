/** Roving-focus movement inside a rows × cols grid of buttons. Returns null for other keys. */
export function moveFocus(index: number, key: string, rows: number, cols: number): number | null {
  const row = Math.floor(index / cols);
  const col = index % cols;
  switch (key) {
    case 'ArrowLeft':
      return col > 0 ? index - 1 : index;
    case 'ArrowRight':
      return col < cols - 1 ? index + 1 : index;
    case 'ArrowUp':
      return row > 0 ? index - cols : index;
    case 'ArrowDown':
      return row < rows - 1 ? index + cols : index;
    case 'Home':
      return row * cols;
    case 'End':
      return row * cols + cols - 1;
    default:
      return null;
  }
}
