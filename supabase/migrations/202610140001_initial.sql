-- FLAMA AUTOS: MIGRACIÓN INICIAL PARA UN PROYECTO SUPABASE NUEVO Y EXCLUSIVO.
-- NO EJECUTAR EN LA BASE DE 3020 AUTOMOTORES.
-- Reemplaza la migración v0.2 (aún no aplicada): ejecutar una sola vez en Flama Autos.
BEGIN;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SCHEMA IF NOT EXISTS private;

CREATE TABLE public.branches (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 name text NOT NULL UNIQUE,
 address text NOT NULL,
 active boolean NOT NULL DEFAULT true,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.vehicles (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 brand text NOT NULL CHECK (char_length(trim(brand)) BETWEEN 1 AND 80),
 model text NOT NULL CHECK (char_length(trim(model)) BETWEEN 1 AND 80),
 version text CHECK (char_length(version) <= 140),
 model_year integer CHECK (model_year BETWEEN 1950 AND 2100),
 mileage_km integer CHECK (mileage_km >= 0),
 category text NOT NULL CHECK (category IN ('pickup','suv','sedan','hatchback','utility','motorcycle','other')),
 fuel text, transmission text, description text,
 currency text CHECK (currency IN ('ARS','USD')),
 cash_price numeric(14,2) CHECK (cash_price >= 0),
 trade_in_price numeric(14,2) CHECK (trade_in_price >= 0),
 down_payment numeric(14,2) CHECK (down_payment >= 0),
 branch_id uuid REFERENCES public.branches(id) ON DELETE SET NULL,
 status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','reserved','sold')),
 featured boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT published_minimum_fields CHECK (status <> 'published' OR (model_year IS NOT NULL AND cash_price IS NOT NULL AND currency IS NOT NULL))
);
CREATE TABLE public.vehicle_images (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
 storage_path text NOT NULL UNIQUE,
 alt_text text,
 sort_order integer NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.staff (
 user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 role text NOT NULL CHECK (role IN ('admin','editor')),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.vehicle_audit (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 vehicle_id uuid NOT NULL,
 actor_id uuid,
 operation text NOT NULL,
 previous_record jsonb,
 new_record jsonb,
 occurred_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX vehicles_public_idx ON public.vehicles (status, category, created_at DESC);
CREATE INDEX vehicles_branch_idx ON public.vehicles (branch_id);
CREATE INDEX vehicle_images_order_idx ON public.vehicle_images (vehicle_id,sort_order);

-- SECURITY DEFINER únicamente para consultar roles internos y registrar auditoría.
-- Las funciones viven fuera del esquema expuesto por la API, siempre usan auth.uid()
-- y no aceptan IDs arbitrarios con los que puedan consultar a otro usuario.
CREATE FUNCTION private.is_staff() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
 SELECT EXISTS (SELECT 1 FROM public.staff WHERE user_id = (SELECT auth.uid()));
$$;
CREATE FUNCTION private.is_admin() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
 SELECT EXISTS (SELECT 1 FROM public.staff WHERE user_id = (SELECT auth.uid()) AND role='admin');
$$;
CREATE FUNCTION private.touch_vehicle() RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
 BEGIN NEW.updated_at=now(); RETURN NEW; END;
$$;
CREATE TRIGGER vehicles_updated_at BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION private.touch_vehicle();
CREATE FUNCTION private.audit_vehicle() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
 BEGIN
  INSERT INTO public.vehicle_audit(vehicle_id,actor_id,operation,previous_record,new_record)
  VALUES (CASE WHEN TG_OP='DELETE' THEN OLD.id ELSE NEW.id END,
   (SELECT auth.uid()), TG_OP,
   CASE WHEN TG_OP='INSERT' THEN NULL ELSE to_jsonb(OLD) END,
   CASE WHEN TG_OP='DELETE' THEN NULL ELSE to_jsonb(NEW) END);
  RETURN NULL;
 END;
$$;
CREATE TRIGGER vehicles_audit AFTER INSERT OR UPDATE OR DELETE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION private.audit_vehicle();

-- Privilegios explícitos de API; RLS determina las filas accesibles.
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated;
REVOKE ALL ON FUNCTION private.is_staff() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.touch_vehicle() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.audit_vehicle() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.is_staff(), private.is_admin() TO authenticated;
GRANT SELECT ON public.branches,public.vehicles,public.vehicle_images TO anon,authenticated;
GRANT INSERT,UPDATE,DELETE ON public.branches,public.vehicles,public.vehicle_images TO authenticated;
GRANT SELECT ON public.staff,public.vehicle_audit TO authenticated;
REVOKE ALL ON public.staff,public.vehicle_audit FROM anon;

ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY branches_public_read ON public.branches FOR SELECT TO anon,authenticated USING (active);
CREATE POLICY branches_staff_read ON public.branches FOR SELECT TO authenticated USING ((SELECT private.is_staff()));
CREATE POLICY branches_admin_insert ON public.branches FOR INSERT TO authenticated WITH CHECK ((SELECT private.is_admin()));
CREATE POLICY branches_admin_update ON public.branches FOR UPDATE TO authenticated USING ((SELECT private.is_admin())) WITH CHECK ((SELECT private.is_admin()));
CREATE POLICY branches_admin_delete ON public.branches FOR DELETE TO authenticated USING ((SELECT private.is_admin()));

CREATE POLICY vehicles_public_read ON public.vehicles FOR SELECT TO anon,authenticated USING (status='published');
CREATE POLICY vehicles_staff_read ON public.vehicles FOR SELECT TO authenticated USING ((SELECT private.is_staff()));
CREATE POLICY vehicles_staff_insert ON public.vehicles FOR INSERT TO authenticated WITH CHECK ((SELECT private.is_staff()));
CREATE POLICY vehicles_staff_update ON public.vehicles FOR UPDATE TO authenticated USING ((SELECT private.is_staff())) WITH CHECK ((SELECT private.is_staff()));
CREATE POLICY vehicles_admin_delete ON public.vehicles FOR DELETE TO authenticated USING ((SELECT private.is_admin()));

CREATE POLICY images_public_read ON public.vehicle_images FOR SELECT TO anon,authenticated USING (
 EXISTS (SELECT 1 FROM public.vehicles v WHERE v.id=vehicle_id AND v.status='published')
);
CREATE POLICY images_staff_read ON public.vehicle_images FOR SELECT TO authenticated USING ((SELECT private.is_staff()));
CREATE POLICY images_staff_insert ON public.vehicle_images FOR INSERT TO authenticated WITH CHECK ((SELECT private.is_staff()));
CREATE POLICY images_staff_update ON public.vehicle_images FOR UPDATE TO authenticated USING ((SELECT private.is_staff())) WITH CHECK ((SELECT private.is_staff()));
CREATE POLICY images_staff_delete ON public.vehicle_images FOR DELETE TO authenticated USING ((SELECT private.is_staff()));
CREATE POLICY staff_self_read ON public.staff FOR SELECT TO authenticated USING (user_id=(SELECT auth.uid()));
CREATE POLICY staff_admin_read ON public.staff FOR SELECT TO authenticated USING ((SELECT private.is_admin()));
CREATE POLICY audit_admin_read ON public.vehicle_audit FOR SELECT TO authenticated USING ((SELECT private.is_admin()));

-- Fotografías comerciales: bucket público. No subir documentos privados.
-- URLs conocidas son accesibles incluso cuando se retira del catálogo un borrador.
INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 VALUES ('vehicle-images','vehicle-images',true,5242880,ARRAY['image/jpeg','image/png','image/webp'])
 ON CONFLICT (id) DO NOTHING;
CREATE POLICY vehicle_images_staff_insert ON storage.objects FOR INSERT TO authenticated
 WITH CHECK (bucket_id='vehicle-images' AND (SELECT private.is_staff()) AND (storage.foldername(name))[1] IS NOT NULL);
CREATE POLICY vehicle_images_staff_update ON storage.objects FOR UPDATE TO authenticated
 USING (bucket_id='vehicle-images' AND (SELECT private.is_staff()))
 WITH CHECK (bucket_id='vehicle-images' AND (SELECT private.is_staff()));
CREATE POLICY vehicle_images_staff_delete ON storage.objects FOR DELETE TO authenticated
 USING (bucket_id='vehicle-images' AND (SELECT private.is_staff()));
CREATE POLICY vehicle_images_staff_select ON storage.objects FOR SELECT TO authenticated
 USING (bucket_id='vehicle-images' AND (SELECT private.is_staff()));

-- Ubicaciones del relevamiento comercial; verificar con el concesionario antes de publicar.
INSERT INTO public.branches(name,address) VALUES
 ('Centro','Av. Mitre 1220, Berazategui'),
 ('Oeste','Dardo Rocha y Av. 14, Berazategui')
 ON CONFLICT (name) DO NOTHING;
COMMIT;
