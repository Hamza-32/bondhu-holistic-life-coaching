# ADR 0001: Use Supabase as the backend

- Status: Accepted
- Date: 2026-09-26

## Context

Bondhu needs authentication, relational private data, realtime community updates, scheduled maintenance, and a portfolio-friendly free tier. Wellness data also needs enforceable access control outside the browser.

## Decision

Use Supabase Auth and Postgres. Every public table has Row Level Security and explicit grants. Sensitive invariants—booking locks, XP caps, streaks, moderation counts, export, deletion, and demo lifecycle—run in database functions or triggers rather than trusting client code.

## Consequences

- Privacy rules and concurrency constraints are testable in real Postgres semantics through PGlite.
- TanStack Query can use one typed data layer generated from the schema.
- The hosted free project can pause after inactivity, so a scheduled maintenance request runs every three days.
- Deployment requires careful separation of the browser-safe publishable key and the server-only service-role key.
