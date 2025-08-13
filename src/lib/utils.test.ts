import {describe, expect, test} from 'bun:test';

import {PackageArch, PackageDetails} from './types';
import {
  convertURLSearchParamsToObject,
  getDownloadMirrorUrl,
  getPkgverWithoutBuildnum,
  pagination,
} from './utils';

describe('convertURLSearchParamsToObject', () => {
  test('should return an empty object for null input', () => {
    expect(convertURLSearchParamsToObject(null)).toEqual({});
  });

  test('should return an empty object for empty URLSearchParams', () => {
    const params = new URLSearchParams('');
    expect(convertURLSearchParamsToObject(params)).toEqual({});
  });

  test('should handle single values correctly', () => {
    const params = new URLSearchParams('a=1&b=2');
    expect(convertURLSearchParamsToObject(params)).toEqual({a: '1', b: '2'});
  });

  test('should handle multiple values correctly', () => {
    const params = new URLSearchParams('a=1&a=2&b=3');
    expect(convertURLSearchParamsToObject(params)).toEqual({
      a: ['1', '2'],
      b: '3',
    });
  });

  test('should handle a mix of single and multiple values', () => {
    const params = new URLSearchParams('a=1&b=2&b=3&c=4');
    expect(convertURLSearchParamsToObject(params)).toEqual({
      a: '1',
      b: ['2', '3'],
      c: '4',
    });
  });

  test('should handle special characters in values', () => {
    const params = new URLSearchParams('a=a%20b&b=c%26d');
    expect(convertURLSearchParamsToObject(params)).toEqual({
      a: 'a b',
      b: 'c&d',
    });
  });
});

describe('gather original pkgver without build number', () => {
  test('simple', () => {
    const expectedVal = '34-1';
    expect(getPkgverWithoutBuildnum('34-1')).toBe(expectedVal);
    expect(getPkgverWithoutBuildnum('34-1.1')).toBe(expectedVal);
    expect(getPkgverWithoutBuildnum('34-1.2')).toBe(expectedVal);
    expect(getPkgverWithoutBuildnum('34-1.3')).toBe(expectedVal);

    expect(getPkgverWithoutBuildnum('34-1.3\\@')).toBe(expectedVal);
    expect(getPkgverWithoutBuildnum('34-1.\\@')).toBe(expectedVal);
  });
  test('complex', () => {
    const expectedVal = '6.7.0git20240406-1';
    expect(getPkgverWithoutBuildnum('6.7.0git20240406-1')).toBe(expectedVal);
    expect(getPkgverWithoutBuildnum('6.7.0git20240406-1.1')).toBe(expectedVal);
    expect(getPkgverWithoutBuildnum('6.7.0git20240406-1.2')).toBe(expectedVal);
    expect(getPkgverWithoutBuildnum('6.7.0git20240406-1.3')).toBe(expectedVal);

    expect(getPkgverWithoutBuildnum('6.7.0git20240406-1.3\\@')).toBe(
      expectedVal
    );
    expect(getPkgverWithoutBuildnum('6.7.0git20240406-1.\\@')).toBe(
      expectedVal
    );
  });
  test('git ver', () => {
    const expectedVal = '1:0+374+9e8c5423-1';
    expect(getPkgverWithoutBuildnum('1:0+374+9e8c5423-1')).toBe(expectedVal);
    expect(getPkgverWithoutBuildnum('1:0+374+9e8c5423-1.1')).toBe(expectedVal);
    expect(getPkgverWithoutBuildnum('1:0+374+9e8c5423-1.2')).toBe(expectedVal);
    expect(getPkgverWithoutBuildnum('1:0+374+9e8c5423-1.3')).toBe(expectedVal);

    expect(getPkgverWithoutBuildnum('1:0+374+9e8c5423-1.3\\@')).toBe(
      expectedVal
    );
    expect(getPkgverWithoutBuildnum('1:0+374+9e8c5423-1.\\@')).toBe(
      expectedVal
    );
  });
});

