import { cn } from '@/utils/cn';
import { FileX, Search, Inbox, FolderOpen, type LucideIcon } from 'lucide-react';
import { Button } from '../Button';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 text-center',
        className
      )}
    >
      <div className="mb-4 rounded-full bg-neutral-100 p-4">
        <Icon className="h-8 w-8 text-neutral-400" />
      </div>
      <h3 className="mb-1 text-lg font-semibold text-neutral-900">{title}</h3>
      {description && (
        <p className="mb-4 max-w-sm text-sm text-neutral-500">{description}</p>
      )}
      {action && (
        <Button variant="primary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Pre-configured empty states
export function NoResultsFound({
  searchTerm,
  onClear,
}: {
  searchTerm?: string;
  onClear?: () => void;
}) {
  return (
    <EmptyState
      icon={Search}
      title="No results found"
      description={
        searchTerm
          ? `No results match "${searchTerm}". Try adjusting your search or filters.`
          : 'No results match your criteria. Try adjusting your filters.'
      }
      action={onClear ? { label: 'Clear search', onClick: onClear } : undefined}
    />
  );
}

export function NoApplications({ onCreateNew }: { onCreateNew?: () => void }) {
  return (
    <EmptyState
      icon={FolderOpen}
      title="No applications yet"
      description="You haven't submitted any applications. Get started by creating a new application."
      action={
        onCreateNew
          ? { label: 'Create application', onClick: onCreateNew }
          : undefined
      }
    />
  );
}

export function NoDocuments() {
  return (
    <EmptyState
      icon={FileX}
      title="No documents"
      description="Documents will appear here once your applications are processed and approved."
    />
  );
}

export function NoNotifications() {
  return (
    <EmptyState
      icon={Inbox}
      title="No notifications"
      description="You're all caught up! New notifications will appear here."
    />
  );
}
