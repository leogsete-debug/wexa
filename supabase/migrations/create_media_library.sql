-- Sprint 9: biblioteca central de midia
-- Copie e execute este SQL no Supabase SQL Editor com uma conta administradora.

create extension if not exists pgcrypto;

create table if not exists public.media_library (
  id uuid primary key default gen_random_uuid(),
  name text,
  file_name text,
  file_type text,
  mime_type text,
  file_url text,
  folder text,
  size bigint,
  alt_text text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists media_library_file_type_idx
on public.media_library (file_type);

create index if not exists media_library_folder_idx
on public.media_library (folder);

create index if not exists media_library_created_at_idx
on public.media_library (created_at desc);

create or replace function public.update_media_library_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists update_media_library_updated_at on public.media_library;

create trigger update_media_library_updated_at
before update on public.media_library
for each row
execute function public.update_media_library_updated_at();

alter table public.media_library enable row level security;

drop policy if exists "Authenticated users can read media library" on public.media_library;
create policy "Authenticated users can read media library"
on public.media_library
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can insert media library" on public.media_library;
create policy "Authenticated users can insert media library"
on public.media_library
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update media library" on public.media_library;
create policy "Authenticated users can update media library"
on public.media_library
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can delete media library" on public.media_library;
create policy "Authenticated users can delete media library"
on public.media_library
for delete
to authenticated
using (true);

insert into storage.buckets (id, name, public)
values ('media-library', 'media-library', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "Public can read media library files" on storage.objects;
create policy "Public can read media library files"
on storage.objects
for select
to public
using (bucket_id = 'media-library');

drop policy if exists "Authenticated users can upload media library files" on storage.objects;
create policy "Authenticated users can upload media library files"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'media-library');

drop policy if exists "Authenticated users can update media library files" on storage.objects;
create policy "Authenticated users can update media library files"
on storage.objects
for update
to authenticated
using (bucket_id = 'media-library')
with check (bucket_id = 'media-library');

drop policy if exists "Authenticated users can delete media library files" on storage.objects;
create policy "Authenticated users can delete media library files"
on storage.objects
for delete
to authenticated
using (bucket_id = 'media-library');
