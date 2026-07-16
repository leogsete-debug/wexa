-- Sprint 8: processo de importacao editavel

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
    ('Entendimento da demanda', 'Analisamos o produto, volume, especificacoes, publico e objetivo comercial.', 'send', 0, true),
    ('Busca de fornecedores', 'Localizamos fabricantes internacionais compativeis com a necessidade da empresa.', 'factory', 1, true),
    ('Cotacao e negociacao', 'Negociamos preco, condicoes comerciais, prazo de producao e pedido minimo.', 'clipboard', 2, true),
    ('Desenvolvimento e amostras', 'Avaliamos materiais, especificacoes, embalagens, personalizacao e amostras.', 'package', 3, true),
    ('Producao', 'Acompanhamos o andamento da producao junto ao fabricante.', 'factory', 4, true),
    ('Inspecao de qualidade', 'Verificamos qualidade, acabamento, quantidade e conformidade antes do embarque.', 'shield', 5, true),
    ('Logistica internacional', 'Organizamos transporte, consolidacao de carga e embarque internacional.', 'ship', 6, true),
    ('Documentacao e nacionalizacao', 'Acompanhamos documentos, importacao e desembaraco aduaneiro.', 'clipboard', 7, true),
    ('Entrega no Brasil', 'O produto chega pronto para distribuicao no mercado brasileiro.', 'package', 8, true)
) as seed(title, description, icon, sort_order, published)
where not exists (select 1 from public.export_process_steps);
