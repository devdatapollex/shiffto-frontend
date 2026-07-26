'use client';

import { useRole } from '@/hooks/use-role';
import { UserRole } from '@/config/roles.config';
import { ReactNode } from 'react';

interface RoleGuardProps {
  children: ReactNode;
  roles?: UserRole[];
  allowedRoles?: UserRole[];
  fallback?: ReactNode;
}

export function RoleGuard({ children, roles, allowedRoles, fallback = null }: RoleGuardProps) {
  const { user, isAuthenticated } = useRole();

  const targetRoles = roles || allowedRoles || [];

  if (
    !isAuthenticated ||
    !user ||
    !Array.isArray(targetRoles) ||
    !targetRoles.includes(user.role as UserRole)
  ) {
    return fallback;
  }

  return <>{children}</>;
}
