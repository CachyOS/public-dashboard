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

const GitContentItemSchema = z.object({
  content: z.string(),
});

/**
 * Maps package names to their relative PKGBUILD paths.
 * @example { "linux-cachyos": "linux-cachyos", "linux-api-headers": "toolchain/linux-api-headers" }
 */
export type PkgbuildMap = Record<string, string>;

export async function fetchMirrorlist(
  params: {owner?: string; path?: string; repo?: string; token?: string} = {}
): Promise<Array<string>> {
  const {
    owner = 'CachyOS',
    path = 'cachyos-mirrorlist/cachyos-mirrorlist',
    repo = 'CachyOS-PKGBUILDS',
    token = import.meta.env.GITHUB_TOKEN,
  } = params;

  const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(
    repo
  )}/contents/${encodeURIComponent(path)}`;

  return swrCached(
    `github:mirrorlist:${url}`,
    () => fetchMirrorlistFromGithub(url, token),
    PROFILES.github
  );
}

async function fetchMirrorlistFromGithub(
  url: string,
  token?: string
): Promise<string[]> {
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
  const data = GitContentItemSchema.parse(json);

  return atob(data.content)
    .split('\n')
    .filter(line => line.trim().startsWith('Server'))
    .map(line =>
      line
        .trim()
        .replace(/Server\s*=\s*/, '')
        .replace(/\$arch\/\$repo/, '')
        .trim()
    );
}

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

  return data.tree
    .filter(node => node.path.endsWith('PKGBUILD'))
    .map(node => node.path.replace(/\/PKGBUILD$/, ''))
    .reduce((acc, path) => {
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
