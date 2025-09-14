'use client';

import {useQuery} from '@tanstack/react-query';
import {useState} from 'react';

import {CopyButton} from '@/components/CopyButton';
import {Button} from '@/components/ui/button';
import {PackageDetailFilesResponseSchema} from '@/lib/types';

type PackageFilesProps = {
  arch: string;
  pkgname: string;
  repo: string;
};

export function PackageFiles({arch, pkgname, repo}: PackageFilesProps) {
  const [requested, setRequested] = useState(false);

  const query = useQuery({
    enabled: false, // manual
    queryFn: ({signal}) => fetchPackageFiles({arch, pkgname, repo, signal}),
    queryKey: ['files', repo, arch, pkgname],
    staleTime: 5 * 60 * 1000,
  });

  const onClick = () => {
    if (!requested) {
      setRequested(true);
      query.refetch();
    }
  };

  if (!requested) {
    return (
      <Button
        className="p-0 h-auto font-normal text-base"
        onClick={onClick}
        type="button"
        variant="link"
      >
        Load package files
      </Button>
    );
  }

  if (query.isLoading || query.isFetching) {
    return <span className="text-muted-foreground">Loading files…</span>;
  }

  if (query.isError) {
    return (
      <span className="text-destructive text-sm">{query.error.message}</span>
    );
  }

  const files = query.data ?? [];

  if (files.length === 0) {
    return <span className="text-muted-foreground">No files found.</span>;
  }

  return (
    <div className="relative h-64 overflow-y-auto rounded-md border bg-muted p-2 font-mono text-xs">
      <CopyButton className="absolute top-1 right-1" text={files.join('\n')} />
      {files.map(f => (
        <div key={f}>{f}</div>
      ))}
    </div>
  );
}

async function fetchPackageFiles({
  arch,
  pkgname,
  repo,
  signal,
}: {
  arch: string;
  pkgname: string;
  repo: string;
  signal?: AbortSignal;
}): Promise<string[]> {
  const res = await fetch(
    `/api/search/package/${encodeURIComponent(repo)}/${encodeURIComponent(
      arch
    )}/${encodeURIComponent(pkgname)}/files`,
    {signal}
  );
  if (!res.ok) {
    throw new Error(`Failed to load files: ${res.status} - ${res.statusText}`);
  }
  return PackageDetailFilesResponseSchema.parse(await res.json());
}
