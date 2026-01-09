import { Bell, CheckCheck } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  NoNotifications,
} from '@/components/common';

// Mock data
const notifications = [
  {
    id: '1',
    type: 'application_approved',
    title: 'Application Approved',
    message: 'Your visa proof of funds application has been approved.',
    isRead: false,
    createdAt: '2 hours ago',
  },
  {
    id: '2',
    type: 'document_ready',
    title: 'Document Ready',
    message: 'Your loan agreement document is ready for download.',
    isRead: false,
    createdAt: '5 hours ago',
  },
  {
    id: '3',
    type: 'action_required',
    title: 'Action Required',
    message: 'Please provide additional documents for your LPO financing application.',
    isRead: true,
    createdAt: '1 day ago',
  },
  {
    id: '4',
    type: 'system_message',
    title: 'Welcome to Suprefax',
    message: 'Thank you for creating an account. Get started by submitting your first application.',
    isRead: true,
    createdAt: '3 days ago',
  },
];

export default function NotificationsPage() {
  const hasNotifications = notifications.length > 0;
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Notifications</h1>
          <p className="text-sm text-neutral-600">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : 'All caught up!'}
          </p>
        </div>
        {hasNotifications && unreadCount > 0 && (
          <Button variant="outline">
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      {hasNotifications ? (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={notification.isRead ? 'opacity-60' : ''}
            >
              <CardContent className="py-4">
                <div className="flex gap-4">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      notification.isRead
                        ? 'bg-neutral-100'
                        : 'bg-primary-100'
                    }`}
                  >
                    <Bell
                      className={`h-5 w-5 ${
                        notification.isRead
                          ? 'text-neutral-400'
                          : 'text-primary-600'
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-neutral-900">
                          {notification.title}
                        </p>
                        <p className="text-sm text-neutral-600">
                          {notification.message}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="h-2 w-2 rounded-full bg-primary-600" />
                      )}
                    </div>
                    <p className="mt-1 text-xs text-neutral-400">
                      {notification.createdAt}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <NoNotifications />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
