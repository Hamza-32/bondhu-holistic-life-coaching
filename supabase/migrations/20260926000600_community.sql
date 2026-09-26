-- Community ("Adda"): posts, comments, likes and reports.
--
-- Anonymity is enforced by the database, not the UI:
--   * `user_id` is never readable by clients (no column grant). Reading goes through
--     get_feed() / get_comments(), which return `is_mine` / `liked_by_me` instead of ids,
--     so anonymous posts cannot be linked to each other or to a person.
--   * The displayed name (`alias_display`) is set by a trigger from the author's profile.
-- Moderation: posts and comments are hidden automatically after N distinct reports.

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  alias_display text not null,
  body text not null check (char_length(btrim(body)) between 1 and 2000),
  tags text[] not null default '{}' check (cardinality(tags) <= 5),
  is_anonymous boolean not null default true,
  like_count integer not null default 0 check (like_count >= 0),
  comment_count integer not null default 0 check (comment_count >= 0),
  report_count integer not null default 0 check (report_count >= 0),
  is_hidden boolean not null default false,
  created_at timestamptz not null default now()
);
create index posts_feed_idx on public.posts (created_at desc) where not is_hidden;
create index posts_user_idx on public.posts (user_id);
create index posts_tags_idx on public.posts using gin (tags);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  alias_display text not null,
  body text not null check (char_length(btrim(body)) between 1 and 1000),
  is_anonymous boolean not null default true,
  report_count integer not null default 0 check (report_count >= 0),
  is_hidden boolean not null default false,
  created_at timestamptz not null default now()
);
create index comments_post_idx on public.comments (post_id, created_at);

create table public.post_likes (
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);
create index post_likes_user_idx on public.post_likes (user_id);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  post_id uuid references public.posts (id) on delete cascade,
  comment_id uuid references public.comments (id) on delete cascade,
  reason text not null check (reason in ('spam', 'harassment', 'hate', 'self_harm', 'misinformation', 'other')),
  details text check (details is null or char_length(details) <= 500),
  created_at timestamptz not null default now(),
  check (num_nonnulls(post_id, comment_id) = 1),
  unique (reporter_id, post_id),
  unique (reporter_id, comment_id)
);

-- Distinct reports needed to auto-hide a post or comment.
create or replace function private.report_hide_threshold()
returns integer language sql immutable set search_path = '' as $$ select 3 $$;

-- ---------------------------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------------------------

-- Author fields come from the profile, never from the client.
create or replace function private.set_author_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  p public.profiles;
begin
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

create trigger posts_set_author before insert on public.posts
  for each row execute function private.set_author_fields();
create trigger comments_set_author before insert on public.comments
  for each row execute function private.set_author_fields();

create or replace function private.sync_like_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.posts set like_count = like_count + 1 where id = new.post_id;
  else
    update public.posts set like_count = greatest(like_count - 1, 0) where id = old.post_id;
  end if;
  return null;
end;
$$;

create trigger post_likes_sync_count after insert or delete on public.post_likes
  for each row execute function private.sync_like_count();

create or replace function private.sync_comment_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.posts set comment_count = comment_count + 1 where id = new.post_id;
  else
    update public.posts set comment_count = greatest(comment_count - 1, 0) where id = old.post_id;
  end if;
  return null;
end;
$$;

create trigger comments_sync_count after insert or delete on public.comments
  for each row execute function private.sync_comment_count();

create or replace function private.apply_report()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.post_id is not null then
    update public.posts
       set report_count = report_count + 1,
           is_hidden = is_hidden or report_count + 1 >= private.report_hide_threshold()
     where id = new.post_id;
  else
    update public.comments
       set report_count = report_count + 1,
           is_hidden = is_hidden or report_count + 1 >= private.report_hide_threshold()
     where id = new.comment_id;
  end if;
  return null;
end;
$$;

create trigger reports_apply after insert on public.reports
  for each row execute function private.apply_report();

-- ---------------------------------------------------------------------------------------------
-- Row level security and grants
-- ---------------------------------------------------------------------------------------------

-- Policies on comments/likes must check the *post*, but a plain subquery would run under the
-- caller's RLS on posts (which only shows their own rows). This definer helper answers only
-- "is this post visible?" and exposes nothing else.
create or replace function public.is_post_visible(p_post_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.posts p where p.id = p_post_id and not p.is_hidden);
$$;
revoke execute on function public.is_post_visible(uuid) from public, anon;
grant execute on function public.is_post_visible(uuid) to authenticated;

alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.post_likes enable row level security;
alter table public.reports enable row level security;

-- Base tables expose only the caller's own rows (needed for delete); reading the feed goes
-- through get_feed() / get_comments().
create policy "Authors can see their own posts" on public.posts
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Authors can create posts" on public.posts
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Authors can delete their posts" on public.posts
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy "Authors can see their own comments" on public.comments
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Members can comment on visible posts" on public.comments
  for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and public.is_post_visible(post_id)
  );
create policy "Authors can delete their comments" on public.comments
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy "Users can see their own likes" on public.post_likes
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can like visible posts" on public.post_likes
  for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and public.is_post_visible(post_id)
  );
create policy "Users can remove their likes" on public.post_likes
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy "Users can see their own reports" on public.reports
  for select to authenticated using ((select auth.uid()) = reporter_id);
create policy "Users can file reports" on public.reports
  for insert to authenticated with check ((select auth.uid()) = reporter_id);

grant select (id) on public.posts, public.comments to authenticated;
grant insert (body, tags, is_anonymous) on public.posts to authenticated;
grant insert (post_id, body, is_anonymous) on public.comments to authenticated;
grant delete on public.posts, public.comments to authenticated;
grant select (post_id, created_at), insert (post_id), delete on public.post_likes to authenticated;
grant select (id, post_id, comment_id, reason, created_at), insert (post_id, comment_id, reason, details)
  on public.reports to authenticated;

-- ---------------------------------------------------------------------------------------------
-- Read API
-- ---------------------------------------------------------------------------------------------

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
    p.user_id = auth.uid() as is_mine,
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
  select c.id, c.post_id, c.alias_display, c.body, c.created_at, c.user_id = auth.uid()
  from public.comments c
  join public.posts p on p.id = c.post_id
  where auth.uid() is not null
    and c.post_id = p_post_id
    and (not p.is_hidden or p.user_id = auth.uid())
    and (not c.is_hidden or c.user_id = auth.uid())
  order by c.created_at
  limit 200;
$$;

revoke execute on function public.get_feed(integer, timestamptz, text) from public, anon;
revoke execute on function public.get_comments(uuid) from public, anon;
grant execute on function public.get_feed(integer, timestamptz, text) to authenticated;
grant execute on function public.get_comments(uuid) to authenticated;
