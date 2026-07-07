-- Sprint 8: rodape editavel

create extension if not exists pgcrypto;

create table if not exists public.footer_content (
  id uuid primary key default gen_random_uuid(),
  copyright text,
  instagram text,
  linkedin text,
  facebook text,
  youtube text,
  whatsapp text,
  email text,
  institutional_text text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create or replace function public.update_footer_content_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists update_footer_content_updated_at on public.footer_content;
create trigger update_footer_content_updated_at
before update on public.footer_content
for each row execute function public.update_footer_content_updated_at();

alter table public.footer_content enable row level security;

drop policy if exists "Public can read footer content" on public.footer_content;
create policy "Public can read footer content"
on public.footer_content for select to public using (true);

drop policy if exists "Authenticated users can manage footer content" on public.footer_content;
create policy "Authenticated users can manage footer content"
on public.footer_content for all to authenticated using (true) with check (true);

insert into public.footer_content (copyright, instagram, linkedin, facebook, youtube, whatsapp, email, institutional_text)
select
  '2026 TopMax Export',
  '#',
  '#',
  '#',
  '#',
  'https://wa.me/5500000000000',
  'comercial@topmaxexport.com',
  'Empresa internacional de exportacao conectando produtos brasileiros a compradores globais com padrao internacional.'
where not exists (select 1 from public.footer_content);
