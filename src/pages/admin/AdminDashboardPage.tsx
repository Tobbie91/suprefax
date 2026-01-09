import {
  Users,
  FolderOpen,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, StatusBadge } from '@/components/common';

const stats = [
  { label: 'Total Users', value: '1,234', icon: Users, change: '+12%' },
  { label: 'Applications', value: '567', icon: FolderOpen, change: '+8%' },
  { label: 'Documents', value: '892', icon: FileText, change: '+15%' },
  { label: 'Revenue', value: '₦12.5M', icon: TrendingUp, change: '+23%' },
];

const pendingApplications = [
  {
    id: '1',
    reference: 'APP-2024-001',
    user: 'John Doe',
    service: 'Visa POF',
    submittedAt: '2 hours ago',
    status: 'under_review' as const,
  },
  {
    id: '2',
    reference: 'APP-2024-002',
    user: 'Jane Smith',
    service: 'LPO Financing',
    submittedAt: '5 hours ago',
    status: 'submitted' as const,
  },
  {
    id: '3',
    reference: 'APP-2024-003',
    user: 'Bob Wilson',
    service: 'Working Capital',
    submittedAt: '1 day ago',
    status: 'submitted' as const,
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Admin Dashboard</h1>
        <p className="text-sm text-neutral-600">
          Overview of platform activity and pending tasks
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
                <stat.icon className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
                <p className="text-sm text-neutral-600">{stat.label}</p>
              </div>
              <span className="ml-auto text-sm font-medium text-success-600">
                {stat.change}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Applications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-warning-500" />
              Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingApplications.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between rounded-lg border border-neutral-200 p-4"
                >
                  <div>
                    <p className="font-medium text-neutral-900">{app.reference}</p>
                    <p className="text-sm text-neutral-500">
                      {app.user} • {app.service}
                    </p>
                    <p className="text-xs text-neutral-400">{app.submittedAt}</p>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-100">
                    <CheckCircle className="h-5 w-5 text-success-600" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900">
                      Applications Approved
                    </p>
                    <p className="text-sm text-neutral-500">Today</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-neutral-900">12</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
                    <FileText className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900">
                      Documents Generated
                    </p>
                    <p className="text-sm text-neutral-500">Today</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-neutral-900">8</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-100">
                    <AlertCircle className="h-5 w-5 text-warning-600" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900">
                      Pending Actions
                    </p>
                    <p className="text-sm text-neutral-500">Requires attention</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-neutral-900">5</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
