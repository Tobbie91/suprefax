import { Link } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  Input,
  StatusBadge,
  NoApplications,
} from '@/components/common';

// TODO: Replace with real data from Supabase
// Empty array for new users
const applications: Array<{
  id: string;
  reference: string;
  service: string;
  serviceIcon: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'completed';
  createdAt: string;
  updatedAt: string;
}> = [];

export default function ApplicationsPage() {
  const hasApplications = applications.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Applications</h1>
          <p className="text-sm text-neutral-600">
            Manage and track all your applications
          </p>
        </div>
        <Button asChild>
          <Link to="/dashboard/applications/new">
            <Plus className="mr-2 h-4 w-4" />
            New Application
          </Link>
        </Button>
      </div>

      {/* Filters - only show if there are applications */}
      {hasApplications && (
        <Card>
          <CardContent className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                placeholder="Search applications..."
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Applications List */}
      {hasApplications ? (
        <div className="space-y-4">
          {applications.map((app) => (
            <Card key={app.id} hover>
              <CardContent className="py-4">
                <Link
                  to={`/dashboard/applications/${app.id}`}
                  className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{app.serviceIcon}</div>
                    <div>
                      <p className="font-medium text-neutral-900">
                        {app.service}
                      </p>
                      <p className="text-sm text-neutral-500">{app.reference}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-neutral-500">
                        Created: {app.createdAt}
                      </p>
                      <p className="text-xs text-neutral-400">
                        Updated: {app.updatedAt}
                      </p>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <NoApplications
              onCreateNew={() => {
                window.location.href = '/dashboard/applications/new';
              }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
