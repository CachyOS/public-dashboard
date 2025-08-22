'use client';

import Link, {LinkProps} from 'next/link';
import {useState} from 'react';

export function HoverPrefetchLink<R extends string>(props: LinkProps<R>) {
  const [active, setActive] = useState(false);

  return (
    <Link
      {...props}
      onFocus={() => setActive(true)}
      onMouseEnter={() => setActive(true)}
      prefetch={active ? null : false}
    >
      {props.children}
    </Link>
  );
}
