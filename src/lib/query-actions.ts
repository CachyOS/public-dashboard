import {
  PackageSearchResponseSchema,
  PackagesSearchQueryParams,
} from '@/lib/types';

export function buildSearchQuery(params: PackagesSearchQueryParams) {
  return new URLSearchParams({
    arch: params.arch ?? '',
    current_page: String(params.current_page),
    page_size: String(params.page_size),
    repo: params.repo,
    search: params.search,
  }).toString();
}

export async function fetchSearchResults(
  params: PackagesSearchQueryParams,
  signal?: AbortSignal
) {
  const query = buildSearchQuery(params);
  const response = await fetch(`/api/search?${query}`, {signal});
  if (!response.ok) {
    throw new Error(`Failed to fetch search results: ${response.statusText}`);
  }
  return PackageSearchResponseSchema.parse(await response.json());
}

export function searchQueryFn(params: PackagesSearchQueryParams) {
  return ({signal}: {signal?: AbortSignal}) =>
    fetchSearchResults(params, signal);
}
