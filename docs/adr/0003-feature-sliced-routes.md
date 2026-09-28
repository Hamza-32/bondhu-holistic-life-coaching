# ADR 0003: Feature-sliced modules and lazy routes

- Status: Accepted
- Date: 2026-09-26

## Context

Bondhu combines auth, journaling, community, coaching, career tools, resources, and six interactive games. A page-centric monolith would couple unrelated behaviour and ship too much JavaScript on first load.

## Decision

Organise product code under `src/features/<feature>` and keep shared primitives under `src/components` and `src/lib`. Every page and every arcade game is a React Router lazy route. The public landing page is prerendered and hydrated; signed-in pages render client-side.

## Consequences

- Feature APIs, schemas, components, and tests stay close together.
- Route-level failures have error boundaries and loading fallbacks.
- The landing page can paint before the authenticated application, charts, PDF engine, and games download.
- Shared abstractions require deliberate promotion into `components` or `lib` instead of cross-feature imports growing accidentally.
