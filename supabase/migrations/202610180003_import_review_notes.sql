BEGIN;
ALTER TABLE public.vehicles
 ADD COLUMN IF NOT EXISTS source_review_note text;
COMMENT ON COLUMN public.vehicles.source_review_note IS
 'Observación del control de calidad de importación. Requiere revisión antes de publicar la unidad.';
COMMIT;