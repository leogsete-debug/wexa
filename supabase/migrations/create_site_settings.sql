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
  'https://wa.me/5500000000000',
  '+55 00 00000-0000',
  'comercial@topmaxexport.com',
  'TopMax Export',
  'Vitrine internacional de exportação',
  'Conectando a excelência brasileira ao mercado global',
  'Uma vitrine digital de alto padrão para apresentar produtos, fortalecer negociações e conectar compradores ao mercado internacional.',
  'Solicitar cotação',
  'https://wa.me/5500000000000',
  'Ver produtos',
  '#produtos',
  '/images/hero.jpeg',
  '/images/hero.jpeg',
  true,
  true,
  'Catálogo Completo',
  'Baixe nosso catálogo completo com produtos, especificações e preços.',
  '/catalogo.pdf'
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
