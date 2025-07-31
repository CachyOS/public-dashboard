'use client';

import {useEffect} from 'react';

// using from CachyOS/builder-dashboard ;)
export function useGenericShortcutListener(
  key: string,
  callback: () => void,
  ignoreModifiers = false
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        (event.ctrlKey || event.metaKey || ignoreModifiers) &&
        event.key.toLowerCase() === key.toLowerCase()
      ) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  });
}
