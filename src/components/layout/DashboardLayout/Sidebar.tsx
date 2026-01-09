import { NavLink, Link, useNavigate } from 'react-router-dom';
import { cn } from '@/utils/cn';
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  User,
  Settings,
  HelpCircle,
  LogOut,
  Users,
  Shield,
  FileCheck,
  type LucideIcon,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

interface NavGroup {
  label?: string;
  items: NavItem[];
}

// Client navigation
const clientNavigation: NavGroup[] = [
  {
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Applications', href: '/dashboard/applications', icon: FolderOpen },
      { name: 'Documents', href: '/dashboard/documents', icon: FileText },
    ],
  },
  {
    label: 'Account',
    items: [
      { name: 'Profile', href: '/dashboard/profile', icon: User },
      { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ],
  },
];

// Admin navigation
const adminNavigation: NavGroup[] = [
  {
    items: [
      { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      { name: 'Applications', href: '/admin/applications', icon: FolderOpen },
      { name: 'Documents', href: '/admin/documents', icon: FileCheck },
      { name: 'Users', href: '/admin/users', icon: Users },
    ],
  },
  {
    label: 'Management',
    items: [
      { name: 'Services', href: '/admin/services', icon: FileText },
      { name: 'Templates', href: '/admin/templates', icon: FileText },
    ],
  },
  {
    label: 'System',
    items: [
      { name: 'Settings', href: '/admin/settings', icon: Settings },
      { name: 'Security', href: '/admin/security', icon: Shield },
    ],
  },
];

interface SidebarProps {
  isAdmin?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isAdmin = false, onClose }: SidebarProps) {
  const navigation = isAdmin ? adminNavigation : clientNavigation;
  const signOut = useAuthStore((state) => state.signOut);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center border-b border-neutral-200 px-6">
        <Link to="/" className="flex items-center gap-2" onClick={onClose}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white">
            <span className="text-sm font-bold">S</span>
          </div>
          <span className="text-lg font-semibold text-neutral-900">Suprefax</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-4">
        {navigation.map((group, groupIdx) => (
          <div key={groupIdx} className={cn(groupIdx > 0 && 'mt-6')}>
            {group.label && (
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                {group.label}
              </p>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.href}
                    end={item.href === '/dashboard' || item.href === '/admin'}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                      )
                    }
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="border-t border-neutral-200 p-4">
        <ul className="space-y-1">
          <li>
            <Link
              to="/help"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
            >
              <HelpCircle className="h-5 w-5" />
              Help & Support
            </Link>
          </li>
          <li>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
