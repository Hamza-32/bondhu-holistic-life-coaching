-- Per-game leaderboards that show anonymous aliases only (never names or user ids).
--
-- mode 'best'  : each player's best single score (breathing seconds, memory score, lanterns…)
-- mode 'total' : number of finished sessions (e.g. Kantha Canvas pieces made)
-- Returns the top N plus the caller's own row (flagged is_me) even if outside the top N.

create or replace function public.get_leaderboard(
  p_game_code text,
  p_mode text default 'best',
  p_limit integer default 10
)
returns table (rank integer, alias text, score integer, is_me boolean)
language sql
stable
security definer
set search_path = ''
as $$
  with per_user as (
    select g.user_id,
           case when p_mode = 'total' then count(*)::int else max(g.score) end as score
    from public.game_scores g
    where g.game_code = p_game_code
    group by g.user_id
  ),
  ranked as (
    select rank() over (order by pu.score desc)::int as rank,
           p.anonymous_alias as alias,
           pu.score,
           pu.user_id = auth.uid() as is_me
    from per_user pu
    join public.profiles p on p.id = pu.user_id
  )
  select r.rank, r.alias, r.score, r.is_me
  from ranked r
  where auth.uid() is not null
    and p_mode in ('best', 'total')
    and (r.rank <= least(greatest(coalesce(p_limit, 10), 1), 50) or r.is_me)
  order by r.rank, r.alias;
$$;

revoke execute on function public.get_leaderboard(text, text, integer) from public, anon;
grant execute on function public.get_leaderboard(text, text, integer) to authenticated;
