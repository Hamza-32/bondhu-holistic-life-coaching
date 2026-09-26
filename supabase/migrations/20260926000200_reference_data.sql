-- Reference data: geography and universities. Public, read-only for clients.
-- Rows are seeded from verified sources (see docs/DATA_SOURCES.md and supabase/seed.sql).

create table public.divisions (
  slug text primary key check (slug ~ '^[a-z]+$'),
  name_en text not null unique,
  name_bn text not null unique,
  sort_order smallint not null default 0
);

create table public.districts (
  slug text primary key check (slug ~ '^[a-z-]+$'),
  division_slug text not null references public.divisions (slug),
  name_en text not null,
  name_bn text not null,
  unique (division_slug, name_en)
);
create index districts_division_idx on public.districts (division_slug);

create table public.universities (
  id uuid primary key default gen_random_uuid(),
  name_en text not null unique,
  name_bn text,
  type text not null check (type in ('public', 'private')),
  division_slug text references public.divisions (slug),
  city text,
  website text check (website is null or website ~ '^https?://'),
  source_url text
);
create index universities_division_idx on public.universities (division_slug);

alter table public.divisions enable row level security;
alter table public.districts enable row level security;
alter table public.universities enable row level security;

create policy "Reference data is public" on public.divisions for select to anon, authenticated using (true);
create policy "Reference data is public" on public.districts for select to anon, authenticated using (true);
create policy "Reference data is public" on public.universities for select to anon, authenticated using (true);

grant select on public.divisions, public.districts, public.universities to anon, authenticated;
