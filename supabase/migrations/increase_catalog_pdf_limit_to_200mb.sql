-- Permite exclusivamente PDFs de catalogo de ate 200 MiB.
-- O limite global do Storage tambem precisa ser de pelo menos 200 MiB.
update storage.buckets
set file_size_limit = 209715200,
    allowed_mime_types = array['application/pdf']
where id = 'catalogs';
