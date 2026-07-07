-- Sprint 8: mercados editaveis

create extension if not exists pgcrypto;

create table if not exists public.markets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text,
  continent text,
  image_url text,
  sort_order integer default 0,
  published boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists markets_published_idx on public.markets (published);
create index if not exists markets_sort_order_idx on public.markets (sort_order);

create or replace function public.update_markets_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists update_markets_updated_at on public.markets;
create trigger update_markets_updated_at
before update on public.markets
for each row execute function public.update_markets_updated_at();

alter table public.markets enable row level security;

drop policy if exists "Public can read published markets" on public.markets;
create policy "Public can read published markets"
on public.markets for select to public using (published = true);

drop policy if exists "Authenticated users can read all markets" on public.markets;
create policy "Authenticated users can read all markets"
on public.markets for select to authenticated using (true);

drop policy if exists "Authenticated users can manage markets" on public.markets;
create policy "Authenticated users can manage markets"
on public.markets for all to authenticated using (true) with check (true);

insert into public.markets (name, country, continent, sort_order, published)
select 'Brasil', 'Brasil', 'America do Sul', 0, true
where not exists (select 1 from public.markets);

insert into public.markets (name, country, continent, sort_order, published)
select 'America Latina', null, 'America Latina', 1, true
where not exists (select 1 from public.markets where name = 'America Latina');

insert into public.markets (name, country, continent, sort_order, published)
select 'Europa', null, 'Europa', 2, true
where not exists (select 1 from public.markets where name = 'Europa');

insert into public.markets (name, country, continent, sort_order, published)
select 'America do Norte', null, 'America do Norte', 3, true
where not exists (select 1 from public.markets where name = 'America do Norte');

insert into public.markets (name, country, continent, sort_order, published)
select 'Asia', null, 'Asia', 4, true
where not exists (select 1 from public.markets where name = 'Asia');
