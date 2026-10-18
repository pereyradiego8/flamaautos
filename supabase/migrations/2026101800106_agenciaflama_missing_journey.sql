-- Importación revisada: Dodge Journey de Agencia Flama (vendedor 117436611).
-- Fuente pública confirmada activa. Asientos ambiguos: se excluye el dato contradictorio,
-- se informa al comprador en descripción y se mantiene el archivo fuente para auditoría.
BEGIN;
INSERT INTO public.vehicles(slug,brand,model,version,model_year,mileage_km,category,fuel,transmission,description,currency,cash_price,down_payment,list_price,trade_in_price,status,featured,source_listing_id,source_url,source_checked_at,source_specs,vehicle_condition,source_review_note)
VALUES ('dodge-journey-2017-mla3917054036','Dodge','Journey','2.4 Sxt 170cv (techo, Dvd, Nav)',2017,70000,'suv','Nafta','Automática','Dodge Journey SXT 2.4, modelo 2017, con 70.000 km informados en la publicación oficial de Agencia Flama. Motor naftero 2.4 de 170 CV, caja automática y tracción 4x2. El aviso detalla color negro, aire acondicionado, control de velocidad crucero, frenos ABS, airbags, control de estabilidad, computadora de a bordo, sensores de lluvia, Bluetooth, DVD, llantas de aleación y comandos de audio al volante. El vendedor menciona techo y navegación, así como servicios realizados y neumáticos recientes; solicitá confirmar el equipamiento y su estado. La publicación contiene datos distintos sobre la cantidad de asientos, por lo que las plazas deben confirmarse con la agencia. Disponibilidad y condiciones comerciales sujetas a confirmación.','ARS',25900000,11900000,27200000,NULL,'published',false,'MLA3917054036','https://auto.mercadolibre.com.ar/MLA-3917054036-dodge-journey-24-sxt-170cv-techo-dvd-nav-_JM','2026-10-18T20:54:29.060932+00:00','{"Marca":"Dodge","Modelo":"Journey","Año":"2017","Versión":"2.4 Sxt 170cv (techo, Dvd, Nav)","Color":"Negro","Kilómetros":"70.000 km","Tipo de combustible":"Nafta","Puertas":"5","Transmisión":"Automática","Motor":"2.4","Tipo de carrocería":"SUV","Piloto automático":"Sí","Aire acondicionado":"Sí","Computadora de abordo":"Sí","Sensor de lluvia":"Sí","Comando remoto para radio en el volante":"Sí","Porta vasos":"Sí","Largo x Altura x Ancho":"4888 mm x 1691 mm x 1877 mm","Frenos ABS":"Sí","Airbag para conductor y pasajero":"Sí","Control de estabilidad":"Sí","Tracción ASR":"Sí","Llantas de aleación":"Sí","Control de tracción":"4x2","Potencia":"170 hp","Distancia entre ejes":"2.947 mm","Capacidad del tanque":"78 L","Válvulas por cilindro":"4","Dirección":"Hidráulica","Alarma":"Sí","AM/FM":"Sí","Bluetooth":"Sí","DVD":"Sí","Reproductor de MP3":"Sí"}'::jsonb,'used',NULL)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.vehicle_images(vehicle_id,storage_path,alt_text,sort_order)
SELECT v.id, p.storage_path,p.alt_text,p.sort_order
FROM (VALUES
('MLA3917054036','https://http2.mlstatic.com/D_NQ_NP_777526-MLA117313936701_092026-F.webp','Imagen 1 de 25 de Dodge Journey 2.4 Sxt 170cv (techo, Dvd, Nav)',0),
('MLA3917054036','https://http2.mlstatic.com/D_NQ_NP_611902-MLA115851940534_092026-F.webp','Imagen 2 de 25 de Dodge Journey 2.4 Sxt 170cv (techo, Dvd, Nav)',1),
('MLA3917054036','https://http2.mlstatic.com/D_NQ_NP_650436-MLA115786404438_092026-F.webp','Imagen 3 de 25 de Dodge Journey 2.4 Sxt 170cv (techo, Dvd, Nav)',2),
('MLA3917054036','https://http2.mlstatic.com/D_NQ_NP_841777-MLA115786404460_092026-F.webp','Imagen 4 de 25 de Dodge Journey 2.4 Sxt 170cv (techo, Dvd, Nav)',3),
('MLA3917054036','https://http2.mlstatic.com/D_NQ_NP_683832-MLA117242674669_092026-F.webp','Imagen 5 de 25 de Dodge Journey 2.4 Sxt 170cv (techo, Dvd, Nav)',4),
('MLA3917054036','https://http2.mlstatic.com/D_NQ_NP_642665-MLA117242966061_092026-F.webp','Imagen 6 de 25 de Dodge Journey 2.4 Sxt 170cv (techo, Dvd, Nav)',5),
('MLA3917054036','https://http2.mlstatic.com/D_NQ_NP_714020-MLA115786754882_092026-F.webp','Imagen 7 de 25 de Dodge Journey 2.4 Sxt 170cv (techo, Dvd, Nav)',6),
('MLA3917054036','https://http2.mlstatic.com/D_NQ_NP_784396-MLA117242995845_092026-F.webp','Imagen 8 de 25 de Dodge Journey 2.4 Sxt 170cv (techo, Dvd, Nav)',7),
('MLA3917054036','https://http2.mlstatic.com/D_NQ_NP_817163-MLA117242966101_092026-F.webp','Imagen 9 de 25 de Dodge Journey 2.4 Sxt 170cv (techo, Dvd, Nav)',8),
('MLA3917054036','https://http2.mlstatic.com/D_NQ_NP_811946-MLA117241912605_092026-F.webp','Imagen 10 de 25 de Dodge Journey 2.4 Sxt 170cv (techo, Dvd, Nav)',9),
('MLA3917054036','https://http2.mlstatic.com/D_NQ_NP_807124-MLA117242175673_092026-F.webp','Imagen 11 de 25 de Dodge Journey 2.4 Sxt 170cv (techo, Dvd, Nav)',10),
('MLA3917054036','https://http2.mlstatic.com/D_NQ_NP_656905-MLA115786754900_092026-F.webp','Imagen 12 de 25 de Dodge Journey 2.4 Sxt 170cv (techo, Dvd, Nav)',11),
('MLA3917054036','https://http2.mlstatic.com/D_NQ_NP_650895-MLA115786754916_092026-F.webp','Imagen 13 de 25 de Dodge Journey 2.4 Sxt 170cv (techo, Dvd, Nav)',12),
('MLA3917054036','https://http2.mlstatic.com/D_NQ_NP_844121-MLA117241912627_092026-F.webp','Imagen 14 de 25 de Dodge Journey 2.4 Sxt 170cv (techo, Dvd, Nav)',13),
('MLA3917054036','https://http2.mlstatic.com/D_NQ_NP_911066-MLA115786230686_092026-F.webp','Imagen 15 de 25 de Dodge Journey 2.4 Sxt 170cv (techo, Dvd, Nav)',14),
('MLA3917054036','https://http2.mlstatic.com/D_NQ_NP_970759-MLA115786404518_092026-F.webp','Imagen 16 de 25 de Dodge Journey 2.4 Sxt 170cv (techo, Dvd, Nav)',15),
('MLA3917054036','https://http2.mlstatic.com/D_NQ_NP_939504-MLA115786754942_092026-F.webp','Imagen 17 de 25 de Dodge Journey 2.4 Sxt 170cv (techo, Dvd, Nav)',16),
('MLA3917054036','https://http2.mlstatic.com/D_NQ_NP_876738-MLA115786404522_092026-F.webp','Imagen 18 de 25 de Dodge Journey 2.4 Sxt 170cv (techo, Dvd, Nav)',17),
('MLA3917054036','https://http2.mlstatic.com/D_NQ_NP_848604-MLA117242674769_092026-F.webp','Imagen 19 de 25 de Dodge Journey 2.4 Sxt 170cv (techo, Dvd, Nav)',18),
('MLA3917054036','https://http2.mlstatic.com/D_NQ_NP_957338-MLA115785730102_092026-F.webp','Imagen 20 de 25 de Dodge Journey 2.4 Sxt 170cv (techo, Dvd, Nav)',19),
('MLA3917054036','https://http2.mlstatic.com/D_NQ_NP_859125-MLA117242995941_092026-F.webp','Imagen 21 de 25 de Dodge Journey 2.4 Sxt 170cv (techo, Dvd, Nav)',20),
('MLA3917054036','https://http2.mlstatic.com/D_NQ_NP_664828-MLA115786754988_092026-F.webp','Imagen 22 de 25 de Dodge Journey 2.4 Sxt 170cv (techo, Dvd, Nav)',21),
('MLA3917054036','https://http2.mlstatic.com/D_NQ_NP_644975-MLA117241882721_092026-F.webp','Imagen 23 de 25 de Dodge Journey 2.4 Sxt 170cv (techo, Dvd, Nav)',22),
('MLA3917054036','https://http2.mlstatic.com/D_NQ_NP_737314-MLA117242966207_092026-F.webp','Imagen 24 de 25 de Dodge Journey 2.4 Sxt 170cv (techo, Dvd, Nav)',23),
('MLA3917054036','https://http2.mlstatic.com/D_NQ_NP_838734-MLA117242966233_092026-F.webp','Imagen 25 de 25 de Dodge Journey 2.4 Sxt 170cv (techo, Dvd, Nav)',24)
) AS p(source_listing_id,storage_path,alt_text,sort_order)
JOIN public.vehicles v ON v.source_listing_id=p.source_listing_id
ON CONFLICT(storage_path) DO NOTHING;
COMMIT;
