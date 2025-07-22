import {describe, expect, test} from 'bun:test';

import {getPkgverWithoutBuildnum} from './utils';

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
