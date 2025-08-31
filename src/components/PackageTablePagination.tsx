import {ChevronLeft, ChevronRight} from 'lucide-react';

import {Button} from '@/components/ui/button';
import {Label} from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {PAGE_SIZE} from '@/lib/types';
import {ELLIPSIS, pagination} from '@/lib/utils';

export function PackageTablePagination({
  currentPage,
  onClick,
  onPageSizeChange,
  onPrefetch,
  pageSize,
  totalPages,
}: {
  currentPage: number;
  onClick: (page: number) => void;
  onPageSizeChange: (pageSize: string) => void;
  onPrefetch?: (page: number) => void;
  pageSize: number;
  totalPages: number;
}) {
  const pages = pagination(currentPage, totalPages);
  return (
    <div className="flex justify-between">
      <div className="items-center gap-2 flex">
        <Label
          className="sr-only md:not-sr-only text-sm text-muted-foreground"
          htmlFor="rows-per-page"
        >
          Rows per page
        </Label>
        <Select onValueChange={onPageSizeChange} value={pageSize.toString()}>
          <SelectTrigger className="w-20" id="rows-per-page" size="sm">
            <SelectValue placeholder={pageSize} />
          </SelectTrigger>
          <SelectContent side="top">
            {PAGE_SIZE.map(pageSize => (
              <SelectItem key={pageSize} value={`${pageSize}`}>
                {pageSize}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <Button
          disabled={currentPage <= 1}
          onClick={() => onClick(currentPage - 1)}
          onFocus={() => onPrefetch?.(currentPage - 1)}
          onMouseEnter={() => onPrefetch?.(currentPage - 1)}
          size="sm"
          variant="ghost"
        >
          <ChevronLeft />
          <span className="sm:sr-only">Previous</span>
        </Button>
        {pages.map((page, index) => {
          if (page === ELLIPSIS) {
            return (
              <Button
                className="hidden sm:block"
                disabled
                key={index}
                size="sm"
                variant="ghost"
              >
                {page}
              </Button>
            );
          }
          return (
            <Button
              className="hidden sm:block"
              key={index}
              onClick={() => onClick(page)}
              onFocus={() => onPrefetch?.(page)}
              onMouseEnter={() => onPrefetch?.(page)}
              size="sm"
              variant={page === currentPage ? 'default' : 'ghost'}
            >
              {page}
            </Button>
          );
        })}
        <Button
          disabled={currentPage >= totalPages}
          onClick={() => onClick(currentPage + 1)}
          onFocus={() => onPrefetch?.(currentPage + 1)}
          onMouseEnter={() => onPrefetch?.(currentPage + 1)}
          size="sm"
          variant="ghost"
        >
          <span className="sm:sr-only">Next</span>
          <ChevronRight />
        </Button>
      </div>{' '}
    </div>
  );
}
