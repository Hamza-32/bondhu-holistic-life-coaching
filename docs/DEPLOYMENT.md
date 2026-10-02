# Deployment guide

[Live portfolio deployment](https://bondhu-life-coaching.vercel.app) · [GitHub repository](https://github.com/Hamza-32/bondhu-holistic-life-coaching)

Bondhu uses Supabase for its backend and Vercel for the frontend. The current portfolio setup uses free-tier hosting and does not call a paid AI API. Hosting quotas, availability, and email-provider requirements still apply; review your providers' current limits before a wider launch.

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
4. Copy the project URL and publishable/anon key from **Connect** or the project's **API Keys** settings.

The browser receives only the public URL and publishable key. Never put the service-role key in a `VITE_` variable.

## 2. Import the repository into Vercel

1. Push the branch to GitHub and open [Vercel's new-project page](https://vercel.com/new).
2. Import `Hamza-32/bondhu-holistic-life-coaching`.
3. Vercel should detect **Vite**. `vercel.json` already sets:
   - Build command: `npm run build`
   - Output directory: `dist`
   - SPA fallback rewrites
   - Security and cache headers
   - Keep the root directory at the repository root. Select Node.js **24.x** in the project settings; local development and CI also support Node 22.16+.
4. Add these Production, Preview, and Development environment variables:

   | Name                     | Value                                     |
   | ------------------------ | ----------------------------------------- |
   | `VITE_SUPABASE_URL`      | `https://<project-ref>.supabase.co`       |
   | `VITE_SUPABASE_ANON_KEY` | Supabase publishable/anon key             |
   | `VITE_SITE_URL`          | Production origin, with no trailing slash |

5. Choose **Config**, not **Secret**, for these browser-visible `VITE_` values. Use the actual variable names above; the app reads `VITE_SUPABASE_ANON_KEY` even when its value is a modern publishable key. Never add a Google client secret or a Supabase service-role key here.
6. Deploy. Record the assigned production URL, update `VITE_SITE_URL` if needed, and rebuild/redeploy so canonical, Open Graph, robots, and sitemap URLs are correct. Vite embeds these values at build time; editing a variable does not change an existing bundle.

For the existing `bondhu-life-coaching` project, connect `Hamza-32/bondhu-holistic-life-coaching`, set the production branch to `main`, and use `https://bondhu-life-coaching.vercel.app` as the production site URL. Future pushes to `main` can deploy through the Git integration; you do not need another Vercel project.

## 3. Configure production auth URLs

In Supabase **Authentication → URL Configuration**:

- Set **Site URL** to the Vercel production origin.
- Add redirect URLs for both production and local development:
  - `https://<production-domain>/auth/callback`
  - `https://<production-domain>/reset-password`
  - `http://localhost:3000/auth/callback`
  - `http://localhost:3000/reset-password`

If testing local redirects with additional paths, use the local-only allow-list entry `http://localhost:3000/**`. Keep production entries specific. See [Supabase's redirect URL guide](https://supabase.com/docs/guides/auth/redirect-urls) for matching rules and separately scoped Vercel preview patterns. Do not allow every `*.vercel.app` project.

For Google OAuth:

1. Create a Web application OAuth client in Google Cloud.
2. Add the production origin and `http://localhost:3000` as authorised JavaScript origins.
3. Add `https://<project-ref>.supabase.co/auth/v1/callback` as the authorised redirect URI.
4. Paste the Google client ID and secret into Supabase's Google provider settings.
5. Enable the Google provider and save. If the Google consent app is in Testing, verify its Audience/test-user configuration; before public use, confirm the publishing and verification requirements for your requested scopes. Do not add unnecessary Google API scopes.

Google's redirect URI is the **Supabase callback**, not the Vercel `/auth/callback` page. Supabase then redirects back to the allowed app callback. Keep the client secret only in the provider settings, never in the frontend or GitHub repository.

## Before opening to public users

- Configure a custom SMTP provider and test sign-up confirmation, magic links, and password reset with a non-team email address. Supabase's default mail service is for development/testing and restricts recipients; see [the official SMTP guide](https://supabase.com/docs/guides/auth/auth-smtp).
- Test Google login with an account outside the project owner's account and confirm the intended consent-screen audience.
- Review anonymous signup rate limits, CAPTCHA/abuse protection, community moderation, and database permissions for the expected traffic.
- Configure and manually verify expired-demo cleanup below. Demo expiry is not automatic merely because the UI describes two-day retention.
- Decide backup, restore, monitoring, incident-contact, and privacy-retention procedures. Practise recovery in a separate project.
- Keep dated Bangladesh safety/reference sources reviewed. Do not launch unverified phone numbers or present fictional mentor bookings as real care.

These are operational tasks, not evidence of a current defect. A working portfolio walkthrough does not establish production readiness for sensitive real-user data.

## 4. Enable monitoring

In the Vercel project dashboard, enable **Web Analytics** and **Speed Insights**. The app already mounts `@vercel/analytics` and `@vercel/speed-insights` after initial paint; no extra source change is needed.

## 5. Configure scheduled maintenance

In **GitHub → Settings → Secrets and variables → Actions**, add:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

The service-role key is intentionally limited to the encrypted GitHub secret. `.github/workflows/supabase-maintenance.yml` periodically calls `purge_demo_accounts()` to remove demo accounts older than two days. Cleanup happens when the job runs, not exactly at the two-day boundary. This is optional operator configuration, and it does not guarantee free-tier availability.

Run the workflow manually once and confirm it is green.

## 6. Production verification

1. Open the landing page, sign-up, sign-in, password reset, public help, and privacy routes directly (not only through client navigation).
2. Click **Try demo** and confirm the dashboard receives sample data.
3. Complete the main flow: onboarding, mood entry, journal entry, booking, community post, and one arcade game.
4. Verify English/Bangla, light/dark mode, mobile navigation, installability, and offline reload.
5. Confirm response headers in the browser Network panel and verify no secrets appear in the built JavaScript.
6. Check Vercel Web Analytics and Speed Insights after live traffic arrives.

## Rollback

- **Frontend:** use Vercel's **Instant Rollback** to a previous known-good production deployment. Confirm the public domain afterwards. Environment-variable changes require a rebuild; rollback alone does not rebuild code.
- **Database:** migrations are forward-only. Fix a bad migration with a new migration; do not edit or delete one already applied to production.
