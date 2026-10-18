# Importación de publicaciones de Agencia Flama — 18/10/2026

Fuente original: https://www.mercadolibre.com.ar/pagina/agenciaflama

Los avisos se verificaron mediante el identificador de vendedor `117436611`, el estado de publicación y los datos estructurados de cada ficha pública. Se descartaron los anuncios cuyo vendedor no pudo confirmarse o que dejaron de estar disponibles.

## Resultado en Supabase

- 21 vehículos importados en `public.vehicles`.
- 19 vehículos publicados y 2 borradores para revisión.
- 447 referencias originales a fotografías de Mercado Libre en `public.vehicle_images`.
- 21 anticipos; 19 precios de lista verificados; 0 precios expresamente identificados como valor de permuta.
- Precio contado, anticipo, lista y permuta se almacenan en campos distintos; no se extrapola precio de permuta desde el precio de lista.
- Cada unidad conserva el ID original MLA, el enlace de su aviso y la fecha de relevamiento.
- La ficha pública detalla las características extraídas de los atributos y enlaza la publicación de origen.

## Vehículos que necesitan revisión

- `MLA3761008108` — Toyota Hilux: la descripción contiene un año distinto al campo estructurado.
- `MLA3940126512` — Peugeot 208: el precio de lista extraído es ARS 232.000.000 frente a ARS 20.900.000 de contado. El precio de lista no se publicó.

La base impide publicar vehículos con `source_review_note` pendiente; un administrador puede corregir los datos y luego marcar la revisión como resuelta.

## Límites y mantenimiento

Esta es una **captura de datos del 18/10/2026**, no una sincronización continua. Si las publicaciones originales cambian o se venden, se debe actualizar el estado y el precio del vehículo desde la administración.

Las fotografías guardadas son URLs públicas de las galerías de Mercado Libre; **todavía no fueron copiadas a Supabase Storage**. Su disponibilidad futura depende de Mercado Libre.

Los archivos `agenciaflama-extracted.json` y `agenciaflama-additional-extracted.json` contienen la captura verificable y los atributos; los archivos de errores detallan anuncios rechazados. Nunca importar indiscriminadamente resultados de búsqueda por modelo sin verificar el vendedor.

No se incluyeron datos sensibles de cuentas de Mercado Libre y no se necesitó iniciar sesión como propietario.
