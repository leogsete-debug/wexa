-- Corrige upload, persistencia e publicacao do catalogo PDF.
-- Execute este SQL no Supabase SQL Editor com uma conta administradora.

create extension if not exists pgcrypto;

create table if not exists public.catalogs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  pdf_url text,
  file_name text,
  file_size bigint,
  cover_image_url text,
  language text default 'pt-BR',
  status text default 'draft',
  is_active boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.catalogs
  add column if not exists file_name text,
  add column if not exists file_size bigint,
  add column if not exists is_active boolean default false;

update public.catalogs
set status = 'archived'
where status = 'hidden';

update public.catalogs
set is_active = false
where status <> 'published';

update public.catalogs
set is_active = true
where id = (
  select id
  from public.catalogs
  where status = 'published'
    and pdf_url is not null
  order by coalesce(updated_at, created_at) desc, created_at desc
  limit 1
)
and not exists (
  select 1
  from public.catalogs
  where status = 'published'
    and is_active = true
);

with ranked as (
  select
    id,
    row_number() over (order by coalesce(updated_at, created_at) desc, created_at desc) as position
  from public.catalogs
  where status = 'published'
    and is_active = true
)
update public.catalogs
set is_active = false
where id in (
  select id
  from ranked
  where position > 1
);

alter table public.catalogs
  alter column is_active set default false;

alter table public.catalogs
  drop constraint if exists catalogs_status_check;

alter table public.catalogs
  add constraint catalogs_status_check
  check (status in ('draft', 'published', 'archived'));

create index if not exists catalogs_status_idx
on public.catalogs (status);

create index if not exists catalogs_active_published_idx
on public.catalogs (is_active, status, updated_at desc, created_at desc);

create unique index if not exists catalogs_one_active_published_idx
on public.catalogs (is_active)
where status = 'published' and is_active = true;

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
using (
  status = 'published'
  and is_active = true
  and pdf_url is not null
);

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

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('catalogs', 'catalogs', true, 31457280, array['application/pdf'])
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read catalog files" on storage.objects;
drop policy if exists "Public can read catalogs files" on storage.objects;
create policy "Public can read catalogs files"
on storage.objects
for select
to public
using (bucket_id = 'catalogs');

drop policy if exists "Authenticated users can upload catalog files" on storage.objects;
drop policy if exists "Authenticated users can upload catalogs files" on storage.objects;
create policy "Authenticated users can upload catalogs files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'catalogs'
  and lower(right(name, 4)) = '.pdf'
);

drop policy if exists "Authenticated users can update catalog files" on storage.objects;
drop policy if exists "Authenticated users can update catalogs files" on storage.objects;
create policy "Authenticated users can update catalogs files"
on storage.objects
for update
to authenticated
using (bucket_id = 'catalogs')
with check (
  bucket_id = 'catalogs'
  and lower(right(name, 4)) = '.pdf'
);

drop policy if exists "Authenticated users can delete catalog files" on storage.objects;
drop policy if exists "Authenticated users can delete catalogs files" on storage.objects;
create policy "Authenticated users can delete catalogs files"
on storage.objects
for delete
to authenticated
using (bucket_id = 'catalogs');
