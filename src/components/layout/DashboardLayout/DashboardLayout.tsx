import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useAuthStore } from '@/stores/auth.store';

interface DashboardLayoutProps {
  isAdmin?: boolean;
}

export function DashboardLayout({ isAdmin = false }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, profile } = useAuthStore();

  // Get user display name from profile or user metadata
  const userName = profile?.full_name || user?.user_metadata?.full_name || 'User';
  const userEmail = user?.email || '';

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 lg:hidden',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="relative h-full">
          <button
            type="button"
            className="absolute right-4 top-4 rounded-md p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
          <Sidebar isAdmin={isAdmin} onClose={() => setSidebarOpen(false)} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden w-64 shrink-0 border-r border-neutral-200 lg:block">
        <Sidebar isAdmin={isAdmin} />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
          userName={userName}
          userEmail={userEmail}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
