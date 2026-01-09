import { Search, Filter, Plus } from 'lucide-react';
import { Button, Card, CardContent, Input, Badge, Avatar } from '@/components/common';

export default function AdminUsersPage() {
  const users = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'client',
      kycStatus: 'verified',
      createdAt: '2024-01-10',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'client',
      kycStatus: 'pending',
      createdAt: '2024-01-12',
    },
    {
      id: '3',
      name: 'Admin User',
      email: 'admin@suprefax.com',
      role: 'admin',
      kycStatus: 'verified',
      createdAt: '2024-01-01',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Users</h1>
          <p className="text-sm text-neutral-600">
            Manage user accounts and permissions
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input placeholder="Search users..." className="pl-10" />
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
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                    KYC Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                    Joined
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-neutral-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar size="sm" fallback={user.name} />
                        <div>
                          <p className="font-medium text-neutral-900">
                            {user.name}
                          </p>
                          <p className="text-sm text-neutral-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={user.role === 'admin' ? 'primary' : 'default'}
                      >
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          user.kycStatus === 'verified' ? 'success' : 'warning'
                        }
                        dot
                      >
                        {user.kycStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-500">
                      {user.createdAt}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="outline" size="sm">
                        View
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
