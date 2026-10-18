-- Datos de procedencia de Agencia Flama: diferenciar precios comerciales.
-- El precio de lista NO se considera precio de permuta sin indicación explícita.
BEGIN;
ALTER TABLE public.vehicles
 ADD COLUMN IF NOT EXISTS list_price numeric(14,2) CHECK (list_price IS NULL OR list_price >= 0),
 ADD COLUMN IF NOT EXISTS source_listing_id text,
 ADD COLUMN IF NOT EXISTS source_url text,
 ADD COLUMN IF NOT EXISTS source_checked_at timestamptz,
 ADD COLUMN IF NOT EXISTS source_specs jsonb NOT NULL DEFAULT '{}'::jsonb,
 ADD COLUMN IF NOT EXISTS vehicle_condition text CHECK (vehicle_condition IN ('new','used'));
CREATE UNIQUE INDEX IF NOT EXISTS vehicles_source_listing_id_uniq
 ON public.vehicles(source_listing_id) WHERE source_listing_id IS NOT NULL;
ALTER TABLE public.vehicles
 ADD CONSTRAINT source_listing_format CHECK (
 source_listing_id IS NULL OR source_listing_id ~ '^MLA[0-9]{9,12}$'
 ),
 ADD CONSTRAINT source_url_format CHECK (
 source_url IS NULL OR source_url ~ '^https://auto[.]mercadolibre[.]com[.]ar/MLA-[0-9]{9,12}[-/a-z0-9_]*$'
 ),
 ADD CONSTRAINT source_specs_object CHECK(jsonb_typeof(source_specs)='object');
COMMENT ON COLUMN public.vehicles.list_price IS 'Precio de lista informado por la agencia, diferente del contado y de permuta.';
COMMENT ON COLUMN public.vehicles.source_listing_id IS 'Id único MLA de la publicación original de Agenciaflama.';
COMMENT ON COLUMN public.vehicles.source_specs IS 'Características verificables extraídas de la ficha de Mercado Libre.';
COMMIT;
