import {createFileRoute, stripSearchParams} from '@tanstack/react-router';
import {z} from 'zod';

import PackageSearch from '@/components/PackageSearch';
import {SiteCardHeader} from '@/components/SiteCardHeader';
import {Card, CardContent} from '@/components/ui/card';
import {searchQueryFn} from '@/lib/query-actions';
import {PAGE_SIZE, type PackagesSearchQueryParams} from '@/lib/types';

const defaultValues = {
  arch: '',
  current_page: 1,
  page_size: PAGE_SIZE[0],
  repo: '',
  search: '',
};

const SearchParamsSchema = z.object({
  arch: z.string().catch(defaultValues.arch),
  current_page: z.number().int().positive().catch(defaultValues.current_page),
  page_size: z
    .union(PAGE_SIZE.map(size => z.literal(size)))
    .catch(defaultValues.page_size),
  repo: z.string().catch(defaultValues.repo),
  search: z.string().catch(defaultValues.search),
});

type SearchParams = z.infer<typeof SearchParamsSchema>;

function toQueryParams(search: SearchParams): PackagesSearchQueryParams {
  return {
    arch: search.arch,
    current_page: search.current_page,
    page_size: search.page_size,
    repo: search.repo,
    search: search.search,
  };
}

export const Route = createFileRoute('/')({
  component: HomePage,
  head: () => ({meta: [{title: 'CachyOS | Package Search'}]}),
  loader: ({context: {queryClient}, deps}) => {
    // TODO: Figure out why deps is '{}' type
    const params = toQueryParams(deps as SearchParams);
    return queryClient.prefetchQuery({
      queryFn: searchQueryFn(params),
      queryKey: ['search', params],
    });
  },
  loaderDeps: ({search}) => search,
  validateSearch: SearchParamsSchema,
  search: {
    middlewares: [stripSearchParams(defaultValues)],
  },
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
