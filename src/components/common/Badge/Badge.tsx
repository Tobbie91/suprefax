import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-neutral-100 text-neutral-800',
        primary: 'bg-primary-100 text-primary-800',
        secondary: 'bg-secondary-100 text-secondary-800',
        success: 'bg-success-100 text-success-800',
        warning: 'bg-warning-100 text-warning-800',
        error: 'bg-error-100 text-error-800',
        outline: 'border border-neutral-300 text-neutral-700 bg-transparent',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export function Badge({
  className,
  variant,
  size,
  dot,
  children,
  ...props
}: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            'mr-1.5 h-1.5 w-1.5 rounded-full',
            variant === 'success' && 'bg-success-500',
            variant === 'warning' && 'bg-warning-500',
            variant === 'error' && 'bg-error-500',
            variant === 'primary' && 'bg-primary-500',
            variant === 'secondary' && 'bg-secondary-500',
            (!variant || variant === 'default' || variant === 'outline') &&
              'bg-neutral-500'
          )}
        />
      )}
      {children}
    </span>
  );
}

// Status-specific badges for common use cases
export function StatusBadge({
  status,
}: {
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'completed';
}) {
  const config = {
    draft: { variant: 'default' as const, label: 'Draft' },
    submitted: { variant: 'primary' as const, label: 'Submitted' },
    under_review: { variant: 'warning' as const, label: 'Under Review' },
    approved: { variant: 'success' as const, label: 'Approved' },
    rejected: { variant: 'error' as const, label: 'Rejected' },
    completed: { variant: 'success' as const, label: 'Completed' },
  };

  const { variant, label } = config[status];

  return (
    <Badge variant={variant} dot>
      {label}
    </Badge>
  );
}

export function DocumentStatusBadge({
  status,
}: {
  status: 'draft' | 'pending_approval' | 'approved' | 'released';
}) {
  const config = {
    draft: { variant: 'default' as const, label: 'Draft' },
    pending_approval: { variant: 'warning' as const, label: 'Pending Approval' },
    approved: { variant: 'primary' as const, label: 'Approved' },
    released: { variant: 'success' as const, label: 'Released' },
  };

  const { variant, label } = config[status];

  return (
    <Badge variant={variant} dot>
      {label}
    </Badge>
  );
}
