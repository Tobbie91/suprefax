import { Link } from 'react-router-dom';
import {
  FolderOpen,
  FileText,
  Clock,
  CheckCircle,
  Plus,
  ArrowRight,
} from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  StatusBadge,
  EmptyState,
} from '@/components/common';

// TODO: Replace with real data from Supabase
// For now, showing empty state for new users
const stats = [
  { label: 'Total Applications', value: '0', icon: FolderOpen, color: 'primary' },
  { label: 'Pending Review', value: '0', icon: Clock, color: 'warning' },
  { label: 'Approved', value: '0', icon: CheckCircle, color: 'success' },
  { label: 'Documents Ready', value: '0', icon: FileText, color: 'secondary' },
];

// Empty array - will be populated from Supabase
const recentApplications: Array<{
  id: string;
  reference: string;
  service: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'completed';
  date: string;
}> = [];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
          <p className="text-sm text-neutral-600">
            Welcome! Get started by creating your first application.
          </p>
        </div>
        <Button asChild>
          <Link to="/dashboard/applications/new">
            <Plus className="mr-2 h-4 w-4" />
            New Application
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 pt-6">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-lg bg-${stat.color}-100`}
              >
                <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
                <p className="text-sm text-neutral-600">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Applications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Applications</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard/applications">
                View all
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentApplications.length === 0 ? (
              <EmptyState
                icon={FolderOpen}
                title="No applications yet"
                description="Start your first application to see it here."
                action={{
                  label: 'New Application',
                  onClick: () => {
                    window.location.href = '/dashboard/applications/new';
                  },
                }}
              />
            ) : (
              <div className="space-y-4">
                {recentApplications.map((app) => (
                  <Link
                    key={app.id}
                    to={`/dashboard/applications/${app.id}`}
                    className="flex items-center justify-between rounded-lg border border-neutral-200 p-4 transition-colors hover:bg-neutral-50"
                  >
                    <div>
                      <p className="font-medium text-neutral-900">{app.service}</p>
                      <p className="text-sm text-neutral-500">{app.reference}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-neutral-500">{app.date}</span>
                      <StatusBadge status={app.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <Link
                to="/dashboard/applications/new"
                className="flex items-center gap-3 rounded-lg border border-neutral-200 p-4 transition-colors hover:bg-neutral-50"
              >
                <div className="text-2xl">📜</div>
                <div>
                  <p className="font-medium text-neutral-900">Student Proof of Funds</p>
                  <p className="text-xs text-neutral-500">Apply now</p>
                </div>
              </Link>
              <Link
                to="/dashboard/documents"
                className="flex items-center gap-3 rounded-lg border border-neutral-200 p-4 transition-colors hover:bg-neutral-50"
              >
                <div className="text-2xl">📁</div>
                <div>
                  <p className="font-medium text-neutral-900">My Documents</p>
                  <p className="text-xs text-neutral-500">View documents</p>
                </div>
              </Link>
              <Link
                to="/dashboard/profile"
                className="flex items-center gap-3 rounded-lg border border-neutral-200 p-4 transition-colors hover:bg-neutral-50"
              >
                <div className="text-2xl">👤</div>
                <div>
                  <p className="font-medium text-neutral-900">Profile</p>
                  <p className="text-xs text-neutral-500">Update info</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
