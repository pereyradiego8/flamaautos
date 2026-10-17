-- Ordenación atómica de fotos con RLS y comprobación de conjunto completo.
BEGIN;
CREATE OR REPLACE FUNCTION public.reorder_vehicle_images(
 p_vehicle_id uuid,
 p_image_ids uuid[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path=''
AS $$
DECLARE
 requested_count integer := COALESCE(array_length(p_image_ids,1),0);
BEGIN
 IF (SELECT auth.uid()) IS NULL OR NOT (SELECT private.is_staff()) THEN
  RAISE EXCEPTION 'No autorizado para modificar fotografías';
 END IF;
 IF p_vehicle_id IS NULL OR requested_count > 120 THEN
  RAISE EXCEPTION 'Solicitud de orden inválida';
 END IF;
 IF requested_count <> (SELECT count(*) FROM public.vehicle_images WHERE vehicle_id=p_vehicle_id)
 OR requested_count <> (SELECT count(DISTINCT x) FROM unnest(p_image_ids) AS x)
 OR EXISTS (SELECT 1 FROM unnest(p_image_ids) AS ids(id)
            WHERE NOT EXISTS (SELECT 1 FROM public.vehicle_images i
                               WHERE i.id=ids.id AND i.vehicle_id=p_vehicle_id)) THEN
  RAISE EXCEPTION 'El conjunto de fotografías no coincide con el vehículo';
 END IF;
 UPDATE public.vehicle_images i
 SET sort_order = seq.pos - 1
 FROM unnest(p_image_ids) WITH ORDINALITY AS seq(id,pos)
 WHERE i.vehicle_id=p_vehicle_id AND i.id=seq.id;
END;
$$;
REVOKE ALL ON FUNCTION public.reorder_vehicle_images(uuid,uuid[]) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.reorder_vehicle_images(uuid,uuid[]) TO authenticated;

-- Solo se permiten fotos dentro de carpetas correspondientes a vehículos existentes.
DROP POLICY IF EXISTS vehicle_images_staff_insert ON storage.objects;
CREATE POLICY vehicle_images_staff_insert ON storage.objects
 FOR INSERT TO authenticated
 WITH CHECK (
   bucket_id='vehicle-images'
   AND (SELECT private.is_staff())
   AND EXISTS (
     SELECT 1 FROM public.vehicles v
     WHERE v.id::text=(storage.foldername(name))[1]
   )
 );
COMMIT;
