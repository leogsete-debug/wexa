-- Agente de Atendimento do site: registro das conversas
-- Execute no Supabase SQL Editor. Alimenta o painel e os relatórios do agente Gerente
-- (perguntas mais frequentes, produtos mais procurados, conversas sem contato).

create extension if not exists pgcrypto;

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id text not null check (char_length(session_id) between 1 and 80),
  locale text not null default 'pt',
  role text not null check (role in ('user', 'assistant')),
  content text not null check (char_length(content) <= 4000),
  provider text,
  created_at timestamp with time zone not null default now()
);

create index if not exists chat_messages_session_idx on public.chat_messages (session_id, created_at);
create index if not exists chat_messages_created_at_idx on public.chat_messages (created_at desc);

alter table public.chat_messages enable row level security;

-- O servidor do site grava as mensagens com a chave pública; ninguém de fora lê.
drop policy if exists "Public can insert chat messages" on public.chat_messages;
create policy "Public can insert chat messages"
on public.chat_messages
for insert
to anon
with check (true);

drop policy if exists "Authenticated users manage chat messages" on public.chat_messages;
create policy "Authenticated users manage chat messages"
on public.chat_messages
for all
to authenticated
using (true)
with check (true);
