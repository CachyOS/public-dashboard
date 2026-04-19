import pluginQuery from '@tanstack/eslint-plugin-query';
import {defineConfig} from 'eslint/config';

export default defineConfig([...pluginQuery.configs['flat/recommended']]);
