import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { Circle } from 'lucide-react';
import { cn } from '@/utils/cn';

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn('grid gap-3', className)}
      {...props}
      ref={ref}
    />
  );
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        'aspect-square h-5 w-5 rounded-full border border-neutral-300 bg-white text-primary-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary-600',
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-2.5 w-2.5 fill-current text-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupWithLabelsProps
  extends Omit<React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>, 'children'> {
  options: RadioOption[];
  orientation?: 'horizontal' | 'vertical';
}

const RadioGroupWithLabels = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  RadioGroupWithLabelsProps
>(({ options, orientation = 'vertical', className, ...props }, ref) => {
  return (
    <RadioGroup
      ref={ref}
      className={cn(
        orientation === 'horizontal' ? 'flex flex-wrap gap-4' : 'grid gap-3',
        className
      )}
      {...props}
    >
      {options.map((option) => (
        <div key={option.value} className="flex items-start gap-3">
          <RadioGroupItem
            value={option.value}
            id={`${props.name}-${option.value}`}
            disabled={option.disabled}
            className="mt-0.5"
          />
          <div className="space-y-0.5">
            <label
              htmlFor={`${props.name}-${option.value}`}
              className={cn(
                'cursor-pointer text-sm font-medium text-neutral-700',
                option.disabled && 'cursor-not-allowed opacity-50'
              )}
            >
              {option.label}
            </label>
            {option.description && (
              <p className="text-xs text-neutral-500">{option.description}</p>
            )}
          </div>
        </div>
      ))}
    </RadioGroup>
  );
});
RadioGroupWithLabels.displayName = 'RadioGroupWithLabels';

export { RadioGroup, RadioGroupItem, RadioGroupWithLabels };
