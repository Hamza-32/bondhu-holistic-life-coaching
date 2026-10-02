# Bondhu: project case study

[Live application](https://bondhu-life-coaching.vercel.app) · [Source](https://github.com/Hamza-32/bondhu-holistic-life-coaching) · [Screenshots](screenshots/README.md)

**Maintainer:** [Hamza-32](https://github.com/Hamza-32)

**Project type:** deployed, full-stack portfolio application

**Stack:** React 19, TypeScript, Vite, Supabase/Postgres, Vercel

## Problem and product direction

Bondhu brings everyday wellbeing and personal-growth tools into a bilingual experience for students and young professionals in Bangladesh. The product is intentionally low-pressure: private reflection, optional community participation under an alias, and short culturally inspired games. It does not diagnose conditions, provide treatment, or claim measured health outcomes.

The core journey is: enter a demo or create an account → set preferences → check in with mood → reflect in a private journal → take a breathing break. Public help stays available outside authentication.

## What was implemented

- Responsive desktop and mobile navigation, English/Bangla copy, light/dark themes, reduced-motion variants, and keyboard-accessible primitives.
- Supabase authentication, onboarding, owner-scoped mood/journal CRUD, trend aggregation using Bangladesh dates, and profile preferences.
- Alias-based community feeds with optimistic interactions, realtime new-post notifications, reports, and database moderation rules.
- Fictional mentor discovery and booking through a transaction-safe database function; real practitioner links are separate and external.
- A resume editor with autosave and client-side PDF export, a career quiz, six lazy-loaded arcade games, XP, quests, and leaderboards.
- A prerendered landing page, installable PWA shell, route splitting, metadata generation, CI checks, and a documented deployment workflow.

## Engineering decisions and trade-offs

### Put ownership rules in the database

Client route guards provide navigation, not data security. Postgres RLS, explicit grants, constraints, and privileged functions enforce ownership and write rules. Database tests exercise those rules independently of the UI. Journal and mood entries are owner-only; this is not end-to-end encryption, and operators with privileged access can still access stored data.

Read [the backend ADR](adr/0001-supabase-backend.md), `supabase/migrations/`, and `supabase/tests/`.

### Separate server state from preferences

TanStack Query handles fetching, cache invalidation, mutation states, and optimistic rollback. Zustand persists only UI preferences. Sensitive domain records do not live in a shared persisted frontend store. Auth changes clear query state to reduce accidental cross-account display.

Read [the state ADR](adr/0002-server-and-client-state.md), `src/features/auth/`, and `src/features/community/api.ts`.

### Keep the public page inexpensive to load

The landing page is rendered into HTML at build time, then hydrated. Authenticated features, charts, games, and PDF export load separately. This adds a prerender build step but keeps heavier tools off the initial public-page path.

Read [the route ADR](adr/0003-feature-sliced-routes.md), `src/app/router.tsx`, `src/prerender.tsx`, and `scripts/prerender.ts`.

### Make demonstration safe and useful

The live **Try the demo** flow creates a separate anonymous account with fictional sample activity rather than sharing one login among visitors. Expired demo accounts can be removed by a service-role-only maintenance RPC. Screenshots contain only fictional data; nobody's real journal is used as a portfolio asset.

Coaching appointments are demonstrations, not real clinical services. Community aliases are not a promise of anonymity from administrators. Offline support caches the app shell; it does not promise offline synchronisation of private writes.

## Verification and evidence

| Layer                    | What it checks                                                                  | Boundary                                                           |
| ------------------------ | ------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Vitest / Testing Library | 147 tests covering helpers, validation, hooks, forms, and interactions          | Feature API/shared-lib coverage gate, not every UI line            |
| PGlite                   | 35 tests applying the real SQL migrations and exercising policies/functions     | Not the full hosted Supabase Auth/Realtime stack                   |
| Playwright / axe-core    | 114 desktop/mobile journeys and accessibility scans                             | Intercepted API fixtures; real OAuth/email need hosted smoke tests |
| GitHub Actions           | Formatting, lint, types, tests, coverage, production build, and browser reports | See the latest workflow run, not a static claim of success         |

Tests and accessible primitives provide useful regression protection, not a security certification or a guarantee of complete accessibility. No user study, clinical validation, or production usage metric is claimed.

## Five-minute technical review

1. Use the live demo and inspect Mood, Journal, Arcade, and the Bangla mobile layout.
2. Read `src/features/mood/api.ts` alongside its SQL policy to see the UI/database boundary.
3. Compare the community optimistic mutation with the database's ownership and moderation rules.
4. Inspect `book_slot` and its database tests for booking concurrency safeguards.
5. Open the Actions runs and [deployment runbook](DEPLOYMENT.md); review the [remaining launch work](DEPLOYMENT.md#before-opening-to-public-users).

## Scope still to complete before a wider launch

Public email delivery needs custom SMTP and end-to-end verification. Google OAuth audience restrictions must suit the intended users. Monitoring, abuse prevention, demo cleanup, backup/recovery exercises, and continued source review remain operator responsibilities. The sourced resource library and Bangladesh career-path catalogue are not fully seeded yet.

The portfolio value is the implemented system and its documented reasoning. A broader launch requires operational review, not simply a green build.
