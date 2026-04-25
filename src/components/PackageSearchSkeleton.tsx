import {Skeleton} from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function PackageSearchSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-1">
        <Skeleton className="h-4 w-1/4" />
      </div>
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
            {Array.from({length: 15}, (_, index) => `row-${index}`).map(id => (
              <TableRow key={id}>
                <TableCell>
                  <Skeleton className="h-4 mb-1 w-3/4" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 mb-1 w-1/2" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 mb-1 w-1/2" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 mb-1 w-1/2" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 mb-1 w-3/4" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
}
