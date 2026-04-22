import {searchPackages} from '@/lib/server/actions';
import type {PackagesSearchQueryParams} from '@/lib/types';

import {EndpointURL} from './fetcher';

export async function getSuggestions({
  query,
  signal,
}: {
  query: string;
  signal?: AbortSignal;
}): Promise<[string, string[]]> {
  const response = await fetch(`${EndpointURL}/v1/packages/suggest/${query}`, {
    signal,
  });
  if (!response.ok) {
    console.error(
      `Failed to fetch suggestions. ${response.status} ${response.statusText}`.trim()
    );
    return [query, []];
  }
  return await response.json();
}

export function searchQueryFn(params: PackagesSearchQueryParams) {
  return ({signal}: {signal?: AbortSignal}) =>
    searchPackages({data: params, signal});
}
