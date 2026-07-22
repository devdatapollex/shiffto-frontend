'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, LogOut, X, ArrowLeftRight, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DASHBOARD_MENU_SECTIONS } from '@/constants/menu-items';
import { useRole } from '@/hooks/use-role';
import { useSession, authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';
import { toast } from 'sonner';

import { useNotifications } from '@/hooks/use-notifications';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const { role: userRole, hasPermission } = useRole();
  const { data: session } = useSession();
  const { data: notifications } = useNotifications();
  const unreadCount = notifications ? notifications.filter((n) => !n.read).length : 0;
  const router = useRouter();
  const role = userRole || 'user';
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsOpen(false);
    }
  }, [pathname, setIsOpen]);

  const handleLogout = async () => {
    await authClient.signOut();
    toast.success('Signed out');
    router.push(ROUTES.LOGIN);
    router.refresh();
  };

  const filteredSections = DASHBOARD_MENU_SECTIONS.filter((section) => section.label !== 'Admin')
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (item.roles && item.roles.includes(role || '')) return true;
        if (item.permission && hasPermission(item.permission)) return true;
        return false;
      }),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-card transition-all duration-300 ease-in-out lg:static lg:translate-x-0',
          'border-border-layout',
          isCollapsed ? 'w-[80px]' : 'w-[280px]',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo Section */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-border-layout bg-primary/[0.02]">
          {!isCollapsed ? (
            <Link href={ROUTES.DASHBOARD} className="flex items-center gap-2.5">
              <img src="/shiffto-icon.svg" alt="SHIFFTO Icon" className="h-9 w-auto shrink-0" />
              <img src="/shiffto-name.svg" alt="SHIFFTO Name" className="h-2 w-auto shrink-0" />
            </Link>
          ) : (
            <Link href={ROUTES.DASHBOARD} className="mx-auto flex items-center justify-center">
              <img src="/shiffto-icon.svg" alt="SHIFFTO Icon" className="h-9 w-auto" />
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <ChevronLeft
              className={cn('h-5 w-5 transition-transform', isCollapsed && 'rotate-180')}
            />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-grow space-y-4 px-3 py-6 overflow-y-auto">
          {filteredSections.map((section, sectionIdx) => (
            <div key={sectionIdx} className="space-y-1.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'group relative flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-[15px] font-medium transition-all duration-200',
                      isActive
                        ? 'bg-secondary text-primary'
                        : 'text-slate-500 hover:bg-slate-50/80 hover:text-slate-800',
                      isCollapsed && 'justify-center px-0'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-105',
                        isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-700'
                      )}
                    />
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex-grow"
                      >
                        {item.label}
                      </motion.span>
                    )}

                    {item.label === 'My Shipments' && !isCollapsed && (
                      <span className="ml-auto flex h-5 px-2 items-center justify-center rounded-md bg-[#ffece0] text-[11px] font-bold text-primary">
                        3
                      </span>
                    )}

                    {item.label === 'My Shipments' && isCollapsed && (
                      <span className="absolute right-3 top-3 flex h-2 w-2 rounded-full bg-primary" />
                    )}
                  </Link>
                );
              })}

              {/* If it's the last section (Support), we append the Log out button */}
              {sectionIdx === filteredSections.length - 1 && (
                <button
                  onClick={handleLogout}
                  className={cn(
                    'group w-full flex items-center gap-3.5 rounded-lg px-3.5 py-2.5 text-[15px] font-medium transition-all duration-200 text-red-500 hover:bg-red-50/50 hover:text-red-600 text-left cursor-pointer',
                    isCollapsed && 'justify-center px-0'
                  )}
                >
                  <LogOut
                    className={cn(
                      'h-5 w-5 shrink-0 text-red-500 transition-transform duration-200 group-hover:scale-105'
                    )}
                  />
                  {!isCollapsed && <span>Log out</span>}
                </button>
              )}

              {/* Add border separator between sections (except the last one) */}
              {sectionIdx < filteredSections.length - 1 && (
                <div className="pt-3 border-b border-border-layout -mx-3" />
              )}
            </div>
          ))}

          {role === 'admin' && (
            <div className="pt-4 border-t border-border-layout">
              <Link
                href={ROUTES.ADMIN_KYC}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  'text-muted-foreground hover:bg-primary/5 hover:text-primary'
                )}
              >
                <ArrowLeftRight className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110 text-muted-foreground group-hover:text-primary" />
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    Switch to Admin View
                  </motion.span>
                )}
              </Link>
            </div>
          )}
        </nav>

        {/* Footer / User Profile */}
        <div className="mt-auto border-t border-border-layout p-4 bg-white">
          <Link
            href={ROUTES.PROFILE}
            className={cn(
              'flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-slate-50/80 cursor-pointer',
              isCollapsed && 'justify-center'
            )}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold overflow-hidden">
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                session?.user?.name?.charAt(0)?.toUpperCase() || 'U'
              )}
            </div>
            {!isCollapsed && (
              <>
                <div className="flex flex-1 flex-col overflow-hidden">
                  <span className="truncate text-[15px] font-semibold text-foreground">
                    {session?.user?.name || 'Sarah Jenkins'}
                  </span>
                </div>
                <ChevronsUpDown className="h-4 w-4 shrink-0 text-slate-400" />
              </>
            )}
          </Link>
        </div>
      </aside>
    </>
  );
}
