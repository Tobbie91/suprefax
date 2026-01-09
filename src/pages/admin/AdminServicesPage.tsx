import { Plus, Edit, ToggleLeft } from 'lucide-react';
import { Button, Card, CardContent, Badge } from '@/components/common';

export default function AdminServicesPage() {
  const services = [
    {
      id: '1',
      name: 'Visa Proof of Funds',
      slug: 'visa-pof',
      category: 'Visa Services',
      isActive: true,
      basePrice: 50000,
    },
    {
      id: '2',
      name: 'LPO Financing',
      slug: 'lpo-financing',
      category: 'Business Financing',
      isActive: true,
      basePrice: null,
    },
    {
      id: '3',
      name: 'Working Capital',
      slug: 'working-capital',
      category: 'Business Financing',
      isActive: true,
      basePrice: null,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Services</h1>
          <p className="text-sm text-neutral-600">
            Manage available services and pricing
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Service
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-neutral-200 bg-neutral-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                    Service
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                    Base Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-neutral-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {services.map((service) => (
                  <tr key={service.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-neutral-900">
                          {service.name}
                        </p>
                        <p className="text-sm text-neutral-500">
                          /{service.slug}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {service.category}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {service.basePrice
                        ? `₦${service.basePrice.toLocaleString()}`
                        : 'Variable'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={service.isActive ? 'success' : 'default'} dot>
                        {service.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon-sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon-sm">
                          <ToggleLeft className="h-4 w-4" />
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
