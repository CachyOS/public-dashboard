'use client';

import {Clipboard, ClipboardCheck, ClipboardX} from 'lucide-react';
import {type ComponentProps, useState} from 'react';
import {useCopyToClipboard, useTimeout} from 'usehooks-ts';

import {Button} from '@/components/ui/button';
import {cn} from '@/lib/utils';

export type CopyButtonProps = Omit<
  ComponentProps<'button'>,
  'onClick' | 'size' | 'variant'
> & {
  text: string;
};

type CopyState = 'error' | 'idle' | 'success';

export function CopyButton(props: CopyButtonProps) {
  const {className, text, ...rest} = props;
  const [, copy] = useCopyToClipboard();
  const [copyState, setCopyState] = useState<CopyState>('idle');

  useTimeout(() => setCopyState('idle'), copyState !== 'idle' ? 2000 : null);

  return (
    <Button
      {...rest}
      className={cn(className)}
      onClick={() => {
        copy(text)
          .then(() => {
            setCopyState('success');
          })
          .catch(error => {
            setCopyState('error');
            console.error('Failed to copy', error);
            alert(`Failed to copy to clipboard: ${error}`);
          });
      }}
      size="icon"
      variant="ghost"
    >
      {copyState === 'idle' && <Clipboard />}
      {copyState === 'success' && <ClipboardCheck className="text-green-600" />}
      {copyState === 'error' && <ClipboardX className="text-red-600" />}
      <span className="sr-only">Copy to clipboard</span>
    </Button>
  );
}
