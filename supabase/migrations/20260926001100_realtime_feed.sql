-- Live community feed without leaking authors.
--
-- Postgres-changes subscriptions would ship whole rows (including user_id) and RLS would hide
-- other people's posts anyway. Instead, new visible posts broadcast only their id on the public
-- "community-feed" topic; clients then refetch through get_feed(), which enforces anonymity.
-- The payload carries no personal data, so a public topic is acceptable.
--
-- realtime.send() exists on Supabase; elsewhere (e.g. the PGlite test harness) this is a no-op.

create or replace function private.broadcast_new_post()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.is_hidden then
    return null;
  end if;
  if to_regprocedure('realtime.send(jsonb, text, text, boolean)') is not null then
    execute 'select realtime.send($1, $2, $3, false)'
      using jsonb_build_object('post_id', new.id), 'new_post', 'community-feed';
  end if;
  return null;
end;
$$;

create trigger posts_broadcast_new after insert on public.posts
  for each row execute function private.broadcast_new_post();
