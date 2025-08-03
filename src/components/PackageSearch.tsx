'use client';

import {AlertCircle} from 'lucide-react';
import {usePathname, useRouter, useSearchParams} from 'next/navigation';
import {useCallback, useEffect, useMemo, useState} from 'react';

import PackageSearchForm from '@/components/PackageSearchForm';
import PackageTable from '@/components/PackageTable';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {Button} from '@/components/ui/button';
import {
  PackageSearchResponse,
  PackagesSearchQueryParams,
  PackagesSearchQueryParamsSchema,
} from '@/lib/types';

export default function PackageSearch() {
  const {push} = useRouter();
  const pathname = usePathname();
  const currentParams = useSearchParams();

  const parsedParams = useMemo(() => {
    const params = {
      arch: currentParams.get('arch') ?? '',
      current_page: Number(currentParams.get('current_page')) || 1,
      page_size: 15,
      repo: currentParams.getAll('repo').join(','),
      search: currentParams.getAll('search').join(','),
    } satisfies PackagesSearchQueryParams;
    // FIXME: should also set the browser search query params to the returned parsedParams
    return PackagesSearchQueryParamsSchema.parse(params);
  }, [currentParams]);

  // TODO: Replace with Tanstack Query or SWR for better data fetching and caching.
  const [results, setResults] = useState<null | PackageSearchResponse>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);

  const setSearchParams = useCallback(
    (searchParams: PackagesSearchQueryParams) => {
      const query = new URLSearchParams();

      if (searchParams.search) query.append('search', searchParams.search);
      if (searchParams.repo) query.append('repo', searchParams.repo);
      if (searchParams.arch) query.append('arch', searchParams.arch);
      if (searchParams.current_page && searchParams.current_page > 1)
        query.append('current_page', String(searchParams.current_page));

      push(`${pathname}?${query.toString()}`);
    },
    [pathname, push]
  );

  const handleSearch = useCallback(
    async (searchParams: PackagesSearchQueryParams) => {
      setIsLoading(true);
      setError(null);

      try {
        const searchParamsString = new URLSearchParams({
          arch: searchParams.arch ?? '',
          current_page: String(searchParams.current_page),
          repo: searchParams.repo,
          search: searchParams.search,
        });
        const response = await fetch(`/api/search?${searchParamsString}`);
        if (!response.ok) {
          throw new Error(
            `HTTP error! status: ${response.status}, ${response.statusText}`
          );
        }
        const responseData = await response.json();
        setResults(responseData);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch packages. Please try again later.');
        setResults(null);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    handleSearch(parsedParams);
  }, [parsedParams, handleSearch]);

  const onFormSubmit = (searchParams: PackagesSearchQueryParams) => {
    // Reset to first page on new search to avoid out-of-bounds issue
    searchParams.current_page = 1;
    setSearchParams(searchParams);
  };

  return (
    <div className="space-y-8">
      <PackageSearchForm
        initialParams={parsedParams}
        isLoading={isLoading}
        // FIXME: Bug where have to force re-render to update dropdown.
        key={parsedParams.search + parsedParams.repo + parsedParams.arch}
        onSubmit={onFormSubmit}
      />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {results && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Found {results.total_packages.toLocaleString()} packages. Page{' '}
            {parsedParams.current_page} of{' '}
            {results.total_pages.toLocaleString()}.
          </p>

          {results.packages.length > 0 ? (
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
                packages={results.packages}
              />
              <div className="flex items-center justify-end space-x-2">
                <Button
                  disabled={isLoading || parsedParams.current_page <= 1}
                  onClick={() =>
                    setSearchParams({
                      ...parsedParams,
                      current_page: parsedParams.current_page - 1,
                    })
                  }
                  size="sm"
                  variant="outline"
                >
                  Previous
                </Button>
                <Button
                  disabled={
                    isLoading ||
                    parsedParams.current_page >= results.total_pages
                  }
                  onClick={() =>
                    setSearchParams({
                      ...parsedParams,
                      current_page: parsedParams.current_page + 1,
                    })
                  }
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
