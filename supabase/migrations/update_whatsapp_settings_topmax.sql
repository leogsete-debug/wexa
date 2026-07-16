-- Atualiza a configuracao central de WhatsApp da Top Max.
-- Execute manualmente no Supabase SQL Editor. Nao apaga dados existentes.

alter table public.site_settings
  add column if not exists floating_whatsapp_number text,
  add column if not exists floating_whatsapp_message text;

update public.site_settings
set
  whatsapp_number = '5521995016888',
  floating_whatsapp_number = '5521995016888',
  floating_whatsapp_message = 'Olá! Encontrei a Top Max através do site e gostaria de conhecer melhor seus produtos e soluções de importação. Poderiam me ajudar?',
  whatsapp_url = 'https://wa.me/5521995016888?text=Ol%C3%A1!%20Encontrei%20a%20Top%20Max%20atrav%C3%A9s%20do%20site%20e%20gostaria%20de%20conhecer%20melhor%20seus%20produtos%20e%20solu%C3%A7%C3%B5es%20de%20importa%C3%A7%C3%A3o.%20Poderiam%20me%20ajudar%3F';
