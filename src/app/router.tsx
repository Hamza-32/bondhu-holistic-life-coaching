import { createBrowserRouter, type RouteObject } from 'react-router';
import { RouteError } from '@/app/errors/RouteError';
import { AppLayout } from '@/app/layouts/AppLayout';
import { PublicLayout } from '@/app/layouts/PublicLayout';
import { RootLayout } from '@/app/layouts/RootLayout';
import { NotFoundPage } from '@/app/pages/NotFoundPage';
import type { RouteHandle } from '@/app/routeHandle';
import { PageLoader } from '@/components/PageLoader';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { GuestOnly, RequireAuth } from '@/features/auth/components/RouteGuards';

const handle = (titleKey: RouteHandle['titleKey']): RouteHandle => ({ titleKey });

/** Every page is its own chunk, loaded on first navigation (the tiny 404 page ships in the shell). */
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RouteError />,
    hydrateFallbackElement: <PageLoader />,
    children: [
      {
        element: <PublicLayout />,
        children: [
          {
            index: true,
            handle: handle('nav.home'),
            lazy: () =>
              import('@/features/landing/LandingPage').then((m) => ({ Component: m.LandingPage })),
          },
        ],
      },
      // Auth pages. Sign-in/up are for guests only; reset and callback work in any state.
      {
        element: <AuthLayout />,
        children: [
          {
            element: <GuestOnly />,
            children: [
              {
                path: 'login',
                handle: handle('nav.signIn'),
                lazy: () =>
                  import('@/features/auth/pages/LoginPage').then((m) => ({
                    Component: m.LoginPage,
                  })),
              },
              {
                path: 'signup',
                handle: handle('nav.signUp'),
                lazy: () =>
                  import('@/features/auth/pages/SignupPage').then((m) => ({
                    Component: m.SignupPage,
                  })),
              },
              {
                path: 'forgot-password',
                handle: handle('nav.resetPassword'),
                lazy: () =>
                  import('@/features/auth/pages/ForgotPasswordPage').then((m) => ({
                    Component: m.ForgotPasswordPage,
                  })),
              },
            ],
          },
          {
            path: 'reset-password',
            handle: handle('nav.resetPassword'),
            lazy: () =>
              import('@/features/auth/pages/ResetPasswordPage').then((m) => ({
                Component: m.ResetPasswordPage,
              })),
          },
          {
            path: 'auth/callback',
            handle: handle('nav.signIn'),
            lazy: () =>
              import('@/features/auth/pages/AuthCallbackPage').then((m) => ({
                Component: m.AuthCallbackPage,
              })),
          },
        ],
      },
      // Everything below requires a session (and a finished onboarding, except onboarding itself).
      {
        element: <RequireAuth />,
        errorElement: <RouteError />,
        children: [
          {
            path: 'onboarding',
            handle: handle('nav.onboarding'),
            lazy: () =>
              import('@/features/onboarding/OnboardingPage').then((m) => ({
                Component: m.OnboardingPage,
              })),
          },
          {
            path: 'app',
            element: <AppLayout />,
            children: [
              {
                index: true,
                handle: handle('nav.dashboard'),
                lazy: () => import('@/pages/Dashboard').then((m) => ({ Component: m.Dashboard })),
              },
              {
                path: 'journal',
                handle: handle('nav.journal'),
                lazy: () => import('@/pages/Journal').then((m) => ({ Component: m.Journal })),
              },
              {
                path: 'toolkit',
                handle: handle('nav.toolkit'),
                lazy: () => import('@/pages/Toolkit').then((m) => ({ Component: m.Toolkit })),
              },
              {
                path: 'coaching',
                handle: handle('nav.coaching'),
                lazy: () => import('@/pages/Coaching').then((m) => ({ Component: m.Coaching })),
              },
              {
                path: 'community',
                handle: handle('nav.community'),
                lazy: () => import('@/pages/Community').then((m) => ({ Component: m.Community })),
              },
              {
                path: 'arcade',
                handle: handle('nav.arcade'),
                lazy: () => import('@/pages/Arcade').then((m) => ({ Component: m.Arcade })),
              },
              {
                path: 'resources',
                handle: handle('nav.resources'),
                lazy: () => import('@/pages/Resources').then((m) => ({ Component: m.Resources })),
              },
              {
                path: '*',
                handle: handle('nav.notFound'),
                Component: NotFoundPage,
              },
            ],
          },
        ],
      },
      {
        element: <PublicLayout />,
        children: [
          {
            path: '*',
            handle: handle('nav.notFound'),
            Component: NotFoundPage,
          },
        ],
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
