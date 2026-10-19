import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {descriptionParagraphs,equipmentGroups,formatSpecLabel} from '../src/lib/vehicle-details.ts';

test('separar la redacción en párrafos sin perder acentos ni inyectar HTML',()=>{
 const p=descriptionParagraphs('Primer párrafo.\n\nSegundo párrafo con información.\n\nAdvertencia: verificar.');
 assert.deepEqual(p,['Primer párrafo.','Segundo párrafo con información.','Advertencia: verificar.']);
 assert.deepEqual(descriptionParagraphs(null),[]);
});
test('solo destacar equipamiento expresamente marcado como Sí',()=>{
 const groups=equipmentGroups({'Frenos ABS':'Sí','Android auto':'Sí','Techo solar eléctrico retráctil':'No','Alarma':'No'});
 assert.equal(groups.length,2);
 assert.ok(groups[0].items.includes('Frenos ABS'));
 assert.ok(groups[1].items.includes('Android Auto'));
 assert.ok(!groups.some(g=>g.items.some(t=>t.includes('Techo'))));
 assert.deepEqual(equipmentGroups({}),[]);
});
test('se normalizan las etiquetas técnicas con errores frecuentes',()=>{
 assert.equal(formatSpecLabel('Computadora de abordo'),'Computadora de a bordo');
 assert.equal(formatSpecLabel('Android auto'),'Android Auto');
 assert.equal(formatSpecLabel('Control de tracción'),'Tracción');
});
test('la migración cubre exactamente 22 publicaciones y conserva cautelas del vendedor',()=>{
 const sql=readFileSync(new URL('../../supabase/migrations/202610190002_editorial_vehicle_descriptions.sql',import.meta.url),'utf8');
 const ids=[...sql.matchAll(/\('[a-z0-9-]+-mla\d{10}',\s*'/g)].map(m=>m[0]);
 assert.equal(ids.length,22);
 assert.match(sql,/v\.description IS NOT DISTINCT FROM r\.previous_text/);
 assert.match(sql,/datos contradictorios sobre la cantidad de asientos/);
 assert.match(sql,/campo «Año»/);
 assert.match(sql,/no coincide/);
});
