'use client';

import {createColumnHelper, flexRender, useTable} from '@tanstack/react-table';
import {ChevronDown, ChevronRight, ChevronsUpDown, Info} from 'lucide-react';
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
import {basicFeatures, expandingFeatures} from '@/lib/table';
import type {Mirror, MirrorBaseline, RepoCheck} from '@/lib/types';
import {readableDuration} from '@/lib/utils';

import {DateTime} from './DateTime';
import {Badge} from './ui/badge';

interface MirrorslistTableProps {
  baselines: MirrorBaseline[];
  mirrors: Mirror[];
}

const baselineColumnHelper = createColumnHelper<
  typeof basicFeatures,
  MirrorBaseline
>();
const mirrorColumnHelper = createColumnHelper<
  typeof expandingFeatures,
  Mirror
>();
const checkColumnHelper = createColumnHelper<typeof basicFeatures, RepoCheck>();

const alwaysExpandable = () => true;

export default function MirrorslistTable({
  baselines,
  mirrors,
}: MirrorslistTableProps) {
  'use no memo'; // TODO: https://github.com/TanStack/table/issues/6137

  const mirrorColumns = mirrorColumnHelper.columns([
    mirrorColumnHelper.accessor(row => new URL(row.url).hostname, {
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
      id: 'name',
      meta: {
        headerClassName: 'md:min-w-[300px]',
      },
    }),
    mirrorColumnHelper.accessor('average_lag_seconds', {
      cell: ({getValue}) => <span>{readableLag(getValue())}</span>,
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
    mirrorColumnHelper.accessor('overall_status', {
      cell: ({getValue}) => {
        const status = getValue();
        const variant =
          status === 'healthy'
            ? 'default'
            : status === 'error'
              ? 'destructive'
              : 'secondary';
        return <Badge variant={variant}>{getValue().toUpperCase()}</Badge>;
      },
      header: 'Status',
      meta: {
        headerClassName: 'md:w-[200px]',
      },
    }),
  ]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const mirrorsTable = useTable({
    columns: mirrorColumns,
    data: mirrors,
    features: expandingFeatures,
    getRowCanExpand: alwaysExpandable,
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

      <div className="flex items-start gap-3 rounded-md border bg-secondary/50 p-4 text-sm text-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <div className="space-y-1">
          <p className="font-medium">Understanding Mirror Lag</p>
          <p>
            Lag represents the time difference between the builder and a mirror.
            A delay doesn&apos;t always indicate a failure, as mirrors sync on
            different schedules. If you notice high lag, please check back
            later. This tool is designed to assist in diagnosing mirror
            connectivity.
          </p>
        </div>
      </div>
      <Collapsible className="space-y-2">
        <CollapsibleTrigger asChild>
          <Button className="p-0" size="sm" variant="outline">
            <p>Builder Latest Status</p>
            <ChevronsUpDown className="h-4 w-4" data-icon="inline-end" />
            <span className="sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="rounded-md border">
            <BaselinesTable baselines={baselines} />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

function BaselinesTable({baselines}: {baselines: MirrorBaseline[]}) {
  'use no memo'; // TODO: https://github.com/TanStack/table/issues/6137

  const columns = baselineColumnHelper.columns([
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
  ]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useTable({
    columns,
    data: baselines,
    features: basicFeatures,
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
            <TableRow key={row.id}>
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

/**
 * Formats a sync lag, dashing out mirrors that are not behind the builder.
 */
function readableLag(seconds: null | number): string {
  return seconds === null || seconds <= 0 ? '-' : readableDuration(seconds);
}

function RepoChecksTable({checks}: {checks: RepoCheck[]}) {
  'use no memo'; // TODO: https://github.com/TanStack/table/issues/6137

  const columns = checkColumnHelper.columns([
    checkColumnHelper.accessor('path', {
      header: 'Repo Path',
    }),
    checkColumnHelper.accessor('last_updated', {
      cell: ({getValue}) => {
        const date = getValue();
        return date ? <DateTime timestamp={Date.parse(date)} /> : '-';
      },
      header: 'Last Updated',
    }),
    checkColumnHelper.accessor('sync_lag_seconds', {
      cell: ({getValue}) => readableLag(getValue()),
      header: 'Lag',
    }),
    checkColumnHelper.accessor('status', {
      cell: ({getValue}) => {
        const status = getValue();
        const variant =
          status === 'synced'
            ? 'default'
            : status === 'error'
              ? 'destructive'
              : 'secondary';
        return <Badge variant={variant}>{getValue().toUpperCase()}</Badge>;
      },
      header: 'Status',
    }),
  ]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useTable({
    columns,
    data: checks,
    features: basicFeatures,
  });

  return (
    <Table className="table-fixed">
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
