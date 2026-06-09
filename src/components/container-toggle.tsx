'use client';

import {Maximize2, Minimize2} from 'lucide-react';
import {useState} from 'react';

import {Button} from '@/components/ui/button';

export function ContainerToggle() {
  const [expanded, setExpanded] = useState(false);

  const toggleContainer = () => {
    document.querySelector('main')?.classList.toggle('container');
    setExpanded(current => !current);
  };

  const label = expanded ? 'Collapse content width' : 'Expand content width';

  return (
    <Button
      aria-label={label}
      aria-pressed={expanded}
      onClick={toggleContainer}
      size="icon"
      title={label}
      variant="ghost"
    >
      {expanded ? (
        <Minimize2 className="size-5" />
      ) : (
        <Maximize2 className="size-5" />
      )}
      <span className="sr-only">{label}</span>
    </Button>
  );
}
