import Link from 'next/link';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {BriefPackage} from '@/lib/types';

interface PackageSearchResultsTableProps {
  packages: BriefPackage[];
}

export default function PackageTable({
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
              <TableCell>{pkg.repo_name}</TableCell>
              <TableCell>{pkg.pkg_arch}</TableCell>
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
