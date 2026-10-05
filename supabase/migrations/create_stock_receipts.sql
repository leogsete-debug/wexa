-- Agente de Armazém: packing lists conferidos (contêineres a caminho / recebidos).
-- Cada registro guarda o documento extraído, a conferência matemática e o status.

create extension if not exists pgcrypto;

create table if not exists public.stock_receipts (
  id uuid primary key default gen_random_uuid(),
  invoice text not null,
  order_no text,
  container text,
  supplier text,
  origin text,
  destination text,
  document_date date,
  shipping_date date,
  arrival_forecast date,
  status text not null default 'em_transito' check (status in ('em_transito', 'recebido', 'com_divergencia')),
  items jsonb not null default '[]'::jsonb,
  totals jsonb not null default '{}'::jsonb,
  validation jsonb not null default '{}'::jsonb,
  file_url text,
  file_path text,
  notes text,
  received_at timestamp with time zone,
  created_by uuid default auth.uid(),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create unique index if not exists stock_receipts_invoice_container_idx
on public.stock_receipts (invoice, coalesce(container, ''));
create index if not exists stock_receipts_status_idx on public.stock_receipts (status);

create or replace function public.stock_receipts_touch()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  if new.status = 'recebido' and old.status is distinct from 'recebido' then
    new.received_at = coalesce(new.received_at, now());
  end if;
  return new;
end;
$$;

drop trigger if exists stock_receipts_touch on public.stock_receipts;
create trigger stock_receipts_touch
before update on public.stock_receipts
for each row
execute function public.stock_receipts_touch();

alter table public.stock_receipts enable row level security;

drop policy if exists "Authenticated users manage stock receipts" on public.stock_receipts;
create policy "Authenticated users manage stock receipts"
on public.stock_receipts
for all
to authenticated
using (true)
with check (true);

-- Planta do armazém (3D) e distribuição dos produtos
create table if not exists public.warehouse_layouts (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Armazém',
  layout jsonb not null default '{}'::jsonb,
  allocation jsonb not null default '[]'::jsonb,
  analysis text,
  created_by uuid default auth.uid(),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.warehouse_layouts enable row level security;

drop policy if exists "Authenticated users manage warehouse layouts" on public.warehouse_layouts;
create policy "Authenticated users manage warehouse layouts"
on public.warehouse_layouts
for all
to authenticated
using (true)
with check (true);
