-- Sprint 10: CRM de Leads
-- Copie e execute este SQL no Supabase SQL Editor com uma conta administradora.

create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  email text,
  phone text,
  country text,
  city text,
  product_interest text,
  message text,
  source text default 'site_contact',
  status text default 'Novo',
  assigned_to text,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists leads_status_idx
on public.leads (status);

create index if not exists leads_country_idx
on public.leads (country);

create index if not exists leads_product_interest_idx
on public.leads (product_interest);

create index if not exists leads_created_at_idx
on public.leads (created_at desc);

create or replace function public.update_leads_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists update_leads_updated_at on public.leads;

create trigger update_leads_updated_at
before update on public.leads
for each row
execute function public.update_leads_updated_at();

alter table public.leads enable row level security;

drop policy if exists "Public can create leads" on public.leads;
create policy "Public can create leads"
on public.leads
for insert
to anon
with check (true);

drop policy if exists "Authenticated users can read leads" on public.leads;
create policy "Authenticated users can read leads"
on public.leads
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can insert leads" on public.leads;
create policy "Authenticated users can insert leads"
on public.leads
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update leads" on public.leads;
create policy "Authenticated users can update leads"
on public.leads
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can delete leads" on public.leads;
create policy "Authenticated users can delete leads"
on public.leads
for delete
to authenticated
using (true);
