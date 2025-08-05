'use client';

import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {AlertCircle} from 'lucide-react';
import {usePathname, useSearchParams} from 'next/navigation';
import {useCallback, useMemo} from 'react';

import PackageSearchForm from '@/components/PackageSearchForm';
import PackageTable from '@/components/PackageTable';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {Button} from '@/components/ui/button';
import {searchQueryFn} from '@/lib/query-actions';
import {STALE_TIME} from '@/lib/query-client';
import {
  PackagesSearchQueryParams,
  PackagesSearchQueryParamsSchema,
} from '@/lib/types';
import {INTL_LOCALE} from '@/lib/utils';

export default function PackageSearch() {
  const pathname = usePathname();
  const currentParams = useSearchParams();
  const queryClient = useQueryClient();

  const parsedParams = useMemo<PackagesSearchQueryParams>(() => {
    return PackagesSearchQueryParamsSchema.parse({
      arch: currentParams.get('arch') ?? '',
      current_page: Number(currentParams.get('current_page')) || 1,
      page_size: 15,
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

      window.history.pushState(null, '', `${pathname}?${query.toString()}`);
    },
    [pathname]
  );

  const onFormSubmit = (searchParams: PackagesSearchQueryParams) => {
    // Reset to first page on new search to avoid out-of-bounds issue
    searchParams.current_page = 1;
    setSearchParams(searchParams);
  };

  const onFormReset = () => {
    setSearchParams({
      arch: '',
      current_page: 1,
      page_size: 15,
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
            Page {parsedParams.current_page} of{' '}
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
              <div className="flex items-center justify-end space-x-2">
                <Button
                  disabled={isPlaceholderData || parsedParams.current_page <= 1}
                  onClick={() =>
                    setSearchParams({
                      ...parsedParams,
                      current_page: parsedParams.current_page - 1,
                    })
                  }
                  onFocus={() => prefetch(parsedParams.current_page - 1)}
                  onMouseEnter={() => prefetch(parsedParams.current_page - 1)}
                  size="sm"
                  variant="outline"
                >
                  Previous
                </Button>
                <Button
                  disabled={
                    isPlaceholderData ||
                    parsedParams.current_page >= data.total_pages
                  }
                  onClick={() =>
                    setSearchParams({
                      ...parsedParams,
                      current_page: parsedParams.current_page + 1,
                    })
                  }
                  onFocus={() => prefetch(parsedParams.current_page + 1)}
                  onMouseEnter={() => prefetch(parsedParams.current_page + 1)}
                  size="sm"
                  variant="outline"
                >
                  Next
                </Button>
              </div>
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
