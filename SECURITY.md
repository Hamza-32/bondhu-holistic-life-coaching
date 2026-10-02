# Security policy

Bondhu is a portfolio project that handles sensitive wellness information. It is not a medical service, and its tests and security controls are not a substitute for an independent security review.

## Supported version

Security fixes target the latest code on `main`. Older commits and forks do not receive separate security maintenance.

## Report a vulnerability

Use [GitHub's private vulnerability report form](https://github.com/Hamza-32/bondhu-holistic-life-coaching/security/advisories/new). Include the affected route or file, commit if known, reproduction steps using fictional accounts, expected behaviour, and potential impact.

If private reporting is unavailable, open an issue asking for a private security contact **without disclosing the vulnerability**. Never put credentials, journal text, mood notes, user exports, or exploitable details in a public issue.

The maintainer will investigate and coordinate a fix and disclosure with the reporter. This is a community-maintained project; there is no guaranteed response time or bug-bounty programme.

## Safe testing

- Use a separate Supabase project and accounts you control. Do not probe other people's data or stress-test the live demo.
- Do not run destructive database operations against the hosted project.
- Keep service-role keys, database passwords, OAuth secrets, SMTP credentials, and user exports out of source control and screenshots.
- Only public configuration belongs in `VITE_` variables. Supabase's publishable/anon key is intentionally browser-visible; RLS and database permissions enforce access.
- Journal and mood access must remain owner-only. Review policies, explicit grants, and security-definer functions together when changing the schema.

See [deployment checks](docs/DEPLOYMENT.md) and the [privacy page](https://bondhu-life-coaching.vercel.app/privacy) for operational and data-handling context.
