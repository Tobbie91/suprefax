import { Link } from 'react-router-dom';
import { Menu, Bell, Search } from 'lucide-react';
import { Avatar } from '@/components/common';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/common/Dropdown';

interface TopbarProps {
  onMenuClick: () => void;
  userName?: string;
  userEmail?: string;
  avatarUrl?: string;
}

export function Topbar({
  onMenuClick,
  userName = 'User',
  userEmail = 'user@example.com',
  avatarUrl,
}: TopbarProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center border-b border-neutral-200 bg-white px-4 lg:px-6">
      {/* Mobile menu button */}
      <button
        type="button"
        className="inline-flex items-center justify-center rounded-md p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 lg:hidden"
        onClick={onMenuClick}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" />
      </button>

      {/* Search */}
      <div className="ml-4 flex flex-1 items-center lg:ml-0">
        <div className="hidden max-w-md flex-1 md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search..."
              className="h-10 w-full rounded-lg border border-neutral-300 bg-white pl-10 pr-4 text-sm placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="relative rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
            >
              <span className="sr-only">View notifications</span>
              <Bell className="h-5 w-5" />
              {/* Notification dot */}
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-error-500" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-y-auto">
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                <p className="text-sm font-medium">Application Approved</p>
                <p className="text-xs text-neutral-500">
                  Your visa POF application has been approved.
                </p>
                <p className="text-xs text-neutral-400">2 hours ago</p>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                <p className="text-sm font-medium">Document Ready</p>
                <p className="text-xs text-neutral-500">
                  Your loan agreement is ready for download.
                </p>
                <p className="text-xs text-neutral-400">5 hours ago</p>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                to="/dashboard/notifications"
                className="w-full text-center text-primary-600"
              >
                View all notifications
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-3 rounded-lg p-1.5 hover:bg-neutral-100"
            >
              <Avatar size="sm" src={avatarUrl} fallback={userName} />
              <div className="hidden text-left lg:block">
                <p className="text-sm font-medium text-neutral-900">{userName}</p>
                <p className="text-xs text-neutral-500">{userEmail}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="font-medium">{userName}</p>
              <p className="text-xs font-normal text-neutral-500">{userEmail}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/dashboard/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/dashboard/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-error-600">Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
