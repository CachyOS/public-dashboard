import {getQueryClient} from '@/lib/query-client';

export function getContext() {
  return {queryClient: getQueryClient()};
}
