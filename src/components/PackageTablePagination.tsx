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
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 sm:hidden">
          <Label
            className="text-sm text-muted-foreground"
            htmlFor="page-picker"
          >
            Page
          </Label>
          <Select
            onValueChange={value => onClick(Number(value))}
            value={currentPage.toString()}
          >
            <SelectTrigger className="w-28" id="page-picker" size="sm">
              <SelectValue placeholder={`${currentPage} / ${totalPages}`} />
            </SelectTrigger>
            <SelectContent side="top">
              {Array.from({length: totalPages}, (_, index) => {
                const page = index + 1;

                return (
                  <SelectItem key={page} value={`${page}`}>
                    {page} / {totalPages}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <Label
          className="text-sm text-muted-foreground"
          htmlFor="rows-per-page"
        >
          Rows per page
        </Label>
        <Select onValueChange={onPageSizeChange} value={pageSize.toString()}>
          <SelectTrigger className="w-24" id="rows-per-page" size="sm">
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

      <div className="flex items-center justify-between gap-2 sm:justify-end">
        <Button
          className="min-w-0 flex-1 sm:flex-none"
          disabled={currentPage <= 1}
          onClick={() => onClick(currentPage - 1)}
          onFocus={() => onPrefetch?.(currentPage - 1)}
          onMouseEnter={() => onPrefetch?.(currentPage - 1)}
          size="sm"
          variant="ghost"
        >
          <ChevronLeft />
          <span>Previous</span>
        </Button>

        <div className="hidden items-center gap-2 sm:flex">
          {pages.map((page, index) => {
            const pageKey = `${page}-${index}`;

            if (page === ELLIPSIS) {
              return (
                <Button disabled key={pageKey} size="sm" variant="ghost">
                  {page}
                </Button>
              );
            }

            return (
              <Button
                key={pageKey}
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
        </div>

        <Button
          className="min-w-0 flex-1 sm:flex-none"
          disabled={currentPage >= totalPages}
          onClick={() => onClick(currentPage + 1)}
          onFocus={() => onPrefetch?.(currentPage + 1)}
          onMouseEnter={() => onPrefetch?.(currentPage + 1)}
          size="sm"
          variant="ghost"
        >
          <span>Next</span>
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
