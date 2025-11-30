'use client';

import {INTL_LOCALE} from '@/lib/utils';

type DateTimeProps = {
  options?: Intl.DateTimeFormatOptions;
  timestamp: number;
  type?: 'date' | 'datetime';
};

export function DateTime({
  options,
  timestamp,
  type = 'datetime',
}: DateTimeProps) {
  const date = new Date(timestamp);

  const formatted =
    type === 'date'
      ? date.toLocaleDateString(INTL_LOCALE, options)
      : date.toLocaleString(INTL_LOCALE, options);

  return <time dateTime={date.toISOString()}>{formatted}</time>;
}
