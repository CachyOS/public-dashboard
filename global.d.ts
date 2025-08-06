/// <reference types="bun/test-globals" />
//
import '@tanstack/react-table';

declare module '@tanstack/react-table' {
  interface ColumnMeta {
    cellClassName?: string;
    headerClassName?: string;
  }
}
