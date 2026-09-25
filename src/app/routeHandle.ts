import type { ParseKeys } from 'i18next';
import { useMatches } from 'react-router';

/** Metadata attached to routes via `handle`. */
export interface RouteHandle {
  /** Translation key for the page title. */
  titleKey: ParseKeys;
}

function isRouteHandle(handle: unknown): handle is RouteHandle {
  return typeof handle === 'object' && handle !== null && 'titleKey' in handle;
}

/** Title key of the deepest matched route that declares one. */
export function useRouteTitleKey(): ParseKeys | undefined {
  const matches = useMatches();
  for (let i = matches.length - 1; i >= 0; i--) {
    const handle = matches[i]?.handle;
    if (isRouteHandle(handle)) return handle.titleKey;
  }
  return undefined;
}
