'use client';

import {ArrowLeft} from 'lucide-react';
import {useRouter} from 'next/navigation';

// HACK:
// The value is 2 because blank home page is considered as a history entry.
// It can also be 1, but that's trickier to reproduce.
const HISTORY_THRESHOLD = 2;

export default function BackButton() {
  const {back, push} = useRouter();

  return (
    <button
      className="inline-flex items-center text-sm text-primary hover:underline"
      onClick={() =>
        window.history.length > HISTORY_THRESHOLD ? back() : push('/')
      }
      type="button"
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      Back to Search
    </button>
  );
}
