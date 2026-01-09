import { Plus, Edit, Eye, Copy } from 'lucide-react';
import { Button, Card, CardContent, Badge } from '@/components/common';

export default function AdminTemplatesPage() {
  const templates = [
    {
      id: '1',
      name: 'Loan Agreement - Student Visa',
      service: 'Visa Proof of Funds',
      version: 3,
      isActive: true,
      updatedAt: '2024-01-15',
    },
    {
      id: '2',
      name: 'Loan Agreement - Work Visa',
      service: 'Visa Proof of Funds',
      version: 2,
      isActive: true,
      updatedAt: '2024-01-14',
    },
    {
      id: '3',
      name: 'Declaration Form',
      service: 'All Services',
      version: 1,
      isActive: true,
      updatedAt: '2024-01-10',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            Document Templates
          </h1>
          <p className="text-sm text-neutral-600">
            Manage document templates for services
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Template
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-neutral-200 bg-neutral-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                    Template
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                    Service
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                    Version
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                    Updated
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-neutral-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {templates.map((template) => (
                  <tr key={template.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 font-medium text-neutral-900">
                      {template.name}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {template.service}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      v{template.version}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={template.isActive ? 'success' : 'default'}
                        dot
                      >
                        {template.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-500">
                      {template.updatedAt}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon-sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon-sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon-sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
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
