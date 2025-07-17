'use client';

import Link from 'next/link';
import {
  PackageDetails,
} from '@/lib/types';
import { getPkgverWithoutBuildnum } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';

type PackageDetailsComponentProps = {
  pkg: PackageDetails;
};

// Helper function to format file sizes into human-readable strings
function formatBytes(bytes: number, decimals = 2): string {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

// Helper component for displaying a key-value pair row
function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  // ignore if there's no data
  if (!children) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 py-3 border-b last:border-b-0">
      <dt className="font-semibold text-muted-foreground">{label}</dt>
      <dd className="md:col-span-3">{children}</dd>
    </div>
  );
}

// Helper component for rendering a list of strings as Badges
function BadgeList({ items }: { items: string[] | null | undefined }) {
  if (!items || items.length === 0) {
    return <span className="text-muted-foreground">N/A</span>;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {items.map(item => (
        <Badge key={item} variant="secondary">{item}</Badge>
      ))}
    </div>
  );
}

export default function PackageDetailsComponent({ pkg }: Readonly<PackageDetailsComponentProps>) {
  const rebuildedPackage = ['-core-', '-extra-'].some(needle => pkg.repo_name.includes(needle));
  const arch_pkgversion = getPkgverWithoutBuildnum(pkg.pkg_version);

  console.log(rebuildedPackage);
  return (
    <>
      <div className="mb-4">
        <Link href="/" className="inline-flex items-center text-sm text-primary hover:underline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Search
        </Link>
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
                <a href={pkg.pkg_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {pkg.pkg_url}
                </a>
              ) : 'N/A'}
            </DetailRow>
            {rebuildedPackage && pkg.pkg_base && (
              <DetailRow label="Source Files">
                <a
                  href={`https://gitlab.archlinux.org/archlinux/packaging/packages/${pkg.pkg_base}/-/tree/${arch_pkgversion}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  View Source Files
                </a>
              </DetailRow>
            )}
            <DetailRow label="License(s)"><BadgeList items={pkg.pkg_license} /></DetailRow>
            <DetailRow label="Build Date">{pkg.pkg_builddate ? new Date(pkg.pkg_builddate * 1000).toLocaleString() : 'unknown'}</DetailRow>
            <DetailRow label="Packager">{pkg.pkg_packager || 'Unknown Packager'}</DetailRow>
            <DetailRow label="Package Size">{pkg.pkg_csize ? formatBytes(pkg.pkg_csize) : 'unknown'}</DetailRow>
            <DetailRow label="Installed Size">{pkg.pkg_isize ? formatBytes(pkg.pkg_isize) : 'unknown'}</DetailRow>
            <DetailRow label="SHA256 Sum"><span className="font-mono text-sm break-all">{pkg.pkg_sha256sum || 'unknown'}</span></DetailRow>
            <DetailRow label="Dependencies"><BadgeList items={pkg.pkg_depends} /></DetailRow>
            <DetailRow label="Optional Deps"><BadgeList items={pkg.pkg_optdepends} /></DetailRow>
            <DetailRow label="Provides"><BadgeList items={pkg.pkg_provides} /></DetailRow>
            <DetailRow label="Conflicts With"><BadgeList items={pkg.pkg_conflicts} /></DetailRow>
            <DetailRow label="Replaces"><BadgeList items={pkg.pkg_replaces} /></DetailRow>
            <DetailRow label="Package Files">
              {pkg.pkg_files && pkg.pkg_files.length > 0 ? (
                <div className="h-64 overflow-y-auto rounded-md border bg-muted p-2 font-mono text-xs">
                  {pkg.pkg_files.map(file => <div key={file}>{file}</div>)}
                </div>
              ) : <span className="text-muted-foreground">N/A</span>}
            </DetailRow>
          </dl>
        </CardContent>
      </Card>
    </>
  );
}
