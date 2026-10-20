import { defineConfig, globalIgnores } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import nextPlugin from '@next/eslint-plugin-next';
import hooks from 'eslint-plugin-react-hooks';
import react from 'eslint-plugin-react-x';
import accessibility from 'eslint-plugin-jsx-a11y-x';
import { flatConfigs as importXConfigs } from 'eslint-plugin-import-x';
import globals from 'globals';

export default defineConfig([
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
  {
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  nextPlugin.configs['core-web-vitals'],
  hooks.configs.flat.recommended,
  react.configs.recommended,
  accessibility.configs.recommended,
  importXConfigs.recommended,
  { rules: { 'import-x/no-unresolved': 'off' } },
]);
