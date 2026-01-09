import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const avatarVariants = cva(
  'relative inline-flex items-center justify-center overflow-hidden rounded-full bg-neutral-200',
  {
    variants: {
      size: {
        xs: 'h-6 w-6 text-xs',
        sm: 'h-8 w-8 text-sm',
        md: 'h-10 w-10 text-base',
        lg: 'h-12 w-12 text-lg',
        xl: 'h-16 w-16 text-xl',
        '2xl': 'h-20 w-20 text-2xl',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  src?: string | null;
  alt?: string;
  fallback?: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function Avatar({
  className,
  size,
  src,
  alt = '',
  fallback,
  ...props
}: AvatarProps) {
  const initials = fallback ? getInitials(fallback) : '?';

  return (
    <div className={cn(avatarVariants({ size }), className)} {...props}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              const fallbackEl = document.createElement('span');
              fallbackEl.className = 'font-medium text-neutral-600';
              fallbackEl.textContent = initials;
              parent.appendChild(fallbackEl);
            }
          }}
        />
      ) : (
        <span className="font-medium text-neutral-600">{initials}</span>
      )}
    </div>
  );
}

export interface AvatarGroupProps {
  children: React.ReactNode;
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export function AvatarGroup({ children, max = 4, size = 'md' }: AvatarGroupProps) {
  const childArray = Array.isArray(children) ? children : [children];
  const visibleAvatars = childArray.slice(0, max);
  const remainingCount = childArray.length - max;

  return (
    <div className="flex -space-x-2">
      {visibleAvatars}
      {remainingCount > 0 && (
        <Avatar
          size={size}
          className="border-2 border-white bg-neutral-100"
          fallback={`+${remainingCount}`}
        />
      )}
    </div>
  );
}
