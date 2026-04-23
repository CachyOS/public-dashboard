import {mkdir, writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';

import {AUR_CACHE_KEY, fetchAurPkgNames} from '@/lib/archlinux';
import {getMirrorsData, MIRRORS_CACHE_KEY} from '@/lib/mirrors';
import type {ProfileName} from '@/lib/server/swr-cache';

type Entry = {
  key: string;
  profileName: ProfileName;
  updatedAt: number;
  value: unknown;
};

const OUT_PATH = resolve(
  import.meta.dirname,
  '..',
  'dist',
  'cache-prefill.json'
);

async function main(): Promise<void> {
  const entries: Entry[] = [];
  const updatedAt = Date.now();

  const mirrors = await safe('mirrors', () => getMirrorsData());
  if (mirrors) {
    entries.push({
      key: MIRRORS_CACHE_KEY,
      profileName: 'mirrors',
      updatedAt,
      value: mirrors,
    });
  }

  const aurSet = await safe('aur', () => fetchAurPkgNames());
  if (aurSet) {
    entries.push({
      key: AUR_CACHE_KEY,
      profileName: 'aur',
      updatedAt,
      value: [...aurSet],
    });
  }

  await mkdir(dirname(OUT_PATH), {recursive: true});
  await writeFile(OUT_PATH, JSON.stringify({entries, updatedAt}, null, 2));
  console.info(`[prefill] wrote ${entries.length} entries to ${OUT_PATH}`);
}

async function safe<T>(label: string, fn: () => Promise<T>): Promise<null | T> {
  try {
    const value = await fn();
    console.info(`[prefill] ${label}: ok`);
    return value;
  } catch (err) {
    console.warn(`[prefill] ${label}: skipped —`, (err as Error).message);
    return null;
  }
}

await main();
