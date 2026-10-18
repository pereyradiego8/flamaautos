-- Importación adicional de avisos verificados del vendedor Agenciaflama.
BEGIN;
INSERT INTO public.vehicles(slug,brand,model,version,model_year,mileage_km,category,fuel,transmission,description,currency,cash_price,down_payment,list_price,trade_in_price,status,featured,source_listing_id,source_url,source_checked_at,source_specs,vehicle_condition,source_review_note) VALUES
('ford-territory-2023-mla2106857291','Ford','Territory','1.8 Ecoboost Titanium At',2023,60000,'suv','Nafta','Automática','Ford Territory 1.8 Ecoboost Titanium At, modelo 2023, con 60.000 km según su publicación de Agencia Flama. Combustible: Nafta. Transmisión: Automática. Consultá por WhatsApp la disponibilidad y las condiciones comerciales de esta unidad.','ARS',41900000,16900000,43900000,NULL,'published',false,'MLA2106857291','https://auto.mercadolibre.com.ar/MLA-2106857291-ford-territory-18-ecoboost-titanium-at-_JM','2026-10-18T18:30:59.502883+00:00','{"Marca":"Ford","Modelo":"Territory","Año":"2023","Versión":"1.8 Ecoboost Titanium At","Color":"Azul","Kilómetros":"60.000 km","Tipo de combustible":"Nafta","Puertas":"5","Transmisión":"Automática","Motor":"1.8","Tipo de carrocería":"SUV","Piloto automático":"Sí","Computadora de abordo":"Sí","Comando remoto para radio en el volante":"Sí","Reproductor de MP3":"Sí","Tapizado de cuero":"Sí","Frenos ABS":"Sí","Sensor de estacionamiento":"Sí","Airbag para conductor y pasajero":"Sí","Control de estabilidad":"Sí","Tracción ASR":"Sí","Llantas de aleación":"Sí","Techo solar eléctrico retráctil":"Sí","Control de tracción":"Delantera","Capacidad de personas":"5","Potencia":"185 hp","Distancia entre ejes":"2.726 mm","Capacidad del tanque":"60 L","Válvulas por cilindro":"4","Dirección":"Eléctrica","Alarma":"Sí","Largo x Altura x Ancho":"4630 mm x 1706 mm x 2177 mm"}'::jsonb,'used',NULL),
('ram-rampage-2025-mla3994936646','RAM','Rampage','2.0 Laramie Gme At9 4X4',2025,20000,'pickup','Nafta','Automática','RAM Rampage 2.0 Laramie Gme At9 4X4, modelo 2025, con 20.000 km según su publicación de Agencia Flama. Combustible: Nafta. Transmisión: Automática. Consultá por WhatsApp la disponibilidad y las condiciones comerciales de esta unidad.','ARS',52900000,24900000,55500000,NULL,'published',false,'MLA3994936646','https://auto.mercadolibre.com.ar/MLA-3994936646-ram-rampage-20-laramie-gme-at9-4x4-_JM','2026-10-18T18:31:00.969978+00:00','{"Marca":"RAM","Modelo":"Rampage","Año":"2025","Versión":"2.0 Laramie Gme At9 4X4","Color":"Gris","Kilómetros":"20.000 km","Tipo de combustible":"Nafta","Puertas":"4","Transmisión":"Automática","Motor":"2.0","Tipo de carrocería":"Pick-Up","Control de tracción":"4x4","Capacidad de personas":"5","Potencia":"272 hp","Distancia entre ejes":"2.994 mm","Capacidad del tanque":"55 L","Válvulas por cilindro":"4","Dirección":"Eléctrica","Largo x Altura x Ancho":"5028 mm x 1717 mm x 1886 mm"}'::jsonb,'used',NULL)
ON CONFLICT(slug) DO NOTHING;
INSERT INTO public.vehicle_images(vehicle_id,storage_path,alt_text,sort_order)
SELECT v.id,p.path,p.alt_text,p.sort_order FROM public.vehicles v
JOIN (VALUES
('MLA2106857291','https://http2.mlstatic.com/D_NQ_NP_862443-MLA117917034949_092026-F.webp','Imagen 1 de 25 de Ford Territory 1.8 Ecoboost Titanium At',0),
('MLA2106857291','https://http2.mlstatic.com/D_NQ_NP_846685-MLA117968251657_092026-F.webp','Imagen 2 de 25 de Ford Territory 1.8 Ecoboost Titanium At',1),
('MLA2106857291','https://http2.mlstatic.com/D_NQ_NP_888936-MLA116416216206_092026-F.webp','Imagen 3 de 25 de Ford Territory 1.8 Ecoboost Titanium At',2),
('MLA2106857291','https://http2.mlstatic.com/D_NQ_NP_747650-MLA116415869698_092026-F.webp','Imagen 4 de 25 de Ford Territory 1.8 Ecoboost Titanium At',3),
('MLA2106857291','https://http2.mlstatic.com/D_NQ_NP_886082-MLA117915856045_092026-F.webp','Imagen 5 de 25 de Ford Territory 1.8 Ecoboost Titanium At',4),
('MLA2106857291','https://http2.mlstatic.com/D_NQ_NP_978502-MLA116415252292_092026-F.webp','Imagen 6 de 25 de Ford Territory 1.8 Ecoboost Titanium At',5),
('MLA2106857291','https://http2.mlstatic.com/D_NQ_NP_801150-MLA116416216250_092026-F.webp','Imagen 7 de 25 de Ford Territory 1.8 Ecoboost Titanium At',6),
('MLA2106857291','https://http2.mlstatic.com/D_NQ_NP_628402-MLA117916500621_092026-F.webp','Imagen 8 de 25 de Ford Territory 1.8 Ecoboost Titanium At',7),
('MLA2106857291','https://http2.mlstatic.com/D_NQ_NP_819182-MLA116416216264_092026-F.webp','Imagen 9 de 25 de Ford Territory 1.8 Ecoboost Titanium At',8),
('MLA2106857291','https://http2.mlstatic.com/D_NQ_NP_834719-MLA116416216280_092026-F.webp','Imagen 10 de 25 de Ford Territory 1.8 Ecoboost Titanium At',9),
('MLA2106857291','https://http2.mlstatic.com/D_NQ_NP_680224-MLA116416216282_092026-F.webp','Imagen 11 de 25 de Ford Territory 1.8 Ecoboost Titanium At',10),
('MLA2106857291','https://http2.mlstatic.com/D_NQ_NP_761357-MLA117916736551_092026-F.webp','Imagen 12 de 25 de Ford Territory 1.8 Ecoboost Titanium At',11),
('MLA2106857291','https://http2.mlstatic.com/D_NQ_NP_862082-MLA116415869752_092026-F.webp','Imagen 13 de 25 de Ford Territory 1.8 Ecoboost Titanium At',12),
('MLA2106857291','https://http2.mlstatic.com/D_NQ_NP_604569-MLA117916236343_092026-F.webp','Imagen 14 de 25 de Ford Territory 1.8 Ecoboost Titanium At',13),
('MLA2106857291','https://http2.mlstatic.com/D_NQ_NP_966941-MLA116415869754_092026-F.webp','Imagen 15 de 25 de Ford Territory 1.8 Ecoboost Titanium At',14),
('MLA2106857291','https://http2.mlstatic.com/D_NQ_NP_898059-MLA117915944521_092026-F.webp','Imagen 16 de 25 de Ford Territory 1.8 Ecoboost Titanium At',15),
('MLA2106857291','https://http2.mlstatic.com/D_NQ_NP_899915-MLA116415869780_092026-F.webp','Imagen 17 de 25 de Ford Territory 1.8 Ecoboost Titanium At',16),
('MLA2106857291','https://http2.mlstatic.com/D_NQ_NP_867750-MLA116415869788_092026-F.webp','Imagen 18 de 25 de Ford Territory 1.8 Ecoboost Titanium At',17),
('MLA2106857291','https://http2.mlstatic.com/D_NQ_NP_752026-MLA116416216362_092026-F.webp','Imagen 19 de 25 de Ford Territory 1.8 Ecoboost Titanium At',18),
('MLA2106857291','https://http2.mlstatic.com/D_NQ_NP_873417-MLA117915856139_092026-F.webp','Imagen 20 de 25 de Ford Territory 1.8 Ecoboost Titanium At',19),
('MLA2106857291','https://http2.mlstatic.com/D_NQ_NP_916028-MLA117916236379_092026-F.webp','Imagen 21 de 25 de Ford Territory 1.8 Ecoboost Titanium At',20),
('MLA2106857291','https://http2.mlstatic.com/D_NQ_NP_656330-MLA117916855151_092026-F.webp','Imagen 22 de 25 de Ford Territory 1.8 Ecoboost Titanium At',21),
('MLA2106857291','https://http2.mlstatic.com/D_NQ_NP_776902-MLA117916736613_092026-F.webp','Imagen 23 de 25 de Ford Territory 1.8 Ecoboost Titanium At',22),
('MLA2106857291','https://http2.mlstatic.com/D_NQ_NP_980882-MLA117916500723_092026-F.webp','Imagen 24 de 25 de Ford Territory 1.8 Ecoboost Titanium At',23),
('MLA2106857291','https://http2.mlstatic.com/D_NQ_NP_719660-MLA116428378198_092026-F.webp','Imagen 25 de 25 de Ford Territory 1.8 Ecoboost Titanium At',24),
('MLA3994936646','https://http2.mlstatic.com/D_NQ_NP_891382-MLA116757361672_092026-F.webp','Imagen 1 de 25 de Ram Rampage 2.0 Laramie Gme At9 4x4',0),
('MLA3994936646','https://http2.mlstatic.com/D_NQ_NP_673018-MLA116861744594_092026-F.webp','Imagen 2 de 25 de Ram Rampage 2.0 Laramie Gme At9 4x4',1),
('MLA3994936646','https://http2.mlstatic.com/D_NQ_NP_645659-MLA118250801133_092026-F.webp','Imagen 3 de 25 de Ram Rampage 2.0 Laramie Gme At9 4x4',2),
('MLA3994936646','https://http2.mlstatic.com/D_NQ_NP_927167-MLA116702468082_092026-F.webp','Imagen 4 de 25 de Ram Rampage 2.0 Laramie Gme At9 4x4',3),
('MLA3994936646','https://http2.mlstatic.com/D_NQ_NP_934273-MLA116702380240_092026-F.webp','Imagen 5 de 25 de Ram Rampage 2.0 Laramie Gme At9 4x4',4),
('MLA3994936646','https://http2.mlstatic.com/D_NQ_NP_889000-MLA118250801165_092026-F.webp','Imagen 6 de 25 de Ram Rampage 2.0 Laramie Gme At9 4x4',5),
('MLA3994936646','https://http2.mlstatic.com/D_NQ_NP_835282-MLA116702615204_092026-F.webp','Imagen 7 de 25 de Ram Rampage 2.0 Laramie Gme At9 4x4',6),
('MLA3994936646','https://http2.mlstatic.com/D_NQ_NP_639763-MLA116702468112_092026-F.webp','Imagen 8 de 25 de Ram Rampage 2.0 Laramie Gme At9 4x4',7),
('MLA3994936646','https://http2.mlstatic.com/D_NQ_NP_891203-MLA116703171994_092026-F.webp','Imagen 9 de 25 de Ram Rampage 2.0 Laramie Gme At9 4x4',8),
('MLA3994936646','https://http2.mlstatic.com/D_NQ_NP_708373-MLA118250421323_092026-F.webp','Imagen 10 de 25 de Ram Rampage 2.0 Laramie Gme At9 4x4',9),
('MLA3994936646','https://http2.mlstatic.com/D_NQ_NP_775814-MLA118250567069_092026-F.webp','Imagen 11 de 25 de Ram Rampage 2.0 Laramie Gme At9 4x4',10),
('MLA3994936646','https://http2.mlstatic.com/D_NQ_NP_861894-MLA116702731882_092026-F.webp','Imagen 12 de 25 de Ram Rampage 2.0 Laramie Gme At9 4x4',11),
('MLA3994936646','https://http2.mlstatic.com/D_NQ_NP_763464-MLA116703112620_092026-F.webp','Imagen 13 de 25 de Ram Rampage 2.0 Laramie Gme At9 4x4',12),
('MLA3994936646','https://http2.mlstatic.com/D_NQ_NP_772625-MLA116702410038_092026-F.webp','Imagen 14 de 25 de Ram Rampage 2.0 Laramie Gme At9 4x4',13),
('MLA3994936646','https://http2.mlstatic.com/D_NQ_NP_700253-MLA116702410062_092026-F.webp','Imagen 15 de 25 de Ram Rampage 2.0 Laramie Gme At9 4x4',14),
('MLA3994936646','https://http2.mlstatic.com/D_NQ_NP_752728-MLA116702468204_092026-F.webp','Imagen 16 de 25 de Ram Rampage 2.0 Laramie Gme At9 4x4',15),
('MLA3994936646','https://http2.mlstatic.com/D_NQ_NP_655701-MLA116703172074_092026-F.webp','Imagen 17 de 25 de Ram Rampage 2.0 Laramie Gme At9 4x4',16),
('MLA3994936646','https://http2.mlstatic.com/D_NQ_NP_864268-MLA116702790480_092026-F.webp','Imagen 18 de 25 de Ram Rampage 2.0 Laramie Gme At9 4x4',17),
('MLA3994936646','https://http2.mlstatic.com/D_NQ_NP_997952-MLA116702615324_092026-F.webp','Imagen 19 de 25 de Ram Rampage 2.0 Laramie Gme At9 4x4',18),
('MLA3994936646','https://http2.mlstatic.com/D_NQ_NP_900365-MLA116702380412_092026-F.webp','Imagen 20 de 25 de Ram Rampage 2.0 Laramie Gme At9 4x4',19),
('MLA3994936646','https://http2.mlstatic.com/D_NQ_NP_746968-MLA118250421441_092026-F.webp','Imagen 21 de 25 de Ram Rampage 2.0 Laramie Gme At9 4x4',20),
('MLA3994936646','https://http2.mlstatic.com/D_NQ_NP_825652-MLA116702497960_092026-F.webp','Imagen 22 de 25 de Ram Rampage 2.0 Laramie Gme At9 4x4',21),
('MLA3994936646','https://http2.mlstatic.com/D_NQ_NP_888113-MLA116702380440_092026-F.webp','Imagen 23 de 25 de Ram Rampage 2.0 Laramie Gme At9 4x4',22),
('MLA3994936646','https://http2.mlstatic.com/D_NQ_NP_716591-MLA118250772569_092026-F.webp','Imagen 24 de 25 de Ram Rampage 2.0 Laramie Gme At9 4x4',23),
('MLA3994936646','https://http2.mlstatic.com/D_NQ_NP_921250-MLA118250304053_092026-F.webp','Imagen 25 de 25 de Ram Rampage 2.0 Laramie Gme At9 4x4',24)
) AS p(source_listing_id,path,alt_text,sort_order) ON p.source_listing_id=v.source_listing_id
ON CONFLICT(storage_path) DO NOTHING;
COMMIT;
