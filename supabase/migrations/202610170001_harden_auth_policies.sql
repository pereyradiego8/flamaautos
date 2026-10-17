-- Flama Autos | seguridad posterior a la creación del primer administrador.
-- El registro bootstrap ya fue consumido; las altas futuras requieren un flujo administrativo.
BEGIN;
DO $$
BEGIN
 IF NOT EXISTS (SELECT 1 FROM public.staff WHERE role = 'admin') THEN
   RAISE EXCEPTION 'No se puede retirar el bootstrap sin un administrador activo.';
 END IF;
 IF EXISTS (SELECT 1 FROM private.initial_admin_invites WHERE claimed_at IS NULL) THEN
   RAISE EXCEPTION 'Hay invitaciones iniciales pendientes; revisar antes de continuar.';
 END IF;
END;
$$;
DROP TRIGGER IF EXISTS flama_claim_initial_admin ON auth.users;
DROP FUNCTION IF EXISTS private.claim_initial_admin();
DROP TABLE IF EXISTS private.initial_admin_invites;

-- Una única política permisiva de SELECT por tabla y rol.
ALTER POLICY branches_public_read ON public.branches TO anon USING (active);
ALTER POLICY branches_staff_read ON public.branches TO authenticated
  USING (active OR (SELECT private.is_staff()));

ALTER POLICY vehicles_public_read ON public.vehicles TO anon
  USING (status='published');
ALTER POLICY vehicles_staff_read ON public.vehicles TO authenticated
  USING (status='published' OR (SELECT private.is_staff()));

ALTER POLICY images_public_read ON public.vehicle_images TO anon
  USING (EXISTS (SELECT 1 FROM public.vehicles v WHERE v.id=vehicle_id AND v.status='published'));
ALTER POLICY images_staff_read ON public.vehicle_images TO authenticated
  USING ((SELECT private.is_staff()) OR EXISTS
    (SELECT 1 FROM public.vehicles v WHERE v.id=vehicle_id AND v.status='published'));

ALTER POLICY staff_self_read ON public.staff TO authenticated
  USING (user_id=(SELECT auth.uid()) OR (SELECT private.is_admin()));
DROP POLICY staff_admin_read ON public.staff;
COMMIT;
