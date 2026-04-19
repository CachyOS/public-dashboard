import {Skeleton} from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function MirrorslistSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Average Lag</TableHead>
              <TableHead>Checks</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({length: 15}, (_, index) => `row-${index}`).map(id => (
              <TableRow key={id}>
                <TableCell>
                  <Skeleton className="h-4 w-1/2" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-1/2" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-1/2" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-3/4" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
