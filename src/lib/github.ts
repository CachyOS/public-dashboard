import {z} from 'zod';

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

const temp = `
######################################################
####                                              ####
####        CachyOS Repository Mirrorlist         ####
####                                              ####
######################################################
## CDN77 (World Wide Datacenters)
Server = https://cdn77.cachyos.org/repo/$arch/$repo
## Rerouted to mirror
Server = https://cdn.cachyos.org/repo/$arch/$repo
## Germany
Server = https://aur.cachyos.org/repo/$arch/$repo
Server = https://mirror.cachyos.org/repo/$arch/$repo
## USA Mirror much thanks to corpdecker!
Server = https://us.cachyos.org/repo/$arch/$repo
## India Mirror much thanks to https://github.com/albonycal
## Disabled due issues at installation
## Server = https://mirror.albony.xyz/cachylinux/repo/$arch/$repo
## France Mirror much thanks to Antoine Viallon (aviallon)
Server = https://mirror.lesviallon.fr/cachy/repo/$arch/$repo
## Russia Mirror # Removed till sync issue is resolved
# Server = https://mirror.truenetwork.ru/cachy/repo/$arch/$repo
## Norway Mirror much thanks to QuadFeed
# Server = https://mirror.fast0ne.com/repo/$arch/$repo
## Norway Mirror much thanks to innoix
Server = https://no.mirror.cx/cachyos/repo/$arch/$repo
## South Korea much thanks to Mihate Hiura!
Server = https://mirror.funami.tech/cachy/repo/$arch/$repo
## Austria Mirror much thanks to Soulharsh!
Server = https://at.cachyos.org/repo/$arch/$repo
## Germany Mirror much thanks to Soulharsh!
Server = https://de-nue.soulharsh007.dev/cachyos/repo/$arch/$repo
## USA Mirror much thanks to Soulharsh!
Server = https://us-mnz.soulharsh007.dev/cachyos/repo/$arch/$repo
## China Mirror 10GBs much thanks to eScience Center, Nanjing University!
Server = https://mirror.nju.edu.cn/cachyos/repo/$arch/$repo
## China Mirror much thanks to University of Science and Technology of China!
Server = https://mirrors.ustc.edu.cn/cachyos/repo/$arch/$repo
## Hong Kong Mirror much thanks to Saren!
# Server = https://cachy-mirror.wtako.net/repo/$arch/$repo
## Ontario, Canada Mirror much thanks to Bobby!
# Server = https://mirror.scholarshub.world/repo/$arch/$repo
## Italy Mirror much thanks to NextWorks!
Server = https://cachyos.next-works.it/repo/$arch/$repo
## Bangladesh 10 GBs much thanks to Limda!
Server = https://mirror.limda.net/cachy/repo/$arch/$repo
## Finland Mirror much thanks to doridian!
Server = https://cachyos.doridian.net/repo/$arch/$repo
## Switzerland Mirror much thanks to Fabian!
Server = https://mirror.hb9hil.org/cachyos/repo/$arch/$repo
## Vietnam Mirror much thanks to MeowIce
Server = https://mirror.meowsmp.net/cachyOS/repo/$arch/$repo
## Russia Mirror from Yandex
Server = https://mirror.yandex.ru/cachyos/repo/$arch/$repo
## Russia Mirror much thanks to quinowell and haku.host
Server = https://archlinux.gay/cachy/repo/$arch/$repo
`;

export async function fetchMirrorlist(
  params: {
    owner?: string;
    path?: string;
    repo?: string;
    token?: string;
  } = {}
): Promise<Array<string>> {
  // const {
  //   owner = 'CachyOS',
  //   path = 'cachyos-mirrorlist/cachyos-mirrorlist1',
  //   repo = 'CachyOS-PKGBUILDS',
  //   token = process.env.GITHUB_TOKEN,
  // } = params;
  //
  // const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(
  //   repo
  // )}/contents/${encodeURIComponent(path)}`;
  //
  // const res = await fetch(url, {
  //   headers: getHeaders(token),
  //   next: {revalidate: 3600},
  // });
  //
  // if (!res.ok) {
  //   const text = await res.text();
  //   throw new Error(
  //     `GitHub API error ${res.status}: ${text || res.statusText}`
  //   );
  // }
  //
  // const json = await res.json();
  // const data = GitContentItemSchema.parse(json);

  // const mirrors = atob(data.content)
  const mirrors = temp
    .split('\n')
    .filter(line => line.trim().startsWith('Server'))
    .map(line =>
      line
        .trim()
        .replace(/Server\s*=\s*/, '')
        .replace(/\$arch\/\$repo/, '')
        .trim()
    );

  return mirrors;
}

export async function fetchPkgbuilds(
  params: {
    owner?: string;
    ref?: string;
    repo?: string;
    token?: string;
  } = {}
): Promise<PkgbuildMap> {
  const {
    owner = 'CachyOS',
    ref = 'master',
    repo = 'CachyOS-PKGBUILDS',
    token = process.env.GITHUB_TOKEN,
  } = params;

  const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(
    repo
  )}/git/trees/${encodeURIComponent(ref)}?recursive=1`;

  const res = await fetch(url, {
    headers: getHeaders(token),
    next: {revalidate: 3600},
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
