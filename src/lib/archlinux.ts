import {gunzipSync} from 'node:zlib';

import {PROFILES, swrCached} from '@/lib/server/swr-cache';

/**
 * A set of AUR Arch Linux package names.
 * @example new Set(['package1', 'package2', 'package3'])
 */
export type AurPkgNameSet = Set<string>;

export const AUR_CACHE_KEY = 'aur:names';

export async function fetchAurPkgNames(): Promise<AurPkgNameSet> {
  const names = await swrCached(AUR_CACHE_KEY, fetchAurPkgList, PROFILES.aur);
  return new Set(names);
}

async function fetchAurPkgList(): Promise<string[]> {
  const url = 'https://aur.archlinux.org/packages.gz';

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'CachyOS/public-dashboard',
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AUR API error ${res.status}: ${text || res.statusText}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const decompressed = gunzipSync(buffer);
  return decompressed.toString('utf-8').split('\n');
}
