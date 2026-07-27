import {z} from 'zod';

import {PROFILES, swrCached} from '@/lib/server/swr-cache';

const GitTreeItemSchema = z.object({
  mode: z.string(),
  path: z.string(),
  sha: z.string(),
  size: z.number().optional(),
  type: z.enum(['blob', 'tree', 'commit']),
  url: z.url(),
});

const GitTreeResponseSchema = z.object({
  sha: z.string(),
  tree: z.array(GitTreeItemSchema),
  truncated: z.boolean(),
  url: z.url(),
});

export type GitTreeResponse = z.infer<typeof GitTreeResponseSchema>;

/**
 * Maps package names to their relative PKGBUILD paths.
 * @example { "linux-cachyos": "linux-cachyos", "linux-api-headers": "toolchain/linux-api-headers" }
 */
export type PkgbuildMap = Record<string, string>;

export async function fetchPkgbuilds(
  params: {owner?: string; ref?: string; repo?: string; token?: string} = {}
): Promise<PkgbuildMap> {
  const {
    owner = 'CachyOS',
    ref = 'master',
    repo = 'CachyOS-PKGBUILDS',
    token = import.meta.env.GITHUB_TOKEN,
  } = params;

  const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(
    repo
  )}/git/trees/${encodeURIComponent(ref)}?recursive=1`;

  return swrCached(
    `github:pkgbuilds:${url}`,
    () => fetchPkgbuildsFromGithub(url, token),
    PROFILES.github
  );
}

async function fetchPkgbuildsFromGithub(
  url: string,
  token?: string
): Promise<PkgbuildMap> {
  const res = await fetch(url, {
    headers: getHeaders(token),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `GitHub API error ${res.status}: ${text || res.statusText}`
    );
  }

  const json = await res.json();
  const data = GitTreeResponseSchema.parse(json);

  return data.tree.reduce((acc, node) => {
    if (!node.path.endsWith('PKGBUILD')) {
      return acc;
    }
    const path = node.path.replace(/\/PKGBUILD$/, '');
    acc[path.split('/').pop() ?? ''] = path;
    return acc;
  }, {} as PkgbuildMap);
}

function getHeaders(token?: string) {
  return {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'CachyOS/public-dashboard',
    'X-GitHub-Api-Version': '2022-11-28',
    ...(token ? {Authorization: `Bearer ${token}`} : {}),
  };
}
