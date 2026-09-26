-- Gamification: XP, levels, streaks and quests, computed only by the database.
--
-- Clients never write XP, level or streak columns. Instead, triggers on real activity
-- (mood check-in, journal entry, post, comment, game session, booking) call
-- private.record_activity(), which:
--   1. updates the streak on the first qualifying activity of the day (Asia/Dhaka),
--   2. awards XP for the activity, subject to a per-day cap so it cannot be farmed,
--   3. auto-completes matching quests.
-- Streaks never punish: missing a day restarts at 1 ("welcome back"), with no penalty.

create table public.quests (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[a-z0-9_]+$'),
  title_en text not null,
  title_bn text not null,
  xp_reward integer not null check (xp_reward between 1 and 1000),
  type text not null check (type in ('daily', 'weekly')),
  -- 'auto': completed by a matching activity; 'manual': the user marks it done.
  completion text not null default 'manual' check (completion in ('auto', 'manual')),
  is_active boolean not null default true,
  sort_order smallint not null default 0
);

create table public.user_quests (
  user_id uuid not null references public.profiles (id) on delete cascade,
  quest_id uuid not null references public.quests (id) on delete cascade,
  -- Start of the quest period: the day (daily) or the Saturday of the week (weekly), Asia/Dhaka.
  date date not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, quest_id, date)
);

create table public.game_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  game_code text not null check (game_code in
    ('shapla_breath', 'rickshaw_memory', 'nouka_drift', 'shobdo', 'kantha_canvas', 'bubble_pop')),
  score integer not null check (score between 0 and 1000000),
  duration_seconds integer not null check (duration_seconds between 0 and 86400),
  created_at timestamptz not null default now()
);
create index game_scores_user_idx on public.game_scores (user_id, created_at desc);
create index game_scores_game_idx on public.game_scores (game_code, score desc);

-- Audit log of every XP change (also used for per-day caps).
create table public.xp_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  amount integer not null,
  reason text not null,
  created_at timestamptz not null default now()
);
create index xp_events_user_created_idx on public.xp_events (user_id, created_at desc);

alter table public.quests enable row level security;
alter table public.user_quests enable row level security;
alter table public.game_scores enable row level security;
alter table public.xp_events enable row level security;

create policy "Quests are public" on public.quests
  for select to anon, authenticated using (is_active);
create policy "Users can read their quest progress" on public.user_quests
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can read their game scores" on public.game_scores
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can record game scores" on public.game_scores
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can read their XP history" on public.xp_events
  for select to authenticated using ((select auth.uid()) = user_id);

grant select on public.quests to anon, authenticated;
grant select on public.user_quests, public.game_scores, public.xp_events to authenticated;
grant insert (game_code, score, duration_seconds) on public.game_scores to authenticated;

-- ---------------------------------------------------------------------------------------------
-- Core functions (private: not callable by clients)
-- ---------------------------------------------------------------------------------------------

create or replace function private.level_for_xp(p_xp integer)
returns integer
language sql
immutable
set search_path = ''
as $$
  select greatest(floor(greatest(p_xp, 0) / 500.0)::int + 1, 1);
$$;

