-- Torna o conteudo publico do site editavel pelo painel.
-- Execute manualmente no Supabase SQL Editor. Nao apaga dados existentes.

create extension if not exists pgcrypto;

alter table public.site_settings
  add column if not exists company_name_zh text,
  add column if not exists logo_url text,
  add column if not exists favicon_url text,
  add column if not exists show_language_selector boolean default true,
  add column if not exists show_admin_button boolean default true,
  add column if not exists show_quote_button boolean default true,
  add column if not exists header_quote_text text,
  add column if not exists header_quote_text_zh text,
  add column if not exists header_quote_url text,
  add column if not exists hero_badge_zh text,
  add column if not exists hero_title_zh text,
  add column if not exists hero_subtitle_zh text,
  add column if not exists hero_primary_button_text_zh text,
  add column if not exists hero_secondary_button_text_zh text,
  add column if not exists catalog_title_zh text,
  add column if not exists catalog_subtitle_zh text,
  add column if not exists floating_whatsapp_number text,
  add column if not exists floating_whatsapp_message text,
  add column if not exists floating_whatsapp_message_zh text,
  add column if not exists floating_whatsapp_aria_label text,
  add column if not exists floating_whatsapp_aria_label_zh text,
  add column if not exists show_floating_whatsapp boolean default true,
  add column if not exists floating_whatsapp_position text default 'right',
  add column if not exists floating_whatsapp_size text default 'default',
  add column if not exists seo_title text,
  add column if not exists seo_title_zh text,
  add column if not exists seo_description text,
  add column if not exists seo_description_zh text,
  add column if not exists seo_keywords text,
  add column if not exists seo_og_title text,
  add column if not exists seo_og_description text,
  add column if not exists seo_image_url text,
  add column if not exists seo_canonical text,
  add column if not exists seo_indexable boolean default true;

alter table public.company_content
  add column if not exists section_title_zh text,
  add column if not exists section_subtitle_zh text,
  add column if not exists full_text_zh text,
  add column if not exists mission_zh text,
  add column if not exists vision_zh text,
  add column if not exists values_zh text,
  add column if not exists differentials_zh text,
  add column if not exists stat_20_zh text,
  add column if not exists stat_35_zh text,
  add column if not exists stat_500_zh text,
  add column if not exists stat_100_zh text,
  add column if not exists published boolean default true;

alter table public.products
  add column if not exists name_zh text,
  add column if not exists category_zh text,
  add column if not exists short_description_zh text,
  add column if not exists full_description_zh text,
  add column if not exists specifications text,
  add column if not exists specifications_zh text,
  add column if not exists gallery_urls text[] default '{}',
  add column if not exists video_url text,
  add column if not exists pdf_url text,
  add column if not exists show_quote_button boolean default true;

alter table public.export_process_steps
  add column if not exists title_zh text,
  add column if not exists description_zh text;

alter table public.markets
  add column if not exists name_zh text,
  add column if not exists description text,
  add column if not exists description_zh text,
  add column if not exists icon text;

alter table public.contact_content
  add column if not exists section_eyebrow text,
  add column if not exists section_eyebrow_zh text,
  add column if not exists section_title text,
  add column if not exists section_title_zh text,
  add column if not exists section_subtitle text,
  add column if not exists section_subtitle_zh text,
  add column if not exists whatsapp_card_title text,
  add column if not exists whatsapp_card_title_zh text,
  add column if not exists email_card_text text,
  add column if not exists email_card_text_zh text,
  add column if not exists show_whatsapp_card boolean default true,
  add column if not exists show_email_card boolean default true,
  add column if not exists show_phone_card boolean default true;

alter table public.footer_content
  add column if not exists logo_url text,
  add column if not exists rights_text text,
  add column if not exists rights_text_zh text,
  add column if not exists institutional_text_zh text,
  add column if not exists company_column_title text,
  add column if not exists company_column_title_zh text,
  add column if not exists contact_column_title text,
  add column if not exists contact_column_title_zh text,
  add column if not exists export_column_title text,
  add column if not exists export_column_title_zh text,
  add column if not exists export_text text,
  add column if not exists export_text_zh text,
  add column if not exists links jsonb default '[]'::jsonb;

