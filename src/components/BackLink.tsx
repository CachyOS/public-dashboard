'use client';

import {ArrowLeft} from 'lucide-react';
import Link from 'next/link';
import {useSessionStorage} from 'usehooks-ts';

export const SEARCH_BACK_PATH = 'search-back-path';

export function BackLink() {
  const [backPath] = useSessionStorage(SEARCH_BACK_PATH, '/', {
    initializeWithValue: false,
  });
  return (
    <Link
      className="inline-flex items-center text-sm text-primary hover:underline"
      href={backPath}
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      Back to Search
    </Link>
  );
}
