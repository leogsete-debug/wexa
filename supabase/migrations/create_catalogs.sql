-- Sprint 7: catalogos PDF editaveis pelo CMS
-- Copie e execute este SQL no Supabase SQL Editor com uma conta administradora.

create extension if not exists pgcrypto;

create table if not exists public.catalogs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  pdf_url text,
  cover_image_url text,
  language text default 'pt-BR',
  status text default 'draft',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists catalogs_status_idx
on public.catalogs (status);

create index if not exists catalogs_created_at_idx
on public.catalogs (created_at desc);

create index if not exists catalogs_language_idx
on public.catalogs (language);

create or replace function public.update_catalogs_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists update_catalogs_updated_at on public.catalogs;

create trigger update_catalogs_updated_at
before update on public.catalogs
for each row
execute function public.update_catalogs_updated_at();

alter table public.catalogs enable row level security;

drop policy if exists "Public can read published catalogs" on public.catalogs;
create policy "Public can read published catalogs"
on public.catalogs
for select
to public
using (status = 'published');

drop policy if exists "Authenticated users can read all catalogs" on public.catalogs;
create policy "Authenticated users can read all catalogs"
on public.catalogs
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can insert catalogs" on public.catalogs;
create policy "Authenticated users can insert catalogs"
on public.catalogs
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update catalogs" on public.catalogs;
create policy "Authenticated users can update catalogs"
on public.catalogs
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can delete catalogs" on public.catalogs;
create policy "Authenticated users can delete catalogs"
on public.catalogs
for delete
to authenticated
using (true);

insert into storage.buckets (id, name, public)
values ('catalog-files', 'catalog-files', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "Public can read catalog files" on storage.objects;
create policy "Public can read catalog files"
on storage.objects
for select
to public
using (bucket_id = 'catalog-files');

drop policy if exists "Authenticated users can upload catalog files" on storage.objects;
create policy "Authenticated users can upload catalog files"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'catalog-files');

drop policy if exists "Authenticated users can update catalog files" on storage.objects;
create policy "Authenticated users can update catalog files"
on storage.objects
for update
to authenticated
using (bucket_id = 'catalog-files')
with check (bucket_id = 'catalog-files');

drop policy if exists "Authenticated users can delete catalog files" on storage.objects;
create policy "Authenticated users can delete catalog files"
on storage.objects
for delete
to authenticated
using (bucket_id = 'catalog-files');
