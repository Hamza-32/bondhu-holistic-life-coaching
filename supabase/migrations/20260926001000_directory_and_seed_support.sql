-- Phase 3: public practitioner directory, plus what the seed needs.
--
-- Practitioner directory (build plan rule 8, amended 2026-09-26):
--   Real mental-health professionals who publicly offer appointments. Only details they publish
--   on official pages; no photos; each row has a source and verification date. The app links to
--   the professional's OWN booking page: Bondhu never books them and is not affiliated.

create table public.practitioners (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  title text not null,
  profession text not null check (profession in
    ('clinical_psychologist', 'counselling_psychologist', 'psychiatrist', 'counsellor')),
  credentials text,
  organization text not null,
  specialties text[] not null default '{}' check (cardinality(specialties) <= 8),
  languages text[] not null default '{}' check (languages <@ array['en', 'bn']::text[]),
  division_slug text references public.divisions (slug),
  city text,
  modes text[] not null default '{}' check (modes <@ array['in_person', 'online']::text[]),
  -- External, official pages only (https).
  booking_url text not null check (booking_url ~ '^https://'),
  profile_url text check (profile_url is null or profile_url ~ '^https://'),
  source_url text not null check (source_url ~ '^https://'),
  verified_at date not null,
  is_active boolean not null default true,
  unique (full_name, organization)
);
create index practitioners_division_idx on public.practitioners (division_slug) where is_active;

alter table public.practitioners enable row level security;
create policy "Active practitioner listings are public" on public.practitioners
  for select to anon, authenticated using (is_active);
grant select on public.practitioners to anon, authenticated;

-- ---------------------------------------------------------------------------------------------
-- Seeded community posts ("community voices"): fictional, with no author account.
-- ---------------------------------------------------------------------------------------------

alter table public.posts alter column user_id drop not null;
alter table public.comments alter column user_id drop not null;

-- Clients always post as themselves. Only trusted contexts (migrations/seed, service role),
-- where no API role is set, may insert rows with explicit author fields.
create or replace function private.set_author_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  p public.profiles;
begin
  if auth.uid() is null then
    if coalesce(current_setting('role', true), 'none') in ('anon', 'authenticated') then
      raise exception 'not_authenticated' using errcode = '28000';
    end if;
    return new; -- trusted seed/admin insert: keep provided values
  end if;

  new.user_id := auth.uid();
  select * into p from public.profiles where id = new.user_id;
  if not found then
    raise exception 'profile_not_found' using errcode = 'P0002';
  end if;
  new.alias_display := case when new.is_anonymous then p.anonymous_alias else p.display_name end;
  new.report_count := 0;
  new.is_hidden := false;
  if tg_table_name = 'posts' then
    new.like_count := 0;
    new.comment_count := 0;
  end if;
  return new;
end;
$$;

-- Activity from authorless seed rows must not touch XP or quests.
create or replace function private.on_activity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.user_id is null then
    return null;
  end if;
  perform private.record_activity(
    new.user_id,
    case tg_table_name
      when 'mood_entries' then 'mood'
      when 'journal_entries' then 'journal'
      when 'posts' then 'post'
      when 'comments' then 'comment'
      when 'game_scores' then 'game'
      when 'bookings' then 'booking'
    end,
    -- to_jsonb: NEW has no game_code column on the other tables, so it can't be referenced directly.
    to_jsonb(new) ->> 'game_code'
  );
  return null;
end;
$$;

-- ---------------------------------------------------------------------------------------------
-- Demo mentor availability: keeps ~3 weeks of future slots for the fictional mentors.
-- Each mentor gets two evening slots (Asia/Dhaka) on three weekdays derived from their id.
-- ---------------------------------------------------------------------------------------------

create or replace function private.ensure_mentor_slots(p_days integer default 21)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_inserted integer;
begin
  insert into public.mentor_slots (mentor_id, starts_at, ends_at)
  select m.id,
         (d::date + t.slot_time) at time zone 'Asia/Dhaka',
         (d::date + t.slot_time + interval '45 minutes') at time zone 'Asia/Dhaka'
  from public.mentors m
  cross join generate_series(private.dhaka_today() + 1, private.dhaka_today() + p_days, interval '1 day') as d
  cross join (values (time '16:00'), (time '19:30')) as t(slot_time)
  where m.is_active
    -- Three available weekdays per mentor, spread by a stable hash of the mentor id.
    and (extract(dow from d)::int + abs(hashtext(m.id::text))) % 7 in (0, 2, 4)
  on conflict (mentor_id, starts_at) do nothing;
  get diagnostics v_inserted = row_count;
  return v_inserted;
end;
$$;

-- Callable by the server-side keep-alive job (service role only), never by browsers.
create or replace function public.refresh_mentor_slots(p_days integer default 21)
returns integer
language sql
security definer
set search_path = ''
as $$
  select private.ensure_mentor_slots(p_days);
$$;
revoke execute on function public.refresh_mentor_slots(integer) from public, anon, authenticated;
grant execute on function public.refresh_mentor_slots(integer) to service_role;
grant all on public.practitioners to service_role;

-- Seed posts have no author: make is_mine false (not NULL) for them.
create or replace function public.get_feed(
  p_limit integer default 20,
  p_before timestamptz default null,
  p_tag text default null
)
returns table (
  id uuid,
  alias_display text,
  body text,
  tags text[],
  is_anonymous boolean,
  like_count integer,
  comment_count integer,
  created_at timestamptz,
  is_mine boolean,
  liked_by_me boolean,
  is_hidden boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    p.id, p.alias_display, p.body, p.tags, p.is_anonymous, p.like_count, p.comment_count,
    p.created_at,
    coalesce(p.user_id = auth.uid(), false) as is_mine,
    exists (select 1 from public.post_likes l where l.post_id = p.id and l.user_id = auth.uid()) as liked_by_me,
    p.is_hidden
  from public.posts p
  where auth.uid() is not null
    and (not p.is_hidden or p.user_id = auth.uid())
    and (p_before is null or p.created_at < p_before)
    and (p_tag is null or p_tag = any (p.tags))
  order by p.created_at desc
  limit least(greatest(coalesce(p_limit, 20), 1), 50);
$$;

create or replace function public.get_comments(p_post_id uuid)
returns table (
  id uuid,
  post_id uuid,
  alias_display text,
  body text,
  created_at timestamptz,
  is_mine boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select c.id, c.post_id, c.alias_display, c.body, c.created_at, coalesce(c.user_id = auth.uid(), false)
  from public.comments c
  join public.posts p on p.id = c.post_id
  where auth.uid() is not null
    and c.post_id = p_post_id
    and (not p.is_hidden or p.user_id = auth.uid())
    and (not c.is_hidden or c.user_id = auth.uid())
  order by c.created_at
  limit 200;
$$;

-- Natural keys so the seed files are idempotent (safe to re-run with `db push --include-seed`).
alter table public.mentors add constraint mentors_name_key unique (name);
alter table public.journal_prompts add constraint journal_prompts_text_en_key unique (text_en);
alter table public.resources add constraint resources_url_key unique (url);
alter table public.helplines add constraint helplines_number_key unique (number);
alter table public.support_organizations add constraint support_organizations_name_key unique (name_en);
alter table public.career_paths add constraint career_paths_title_key unique (title_en);
alter table public.calendar_events add constraint calendar_events_key unique (kind, title_en, starts_on);
create unique index posts_seed_body_key on public.posts (body) where user_id is null;
create unique index comments_seed_body_key on public.comments (post_id, body) where user_id is null;
