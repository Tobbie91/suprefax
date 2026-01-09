import { Search, Filter } from 'lucide-react';
import { Button, Card, CardContent, Input, DocumentStatusBadge } from '@/components/common';

export default function AdminDocumentsPage() {
  const documents = [
    {
      id: '1',
      name: 'Loan Agreement',
      application: 'APP-2024-001',
      user: 'John Doe',
      status: 'pending_approval' as const,
      createdAt: '2024-01-16',
    },
    {
      id: '2',
      name: 'Declaration Form',
      application: 'APP-2024-001',
      user: 'John Doe',
      status: 'approved' as const,
      createdAt: '2024-01-16',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Documents</h1>
        <p className="text-sm text-neutral-600">
          Manage generated documents and approvals
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input placeholder="Search documents..." className="pl-10" />
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-neutral-200 bg-neutral-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                    Document
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                    Application
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                    Created
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-neutral-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 font-medium text-neutral-900">
                      {doc.name}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {doc.application}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">{doc.user}</td>
                    <td className="px-4 py-3">
                      <DocumentStatusBadge status={doc.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-500">
                      {doc.createdAt}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="outline" size="sm">
                        Review
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
