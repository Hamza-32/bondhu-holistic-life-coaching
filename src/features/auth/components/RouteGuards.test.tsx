import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthContextValue } from '../context';
import { GuestOnly, RequireAuth } from './RouteGuards';

interface Mocks {
  auth: AuthContextValue;
  profile: Record<string, unknown>;
}

const mocks: Mocks = vi.hoisted(() => ({
  auth: { state: { status: 'signedOut', session: null, user: null }, isRecovery: false },
  profile: { isPending: false, isError: false, data: { onboarding_done: true } },
}));

vi.mock('../context', () => ({ useAuth: () => mocks.auth }));
vi.mock('@/features/profile/api', () => ({ useProfile: () => mocks.profile }));

function renderAt(path: string) {
  const router = createMemoryRouter(
    [
      {
        element: <RequireAuth />,
        children: [
          { path: '/app', element: <h1>Dashboard</h1> },
          { path: '/onboarding', element: <h1>Onboarding</h1> },
        ],
      },
      { element: <GuestOnly />, children: [{ path: '/login', element: <h1>Login</h1> }] },
    ],
    { initialEntries: [path] },
  );
  render(<RouterProvider router={router} />);
  return router;
}

const signedIn = {
  state: { status: 'signedIn', session: {}, user: { id: 'u1' } },
  isRecovery: false,
} as unknown as AuthContextValue;

describe('route guards', () => {
  beforeEach(() => {
    mocks.auth = { state: { status: 'signedOut', session: null, user: null }, isRecovery: false };
    mocks.profile = { isPending: false, isError: false, data: { onboarding_done: true } };
  });

  it('sends signed-out visitors to /login and remembers where they were going', async () => {
    const router = renderAt('/app?tab=mood');
    expect(await screen.findByRole('heading', { name: 'Login' })).toBeInTheDocument();
    expect(router.state.location.search).toBe(`?next=${encodeURIComponent('/app?tab=mood')}`);
  });

  it('sends signed-in users who have not finished onboarding to /onboarding', async () => {
    mocks.auth = signedIn;
    mocks.profile = { isPending: false, isError: false, data: { onboarding_done: false } };
    renderAt('/app');
    expect(await screen.findByRole('heading', { name: 'Onboarding' })).toBeInTheDocument();
  });

  it('lets onboarded users in, and keeps them out of onboarding and login', async () => {
    mocks.auth = signedIn;
    renderAt('/onboarding');
    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  });

  it('redirects signed-in users away from the login page', async () => {
    mocks.auth = signedIn;
    renderAt('/login?next=/app');
    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  });

  it('shows a loader while the session is being restored', () => {
    mocks.auth = { state: { status: 'loading', session: null, user: null }, isRecovery: false };
    renderAt('/app');
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
