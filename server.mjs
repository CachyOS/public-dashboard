import {existsSync, statSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

import handler from './dist/server/server.js';

const here = dirname(fileURLToPath(import.meta.url));
const clientDir = resolve(here, 'dist/client');
const port = Number(process.env.PORT ?? 3000);
const hostname = process.env.HOSTNAME ?? '0.0.0.0';

Bun.serve({
  development: false,
  fetch(request) {
    const url = new URL(request.url);
    if (url.pathname !== '/') {
      const filePath = join(clientDir, url.pathname);
      if (filePath.startsWith(clientDir) && existsSync(filePath)) {
        const stats = statSync(filePath);
        if (stats.isFile()) return new Response(Bun.file(filePath));
      }
    }
    return handler.fetch(request);
  },
  hostname,
  port,
});

console.log(`Dashboard listening on http://${hostname}:${port}`);
