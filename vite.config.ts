import tailwindcss from '@tailwindcss/vite';
import {devtools} from '@tanstack/devtools-vite';
import {tanstackStart} from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import {defineConfig} from 'vite';

import {SITE_ORIGIN} from './src/lib/site';

// Crawlable entry points for sitemap.xml. Package pages are unbounded
const SITEMAP_PAGES = [
  {path: '/', sitemap: {changefreq: 'daily', priority: 1}},
  {path: '/mirrors', sitemap: {changefreq: 'hourly', priority: 0.8}},
] as const;

const config = defineConfig({
  plugins: [
    devtools(),
    tailwindcss(),
    tanstackStart({
      pages: [...SITEMAP_PAGES],
      sitemap: {enabled: true, host: SITE_ORIGIN},
    }),
    viteReact(),
  ],
  resolve: {tsconfigPaths: true},
});

export default config;
