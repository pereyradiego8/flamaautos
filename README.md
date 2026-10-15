# Flama Autos · Web independiente (v0.3)

Aplicación Next.js 15 + React 19 + Supabase **independiente** de 3020 Automotores. Diseño oscuro con acentos rojos **provisional**. No se importan datos, claves, imágenes ni vehículos de 3020.

## Estado del proyecto (15/10/2026)

| Módulo | Estado |
|---|---|
| Home responsive, categorías, sucursales, contacto | Implementado en código |
| Catálogo público de vehículos publicados | Implementado, requiere Supabase independiente |
| Ficha por vehículo + SEO dinámico | Implementado, requiere datos |
| Filtros por categoría, sucursal y búsqueda | Implementado |
| Ordenamiento por ARS/USD con cotización blue venta verificada | Implementado con control de cotización no disponible |
| Panel privado de personal (Auth email + contraseña) | Implementado, requiere alta de personal y DB |
| Alta/edición de vehículos, estados, fotos, precios y permuta | Implementado, requiere DB/Storage |
| Políticas RLS, roles y auditoría | SQL preparado, **sin ejecutar** |
| Proyecto GitHub propio | `pereyradiego8/flamaautos` (conectado; pendiente de verificaciones CI) |
| Proyecto Supabase nuevo | **No creado** al generar este paquete |
| Vercel | **No desplegado** |

**Advertencia:** la implementación necesita pruebas integradas reales contra Supabase antes de considerarse productiva. El diseño y las direcciones deben ser confirmados con el concesionario. No se incluyen precios ni fotografías de stock ficticio.

## Ejecución local

Necesitás Node.js LTS y npm. En Windows, abrí PowerShell:

```powershell
cd flamaautos\web
npm install
Copy-Item .env.example .env.local
npm run dev
```

Abrí `http://localhost:3000`. Sin las variables de Supabase se muestra una web de presentación con catálogo vacío y el panel informa que falta configurar la base.

Para pruebas y producción:

```bash
cd web
npm test
npm run typecheck
npm run lint
npm run build
```

En este entorno de generación **solo se ejecutó `npm test`**. La descarga de dependencias expiró, por lo que **no se ejecutaron** `npm run typecheck`, `lint` ni `build`; no confundir las pruebas unitarias con un build de producción validado. Al instalar dependencias correctamente, generar y **versionar un package-lock.json real** y pasar CI antes de desplegar.

## GitHub: repositorio independiente

Código fuente alojado en https://github.com/pereyradiego8/flamaautos, rama `main`.
La publicación de esta versión **no crea ni modifica** el repositorio de 3020 Automotores.
El repositorio se creó inicialmente público: revisá si preferís cambiarlo a privado.

## Supabase: proyecto dedicado

**No usar nunca `zoncelsnskpuninitier`**, que pertenece al proyecto 3020 Automotores.

1. Crear `flama-autos` en una organización elegida por el titular, con costos confirmados antes de crear el proyecto.
2. En el proyecto NUEVO, ejecutar una única vez `supabase/migrations/202610140001_initial.sql` y revisar el resultado. **No se ejecutó** aún.
3. En Supabase Auth, crear manualmente un usuario personal (correo confirmado); luego dar rol admin mediante SQL Editor (sustituí el UUID por el ID de Auth del usuario creado):

```sql
insert into public.staff(user_id,role)
values ('UUID_DEL_USUARIO_DE_AUTH', 'admin');
```

4. En el nuevo panel de Supabase, copiar `Project URL` y la **Publishable key** y completar `web/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://NUEVO-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

No guardar contraseñas ni `sb_secret_` / `service_role` en GitHub, `NEXT_PUBLIC_*`, navegador o chats. El frontend utiliza exclusivamente la publishable key con RLS.

5. Corroborar que las tablas aparecen en Data API (si está restringida la exposición, habilitar explícitamente las tablas necesarias). Probar los cuatro casos: visitante puede ver publicados, visitante no ve borradores, personal puede guardar cambios, no autorizado no puede modificar datos.
6. Storage: bucket `vehicle-images` público para fotografías comerciales. **No subir material confidencial**, ya que cualquier persona con la URL conoce la imagen aunque su ficha quede como borrador.

## Vercel

Crear proyecto **nuevo** desde `pereyradiego8/flamaautos`, configurar:

- Root Directory: `web`
- Framework: Next.js
- Variables Production/Preview: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL`: URL pública real una vez asignada (para sitemap/canonical en una futura mejora)

Desplegar cuando `npm run build` funcione y la migración esté aplicada en el proyecto Supabase independiente. Para una prueba técnica: `GET /api/health`, que informa solo si hay configuración, **no** comprueba conexión real a la DB.

## Guía operativa

- `/autos`: lista únicamente unidades `published`; filtros por marca/modelo/versión, categoría, sucursal, año y precios.
- Orden ARS/USD: consume el precio de **venta** de `https://dolarapi.com/v1/dolares/blue`, cacheado una hora, y rechaza cotizaciones de más de cuatro días. Sin cotización válida advierte que el orden mixto **no es comparable**.
- `/autos/[slug]`: ficha individual de una unidad publicada; faltantes dicen “Consultar”, nunca se inventan especificaciones.
- `/admin`: ingreso del personal con Supabase Auth. Solo miembros de `public.staff` pueden administrar por políticas RLS.
- Estados: borrador, publicado, reservado y vendido; los últimos dos se retiran del catálogo público.
- Fotos: máximo 12 por operación, JPG/PNG/WebP de hasta 5 MB cada una.
- Las acciones de editar y cambiar estado están diseñadas para preservar el desplazamiento actual de la lista; no hay redirección al inicio.
- Los botones de consulta remiten temporalmente a `https://linktr.ee/flamaautos` hasta tener un WhatsApp oficial confirmado (no se toma el de 3020).

## Seguridad antes de entregar al cliente

1. Verificar SQL y políticas RLS en el proyecto real con un usuario staff y otro no autorizado.
2. Comprobar que los roles no se asignan vía `raw_user_meta_data` y que nadie inserta en `public.staff` desde cliente.
3. Confirmar backup/recuperación y política de borrado de imágenes huérfanas.
4. Ejecutar pruebas integradas de publicación/borrador/reserva, subidas de fotos y concurrencia.
5. Generar package-lock real y verificar `npm audit`, TypeScript, ESLint y build.
6. Confirmar logotipo oficial, textos comerciales, direcciones, teléfonos, horarios y autorización de uso de imágenes.
7. Configurar recuperación segura de contraseña, rate limits y política de privacidad antes de captar consultas.

**Referencias técnicas:** https://supabase.com/docs/guides/storage/security/access-control · https://supabase.com/docs/guides/auth/server-side · https://nextjs.org/docs
