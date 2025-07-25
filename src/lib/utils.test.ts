import {describe, expect, test} from 'bun:test';

import {
  convertURLSearchParamsToObject,
  getPkgverWithoutBuildnum,
} from '@/lib/utils';

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
