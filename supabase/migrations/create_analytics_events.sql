-- Cria eventos publicos de analytics sem dados pessoais sensiveis.
-- Execute manualmente no Supabase SQL Editor com uma conta administradora.

create extension if not exists pgcrypto;

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  event_source text,
  page_path text,
  locale text,
  product_id uuid null,
  product_name text null,
  referrer text null,
  utm_source text null,
  utm_medium text null,
  utm_campaign text null,
  device_type text null,
  visitor_id text null,
  created_at timestamptz default now(),
  constraint analytics_events_event_name_check
    check (event_name in ('page_view', 'whatsapp_click', 'catalog_download', 'lead_submit', 'test_event')),
  constraint analytics_events_event_source_check
    check (
      event_source is null
      or event_source in ('header', 'hero', 'product', 'catalog', 'cta', 'contact', 'footer', 'floating_button', 'page', 'lead_form', 'test')
    ),
  constraint analytics_events_locale_check
    check (locale is null or locale in ('pt', 'zh')),
  constraint analytics_events_device_type_check
    check (device_type is null or device_type in ('mobile', 'tablet', 'desktop'))
);

alter table public.analytics_events
  add column if not exists visitor_id text;

alter table public.analytics_events
  drop constraint if exists analytics_events_event_name_check,
  add constraint analytics_events_event_name_check
    check (event_name in ('page_view', 'whatsapp_click', 'catalog_download', 'lead_submit', 'test_event'));

alter table public.analytics_events
  drop constraint if exists analytics_events_event_source_check,
  add constraint analytics_events_event_source_check
    check (
      event_source is null
      or event_source in ('header', 'hero', 'product', 'catalog', 'cta', 'contact', 'footer', 'floating_button', 'page', 'lead_form', 'test')
    );

create index if not exists analytics_events_event_name_idx
on public.analytics_events (event_name);

create index if not exists analytics_events_created_at_idx
on public.analytics_events (created_at desc);

create index if not exists analytics_events_event_source_idx
on public.analytics_events (event_source);

alter table public.analytics_events enable row level security;

drop policy if exists "Public can create whatsapp analytics events" on public.analytics_events;
drop policy if exists "Public can create analytics events" on public.analytics_events;
create policy "Public can create analytics events"
on public.analytics_events
for insert
to public
with check (
  event_name in ('page_view', 'whatsapp_click', 'catalog_download', 'lead_submit', 'test_event')
  and (
    event_source is null
    or event_source in ('header', 'hero', 'product', 'catalog', 'cta', 'contact', 'footer', 'floating_button', 'page', 'lead_form', 'test')
  )
  and (locale is null or locale in ('pt', 'zh'))
  and (device_type is null or device_type in ('mobile', 'tablet', 'desktop'))
);

drop policy if exists "Authenticated users can read analytics events" on public.analytics_events;
create policy "Authenticated users can read analytics events"
on public.analytics_events
for select
to authenticated
using (true);
