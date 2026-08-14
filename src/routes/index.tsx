import {createFileRoute, stripSearchParams} from '@tanstack/react-router';
import {z} from 'zod';

import PackageSearch from '@/components/PackageSearch';
import {PageMain} from '@/components/PageMain';
import {SiteCardHeader} from '@/components/SiteCardHeader';
import {Card, CardContent} from '@/components/ui/card';
import {searchQueryFn} from '@/lib/query-actions';
import {pageHead, SITE_DESCRIPTION} from '@/lib/site';
import {PAGE_SIZE, type PackagesSearchQueryParams} from '@/lib/types';

const SearchParamsSchema = z.object({
  arch: z.string().optional(),
  current_page: z.number().int().positive().optional(),
  page_size: z.union(PAGE_SIZE.map(size => z.literal(size))).optional(),
  repo: z.string().optional(),
  search: z.string().optional(),
});

type SearchParams = z.infer<typeof SearchParamsSchema>;

const defaultValues = {
  arch: '',
  current_page: 1,
  page_size: PAGE_SIZE[0],
  repo: '',
  search: '',
};

function toQueryParams(search: SearchParams): PackagesSearchQueryParams {
  return {
    ...defaultValues,
    ...search,
  };
}

export const Route = createFileRoute('/')({
  component: HomePage,
  validateSearch: SearchParamsSchema,
  search: {
    middlewares: [stripSearchParams(defaultValues)],
  },
  loaderDeps: ({search}) => toQueryParams(search),
  loader: ({context: {queryClient}, deps}) => {
    queryClient.prefetchQuery({
      queryFn: searchQueryFn(deps),
      queryKey: ['search', deps],
      staleTime: 60_000,
    });
  },
  head: ({match}) =>
    pageHead({
      description: SITE_DESCRIPTION,
      path: '/',
      robots:
        Object.keys(match.search).length > 0 ? 'noindex, follow' : undefined,
      title: 'Package Search',
    }),
});

function HomePage() {
  return (
    <PageMain>
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
    </PageMain>
  );
}
