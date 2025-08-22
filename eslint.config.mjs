import {FlatCompat} from '@eslint/eslintrc';
import pluginQuery from '@tanstack/eslint-plugin-query';
import perfectionist from 'eslint-plugin-perfectionist';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import {dirname} from 'path';
import {fileURLToPath} from 'url';

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
});

const eslintConfig = [
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
    ],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  ...pluginQuery.configs['flat/recommended'],
  perfectionist.configs['recommended-natural'],
  eslintPluginPrettierRecommended,
];

export default eslintConfig;
