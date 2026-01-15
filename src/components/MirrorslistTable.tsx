'use client';

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {ChevronDown, ChevronRight, ChevronsUpDown} from 'lucide-react';
import {Fragment} from 'react';

import {Button} from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {Mirror, RepoCheck} from '@/lib/types';
import {readableDuration} from '@/lib/utils';

import {DateTime} from './DateTime';
import {Badge} from './ui/badge';

interface MirrorslistTableProps {
  baselines: {path: string; timestamp: null | number}[];
  mirrors: Mirror[];
}

const baselineColumnHelper = createColumnHelper<{
  path: string;
  timestamp: null | number;
}>();
const mirrorColumnHelper = createColumnHelper<Mirror>();
const checkColumnHelper = createColumnHelper<RepoCheck>();

export default function MirrorslistTable({
  baselines,
  mirrors,
}: MirrorslistTableProps) {
  'use no memo'; // TODO: https://github.com/TanStack/table/issues/6137

  const mirrorColumns = [
    mirrorColumnHelper.accessor('name', {
      cell: ({getValue, row}) => (
        <div className="flex items-center gap-2">
          {row.getIsExpanded() ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="font-medium">{getValue()}</span>
        </div>
      ),
      header: 'Name',
      meta: {
        headerClassName: 'md:min-w-[300px]',
      },
    }),
    mirrorColumnHelper.accessor('averageLagSeconds', {
      cell: ({getValue}) => (
        <span>
          {getValue() === null
            ? '-'
            : readableDuration((getValue() ?? 0) / 1000)}
        </span>
      ),
      header: 'Average Lag',
      meta: {
        headerClassName: 'md:min-w-[200px]',
      },
    }),
    mirrorColumnHelper.accessor('checks', {
      cell: ({getValue}) => {
        const checks = getValue();
        const synced = checks.filter(c => c.status === 'synced').length;
        return (
          <span>
            {synced} / {checks.length} synced
          </span>
        );
      },
      header: 'Checks',
      meta: {
        headerClassName: 'md:w-[200px]',
      },
    }),
    mirrorColumnHelper.accessor('overallStatus', {
      cell: ({getValue}) => (
        <Badge variant={getValue() !== 'healthy' ? 'destructive' : 'default'}>
          {getValue().replace(/-/g, ' ').toUpperCase()}
        </Badge>
      ),
      header: 'Status',
      meta: {
        headerClassName: 'md:w-[200px]',
      },
    }),
  ];

  // eslint-disable-next-line react-hooks/incompatible-library
  const mirrorsTable = useReactTable({
    columns: mirrorColumns,
    data: mirrors,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
  });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {mirrorsTable.getHeaderGroups().map(headerGroup => (
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
              {mirrorsTable.getRowModel().rows?.length ? (
                mirrorsTable.getRowModel().rows.map(row => (
                  <Fragment key={row.id}>
                    <TableRow
                      className="cursor-pointer hover:bg-muted/50"
                      data-state={row.getIsSelected() && 'selected'}
                      onClick={row.getToggleExpandedHandler()}
                    >
                      {row.getVisibleCells().map(cell => (
                        <TableCell
                          className={cell.column.columnDef.meta?.cellClassName}
                          key={cell.id}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                    {row.getIsExpanded() && (
                      <TableRow className="bg-muted/10 hover:bg-muted/10">
                        <TableCell colSpan={mirrorColumns.length}>
                          <RepoChecksTable checks={row.original.checks} />
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    className="h-24 text-center"
                    colSpan={mirrorColumns.length}
                  >
                    No mirrors found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <Collapsible className="space-y-2">
        <div className="flex items-center justify-between">
          <CollapsibleTrigger asChild>
            <Button className="w-9 p-0" size="sm" variant="outline">
              <h2 className="text-lg font-semibold">Builder Latest Status</h2>
              <ChevronsUpDown className="h-4 w-4" />
              <span className="sr-only">Toggle Baselines</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <div className="rounded-md border">
            <BaselinesTable baselines={baselines} />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

function BaselinesTable({
  baselines,
}: {
  baselines: {path: string; timestamp: null | number}[];
}) {
  'use no memo'; // TODO: https://github.com/TanStack/table/issues/6137

  const columns = [
    baselineColumnHelper.accessor('path', {
      header: 'Path',
      meta: {
        headerClassName: 'md:min-w-[400px]',
      },
    }),
    baselineColumnHelper.accessor('timestamp', {
      cell: ({getValue}) => <DateTime timestamp={getValue() ?? 0} />,
      header: 'Last Updated',
      meta: {
        headerClassName: 'md:min-w-[300px]',
      },
    }),
  ];

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    columns,
    data: baselines,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
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
              No baselines found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

function RepoChecksTable({checks}: {checks: RepoCheck[]}) {
  'use no memo'; // TODO: https://github.com/TanStack/table/issues/6137

  const columns = [
    checkColumnHelper.accessor('path', {
      header: 'Repo Path',
    }),
    checkColumnHelper.accessor('lastUpdated', {
      cell: ({getValue}) => {
        const date = getValue();
        return date ? <DateTime timestamp={date} /> : 'N/A';
      },
      header: 'Last Updated',
    }),
    checkColumnHelper.accessor('syncLagSeconds', {
      cell: ({getValue}) => {
        const duration = getValue();
        return duration === null || duration === 0
          ? '-'
          : readableDuration(duration / 1000);
      },
      header: 'Lag',
    }),
    checkColumnHelper.accessor('status', {
      cell: ({getValue}) => (
        <Badge variant={getValue() === 'synced' ? 'secondary' : 'destructive'}>
          {getValue().toUpperCase()}
        </Badge>
      ),
      header: 'Status',
    }),
  ];

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    columns,
    data: checks,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map(headerGroup => (
          <TableRow className="border-b-muted" key={headerGroup.id}>
            {headerGroup.headers.map(header => (
              <TableHead className="h-8 text-xs" key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.length ? (
          table.getRowModel().rows.map(row => (
            <TableRow className="border-b-muted/50" key={row.id}>
              {row.getVisibleCells().map(cell => (
                <TableCell className="py-2 text-sm" key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell className="h-12 text-center" colSpan={columns.length}>
              No checks found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
