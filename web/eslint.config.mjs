import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

// Next.js 16 publica configuraciones planas; FlatCompat provoca referencias circulares.
export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
]);
