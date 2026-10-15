import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const sql=readFileSync(new URL('../../supabase/migrations/202610140001_initial.sql',import.meta.url),'utf8');
test('migración inicial cuenta con RLS en tablas públicas',()=>{
 for(const name of ['branches','vehicles','vehicle_images','staff','vehicle_audit']){
  assert.ok(sql.includes(`ALTER TABLE public.${name} ENABLE ROW LEVEL SECURITY`),name);
 }
});
test('las fotos solo permiten escrituras al personal autenticado',()=>{
 assert.ok(sql.includes('vehicle_images_staff_insert ON storage.objects FOR INSERT TO authenticated'));
 assert.ok(sql.includes('vehicle_images_staff_delete ON storage.objects FOR DELETE TO authenticated'));
});
test('los vehículos publicados tienen mínimos técnicos',()=>{
 assert.ok(sql.includes('published_minimum_fields'));
 assert.ok(sql.includes('vehicles_public_read'));
});
