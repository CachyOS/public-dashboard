import {type ClassValue, clsx} from 'clsx';
import {twMerge} from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
