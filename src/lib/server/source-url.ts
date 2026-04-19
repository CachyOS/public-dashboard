import {type AurPkgNameSet, fetchAurPkgNames} from '@/lib/archlinux';
import {fetchPkgbuilds, type PkgbuildMap} from '@/lib/github';
import {PackageRepo} from '@/lib/types';
import {getPkgverWithoutBuildnum} from '@/lib/utils';

type SourceUrlInput = {
  pkg_base: null | string;
  pkg_name: string;
  pkg_version: string;
  repo_name: string;
};

export async function getSourceUrl(
  pkg: SourceUrlInput
): Promise<null | string> {
  const isArch = [PackageRepo.CORE, PackageRepo.EXTRA].some(needle =>
    pkg.repo_name.includes(needle)
  );
  if (isArch) {
    if (!pkg.pkg_base) return null;
    const archPkgVersion = getPkgverWithoutBuildnum(pkg.pkg_version).replace(
      ':',
      '-'
    );
    return `https://gitlab.archlinux.org/archlinux/packaging/packages/${pkg.pkg_base}/-/tree/${archPkgVersion}`;
  }

  for (const repo of ['linux-cachyos', 'CachyOS-PKGBUILDS']) {
    try {
      const cachyosPaths: PkgbuildMap = await fetchPkgbuilds({repo});
      const pkgbuildPath =
        repo === 'linux-cachyos'
          ? Object.entries(cachyosPaths)
              .filter(([repoPkg]) => pkg.pkg_name.startsWith(repoPkg))
              .map(([, path]) => path)
              .at(0)
          : cachyosPaths[pkg.pkg_name];

      if (pkgbuildPath) {
        return `https://github.com/CachyOS/${repo}/tree/master/${pkgbuildPath}`;
      }
    } catch (error) {
      console.error(`Failed to fetch ${repo}:`, error);
    }
  }

  try {
    const aurPkgNames: AurPkgNameSet = await fetchAurPkgNames();
    if (aurPkgNames.has(pkg.pkg_name)) {
      return `https://aur.archlinux.org/cgit/aur.git/tree/?h=${pkg.pkg_name}`;
    }
  } catch (error) {
    console.error('Failed to fetch AUR PKGNAMES:', error);
  }

  return null;
}
