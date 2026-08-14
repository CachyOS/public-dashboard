'use client';

import {useId, useState} from 'react';

import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {cn} from '@/lib/utils';

function Autocomplete({
  emptyMessage,
  id,
  label,
  onChange,
  onSelect,
  options = [],
  value = '',
  ...props
}: Omit<React.ComponentProps<'input'>, 'onSelect'> & {
  emptyMessage?: string;
  isLoading?: boolean;
  label: string;
  onSelect?: (value: string) => void;
  options: string[];
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const listboxId = `${inputId}-listbox`;
  const optionId = (index: number) => `${listboxId}-option-${index}`;

  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);

  // keep list open on no matches so it can say so..
  const showEmpty =
    emptyMessage !== undefined &&
    options.length === 0 &&
    String(value).trim().length > 0;
  const isOpen = isFocused && (options.length > 0 || showEmpty);

  let announcement = '';
  if (isOpen) {
    announcement = showEmpty
      ? (emptyMessage ?? '')
      : `${options.length} ${options.length === 1 ? 'suggestion' : 'suggestions'} available.`;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
    setSelectedIndex(-1);
  };

  const selectOption = (suggestion: string) => {
    setSelectedIndex(-1);
    onSelect?.(suggestion);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < options.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      // otherwise form submits term the suggestion replaces
      e.preventDefault();
      selectOption(options[selectedIndex]);
    } else if (e.key === 'Escape') {
      setSelectedIndex(-1);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setSelectedIndex(-1);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId}>{label}</Label>
      <div className="relative">
        <Input
          aria-activedescendant={
            selectedIndex >= 0 ? optionId(selectedIndex) : undefined
          }
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-expanded={isOpen}
          id={inputId}
          onBlur={handleBlur}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          role="combobox"
          value={value}
          {...props}
        />
        {isOpen && (
          <ul
            className="top-10 absolute bg-popover border min-w-32 overflow-x-hidden overflow-y-auto p-1 rounded-md shadow-md text-popover-foreground text-sm z-50"
            id={listboxId}
            role="listbox"
          >
            {showEmpty && (
              <li className="px-4 py-1.5 text-muted-foreground">
                {emptyMessage}
              </li>
            )}
            {options.map((suggestion, index) => (
              <li
                aria-selected={index === selectedIndex}
                className={cn(
                  'px-4 py-1.5 cursor-pointer hover:bg-accent rounded-md',
                  {
                    'bg-accent': index === selectedIndex,
                  }
                )}
                id={optionId(index)}
                key={suggestion}
                // keeps focus on the input
                onMouseDown={e => {
                  e.preventDefault();
                  selectOption(suggestion);
                }}
                role="option"
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
        <span aria-live="polite" className="sr-only" role="status">
          {announcement}
        </span>
      </div>
    </div>
  );
}

export {Autocomplete};
