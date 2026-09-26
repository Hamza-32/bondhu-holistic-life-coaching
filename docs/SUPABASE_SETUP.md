# Connecting Supabase (no Docker needed)

This guide connects your local copy of Bondhu to a free hosted Supabase project. It uses the Supabase CLI through `npx` (installed as a dev dependency), so there is nothing to install globally and no Docker.

Time needed: about 10 minutes.

---

## 1. Create the project

In the Supabase dashboard, create a new project:

| Setting                         | Value                                                              |
| ------------------------------- | ------------------------------------------------------------------ |
| Name                            | `Bondhu`                                                           |
| Database password               | **Generate** one and save it in a password manager                 |
| Region                          | The closest to Bangladesh, e.g. Mumbai (`ap-south-1`) or Singapore |
| Enable Data API                 | ✅ on                                                              |
| Automatically expose new tables | ❌ off. The migrations grant access table by table.                |
| Enable automatic RLS            | ✅ on (a safety net; every migration enables RLS anyway)           |

## 2. Add the keys to `.env.local`

1. Open **Project Settings → API** (or **Connect**).
2. Copy `.env.example` to `.env.local`.
3. Fill in:
   - `VITE_SUPABASE_URL`: the Project URL, e.g. `https://abcd1234.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: the **publishable** key (`sb_publishable_…`) or the legacy `anon` key

Never copy the `service_role` / `sb_secret_…` key into any `VITE_` variable. The app refuses to start with a secret key, but it is best never to paste it anywhere.

`.env.local` is gitignored. You can delete the old `GEMINI_API_KEY` line from it; nothing uses it.

## 3. Apply the database schema

Run these in the project folder:

```bash
npx supabase login                               # opens the browser once to authorise the CLI
npx supabase link --project-ref <your-project-ref>   # the ref is the "abcd1234" part of the URL; asks for the DB password
npm run db:push                                  # applies supabase/migrations and supabase/seed/*.sql
npm run db:types                                 # optional: regenerate src/lib/database.types.ts from the live schema
```

`npm run db:push` is safe to re-run: applied migrations are skipped and the seed is idempotent.

**Check it worked:** in **Table Editor** you should see 26 tables. Row counts to expect: `divisions` 8, `districts` 64, `universities` 44, `helplines` 8, `practitioners` 20, `mentors` 12, `posts` 40, `journal_prompts` 20.

## 4. Configure Auth

**Authentication → URL Configuration**

- **Site URL:** `http://localhost:3000` (change this to the Vercel URL in Phase 8)
- **Redirect URLs:** add
  - `http://localhost:3000/auth/callback`
  - `http://localhost:3000/reset-password`

**Authentication → Sign In / Providers → Email**

Supabase's built-in email service is best-effort. It **only delivers to your project team's email addresses** and is limited to **2 emails per hour** ([Supabase docs](https://supabase.com/docs/guides/auth/auth-smtp), checked 2026-09-26). So:

- **For development and the portfolio demo:** turn **Confirm email** off, so email and password sign-ups can sign in immediately.
- **Magic links and password reset** also need email. They work for your own (team) address. For everyone else, add a free custom SMTP provider under **Authentication → Emails → SMTP settings** (for example Resend or Brevo, both of which have free plans). This is part of the Phase 8 deployment checklist.

**Password rules:** under **Authentication → Sign In / Providers → Email**, set the minimum length to 8 and require letters and digits, to match the app's validation.

## 5. (Optional) Google sign-in

The app works without this. The Google button shows a friendly "not set up yet" message until it is configured.

1. Open [Google Cloud Console](https://console.cloud.google.com/). Create a project, then configure the **OAuth consent screen** (External, app name "Bondhu").
2. Go to **Credentials → Create credentials → OAuth client ID → Web application**.
   - **Authorised JavaScript origins:** `http://localhost:3000`
   - **Authorised redirect URIs:** `https://<your-project-ref>.supabase.co/auth/v1/callback`
3. In Supabase, open **Authentication → Sign In / Providers → Google**. Enable it and paste the client ID and client secret.

## 6. Run it

```bash
npm run dev
```

Open <http://localhost:3000>, click **Get started**, create an account, and complete onboarding. You should land on the dashboard with your name in the sidebar.

---

## Keeping the free project awake

Free Supabase projects pause after a period of inactivity. Phase 7 adds a GitHub Actions job that pings the project every 3 days. Until then, open the app occasionally, or restore the project from the dashboard if it pauses.

## Testing the database without Supabase

`npm run test:db` runs every migration in [PGlite](https://pglite.dev) (Postgres compiled to WebAssembly) and checks the RLS policies, grants, triggers and functions: privacy, double-booking prevention, XP caps, streaks and moderation. No Docker or network is needed.
