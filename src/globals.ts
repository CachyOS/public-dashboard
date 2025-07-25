import {Cron} from 'croner';

import {getGitHubRepoTree} from '@/lib/actions';
import {Cache} from '@/lib/cache';
import {GitHubRepositoryTree} from '@/lib/types';

export const cache = new Cache({filename: 'cachyos.sqlite.db'});

const cachyRepoRefreshJob = new Cron('@hourly', async () => {
  console.log('Updating GitHub repo tree cache...');
  let root: GitHubRepositoryTree | undefined;
  try {
    root = await getGitHubRepoTree();
    console.log('GitHub repo tree fetched successfully.');
  } catch (error) {
    console.error('Error fetching GitHub repo tree:', error);
  }
  if (!root) {
    console.warn('GitHub repo tree is undefined, skipping cache update.');
    return;
  }

  for (const item of root.tree) {
    if (!item.path.endsWith('/PKGBUILD')) {
      continue;
    }

    const cacheKey = item.path.split('/').at(-2);
    if (!cacheKey) {
      continue;
    }

    cache.put(cacheKey, null);
    console.log(`Cached ${item.path} with key ${cacheKey}`);
  }
});

console.log(
  'Cron job started for customRepoRefreshJob:',
  cachyRepoRefreshJob.getPattern()
);
