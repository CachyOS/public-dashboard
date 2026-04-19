'use client';

import {Link} from '@tanstack/react-router';
import {useState} from 'react';

import type {BriefPackageList} from '@/lib/types';

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
          key={split.pkg_name}
          params={{
            arch: split.pkg_arch,
            pkgname: split.pkg_name,
            repo: split.repo_name,
          }}
          to="/package/$repo/$arch/$pkgname"
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
