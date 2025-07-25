import {beforeEach, describe, expect, it, setSystemTime} from 'bun:test';

import {Cache} from './cache';

describe('Cache', () => {
  let cache: Cache;

  beforeEach(() => {
    cache = new Cache();
  });

  it('should store and retrieve a string value', () => {
    const key = 'test-key';
    const value = 'test-value';
    const ttl = 1000;

    expect(cache.put(key, value, ttl)).toBe(true);
    expect(cache.get<typeof value>(key)).toBe(value);
  });

  it('should store and retrieve an object value', () => {
    const key = 'obj-key';
    const value = {foo: 'bar'};
    const ttl = 1000;

    expect(cache.put(key, value, ttl)).toBe(true);
    expect(cache.get<typeof value>(key)).toEqual(value);
  });

  it('should check if a key exists', () => {
    const key = 'exists-key';
    const value = 'value';
    cache.put(key, value, 1000);
    expect(cache.hasKey(key)).toBe(true);
    expect(cache.hasKey('missing-key')).toBe(false);
  });

  it('should return null for a non-existent key', () => {
    expect(cache.get('no-key')).toBeNull();
  });

  it('should return null for an expired key', () => {
    const key = 'expire-key';
    cache.put(key, 'value', 100);
    setSystemTime(new Date(Date.now() + 200));
    expect(cache.get(key)).toBeNull();
  });

  it('should store and retrieve a value without ttl', () => {
    const key = 'no-ttl-key';
    const value = 'no-ttl-value';
    expect(cache.put(key, value)).toBe(true);
    expect(cache.get<typeof value>(key)).toBe(value);
  });

  it('should clear all entries', () => {
    cache.put('a', '1');
    cache.put('b', '2');
    cache.clear();
    expect(cache.size()).toBe(0);
    expect(cache.get('a')).toBeNull();
    expect(cache.get('b')).toBeNull();
  });

  it('should delete a key', () => {
    cache.put('del-key', 'value');
    expect(cache.delete('del-key')).toBe(true);
    expect(cache.get('del-key')).toBeNull();
    expect(cache.delete('del-key')).toBe(false);
  });

  it('should enforce max size', () => {
    const smallCache = new Cache({maxSize: 3});
    smallCache.put('k1', 1);
    smallCache.put('k2', 2);
    smallCache.put('k3', 3);
    smallCache.put('k4', 4);
    expect(smallCache.size()).toBeLessThanOrEqual(3);
    expect(smallCache.get('k1')).toBeNull(); // k1 should be evicted
    expect(smallCache.get<number>('k2')).toBe(2);
    expect(smallCache.get<number>('k3')).toBe(3);
    expect(smallCache.get<number>('k4')).toBe(4);
  });

  it('should cleanup expired entries', () => {
    cache.put('exp1', 'v1', 100);
    cache.put('exp2', 'v2', 100);
    setSystemTime(new Date(Date.now() + 200));
    const removed = cache.cleanup();
    expect(removed).toBeGreaterThanOrEqual(2);
    expect(cache.size()).toBe(0);
  });

  it('should close the cache without error', () => {
    expect(() => cache.close()).not.toThrow();
  });
});
