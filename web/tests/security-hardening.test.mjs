import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const migration=readFileSync(new URL('../../supabase/migrations/202610200001_guard_editor_review_and_catalog_grants.sql',import.meta.url),'utf8');
const workflows=[
 'mercadolibre-collect.yml','mercadolibre-extra-collect.yml','mercadolibre-missing-discovery.yml'
];

test('el permiso de aprobar la importación se valida con trigger en el servidor',()=>{
 assert.match(migration,/BEFORE UPDATE OF source_review_note ON public\.vehicles/);
 assert.match(migration,/OLD\.source_review_note IS DISTINCT FROM NEW\.source_review_note/);
 assert.match(migration,/private\.is_admin\(\)/);
 assert.match(migration,/ERRCODE = '42501'/);
 assert.match(migration,/SECURITY INVOKER/);
});

test('la vista pública concede únicamente permiso de lectura',()=>{
 assert.match(migration,/REVOKE ALL PRIVILEGES ON TABLE public\.vehicle_cards FROM PUBLIC, anon, authenticated/);
 assert.match(migration,/GRANT SELECT ON TABLE public\.vehicle_cards TO anon, authenticated/);
});

test('las extracciones guardan artefactos, sin credenciales de escritura ni push a main',()=>{
 for(const workflow of workflows){
  const yaml=readFileSync(new URL(`../../.github/workflows/${workflow}`,import.meta.url),'utf8');
  assert.match(yaml,/contents: read/);
  assert.match(yaml,/persist-credentials: false/);
  assert.match(yaml,/actions\/upload-artifact@v4/);
  assert.doesNotMatch(yaml,/git push|contents: write/);
 }
});
