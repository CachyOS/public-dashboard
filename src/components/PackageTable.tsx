import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {BriefPackage, BriefPackageList} from '@/lib/types';
import {INTL_LOCALE} from '@/lib/utils';

import {HoverPrefetchLink} from './HoverPrefetchLink';

interface PackageSearchResultsTableProps {
  onArchitectureClick?: (arch: string) => void;
  onRepositoryClick?: (repo: string) => void;
  packages: BriefPackageList;
}

const columnHelper = createColumnHelper<BriefPackage>();

export default function PackageTable({
  onArchitectureClick,
  onRepositoryClick,
  packages,
}: PackageSearchResultsTableProps) {
  const columns = [
    columnHelper.accessor('pkg_name', {
      cell: ({row}) => {
        const pkg = row.original;
        return (
          <HoverPrefetchLink
            className="text-primary hover:underline font-medium"
            href={`/package/${encodeURIComponent(pkg.repo_name)}/${encodeURIComponent(pkg.pkg_arch)}/${encodeURIComponent(pkg.pkg_name)}`}
          >
            {pkg.pkg_name}
          </HoverPrefetchLink>
        );
      },
      header: 'Package Name',
      meta: {
        headerClassName: 'md:min-w-[300px]',
      },
    }),
    columnHelper.accessor('pkg_version', {
      header: 'Version',
      meta: {
        headerClassName: 'md:w-[300px]',
      },
    }),
    columnHelper.accessor('repo_name', {
      cell: ({getValue}) => {
        const repoName = getValue();
        return (
          <button
            className="cursor-pointer text-primary hover:underline"
            onClick={() => onRepositoryClick?.(repoName)}
          >
            {repoName}
          </button>
        );
      },
      header: 'Repository',
      meta: {
        headerClassName: 'md:w-[300px]',
      },
    }),
    columnHelper.accessor('pkg_arch', {
      cell: ({getValue}) => {
        const arch = getValue();
        return (
          <button
            className="cursor-pointer text-primary hover:underline"
            onClick={() => onArchitectureClick?.(arch)}
          >
            {arch}
          </button>
        );
      },
      header: 'Architecture',
      meta: {
        headerClassName: 'md:w-[200px]',
      },
    }),
    columnHelper.accessor('pkg_builddate', {
      cell: ({getValue}) => {
        const buildDate = getValue();
        const date = new Date(buildDate * 1000);
        return (
          <time dateTime={date.toISOString()} suppressHydrationWarning>
            {date.toLocaleDateString(INTL_LOCALE)}
          </time>
        );
      },
      header: 'Last Updated',
      meta: {
        headerClassName: 'md:w-[200px]',
      },
    }),
  ];

  const table = useReactTable({
    columns,
    data: packages,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <TableHead
                  className={header.column.columnDef.meta?.headerClassName}
                  key={header.id}
                >
                  <div className="flex items-center gap-2">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map(row => (
              <TableRow
                data-state={row.getIsSelected() && 'selected'}
                key={row.id}
              >
                {row.getVisibleCells().map(cell => (
                  <TableCell
                    className={cell.column.columnDef.meta?.cellClassName}
                    key={cell.id}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell className="h-24 text-center" colSpan={columns.length}>
                No packages found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
