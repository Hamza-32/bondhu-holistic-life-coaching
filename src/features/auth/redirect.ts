const DEFAULT_AFTER_SIGN_IN = '/app';

/**
 * Validate a post-sign-in `next` path. Only same-origin, absolute app paths are allowed, which
 * blocks open redirects such as `//evil.com`, `/\evil.com` or `https://evil.com`.
 */
export function safeNextPath(
  next: string | null | undefined,
  fallback = DEFAULT_AFTER_SIGN_IN,
): string {
  if (!next) return fallback;
  if (!next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return fallback;
  for (let i = 0; i < next.length; i++) {
    if (next.charCodeAt(i) < 0x20) return fallback; // control characters (e.g. \t, \n)
  }
  if (next.startsWith('/login') || next.startsWith('/signup') || next.startsWith('/auth/'))
    return fallback;
  return next;
}

/** Absolute URL for auth email links and OAuth redirects. */
export function authRedirectUrl(path: string): string {
  return new URL(path, window.location.origin).toString();
}
