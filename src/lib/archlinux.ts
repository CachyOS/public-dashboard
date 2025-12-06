import {cacheLife} from 'next/cache';
import {gunzipSync} from 'node:zlib';

/**
 * A set of AUR Arch Linux package names.
 * @example new Set(['package1', 'package2', 'package3'])
 */
export type AurPkgNameSet = Set<string>;

export async function fetchAurPkgNames(): Promise<AurPkgNameSet> {
  'use cache';
  cacheLife('hours');

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
  const content = decompressed.toString('utf-8');

  return new Set(content.split('\n'));
}
