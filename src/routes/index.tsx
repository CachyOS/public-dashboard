import {createFileRoute} from '@tanstack/react-router';
import {z} from 'zod';

import PackageSearch from '@/components/PackageSearch';
import {SiteCardHeader} from '@/components/SiteCardHeader';
import {Card, CardContent} from '@/components/ui/card';
import {searchQueryFn} from '@/lib/query-actions';
import {PAGE_SIZE, type PackagesSearchQueryParams} from '@/lib/types';

const SearchParamsSchema = z.object({
  arch: z.string().optional(),
  current_page: z.coerce.number().int().positive().optional(),
  page_size: z.union(PAGE_SIZE.map(size => z.literal(size))).optional(),
  repo: z.string().optional(),
  search: z.string().optional(),
});

type SearchParams = z.infer<typeof SearchParamsSchema>;

function toQueryParams(search: SearchParams): PackagesSearchQueryParams {
  return {
    arch: search.arch ?? '',
    current_page: search.current_page ?? 1,
    page_size: search.page_size ?? PAGE_SIZE[0],
    repo: search.repo ?? '',
    search: search.search ?? '',
  };
}

export const Route = createFileRoute('/')({
  component: HomePage,
  head: () => ({meta: [{title: 'CachyOS | Package Search'}]}),
  loader: ({context: {queryClient}, deps}) => {
    const params = toQueryParams(deps as SearchParams);
    return queryClient.prefetchQuery({
      queryFn: searchQueryFn(params),
      queryKey: ['search', params],
    });
  },
  loaderDeps: ({search}): SearchParams => search,
  validateSearch: SearchParamsSchema,
});

function HomePage() {
  return (
    <main className="container mx-auto p-2 sm:p-4 md:p-8">
      <Card>
        <SiteCardHeader
          description="Find packages across all CachyOS repositories."
          navTarget="mirrors"
          title="CachyOS Package Repository Search"
        />
        <CardContent>
          <PackageSearch />
        </CardContent>
      </Card>
    </main>
  );
}
