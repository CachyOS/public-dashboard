import {FlatCompat} from '@eslint/eslintrc';
import perfectionist from 'eslint-plugin-perfectionist';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import {dirname} from 'path';
import {fileURLToPath} from 'url';

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  perfectionist.configs['recommended-natural'],
  eslintPluginPrettierRecommended,
];

export default eslintConfig;
