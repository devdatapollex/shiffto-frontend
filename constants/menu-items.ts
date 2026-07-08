import {
  LayoutDashboard,
  Package,
  Plane,
  Wallet,
  UserCog,
  Scale,
  Banknote,
  Users,
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { ROUTES } from '@/config/routes';

export interface MenuItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles?: string[];
  permission?: string;
}

export const DASHBOARD_MENU_ITEMS: MenuItem[] = [
  {
    label: 'Dashboard',
    href: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
    roles: ['user', 'admin'],
  },
  {
    label: 'Shipments',
    href: ROUTES.SHIPMENTS,
    icon: Package,
    roles: ['user', 'admin'],
  },
  {
    label: 'Trips',
    href: ROUTES.TRIPS,
    icon: Plane,
    roles: ['user', 'admin'],
  },
  {
    label: 'Finances',
    href: ROUTES.FINANCES,
    icon: Wallet,
    roles: ['user', 'admin'],
  },
  {
    label: 'Account',
    href: ROUTES.ACCOUNT,
    icon: UserCog,
    roles: ['user', 'admin'],
  },
  {
    label: 'Settlements',
    href: ROUTES.SETTLEMENTS,
    icon: Scale,
    roles: ['admin'],
  },
  {
    label: 'Withdrawals',
    href: ROUTES.WITHDRAWALS,
    icon: Banknote,
    roles: ['admin'],
  },
  {
    label: 'Users',
    href: ROUTES.USERS,
    icon: Users,
    roles: ['admin'],
  },
];
