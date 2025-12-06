import Link from 'next/link';

import {BackLink} from '@/components/BackLink';
import {PackageFiles} from '@/components/PackageFiles';
import SplitPackagesList from '@/components/SplitPackagesList';
import {Badge} from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {AurPkgNameSet, fetchAurPkgNames} from '@/lib/archlinux';
import {fetchPkgbuilds, PkgbuildMap} from '@/lib/github';
import {BriefPackageList, PackageDetails, PackageRepo} from '@/lib/types';
import {getDownloadMirrorUrl, getPkgverWithoutBuildnum} from '@/lib/utils';

import {DateTime} from './DateTime';
import {HoverPrefetchLink} from './HoverPrefetchLink';

type PackageDetailsComponentProps = {
  pkg: PackageDetails;
  pkgSplits: BriefPackageList;
};

export default async function PackageDetailsComponent({
  pkg,
  pkgSplits,
}: PackageDetailsComponentProps) {
  const sourceUrl = await getSourceUrl(pkg);
  return (
    <>
      <div className="mb-4">
        <BackLink />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl break-all">{pkg.pkg_name}</CardTitle>
          <CardDescription>
            Version {pkg.pkg_version} from {pkg.repo_name} ({pkg.pkg_arch})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl>
            <DetailRow label="Description">{pkg.pkg_desc || 'N/A'}</DetailRow>
            <DetailRow label="Homepage">
              {pkg.pkg_url ? (
                <a
                  className="text-primary hover:underline"
                  href={pkg.pkg_url}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {pkg.pkg_url}
                </a>
              ) : (
                'N/A'
              )}
            </DetailRow>
            {sourceUrl && (
              <DetailRow label="Source Files">
                <a
                  className="text-primary hover:underline"
                  href={sourceUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  View Source Files
                </a>
              </DetailRow>
            )}
            {pkg.pkg_name === pkg.pkg_base && pkgSplits.length > 0 && (
              <DetailRow label="Split Packages">
                <SplitPackagesList splits={pkgSplits} />
              </DetailRow>
            )}
            {pkg.pkg_name !== pkg.pkg_base && pkg.pkg_base && (
              <DetailRow label="Base Package">
                <Link
                  className="text-primary hover:underline"
                  href={`/package/${pkg.repo_name}/${pkg.pkg_arch}/${pkg.pkg_base}`}
                >
                  {pkg.pkg_base}
                </Link>
              </DetailRow>
            )}
            <DetailRow label="License(s)">
              <BadgeList items={pkg.pkg_license} />
            </DetailRow>
            <DetailRow label="Build Date">
              {pkg.pkg_builddate ? (
                <DateTime
                  timestamp={pkg.pkg_builddate * 1000}
                  type="datetime"
                />
              ) : (
                'unknown'
              )}
            </DetailRow>
            <DetailRow label="Packager">
              {pkg.pkg_packager || 'Unknown Packager'}
            </DetailRow>
            <DetailRow label="Package Size">
              {pkg.pkg_csize ? formatBytes(pkg.pkg_csize) : 'unknown'}
            </DetailRow>
            <DetailRow label="Installed Size">
              {pkg.pkg_isize ? formatBytes(pkg.pkg_isize) : 'unknown'}
            </DetailRow>
            <DetailRow label="Download Mirror">
              <a
                className="text-primary hover:underline"
                href={getDownloadMirrorUrl(pkg)}
                target="_blank"
              >
                {getDownloadMirrorUrl(pkg)}
              </a>
            </DetailRow>
            <DetailRow label="SHA256 Sum">
              <span className="font-mono text-sm break-all">
                {pkg.pkg_sha256sum || 'unknown'}
              </span>
            </DetailRow>
            <DetailRow label="Dependencies">
              <BadgeLinkList items={pkg.pkg_depends} />
            </DetailRow>
            <DetailRow label="Optional Deps">
              <BadgeLinkList items={pkg.pkg_optdepends} />
            </DetailRow>
            <DetailRow label="Provides">
              <BadgeLinkList items={pkg.pkg_provides} />
            </DetailRow>
            <DetailRow label="Conflicts With">
              <BadgeLinkList items={pkg.pkg_conflicts} />
            </DetailRow>
            <DetailRow label="Replaces">
              <BadgeLinkList items={pkg.pkg_replaces} />
            </DetailRow>
            <DetailRow label="Package Files">
              <PackageFiles
                arch={pkg.pkg_arch}
                pkgname={pkg.pkg_name}
                repo={pkg.repo_name}
              />
            </DetailRow>
          </dl>
        </CardContent>
      </Card>
    </>
  );
}

function BadgeLinkList({items}: {items: string[]}) {
  if (!items?.length) {
    return <span className="text-muted-foreground">N/A</span>;
  }

  const getSearch = (item: string) => {
    const token = [': ', '.so', '='].find(t => item.includes(t));
    return token ? item.split(token)[0].trim() : item;
  };

  return (
    <div className="flex flex-wrap gap-1">
      {items.map(item => (
        <Badge asChild key={item} variant="secondary">
          <HoverPrefetchLink
            href={{pathname: '/', query: {search: getSearch(item)}}}
          >
            {item}
          </HoverPrefetchLink>
        </Badge>
      ))}
    </div>
  );
}

function BadgeList({items}: {items: string[]}) {
  if (!items || items.length === 0) {
    return <span className="text-muted-foreground">N/A</span>;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {items.map(item => (
        <Badge key={item} variant="secondary">
          {item}
        </Badge>
      ))}
    </div>
  );
}

function DetailRow({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  if (!children) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 py-3 border-b last:border-b-0">
      <dt className="font-semibold text-muted-foreground">{label}</dt>
      <dd className="md:col-span-3">{children}</dd>
    </div>
  );
}

function formatBytes(bytes: number, decimals = 2): string {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

async function getSourceUrl(pkg: PackageDetails): Promise<null | string> {
  const isArch = [PackageRepo.CORE, PackageRepo.EXTRA].some(needle =>
    pkg.repo_name.includes(needle)
  );
  const isAur = pkg.repo_name === PackageRepo.CACHYOS;

  if (isArch) {
    if (!pkg.pkg_base) {
      return null;
    }
    const archPkgVersion = getPkgverWithoutBuildnum(pkg.pkg_version).replace(
      ':',
      '-'
    );
    return `https://gitlab.archlinux.org/archlinux/packaging/packages/${pkg.pkg_base}/-/tree/${archPkgVersion}`;
  } else if (isAur) {
    try {
      const aurPkgNames: AurPkgNameSet = await fetchAurPkgNames();
      if (aurPkgNames.has(pkg.pkg_name)) {
        return `https://aur.archlinux.org/cgit/aur.git/tree/?h=${pkg.pkg_name}`;
      }
    } catch (error) {
      console.error('Failed to fetch AUR PKGNAMES:', error);
    }
  } else {
    try {
      const cachyosPaths: PkgbuildMap = await fetchPkgbuilds();
      const pkgbuildPath = cachyosPaths[pkg.pkg_name];

      if (pkgbuildPath) {
        return `https://github.com/CachyOS/CachyOS-PKGBUILDS/tree/master/${pkgbuildPath}`;
      }
    } catch (error) {
      console.error('Failed to fetch CachyOS PKGBUILDS:', error);
    }
  }
  return null;
}
