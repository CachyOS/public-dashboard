'use client';

import {Loader2} from 'lucide-react';
import {useCallback, useRef, useState} from 'react';

import {Button} from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {useGenericShortcutListener} from '@/hooks/use-keyboard-shortcut-listener';
import {PackageArch, PackageRepo, PackagesSearchQueryParams} from '@/lib/types';

interface PackageSearchFormProps {
  initialParams: PackagesSearchQueryParams;
  isLoading: boolean;
  onReset: () => void;
  onSubmit: (params: PackagesSearchQueryParams) => void;
}

export default function PackageSearchForm({
  initialParams,
  isLoading,
  onReset,
  onSubmit,
}: PackageSearchFormProps) {
  const [params, setParams] =
    useState<PackagesSearchQueryParams>(initialParams);

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
  };

  const handleSelectionChange = (name: 'arch' | 'repo', value: string) => {
    const currentValues = params[name] ? params[name].split(',') : [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];

    onInputChange({target: {name, value: newValues.join(',')}});
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(params);
  };

  const handleReset = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onReset();
  };

  const repoValues = params.repo ? params.repo.split(',').filter(Boolean) : [];
  const archValues = params.arch ? params.arch.split(',').filter(Boolean) : [];

  return (
    <form className="space-y-5" onReset={handleReset} onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="search">Package Name/Description</Label>
          <Input
            id="search"
            name="search"
            onChange={onInputChange}
            placeholder="e.g., openssl"
            ref={primarySearchFilterInputRef}
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
      <div className="flex space-x-4">
        <Button className="min-w-24" disabled={isLoading} type="submit">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
            'Search'
          )}
        </Button>

        <Button type="reset" variant="ghost">
          Reset
        </Button>
      </div>
    </form>
  );
}
