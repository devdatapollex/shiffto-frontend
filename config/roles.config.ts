import { ROUTES } from './routes';

export type UserRole = 'user' | 'admin';

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: ['*'],
  user: [ROUTES.DASHBOARD, ROUTES.SHIPMENTS, ROUTES.TRIPS, ROUTES.FINANCES, ROUTES.ACCOUNT],
};

export const isAuthorized = (role: UserRole, path: string): boolean => {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  if (permissions.includes('*')) return true;
  return permissions.some((p) => path.startsWith(p));
};