function makePkg(overrides: Partial<PackageDetails>): PackageDetails {
  return {
    pkg_arch: PackageArch.x86_64,
    pkg_base: 'base',
    pkg_builddate: 0,
    pkg_checkdepends: [],
    pkg_conflicts: [],
    pkg_csize: 0,
    pkg_depends: [],
    pkg_desc: '',
    pkg_files: [],
    pkg_groups: [],
    pkg_isize: 0,
    pkg_license: [],
    pkg_makedepends: [],
    pkg_name: 'pkg',
    pkg_optdepends: [],
    pkg_packager: '',
    pkg_pgpsig: '',
    pkg_provides: [],
    pkg_replaces: [],
    pkg_sha256sum: '',
    pkg_url: null,
    pkg_version: '1.0.0-1',
    repo_name: 'cachyos',
    updated: 0,
    ...overrides,
  };
}

describe('getDownloadMirrorUrl', () => {
  test('returns correct URL for different architectures', () => {
    const x86_64Pkg = makePkg({
      pkg_arch: PackageArch.x86_64,
      pkg_name: 'foo',
      pkg_version: '2.3.4-1',
      repo_name: 'cachyos',
    });
    expect(getDownloadMirrorUrl(x86_64Pkg)).toBe(
      'https://cdn77.cachyos.org/repo/x86_64/cachyos/foo-2.3.4-1-x86_64.pkg.tar.zst'
    );

    const anyArchPkg = makePkg({
      pkg_arch: PackageArch.Any,
      pkg_name: 'bar',
      pkg_version: '1.0.0-2',
      repo_name: 'cachyos',
    });
    expect(getDownloadMirrorUrl(anyArchPkg)).toBe(
      'https://cdn77.cachyos.org/repo/x86_64/cachyos/bar-1.0.0-2-any.pkg.tar.zst'
    );
  });

  test('returns correct URL for architecture-specific repos', () => {
    const v3Pkg = makePkg({
      pkg_arch: PackageArch.x86_64_v3,
      pkg_name: 'v3pkg',
      pkg_version: '2.0.0-2',
      repo_name: 'cachyos-v3',
    });
    expect(getDownloadMirrorUrl(v3Pkg)).toBe(
      'https://cdn77.cachyos.org/repo/x86_64_v3/cachyos-v3/v3pkg-2.0.0-2-x86_64_v3.pkg.tar.zst'
    );

    const v4Pkg = makePkg({
      pkg_arch: PackageArch.x86_64_v4,
      pkg_name: 'znver4pkg',
      pkg_version: '0.1.0-1',
      repo_name: 'cachyos-znver4',
    });
    expect(getDownloadMirrorUrl(v4Pkg)).toBe(
      'https://cdn77.cachyos.org/repo/x86_64_v4/cachyos-znver4/znver4pkg-0.1.0-1-x86_64_v4.pkg.tar.zst'
    );
  });

  test('encodes special characters in package name and version', () => {
    const pkg = makePkg({
      pkg_arch: PackageArch.x86_64,
      pkg_name: 'foo/bar@baz',
      pkg_version: '1.0.0:beta+1',
      repo_name: 'cachyos',
    });
    expect(getDownloadMirrorUrl(pkg)).toBe(
      'https://cdn77.cachyos.org/repo/x86_64/cachyos/foo%2Fbar%40baz-1.0.0%3Abeta%2B1-x86_64.pkg.tar.zst'
    );
  });
});

