'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, LogOut, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DASHBOARD_MENU_SECTIONS } from '@/constants/menu-items';
import { useRole } from '@/hooks/use-role';
import { useSession, authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';
import { toast } from 'sonner';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const { role: userRole, hasPermission } = useRole();
  const { data: session } = useSession();
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

  const filteredSections = DASHBOARD_MENU_SECTIONS.filter(
    (section) => section.label !== 'Admin'
  ).map((section) => ({
    ...section,
    items: section.items.filter((item) => {
      if (item.roles && item.roles.includes(role || '')) return true;
      if (item.permission && hasPermission(item.permission)) return true;
      return false;
    }),
  })).filter((section) => section.items.length > 0);

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
          'border-primary/5',
          isCollapsed ? 'w-[80px]' : 'w-[280px]',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo Section */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-primary/5 bg-primary/[0.02]">
          {!isCollapsed && (
            <span className="text-xl font-bold tracking-tight text-primary drop-shadow-sm">
              SHIFFTO
            </span>
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
        <nav className="flex-1 space-y-6 px-3 py-4 overflow-y-auto">
          {filteredSections.map((section, sectionIdx) => (
            <div key={sectionIdx}>
              {section.label && !isCollapsed && (
                <h3 className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                  {section.label}
                </h3>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110',
                          isActive
                            ? 'text-primary'
                            : 'text-muted-foreground group-hover:text-foreground'
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
                        <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 text-[11px] font-bold text-primary animate-pulse">
                          3
                        </span>
                      )}

                      {item.label === 'My Shipments' && isCollapsed && (
                        <span className="absolute right-3 top-3 flex h-2 w-2 rounded-full bg-primary" />
                      )}

                      {isActive && (
                        <div className="absolute inset-y-0 left-0 w-1 bg-primary rounded-r-full shadow-[0_0_10px_rgba(205,7,30,0.5)]" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {role === 'admin' && (
            <div className="pt-4 border-t border-primary/5">
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
        <div className="mt-auto border-t p-4">
          <Link
            href={ROUTES.PROFILE}
            className={cn(
              'flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50 cursor-pointer',
              isCollapsed && 'justify-center'
            )}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
              {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            {!isCollapsed && (
              <div className="flex flex-1 flex-col overflow-hidden">
                <span className="truncate text-sm font-semibold">
                  {session?.user?.name || 'User'}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {session?.user?.email || 'user@shiffto.com'}
                </span>
              </div>
            )}
          </Link>

          <Button
            variant="ghost"
            onClick={handleLogout}
            className={cn(
              'mt-2 w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10',
              isCollapsed && 'justify-center px-0'
            )}
          >
            <LogOut className="h-5 w-5" />
            {!isCollapsed && <span>Logout</span>}
          </Button>
        </div>
      </aside>
    </>
  );
}
