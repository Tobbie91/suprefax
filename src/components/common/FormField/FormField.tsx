import * as React from 'react';
import { cn } from '@/utils/cn';
import { Label } from '../Label';

export interface FormFieldProps {
  label?: string;
  htmlFor?: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  helpText?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  htmlFor,
  required,
  optional,
  error,
  helpText,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <Label htmlFor={htmlFor} required={required} optional={optional}>
          {label}
        </Label>
      )}
      {children}
      {helpText && !error && (
        <p className="text-xs text-neutral-500">{helpText}</p>
      )}
      {error && (
        <p className="text-xs text-error-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
