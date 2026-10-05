-- Calendário de conteúdo: cada arte/vídeo/legenda criado pelo agente ou no Estúdio,
-- com dia programado e status de postagem. Gerenciado pela Central de Comando.

create extension if not exists pgcrypto;

create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  scheduled_for date,
  status text not null default 'agendado' check (status in ('rascunho', 'agendado', 'postado')),
  kind text not null default 'arte' check (kind in ('arte', 'video', 'texto')),
  format text,
  platform text not null default 'instagram',
  title text,
  pillar text,
  hook text,
  product_name text,
  caption text,
  media_url text,
  media_path text,
  strategy_day integer,
  source text not null default 'manual' check (source in ('manual', 'agente')),
  posted_at timestamp with time zone,
  created_by uuid default auth.uid(),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create index if not exists content_items_scheduled_idx on public.content_items (scheduled_for);
create index if not exists content_items_status_idx on public.content_items (status);

create or replace function public.content_items_touch()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  if new.status = 'postado' and old.status is distinct from 'postado' then
    new.posted_at = coalesce(new.posted_at, now());
  end if;
  return new;
end;
$$;

drop trigger if exists content_items_touch on public.content_items;
create trigger content_items_touch
before update on public.content_items
for each row
execute function public.content_items_touch();

alter table public.content_items enable row level security;

drop policy if exists "Authenticated users manage content items" on public.content_items;
create policy "Authenticated users manage content items"
on public.content_items
for all
to authenticated
using (true)
with check (true);
