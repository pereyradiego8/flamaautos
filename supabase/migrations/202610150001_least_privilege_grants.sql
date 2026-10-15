-- Flama Autos: reforzar los permisos SQL predeterminados de Supabase.
-- RLS sigue siendo obligatorio en todas las tablas públicas.
BEGIN;
REVOKE ALL PRIVILEGES ON TABLE
  public.branches, public.vehicles, public.vehicle_images,
  public.staff, public.vehicle_audit
FROM PUBLIC, anon, authenticated;

GRANT SELECT ON TABLE
  public.branches, public.vehicles, public.vehicle_images
TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE
  public.branches, public.vehicles, public.vehicle_images
TO authenticated;
GRANT SELECT ON TABLE
  public.staff, public.vehicle_audit
TO authenticated;
COMMIT;
