-- Las importaciones con información contradictoria necesitan revisión explícita.
BEGIN;
ALTER TABLE public.vehicles
ADD CONSTRAINT marketplace_review_before_publication
CHECK (status <> 'published' OR source_review_note IS NULL);
COMMENT ON CONSTRAINT marketplace_review_before_publication ON public.vehicles IS
'Los vehículos importados con advertencias deben revisarse y liberar la advertencia antes de publicarlos.';
COMMIT;
