import fetcher from '@/lib/fetcher';
import {PROFILES, swrCached} from '@/lib/server/swr-cache';
import {
  type Mirror,
  type MirrorBaseline,
  MirrorsResponseSchema,
} from '@/lib/types';

// cached values are read unvalidated, so bump on every shape change.
export const MIRRORS_CACHE_KEY = 'mirrors:data:v2';

const PRIMARY_MIRROR_URL = 'https://build.cachyos.org/repo';
const FETCH_TIMEOUT_MS = 2000;

const REPO_PATHS = [
  'x86_64/cachyos',
  'x86_64_v3/cachyos-v3',
  'x86_64_v3/cachyos-core-v3',
  'x86_64_v3/cachyos-extra-v3',
  'x86_64_v4/cachyos-v4',
  'x86_64_v4/cachyos-core-v4',
  'x86_64_v4/cachyos-extra-v4',
  'x86_64_v4/cachyos-znver4',
  'x86_64_v4/cachyos-core-znver4',
  'x86_64_v4/cachyos-extra-znver4',
] as const;

export async function getMirrorsData() {
  return swrCached(MIRRORS_CACHE_KEY, computeMirrorsData, PROFILES.mirrors);
}

async function computeMirrorsData(): Promise<{
  baselines: MirrorBaseline[];
  mirrors: Mirror[];
}> {
  const [baselines, {mirrors}] = await Promise.all([
    fetchBaselines(),
    fetcher('/v1/mirrors', new Headers(), MirrorsResponseSchema, {
      method: 'GET',
    }),
  ]);

  return {baselines, mirrors: sortMirrors(mirrors)};
}

async function fetchBaselines(): Promise<MirrorBaseline[]> {
  return Promise.all(
    REPO_PATHS.map(async path => ({
      path,
      timestamp: await fetchRepoTimestampMs(path),
    }))
  );
}

/**
 * Reads a repo `lastupdate` as milliseconds.
 */
async function fetchRepoTimestampMs(repoPath: string): Promise<null | number> {
  const url = `${PRIMARY_MIRROR_URL}/${repoPath}/lastupdate`;

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return null;

    const text = await res.text();
    const microseconds = Number.parseInt(text.trim(), 10);
    return Number.isNaN(microseconds) ? null : Math.floor(microseconds / 1000);
  } catch (err) {
    console.debug(`Failed to fetch ${url}:`, err);
    return null;
  }
}

const STATUS_RANK: Record<Mirror['overall_status'], number> = {
  error: 3,
  healthy: 0,
  'out-of-sync': 2,
  partial: 1,
};

// Sorts mirrors of unknown lag last, rather than first as `null` would.
const NO_LAG = Number.MAX_SAFE_INTEGER;

/**
 * Orders mirrors by health, then by lag. The API groups them by tier instead.
 */
function sortMirrors(mirrors: Mirror[]): Mirror[] {
  return [...mirrors].sort(
    (a, b) =>
      STATUS_RANK[a.overall_status] - STATUS_RANK[b.overall_status] ||
      (a.average_lag_seconds ?? NO_LAG) - (b.average_lag_seconds ?? NO_LAG)
  );
}
