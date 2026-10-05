-- Agente de Conteúdo: estratégias do perfil do Instagram (posicionamento, pilares, calendário).
-- Só usuários logados no painel leem e criam.

create extension if not exists pgcrypto;

create table if not exists public.content_strategies (
  id uuid primary key default gen_random_uuid(),
  profile jsonb not null default '{}'::jsonb,
  strategy jsonb not null default '{}'::jsonb,
  provider text,
  created_by uuid default auth.uid(),
  created_at timestamp with time zone not null default now()
);

create index if not exists content_strategies_created_at_idx on public.content_strategies (created_at desc);

alter table public.content_strategies enable row level security;

drop policy if exists "Authenticated users manage content strategies" on public.content_strategies;
create policy "Authenticated users manage content strategies"
on public.content_strategies
for all
to authenticated
using (true)
with check (true);
