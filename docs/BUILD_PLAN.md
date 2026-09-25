# Bondhu: Master Build Plan (for Claude Code)

> **How to use this file:** Save it in the repo as `docs/BUILD_PLAN.md`. Then tell Claude:
> *"Read docs/BUILD_PLAN.md fully. Execute Phase 0 only, then stop and report."*
> Continue one phase at a time. Do NOT run everything in one go.

---

## 0. Your Role and Ground Rules

You are a senior full-stack engineer and product designer. You are upgrading **Bondhu**, an existing React 19 + TypeScript + Vite + Zustand wellness and coaching MVP for young people in Bangladesh, into a **production-grade, portfolio-ready** application.

**Non-negotiable rules:**

1. **100% free tier.** Every service, library, and API must have a free tier that covers a portfolio project. No paid APIs, no credit-card-required trials. If something needs payment, stop and propose a free alternative.
2. **Work in phases.** Complete one phase, verify it, commit, and report. Never start the next phase without being told.
3. **Verify every phase:** `npm run build`, `npm run lint`, `npm run typecheck` and `npm run test` must all pass before you report the phase done.
4. **Inspect before changing.** Read the existing code before modifying it. Preserve working features. Ask before deleting files or making destructive changes.
5. **Small, conventional commits.** Use `feat:`, `fix:`, `refactor:`, `chore:`, `test:`, `docs:`.
6. **Never commit secrets.** Only the Supabase URL and publishable/anon key go in the frontend. The service-role key is never used in client code.
7. **Real data must be real.** Every factual Bangladeshi data point (statistics, helplines, institutions) must come from a verifiable source, listed in `docs/DATA_SOURCES.md` with the URL and the date checked. If you cannot verify something, mark it `// TODO: VERIFY` and list it in your report. Never invent statistics or phone numbers.
8. **People must be fictional.** Mentors, community posts, and testimonials use fictional personas with generated avatars (DiceBear). Never use real people's names or photos.
9. **Ask when unsure.** If a requirement is ambiguous, ask one clear question instead of guessing.

---

## 1. Tech Stack (all free tier)

| Layer | Choice | Notes |
|---|---|---|
| Framework | React 19 + TypeScript (strict) + Vite | Keep existing |
| Routing | React Router v7 | Replace single-page section switching with real routes and lazy loading |
| Styling | Tailwind CSS v4 + shadcn/ui (Radix) | Design tokens via CSS variables |
| Animation | Framer Motion (`motion`) | Respect `prefers-reduced-motion` |
| Icons | lucide-react | |
| Client state | Zustand | Only UI/local state (theme, game state) |
| Server state | TanStack Query v5 | All Supabase reads/writes |
| Forms | React Hook Form + Zod | Shared Zod schemas |
| Backend | Supabase free tier | Auth, Postgres, Row Level Security, Storage |
| Auth | Supabase Auth | Email/password + Google OAuth + magic link |
| Charts | Recharts | Mood and progress charts |
| i18n | react-i18next | English + Bangla (বাংলা) with a toggle |
| Games | HTML Canvas / SVG + Framer Motion | No paid game engines |
| PWA | vite-plugin-pwa | Installable, offline shell |
| Testing | Vitest + React Testing Library + Playwright | Unit, component, E2E |
| Quality | ESLint (flat config) + Prettier + Husky + lint-staged | |
| CI | GitHub Actions | Lint, typecheck, test, build on every PR |
| Hosting | Vercel Hobby | Preview deploy per PR |
| Monitoring | Vercel Analytics + Speed Insights (free), Sentry free tier (optional) | |
| Avatars | DiceBear (open source) | Fictional personas |
| Fonts | Google Fonts: "Inter" + "Hind Siliguri" (Bangla) | Self-host via `@fontsource` |

**Free-tier constraints to design around:**
- Supabase free projects **pause after 7 days of inactivity.** Add a GitHub Actions cron job that pings the database every 3 days.
- Supabase's built-in email has a low hourly rate limit. That is fine for a portfolio. Document it in the README.
- Vercel Hobby is for non-commercial use. Fine for a portfolio.

---

## 2. Target Architecture

```
src/
  app/            # router, providers, layouts, error boundaries
  features/       # feature-sliced: each has components/, hooks/, api/, schemas/, types/
    auth/
    onboarding/
    dashboard/
    mood/
    journal/
    coaching/
    community/
    arcade/        # one folder per game
    toolkit/       # career quiz, resume builder
    resources/
    crisis/        # help banner, helplines
  components/ui/  # shadcn primitives
  components/     # shared composed components
  lib/            # supabase client, query client, utils, i18n
  locales/        # en.json, bn.json
  styles/
  test/
supabase/
  migrations/     # SQL migrations (versioned)
  seed.sql        # real reference data + fictional personas
docs/
  BUILD_PLAN.md
  DATA_SOURCES.md
  ARCHITECTURE.md
  adr/            # architecture decision records
e2e/              # Playwright tests
```

