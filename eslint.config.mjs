import pluginQuery from '@tanstack/eslint-plugin-query';
import perfectionist from 'eslint-plugin-perfectionist';
import pluginReact from 'eslint-plugin-react';
import {defineConfig} from 'eslint/config';

export default defineConfig([
  {
    ignores: ['**/dist/**', '**/.output/**'],
  },
  {
    plugins: {
      react: pluginReact,
    },
    rules: {
      'react/display-name': 'warn',
      'react/no-deprecated': 'error',
      'react/no-direct-mutation-state': 'error',
      'react/no-find-dom-node': 'error',
      'react/no-is-mounted': 'error',
      'react/no-string-refs': 'error',
    },
    settings: {
      react: {version: 'detect'},
    },
  },
  ...pluginQuery.configs['flat/recommended'],
  perfectionist.configs['recommended-natural'],
]);
