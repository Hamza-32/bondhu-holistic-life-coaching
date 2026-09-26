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
                lazy: () =>
                  import('@/features/dashboard/DashboardPage').then((m) => ({
                    Component: m.DashboardPage,
                  })),
              },
              {
                path: 'mood',
                handle: handle('nav.mood'),
                lazy: () =>
                  import('@/features/mood/MoodPage').then((m) => ({ Component: m.MoodPage })),
              },
              {
                path: 'journal',
                handle: handle('nav.journal'),
                lazy: () =>
                  import('@/features/journal/JournalPage').then((m) => ({
                    Component: m.JournalPage,
                  })),
              },
              {
                path: 'toolkit',
                handle: handle('nav.toolkit'),
                lazy: () =>
                  import('@/features/toolkit/ToolkitPage').then((m) => ({
                    Component: m.ToolkitPage,
                  })),
              },
              {
                path: 'coaching',
                handle: handle('nav.coaching'),
                lazy: () =>
                  import('@/features/coaching/CoachingPage').then((m) => ({
                    Component: m.CoachingPage,
                  })),
              },
              {
                path: 'community',
                handle: handle('nav.community'),
                lazy: () =>
                  import('@/features/community/CommunityPage').then((m) => ({
                    Component: m.CommunityPage,
                  })),
              },
              {
                path: 'arcade',
                children: [
                  {
                    index: true,
                    handle: handle('nav.arcade'),
                    lazy: () =>
                      import('@/features/arcade/ArcadePage').then((m) => ({
                        Component: m.ArcadePage,
                      })),
                  },
                  // Each game is its own lazy chunk.
                  {
                    path: 'shapla-breath',
                    handle: handle('games.shaplaBreath.title'),
                    lazy: () =>
                      import('@/features/arcade/shapla-breath/ShaplaBreath').then((m) => ({
                        Component: m.ShaplaBreath,
                      })),
                  },
                ],
              },
              {
                path: 'resources',
                handle: handle('nav.resources'),
                lazy: () =>
                  import('@/features/resources/ResourcesPage').then((m) => ({
                    Component: m.ResourcesPage,
                  })),
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
