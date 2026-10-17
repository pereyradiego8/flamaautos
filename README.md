# Flama Autos

Sitio independiente en https://flamaautos.vercel.app

Repositorio: https://github.com/pereyradiego8/flamaautos

## Tecnología

Next.js 15, React 19, Supabase y Vercel. Node.js 24 en Vercel y GitHub Actions.

## Estado al 17 de octubre de 2026

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

Actualmente no hay vehículos cargados. Se deben confirmar las direcciones comerciales, el WhatsApp y el logotipo oficial de Flama Autos.

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

Los archivos de supabase/migrations están destinados exclusivamente a la base Flama Autos. Incluyen el esquema inicial, endurecimiento de permisos, autorización inicial ya consumida, optimización RLS y ordenación segura de fotografías.

## Antes de usar como sitio comercial definitivo

- Confirmar direcciones, horarios, logo y medios de contacto.
- Cargar unidades reales con fotos y precios comprobados.
- Probar alta y edición de unidades, carga de imágenes e invitación de nuevo personal desde una sesión autorizada.
- Confirmar en Supabase Auth las URL de retorno hacia el sitio en Vercel.
- Recordar que el bucket de fotografías es público: no subir documentos o fotos confidenciales.
- Completar la política de privacidad antes de captar datos personales de compradores.
