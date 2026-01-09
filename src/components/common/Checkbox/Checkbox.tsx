import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check, Minus } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  indeterminate?: boolean;
}

export const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, indeterminate, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'peer h-5 w-5 shrink-0 rounded border border-neutral-300 bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary-600 data-[state=checked]:bg-primary-600 data-[state=checked]:text-white',
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn('flex items-center justify-center text-current')}
    >
      {indeterminate ? (
        <Minus className="h-3.5 w-3.5" />
      ) : (
        <Check className="h-3.5 w-3.5" />
      )}
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));

Checkbox.displayName = 'Checkbox';

export interface CheckboxWithLabelProps extends CheckboxProps {
  label: string;
  description?: string;
}

export const CheckboxWithLabel = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxWithLabelProps
>(({ label, description, className, ...props }, ref) => (
  <div className="flex items-start gap-3">
    <Checkbox ref={ref} className={cn('mt-0.5', className)} {...props} />
    <div className="space-y-0.5">
      <label
        htmlFor={props.id}
        className="cursor-pointer text-sm font-medium text-neutral-700"
      >
        {label}
      </label>
      {description && (
        <p className="text-xs text-neutral-500">{description}</p>
      )}
    </div>
  </div>
));

CheckboxWithLabel.displayName = 'CheckboxWithLabel';
