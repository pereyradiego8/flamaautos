-- Flama Autos · Seguridad: aprobación administrativa y mínimos privilegios.
-- Revisión 20/10/2026. Aplicar exclusivamente al proyecto Supabase Flama Autos.
BEGIN;

-- La vista solo se usa para lecturas. En la instancia original los roles
-- anon/authenticated heredaron permisos de escritura innecesarios.
REVOKE ALL PRIVILEGES ON TABLE public.vehicle_cards FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.vehicle_cards TO anon, authenticated;

-- Un editor autorizado a actualizar vehículos NO puede borrar ni reescribir
-- source_review_note para sortear la revisión de publicaciones importadas.
-- El trigger protege igualmente los UPDATE directos por la API REST.
CREATE OR REPLACE FUNCTION private.guard_vehicle_import_review()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $guard$
BEGIN
  IF OLD.source_review_note IS DISTINCT FROM NEW.source_review_note
     AND CURRENT_USER NOT IN ('postgres', 'service_role')
     AND NOT (SELECT private.is_admin()) THEN
    RAISE EXCEPTION 'Solo un administrador puede modificar la revisión de origen'
      USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$guard$;

REVOKE ALL ON FUNCTION private.guard_vehicle_import_review() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS guard_vehicle_import_review ON public.vehicles;
CREATE TRIGGER guard_vehicle_import_review
BEFORE UPDATE OF source_review_note ON public.vehicles
FOR EACH ROW
EXECUTE FUNCTION private.guard_vehicle_import_review();

COMMENT ON FUNCTION private.guard_vehicle_import_review() IS
  'Solo los administradores pueden modificar las notas de revisión de importaciones, incluso usando la API directa.';
COMMIT;
