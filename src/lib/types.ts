export enum PackageArch {
  Any = 'any',
  x86_64 = 'x86_64',
  x86_64_v3 = 'x86_64_v3',
  x86_64_v4 = 'x86_64_v4',
}

export const packageArchValues = Object.values(PackageArch);

export enum PackageRepo {
  CACHYOS = 'cachyos',
  CACHYOS_CORE_V3 = 'cachyos-core-v3',
  CACHYOS_CORE_V4 = 'cachyos-core-v4',
  CACHYOS_CORE_ZNVER4 = 'cachyos-core-znver4',
  CACHYOS_EXTRA_V3 = 'cachyos-extra-v3',
  CACHYOS_EXTRA_V4 = 'cachyos-extra-v4',
  CACHYOS_EXTRA_ZNVER4 = 'cachyos-extra-znver4',
  CACHYOS_V3 = 'cachyos-v3',
  CACHYOS_V4 = 'cachyos-v4',
  CACHYOS_ZNVER4 = 'cachyos-znver4',
}

export const packageRepoValues = Object.values(PackageRepo);

/**
 * A brief representation of a package.
 */
export interface BriefPackage {
  /**
   * The architecture of the package.
   */
  pkg_arch: PackageArch;
  /**
   * The timestamp (Unix epoch) when the package was last updated.
   */
  pkg_builddate: number;
  /**
   * A brief description of the package.
   */
  pkg_desc: string;
  /**
   * The name of the package.
   */
  pkg_name: string;
  /**
   * The version of the package.
   */
  pkg_version: string;
  /**
   * The name of the repository the package belongs to.
   */
  repo_name: PackageRepo;
}

/**
 * Represents an error response from the API.
 */
export type ErrorResponse = {
  code: number;
  message: string;
};

/**
 * Detailed information for a specific package.
 */
export interface PackageDetails {
  pkg_arch: null | PackageArch;
  pkg_base: null | string;
  pkg_builddate: null | number;
  pkg_checkdepends: null | string[];
  pkg_conflicts: null | string[];
  pkg_csize: null | number;
  pkg_depends: null | string[];
  pkg_desc: null | string;
  pkg_files: null | string[];
  pkg_groups: null | string[];
  pkg_isize: null | number;
  pkg_license: null | string[];
  pkg_makedepends: null | string[];
  pkg_name: string;
  pkg_optdepends: null | string[];
  pkg_packager: null | string;
  pkg_pgpsig: null | string;
  pkg_provides: null | string[];
  pkg_replaces: null | string[];
  pkg_sha256sum: null | string;
  pkg_url: null | string;
  pkg_version: string;
  repo_name: PackageRepo;
  updated: number;
}

/**
 * Path parameters for getting package details.
 */
export interface PackageDetailsPathParams {
  /**
   * The architecture of the package.
   * @example "x86_64"
   */
  arch: PackageArch;
  /**
   * The name of the package.
   * @example "openssl"
   */
  pkgname: string;
  /**
   * The name of the repository.
   * @example "my-stable-repo"
   */
  repo: PackageRepo;
}

/**
 * The response body for a successful package details request.
 */
export interface PackageDetailsResponse {
  package: PackageDetails;
}

/**
 * The response schema for a package search request.
 */
export interface PackageSearchResponse {
  /**
   * An array of packages matching the search criteria for the current page.
   */
  packages: BriefPackage[];
  /**
   * The total number of packages matching the search criteria.
   */
  total_packages: number;
  /**
   * The total number of pages available.
   */
  total_pages: number;
}

/**
 * Query parameters for the package search endpoint.
 */
export interface PackagesSearchQueryParams {
  /**
   * A comma-separated list of architectures to filter by.
   * @example "x86_64,aarch64"
   */
  arch?: string;
  /**
   * The page number to retrieve.
   * @default 1
   */
  current_page?: number;
  /**
   * The number of packages to return per page.
   * @default 100
   */
  page_size?: number;
  /**
   * A comma-separated list of repository names to filter by.
   * @example "my-repo-1,my-repo-2"
   */
  repo?: string;
  /**
   * The search term to find packages by name or description.
   */
  search?: string;
}

/**
 * Query parameters for the split packages endpoint.
 */
export interface SplitPackagesQueryParams {
  /**
   * The name of the package base.
   * @example "openssl"
   */
  pkgbase: string;
  /**
   * The name of the repository.
   * @example "my-stable-repo"
   */
  repo: PackageRepo;
}

export type SplitPackagesResponse = BriefPackage[];
