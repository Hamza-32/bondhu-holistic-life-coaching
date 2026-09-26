-- Coaching: fictional demo mentors, their time slots, and bookings.
-- Double booking is prevented twice: book_slot() locks the slot row inside a transaction, and a
-- partial unique index guarantees at most one non-cancelled booking per slot.

create table public.mentors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  avatar_seed text not null,
  expertise text[] not null default '{}',
  languages text[] not null default '{}' check (languages <@ array['en', 'bn']::text[]),
  bio_en text not null,
  bio_bn text not null,
  division text references public.divisions (slug),
  rating numeric(2, 1) not null default 5.0 check (rating between 0 and 5),
  is_active boolean not null default true,
  -- Every mentor in this project is a fictional persona; the UI must label them as such.
  is_fictional boolean not null default true check (is_fictional)
);

create table public.mentor_slots (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid not null references public.mentors (id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  is_booked boolean not null default false,
  check (ends_at > starts_at),
  unique (mentor_id, starts_at)
);
create index mentor_slots_mentor_starts_idx on public.mentor_slots (mentor_id, starts_at);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  mentor_id uuid not null references public.mentors (id),
  slot_id uuid not null references public.mentor_slots (id),
  status text not null default 'upcoming' check (status in ('upcoming', 'completed', 'cancelled')),
  notes text check (notes is null or char_length(notes) <= 1000),
  created_at timestamptz not null default now()
);
create unique index bookings_one_active_per_slot on public.bookings (slot_id) where status <> 'cancelled';
create index bookings_user_idx on public.bookings (user_id, created_at desc);

alter table public.mentors enable row level security;
alter table public.mentor_slots enable row level security;
alter table public.bookings enable row level security;

create policy "Active mentors are public" on public.mentors
  for select to anon, authenticated using (is_active);
create policy "Slots of active mentors are public" on public.mentor_slots
  for select to anon, authenticated
  using (exists (select 1 from public.mentors m where m.id = mentor_id and m.is_active));
create policy "Users can read their own bookings" on public.bookings
  for select to authenticated using ((select auth.uid()) = user_id);

grant select on public.mentors, public.mentor_slots to anon, authenticated;
-- Bookings are created and changed only through the functions below.
grant select on public.bookings to authenticated;

-- Maximum number of upcoming bookings a user may hold at once.
create or replace function private.max_upcoming_bookings()
returns integer language sql immutable set search_path = '' as $$ select 3 $$;

create or replace function public.book_slot(p_slot_id uuid, p_notes text default null)
returns public.bookings
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_slot public.mentor_slots;
  v_booking public.bookings;
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;
  if p_notes is not null and char_length(p_notes) > 1000 then
    raise exception 'notes_too_long' using errcode = '22001';
  end if;

  -- Lock the slot so concurrent bookings of the same slot serialize here.
  select * into v_slot from public.mentor_slots where id = p_slot_id for update;
  if not found then
    raise exception 'slot_not_found' using errcode = 'P0002';
  end if;
  if not exists (select 1 from public.mentors m where m.id = v_slot.mentor_id and m.is_active) then
    raise exception 'slot_not_found' using errcode = 'P0002';
  end if;
  if v_slot.is_booked then
    raise exception 'slot_unavailable' using errcode = 'P0001';
  end if;
  if v_slot.starts_at <= now() then
    raise exception 'slot_in_past' using errcode = 'P0001';
  end if;
  if (select count(*) from public.bookings b
      where b.user_id = v_uid and b.status = 'upcoming') >= private.max_upcoming_bookings() then
    raise exception 'too_many_bookings' using errcode = 'P0001';
  end if;

  insert into public.bookings (user_id, mentor_id, slot_id, notes)
  values (v_uid, v_slot.mentor_id, v_slot.id, nullif(btrim(p_notes), ''))
  returning * into v_booking;

  update public.mentor_slots set is_booked = true where id = v_slot.id;

  return v_booking;
end;
$$;

create or replace function public.cancel_booking(p_booking_id uuid)
returns public.bookings
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_booking public.bookings;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  update public.bookings
     set status = 'cancelled'
   where id = p_booking_id and user_id = auth.uid() and status = 'upcoming'
  returning * into v_booking;

  if not found then
    raise exception 'booking_not_found' using errcode = 'P0002';
  end if;

  update public.mentor_slots set is_booked = false where id = v_booking.slot_id;
  return v_booking;
end;
$$;

revoke execute on function public.book_slot(uuid, text) from public, anon;
revoke execute on function public.cancel_booking(uuid) from public, anon;
grant execute on function public.book_slot(uuid, text) to authenticated;
grant execute on function public.cancel_booking(uuid) to authenticated;
