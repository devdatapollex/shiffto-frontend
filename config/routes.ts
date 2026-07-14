/**
 * Centralized Route Configuration for SHIFFTO User Panel.
 */
export const ROUTES = {
  // Public Routes
  HOME: '/',
  LOGIN: '/login',
  ADMIN_LOGIN: '/admin/login',
  REGISTER: '/register',
  UNAUTHORIZED: '/unauthorized',
  VERIFY_EMAIL: '/verify',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',

  // Protected Routes (user-facing)
  DASHBOARD: '/dashboard',
  CREATE_SHIPMENT: '/dashboard/shipments/create',
  MY_SHIPMENTS: '/dashboard/my-shipments',
  BROWSE_SHIPMENT: '/dashboard/browse-shipment',
  TRACKING: '/dashboard/tracking',
  CREATE_TRIP: '/dashboard/trips/create',
  MY_TRIPS: '/dashboard/my-trips',
  PAYMENT_EARNINGS: '/dashboard/payment-earnings',
  WALLET: '/dashboard/wallet',
  RATINGS_REVIEWS: '/dashboard/ratings-reviews',
  SUPPORT: '/dashboard/support',
  PROFILE: '/dashboard/profile',

  // Admin-only Routes
  SETTLEMENTS: '/dashboard/settlements',
  WITHDRAWALS: '/dashboard/withdrawals',
  USERS: '/dashboard/users',
  ADMIN_KYC: '/dashboard/admin/kyc',
  ADMIN_PROFILE: '/dashboard/admin/profile',
} as const;

export const PUBLIC_ROUTES = [
  ROUTES.HOME,
  ROUTES.LOGIN,
  ROUTES.ADMIN_LOGIN,
  ROUTES.REGISTER,
  ROUTES.VERIFY_EMAIL,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.RESET_PASSWORD,
  ROUTES.UNAUTHORIZED,
];

export const DEFAULT_LOGIN_REDIRECT = ROUTES.DASHBOARD;
