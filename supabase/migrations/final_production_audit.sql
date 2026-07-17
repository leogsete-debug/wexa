-- Final production audit adjustments for Top Max.
-- Safe to run in Supabase SQL Editor with an administrator account.
-- This migration does not drop tables, delete records, or recreate existing data.

create extension if not exists pgcrypto;

alter table public.analytics_events
  add column if not exists visitor_id text;

alter table public.analytics_events
  drop constraint if exists analytics_events_event_name_check,
  drop constraint if exists analytics_events_event_source_check,
  drop constraint if exists analytics_events_locale_check,
  drop constraint if exists analytics_events_device_type_check;

create index if not exists analytics_events_event_name_idx
on public.analytics_events (event_name);

create index if not exists analytics_events_event_source_idx
on public.analytics_events (event_source);

create index if not exists analytics_events_created_at_idx
on public.analytics_events (created_at desc);

alter table public.analytics_events enable row level security;

drop policy if exists "Public can create whatsapp analytics events" on public.analytics_events;
drop policy if exists "Public can create analytics events" on public.analytics_events;
create policy "Public can create analytics events"
on public.analytics_events
for insert
to anon
with check (true);

drop policy if exists "Authenticated users can read analytics events" on public.analytics_events;
create policy "Authenticated users can read analytics events"
on public.analytics_events
for select
to authenticated
using (true);
