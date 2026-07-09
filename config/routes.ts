/**
 * Centralized Route Configuration for SHIFFTO User Panel.
 */
export const ROUTES = {
  // Public Routes
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  UNAUTHORIZED: '/unauthorized',
  VERIFY_EMAIL: '/verify',

  // Protected Routes (user-facing)
  DASHBOARD: '/dashboard',
  MY_SHIPMENTS: '/dashboard/my-shipments',
  BROWSE_SHIPMENT: '/dashboard/browse-shipment',
  TRACKING: '/dashboard/tracking',
  MY_TRIPS: '/dashboard/my-trips',
  PAYMENT_EARNINGS: '/dashboard/payment-earnings',
  WALLET: '/dashboard/wallet',
  RATINGS_REVIEWS: '/dashboard/ratings-reviews',
  SUPPORT: '/dashboard/support',

  // Admin-only Routes
  SETTLEMENTS: '/dashboard/settlements',
  WITHDRAWALS: '/dashboard/withdrawals',
  USERS: '/dashboard/users',
} as const;

export const PUBLIC_ROUTES = [
  ROUTES.HOME,
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.VERIFY_EMAIL,
  ROUTES.UNAUTHORIZED,
];

export const DEFAULT_LOGIN_REDIRECT = ROUTES.DASHBOARD;
