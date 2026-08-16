import {
  columnVisibilityFeature,
  createExpandedRowModel,
  metaHelper,
  rowExpandingFeature,
  tableFeatures,
} from '@tanstack/react-table';

/**
 * Per-column styling hooks read by the shared table primitives.
 */
interface ColumnMeta {
  cellClassName?: string;
  headerClassName?: string;
}

/**
 * Feature set for plain, non-interactive tables.
 */
export const basicFeatures = tableFeatures({
  columnMeta: metaHelper<ColumnMeta>(),
  columnVisibilityFeature,
});

/** Feature set for tables whose rows expand into a detail row. */
export const expandingFeatures = tableFeatures({
  columnMeta: metaHelper<ColumnMeta>(),
  columnVisibilityFeature,
  expandedRowModel: createExpandedRowModel(),
  rowExpandingFeature,
});
