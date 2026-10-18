BEGIN;
ALTER TABLE public.vehicles DROP CONSTRAINT IF EXISTS source_url_format;
ALTER TABLE public.vehicles
 ADD CONSTRAINT source_url_format CHECK (
  source_url IS NULL OR
  source_url ~ '^https://auto[.]mercadolibre[.]com[.]ar/MLA-[0-9]{9,12}-[A-Za-z0-9_-]+$'
 );
COMMIT;