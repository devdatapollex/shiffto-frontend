import { useSession, authClient } from '@/lib/auth-client';
import type { UserRole } from '@/config/roles.config';

export const useRole = () => {
  const { data: session, isPending } = useSession();
  const role = (session?.user?.role as UserRole) ?? 'user';

  const hasPermission = (permission: string): boolean => {
    if (role === 'admin') return true;
    const [resource, action] = permission.split(':');
    if (!resource || !action) return false;
    return authClient.admin.checkRolePermission({
      permissions: { [resource]: [action] },
      role,
    });
  };

  return {
    role,
    isAdmin: role === 'admin',
    isUser: role === 'user',
    user: session?.user ?? null,
    isAuthenticated: !!session,
    isPending,
    hasPermission,
    checkAccess: (allowedRoles: string[]) => allowedRoles.includes(role),
  };
};
