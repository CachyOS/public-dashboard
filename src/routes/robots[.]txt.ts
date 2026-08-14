import {createFileRoute} from '@tanstack/react-router';

import {SITE_ORIGIN} from '@/lib/site';

const ROBOTS_BODY = `User-agent: *
Allow: /

Sitemap: ${SITE_ORIGIN}/sitemap.xml
`;

export const Route = createFileRoute('/robots.txt')({
  server: {
    handlers: {
      GET: () =>
        new Response(ROBOTS_BODY, {
          headers: {
            'cache-control': 'public, max-age=3600',
            'content-type': 'text/plain; charset=utf-8',
          },
        }),
    },
  },
});
