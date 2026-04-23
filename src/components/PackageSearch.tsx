'use client';

import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {useNavigate, useSearch} from '@tanstack/react-router';
import {AlertCircle} from 'lucide-react';
import {useCallback, useEffect, useMemo} from 'react';
import {useSessionStorage} from 'usehooks-ts';

import {SEARCH_BACK_PATH} from '@/components/BackLink';
import PackageSearchForm from '@/components/PackageSearchForm';
import PackageSearchSkeleton from '@/components/PackageSearchSkeleton';
import PackageTable from '@/components/PackageTable';
import {PackageTablePagination} from '@/components/PackageTablePagination';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {searchQueryFn} from '@/lib/query-actions';
import {PAGE_SIZE, type PackagesSearchQueryParams} from '@/lib/types';
import {INTL_LOCALE} from '@/lib/utils';

export default function PackageSearch() {
  const rawParams = useSearch({from: '/'});
  const navigate = useNavigate({from: '/'});
  const queryClient = useQueryClient();
  const [, setGoBackPath] = useSessionStorage(SEARCH_BACK_PATH, '/');

  const parsedParams = useMemo<PackagesSearchQueryParams>(
    () => ({
      arch: rawParams.arch ?? '',
      current_page: rawParams.current_page ?? 1,
      page_size: rawParams.page_size ?? PAGE_SIZE[0],
      repo: rawParams.repo ?? '',
      search: rawParams.search ?? '',
    }),
    [rawParams]
  );

  const {data, error, isPending, isPlaceholderData} = useQuery({
    placeholderData: keepPreviousData,
    queryFn: searchQueryFn(parsedParams),
    queryKey: ['search', parsedParams],
    staleTime: 60_000,
  });

  const setSearchParams = useCallback(
    (searchParams: PackagesSearchQueryParams) => {
      navigate({
        search: {
          arch: searchParams.arch ?? '',
          current_page: Math.max(searchParams.current_page, 1),
          page_size:
            searchParams.page_size === PAGE_SIZE[0]
              ? PAGE_SIZE[0]
              : searchParams.page_size,
          repo: searchParams.repo ?? '',
          search: searchParams.search ?? '',
        },
      });
    },
    [navigate]
  );

  useEffect(() => {
    setGoBackPath(`/${globalThis.location.search}`);
  }, [setGoBackPath]);

  const onFormSubmit = (searchParams: PackagesSearchQueryParams) => {
    searchParams.current_page = 1;
    setSearchParams({
      ...searchParams,
      search: searchParams.search.trim(),
    });
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

      {isPending && !data && <PackageSearchSkeleton />}

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
                    page_size: Number(pageSize) as (typeof PAGE_SIZE)[number],
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
