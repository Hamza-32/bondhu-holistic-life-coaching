import { useEffect, useEffectEvent } from 'react';

function isTyping(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
  );
}

/**
 * Window-level keyboard controls for a game. Ignored while the player is typing in a field, and
 * Space/Enter are left alone on focused buttons so they are not triggered twice.
 */
export function useKeydown(handler: (event: KeyboardEvent) => void, enabled = true) {
  const onKey = useEffectEvent(handler);

  useEffect(() => {
    if (!enabled) return;
    const listener = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTyping(event.target)) return;
      if (
        (event.key === ' ' || event.key === 'Enter') &&
        event.target instanceof HTMLElement &&
        event.target.closest('button, a, [role="button"]')
      )
        return;
      onKey(event);
    };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [enabled]);
}
