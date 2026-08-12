-- URL HTTPS externa opcional. Quando preenchida, tem prioridade sobre pdf_url.
alter table public.catalogs
  add column if not exists external_pdf_url text;

alter table public.catalogs
  drop constraint if exists catalogs_external_pdf_url_https_check;

alter table public.catalogs
  add constraint catalogs_external_pdf_url_https_check
  check (external_pdf_url is null or external_pdf_url ~ '^https?://');

drop policy if exists "Public can read published catalogs" on public.catalogs;
create policy "Public can read published catalogs"
on public.catalogs
for select
to public
using (
  status = 'published'
  and is_active = true
  and (external_pdf_url is not null or pdf_url is not null)
);
