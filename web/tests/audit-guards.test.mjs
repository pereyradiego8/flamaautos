import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const migration=readFileSync(new URL('../../supabase/migrations/202610190001_public_catalog_cards.sql',import.meta.url),'utf8');
const vehicles=readFileSync(new URL('../src/lib/vehicles.ts',import.meta.url),'utf8');
const config=readFileSync(new URL('../next.config.ts',import.meta.url),'utf8');

test('la vista compacta está protegida con SECURITY INVOKER',()=>{
 assert.match(migration,/security_invoker\s*=\s*true/i);
 assert.match(migration,/REVOKE ALL ON public\.vehicle_cards FROM PUBLIC;/);
 assert.match(migration,/GRANT SELECT ON public\.vehicle_cards TO anon, authenticated;/);
 assert.match(migration,/WHERE v\.status = 'published'/);
});
test('cada tarjeta transporta una sola portada, sin descripciones ni galería completa',()=>{
 assert.match(migration,/LEFT JOIN LATERAL/);
 assert.match(migration,/LIMIT 1/);
 assert.doesNotMatch(migration,/v\.description/);
 assert.doesNotMatch(migration,/v\.source_specs/);
 assert.match(vehicles,/from\('vehicle_cards'\)/);
});
test('CSP protege contra iframes y restringe orígenes de imágenes y API',()=>{
 assert.match(config,/Content-Security-Policy/);
 assert.match(config,/frame-ancestors 'none'/);
 assert.match(config,/object-src 'none'/);
 assert.match(config,/http2\.mlstatic\.com/);
 assert.match(config,/kldsrenndnyttvfuoauf\.supabase\.co/);
});