describe('pagination', () => {
  test('should handle edge cases', () => {
    // Single page
    expect(pagination(1, 1)).toEqual([1]);

    // Two pages
    expect(pagination(1, 2)).toEqual([1, 2]);
    expect(pagination(2, 2)).toEqual([1, 2]);

    // Three pages
    expect(pagination(1, 3)).toEqual([1, 2, 3]);
    expect(pagination(2, 3)).toEqual([1, 2, 3]);
    expect(pagination(3, 3)).toEqual([1, 2, 3]);
  });

  test('should show all pages when total pages is small', () => {
    // With default siblingCount=2, we show all pages if totalPages <= 7
    expect(pagination(1, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(pagination(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(pagination(7, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  test('should show right ellipsis only (beginning pages)', () => {
    // Case 1: No left ellipsis, but right ellipsis
    expect(pagination(1, 10)).toEqual([1, 2, 3, 4, 5, 6, 7, '…', 10]);
    expect(pagination(2, 10)).toEqual([1, 2, 3, 4, 5, 6, 7, '…', 10]);
    expect(pagination(3, 10)).toEqual([1, 2, 3, 4, 5, 6, 7, '…', 10]);
    expect(pagination(4, 10)).toEqual([1, 2, 3, 4, 5, 6, 7, '…', 10]);
    expect(pagination(5, 10)).toEqual([1, 2, 3, 4, 5, 6, 7, '…', 10]);
  });

  test('should show left ellipsis only (ending pages)', () => {
    // Case 2: Left ellipsis, but no right ellipsis
    expect(pagination(10, 10)).toEqual([1, '…', 4, 5, 6, 7, 8, 9, 10]);
    expect(pagination(9, 10)).toEqual([1, '…', 4, 5, 6, 7, 8, 9, 10]);
    expect(pagination(8, 10)).toEqual([1, '…', 4, 5, 6, 7, 8, 9, 10]);
    expect(pagination(7, 10)).toEqual([1, '…', 4, 5, 6, 7, 8, 9, 10]);
    expect(pagination(6, 10)).toEqual([1, '…', 4, 5, 6, 7, 8, 9, 10]);
  });

  test('should show both ellipses (middle pages)', () => {
    // Case 3: Both left and right ellipsis
    expect(pagination(6, 11)).toEqual([1, '…', 4, 5, 6, 7, 8, '…', 11]);
    expect(pagination(6, 15)).toEqual([1, '…', 4, 5, 6, 7, 8, '…', 15]);
    expect(pagination(8, 20)).toEqual([1, '…', 6, 7, 8, 9, 10, '…', 20]);
  });

  test('should handle custom siblingCount', () => {
    // siblingCount = 1
    expect(pagination(5, 10, 1)).toEqual([1, '…', 4, 5, 6, '…', 10]);
    expect(pagination(1, 10, 1)).toEqual([1, 2, 3, 4, 5, '…', 10]);
    expect(pagination(10, 10, 1)).toEqual([1, '…', 6, 7, 8, 9, 10]);

    // siblingCount = 3
    expect(pagination(7, 15, 3)).toEqual([
      1,
      '…',
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      '…',
      15,
    ]);
    expect(pagination(1, 15, 3)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, '…', 15]);
    expect(pagination(15, 15, 3)).toEqual([
      1,
      '…',
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
    ]);
  });

  test('should handle boundary transitions correctly', () => {
    // Test the transition points where ellipsis appear/disappear
    expect(pagination(5, 11)).toEqual([1, 2, 3, 4, 5, 6, 7, '…', 11]);
    expect(pagination(6, 11)).toEqual([1, '…', 4, 5, 6, 7, 8, '…', 11]);

    expect(pagination(6, 11)).toEqual([1, '…', 4, 5, 6, 7, 8, '…', 11]);
    expect(pagination(7, 11)).toEqual([1, '…', 5, 6, 7, 8, 9, 10, 11]);
  });

  test('should maintain consistent item count with ellipses', () => {
    // With default siblingCount=2, target is 2*2+5=9 items when both ellipses are present
    const result = pagination(10, 20);
    expect(result).toEqual([1, '…', 8, 9, 10, 11, 12, '…', 20]);
    expect(result).toHaveLength(9);

    // With siblingCount=1, target is 1*2+5=7 items
    const result2 = pagination(10, 20, 1);
    expect(result2).toEqual([1, '…', 9, 10, 11, '…', 20]);
    expect(result2).toHaveLength(7);
  });

  test('should handle large page numbers', () => {
    expect(pagination(500, 1000)).toEqual([
      1,
      '…',
      498,
      499,
      500,
      501,
      502,
      '…',
      1000,
    ]);
    expect(pagination(1, 1000)).toEqual([1, 2, 3, 4, 5, 6, 7, '…', 1000]);
    expect(pagination(1000, 1000)).toEqual([
      1,
      '…',
      994,
      995,
      996,
      997,
      998,
      999,
      1000,
    ]);
  });

  test('should handle zero siblingCount', () => {
    expect(pagination(5, 10, 0)).toEqual([1, '…', 5, '…', 10]);
    expect(pagination(1, 10, 0)).toEqual([1, 2, 3, '…', 10]);
    expect(pagination(10, 10, 0)).toEqual([1, '…', 8, 9, 10]);
  });
});
