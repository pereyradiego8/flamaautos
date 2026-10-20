# Flama Autos

Sitio independiente en https://flamaautos.vercel.app

Repositorio: https://github.com/pereyradiego8/flamaautos

## Tecnología

Next.js 16.4.2, React 19, Supabase y Vercel. Node.js 24 en Vercel y GitHub Actions.

## Estado al 18 de octubre de 2026

La web está desplegada. Supabase es independiente del proyecto de 3020 Automotores.

- Catálogo público, fichas, filtros y cotización blue para ordenar precios.
- Panel administrativo con gestión de vehículos, estados, fotografías y sucursales.
- Búsqueda, duplicación como borrador y ordenación de fotos desde administración.
- Gestión de invitados mediante una función protegida de Supabase, reservada a administradores.
- Registro inicial público retirado del formulario.
- Políticas RLS, permisos de tablas restringidos y auditoría del inventario.
- Imágenes optimizadas, metadatos SEO, sitemap e imagen para compartir.
- Diagnóstico de disponibilidad de base de datos mediante la ruta /api/health.
- Tests automáticos y auditoría responsive en GitHub Actions.
- WhatsApp oficial centralizado: +54 9 11 7653-7799 (`https://wa.me/5491176537799`), accesible desde la portada, el pie de página, el catálogo y las fichas con mensajes por unidad.

El catálogo incorpora **22 vehículos extraídos de publicaciones verificadas de Agenciaflama**, de los que 20 están publicados y 2 quedan en borrador para revisión, con 472 fotografías enlazadas a las galerías originales. Los importes de contado, anticipo y lista son campos separados; no se inventa precio de permuta. Ver [detalle de la importación](web/imports/README.md). La extracción es una captura puntual, sin sincronización automática ni acceso completo al inventario de Mercado Libre: para sumar publicaciones no visibles se necesita una exportación o conexión autorizada. El WhatsApp oficial está configurado; todavía se deben confirmar las direcciones y horarios comerciales de Flama Autos.

## Desarrollo local

Desde la carpeta web:

```bash
npm ci
npm run dev
```

Copiar la plantilla web/.env.example a web/.env.local y completar allí los datos públicos de conexión de Supabase.

Para verificar:

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

## Migraciones

Los archivos de supabase/migrations están destinados exclusivamente a la base Flama Autos. Incluyen el esquema inicial, endurecimiento de permisos, autorización inicial ya consumida, optimización RLS, ordenación segura de fotografías y las migraciones de la importación trazable del inventario de Agenciaflama.

## Antes de usar como sitio comercial definitivo

- Confirmar direcciones, horarios, logo y medios de contacto.
- Revisar periódicamente los precios, las disponibilidades y las fotos de las unidades importadas desde Mercado Libre (captura del 18/10/2026).
- Probar alta y edición de unidades, carga de imágenes e invitación de nuevo personal desde una sesión autorizada.
- Confirmar en Supabase Auth las URL de retorno hacia el sitio en Vercel.
- Recordar que el bucket de fotografías es público: no subir documentos o fotos confidenciales.
- Completar la política de privacidad antes de captar datos personales de compradores.

## Seguridad del inventario y flujo de cambios

- `source_review_note` solo puede modificarse por administradores; el servidor lo verifica mediante un trigger de PostgreSQL. Los editores pueden seguir modificando el resto de la ficha con sus permisos habituales.
- La vista `vehicle_cards` debe conceder únicamente lectura a `anon` y `authenticated`.
- El filtro de sucursales aparece exclusivamente cuando hay unidades publicadas asignadas a ubicaciones confirmadas; no se asignan sucursales automáticamente por proximidad.
- Las extracciones de Mercado Libre en GitHub Actions dejan artefactos revisables y no realizan `push` directo a `main`. Los artefactos requieren revisión e incorporación mediante pull request.
- **Acción del administrador del repositorio:** habilitar protección de rama `main`, exigir PR y estado obligatorio `verify` de «Verificación web», restringir force-push y eliminación. Antes de activar la protección, revisar la configuración de permisos disponible en GitHub.
- **Despliegue de base:** aplicar la migración `202610200001_guard_editor_review_and_catalog_grants.sql` al proyecto exclusivo de Flama Autos antes de considerar efectiva la corrección de permisos. No instalarla en bases ajenas.
