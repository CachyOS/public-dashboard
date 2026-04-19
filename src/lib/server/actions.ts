import {createServerFn} from '@tanstack/react-start';
import {getRequestHeaders} from '@tanstack/react-start/server';
import {z} from 'zod';

import fetcher from '@/lib/fetcher';
import {getMirrorsData as computeMirrorsData} from '@/lib/mirrors';
import {getSourceUrl as computeSourceUrl} from '@/lib/server/source-url';
import {
  type PackageDetailFilesResponse,
  PackageDetailFilesResponseSchema,
  type PackageDetailsPathParams,
  PackageDetailsPathParamsSchema,
  type PackageDetailsResponse,
  PackageDetailsResponseSchema,
  type PackageSearchResponse,
  PackageSearchResponseSchema,
  type PackagesSearchQueryParams,
  PackagesSearchQueryParamsSchema,
  type SplitPackagesQueryParams,
  SplitPackagesQueryParamsSchema,
  type SplitPackagesResponse,
  SplitPackagesResponseSchema,
} from '@/lib/types';

function forwardedHeaders(): Headers {
  return new Headers(getRequestHeaders());
}

/**
 * Retrieves detailed information for a specific package.
 */
export const getPackageDetails = createServerFn({method: 'GET'})
  .inputValidator(PackageDetailsPathParamsSchema)
  .handler(async ({data}): Promise<PackageDetailsResponse> => {
    const {arch, pkgname, repo} = data satisfies PackageDetailsPathParams;
    const path = `/v1/package/${repo}/${arch}/${pkgname}`;
    return fetcher(path, forwardedHeaders(), PackageDetailsResponseSchema, {
      method: 'GET',
    });
  });

/**
 * Retrieves the list of files for a specific package.
 */
export const getPackageFiles = createServerFn({method: 'GET'})
  .inputValidator(PackageDetailsPathParamsSchema)
  .handler(async ({data}): Promise<PackageDetailFilesResponse> => {
    const {arch, pkgname, repo} = data satisfies PackageDetailsPathParams;
    const path = `/v1/package/${repo}/${arch}/${pkgname}/files`;
    return fetcher(path, forwardedHeaders(), PackageDetailFilesResponseSchema, {
      method: 'GET',
    });
  });

/**
 * Retrieves the list of split packages for a given base package.
 */
export const getSplitPackages = createServerFn({method: 'GET'})
  .inputValidator(SplitPackagesQueryParamsSchema)
  .handler(async ({data}): Promise<SplitPackagesResponse> => {
    const {pkgbase, repo} = data satisfies SplitPackagesQueryParams;
    const path = `/v1/split/${repo}/${pkgbase}`;
    return fetcher(path, forwardedHeaders(), SplitPackagesResponseSchema, {
      method: 'GET',
    });
  });

/**
 * Searches for packages across all repositories based on query parameters.
 */
export const searchPackages = createServerFn({method: 'GET'})
  .inputValidator(PackagesSearchQueryParamsSchema)
  .handler(async ({data}): Promise<PackageSearchResponse> => {
    const params = data satisfies PackagesSearchQueryParams;
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.repo) query.append('repo', params.repo);
    if (params.arch) query.append('arch', params.arch);
    if (params.current_page)
      query.append('current_page', String(params.current_page));
    if (params.page_size) query.append('page_size', String(params.page_size));

    const queryString = query.toString();
    const path = `/v1/packages-search${queryString ? `?${queryString}` : ''}`;
    return fetcher(path, forwardedHeaders(), PackageSearchResponseSchema, {
      method: 'GET',
    });
  });

const SourceUrlInputSchema = z.object({
  pkg_base: z.string().nullable(),
  pkg_name: z.string(),
  pkg_version: z.string(),
  repo_name: z.string(),
});

/**
 * Retrieves the source URL for a package (PKGBUILD, AUR, or Arch GitLab).
 */
export const getSourceUrl = createServerFn({method: 'GET'})
  .inputValidator(SourceUrlInputSchema)
  .handler(async ({data}) => {
    return computeSourceUrl(data);
  });

/**
 * Retrieves mirrors status data.
 */
export const getMirrorsData = createServerFn({method: 'GET'}).handler(
  async () => {
    return computeMirrorsData();
  }
);
