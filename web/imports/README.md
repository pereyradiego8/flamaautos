# Importación de publicaciones de Agencia Flama — 18/10/2026

Fuente original: https://www.mercadolibre.com.ar/pagina/agenciaflama

Los avisos se verificaron mediante el identificador de vendedor `117436611`, el estado de publicación y los datos estructurados de cada ficha pública. Se descartaron los anuncios cuyo vendedor no pudo confirmarse o que dejaron de estar disponibles.

## Resultado en Supabase

- **22 vehículos** importados en `public.vehicles`.
- **20 vehículos publicados y 2 borradores** pendientes de revisión.
- **472 fotografías referenciadas** desde las galerías originales de Mercado Libre.
- 22 anticipos, 20 precios de lista y 0 importes explícitos verificables de permuta.
- Precio contado, anticipo, lista y permuta se almacenan en campos distintos; no se extrapola precio de permuta desde el precio de lista.
- Cada unidad conserva el ID original MLA, el enlace de su aviso y la fecha de relevamiento.
- La ficha pública detalla las características extraídas de los atributos y enlaza la publicación de origen.

## Ampliación y última auditoría — 18/10/2026

- Se sumó **Dodge Journey SXT 2017** (MLA3917054036), con ARS 25.900.000 de contado, ARS 11.900.000 de anticipo, ARS 27.200.000 de lista y 25 fotografías originales.
- La cantidad de plazas del aviso es contradictoria (descripción: 7; atributo estructurado: 5). El dato contradictorio no se muestra como confirmado y la ficha pública advierte que debe consultarse con la agencia.
- Se examinaron **91 identificadores de avisos**: 21 que ya estaban cargados, 1 nueva publicación activa verificada y 69 rechazados por cierre, vendedor diferente o inaccesibilidad.
- Evidencias: `agenciaflama-missing-extracted.json` y `agenciaflama-missing-discovery.json`. La nueva ficha se incorporó mediante `2026101800106_agenciaflama_missing_journey.sql`.
- El importador identifica explícitamente publicaciones cerradas del vendedor, en lugar de confundirlas con publicaciones ajenas.
- **La búsqueda no garantiza cubrir todas las publicaciones.** El listado completo de la tienda requiere verificación de cuenta al consultarlo sin sesión; para añadir cualquier otro aviso es necesaria una exportación de publicaciones/IDs o una conexión autorizada a la API oficial de Mercado Libre.

## Vehículos que necesitan revisión

- `MLA3761008108` — Toyota Hilux: la descripción contiene un año distinto al campo estructurado.
- `MLA3940126512` — Peugeot 208: el precio de lista extraído es ARS 232.000.000 frente a ARS 20.900.000 de contado. El precio de lista no se publicó.

La base impide publicar vehículos con `source_review_note` pendiente; un administrador puede corregir los datos y luego marcar la revisión como resuelta.

## Límites y mantenimiento

Esta es una **captura de datos del 18/10/2026**, no una sincronización continua. Si las publicaciones originales cambian o se venden, se debe actualizar el estado y el precio del vehículo desde la administración.

Las fotografías guardadas son URLs públicas de las galerías de Mercado Libre; **todavía no fueron copiadas a Supabase Storage**. Su disponibilidad futura depende de Mercado Libre.

Los archivos `agenciaflama-extracted.json` y `agenciaflama-additional-extracted.json` contienen la captura verificable y los atributos; los archivos de errores detallan anuncios rechazados. Nunca importar indiscriminadamente resultados de búsqueda por modelo sin verificar el vendedor.

No se incluyeron datos sensibles de cuentas de Mercado Libre y no se necesitó iniciar sesión como propietario.
