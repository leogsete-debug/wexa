-- Sprint 8: conteudo institucional da empresa

create extension if not exists pgcrypto;

create table if not exists public.company_content (
  id uuid primary key default gen_random_uuid(),
  company_name text,
  section_title text,
  section_subtitle text,
  full_text text,
  mission text,
  vision text,
  values text,
  differentials text,
  stat_20 text,
  stat_35 text,
  stat_500 text,
  stat_100 text,
  main_image_url text,
  secondary_image_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create or replace function public.update_company_content_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists update_company_content_updated_at on public.company_content;
create trigger update_company_content_updated_at
before update on public.company_content
for each row execute function public.update_company_content_updated_at();

alter table public.company_content enable row level security;

drop policy if exists "Public can read company content" on public.company_content;
create policy "Public can read company content"
on public.company_content for select to public using (true);

drop policy if exists "Authenticated users can manage company content" on public.company_content;
create policy "Authenticated users can manage company content"
on public.company_content for all to authenticated using (true) with check (true);

insert into public.company_content (
  company_name, section_title, section_subtitle, full_text, mission, vision, values,
  differentials, stat_20, stat_35, stat_500, stat_100, main_image_url, secondary_image_url
)
select
  'TopMax Export',
  'Sobre a TopMax Export',
  'Conectando fabricantes brasileiros ao mercado global',
  'A TopMax Export conecta fabricantes brasileiros a compradores internacionais por meio de uma estrutura comercial de alto padrao, orientada por confianca, clareza e parcerias de longo prazo.' || chr(10) || chr(10) || 'Da selecao de fornecedores a apresentacao dos produtos, alinhamento de qualidade e suporte a exportacao, ajudamos importadores a acessar o potencial produtivo do Brasil com seguranca e profissionalismo.',
  'Conectar fabricantes brasileiros a compradores internacionais com clareza e confianca.',
  'Ser referencia em curadoria comercial para exportacao brasileira.',
  'Confianca, qualidade, transparencia e relacionamento de longo prazo.',
  'Fornecedor seguro para compradores internacionais',
  '20+|Anos de experiencia',
  '35+|Paises atendidos',
  '500+|Produtos no portfolio',
  '100%|Foco em qualidade',
  '/images/galeria-2.jpeg',
  '/images/galeria-2.jpeg'
where not exists (select 1 from public.company_content);
