-- Fase 1: Módulo de Pedidos
-- Copie e execute este SQL no Supabase SQL Editor com uma conta administradora.
-- Cria pedidos, itens do pedido e o histórico automático de mudanças de fase
-- (usado depois pelos agentes de Pedidos, Armazém e Gerente).

create extension if not exists pgcrypto;

-- Código legível do pedido: TMX-2026-0001
create sequence if not exists public.orders_code_seq;

create or replace function public.next_order_code()
returns text
language sql
as $$
  select 'TMX-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.orders_code_seq')::text, 4, '0');
$$;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  code text not null unique default public.next_order_code(),
  lead_id uuid references public.leads (id) on delete set null,
  customer_name text not null,
  customer_company text,
  customer_email text,
  customer_phone text,
  destination_country text,
  destination_city text,
  status text not null default 'lead'
    check (status in ('lead', 'cotacao', 'negociacao', 'aprovado', 'pago', 'separacao', 'expedido', 'entregue', 'cancelado')),
  priority text not null default 'normal'
    check (priority in ('baixa', 'normal', 'alta', 'urgente')),
  source text default 'manual',
  incoterm text,
  currency text not null default 'USD',
  total_amount numeric(14, 2) not null default 0,
  expected_ship_date date,
  tracking_code text,
  assigned_to text,
  notes text,
  status_changed_at timestamp with time zone not null default now(),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_lead_id_idx on public.orders (lead_id);
create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_changed_at_idx on public.orders (status_changed_at);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  description text not null,
  quantity numeric(14, 3) not null default 1 check (quantity > 0),
  unit text not null default 'un',
  unit_price numeric(14, 2) not null default 0 check (unit_price >= 0),
  created_at timestamp with time zone not null default now()
);

create index if not exists order_items_order_id_idx on public.order_items (order_id);
create index if not exists order_items_product_id_idx on public.order_items (product_id);

create table if not exists public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  event_type text not null default 'status_change',
  from_status text,
  to_status text,
  note text,
  actor text default 'admin',
  created_at timestamp with time zone not null default now()
);

create index if not exists order_events_order_id_idx on public.order_events (order_id, created_at desc);

-- updated_at + data de entrada na fase atual
create or replace function public.orders_before_update()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();

  if new.status is distinct from old.status then
    new.status_changed_at = now();
  end if;

  return new;
end;
$$;

drop trigger if exists orders_before_update on public.orders;
create trigger orders_before_update
before update on public.orders
for each row
execute function public.orders_before_update();

-- Histórico automático: criação e cada mudança de fase
create or replace function public.orders_log_status()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.order_events (order_id, event_type, to_status, actor)
    values (new.id, 'created', new.status, coalesce(new.source, 'manual'));
  elsif new.status is distinct from old.status then
    insert into public.order_events (order_id, event_type, from_status, to_status)
    values (new.id, 'status_change', old.status, new.status);
  end if;

  return new;
end;
$$;

drop trigger if exists orders_log_status on public.orders;
create trigger orders_log_status
after insert or update of status on public.orders
for each row
execute function public.orders_log_status();

-- Total do pedido recalculado a partir dos itens
create or replace function public.order_items_refresh_total()
returns trigger
language plpgsql
as $$
declare
  target_order uuid := coalesce(new.order_id, old.order_id);
begin
  update public.orders
  set total_amount = coalesce((
    select sum(quantity * unit_price)
    from public.order_items
    where order_id = target_order
  ), 0)
  where id = target_order;

  return null;
end;
$$;

drop trigger if exists order_items_refresh_total on public.order_items;
create trigger order_items_refresh_total
after insert or update or delete on public.order_items
for each row
execute function public.order_items_refresh_total();

-- Segurança: apenas usuários autenticados (painel admin e agentes com service role)
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_events enable row level security;

drop policy if exists "Authenticated users manage orders" on public.orders;
create policy "Authenticated users manage orders"
on public.orders
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users manage order items" on public.order_items;
create policy "Authenticated users manage order items"
on public.order_items
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users manage order events" on public.order_events;
create policy "Authenticated users manage order events"
on public.order_events
for all
to authenticated
using (true)
with check (true);
