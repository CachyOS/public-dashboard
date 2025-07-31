import Link from 'next/link';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {BriefPackageList} from '@/lib/types';

interface PackageSearchResultsTableProps {
  onArchitectureClick?: (arch: string) => void;
  onRepositoryClick?: (repo: string) => void;
  packages: BriefPackageList;
}

export default function PackageTable({
  onArchitectureClick,
  onRepositoryClick,
  packages,
}: PackageSearchResultsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Package Name</TableHead>
            <TableHead>Version</TableHead>
            <TableHead>Repository</TableHead>
            <TableHead>Architecture</TableHead>
            <TableHead>Last Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {packages.map(pkg => (
            <TableRow key={`${pkg.repo_name}-${pkg.pkg_name}-${pkg.pkg_arch}`}>
              <TableCell className="font-medium">
                <Link
                  className="text-primary hover:underline"
                  href={`/package/${encodeURIComponent(pkg.repo_name)}/${encodeURIComponent(pkg.pkg_arch)}/${encodeURIComponent(pkg.pkg_name)}`}
                >
                  {pkg.pkg_name}
                </Link>
              </TableCell>
              <TableCell>{pkg.pkg_version}</TableCell>
              <TableCell
                className="cursor-pointer text-primary hover:underline"
                onClick={() => onRepositoryClick?.(pkg.repo_name)}
              >
                {pkg.repo_name}
              </TableCell>
              <TableCell
                className="cursor-pointer text-primary hover:underline"
                onClick={() => onArchitectureClick?.(pkg.pkg_arch)}
              >
                {pkg.pkg_arch}
              </TableCell>
              <TableCell>
                {new Date(pkg.pkg_builddate * 1000).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
