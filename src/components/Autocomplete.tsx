'use client';

import {useState} from 'react';

import {Input} from '@/components/ui/input';
import {cn} from '@/lib/utils';

function Autocomplete({
  onChange,
  options = [],
  value = '',
  ...props
}: React.ComponentProps<'input'> & {isLoading?: boolean; options: string[]}) {
  const [query, setQuery] = useState(String(value));
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    onChange?.(e);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < options.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      handleInputChange({
        target: {name: props.name || '', value: options[selectedIndex]},
      } as React.ChangeEvent<HTMLInputElement>);
      setSelectedIndex(-1);
    } else if (e.key === 'Escape') {
      setSelectedIndex(-1);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setIsFocused(false);
      setSelectedIndex(-1);
    }, 200);
  };

  return (
    <div className="relative">
      <Input
        aria-autocomplete="list"
        aria-controls="suggestions-list"
        aria-expanded={options.length > 0}
        onBlur={handleBlur}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        value={query}
        {...props}
      />
      {options.length > 0 && isFocused && (
        <ul
          aria-live="polite"
          className="top-10 absolute bg-popover border min-w-32 overflow-x-hidden overflow-y-auto p-1 rounded-md shadow-md text-popover-foreground text-sm z-50"
          id="suggestions-list"
        >
          {options.map((suggestion, index) => (
            // biome-ignore lint/a11y/useKeyWithClickEvents: handled by parent input's keydown
            // biome-ignore lint/a11y/useAriaPropsSupportedByRole: listbox role inferred by aria-live
            <li
              aria-selected={index === selectedIndex}
              className={cn(
                'px-4 py-1.5 cursor-pointer hover:bg-accent rounded-md',
                {
                  'bg-accent': index === selectedIndex,
                }
              )}
              key={suggestion}
              onClick={() =>
                handleInputChange({
                  target: {name: props.name || '', value: suggestion},
                } as React.ChangeEvent<HTMLInputElement>)
              }
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export {Autocomplete};
