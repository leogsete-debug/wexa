-- Agente Gerente: relatórios semanais, mensais e anuais com análise da IA.
-- Só usuários logados no painel leem e criam relatórios.

create extension if not exists pgcrypto;

create table if not exists public.manager_reports (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('semanal', 'mensal', 'anual')),
  period_start timestamp with time zone not null,
  period_end timestamp with time zone not null,
  metrics jsonb not null default '{}'::jsonb,
  analysis text not null,
  provider text,
  created_by uuid default auth.uid(),
  created_at timestamp with time zone not null default now()
);

create index if not exists manager_reports_created_at_idx on public.manager_reports (created_at desc);
create index if not exists manager_reports_kind_idx on public.manager_reports (kind, created_at desc);

alter table public.manager_reports enable row level security;

drop policy if exists "Authenticated users manage manager reports" on public.manager_reports;
create policy "Authenticated users manage manager reports"
on public.manager_reports
for all
to authenticated
using (true)
with check (true);
