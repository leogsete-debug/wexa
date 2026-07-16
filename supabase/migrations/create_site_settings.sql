-- Sprint 5: configurações editáveis do site
-- Copie e execute este SQL no Supabase SQL Editor com uma conta administradora.

create extension if not exists pgcrypto;

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  whatsapp_url text,
  whatsapp_number text,
  email text,
  company_name text,
  hero_badge text,
  hero_title text,
  hero_subtitle text,
  hero_primary_button_text text,
  hero_primary_button_url text,
  hero_secondary_button_text text,
  hero_secondary_button_url text,
  hero_image_url text,
  hero_mobile_image_url text,
  show_hero_primary_button boolean default true,
  show_hero_secondary_button boolean default true,
  catalog_title text,
  catalog_subtitle text,
  catalog_pdf_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create or replace function public.update_site_settings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists update_site_settings_updated_at on public.site_settings;

create trigger update_site_settings_updated_at
before update on public.site_settings
for each row
execute function public.update_site_settings_updated_at();

insert into public.site_settings (
  whatsapp_url,
  whatsapp_number,
  email,
  company_name,
  hero_badge,
  hero_title,
  hero_subtitle,
  hero_primary_button_text,
  hero_primary_button_url,
  hero_secondary_button_text,
  hero_secondary_button_url,
  hero_image_url,
  hero_mobile_image_url,
  show_hero_primary_button,
  show_hero_secondary_button,
  catalog_title,
  catalog_subtitle,
  catalog_pdf_url
)
select
  'https://wa.me/5521995016888?text=Ol%C3%A1!%20Encontrei%20a%20Top%20Max%20atrav%C3%A9s%20do%20site%20e%20gostaria%20de%20conhecer%20melhor%20seus%20produtos%20e%20solu%C3%A7%C3%B5es%20de%20importa%C3%A7%C3%A3o.%20Poderiam%20me%20ajudar%3F',
  '5521995016888',
  'comercial@topmaxexport.com',
  'TopMax Export',
  'IMPORTACAO E FORNECIMENTO GLOBAL',
  'Conectando o Brasil aos melhores fabricantes do mundo.',
  'Importamos produtos da China, India e outros mercados estrategicos, oferecendo solucoes completas para distribuidores, atacadistas, varejistas e grandes redes brasileiras.',
  'Solicitar cotação',
  null,
  'Conhecer produtos',
  '#produtos',
  '/images/hero.jpeg',
  '/images/hero.jpeg',
  true,
  true,
  'Conheca nosso portfolio de produtos importados.',
  'Baixe o catalogo completo e encontre produtos para distribuicao, atacado, varejo e grandes redes.',
  null
where not exists (select 1 from public.site_settings);

alter table public.site_settings enable row level security;

drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings"
on public.site_settings
for select
to public
using (true);

drop policy if exists "Authenticated users can insert site settings" on public.site_settings;
create policy "Authenticated users can insert site settings"
on public.site_settings
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update site settings" on public.site_settings;
create policy "Authenticated users can update site settings"
on public.site_settings
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can delete site settings" on public.site_settings;
create policy "Authenticated users can delete site settings"
on public.site_settings
for delete
to authenticated
using (true);
