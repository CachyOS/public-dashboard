'use server';

import {headers} from 'next/headers';

import fetcher from '@/lib/fetcher';
import {
  PackageDetailFilesResponse,
  PackageDetailFilesResponseSchema,
  PackageDetailsPathParams,
  PackageDetailsResponse,
  PackageDetailsResponseSchema,
  PackageSearchResponse,
  PackageSearchResponseSchema,
  PackagesSearchQueryParams,
  SplitPackagesQueryParams,
  SplitPackagesResponse,
  SplitPackagesResponseSchema,
} from '@/lib/types';

/**
 * Retrieves detailed information for a specific package.
 *
 * @param params - The path parameters identifying the package by repo, arch, and name.
 * @returns A promise that resolves to the detailed package information.
 */
export async function getPackageDetails(
  params: PackageDetailsPathParams
): Promise<PackageDetailsResponse> {
  const {arch, pkgname, repo} = params;

  const path = `/v1/package/${repo}/${arch}/${pkgname}`;

  const clientHeaders = await headers();
  return fetcher(path, clientHeaders, PackageDetailsResponseSchema, {
    method: 'GET',
  });
}

/**
 * Retrieves the list of files for a specific package.
 *
 * @param params - The path parameters identifying the package by repo, arch, and name.
 * @returns A promise that resolves to an array of package file names.
 */
export async function getPackageFiles(
  params: PackageDetailsPathParams
): Promise<PackageDetailFilesResponse> {
  const {arch, pkgname, repo} = params;

  const path = `/v1/package/${repo}/${arch}/${pkgname}/files`;

  const clientHeaders = await headers();
  return fetcher(path, clientHeaders, PackageDetailFilesResponseSchema, {
    method: 'GET',
  });
}

/**
 * Retrieves the list of split packages for a given base package.
 *
 * @param params - The query parameters for the split packages request, including the package base and repository.
 * @returns A promise that resolves to an array of split package names.
 */
export async function getSplitPackages(
  params: SplitPackagesQueryParams
): Promise<SplitPackagesResponse> {
  const {pkgbase, repo} = params;

  const path = `/v1/split/${repo}/${pkgbase}`;

  const clientHeaders = await headers();
  return fetcher(path, clientHeaders, SplitPackagesResponseSchema, {
    method: 'GET',
  });
}

/**
 * Searches for packages across all repositories based on query parameters.
 *
 * @param params - The search, filter, and pagination parameters.
 * @returns A promise that resolves to the search results.
 */
export async function searchPackages(
  params: PackagesSearchQueryParams
): Promise<PackageSearchResponse> {
  const query = new URLSearchParams();

  if (params.search) query.append('search', params.search);
  if (params.repo) query.append('repo', params.repo);
  if (params.arch) query.append('arch', params.arch);
  if (params.current_page)
    query.append('current_page', String(params.current_page));
  if (params.page_size) query.append('page_size', String(params.page_size));

  const queryString = query.toString();
  const path = `/v1/packages-search${queryString ? `?${queryString}` : ''}`;

  const clientHeaders = await headers();
  return fetcher(path, clientHeaders, PackageSearchResponseSchema, {
    method: 'GET',
  });
}
