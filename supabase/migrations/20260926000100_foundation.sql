-- Foundation: private schema for internal functions, shared helpers.
--
-- Conventions used across all migrations
--   * RLS is enabled on every table in `public`.
--   * Grants are explicit (the project does not auto-expose new tables to the Data API).
--   * Functions are `security invoker` unless they must bypass RLS; definer functions pin
--     `search_path = ''` and fully qualify every object.
--   * Anything clients must never call lives in the `private` schema, which is not exposed.
--   * Dates that define "a day" for streaks and quests use Asia/Dhaka.

create schema if not exists private;
revoke all on schema private from public;

-- New functions are not executable by everyone unless granted explicitly.
alter default privileges in schema public revoke execute on functions from public;
alter default privileges in schema private revoke execute on functions from public;

-- Today's date in Bangladesh (UTC+6, no DST).
create or replace function private.dhaka_today()
returns date
language sql
stable
set search_path = ''
as $$
  select (now() at time zone 'Asia/Dhaka')::date;
$$;

-- Start of the current week in Bangladesh. The Bangladeshi work week starts on Saturday.
create or replace function private.dhaka_week_start()
returns date
language sql
stable
set search_path = ''
as $$
  select private.dhaka_today() - ((extract(dow from private.dhaka_today())::int + 1) % 7);
$$;

-- Generic `updated_at` maintenance.
create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
