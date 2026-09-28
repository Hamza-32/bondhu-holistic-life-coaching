# Contributing to Bondhu

Thank you for helping improve Bondhu. Because this project handles private wellness data and Bangladesh-specific safety information, accuracy and privacy are part of correctness.

## Local setup

1. Install Node.js 22 and npm.
2. Run `npm ci`.
3. Copy `.env.example` to `.env.local` and add a Supabase URL and publishable key. See [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md).
4. Run `npm run dev`.

Use a branch such as `feat/short-description` or `fix/short-description`. Commit messages follow Conventional Commits (`feat:`, `fix:`, `test:`, `docs:`, `refactor:`, `chore:`).

## Required checks

Before opening a pull request, run:

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test:coverage
npm run test:db
npm run build
npm run test:e2e
```

The feature API/shared-library coverage gate is 70% for statements, branches, functions, and lines. New behaviour should have a focused unit, database, component, or browser test.

## Safety and data rules

- Never commit service-role keys, database passwords, user exports, or real personal data.
- Journal and mood data must remain owner-only under Row Level Security.
- Do not weaken the persistent crisis-help path or replace supportive language with guilt-based engagement.
- Bangladesh facts, institutions, dates, and phone numbers require a fetched, traceable source in `docs/DATA_SOURCES.md` with the check date. Prefer official/primary sources.
- If a number or claim cannot be verified, do not seed or display it. Mark it `TODO: VERIFY` in the data-source report.
- Mentors, testimonials, and community seed authors are fictional. Do not add a real person's identity or photo without explicit documented permission.

## Database changes

- Add a new timestamped SQL file under `supabase/migrations/`; never rewrite a migration already applied to a shared environment.
- Enable RLS on every public table and add explicit grants/policies.
- Put privileged helpers in the non-exposed `private` schema. Security-definer functions must set an empty `search_path` and fully qualify objects.
- Add PGlite coverage under `supabase/tests/` and regenerate `src/lib/database.types.ts` when the public schema changes.

## Pull requests

Keep pull requests scoped and explain the user-visible result, safety/privacy impact, tests run, and any data sources added. Screenshots are encouraged for visual changes. Do not include generated coverage or Playwright report directories.
