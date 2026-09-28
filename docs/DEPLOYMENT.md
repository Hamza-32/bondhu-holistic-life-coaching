# Deployment guide

Bondhu deploys on the free Supabase and Vercel tiers. No paid API or credit card is required for the portfolio setup.

## 1. Prepare Supabase

1. Create a Supabase project and follow [SUPABASE_SETUP.md](./SUPABASE_SETUP.md).
2. From the repository, authenticate and apply the schema:

   ```bash
   npx supabase login
   npx supabase link --project-ref <project-ref>
   npm run db:push
   ```

3. In **Authentication → Sign In / Providers**:
   - Configure Email.
   - Enable **Allow anonymous sign-ins** for the recruiter demo.
   - Optionally enable Google after completing section 3 below.
4. Copy the project URL and publishable/anon key from **Project Settings → API**.

The browser receives only the public URL and publishable key. Never put the service-role key in a `VITE_` variable.

## 2. Import the repository into Vercel

1. Push the branch to GitHub and open [Vercel's new-project page](https://vercel.com/new).
2. Import `Hamza-32/bondhu-holistic-life-coaching`.
3. Vercel should detect **Vite**. `vercel.json` already sets:
   - Build command: `npm run build`
   - Output directory: `dist`
   - SPA fallback rewrites
   - Security and cache headers
4. Add these Production, Preview, and Development environment variables:

   | Name                     | Value                                     |
   | ------------------------ | ----------------------------------------- |
   | `VITE_SUPABASE_URL`      | `https://<project-ref>.supabase.co`       |
   | `VITE_SUPABASE_ANON_KEY` | Supabase publishable/anon key             |
   | `VITE_SITE_URL`          | Production origin, with no trailing slash |

5. Deploy. Record the assigned production URL, update `VITE_SITE_URL` if needed, and redeploy so canonical, Open Graph, robots, and sitemap URLs are correct.

## 3. Configure production auth URLs

In Supabase **Authentication → URL Configuration**:

- Set **Site URL** to the Vercel production origin.
- Add redirect URLs for both production and local development:
  - `https://<production-domain>/auth/callback`
  - `https://<production-domain>/reset-password`
  - `http://localhost:3000/auth/callback`
  - `http://localhost:3000/reset-password`

For Google OAuth:

1. Create a Web application OAuth client in Google Cloud.
2. Add the production origin and `http://localhost:3000` as authorised JavaScript origins.
3. Add `https://<project-ref>.supabase.co/auth/v1/callback` as the authorised redirect URI.
4. Paste the Google client ID and secret into Supabase's Google provider settings.

## 4. Enable monitoring

In the Vercel project dashboard, enable **Web Analytics** and **Speed Insights**. The app already mounts `@vercel/analytics` and `@vercel/speed-insights` after initial paint; no extra source change is needed.

## 5. Configure scheduled maintenance

In **GitHub → Settings → Secrets and variables → Actions**, add:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

The service-role key is intentionally limited to the encrypted GitHub secret. `.github/workflows/supabase-maintenance.yml` uses it every three days to call `purge_demo_accounts()`, which also keeps the free database active.

Run the workflow manually once and confirm it is green.

## 6. Production verification

1. Open the landing page, sign-up, sign-in, password reset, public help, and privacy routes directly (not only through client navigation).
2. Click **Try demo** and confirm the dashboard receives sample data.
3. Complete the main flow: onboarding, mood entry, journal entry, booking, community post, and one arcade game.
4. Verify English/Bangla, light/dark mode, mobile navigation, installability, and offline reload.
5. Confirm response headers in the browser Network panel and verify no secrets appear in the built JavaScript.
6. Check Vercel Web Analytics and Speed Insights after live traffic arrives.

## Rollback

- **Frontend:** use Vercel Deployments → select the last known-good deployment → **Promote to Production**.
- **Database:** migrations are forward-only. Fix a bad migration with a new migration; do not edit or delete one already applied to production.
