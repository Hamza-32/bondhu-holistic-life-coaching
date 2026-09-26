-- Profiles: one row per auth user, created automatically on signup.
-- Users can read and edit only their own profile, and only the "personal" columns:
-- XP, level and streak are written exclusively by database functions.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 50),
  anonymous_alias text not null unique check (char_length(anonymous_alias) between 3 and 40),
  avatar_seed text not null check (char_length(avatar_seed) between 1 and 64),
  division text references public.divisions (slug),
  university_id uuid references public.universities (id) on delete set null,
  locale text not null default 'en' check (locale in ('en', 'bn')),
  goals text[] not null default '{}' check (cardinality(goals) <= 8),
  xp integer not null default 0 check (xp >= 0),
  level integer not null default 1 check (level >= 1),
  current_streak integer not null default 0 check (current_streak >= 0),
  longest_streak integer not null default 0 check (longest_streak >= 0),
  last_active_date date,
  onboarding_done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function private.set_updated_at();

-- Friendly anonymous names built from Bangladeshi motifs, e.g. "Calm Shapla 42".
-- Keep the word lists in sync with src/features/onboarding/alias.ts.
create or replace function private.random_alias()
returns text
language sql
volatile
set search_path = ''
as $$
  select (array['Calm','Brave','Kind','Bright','Gentle','Quiet','Hopeful','Steady','Curious','Warm','Clever','Cheerful'])[1 + floor(random() * 12)::int]
    || ' '
    || (array['Shapla','Doel','Hilsa','Kadam','Nouka','River','Tiger','Kathal','Ghuri','Banyan','Mango','Borsha'])[1 + floor(random() * 12)::int]
    || ' '
    || (10 + floor(random() * 90)::int)::text;
$$;

create or replace function private.generate_unique_alias()
returns text
language plpgsql
volatile
set search_path = ''
as $$
declare
  candidate text;
begin
  for i in 1..20 loop
    candidate := private.random_alias();
    if not exists (select 1 from public.profiles where anonymous_alias = candidate) then
      return candidate;
    end if;
  end loop;
  -- Extremely unlikely fallback: widen the number space.
  return private.random_alias() || floor(random() * 1000)::int::text;
end;
$$;

-- Create the profile when a user signs up (email, magic link or OAuth).
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  name text;
  lang text;
begin
  name := coalesce(
    nullif(btrim(meta ->> 'display_name'), ''),
    nullif(btrim(meta ->> 'full_name'), ''),
    nullif(btrim(meta ->> 'name'), ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
    'Friend'
  );
  lang := case when meta ->> 'locale' in ('en', 'bn') then meta ->> 'locale' else 'en' end;

  insert into public.profiles (id, display_name, anonymous_alias, avatar_seed, locale)
  values (
    new.id,
    left(name, 50),
    private.generate_unique_alias(),
    substr(md5(new.id::text || clock_timestamp()::text), 1, 16),
    lang
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- Row level security
alter table public.profiles enable row level security;

create policy "Users can read their own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

grant select on public.profiles to authenticated;
-- Column-level: gamification columns (xp, level, streaks) are not client-writable.
grant update (display_name, anonymous_alias, avatar_seed, division, university_id, locale, goals, onboarding_done)
  on public.profiles to authenticated;
