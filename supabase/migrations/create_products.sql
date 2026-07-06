-- Sprint 4: estrutura de produtos do CMS
-- Copie e execute este SQL no Supabase SQL Editor com uma conta administradora.

create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  category text,
  short_description text,
  full_description text,
  material text,
  origin text,
  status text default 'draft',
  featured boolean default false,
  sort_order integer default 0,
  main_image_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists products_slug_idx
on public.products (slug);

create index if not exists products_status_idx
on public.products (status);

create index if not exists products_featured_idx
on public.products (featured);

create index if not exists products_sort_order_idx
on public.products (sort_order);

create or replace function public.update_products_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists update_products_updated_at on public.products;

create trigger update_products_updated_at
before update on public.products
for each row
execute function public.update_products_updated_at();

alter table public.products enable row level security;

drop policy if exists "Public can read published products" on public.products;
create policy "Public can read published products"
on public.products
for select
to public
using (status = 'published');

drop policy if exists "Authenticated users can read all products" on public.products;
create policy "Authenticated users can read all products"
on public.products
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can insert products" on public.products;
create policy "Authenticated users can insert products"
on public.products
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update products" on public.products;
create policy "Authenticated users can update products"
on public.products
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can delete products" on public.products;
create policy "Authenticated users can delete products"
on public.products
for delete
to authenticated
using (true);

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "Public can read product images" on storage.objects;
create policy "Public can read product images"
on storage.objects
for select
to public
using (bucket_id = 'product-images');

drop policy if exists "Authenticated users can upload product images" on storage.objects;
create policy "Authenticated users can upload product images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'product-images');

drop policy if exists "Authenticated users can update product images" on storage.objects;
create policy "Authenticated users can update product images"
on storage.objects
for update
to authenticated
using (bucket_id = 'product-images')
with check (bucket_id = 'product-images');

drop policy if exists "Authenticated users can delete product images" on storage.objects;
create policy "Authenticated users can delete product images"
on storage.objects
for delete
to authenticated
using (bucket_id = 'product-images');
