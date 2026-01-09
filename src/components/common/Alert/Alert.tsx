import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/utils/cn';

const alertVariants = cva(
  'relative w-full rounded-lg border p-4',
  {
    variants: {
      variant: {
        default: 'bg-neutral-50 border-neutral-200 text-neutral-800',
        info: 'bg-primary-50 border-primary-200 text-primary-800',
        success: 'bg-success-50 border-success-200 text-success-800',
        warning: 'bg-warning-50 border-warning-200 text-warning-800',
        error: 'bg-error-50 border-error-200 text-error-800',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const icons = {
  default: Info,
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
};

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

export function Alert({
  className,
  variant = 'default',
  title,
  dismissible,
  onDismiss,
  children,
  ...props
}: AlertProps) {
  const Icon = icons[variant || 'default'];

  return (
    <div
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      <div className="flex gap-3">
        <Icon className="h-5 w-5 shrink-0" />
        <div className="flex-1">
          {title && (
            <h5 className="mb-1 font-medium leading-none tracking-tight">
              {title}
            </h5>
          )}
          <div className="text-sm [&_p]:leading-relaxed">{children}</div>
        </div>
        {dismissible && (
          <button
            onClick={onDismiss}
            className="shrink-0 rounded-md p-0.5 opacity-70 transition-opacity hover:opacity-100"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
          </button>
        )}
      </div>
    </div>
  );
}

// Inline alert for form validation
export function InlineAlert({
  variant = 'error',
  children,
  className,
}: {
  variant?: 'error' | 'warning' | 'info';
  children: React.ReactNode;
  className?: string;
}) {
  const Icon = icons[variant];

  return (
    <div
      className={cn(
        'flex items-center gap-2 text-sm',
        variant === 'error' && 'text-error-600',
        variant === 'warning' && 'text-warning-600',
        variant === 'info' && 'text-primary-600',
        className
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}
