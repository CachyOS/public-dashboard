'use client';

import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {AlertCircle} from 'lucide-react';
import {usePathname, useSearchParams} from 'next/navigation';
import {useCallback, useEffect, useMemo} from 'react';
import {useSessionStorage} from 'usehooks-ts';

import {SEARCH_BACK_PATH} from '@/components/BackLink';
import PackageSearchForm from '@/components/PackageSearchForm';
import PackageTable from '@/components/PackageTable';
import {PackageTablePagination} from '@/components/PackageTablePagination';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {searchQueryFn} from '@/lib/query-actions';
import {STALE_TIME} from '@/lib/query-client';
import {
  PackagesSearchQueryParams,
  PackagesSearchQueryParamsSchema,
  PAGE_SIZE,
} from '@/lib/types';
import {INTL_LOCALE} from '@/lib/utils';

export default function PackageSearch() {
  const pathname = usePathname();
  const currentParams = useSearchParams();
  const queryClient = useQueryClient();
  const [, setGoBackPath] = useSessionStorage(SEARCH_BACK_PATH, '/');

  const parsedParams = useMemo<PackagesSearchQueryParams>(() => {
    return PackagesSearchQueryParamsSchema.parse({
      arch: currentParams.get('arch') ?? '',
      current_page: Number(currentParams.get('current_page')) || 1,
      page_size: Number(currentParams.get('page_size')) || PAGE_SIZE[0],
      repo: currentParams.getAll('repo').join(','),
      search: currentParams.getAll('search').join(','),
    });
  }, [currentParams]);

  const {data, error, isPending, isPlaceholderData} = useQuery({
    placeholderData: keepPreviousData,
    queryFn: searchQueryFn(parsedParams),
    queryKey: ['search', parsedParams],
  });

  const setSearchParams = useCallback(
    (searchParams: PackagesSearchQueryParams) => {
      const query = new URLSearchParams();

      if (searchParams.search) query.append('search', searchParams.search);
      if (searchParams.repo) query.append('repo', searchParams.repo);
      if (searchParams.arch) query.append('arch', searchParams.arch);
      if (searchParams.current_page && searchParams.current_page > 1)
        query.append('current_page', String(searchParams.current_page));
      if (searchParams.page_size && searchParams.page_size !== PAGE_SIZE[0])
        query.append('page_size', String(searchParams.page_size));

      window.history.pushState(null, '', `${pathname}?${query}`);
    },
    [pathname]
  );

  useEffect(() => {
    setGoBackPath(`/${window.location.search}`);
  }, [setGoBackPath, pathname, currentParams]);

  const onFormSubmit = (searchParams: PackagesSearchQueryParams) => {
    searchParams.current_page = 1;
    setSearchParams(searchParams);
  };

  const onFormReset = () => {
    setSearchParams({
      arch: '',
      current_page: 1,
      page_size: PAGE_SIZE[0],
      repo: '',
      search: '',
    });
  };

  const prefetch = (page: number) => {
    queryClient.prefetchQuery({
      queryFn: searchQueryFn({...parsedParams, current_page: page}),
      queryKey: ['search', {...parsedParams, current_page: page}],
      staleTime: STALE_TIME,
    });
  };

  return (
    <div className="space-y-8">
      <PackageSearchForm
        initialParams={parsedParams}
        isLoading={isPending || isPlaceholderData}
        key={parsedParams.search + parsedParams.repo + parsedParams.arch}
        onReset={onFormReset}
        onSubmit={onFormSubmit}
      />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {data && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Found {data.total_packages.toLocaleString(INTL_LOCALE)} packages.
            Page {parsedParams.current_page.toLocaleString(INTL_LOCALE)} of{' '}
            {data.total_pages.toLocaleString(INTL_LOCALE)}.
          </p>

          {data.packages.length > 0 ? (
            <>
              <PackageTable
                onArchitectureClick={arch => {
                  setSearchParams({
                    ...parsedParams,
                    arch: arch === parsedParams.arch ? '' : arch,
                    current_page: 1,
                  });
                }}
                onRepositoryClick={repo => {
                  setSearchParams({
                    ...parsedParams,
                    current_page: 1,
                    repo: repo === parsedParams.repo ? '' : repo,
                  });
                }}
                packages={data.packages}
              />
              <PackageTablePagination
                currentPage={parsedParams.current_page}
                onClick={(page: number) => {
                  if (
                    page !== parsedParams.current_page &&
                    page > 0 &&
                    page <= data.total_pages
                  ) {
                    setSearchParams({
                      ...parsedParams,
                      current_page: page,
                    });
                  }
                }}
                onPageSizeChange={pageSize => {
                  setSearchParams({
                    ...parsedParams,
                    current_page: 1,
                    page_size: Number(pageSize),
                  });
                }}
                onPrefetch={(page: number) => {
                  if (page > 0 && page <= data.total_pages) {
                    prefetch(page);
                  }
                }}
                pageSize={parsedParams.page_size}
                totalPages={data.total_pages}
              />
            </>
          ) : (
            <p className="text-center text-muted-foreground">
              No packages found matching your criteria.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
