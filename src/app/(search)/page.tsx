import {dehydrate, HydrationBoundary} from '@tanstack/react-query';
import {Metadata} from 'next';
import {Suspense} from 'react';

import PackageSearch from '@/components/PackageSearch';
import PackageSearchSkeleton from '@/components/PackageSearchSkeleton';
import {ThemeToggle} from '@/components/theme-toggle';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {searchPackages} from '@/lib/actions';
import {getQueryClient} from '@/lib/get-query-client';
import {PackagesSearchQueryParamsSchema} from '@/lib/types';

export const metadata: Metadata = {
  title: 'Package Search',
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{[key: string]: string | string[] | undefined}>;
}) {
  const {
    arch = '',
    current_page = 1,
    page_size = 15,
    repo = '',
    search = '',
  } = await searchParams;

  const params = PackagesSearchQueryParamsSchema.parse({
    arch,
    current_page: Number(current_page),
    page_size,
    repo: Array.isArray(repo) ? repo.join(',') : repo,
    search: Array.isArray(search) ? search.join(',') : search,
  });

  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryFn: () => searchPackages(params),
    queryKey: ['search', params],
  });

  return (
    <div className="font-[family-name:var(--font-geist-sans)]">
      <main className="container mx-auto p-4 md:p-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>CachyOS Package Repository Search</CardTitle>
                <CardDescription>
                  Find packages across all CachyOS repositories.
                </CardDescription>
              </div>
              <ThemeToggle />
            </div>
          </CardHeader>
          <CardContent>
            <HydrationBoundary state={dehydrate(queryClient)}>
              <Suspense fallback={<PackageSearchSkeleton />}>
                <PackageSearch />
              </Suspense>
            </HydrationBoundary>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
