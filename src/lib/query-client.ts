import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time of 5 minutes
      staleTime: 5 * 60 * 1000,
      // Cache time of 30 minutes
      gcTime: 30 * 60 * 1000,
      // Retry failed requests up to 3 times
      retry: 3,
      // Refetch on window focus
      refetchOnWindowFocus: true,
      // Don't refetch on mount if data is fresh
      refetchOnMount: true,
    },
    mutations: {
      // Retry mutations once
      retry: 1,
    },
  },
});

// Query keys factory for consistent key management
export const queryKeys = {
  // Auth
  auth: {
    all: ['auth'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
    session: () => [...queryKeys.auth.all, 'session'] as const,
    profile: (userId: string) => [...queryKeys.auth.all, 'profile', userId] as const,
  },

  // Services
  services: {
    all: ['services'] as const,
    lists: () => [...queryKeys.services.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.services.lists(), filters] as const,
    details: () => [...queryKeys.services.all, 'detail'] as const,
    detail: (slug: string) => [...queryKeys.services.details(), slug] as const,
  },

  // Applications
  applications: {
    all: ['applications'] as const,
    lists: () => [...queryKeys.applications.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.applications.lists(), filters] as const,
    details: () => [...queryKeys.applications.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.applications.details(), id] as const,
    byUser: (userId: string) =>
      [...queryKeys.applications.all, 'user', userId] as const,
  },

  // Documents
  documents: {
    all: ['documents'] as const,
    lists: () => [...queryKeys.documents.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.documents.lists(), filters] as const,
    details: () => [...queryKeys.documents.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.documents.details(), id] as const,
    byApplication: (applicationId: string) =>
      [...queryKeys.documents.all, 'application', applicationId] as const,
  },

  // Notifications
  notifications: {
    all: ['notifications'] as const,
    lists: () => [...queryKeys.notifications.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.notifications.lists(), filters] as const,
    unread: () => [...queryKeys.notifications.all, 'unread'] as const,
    unreadCount: () => [...queryKeys.notifications.all, 'unread-count'] as const,
  },

  // Templates
  templates: {
    all: ['templates'] as const,
    lists: () => [...queryKeys.templates.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.templates.lists(), filters] as const,
    details: () => [...queryKeys.templates.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.templates.details(), id] as const,
    byService: (serviceId: string) =>
      [...queryKeys.templates.all, 'service', serviceId] as const,
  },

  // Users (admin)
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
  },

  // Approvals
  approvals: {
    all: ['approvals'] as const,
    byEntity: (entityType: string, entityId: string) =>
      [...queryKeys.approvals.all, entityType, entityId] as const,
  },
};
