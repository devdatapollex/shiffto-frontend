/**
 * Centralized Route Configuration for SHIFFTO User Panel.
 */
export const ROUTES = {
  // Public Routes
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  UNAUTHORIZED: '/unauthorized',

  // Protected Routes (user-facing)
  DASHBOARD: '/dashboard',
  SHIPMENTS: '/dashboard/shipments',
  TRIPS: '/dashboard/trips',
  FINANCES: '/dashboard/finances',
  ACCOUNT: '/dashboard/account',

  // Admin-only Routes
  SETTLEMENTS: '/dashboard/settlements',
  WITHDRAWALS: '/dashboard/withdrawals',
  USERS: '/dashboard/users',
} as const;

export const PUBLIC_ROUTES = [ROUTES.HOME, ROUTES.LOGIN, ROUTES.REGISTER, ROUTES.UNAUTHORIZED];

export const DEFAULT_LOGIN_REDIRECT = ROUTES.DASHBOARD;
