'use client';

import Link from 'next/link';
import {ComponentPropsWithoutRef, useState} from 'react';

export function HoverPrefetchLink(
  props: ComponentPropsWithoutRef<typeof Link>
) {
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
