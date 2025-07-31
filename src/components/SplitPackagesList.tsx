'use client';

import Link from 'next/link';
import {useState} from 'react';

import {BriefPackageList} from '@/lib/types';

export default function SplitPackagesList({
  splits,
}: {
  splits: BriefPackageList;
}) {
  const [expanded, setExpanded] = useState(false);
  const visibleSplits = expanded ? splits : splits.slice(0, 5);
  const hasMore = splits.length > 5;

  return (
    <div className="flex flex-wrap gap-1 items-center">
      {visibleSplits.map(split => (
        <Link
          className="text-primary hover:underline"
          href={`/package/${split.repo_name}/${split.pkg_arch}/${split.pkg_name}`}
          key={split.pkg_name}
        >
          {split.pkg_name}
        </Link>
      ))}
      {hasMore && (
        <button
          className="text-primary hover:underline ml-2"
          onClick={() => setExpanded(e => !e)}
          type="button"
        >
          {expanded ? 'Less...' : 'More...'}
        </button>
      )}
    </div>
  );
}
