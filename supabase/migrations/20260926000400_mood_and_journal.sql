-- Mood entries and journal: strictly private to their owner, for every operation.

create table public.mood_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  score smallint not null check (score between 1 and 5),
  emotion_tags text[] not null default '{}' check (cardinality(emotion_tags) <= 10),
  note text check (note is null or char_length(note) <= 1000),
  created_at timestamptz not null default now()
);
create index mood_entries_user_created_idx on public.mood_entries (user_id, created_at desc);

create table public.journal_prompts (
  id uuid primary key default gen_random_uuid(),
  text_en text not null,
  text_bn text not null,
  category text not null check (category in ('gratitude', 'reflection', 'stress', 'goals', 'relationships', 'self_care'))
);

create table public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  title text check (title is null or char_length(title) <= 200),
  body text not null check (char_length(body) between 1 and 20000),
  prompt_id uuid references public.journal_prompts (id) on delete set null,
  mood_score smallint check (mood_score is null or mood_score between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index journal_entries_user_created_idx on public.journal_entries (user_id, created_at desc);

create trigger journal_entries_set_updated_at
  before update on public.journal_entries
  for each row execute function private.set_updated_at();

alter table public.mood_entries enable row level security;
alter table public.journal_prompts enable row level security;
alter table public.journal_entries enable row level security;

-- Mood: owner only.
create policy "Owner can read mood entries" on public.mood_entries
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Owner can add mood entries" on public.mood_entries
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Owner can edit mood entries" on public.mood_entries
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Owner can delete mood entries" on public.mood_entries
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Journal: owner only. No other role, not even other authenticated users, can ever read these.
create policy "Owner can read journal entries" on public.journal_entries
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Owner can add journal entries" on public.journal_entries
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Owner can edit journal entries" on public.journal_entries
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Owner can delete journal entries" on public.journal_entries
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Prompts: public reference content.
create policy "Prompts are public" on public.journal_prompts for select to anon, authenticated using (true);

grant select, delete on public.mood_entries, public.journal_entries to authenticated;
grant insert (score, emotion_tags, note) on public.mood_entries to authenticated;
grant update (score, emotion_tags, note) on public.mood_entries to authenticated;
grant insert (title, body, prompt_id, mood_score) on public.journal_entries to authenticated;
grant update (title, body, prompt_id, mood_score) on public.journal_entries to authenticated;
grant select on public.journal_prompts to anon, authenticated;
