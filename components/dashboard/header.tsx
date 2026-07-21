'use client';

import { useSession } from '@/lib/auth-client';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import {
  Menu,
  Bell,
  Search,
  User,
  ChevronLeft,
  ChevronRight,
  PlaneTakeoff,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { authClient } from '@/lib/auth-client';
import { ROUTES } from '@/config/routes';
import Link from 'next/link';
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from '@/hooks/use-notifications';

interface HeaderProps {
  onMenuClick: () => void;
}

export function DashboardHeader({ onMenuClick }: HeaderProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await authClient.signOut();
    toast.success('Signed out');
    router.push(ROUTES.LOGIN);
    router.refresh();
  };

  // Determine dynamic page title
  const getPageTitle = () => {
    if (pathname.includes('/dashboard/my-shipments')) return 'My Shipments';
    if (pathname.includes('/dashboard/shipments/create')) return 'Create Shipment';
    if (pathname.includes('/dashboard/browse-shipment')) return 'Browse Shipment';
    if (pathname.includes('/dashboard/tracking')) return 'Tracking';
    if (pathname.includes('/dashboard/my-trips')) return 'My Trips';
    if (pathname.includes('/dashboard/payment-earnings')) return 'Payments & Earnings';
    if (pathname.includes('/dashboard/wallet')) return 'Wallet';
    if (pathname.includes('/dashboard/ratings-reviews')) return 'Ratings & Reviews';
    if (pathname.includes('/dashboard/support')) return 'Support';
    if (pathname.includes('/dashboard/profile')) return 'Profile';
    if (pathname.includes('/dashboard/admin/kyc')) return 'KYC Submissions';
    if (pathname.includes('/dashboard/admin/trips')) return 'Manage Trips';
    return 'Home';
  };

  const title = getPageTitle();

  const { data: notifications } = useNotifications();
  const { mutate: markAsRead } = useMarkNotificationAsRead();
  const { mutate: markAllAsRead } = useMarkAllNotificationsAsRead();

  const hasUnread = notifications ? notifications.some((n) => !n.read) : false;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border-layout bg-background/95 px-4 backdrop-blur-sm sm:px-8">
      {/* Left side: Navigation, Title & Search */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>

        {/* History Nav */}
        <div className="hidden lg:flex items-center border border-slate-200 rounded-md bg-white overflow-hidden h-8">
          <button
            onClick={() => router.back()}
            className="h-full px-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 border-r border-slate-100 transition-colors cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => router.forward()}
            className="h-full px-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold text-[#0B3A8E] tracking-tight hidden lg:block">{title}</h1>

        {/* Mobile Page Title */}
        <h1 className="text-base font-bold text-[#0B3A8E] tracking-tight lg:hidden">{title}</h1>

        {/* Search bar next to title (on desktop) */}
        <div className="relative hidden items-center md:flex ml-2">
          <Search className="absolute left-3 h-4 w-4 text-slate-400" />
          <input
            type="search"
            placeholder="Search"
            className="h-9 w-60 rounded-md border border-slate-200 bg-slate-50 pl-9 pr-12 text-sm transition-all focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary shadow-sm"
          />
          <kbd className="pointer-events-none absolute right-2 inline-flex h-5 select-none items-center gap-0.5 rounded border bg-slate-100 px-1.5 font-mono text-[9px] font-medium text-slate-400">
            <span>⌘</span>F
          </kbd>
        </div>
      </div>

      {/* Right side: Bell and Buttons */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Notifications Bell Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative text-[#0B3A8E] hover:text-primary transition-colors cursor-pointer outline-none focus:outline-none flex items-center justify-center p-0 bg-transparent border-0">
              <Bell className="size-5" />
              {hasUnread && (
                <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-primary" />
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-80 sm:w-96 max-h-[450px] overflow-y-auto p-0"
          >
            <div className="flex items-center justify-between border-b p-3">
              <span className="font-semibold text-sm text-[#0B3A8E]">Notifications</span>
              {hasUnread && (
                <Button
                  variant="ghost"
                  className="h-auto p-0 text-xs text-[#FF6F3F] hover:text-[#e05626] font-medium"
                  onClick={() => markAllAsRead()}
                >
                  Mark all as read
                </Button>
              )}
            </div>
            <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto pr-0 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300">
              {notifications && notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => {
                      if (!notification.read) {
                        markAsRead(notification.id);
                      }
                    }}
                    className={`p-3.5 text-xs transition-colors cursor-pointer hover:bg-slate-50/80 ${
                      !notification.read
                        ? 'bg-slate-50/30 font-semibold border-l-2 border-l-[#FF6F3F]'
                        : 'border-l-2 border-l-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`text-slate-800 ${!notification.read ? 'text-[#0B3A8E]' : ''}`}
                      >
                        {notification.title}
                      </span>
                      {!notification.read && (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#FF6F3F] mt-1" />
                      )}
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500 leading-relaxed font-normal">
                      {notification.message}
                    </p>
                    <span className="mt-1.5 block text-[10px] text-slate-400 font-normal">
                      {new Date(notification.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                  <Bell className="h-8 w-8 mb-2 stroke-1" />
                  <p className="text-xs">No notifications yet</p>
                </div>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Add Trip Button */}
        <Link href={ROUTES.CREATE_TRIP} className="hidden sm:inline-block">
          <Button
            variant="outline"
            className="h-10 border-primary! bg-white! text-primary! hover:bg-primary/[0.04]! hover:text-primary! font-semibold px-5 rounded-lg cursor-pointer flex items-center gap-2"
          >
            <PlaneTakeoff className="h-4 w-4" />
            Add trip
          </Button>
        </Link>

        {/* Create Shipment Button */}
        <Link href={ROUTES.CREATE_SHIPMENT}>
          <Button className="h-10 bg-primary hover:bg-primary/95 text-white font-semibold px-5 rounded-lg shadow-sm cursor-pointer flex items-center gap-2">
            <Package className="h-4 w-4" />
            Create shipment
          </Button>
        </Link>

        {/* User profile dropdown - hidden on desktop if sidebar footer is visible */}
        <div className="lg:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-muted">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{session?.user?.name || 'My Account'}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={ROUTES.PROFILE}>Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
