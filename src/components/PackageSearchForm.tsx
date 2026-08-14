'use client';

import {keepPreviousData, useQuery} from '@tanstack/react-query';
import {Loader2} from 'lucide-react';
import {useCallback, useRef, useState} from 'react';
import {useDebounceValue} from 'usehooks-ts';
import {z} from 'zod';

import {Autocomplete} from '@/components/Autocomplete';
import {Button} from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {Label} from '@/components/ui/label';
import {useGenericShortcutListener} from '@/hooks/use-keyboard-shortcut-listener';
import {getSuggestions} from '@/lib/query-actions';
import {
  PackageArch,
  PackageRepo,
  type PackagesSearchQueryParams,
} from '@/lib/types';

interface PackageSearchFormProps {
  initialParams: PackagesSearchQueryParams;
  isLoading: boolean;
  onReset: () => void;
  onSubmit: (params: PackagesSearchQueryParams) => void;
}

const SEARCH_ERROR_ID = 'search-error';
const MAX_SEARCH_LENGTH = 128;

// checked on submit
const SearchTermSchema = z
  .string()
  .max(MAX_SEARCH_LENGTH, `Use ${MAX_SEARCH_LENGTH} characters or fewer.`)
  .refine(
    value => value.length === 0 || value.trim().length > 0,
    'Enter a package name or description, or clear the field to browse all packages.'
  );

export default function PackageSearchForm({
  initialParams,
  isLoading,
  onReset,
  onSubmit,
}: PackageSearchFormProps) {
  const [params, setParams] =
    useState<PackagesSearchQueryParams>(initialParams);
  const [searchError, setSearchError] = useState<null | string>(null);

  const [searchSuggest] = useDebounceValue(params.search, 300);
  const {data: [, options] = [searchSuggest, []]} = useQuery({
    enabled: searchSuggest.length > 0,
    placeholderData: keepPreviousData,
    queryFn: ({queryKey: [, query], signal}) => getSuggestions({query, signal}),
    queryKey: ['suggestions', searchSuggest],
    staleTime: 60 * 1000,
  });

  const primarySearchFilterInputRef = useRef<HTMLInputElement>(null);
  const primarySearchFilterShortcutCallback = useCallback(() => {
    if (primarySearchFilterInputRef.current) {
      primarySearchFilterInputRef.current.focus();
    }
  }, []);

  useGenericShortcutListener('/', primarySearchFilterShortcutCallback, true);

  const onInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | {target: {name: string; value: string}}
  ) => {
    const {name, value} = e.target;
    setParams(prev => ({...prev, [name]: value}));
    if (name === 'search') {
      setSearchError(null);
    }
  };

  // picked suggestion is already a valid term
  const onSuggestionSelect = (search: string) => {
    setParams(prev => ({...prev, search}));
    setSearchError(null);
    onSubmit({...params, search});
  };

  const handleSelectionChange = (name: 'arch' | 'repo', value: string) => {
    const currentValues = params[name] ? params[name].split(',') : [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];

    onInputChange({target: {name, value: newValues.join(',')}});
  };

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();

    const result = SearchTermSchema.safeParse(params.search);
    if (!result.success) {
      setSearchError(result.error.issues[0].message);
      primarySearchFilterInputRef.current?.focus();
      return;
    }

    onSubmit(params);
  };

  const handleReset = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSearchError(null);
    onReset();
  };

  const repoValues = params.repo ? params.repo.split(',').filter(Boolean) : [];
  const archValues = params.arch ? params.arch.split(',').filter(Boolean) : [];

  return (
    <form className="space-y-5" onReset={handleReset} onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Autocomplete
            aria-describedby={searchError ? SEARCH_ERROR_ID : undefined}
            aria-invalid={searchError !== null}
            autoFocus={params.search.trim() === ''}
            emptyMessage="No matching packages."
            id="search"
            label="Package Name/Description"
            name="search"
            onChange={onInputChange}
            onSelect={onSuggestionSelect}
            options={options}
            placeholder="e.g., openssl"
            ref={primarySearchFilterInputRef}
            value={params.search}
          />
          {searchError && (
            <p
              className="text-destructive text-sm"
              id={SEARCH_ERROR_ID}
              role="alert"
            >
              {searchError}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="repo">Repository</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="bg-transparent w-full justify-start font-normal"
                id="repo"
                type="button"
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
                  onSelect={e => e.preventDefault()}
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
                className="bg-transparent w-full justify-start font-normal"
                id="arch"
                type="button"
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
                  onSelect={e => e.preventDefault()}
                >
                  {arch}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="flex space-x-4">
        <Button
          className="w-32"
          disabled={isLoading}
          suppressHydrationWarning
          type="submit"
        >
          {isLoading ? (
            <>
              <Loader2
                aria-hidden="true"
                className="animate-spin"
                data-icon="inline-start"
              />
              Searching…
            </>
          ) : (
            'Search'
          )}
        </Button>

        <Button type="reset" variant="ghost">
          Reset
        </Button>

        <span aria-live="polite" className="sr-only" role="status">
          {isLoading ? 'Searching packages…' : ''}
        </span>
      </div>
    </form>
  );
}
