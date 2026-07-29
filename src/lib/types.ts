import {z} from 'zod';

export const PAGE_SIZE = [15, 30, 50, 100] as const;

export enum PackageArch {
  Any = 'any',
  x86_64 = 'x86_64',
  x86_64_v3 = 'x86_64_v3',
  x86_64_v4 = 'x86_64_v4',
}

export const packageArchValues = Object.values(PackageArch);
export const PackageArchSchema = z.enum(
  PackageArch,
  `Architecture must be one of: ${packageArchValues.join(', ')}`
);

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
  CORE = 'core',
  EXTRA = 'extra',
}

export const packageRepoValues = Object.values(PackageRepo);

// NOTE: Package Repo currently not always match enum values
//export const PackageRepoSchema = z.enum(PackageRepo);
export const PackageRepoSchema = z.string().min(3);

/**
 * A brief representation of a package.
 */
export const BriefPackageSchema = z.strictObject({
  /**
   * The architecture of the package.
   */
  pkg_arch: PackageArchSchema,
  /**
   * The timestamp (Unix epoch) when the package was last updated.
   */
  pkg_builddate: z
    .number({error: 'BuildDate must be an positive integer'})
    .nonnegative(),
  /**
   * A brief description of the package.
   */
  pkg_desc: z.string(),
  /**
   * The name of the package.
   */
  pkg_name: z.string(),
  /**
   * The version of the package.
   */
  pkg_version: z.string(),
  /**
   * The name of the repository the package belongs to.
   */
  repo_name: PackageRepoSchema,
});
export type BriefPackage = z.infer<typeof BriefPackageSchema>;

export const BriefPackageListSchema = z.array(BriefPackageSchema);
export type BriefPackageList = z.infer<typeof BriefPackageListSchema>;

/**
 * Represents an error response from the API.
 */
export const ErrorResponseSchema = z.strictObject({
  code: z.string().min(3).max(3),
  message: z.string().min(1),
});
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

/**
 * The `lastupdate` timestamp of a repo on the build server.
 */
export type MirrorBaseline = {
  /**
   * The path of the repo on the build server.
   */
  path: string;
  /**
   * The timestamp (Unix epoch, in milliseconds), or null when unreachable.
   */
  timestamp: null | number;
};

/**
 * The freshness of a single repo on a mirror.
 */
export const RepoCheckSchema = z.strictObject({
  /**
   * The time the repo was last updated on the mirror, null on error.
   */
  last_updated: z.iso.datetime().nullable(),
  /**
   * The path of the repo on the mirror.
   */
  path: z.string(),
  /**
   * The sync status of the repo.
   */
  status: z.enum(['synced', 'out-of-sync', 'error']),
  /**
   * The seconds the repo is behind the build server, null when unknown.
   */
  sync_lag_seconds: z.number().int().nullable(),
});
export type RepoCheck = z.infer<typeof RepoCheckSchema>;

/**
 * A mirror of the CachyOS package repositories.
 */
export const MirrorSchema = z.strictObject({
  /**
   * The mean sync lag in seconds across the repos, null when unknown.
   */
  average_lag_seconds: z.number().int().nullable(),
  /**
   * The freshness of each repo on the mirror.
   */
  checks: z.array(RepoCheckSchema),
  /**
   * The country the mirror is served from.
   */
  country_code: z.string(),
  /**
   * The worst sync lag in seconds across the repos, null when unknown.
   */
  delay_seconds: z.number().int().nullable(),
  /**
   * The time of the newest successful repo sync, null when none succeeded.
   */
  last_sync: z.iso.datetime().nullable(),
  /**
   * Whether the mirror is stale or missing repo data.
   */
  out_of_date: z.boolean(),
  /**
   * The aggregate sync status across the repos.
   */
  overall_status: z.enum(['healthy', 'partial', 'out-of-sync', 'error']),
  /**
   * Tier 1 mirrors pull directly from upstream, tier 2 mirrors do not.
   */
  tier: z.union([z.literal(1), z.literal(2)]),
  /**
   * The base URL of the mirror, without the `$arch/$repo` suffix.
   */
  url: z.httpUrl(),
});
export type Mirror = z.infer<typeof MirrorSchema>;

/**
 * The response schema for a mirrors request.
 */
export const MirrorsResponseSchema = z.strictObject({
  mirrors: z.array(MirrorSchema),
});
export type MirrorsResponse = z.infer<typeof MirrorsResponseSchema>;

/**
 * Detailed information for a specific package.
 */
