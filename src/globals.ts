import {Cron} from 'croner';

import {getGitHubRepoTree} from '@/lib/actions';
import {Cache} from '@/lib/cache';
import {GitHubRepositoryTree} from '@/lib/types';
import {parseTreeItemPath} from '@/lib/utils';

export const cache = new Cache({filename: 'cachyos.sqlite.db'});

const cachyRepoRefreshJob = new Cron('@hourly', async () => {
  console.log('Updating GitHub repo tree cache...');
  let root: GitHubRepositoryTree | undefined;
  try {
    root = await getGitHubRepoTree();
  } catch (error) {
    console.error('Error fetching GitHub repo tree:', error);
  }
  if (!root) {
    console.warn('GitHub repo tree is undefined, skipping cache update.');
    return;
  }

  for (const item of root.tree) {
    const p = parseTreeItemPath(item.path);
    if (!p) {
      continue;
    }
    cache.put(p.pkgname, p.pkgpath);
  }
});

console.log(
  'Cron job started for customRepoRefreshJob:',
  cachyRepoRefreshJob.getPattern()
);
