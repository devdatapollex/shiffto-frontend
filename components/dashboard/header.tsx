'use client';

import { useSession } from '@/lib/auth-client';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { Menu, Bell, Search, User, ChevronLeft, ChevronRight, Plus, Package } from 'lucide-react';
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
    return 'Home';
  };

  const title = getPageTitle();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background/95 px-4 backdrop-blur-sm sm:px-8">
      {/* Left side: Navigation & Title */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>

        {/* Desktop History Navigation Chevrons & Page Title */}
        <div className="hidden items-center gap-3 lg:flex">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 rounded-md border-slate-200 text-slate-400 hover:text-slate-600 bg-white"
              onClick={() => router.back()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 rounded-md border-slate-200 text-slate-400 hover:text-slate-600 bg-white"
              onClick={() => router.forward()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <h1 className="text-lg font-bold text-[#0B3A8E] tracking-tight">{title}</h1>
        </div>

        {/* Mobile Page Title */}
        <h1 className="text-base font-bold text-[#0B3A8E] tracking-tight lg:hidden">{title}</h1>
      </div>

      {/* Right side: Search, Bell and Buttons */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Search bar */}
        <div className="relative hidden items-center md:flex">
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

        {/* Notifications Bell */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 flex h-2 w-2 rounded-full bg-orange-500 ring-2 ring-background" />
        </Button>

        {/* Add Trip Button */}
        <Link href={ROUTES.MY_TRIPS} className="hidden sm:inline-block">
          <Button
            variant="outline"
            size="sm"
            className="h-9 border-primary text-primary hover:bg-primary/5 hover:text-primary font-medium"
          >
            <Plus className="mr-1.5 h-4 w-4 stroke-[2.5]" />
            Add trip
          </Button>
        </Link>

        {/* Create Shipment Button */}
        <Link href={ROUTES.CREATE_SHIPMENT}>
          <Button
            size="sm"
            className="h-9 bg-primary hover:bg-primary/95 text-white font-medium shadow-sm"
          >
            <Package className="mr-1.5 h-4 w-4" />
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
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
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
