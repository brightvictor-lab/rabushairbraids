-- ============================================================
-- RABUS HAIR — bookings table (EmailJS approve/reschedule flow)
-- Safe to re-run: uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS.
-- ============================================================

create table if not exists public.bookings (
  id bigint generated always as identity primary key,
  reference text,
  service text,
  price numeric,
  duration_hrs numeric,
  client_name text,
  client_email text,
  client_phone text,
  booking_date date,
  booking_time text,
  status text default 'pending',            -- pending | approved | reschedule
  reschedule_date date,                     -- set when salon reschedules
  reschedule_time text,
  salon_note text,                          -- optional note from salon on reschedule
  created_at timestamptz default now()
);

-- add the newer columns if the table already existed
alter table public.bookings add column if not exists reschedule_date date;
alter table public.bookings add column if not exists reschedule_time text;
alter table public.bookings add column if not exists salon_note text;

-- Row Level Security
alter table public.bookings enable row level security;

-- allow the site (anon) to create bookings
drop policy if exists "allow booking inserts" on public.bookings;
create policy "allow booking inserts" on public.bookings
  for insert to anon, authenticated with check (true);

-- allow the approve/reschedule pages (anon) to read + update status
drop policy if exists "allow status read" on public.bookings;
create policy "allow status read" on public.bookings
  for select to anon, authenticated using (true);

drop policy if exists "allow status update" on public.bookings;
create policy "allow status update" on public.bookings
  for update to anon, authenticated using (true) with check (true);
