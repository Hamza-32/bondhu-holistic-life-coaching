# ADR 0002: Separate server state from local UI state

- Status: Accepted
- Date: 2026-09-26

## Context

The original MVP held both user data and interface state in Zustand/localStorage. That made cache invalidation, multi-device consistency, privacy, and server authorization difficult.

## Decision

Use TanStack Query for all Supabase reads, writes, cache invalidation, and optimistic updates. Keep Zustand only for harmless local preferences: theme, sound, and haptics. Do not persist journals, moods, bookings, profiles, or community data in browser storage.

## Consequences

- Remote data has explicit loading, error, mutation, and invalidation behaviour.
- Optimistic community likes can roll back safely on failure.
- Signing out or deleting an account can clear one query cache without hunting through feature stores.
- Offline support is an application shell, not an offline copy of sensitive wellness content.
