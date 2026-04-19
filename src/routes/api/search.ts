import {createFileRoute} from '@tanstack/react-router';

import {searchPackages} from '@/lib/server/actions';
import {PAGE_SIZE, PackagesSearchQueryParamsSchema} from '@/lib/types';

export const Route = createFileRoute('/api/search')({
  server: {
    handlers: {
      GET: async ({request}) => {
        const url = new URL(request.url);
        const validation = PackagesSearchQueryParamsSchema.safeParse({
          arch: url.searchParams.get('arch') ?? '',
          current_page: Number(url.searchParams.get('current_page')) || 1,
          page_size: Number(url.searchParams.get('page_size')) || PAGE_SIZE[0],
          repo: url.searchParams.getAll('repo').join(','),
          search: url.searchParams.getAll('search').join(','),
        });
        if (!validation.success) {
          return Response.json({error: 'Invalid parameters'}, {status: 400});
        }
        const packages = await searchPackages({data: validation.data});
        if (!packages) {
          return Response.json({error: 'Packages not found'}, {status: 404});
        }
        return Response.json(packages);
      },
    },
  },
});
