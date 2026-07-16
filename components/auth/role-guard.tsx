'use client';

import { useRole } from '@/hooks/use-role';
import { UserRole } from '@/config/roles.config';
import { ReactNode } from 'react';

interface RoleGuardProps {
  children: ReactNode;
  roles: UserRole[];
  fallback?: ReactNode;
}

export function RoleGuard({ children, roles, fallback = null }: RoleGuardProps) {
  const { user, isAuthenticated } = useRole();

  if (!isAuthenticated || !user || !roles.includes(user.role as UserRole)) {
    return fallback;
  }

  return <>{children}</>;
}
