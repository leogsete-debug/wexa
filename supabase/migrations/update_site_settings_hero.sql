-- Sprint 6: campos avancados do Hero editavel
-- Copie e execute este SQL no Supabase SQL Editor com uma conta administradora.

alter table public.site_settings
add column if not exists hero_primary_button_url text,
add column if not exists hero_secondary_button_url text,
add column if not exists hero_mobile_image_url text,
add column if not exists show_hero_primary_button boolean default true,
add column if not exists show_hero_secondary_button boolean default true;

update public.site_settings
set
  hero_primary_button_url = coalesce(hero_primary_button_url, whatsapp_url, 'https://wa.me/5500000000000'),
  hero_secondary_button_url = coalesce(hero_secondary_button_url, '#produtos'),
  hero_mobile_image_url = coalesce(hero_mobile_image_url, hero_image_url, '/images/hero.jpeg'),
  show_hero_primary_button = coalesce(show_hero_primary_button, true),
  show_hero_secondary_button = coalesce(show_hero_secondary_button, true);
