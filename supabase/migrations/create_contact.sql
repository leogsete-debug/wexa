-- Sprint 8: contato editavel

create extension if not exists pgcrypto;

create table if not exists public.contact_content (
  id uuid primary key default gen_random_uuid(),
  phone text,
  whatsapp text,
  email text,
  address text,
  city text,
  state text,
  country text,
  google_maps text,
  business_hours text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create or replace function public.update_contact_content_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists update_contact_content_updated_at on public.contact_content;
create trigger update_contact_content_updated_at
before update on public.contact_content
for each row execute function public.update_contact_content_updated_at();

alter table public.contact_content enable row level security;

drop policy if exists "Public can read contact content" on public.contact_content;
create policy "Public can read contact content"
on public.contact_content for select to public using (true);

drop policy if exists "Authenticated users can manage contact content" on public.contact_content;
create policy "Authenticated users can manage contact content"
on public.contact_content for all to authenticated using (true) with check (true);

insert into public.contact_content (phone, whatsapp, email, address, city, state, country, google_maps, business_hours)
select
  'Comercial internacional',
  'https://wa.me/5500000000000',
  'comercial@topmaxexport.com',
  'Brasil | Mercados internacionais',
  '',
  '',
  'Brasil',
  '',
  'Atendimento comercial para compradores corporativos.'
where not exists (select 1 from public.contact_content);
