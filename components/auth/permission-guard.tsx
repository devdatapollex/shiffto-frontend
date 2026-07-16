'use client';

import { useRole } from '@/hooks/use-role';
import { ReactNode } from 'react';

interface PermissionGuardProps {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGuard({ permission, children, fallback = null }: PermissionGuardProps) {
  const { hasPermission } = useRole();

  if (!hasPermission(permission)) {
    return fallback;
  }

  return <>{children}</>;
}
