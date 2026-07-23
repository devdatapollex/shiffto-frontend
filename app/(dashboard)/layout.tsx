'use client';

import { useState, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/sidebar-new';
import { AdminSidebar } from '@/components/dashboard/admin-sidebar';
import { DashboardHeader } from '@/components/dashboard/header';
import { EmailVerificationGuard } from '@/components/auth/email-verification-guard';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const isAdminRoute =
    pathname.startsWith('/dashboard/admin') ||
    pathname === '/dashboard/settlements' ||
    pathname === '/dashboard/withdrawals' ||
    pathname === '/dashboard/users';

  return (
    <EmailVerificationGuard>
      <div className="flex h-dvh bg-primary/[0.02]">
        {isAdminRoute ? (
          <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        ) : (
          <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        )}

        <main className="flex-1 flex flex-col min-w-0">
          <DashboardHeader onMenuClick={() => setIsSidebarOpen(true)} />

          <div className="flex-1 overflow-hidden p-6 relative">
            <div
              className="absolute top-0 left-0 right-0 h-[200px] pointer-events-none z-0"
              style={{
                background:
                  'linear-gradient(to right, hsla(350, 92%, 74%, 0.3), hsla(46, 73%, 78%, 1), hsla(350, 92%, 74%, 0.3))',
                filter: 'blur(50px)',
              }}
              aria-hidden="true"
            />
            <div className="relative z-10 h-full overflow-y-auto">
              <div className="mx-auto max-w-[1144px] animate-in fade-in slide-in-from-bottom-4 duration-500">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </EmailVerificationGuard>
  );
}
