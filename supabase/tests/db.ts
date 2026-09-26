/**
 * Test harness: runs the real migrations and seed in PGlite (Postgres compiled to WASM), so the
 * schema, RLS policies, grants, triggers and functions can be tested without Docker or a hosted
 * project. The seed files run too. A minimal stand-in for Supabase's `auth` schema and API roles is created first.
 */
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';

const ROOT = path.resolve(import.meta.dirname, '..');

/** Minimal replica of what Supabase provides before our migrations run. */
const SUPABASE_STUB = `
  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin bypassrls;
  grant usage on schema public to anon, authenticated, service_role;

  create schema auth;
  create table auth.users (
    id uuid primary key default gen_random_uuid(),
    email text,
    raw_user_meta_data jsonb default '{}'::jsonb
  );
  -- Same resolution order as Supabase's auth.uid().
  create function auth.uid() returns uuid language sql stable as $$
    select coalesce(
      nullif(current_setting('request.jwt.claim.sub', true), ''),
      (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
    )::uuid
  $$;
  grant usage on schema auth to anon, authenticated, service_role;
  grant execute on function auth.uid() to anon, authenticated, service_role;
`;

export type Db = PGlite;

export async function createDb(): Promise<Db> {
  const db = new PGlite();
  await db.exec(SUPABASE_STUB);

  const migrationsDir = path.join(ROOT, 'migrations');
  for (const file of readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort()) {
    try {
      await db.exec(readFileSync(path.join(migrationsDir, file), 'utf8'));
    } catch (error) {
      throw new Error(`Migration ${file} failed: ${(error as Error).message}`);
    }
  }
  const seedDir = path.join(ROOT, 'seed');
  for (const file of readdirSync(seedDir)
    .filter((f) => f.endsWith('.sql'))
    .sort()) {
    try {
      await db.exec(readFileSync(path.join(seedDir, file), 'utf8'));
    } catch (error) {
      throw new Error(`Seed ${file} failed: ${(error as Error).message}`);
    }
  }
  return db;
}

/** Create an auth user (the signup trigger creates the profile). Returns the user id. */
export async function signUp(
  db: Db,
  email: string,
  meta: Record<string, unknown> = {},
): Promise<string> {
  const { rows } = await db.query<{ id: string }>(
    'insert into auth.users (email, raw_user_meta_data) values ($1, $2) returning id',
    [email, JSON.stringify(meta)],
  );
  const id = rows[0]?.id;
  if (!id) throw new Error('signUp failed');
  return id;
}

/** Run queries as a signed-in user (role `authenticated` with a JWT `sub`), like PostgREST does. */
export async function asUser<T>(db: Db, userId: string, fn: () => Promise<T>): Promise<T> {
  await db.exec(`set role authenticated`);
  await db.query(`select set_config('request.jwt.claim.sub', $1, false)`, [userId]);
  try {
    return await fn();
  } finally {
    await db.exec(`reset role; select set_config('request.jwt.claim.sub', '', false);`);
  }
}

/** Run queries as the anonymous (signed-out) API role. */
export async function asAnon<T>(db: Db, fn: () => Promise<T>): Promise<T> {
  await db.exec(`set role anon; select set_config('request.jwt.claim.sub', '', false);`);
  try {
    return await fn();
  } finally {
    await db.exec(`reset role`);
  }
}

export async function one<T>(db: Db, sql: string, params: unknown[] = []): Promise<T> {
  const { rows } = await db.query<T>(sql, params);
  const row = rows[0];
  if (row === undefined) throw new Error(`Expected a row from: ${sql}`);
  return row;
}

/** Normalise a rejection into an Error (for `promise.catch(toError)` in tests). */
export function toError(e: unknown): Error {
  return e instanceof Error ? e : new Error(String(e));
}

/** The error message of a caught result, or "" when the operation succeeded. */
export function errMsg(result: unknown): string {
  return result instanceof Error ? result.message : '';
}
