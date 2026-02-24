'use client';

import { Check, Copy } from 'lucide-react';
import type * as React from 'react';

import { Button } from '@/components/ui/button';
import { useCopyButton } from '@/hooks/use-copy-button';
import { cn } from '@/lib/utils';

interface CopyButtonProps extends Omit<React.ComponentPropsWithoutRef<typeof Button>, 'onClick'> {
  label?: string;
  value: string;
}
export function CopyButton({ label, value, className, ...props }: CopyButtonProps) {
  const [checked, onClick] = useCopyButton(() => navigator.clipboard.writeText(value));

  return (
    <Button
      variant='ghost'
      size='icon-sm'
      className={cn('text-muted-foreground hover:text-foreground', className)}
      onClick={onClick}
      aria-label={(label && `Copy ${label}`) || 'Copy'}
      {...props}
    >
      {checked ? <Check /> : <Copy />}
    </Button>
  );
}
