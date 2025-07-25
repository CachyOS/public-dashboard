import {type ClassValue, clsx} from 'clsx';
import {SearchParams} from 'next/dist/server/request/search-params';
import {twMerge} from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts a URLSearchParams object into a more usable typed object format.
 *
 * @param params The `URLSearchParams` object to convert. Can be `null`.
 * @returns A record representing the converted search parameters.
 *
 * @example
 * const params = new URLSearchParams('q=test&filter=new&filter=active');
 * const result = convertURLSearchParamsToObject(params);
 * // result is { q: 'test', filter: ['new', 'active'] }
 */
export function convertURLSearchParamsToObject(
  params: null | URLSearchParams
): Record<string, readonly string[] | string> {
  if (!params) {
    return {};
  }

  const result: Record<string, readonly string[] | string> = {};
  for (const key of params.keys()) {
    const allValues = params.getAll(key);
    result[key] = allValues.length > 1 ? allValues : allValues[0];
  }
  return result;
}

/**
 * Extracts the package version without the build number suffix.
 *
 * @param pkgver The full package version string (e.g., "1.0.0-1.2", "20230101-1", "1.2.3-1").
 * @returns The package version string without the build number, if found.
 *          Otherwise, returns the original pkgver string.
 */
export function getPkgverWithoutBuildnum(pkgver: string): string {
  // Find the last dash in the string.
  const dashPos = pkgver.lastIndexOf('-');

  // Ignore invalid package version.
  if (dashPos === -1) {
    return pkgver;
  }

  const pkgrel = pkgver.slice(dashPos + 1);
  const dotPos = pkgrel.indexOf('.');

  // If no dot is found in the pkgrel, it means there's no build number suffix.
  if (dotPos === -1) {
    return pkgver;
  }

  // `dashPos` is the index of the last dash in `pkgver`.
  // `dotPos` is the index of the first dot in `pkgrel`.
  return pkgver.substring(0, dashPos + dotPos + 1);
}
