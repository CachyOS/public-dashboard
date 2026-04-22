import {readFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

import Redis from 'ioredis';

export type CacheProfile = {
  /** Hard TTL in seconds. Past this, cached value is dropped. */
  expire: number;
  /** Seconds after which a read triggers a background refresh. */
  revalidate: number;
};

export const PROFILES = {
  aur: {expire: 60 * 60, revalidate: 60 * 60},
  fetcher: {expire: 60 * 60, revalidate: 60 * 60},
  github: {expire: 60 * 60, revalidate: 60 * 60},
  mirrors: {expire: 60 * 60, revalidate: 10 * 60},
} as const satisfies Record<string, CacheProfile>;

export type ProfileName = keyof typeof PROFILES;

type Entry<T> = {
  profile: CacheProfile;
  updatedAt: number;
  value: T;
};

const MAX_MEMORY_ENTRIES = 500;
const memory = new Map<string, Entry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

const DEBUG =
  import.meta.env.SWR_DEBUG === '1' ||
  (import.meta.env.DEBUG ?? '').toLowerCase().includes('swr');

function dbg(
  event: string,
  key: string,
  extra?: Record<string, unknown>
): void {
  if (!DEBUG) return;
  const suffix = extra ? ` ${JSON.stringify(extra)}` : '';
  console.info(`[swr:${event}] ${key}${suffix}`);
}

function memorySet(key: string, entry: Entry<unknown>): void {
  if (memory.has(key)) memory.delete(key);
  memory.set(key, entry);
  while (memory.size > MAX_MEMORY_ENTRIES) {
    const oldest = memory.keys().next().value;
    if (oldest === undefined) break;
    memory.delete(oldest);
  }
}

let redisPromise: null | Promise<null | Redis> = null;

type PrefillEntry = {
  key: string;
  profileName: ProfileName;
  updatedAt: number;
  value: unknown;
};

type PrefillPayload = {entries: PrefillEntry[]; updatedAt: number};

/** Seed the cache from a pre-built payload (called by the prefill loader). */
export function seedCache<T>(
  key: string,
  value: T,
  profile: CacheProfile,
  updatedAt = Date.now()
): void {
  const entry: Entry<T> = {profile, updatedAt, value};
  memorySet(key, entry);
  dbg('seed', key, {age: Math.round((Date.now() - updatedAt) / 1000)});
  void writeBacking(key, entry).catch(err =>
    console.error('[swr] seed redis write failed:', err)
  );
}

/**
 * Stale-while-revalidate cache. Mirrors the legacy Next.js `'use cache'` +
 * `cacheLife` semantics: serve cached value when fresh or within `expire`
 * window; trigger background refresh once past `revalidate`; block and refresh
 * only when past `expire` or never cached.
 */
export async function swrCached<T>(
  key: string,
  fn: () => Promise<T>,
  profile: CacheProfile
): Promise<T> {
  const entry = await readBacking<T>(key);

  if (entry) {
    const age = ageSeconds(entry);
    if (age <= profile.revalidate) {
      dbg('hit-fresh', key, {age: Math.round(age)});
      return entry.value;
    }
    if (age <= profile.expire) {
      dbg('hit-stale', key, {age: Math.round(age)});
      void refresh(key, fn, profile).catch(err =>
        console.error(`[swr] background refresh failed for ${key}:`, err)
      );
      return entry.value;
    }
    dbg('expired', key, {age: Math.round(age)});
  } else {
    dbg('miss', key);
  }

  return refresh(key, fn, profile);
}

function ageSeconds(entry: Entry<unknown>): number {
  return (Date.now() - entry.updatedAt) / 1000;
}

function autoSeedFromPrefill(): void {
  if (isBuildPhase()) return;
  for (const path of candidatePrefillPaths()) {
    let raw: string;
    try {
      raw = readFileSync(path, 'utf-8');
    } catch {
      continue;
    }
    try {
      const payload = JSON.parse(raw) as PrefillPayload;
      let seeded = 0;
      for (const entry of payload.entries) {
        const profile = PROFILES[entry.profileName];
        if (!profile) continue;
        seedCache(entry.key, entry.value, profile, entry.updatedAt);
        seeded++;
      }
      console.info(
        `[swr] seeded ${seeded} entr${seeded === 1 ? 'y' : 'ies'} from ${path}`
      );
    } catch (err) {
      console.warn(
        `[swr] prefill parse failed (${path}):`,
        (err as Error).message
      );
    }
    return;
  }
}

function candidatePrefillPaths(): string[] {
  const paths: string[] = [];
  if (import.meta.env.CACHE_PREFILL_PATH)
    paths.push(import.meta.env.CACHE_PREFILL_PATH);
  try {
    const here = dirname(fileURLToPath(import.meta.url));
    paths.push(resolve(here, '..', 'cache-prefill.json'));
    paths.push(resolve(here, '..', '..', 'cache-prefill.json'));
  } catch {
    // import.meta.url unavailable
  }
  paths.push(resolve(process.cwd(), 'dist', 'cache-prefill.json'));
  return paths;
}

async function getRedis(): Promise<null | Redis> {
  if (isBuildPhase()) return null;
  if ((process.env.CACHE ?? '').toLowerCase() !== 'redis') return null;
  if (!redisPromise) redisPromise = setupRedisClient();
  return redisPromise;
}

function isBuildPhase(): boolean {
  return process.env.BUILD_PHASE === '1';
}

async function readBacking<T>(key: string): Promise<Entry<T> | null> {
  const mem = memory.get(key) as Entry<T> | undefined;
  if (mem) {
    dbg('mem-hit', key, {age: Math.round(ageSeconds(mem))});
    return mem;
  }
  const client = await getRedis();
  if (!client) {
    dbg('mem-miss', key);
    return null;
  }
  try {
    const raw = await client.get(key);
    if (!raw) {
      dbg('redis-miss', key);
      return null;
    }
    const parsed = JSON.parse(raw) as Entry<T>;
    memorySet(key, parsed);
    dbg('redis-hit', key, {age: Math.round(ageSeconds(parsed))});
    return parsed;
  } catch (err) {
    console.error('[swr] redis read error:', err);
    return null;
  }
}
function refresh<T>(
  key: string,
  fn: () => Promise<T>,
  profile: CacheProfile
): Promise<T> {
  const existing = inflight.get(key) as Promise<T> | undefined;
  if (existing) {
    dbg('dedupe', key);
    return existing;
  }
  const task = (async () => {
    const started = Date.now();
    dbg('fetch-start', key);
    try {
      const value = await fn();
      const durationMs = Date.now() - started;
      await writeBacking(key, {profile, updatedAt: Date.now(), value});
      dbg('fetch-ok', key, {durationMs});
      return value;
    } catch (err) {
      dbg('fetch-err', key, {
        durationMs: Date.now() - started,
        error: (err as Error).message,
      });
      throw err;
    } finally {
      inflight.delete(key);
    }
  })();
  inflight.set(key, task);
  return task;
}

async function setupRedisClient(): Promise<null | Redis> {
  const redisUrl = new URL(process.env.REDIS_URL ?? 'http://localhost:6379');
  const redisClient = new Redis(redisUrl.toString(), {
    name: process.env.REDIS_MASTER_NAME ?? 'shard_master0',
    password: process.env.REDIS_PASSWORD ?? '1234',
    sentinelPassword: process.env.REDIS_SENTINEL_PASSWORD ?? '1234',
    sentinels: [{host: redisUrl.hostname}],
  });
  console.info('[swr] Connecting ioredis client...');
  try {
    await new Promise<void>((resolvePromise, rejectPromise) => {
      redisClient.once('ready', () => {
        console.info('[swr] ioredis client ready.');
        resolvePromise();
      });
      redisClient.once('error', rejectPromise);
    });
    redisClient.on('error', err => console.error('[swr] redis error:', err));
    return redisClient;
  } catch (error) {
    console.warn('[swr] Failed to connect Redis client:', error);
    try {
      redisClient.disconnect();
    } catch (disconnectError) {
      console.error(
        '[swr] Failed to disconnect Redis client after connection failure:',
        disconnectError
      );
    }
    return null;
  }
}

async function writeBacking<T>(key: string, entry: Entry<T>): Promise<void> {
  memorySet(key, entry);
  const client = await getRedis();
  if (!client) {
    dbg('set-mem', key, {ttl: entry.profile.expire});
    return;
  }
  try {
    await client.set(key, JSON.stringify(entry), 'EX', entry.profile.expire);
    dbg('set-redis', key, {ttl: entry.profile.expire});
  } catch (err) {
    console.error('[swr] redis write error:', err);
  }
}

autoSeedFromPrefill();
