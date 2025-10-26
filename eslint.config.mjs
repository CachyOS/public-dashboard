import pluginQuery from '@tanstack/eslint-plugin-query';
import nextVitals from 'eslint-config-next/core-web-vitals';
import perfectionist from 'eslint-plugin-perfectionist';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import {defineConfig} from 'eslint/config';

export default defineConfig([
  ...nextVitals,
  ...pluginQuery.configs['flat/recommended'],
  perfectionist.configs['recommended-natural'],
  eslintPluginPrettierRecommended,
]);
