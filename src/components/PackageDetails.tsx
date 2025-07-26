'use client';

import {ArrowLeft} from 'lucide-react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useState} from 'react';

import {Badge} from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {cachyosPaths} from '@/lib/cachy';
import {BriefPackage, PackageDetails} from '@/lib/types';
import {getPkgverWithoutBuildnum} from '@/lib/utils';

type PackageDetailsComponentProps = {
  pkg: PackageDetails;
  pkgSplits: BriefPackage[];
};

export default function PackageDetailsComponent({
  pkg,
  pkgSplits,
}: Readonly<PackageDetailsComponentProps>) {
  const {back} = useRouter();

  const sourceUrl = getSourceUrl(pkg);
  return (
    <>
      <div className="mb-4">
        <button
          className="inline-flex items-center text-sm text-primary hover:underline"
          onClick={() => back()}
          type="button"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Search
        </button>
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
              {pkg.pkg_builddate
                ? new Date(pkg.pkg_builddate * 1000).toLocaleString()
                : 'unknown'}
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
            <DetailRow label="SHA256 Sum">
              <span className="font-mono text-sm break-all">
                {pkg.pkg_sha256sum || 'unknown'}
              </span>
            </DetailRow>
            <DetailRow label="Dependencies">
              <BadgeList items={pkg.pkg_depends} />
            </DetailRow>
            <DetailRow label="Optional Deps">
              <BadgeList items={pkg.pkg_optdepends} />
            </DetailRow>
            <DetailRow label="Provides">
              <BadgeList items={pkg.pkg_provides} />
            </DetailRow>
            <DetailRow label="Conflicts With">
              <BadgeList items={pkg.pkg_conflicts} />
            </DetailRow>
            <DetailRow label="Replaces">
              <BadgeList items={pkg.pkg_replaces} />
            </DetailRow>
            <DetailRow label="Package Files">
              {pkg.pkg_files && pkg.pkg_files.length > 0 ? (
                <div className="h-64 overflow-y-auto rounded-md border bg-muted p-2 font-mono text-xs">
                  {pkg.pkg_files.map(file => (
                    <div key={file}>{file}</div>
                  ))}
                </div>
              ) : (
                <span className="text-muted-foreground">N/A</span>
              )}
            </DetailRow>
          </dl>
        </CardContent>
      </Card>
    </>
  );
}

// Helper component for rendering a list of strings as Badges
function BadgeList({items}: {items: null | string[] | undefined}) {
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

// Helper component for displaying a key-value pair row
function DetailRow({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  // ignore if there's no data
  if (!children) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 py-3 border-b last:border-b-0">
      <dt className="font-semibold text-muted-foreground">{label}</dt>
      <dd className="md:col-span-3">{children}</dd>
    </div>
  );
}

// Helper function to format file sizes into human-readable strings
function formatBytes(bytes: number, decimals = 2): string {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function getSourceUrl(pkg: PackageDetails): null | string {
  if (cachyosPaths[pkg.pkg_name]) {
    return `https://github.com/CachyOS/CachyOS-PKGBUILDS/tree/master/${cachyosPaths[pkg.pkg_name]}`;
  }
  const rebuildedPackage = ['-core-', '-extra-'].some(needle =>
    pkg.repo_name.includes(needle)
  );
  if (!rebuildedPackage || !pkg.pkg_base) {
    return null;
  }
  const arch_pkgversion = getPkgverWithoutBuildnum(pkg.pkg_version);
  return `https://gitlab.archlinux.org/archlinux/packaging/packages/${pkg.pkg_base}/-/tree/${arch_pkgversion}`;
}

// Component to display a list of split packages
function SplitPackagesList({splits}: {splits: BriefPackage[]}) {
  const [expanded, setExpanded] = useState(false);
  const visibleSplits = expanded ? splits : splits.slice(0, 5);
  const hasMore = splits.length > 5;

  return (
    <div className="flex flex-wrap gap-1 items-center">
      {visibleSplits.map(split => (
        <Link
          className="text-primary hover:underline"
          href={`/package/${split.repo_name}/${split.pkg_arch}/${split.pkg_name}`}
          key={split.pkg_name}
        >
          {split.pkg_name}
        </Link>
      ))}
      {hasMore && (
        <button
          className="text-primary hover:underline ml-2"
          onClick={() => setExpanded(e => !e)}
          type="button"
        >
          {expanded ? 'Less...' : 'More...'}
        </button>
      )}
    </div>
  );
}
