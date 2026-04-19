import {afterAll, beforeAll, describe, expect, mock, test} from 'bun:test';

type SwrCache = typeof import('./swr-cache');

let mod: SwrCache;
let originalCache: string | undefined;

beforeAll(async () => {
  originalCache = process.env.CACHE;
  process.env.CACHE = '';
  mod = await import('./swr-cache');
});

afterAll(() => {
  if (originalCache === undefined) delete process.env.CACHE;
  else process.env.CACHE = originalCache;
});

let counter = 0;
function uniqueKey(label: string): string {
  return `test:${label}:${Date.now()}:${counter++}`;
}

describe('swrCached timing semantics', () => {
  test('returns cached value and skips fn when age <= revalidate', async () => {
    const key = uniqueKey('fresh');
    mod.seedCache(key, 'cached', mod.PROFILES.mirrors);
    const fn = mock(async () => 'fresh');
    const result = await mod.swrCached(key, fn, mod.PROFILES.mirrors);
    expect(result).toBe('cached');
    expect(fn).not.toHaveBeenCalled();
  });

  test('serves stale value and fires background refresh when revalidate < age <= expire', async () => {
    const key = uniqueKey('stale');
    const profile = mod.PROFILES.mirrors;
    const staleAt = Date.now() - (profile.revalidate + 10) * 1000;
    mod.seedCache(key, 'stale', profile, staleAt);

    const fn = mock(async () => 'refreshed');
    const result = await mod.swrCached(key, fn, profile);
    expect(result).toBe('stale');
    expect(fn).toHaveBeenCalledTimes(1);

    await new Promise(r => setTimeout(r, 20));

    const fn2 = mock(async () => 'unused');
    const result2 = await mod.swrCached(key, fn2, profile);
    expect(result2).toBe('refreshed');
    expect(fn2).not.toHaveBeenCalled();
  });

  test('blocks and re-fetches when entry is past expire', async () => {
    const key = uniqueKey('expired');
    const profile = mod.PROFILES.mirrors;
    const expiredAt = Date.now() - (profile.expire + 10) * 1000;
    mod.seedCache(key, 'stale-expired', profile, expiredAt);

    const fn = mock(async () => 'fresh-value');
    const result = await mod.swrCached(key, fn, profile);
    expect(result).toBe('fresh-value');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('blocks and fetches when key is absent', async () => {
    const key = uniqueKey('miss');
    const fn = mock(async () => 'fetched');
    const result = await mod.swrCached(key, fn, mod.PROFILES.mirrors);
    expect(result).toBe('fetched');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('dedupes concurrent refreshes for the same key', async () => {
    const key = uniqueKey('dedupe');
    const fn = mock(async () => {
      await new Promise(r => setTimeout(r, 20));
      return 'once';
    });
    const [a, b, c] = await Promise.all([
      mod.swrCached(key, fn, mod.PROFILES.mirrors),
      mod.swrCached(key, fn, mod.PROFILES.mirrors),
      mod.swrCached(key, fn, mod.PROFILES.mirrors),
    ]);
    expect([a, b, c]).toEqual(['once', 'once', 'once']);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('refresh advances updatedAt so the next read is fresh (no new fn call)', async () => {
    const key = uniqueKey('updated-at');
    const profile = mod.PROFILES.mirrors;
    const staleAt = Date.now() - (profile.revalidate + 10) * 1000;
    mod.seedCache(key, 'old', profile, staleAt);

    const fn = mock(async () => 'new');
    const first = await mod.swrCached(key, fn, profile);
    expect(first).toBe('old');

    await new Promise(r => setTimeout(r, 20));

    const fn2 = mock(async () => 'unused');
    const second = await mod.swrCached(key, fn2, profile);
    expect(second).toBe('new');
    expect(fn2).not.toHaveBeenCalled();
  });
});
