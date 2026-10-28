import {ChevronLeft, ChevronRight} from 'lucide-react';
import type {UIEvent} from 'react';
import {useEffect, useLayoutEffect, useRef, useState} from 'react';

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

const PAGE_CHUNK = 100;
const LOAD_THRESHOLD_PX = 80;

type PageRange = {end: number; start: number};

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
  const [pageRange, setPageRange] = useState(() =>
    initialPageRange(currentPage, totalPages)
  );
  const prependScrollRef = useRef<null | {
    previousHeight: number;
    viewport: HTMLDivElement;
  }>(null);

  // A new query/filter can change the page count. Keep the selected page mounted.
  useEffect(() => {
    setPageRange(initialPageRange(currentPage, totalPages));
    prependScrollRef.current = null;
  }, [currentPage, totalPages]);

  // Prepending items increases scrollHeight: compensate so the menu doesn't jump.
  useLayoutEffect(() => {
    const pending = prependScrollRef.current;
    if (!pending) return;
    pending.viewport.scrollTop +=
      pending.viewport.scrollHeight - pending.previousHeight;
    prependScrollRef.current = null;
  }, [pageRange.start]);

  const handlePageListScroll = (event: UIEvent<HTMLDivElement>) => {
    // Radix scrolls the inner Viewport, not the SelectContent wrapper.
    const target = event.target;
    if (!(target instanceof HTMLDivElement)) return;
    if (
      target.dataset.slot !== 'select-viewport' &&
      !target.hasAttribute('data-radix-select-viewport')
    )
      return;

    if (target.scrollTop <= LOAD_THRESHOLD_PX && pageRange.start > 1) {
      prependScrollRef.current = {
        previousHeight: target.scrollHeight,
        viewport: target,
      };
      setPageRange(previous => ({
        ...previous,
        start: Math.max(1, previous.start - PAGE_CHUNK),
      }));
    }

    if (
      target.scrollHeight - target.scrollTop - target.clientHeight <=
        LOAD_THRESHOLD_PX &&
      pageRange.end < totalPages
    ) {
      setPageRange(previous => ({
        ...previous,
        end: Math.min(totalPages, previous.end + PAGE_CHUNK),
      }));
    }
  };

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
            onOpenChange={open => {
              if (open) {
                prependScrollRef.current = null;
                setPageRange(initialPageRange(currentPage, totalPages));
              }
            }}
            onValueChange={value => onClick(Number(value))}
            value={currentPage.toString()}
          >
            <SelectTrigger className="w-28" id="page-picker" size="sm">
              <SelectValue placeholder={`${currentPage} / ${totalPages}`} />
            </SelectTrigger>
            <SelectContent onScrollCapture={handlePageListScroll} side="top">
              {Array.from(
                {length: Math.max(0, pageRange.end - pageRange.start + 1)},
                (_, index) => {
                  const page = pageRange.start + index;
                  return (
                    <SelectItem key={page} value={`${page}`}>
                      {page} / {totalPages}
                    </SelectItem>
                  );
                }
              )}
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
            {PAGE_SIZE.map(size => (
              <SelectItem key={size} value={`${size}`}>
                {size}
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
          <ChevronLeft data-icon="inline-start" />
          <span className="sm:sr-only">Previous</span>
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
          <span className="sm:sr-only">Next</span>
          <ChevronRight data-icon="inline-end" />
        </Button>
      </div>
    </div>
  );
}

function initialPageRange(currentPage: number, totalPages: number): PageRange {
  return {
    end: Math.min(totalPages, currentPage + PAGE_CHUNK),
    start: Math.max(1, currentPage - PAGE_CHUNK),
  };
}
