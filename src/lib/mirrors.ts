import {cacheLife} from 'next/cache';

import {fetchMirrorlist} from './github';
import {Mirror, RepoCheck, RepoStatus} from './types';

const PRIMARY_MIRROR_URL = 'https://build.cachyos.org/repo';
const FETCH_TIMEOUT_MS = 6000;
const SYNC_TOLERANCE_SECONDS = 3600;

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
  'use cache';
  cacheLife('minutes');

  const mirrorsList = await fetchMirrorlist();

  const baselinePromises = REPO_PATHS.map(async path => ({
    path,
    timestamp: await fetchRepoTimestamp(PRIMARY_MIRROR_URL, path),
  }));

  const baselines = await Promise.all(baselinePromises);
  const baselineMap = new Map(baselines.map(b => [b.path, b.timestamp]));

  const mirrorChecks = mirrorsList.map(async mirrorUrl => {
    const checks: RepoCheck[] = [];
    // Sequential to avoid overwhelming mirrors
    for (const path of REPO_PATHS) {
      const timestamp = await fetchRepoTimestamp(mirrorUrl, path);
      const baseline = baselineMap.get(path);

      let status: RepoStatus = 'error';
      let lag: null | number = null;

      if (timestamp !== null) {
        if (baseline) {
          lag = baseline - timestamp;
          status = lag <= SYNC_TOLERANCE_SECONDS ? 'synced' : 'out-of-sync';
        } else {
          status = 'synced';
        }
      }

      checks.push({
        lastUpdated: timestamp,
        path,
        status,
        syncLagSeconds: lag,
      });
    }

    const validChecks = checks.filter(c => c.status !== 'error');
    const totalChecks = checks.length;
    const errorChecks = checks.length - validChecks.length;
    const syncedChecks = checks.filter(c => c.status === 'synced').length;

    let overallStatus: Mirror['overallStatus'] = 'error';

    if (validChecks.length === 0) {
      overallStatus = 'error';
    } else if (syncedChecks === totalChecks) {
      overallStatus = 'healthy';
    } else if (errorChecks > 0 || syncedChecks < totalChecks) {
      overallStatus = 'partial';
      if (syncedChecks === 0) overallStatus = 'out-of-sync';
    }

    const lags = validChecks
      .map(c => c.syncLagSeconds)
      .filter((l): l is number => l !== null)
      .filter(l => l > 0);

    const averageLag =
      lags.length > 0 ? lags.reduce((a, b) => a + b, 0) / lags.length : null;

    const url = new URL(mirrorUrl);

    return {
      averageLagSeconds: averageLag,
      checks,
      name: url.hostname,
      overallStatus,
      url: mirrorUrl,
    } satisfies Mirror;
  });

  const mirrors = await Promise.all(mirrorChecks);

  mirrors.sort((a, b) => {
    const score = (s: Mirror['overallStatus']) => {
      switch (s) {
        case 'error':
          return 3;
        case 'healthy':
          return 0;
        case 'out-of-sync':
          return 2;
        case 'partial':
          return 1;
      }
    };
    const statusDiff = score(a.overallStatus) - score(b.overallStatus);
    if (statusDiff !== 0) return statusDiff;
    if (a.averageLagSeconds === null && b.averageLagSeconds === null) return 0;
    if (a.averageLagSeconds === null) return 1;
    if (b.averageLagSeconds === null) return -1;
    return a.averageLagSeconds - b.averageLagSeconds;
  });

  return {baselines, mirrors};
}

async function fetchRepoTimestamp(
  baseUrl: string,
  repoPath: string
): Promise<null | number> {
  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const fullUrl = `${base}${repoPath}/lastupdate`;

  try {
    const res = await fetch(fullUrl, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return null;

    const text = await res.text();
    const timestamp = Number.parseInt(text.trim(), 10);
    return Number.isNaN(timestamp) ? null : timestamp / 1000;
  } catch (err) {
    console.debug(`Failed to fetch ${fullUrl}:`, err);
    return null;
  }
}
