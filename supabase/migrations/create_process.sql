-- Sprint 8: processo de exportacao editavel

create extension if not exists pgcrypto;

create table if not exists public.export_process_steps (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  icon text,
  sort_order integer default 0,
  published boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists export_process_steps_published_idx on public.export_process_steps (published);
create index if not exists export_process_steps_sort_order_idx on public.export_process_steps (sort_order);

create or replace function public.update_export_process_steps_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists update_export_process_steps_updated_at on public.export_process_steps;
create trigger update_export_process_steps_updated_at
before update on public.export_process_steps
for each row execute function public.update_export_process_steps_updated_at();

alter table public.export_process_steps enable row level security;

drop policy if exists "Public can read published process steps" on public.export_process_steps;
create policy "Public can read published process steps"
on public.export_process_steps for select to public using (published = true);

drop policy if exists "Authenticated users can read all process steps" on public.export_process_steps;
create policy "Authenticated users can read all process steps"
on public.export_process_steps for select to authenticated using (true);

drop policy if exists "Authenticated users can manage process steps" on public.export_process_steps;
create policy "Authenticated users can manage process steps"
on public.export_process_steps for all to authenticated using (true) with check (true);

insert into public.export_process_steps (title, description, icon, sort_order, published)
select * from (
  values
    ('Solicitacao', 'Recebemos a demanda, destino, volume e requisitos comerciais.', 'send', 0, true),
    ('Cotacao', 'Estruturamos preco, prazos, condicoes e escopo de fornecimento.', 'clipboard', 1, true),
    ('Producao', 'Coordenamos producao ou separacao com fornecedores qualificados.', 'factory', 2, true),
    ('Controle de qualidade', 'Validamos padroes, documentacao e consistencia do pedido.', 'shield', 3, true),
    ('Embarque', 'Organizamos logistica, exportacao e acompanhamento operacional.', 'ship', 4, true),
    ('Entrega', 'Acompanhamos a chegada e o pos-venda com visao de longo prazo.', 'package', 5, true)
) as seed(title, description, icon, sort_order, published)
where not exists (select 1 from public.export_process_steps);
