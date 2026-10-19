-- Vistas livianas para el catálogo público. PostgreSQL 17: SECURITY INVOKER
-- aplica RLS y privilegios del visitante a vehículos, sucursales y fotos.
-- Solo retorna campos para tarjetas y una única foto por vehículo.
CREATE OR REPLACE VIEW public.vehicle_cards WITH (security_invoker = true) AS
SELECT
 v.id, v.slug, v.brand, v.model, v.version, v.model_year,
 v.mileage_km, v.category, v.currency, v.cash_price,
 v.down_payment, v.list_price, v.branch_id, v.featured,
 v.created_at, v.updated_at,
 CASE WHEN b.id IS NULL THEN NULL
   ELSE jsonb_build_object('name',b.name,'address',b.address)
 END AS branches,
 CASE WHEN im.id IS NULL THEN '[]'::jsonb
   ELSE jsonb_build_array(jsonb_build_object(
      'id', im.id, 'vehicle_id', im.vehicle_id,
      'storage_path', im.storage_path,
      'alt_text', im.alt_text, 'sort_order', im.sort_order
   ))
 END AS vehicle_images
FROM public.vehicles v
LEFT JOIN public.branches b ON b.id = v.branch_id AND b.active
LEFT JOIN LATERAL (
 SELECT i.id, i.vehicle_id, i.storage_path, i.alt_text, i.sort_order
 FROM public.vehicle_images i
 WHERE i.vehicle_id = v.id
 ORDER BY i.sort_order, i.id
 LIMIT 1
) im ON true
WHERE v.status = 'published';

REVOKE ALL ON public.vehicle_cards FROM PUBLIC;
GRANT SELECT ON public.vehicle_cards TO anon, authenticated;
COMMENT ON VIEW public.vehicle_cards IS
 'Resumen público eficiente; usa SECURITY INVOKER y RLS de tablas base.';
