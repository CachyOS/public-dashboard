'use client';

import {useEffect} from 'react';

const EDITABLE_TAGS = new Set(['INPUT', 'SELECT', 'TEXTAREA']);

// using from CachyOS/builder-dashboard ;)
export function useGenericShortcutListener(
  key: string,
  callback: () => void,
  bareKey = false
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== key.toLowerCase()) return;

      // don't steal keys..
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (EDITABLE_TAGS.has(target.tagName) || target.isContentEditable)
      ) {
        return;
      }
      const hasModifier = event.ctrlKey || event.metaKey || event.altKey;
      if (bareKey === hasModifier) return;

      event.preventDefault();
      callback();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [bareKey, callback, key]);
}