---

## 3. Database Schema (Supabase Postgres)

Write this as migrations in `supabase/migrations/`. **Enable Row Level Security on every table.** Write policies so that users only read and write their own private data.

- `profiles`: id (FK auth.users), display_name, anonymous_alias, avatar_seed, division, university_id (nullable), locale ('en' | 'bn'), xp, level, current_streak, longest_streak, last_active_date, onboarding_done, created_at
- `mood_entries`: id, user_id, score (1–5), emotion_tags text[], note, created_at. **Private.**
- `journal_entries`: id, user_id, title, body, prompt_id, mood_score, created_at, updated_at. **Strictly private. No one else can read these, ever.**
- `journal_prompts`: id, text_en, text_bn, category
- `mentors`: id, name (fictional), avatar_seed, expertise[], languages[], bio_en, bio_bn, division, rating, is_active
- `mentor_slots`: id, mentor_id, starts_at, ends_at, is_booked
- `bookings`: id, user_id, mentor_id, slot_id, status ('upcoming' | 'completed' | 'cancelled'), notes, created_at. Prevent double booking with a unique constraint plus a transaction/RPC.
- `posts`: id, user_id, alias_display, body, tags[], is_anonymous, like_count, comment_count, is_hidden, created_at
- `comments`: id, post_id, user_id, alias_display, body, created_at
- `post_likes`: post_id, user_id (composite PK)
- `reports`: id, reporter_id, post_id/comment_id, reason, created_at (content moderation)
- `quests`: id, code, title_en, title_bn, xp_reward, type ('daily' | 'weekly')
- `user_quests`: user_id, quest_id, date, completed_at
- `game_scores`: id, user_id, game_code, score, duration_seconds, created_at
- `resources`: id, title_en, title_bn, category, url, source_org, language, is_verified
- `helplines`: id, name, number, description_en, description_bn, hours, category, source_url, verified_at
- `universities`: id, name_en, name_bn, type ('public' | 'private'), division, city, website
- `divisions` / `districts`: official 8 divisions and 64 districts, with Bangla names
- `career_paths`: id, title_en, title_bn, sector, description, skills[], typical_entry_route
- `quiz_results`: id, user_id, result_career_ids[], answers jsonb, created_at
- `resumes`: id, user_id, data jsonb, template, updated_at

**Database logic** (Postgres functions/triggers, not client code):
- `award_xp(user_id, amount, reason)` updates XP and level.
- The streak update runs on the first qualifying activity each day, computed in **Asia/Dhaka** timezone.
- A trigger keeps `like_count` and `comment_count` in sync.
- Trigger: auto-create a `profiles` row on signup.
- Generate TypeScript types with `supabase gen types typescript` and commit them to `src/lib/database.types.ts`.

---

## 4. Real Bangladeshi Data (seed.sql)

"Real data" means **real reference data**. Personal data is always fictional. Seed the following and log every source in `docs/DATA_SOURCES.md`:

1. **Geography:** all 8 divisions and 64 districts with English and Bangla names (source: Bangladesh government portal / BBS).
2. **Universities:** at least 30 real universities, public and private (source: University Grants Commission of Bangladesh, ugc.gov.bd).
3. **Mental health context stats** for the Resources/About page, e.g. findings from the **National Mental Health Survey of Bangladesh 2018–19** (NIMH & WHO). Quote the exact figures from the primary source, with a citation.
4. **Helplines:** these must be verified from official sources before shipping. Candidates to verify:
   - 999: National Emergency Service
   - 109: National Helpline Centre for Violence Against Women and Children
   - 1098: Child Helpline
   - 333: National Information Service / Call Centre
   - Kaan Pete Roi: emotional support helpline (verify the current number and hours on their official site)
   - Moner Bondhu and other recognised mental-health organisations (verify details)
