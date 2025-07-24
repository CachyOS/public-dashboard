'use client';

import {AlertCircle, Loader2} from 'lucide-react';
import {usePathname, useRouter, useSearchParams} from 'next/navigation';
import {useEffect, useState} from 'react';

import PackageTable from '@/components/PackageTable';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {Button} from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {searchPackages} from '@/lib/actions';
import {
  PackageArch,
  PackageRepo,
  PackageSearchResponse,
  PackagesSearchQueryParams,
} from '@/lib/types';
import {convertURLSearchParamsToObject} from '@/lib/utils';

export default function PackageSearch() {
  const searchParams = convertURLSearchParamsToObject(
    useSearchParams()
  ) as PackagesSearchQueryParams;

  const pathname = usePathname();
  const {replace} = useRouter();

  const [params, setParams] = useState<PackagesSearchQueryParams>({
    arch: searchParams?.arch || '',
    current_page: Number(searchParams?.current_page) || 1,
    page_size: 15,
    repo: searchParams?.repo || '',
    search: searchParams?.search || '',
  });

  const [results, setResults] = useState<null | PackageSearchResponse>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);

  const setSearchParams = (page = 1) => {
    const query = new URLSearchParams();

    if (params.search) query.append('search', params.search);
    if (params.repo) query.append('repo', params.repo);
    if (params.arch) query.append('arch', params.arch);
    if (page > 1) query.append('current_page', String(page));

    replace(`${pathname}?${query.toString()}`);
  };

  const handleSearch = async (page = 1) => {
    setIsLoading(true);
    setError(null);

    setSearchParams(page);
    const searchParams = {...params, current_page: page};

    try {
      const response = await searchPackages(searchParams);
      setResults(response);
      // Update current_page in state after a successful search
      setParams(searchParams);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch packages. Please try again later.');
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  // load search packages without params on page load
  useEffect(() => {
    setIsLoading(true);
    handleSearch(params.current_page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // reset page
    handleSearch(params.current_page);
  };

  const onInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | {target: {name: string; value: string}}
  ) => {
    const {name, value} = e.target;
    setParams(prev => ({...prev, [name]: value}));
  };

  const handleSelectionChange = (name: 'arch' | 'repo', value: string) => {
    const currentValues = params[name] ? params[name].split(',') : [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];

    onInputChange({target: {name, value: newValues.join(',')}});
  };

  const repoValues = params.repo ? params.repo.split(',').filter(Boolean) : [];
  const archValues = params.arch ? params.arch.split(',').filter(Boolean) : [];

  return (
    <div className="space-y-8">
      {/* Search Form */}
      <form className="space-y-4" onSubmit={onFormSubmit}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="search">Package Name/Description</Label>
            <Input
              id="search"
              name="search"
              onChange={onInputChange}
              placeholder="e.g., openssl"
              value={params.search}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="repo">Repository</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="w-full justify-start font-normal"
                  variant="outline"
                >
                  <div className="truncate">
                    {repoValues.length > 0
                      ? repoValues.join(', ')
                      : 'Select repositories'}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {Object.values(PackageRepo).map(repo => (
                  <DropdownMenuCheckboxItem
                    checked={repoValues.includes(repo)}
                    key={repo}
                    onCheckedChange={() => handleSelectionChange('repo', repo)}
                  >
                    {repo}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="space-y-2">
            <Label htmlFor="arch">Architecture</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="w-full justify-start font-normal"
                  variant="outline"
                >
                  <div className="truncate">
                    {archValues.length > 0
                      ? archValues.join(', ')
                      : 'Select an architecture'}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {Object.values(PackageArch).map(arch => (
                  <DropdownMenuCheckboxItem
                    checked={archValues.includes(arch)}
                    key={arch}
                    onCheckedChange={() => handleSelectionChange('arch', arch)}
                  >
                    {arch}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <Button disabled={isLoading} type="submit">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
            'Search'
          )}
        </Button>
      </form>

      {/* Results Section */}
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
            {params.current_page} of {results.total_pages.toLocaleString()}.
          </p>

          {results.packages.length > 0 ? (
            <>
              <PackageTable packages={results.packages} />
              {/* Pagination Controls */}
              <div className="flex items-center justify-end space-x-2">
                <Button
                  disabled={isLoading || params.current_page! <= 1}
                  onClick={() => handleSearch(params.current_page! - 1)}
                  size="sm"
                  variant="outline"
                >
                  Previous
                </Button>
                <Button
                  disabled={
                    isLoading || params.current_page! >= results.total_pages
                  }
                  onClick={() => handleSearch(params.current_page! + 1)}
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
