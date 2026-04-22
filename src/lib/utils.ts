import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { PackageDetails, PackageRepo } from './types';

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
 * Returns the download mirror URL for CachyOS or Arch Linux packages.
 *
 * @returns The download mirror URL as a string.
 * @example https://cdn77.cachyos.org/repo/x86_64/cachyos/64gram-desktop-1%3A1.1.58-2-x86_64.pkg.tar.zst
 * @example https://archlinux.cachyos.org/repo/extra/os/x86_64/cargo-rdme-1.5.0-1-x86_64.pkg.tar.zst
 */
export function getDownloadMirrorUrl(pkg: PackageDetails): string {
  const { pkg_arch, pkg_name, pkg_version, repo_name } = pkg;
  const arch = getArch(repo_name);
  const encodedName = encodeURIComponent(pkg_name);
  const encodedVersion = encodeURIComponent(pkg_version);
  const pkgFile = `${encodedName}-${encodedVersion}-${pkg_arch}.pkg.tar.zst`;

  const isArchlinux = [PackageRepo.CORE, PackageRepo.EXTRA].includes(
    repo_name as PackageRepo
  );
  if (isArchlinux) {
    return `https://archlinux.cachyos.org/repo/${repo_name}/os/${arch}/${pkgFile}`;
  } else {
    return `https://cdn77.cachyos.org/repo/${arch}/${repo_name}/${pkgFile}`;
  }
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

function getArch(repoName: string): string {
  if (repoName.endsWith('v4') || repoName.endsWith('znver4')) {
    return 'x86_64_v4';
  }
  if (repoName.endsWith('v3')) {
    return 'x86_64_v3';
  }
  return 'x86_64';
}

export const INTL_LOCALE = new Intl.Locale('en-IE');

export const ELLIPSIS = '…';

/**
 * Generates pagination items for a given current page and total pages.
 *
 * @param currentPage The current page number.
 * @param totalPages The total number of pages.
 * @param siblingCount The number of sibling pages to show on each side of the current page
 * @returns An array of page numbers and ellipsis strings for pagination.
 */
export function pagination(
  currentPage: number,
  totalPages: number,
  siblingCount: number = 2
): (number | typeof ELLIPSIS)[] {
  const FIRST_PAGE = 1;
  const OFFSET = 1;
  const FIXED_PAGINATION_ELEMENTS = 5; // first, last, current, left ellipsis, right ellipsis

  if (totalPages <= 0) return [];
  currentPage = Math.max(FIRST_PAGE, Math.min(currentPage, totalPages));

  const totalVisiblePages = siblingCount * 2 + FIXED_PAGINATION_ELEMENTS;
  if (totalPages <= totalVisiblePages) {
    return range(FIRST_PAGE, totalPages);
  }

  const result: (number | typeof ELLIPSIS)[] = [];

  const leftSiblingIndex = Math.max(currentPage - siblingCount, FIRST_PAGE);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const leftEllipsisIndex = leftSiblingIndex - OFFSET;
  const rightEllipsisIndex = rightSiblingIndex + OFFSET;

  const hasLeftEllipsis = leftEllipsisIndex > 2;
  const hasRightEllipsis = rightEllipsisIndex < totalPages - OFFSET;

  result.push(FIRST_PAGE);

  if (hasLeftEllipsis) {
    result.push(ELLIPSIS);
  }

  let left = FIRST_PAGE + OFFSET;
  let right = totalPages - OFFSET;

  if (hasLeftEllipsis && hasRightEllipsis) {
    left = leftSiblingIndex;
    right = rightSiblingIndex;
  } else if (!hasLeftEllipsis && hasRightEllipsis) {
    const numbersToShow = totalVisiblePages - 2; // ellipsis, last
    right = Math.max(numbersToShow, rightSiblingIndex);
  } else if (hasLeftEllipsis && !hasRightEllipsis) {
    const numbersToShow = totalVisiblePages - OFFSET - 2; // first, ellipsis
    left = Math.min(totalPages - numbersToShow, leftSiblingIndex);
  }

  for (let i = left; i <= right; i++) {
    result.push(i);
  }

  if (hasRightEllipsis) {
    result.push(ELLIPSIS);
  }

  result.push(totalPages);

  return result;
}

/**
 * Generates an array of numbers from `start` to `end`, inclusive.
 *
 * @param start The starting number.
 * @param end The ending number.
 * @returns An array of numbers from `start` to `end`.
 */
export function range(start: number, end: number): number[] {
  const INCLUSIVE_OFFSET = 1;
  return Array.from(
    { length: end - start + INCLUSIVE_OFFSET },
    (_, i) => i + start
  );
}

// TODO: Use https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DurationFormat when available
export function readableDuration(seconds: number): string {
  if (seconds === 0) return '0 seconds';

  const units: { unit: string; value: number }[] = [
    { unit: 'day', value: 86400 },
    { unit: 'hour', value: 3600 },
    { unit: 'minute', value: 60 },
    { unit: 'second', value: 1 },
  ];

  const parts: string[] = [];
  let remaining = seconds;

  for (const { unit, value } of units) {
    if (remaining >= value) {
      const quantity = Math.floor(remaining / value);
      remaining %= value;

      const suffix = quantity > 1 ? 's' : '';
      parts.push(`${quantity} ${unit}${suffix}`);
    }
  }

  return parts.join(', ');
}