export const PackageDetailsSchema = z.strictObject({
  pkg_arch: PackageArchSchema,
  pkg_base: z.string(),
  pkg_builddate: z
    .number({error: 'BuildDate must be an positive integer'})
    .nonnegative(),
  pkg_checkdepends: z.array(z.string()),
  pkg_conflicts: z.array(z.string()),
  pkg_csize: z
    .number({error: 'CSIZE must be an positive integer'})
    .nonnegative(),
  pkg_depends: z.array(z.string()),
  pkg_desc: z.string(),
  pkg_files: z.array(z.string()).optional().default([]),
  pkg_groups: z.array(z.string()),
  pkg_isize: z
    .number({error: 'ISIZE must be an positive integer'})
    .nonnegative(),
  pkg_license: z.array(z.string()),
  pkg_makedepends: z.array(z.string()),
  pkg_name: z.string(),
  pkg_optdepends: z.array(z.string()),
  pkg_packager: z.string(),
  pkg_pgpsig: z.string().nullable(),
  pkg_provides: z.array(z.string()),
  pkg_replaces: z.array(z.string()),
  pkg_sha256sum: z.string(),
  pkg_url: z.string().nullable(),
  pkg_version: z.string(),
  repo_name: PackageRepoSchema,
  updated: z
    .number({error: 'Updated must be an positive integer'})
    .nonnegative(),
});
export type PackageDetails = z.infer<typeof PackageDetailsSchema>;

/**
 * Path parameters for getting package details.
 */
export const PackageDetailsPathParamsSchema = z.strictObject({
  /**
   * The architecture of the package.
   * @example "x86_64"
   */
  arch: PackageArchSchema,
  /**
   * The name of the package.
   * @example "openssl"
   */
  pkgname: z.string().min(1),
  /**
   * The name of the repository.
   * @example "my-stable-repo"
   */
  repo: PackageRepoSchema,
});
export type PackageDetailsPathParams = z.infer<
  typeof PackageDetailsPathParamsSchema
>;

/**
 * The response body for a successful package details request.
 */
export const PackageDetailsResponseSchema = z.strictObject({
  package: PackageDetailsSchema,
});
export type PackageDetailsResponse = z.infer<
  typeof PackageDetailsResponseSchema
>;

export const PackageDetailFilesResponseSchema = z.array(z.string());
export type PackageDetailFilesResponse = z.infer<
  typeof PackageDetailFilesResponseSchema
>;

/**
 * The response schema for a package search request.
 */
export const PackageSearchResponseSchema = z.strictObject({
  /**
   * An optional array of packages that exactly match the search criteria.
   * This field may be omitted or null if there are no exact matches.
   */
  exact_match: BriefPackageListSchema.optional().default([]),
  /**
   * An array of packages matching the search criteria for the current page.
   */
  packages: BriefPackageListSchema,
  /**
   * The total number of packages matching the search criteria.
   */
  total_packages: z
    .number({error: 'Total packages must be a positive integer'})
    .nonnegative(),
  /**
   * The total number of pages available.
   */
  total_pages: z
    .number({error: 'Total pages must be a positive integer'})
    .nonnegative(),
});
export type PackageSearchResponse = z.infer<typeof PackageSearchResponseSchema>;

/**
 * Query parameters for the package search endpoint.
 */
export const PackagesSearchQueryParamsSchema = z.strictObject({
  /**
   * A comma-separated list of architectures to filter by.
   * @example "x86_64,aarch64"
   */
  arch: z.string().optional(),
  /**
   * The page number to retrieve.
   * @default 1
   */
  current_page: z
    .number({error: 'Current page must be a positive integer'})
    .positive()
    .catch(1),
  /**
   * The number of packages to return per page.
   * @default First value in PAGE_SIZE constant
   */
  page_size: z
    .union(PAGE_SIZE.map(size => z.literal(size)))
    .catch(PAGE_SIZE[0]),
  /**
   * A comma-separated list of repository names to filter by.
   * @example "my-repo-1,my-repo-2"
   */
  repo: z.string(),
  /**
   * The search term to find packages by name or description.
   */
  search: z.string(),
});
export type PackagesSearchQueryParams = z.infer<
  typeof PackagesSearchQueryParamsSchema
>;

/**
 * Query parameters for the split packages endpoint.
 */
export const SplitPackagesQueryParamsSchema = z.strictObject({
  /**
   * The name of the package base.
   * @example "openssl"
   */
  pkgbase: z.string().min(1),
  /**
   * The name of the repository.
   * @example "my-stable-repo"
   */
  repo: PackageRepoSchema,
});
export type SplitPackagesQueryParams = z.infer<
  typeof SplitPackagesQueryParamsSchema
>;

export const SplitPackagesResponseSchema = BriefPackageListSchema;
export type SplitPackagesResponse = z.infer<typeof SplitPackagesResponseSchema>;