5. **Careers:** Bangladesh-relevant paths with realistic entry routes. Examples: BCS civil service, banking (probationary officer), RMG/textiles, IT/ITES and freelancing, NGO/development sector, pharmaceuticals, telecom, teaching, entrepreneurship.
6. **Cultural calendar:** Pohela Boishakh (14 April), International Mother Language Day / Ekushey (21 February), Independence Day (26 March), Victory Day (16 December), and the Eid dates for the current year. Verify the Eid dates, since they follow the lunar calendar.
7. **Academic stress calendar:** approximate SSC/HSC exam and university admission test seasons, used to trigger "exam stress" content and quests.
8. **Resources:** real, freely accessible links (government, WHO Bangladesh, recognised NGOs, free learning platforms like 10 Minute School, Bangla-language content where available).
9. **Fictional content:** 12 mentors with Bangladeshi names that are clearly fictional, spread across divisions, with Bangla/English bios; 40 community seed posts about realistic student and young-professional topics (exam pressure, family expectations, job hunting, Dhaka traffic, hostel life); and 20 journal prompts in both languages.

---

## 5. Interactive Games (Arcade)

Build each game as an isolated, lazy-loaded module under `features/arcade/<game>/`. All games need: keyboard + touch + mouse support; pause/resume; a sound toggle (off by default); reduced-motion variants; scores saved to `game_scores`; XP awarded on completion; a local personal-best display; and a per-game leaderboard (display aliases only).

1. **Shapla Breath:** guided breathing (box breathing 4-4-4-4 and 4-7-8). A shapla (water lily) blooms on inhale and closes on exhale. Session timer and haptics via `navigator.vibrate` where supported.
2. **Rickshaw Memory Match:** a card-matching game using original SVG illustrations inspired by Bangladeshi rickshaw art (rickshaw, shapla, hilsa, boat, tiger, jackfruit, kite, and so on). Three difficulty levels, a move counter, and a timer.
3. **Nouka Drift:** a calm endless canvas game. Steer a wooden boat down a river, collect floating lanterns, and avoid gentle obstacles. Slow pace, no fail-stress. Parallax background that shifts through day, sunset, and night.
4. **Shobdo (শব্দ) Word Puzzle:** a Wordle-style daily word game with English and Bangla modes (Bangla uses a curated list of short common words and a Bangla on-screen keyboard). Shareable emoji result grid.
5. **Kantha Canvas:** a relaxing pattern-drawing toy inspired by Nakshi Kantha embroidery. Radial symmetry drawing, color palettes, and export as PNG.
6. **Bubble Pop Calm:** a satisfying bubble-wrap popping game with a gentle stats counter. The quick-stress-relief option.

Every illustration must be **original SVG** made by you. No copyrighted images.

---

## 6. UI/UX: Modern, Industry-Grade

