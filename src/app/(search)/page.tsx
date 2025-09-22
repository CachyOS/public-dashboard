import {dehydrate, HydrationBoundary} from '@tanstack/react-query';
import {Metadata} from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {Suspense} from 'react';

import icon from '@/app/icon.svg';
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
import {getQueryClient} from '@/lib/query-client';
import {PackagesSearchQueryParamsSchema} from '@/lib/types';

export const metadata: Metadata = {
  title: 'Package Search',
};

export default async function Home({searchParams}: PageProps<'/'>) {
  const params = parseSearchParams(await searchParams);

  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryFn: () => searchPackages(params),
    queryKey: ['search', params],
  });

  return (
    <main className="container mx-auto p-4 md:p-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Image alt="CachyOS Logo" className="h-12 w-12" src={icon} />
              </Link>
              <div className="space-y-1 mt-0.5">
                <CardTitle>CachyOS Package Repository Search</CardTitle>
                <CardDescription>
                  Find packages across all CachyOS repositories.
                </CardDescription>
              </div>
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
  );
}

function parseSearchParams(
  searchParams: Awaited<PageProps<'/'>['searchParams']>
) {
  return PackagesSearchQueryParamsSchema.parse({
    arch: searchParams.arch ?? '',
    current_page: Number(searchParams.current_page) || 1,
    page_size: searchParams.page_size ?? '15',
    repo: Array.isArray(searchParams.repo)
      ? searchParams.repo.join(',')
      : (searchParams.repo ?? ''),
    search: Array.isArray(searchParams.search)
      ? searchParams.search.join(',')
      : (searchParams.search ?? ''),
  });
}
