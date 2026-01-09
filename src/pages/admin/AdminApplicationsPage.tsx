import { Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button, Card, CardContent, Input, StatusBadge } from '@/components/common';

// Mock data
const applications = [
  {
    id: '1',
    reference: 'APP-2024-001',
    user: 'John Doe',
    email: 'john@example.com',
    service: 'Visa Proof of Funds',
    status: 'under_review' as const,
    submittedAt: '2024-01-15',
    assignedTo: 'Admin User',
  },
  {
    id: '2',
    reference: 'APP-2024-002',
    user: 'Jane Smith',
    email: 'jane@example.com',
    service: 'LPO Financing',
    status: 'submitted' as const,
    submittedAt: '2024-01-14',
    assignedTo: null,
  },
  {
    id: '3',
    reference: 'APP-2024-003',
    user: 'Bob Wilson',
    email: 'bob@example.com',
    service: 'Working Capital',
    status: 'approved' as const,
    submittedAt: '2024-01-13',
    assignedTo: 'Admin User',
  },
];

export default function AdminApplicationsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Applications</h1>
        <p className="text-sm text-neutral-600">
          Review and manage all submitted applications
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input placeholder="Search applications..." className="pl-10" />
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-neutral-200 bg-neutral-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                    Reference
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                    Service
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                    Submitted
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                    Assigned To
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-neutral-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      <Link
                        to={`/admin/applications/${app.id}`}
                        className="font-medium text-primary-600 hover:underline"
                      >
                        {app.reference}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-neutral-900">{app.user}</p>
                        <p className="text-sm text-neutral-500">{app.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-neutral-700">{app.service}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-500">
                      {app.submittedAt}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-500">
                      {app.assignedTo || '-'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/admin/applications/${app.id}`}>Review</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