- **Design system first.** Define tokens (color, spacing, radius, shadow, typography) in CSS variables. Build the palette around a softened Bangladesh green (#006A4E family) as primary, a warm coral accent inspired by the flag red, and calm neutrals. Full **light and dark mode**.
- **Typography:** Inter for English, Hind Siliguri for Bangla. Line-height tuned for Bangla script.
- **Layout:** responsive, mobile-first. A sidebar on desktop, a bottom tab bar on mobile, and a command palette (⌘K) for navigation.
- **Polish:** skeleton loaders (no spinners on content), optimistic updates (likes, quests), toasts (sonner), empty states with illustrations, subtle page transitions, and micro-interactions on XP gain and streaks (confetti on level-up, respecting reduced motion).
- **Accessibility:** WCAG 2.2 AA. Semantic HTML, focus rings, keyboard navigation everywhere, aria labels, color contrast checks, and alt text. Run `@axe-core/playwright` in E2E tests.
- **Performance targets:** Lighthouse ≥ 90 on Performance, Accessibility, Best Practices, and SEO. Route-level code splitting, image optimisation, and font subsetting.
- **SEO/social:** meta tags, Open Graph image, favicon set, `robots.txt`, `sitemap.xml`.
- **Landing page:** a public marketing page at `/` (hero, features, how it works, stats with sources, FAQ, footer). The app lives behind auth at `/app/*`.
- **Demo mode:** a "Try demo" button that signs into a seeded demo account, so recruiters can explore without signing up.

---

## 7. Safety and Ethics (required for a mental-wellness app)

- A persistent, accessible **"Need help now?"** button that opens the verified helplines.
- **Crisis keyword detection** (client-side, English + Bangla + Banglish keyword lists) in journal and community posts. On a match, show a gentle support card with helplines. Never block or shame the user.
- A clear **disclaimer:** Bondhu is not a medical service and does not replace professional care.
- **Community moderation:** a report button, auto-hiding posts after N reports, basic profanity filtering, and anonymous aliases by default.
- **Privacy:** journal and mood data are private under RLS. Provide a privacy policy page, **data export** (JSON download), and **account deletion** that removes all user data.
- No dark patterns: streaks encourage but never guilt ("Welcome back!" rather than "You lost your streak").

---

## 8. Phases

### Phase 0: Audit and Plan
- Read the whole codebase. Produce `docs/ARCHITECTURE.md` describing the current state.
- Run `npm audit` and fix vulnerabilities (prefer upgrades over `--force`; explain any that remain).
- Output a migration plan mapping the old Zustand mock data to the new Supabase tables.
- **Stop and report.**

### Phase 1: Foundation
- TypeScript strict mode, ESLint + Prettier, Husky + lint-staged, path aliases (`@/`).
- Tailwind v4 + shadcn/ui setup, design tokens, light/dark theme, fonts.
- React Router with lazy routes, layouts, 404 page, and error boundaries.
- i18n setup with en/bn and a language toggle.
- Vitest + RTL setup with one sample test.
- Scripts: `dev`, `build`, `preview`, `lint`, `typecheck`, `test`, `test:e2e`, `format`.

### Phase 2: Supabase and Auth
- Supabase client, env validation with Zod (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`), `.env.example`.
- Migrations, RLS policies, database functions, and triggers from Section 3.
- Auth: sign up, sign in, Google OAuth, magic link, password reset, protected routes, session persistence.
- Onboarding flow: name, anonymous alias, division, university (optional), language, goals.
- Generated database types.

### Phase 3: Real Data Seeding
- `seed.sql` with all data from Section 4.
- `docs/DATA_SOURCES.md` listing every source, URL, and date checked.
- A report listing everything marked `TODO: VERIFY`.

### Phase 4: Core Features on Real Backend
- Migrate Dashboard, Mood, Journal, Coaching (with slot booking and no double-booking), Community (posts, comments, likes, reports, realtime updates via Supabase Realtime), Toolkit (career quiz with Bangladesh careers; resume builder with PDF export using a free client-side library), and Resources.
- Everything goes through TanStack Query hooks. Remove the mock data.
- XP, streaks, and quests are computed by the database functions.
- Mood trend charts (7 / 30 / 90 days).

### Phase 5: Arcade
- Build the six games from Section 5, one commit per game.
- Leaderboards and XP integration.

### Phase 6: Safety, Privacy and Polish
- Everything in Section 7.
- Landing page, demo mode, command palette, animations, empty states, PWA.
- Accessibility and Lighthouse pass. Report the scores.

### Phase 7: Testing and CI
- Unit tests for utilities, Zod schemas, XP/streak logic, and crisis keyword detection.
- Component tests for key flows.
- Playwright E2E: sign up → onboarding → log mood → write journal → book session → post in community → play a game. Include axe accessibility checks.
- GitHub Actions: lint, typecheck, unit tests, and build on every PR; E2E on main.
- A GitHub Actions cron job that keeps Supabase awake (ping every 3 days).
- Target ≥ 70% coverage on `features/*/api` and `lib`.

### Phase 8: Deploy to Vercel
- `vercel.json` with SPA rewrites (`{ "source": "/(.*)", "destination": "/index.html" }`) and security headers (CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy).
- Write step-by-step instructions in `docs/DEPLOYMENT.md`:
  1. Create a Supabase project (free), run the migrations and seed.
  2. Configure the Google OAuth provider and redirect URLs (localhost + the Vercel domain).
  3. Import the GitHub repo into Vercel and set the environment variables.
  4. Set the Supabase Auth Site URL to the Vercel production URL.
- Enable Vercel Analytics and Speed Insights.

### Phase 9: Portfolio Packaging
- A professional `README.md`: live demo link + demo button, screenshots/GIFs (light and dark mode, mobile and desktop), feature list, tech stack badges, an architecture diagram (Mermaid), database ERD (Mermaid), Lighthouse scores, a "Key engineering decisions" section, a data sources section, local setup instructions, and a roadmap.
- ADRs in `docs/adr/` (for example: why Supabase, why feature-sliced structure, why TanStack Query + Zustand).
- `CONTRIBUTING.md`, `LICENSE` (MIT), issue and PR templates.

---

## 9. Definition of Done (each phase)

- [ ] Build, lint, typecheck, and tests all pass
- [ ] No TypeScript `any` without a justification comment
- [ ] No console errors in the browser
- [ ] Works on a mobile viewport (375px) and on desktop
- [ ] Works in light and dark mode, in English and Bangla
- [ ] Committed with conventional commits
- [ ] Short report: what changed, what's left, and any `TODO: VERIFY` items

**Begin with Phase 0 now. Do not proceed beyond it until I confirm.**
