-- Content (public reference data) and personal tools (quiz results, resumes).
-- Reference rows are seeded only from verified sources; see docs/DATA_SOURCES.md.

create table public.resources (
  id uuid primary key default gen_random_uuid(),
  title_en text not null,
  title_bn text,
  category text not null check (category in ('mental_health', 'career', 'academic', 'lifestyle', 'crisis')),
  url text not null check (url ~ '^https://'),
  source_org text not null,
  language text not null check (language in ('en', 'bn', 'both')),
  is_verified boolean not null default false,
  verified_at date,
  created_at timestamptz not null default now()
);

create table public.helplines (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  number text not null check (number ~ '^[0-9+ -]{3,20}$'),
  description_en text not null,
  description_bn text not null,
  hours text not null,
  category text not null check (category in ('emergency', 'emotional_support', 'women_children', 'child', 'information', 'health')),
  is_toll_free boolean,
  source_url text not null check (source_url ~ '^https://'),
  verified_at date not null,
  sort_order smallint not null default 0
);

-- Real, recognised mental-health organisations and services (not individual practitioners).
-- Individuals are never listed: we cannot verify their current licence or get their consent.
create table public.support_organizations (
  id uuid primary key default gen_random_uuid(),
  name_en text not null,
  name_bn text,
  kind text not null check (kind in ('government', 'hospital', 'university', 'ngo', 'helpline', 'professional_body')),
  services text[] not null default '{}',
  description_en text,
  description_bn text,
  division_slug text references public.divisions (slug),
  city text,
  address text,
  phone text,
  website text check (website is null or website ~ '^https?://'),
  is_free boolean,
  source_url text not null check (source_url ~ '^https?://'),
  verified_at date not null
);

create table public.career_paths (
  id uuid primary key default gen_random_uuid(),
  title_en text not null,
  title_bn text not null,
  sector text not null,
  description_en text not null,
  description_bn text not null,
  skills text[] not null default '{}',
  typical_entry_route_en text not null,
  typical_entry_route_bn text not null
);

create table public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('cultural', 'academic')),
  title_en text not null,
  title_bn text not null,
  starts_on date not null,
  ends_on date,
  is_approximate boolean not null default false,
  source_url text,
  check (ends_on is null or ends_on >= starts_on)
);

create table public.quiz_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  result_career_ids uuid[] not null default '{}',
  answers jsonb not null check (jsonb_typeof(answers) in ('object', 'array')),
  created_at timestamptz not null default now()
);
create index quiz_results_user_idx on public.quiz_results (user_id, created_at desc);

create table public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  data jsonb not null default '{}' check (jsonb_typeof(data) = 'object' and pg_column_size(data) < 100000),
  template text not null default 'classic' check (template in ('classic', 'modern', 'compact')),
  updated_at timestamptz not null default now()
);
create index resumes_user_idx on public.resumes (user_id);

create trigger resumes_set_updated_at
  before update on public.resumes
  for each row execute function private.set_updated_at();

alter table public.resources enable row level security;
alter table public.helplines enable row level security;
alter table public.support_organizations enable row level security;
alter table public.career_paths enable row level security;
alter table public.calendar_events enable row level security;
alter table public.quiz_results enable row level security;
alter table public.resumes enable row level security;

create policy "Verified resources are public" on public.resources
  for select to anon, authenticated using (is_verified);
create policy "Helplines are public" on public.helplines
  for select to anon, authenticated using (true);
create policy "Support organizations are public" on public.support_organizations
  for select to anon, authenticated using (true);
create policy "Career paths are public" on public.career_paths
  for select to anon, authenticated using (true);
create policy "Calendar is public" on public.calendar_events
  for select to anon, authenticated using (true);

create policy "Owner can read quiz results" on public.quiz_results
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Owner can save quiz results" on public.quiz_results
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Owner can delete quiz results" on public.quiz_results
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy "Owner can read resumes" on public.resumes
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Owner can create resumes" on public.resumes
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Owner can edit resumes" on public.resumes
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Owner can delete resumes" on public.resumes
  for delete to authenticated using ((select auth.uid()) = user_id);

grant select on public.resources, public.helplines, public.support_organizations,
  public.career_paths, public.calendar_events to anon, authenticated;
grant select, delete on public.quiz_results, public.resumes to authenticated;
grant insert (result_career_ids, answers) on public.quiz_results to authenticated;
grant insert (data, template), update (data, template) on public.resumes to authenticated;