-- Adds XP, recalculates level and logs the event.
create or replace function private.award_xp(p_user_id uuid, p_amount integer, p_reason text)
returns table (xp integer, level integer, leveled_up boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_old_level integer;
begin
  if p_amount = 0 then
    return query select p.xp, p.level, false from public.profiles p where p.id = p_user_id;
    return;
  end if;

  select p.level into v_old_level from public.profiles p where p.id = p_user_id for update;
  if not found then
    return;
  end if;

  insert into public.xp_events (user_id, amount, reason) values (p_user_id, p_amount, p_reason);

  return query
    update public.profiles p
       set xp = greatest(p.xp + p_amount, 0),
           level = private.level_for_xp(greatest(p.xp + p_amount, 0))
     where p.id = p_user_id
    returning p.xp, p.level, p.level > v_old_level;
end;
$$;

-- Updates the streak for today (Asia/Dhaka). Returns true on the first activity of the day.
create or replace function private.touch_streak(p_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_today date := private.dhaka_today();
  v_last date;
begin
  select last_active_date into v_last from public.profiles where id = p_user_id for update;
  if not found or v_last = v_today then
    return false;
  end if;

  update public.profiles
     set current_streak = case when v_last = v_today - 1 then current_streak + 1 else 1 end,
         longest_streak = greatest(longest_streak,
                                   case when v_last = v_today - 1 then current_streak + 1 else 1 end),
         last_active_date = v_today
   where id = p_user_id;
  return true;
end;
$$;

-- How many times XP was awarded today (Asia/Dhaka) for a reason.
create or replace function private.awards_today(p_user_id uuid, p_reason text)
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select count(*)::int
  from public.xp_events e
  where e.user_id = p_user_id
    and e.reason = p_reason
    and (e.created_at at time zone 'Asia/Dhaka')::date = private.dhaka_today();
$$;

-- Marks a quest complete for the current period and awards its XP (once per period).
create or replace function private.complete_quest_for(p_user_id uuid, p_code text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_quest public.quests;
  v_period date;
  v_inserted integer;
begin
  select * into v_quest from public.quests where code = p_code and is_active;
  if not found then
    return false;
  end if;

  v_period := case when v_quest.type = 'weekly' then private.dhaka_week_start() else private.dhaka_today() end;

  insert into public.user_quests (user_id, quest_id, date)
  values (p_user_id, v_quest.id, v_period)
  on conflict do nothing;
  get diagnostics v_inserted = row_count;

  if v_inserted = 0 then
    return false;
  end if;

  perform private.award_xp(p_user_id, v_quest.xp_reward, 'quest:' || v_quest.code);
  return true;
end;
$$;

-- XP per activity and how many times per day it counts.
create or replace function private.activity_rule(p_kind text, out xp integer, out daily_cap integer)
language sql
immutable
set search_path = ''
as $$
  select r.xp, r.cap
  from (values
    ('mood', 10, 3),
    ('journal', 30, 2),
    ('post', 20, 3),
    ('comment', 5, 10),
    ('game', 15, 5),
    ('booking', 50, 1),
    ('daily_checkin', 10, 1)
  ) as r(kind, xp, cap)
  where r.kind = p_kind;
$$;

create or replace function private.record_activity(p_user_id uuid, p_kind text, p_detail text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_rule record;
  v_reason text := 'activity:' || p_kind;
begin
  if private.touch_streak(p_user_id) then
    perform private.award_xp(p_user_id, (private.activity_rule('daily_checkin')).xp, 'activity:daily_checkin');
  end if;

  v_rule := private.activity_rule(p_kind);
  if v_rule.xp is not null and private.awards_today(p_user_id, v_reason) < v_rule.daily_cap then
    perform private.award_xp(p_user_id, v_rule.xp, v_reason);
  end if;

  -- Auto-completing quests (missing quest codes are ignored).
  if p_kind = 'mood' then
    perform private.complete_quest_for(p_user_id, 'morning_checkin');
  elsif p_kind = 'journal' then
    perform private.complete_quest_for(p_user_id, 'write_journal');
  elsif p_kind = 'game' and p_detail = 'shapla_breath' then
    perform private.complete_quest_for(p_user_id, 'breathing_478');
  elsif p_kind = 'post' or p_kind = 'comment' then
    perform private.complete_quest_for(p_user_id, 'community_support');
  end if;
end;
$$;

-- One trigger function for every activity table.
create or replace function private.on_activity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
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

create trigger mood_entries_activity after insert on public.mood_entries
  for each row execute function private.on_activity();
create trigger journal_entries_activity after insert on public.journal_entries
  for each row execute function private.on_activity();
create trigger posts_activity after insert on public.posts
  for each row execute function private.on_activity();
create trigger comments_activity after insert on public.comments
  for each row execute function private.on_activity();
create trigger game_scores_activity after insert on public.game_scores
  for each row execute function private.on_activity();
create trigger bookings_activity after insert on public.bookings
  for each row execute function private.on_activity();

-- ---------------------------------------------------------------------------------------------
-- Client API
-- ---------------------------------------------------------------------------------------------

-- Complete a manual quest (e.g. "read an article"). Auto quests are rejected.
create or replace function public.complete_quest(p_code text)
returns table (completed boolean, xp integer, level integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_done boolean;
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;
  if not exists (select 1 from public.quests q where q.code = p_code and q.is_active and q.completion = 'manual') then
    raise exception 'quest_not_found' using errcode = 'P0002';
  end if;

  v_done := private.complete_quest_for(v_uid, p_code);
  return query select v_done, p.xp, p.level from public.profiles p where p.id = v_uid;
end;
$$;

-- Today's quests (or this week's) with completion state for the caller.
create or replace function public.get_my_quests()
returns table (
  id uuid,
  code text,
  title_en text,
  title_bn text,
  xp_reward integer,
  type text,
  completion text,
  completed boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select q.id, q.code, q.title_en, q.title_bn, q.xp_reward, q.type, q.completion,
         exists (
           select 1 from public.user_quests uq
           where uq.user_id = auth.uid()
             and uq.quest_id = q.id
             and uq.date = case when q.type = 'weekly' then private.dhaka_week_start() else private.dhaka_today() end
         )
  from public.quests q
  where auth.uid() is not null and q.is_active
  order by q.type, q.sort_order, q.code;
$$;

revoke execute on function public.complete_quest(text) from public, anon;
revoke execute on function public.get_my_quests() from public, anon;
grant execute on function public.complete_quest(text) to authenticated;
grant execute on function public.get_my_quests() to authenticated;