create table if not exists public.site_sections (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  title text,
  enabled boolean default true,
  content jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists site_sections_key_idx
on public.site_sections (key);

create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  title text,
  title_zh text,
  caption text,
  caption_zh text,
  alt_text text,
  alt_text_zh text,
  image_url text not null,
  sort_order integer default 0,
  published boolean default true,
  featured boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists gallery_items_published_sort_idx
on public.gallery_items (published, sort_order, created_at desc);

create or replace function public.update_site_sections_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists update_site_sections_updated_at on public.site_sections;
create trigger update_site_sections_updated_at
before update on public.site_sections
for each row execute function public.update_site_sections_updated_at();

create or replace function public.update_gallery_items_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists update_gallery_items_updated_at on public.gallery_items;
create trigger update_gallery_items_updated_at
before update on public.gallery_items
for each row execute function public.update_gallery_items_updated_at();

alter table public.site_sections enable row level security;
alter table public.gallery_items enable row level security;

drop policy if exists "Public can read site sections" on public.site_sections;
create policy "Public can read site sections"
on public.site_sections for select to public using (true);

drop policy if exists "Authenticated users can manage site sections" on public.site_sections;
create policy "Authenticated users can manage site sections"
on public.site_sections for all to authenticated using (true) with check (true);

drop policy if exists "Public can read published gallery items" on public.gallery_items;
create policy "Public can read published gallery items"
on public.gallery_items for select to public using (published = true);

drop policy if exists "Authenticated users can manage gallery items" on public.gallery_items;
create policy "Authenticated users can manage gallery items"
on public.gallery_items for all to authenticated using (true) with check (true);

insert into public.site_sections (key, title, enabled, content)
values
  ('header', 'Header', true, '{"nav":[{"label":"Empresa","label_zh":"公司","href":"#empresa"},{"label":"Produtos","label_zh":"产品","href":"#produtos"},{"label":"Catalogo","label_zh":"产品目录","href":"#catalogo"},{"label":"Galeria","label_zh":"图片库","href":"#galeria"},{"label":"Contato","label_zh":"联系我们","href":"#contato"}],"show_language_selector":true,"show_admin_button":true,"show_quote_button":true}'::jsonb),
  ('hero', 'Hero', true, '{"stats":[{"value":"20+","label":"Anos de experiencia","label_zh":"行业经验","sort_order":0},{"value":"35+","label":"Mercados fornecedores","label_zh":"全球供应市场","sort_order":1},{"value":"500+","label":"Produtos no portfolio","label_zh":"产品组合","sort_order":2},{"value":"100%","label":"Compromisso com qualidade","label_zh":"质量承诺","sort_order":3}]}'::jsonb),
  ('products', 'Produtos', true, '{}'::jsonb),
  ('catalog', 'Catalogo', true, '{}'::jsonb),
  ('process', 'Processo', true, '{}'::jsonb),
  ('markets', 'Mercados', true, '{}'::jsonb),
  ('gallery', 'Galeria', true, '{}'::jsonb),
  ('cta', 'CTA', true, '{}'::jsonb),
  ('lead_form', 'Formulario de lead', true, '{}'::jsonb),
  ('whatsapp', 'WhatsApp flutuante', true, '{"position":"right","size":"default"}'::jsonb),
  ('seo', 'SEO', true, '{}'::jsonb)
on conflict (key) do nothing;

insert into public.gallery_items (image_url, sort_order, published, featured)
select '/images/galeria-1.jpeg', 0, true, true
where not exists (select 1 from public.gallery_items);

insert into public.gallery_items (image_url, sort_order, published, featured)
select '/images/galeria-2.jpeg', 1, true, false
where not exists (select 1 from public.gallery_items where image_url = '/images/galeria-2.jpeg');

insert into public.gallery_items (image_url, sort_order, published, featured)
select '/images/galeria-3.jpeg', 2, true, false
where not exists (select 1 from public.gallery_items where image_url = '/images/galeria-3.jpeg');

insert into public.gallery_items (image_url, sort_order, published, featured)
select '/images/galeria-4.jpeg', 3, true, false
where not exists (select 1 from public.gallery_items where image_url = '/images/galeria-4.jpeg');
