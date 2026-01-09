import * as React from 'react';
import { cn } from '@/utils/cn';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[100px] w-full rounded-lg border bg-white px-4 py-3 text-sm text-neutral-900 transition-colors placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:opacity-50',
          error
            ? 'border-error-500 focus-visible:border-error-500 focus-visible:ring-error-500/20'
            : 'border-neutral-300 focus-visible:border-primary-500 focus-visible:ring-primary-500/20',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';
