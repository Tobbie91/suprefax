import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cn } from '@/utils/cn';

export interface LabelProps
  extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> {
  required?: boolean;
  optional?: boolean;
}

export const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  LabelProps
>(({ className, required, optional, children, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      'text-sm font-medium text-neutral-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
      className
    )}
    {...props}
  >
    {children}
    {required && <span className="ml-1 text-error-500">*</span>}
    {optional && (
      <span className="ml-1 text-xs font-normal text-neutral-400">(optional)</span>
    )}
  </LabelPrimitive.Root>
));

Label.displayName = 'Label';
