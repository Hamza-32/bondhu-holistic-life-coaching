-- Phase 6: safety and privacy.
--  * Basic profanity filter on community posts and comments (enforced in the database).
--  * Data export (one JSON document) and account deletion that removes every user row.
--  * Demo mode: an anonymous Supabase user gets a private sandbox filled with sample data.

-- ---------------------------------------------------------------------------------------------
-- Profanity filter
-- ---------------------------------------------------------------------------------------------
-- Whole-word matching on lower-cased tokens, so innocent words that merely contain a bad word
-- are not blocked. The list is deliberately short: moderation (reports, auto-hide) does the rest.
create or replace function private.has_blocked_language(p_text text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select exists (
    select 1
    from regexp_split_to_table(lower(coalesce(p_text, '')), '[^a-z0-9ঀ-৿]+') as t(token)
    where token = any (array[
        -- English profanity and slurs
        'shit', 'shits', 'bullshit', 'bitch', 'bitches', 'bastard', 'asshole', 'cunt', 'dickhead',
        'slut', 'whore', 'nigger', 'nigga', 'faggot', 'retard',
        -- Banglish
        'magi', 'khanki', 'chudi', 'choda', 'chodna', 'bokachoda', 'madarchod', 'bhenchod',
        'khankir', 'chuda',
        -- Bangla
        'মাগি', 'মাগী', 'খানকি', 'খানকির', 'চোদা', 'চুদি', 'বোকাচোদা', 'মাদারচোদ', 'চুদা'
      ])
      or token like 'fuck%'
      or token like 'motherfuck%'
  )
$$;

create or replace function private.guard_community_text()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if private.has_blocked_language(new.body) then
    raise exception 'blocked_language' using errcode = 'P0001',
      hint = 'Please rephrase without offensive words.';
  end if;
  -- Demo sandboxes can read the community but not publish to real people.
  if exists (select 1 from public.profiles p where p.id = new.user_id and p.is_demo) then
    raise exception 'demo_read_only' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------------------------
-- Demo flag
-- ---------------------------------------------------------------------------------------------
-- Readable by the owner (table-level select grant) but not client-writable (no update grant).
alter table public.profiles add column is_demo boolean not null default false;

create trigger posts_guard_text
  before insert or update of body on public.posts
  for each row execute function private.guard_community_text();
create trigger comments_guard_text
  before insert or update of body on public.comments
  for each row execute function private.guard_community_text();

-- ---------------------------------------------------------------------------------------------
-- Data export
-- ---------------------------------------------------------------------------------------------
create or replace function public.export_my_data()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;

  return jsonb_build_object(
    'exported_at', now(),
    'format', 'bondhu-export-v1',
    'profile', (select to_jsonb(p) from public.profiles p where p.id = v_uid),
    'mood_entries', (select coalesce(jsonb_agg(to_jsonb(m) - 'user_id' order by m.created_at), '[]')
                     from public.mood_entries m where m.user_id = v_uid),
    'journal_entries', (select coalesce(jsonb_agg(to_jsonb(j) - 'user_id' order by j.created_at), '[]')
                        from public.journal_entries j where j.user_id = v_uid),
    'bookings', (select coalesce(jsonb_agg(jsonb_build_object(
                    'id', b.id, 'mentor', m.name, 'starts_at', s.starts_at, 'status', b.status,
                    'notes', b.notes, 'created_at', b.created_at) order by s.starts_at), '[]')
                 from public.bookings b
                 join public.mentors m on m.id = b.mentor_id
                 join public.mentor_slots s on s.id = b.slot_id
                 where b.user_id = v_uid),
    'posts', (select coalesce(jsonb_agg(to_jsonb(p) - 'user_id' order by p.created_at), '[]')
              from public.posts p where p.user_id = v_uid),
    'comments', (select coalesce(jsonb_agg(to_jsonb(c) - 'user_id' order by c.created_at), '[]')
                 from public.comments c where c.user_id = v_uid),
    'liked_post_ids', (select coalesce(jsonb_agg(l.post_id), '[]')
                       from public.post_likes l where l.user_id = v_uid),
    'reports', (select coalesce(jsonb_agg(to_jsonb(r) - 'reporter_id' order by r.created_at), '[]')
                from public.reports r where r.reporter_id = v_uid),
    'quiz_results', (select coalesce(jsonb_agg(to_jsonb(q) - 'user_id' order by q.created_at), '[]')
                     from public.quiz_results q where q.user_id = v_uid),
    'resumes', (select coalesce(jsonb_agg(to_jsonb(r) - 'user_id'), '[]')
                from public.resumes r where r.user_id = v_uid),
    'quests_completed', (select coalesce(jsonb_agg(to_jsonb(uq) - 'user_id'), '[]')
                         from public.user_quests uq where uq.user_id = v_uid),
    'game_scores', (select coalesce(jsonb_agg(to_jsonb(g) - 'user_id' order by g.created_at), '[]')
                    from public.game_scores g where g.user_id = v_uid),
    'xp_events', (select coalesce(jsonb_agg(to_jsonb(x) - 'user_id' order by x.created_at), '[]')
                  from public.xp_events x where x.user_id = v_uid)
  );
end;
$$;

revoke execute on function public.export_my_data() from public, anon;
grant execute on function public.export_my_data() to authenticated;

-- ---------------------------------------------------------------------------------------------
-- Account deletion
-- ---------------------------------------------------------------------------------------------
-- Deleting the auth user cascades to the profile and from there to every table that references
-- it. Demo mentor slots held by the user's active bookings are released first.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;

  update public.mentor_slots s set is_booked = false
  from public.bookings b
  where b.slot_id = s.id and b.user_id = v_uid and b.status <> 'cancelled';

  delete from auth.users where id = v_uid;
end;
$$;

revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- ---------------------------------------------------------------------------------------------
-- Demo mode
-- ---------------------------------------------------------------------------------------------
-- Fill the caller's (anonymous) account with a realistic month of sample activity.
create or replace function public.start_demo()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_day integer;
  v_prompt uuid;
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;
  if not coalesce((select u.is_anonymous from auth.users u where u.id = v_uid), false) then
    raise exception 'demo_requires_anonymous_user' using errcode = '42501';
  end if;
  if (select p.is_demo from public.profiles p where p.id = v_uid) then
    return; -- already set up
  end if;

  update public.profiles
     set display_name = 'Guest',
         is_demo = true,
         onboarding_done = true,
         division = 'dhaka',
         goals = array['stress', 'career'],
         xp = 740,
         level = 2,
         current_streak = 4,
         longest_streak = 9,
         last_active_date = (now() at time zone 'Asia/Dhaka')::date - 1
   where id = v_uid;

  -- 30 days of moods with a gentle upward trend and a couple of harder days.
  for v_day in 1..30 loop
    if v_day % 7 <> 3 then
      insert into public.mood_entries (user_id, score, emotion_tags, note, created_at)
      values (
        v_uid,
        least(5, greatest(1, 2 + (30 - v_day) / 10 + (v_day % 3 = 0)::int - (v_day % 11 = 0)::int)),
        case v_day % 4
          when 0 then array['calm', 'grateful']
          when 1 then array['tired']
          when 2 then array['hopeful', 'motivated']
          else array['anxious']
        end,
        case when v_day = 2 then 'Presentation went better than expected.' end,
        now() - make_interval(days => v_day, hours => 9)
      );
    end if;
  end loop;

  select id into v_prompt from public.journal_prompts order by id limit 1;
  insert into public.journal_entries (user_id, title, body, prompt_id, mood_score, created_at, updated_at)
  values
    (v_uid, 'A calmer week',
     'Box breathing before class actually helped. I want to keep the evening walks going.',
     v_prompt, 4, now() - interval '2 days', now() - interval '2 days'),
    (v_uid, 'Exam stress',
     'Too many deadlines at once. Wrote down the three that matter most and started with the smallest.',
     null, 2, now() - interval '9 days', now() - interval '9 days'),
    (v_uid, 'Grateful for',
     'My roommate cooked khichuri when I was sick. Small things matter.',
     null, 4, now() - interval '16 days', now() - interval '16 days');

  insert into public.game_scores (user_id, game_code, score, duration_seconds, created_at)
  values
    (v_uid, 'shapla_breath', 180, 180, now() - interval '1 day'),
    (v_uid, 'rickshaw_memory', 420, 64, now() - interval '3 days'),
    (v_uid, 'nouka_drift', 23, 90, now() - interval '5 days');
end;
$$;

revoke execute on function public.start_demo() from public, anon;
grant execute on function public.start_demo() to authenticated;

-- Remove demo sandboxes older than the given age (called by the scheduled keep-alive job with
-- the service role; see docs). Their bookings release their slots first.
create or replace function public.purge_demo_accounts(p_older_than interval default interval '2 days')
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  update public.mentor_slots s set is_booked = false
  from public.bookings b
  join public.profiles p on p.id = b.user_id
  where b.slot_id = s.id and b.status <> 'cancelled' and p.is_demo and p.created_at < now() - p_older_than;

  with gone as (
    delete from auth.users u
    using public.profiles p
    where p.id = u.id and p.is_demo and p.created_at < now() - p_older_than
    returning u.id
  )
  select count(*) into v_count from gone;
  return v_count;
end;
$$;

revoke execute on function public.purge_demo_accounts(interval) from public, anon, authenticated;
grant execute on function public.purge_demo_accounts(interval) to service_role;
