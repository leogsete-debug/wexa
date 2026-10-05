-- Central de Comando: registro de cada tarefa executada pelos agentes
-- (sucesso/erro, qual IA respondeu, tempo). Alimenta o painel e o agente Gerente.

create extension if not exists pgcrypto;

create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  agent text not null check (char_length(agent) <= 40),
  task text not null check (char_length(task) <= 80),
  status text not null check (status in ('ok', 'aviso', 'erro')),
  provider text check (char_length(provider) <= 40),
  duration_ms integer,
  detail text check (char_length(detail) <= 1000),
  created_at timestamp with time zone not null default now()
);

create index if not exists agent_runs_agent_created_idx on public.agent_runs (agent, created_at desc);
create index if not exists agent_runs_created_at_idx on public.agent_runs (created_at desc);

alter table public.agent_runs enable row level security;

-- O servidor do site grava com a chave pública; só o painel (logado) lê.
drop policy if exists "Public can insert agent runs" on public.agent_runs;
create policy "Public can insert agent runs"
on public.agent_runs
for insert
to anon
with check (true);

drop policy if exists "Authenticated users manage agent runs" on public.agent_runs;
create policy "Authenticated users manage agent runs"
on public.agent_runs
for all
to authenticated
using (true)
with check (true);
