-- alias_display is always set by the set_author_fields() trigger. A default lets clients insert
-- posts and comments without supplying it (they are not allowed to write it anyway).
alter table public.posts alter column alias_display set default '';
alter table public.comments alter column alias_display set default '';
