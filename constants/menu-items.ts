import {
  Home,
  Truck,
  Package,
  MapPin,
  Plane,
  CreditCard,
  Wallet,
  Star,
  HelpCircle,
  Scale,
  Banknote,
  Users,
  ShieldCheck,
  Bell,
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

export interface MenuSection {
  label?: string;
  items: MenuItem[];
}

export const DASHBOARD_MENU_SECTIONS: MenuSection[] = [
  {
    items: [
      {
        label: 'Home',
        href: ROUTES.DASHBOARD,
        icon: Home,
        roles: ['user', 'admin'],
      },
      {
        label: 'Notifications',
        href: ROUTES.NOTIFICATIONS,
        icon: Bell,
        roles: ['user', 'admin'],
      },
    ],
  },
  {
    items: [
      {
        label: 'My Shipments',
        href: ROUTES.MY_SHIPMENTS,
        icon: Truck,
        roles: ['user', 'admin'],
      },
      {
        label: 'Browse Shipment',
        href: ROUTES.BROWSE_SHIPMENT,
        icon: Package,
        roles: ['user', 'admin'],
      },
      {
        label: 'Tracking',
        href: ROUTES.TRACKING,
        icon: MapPin,
        roles: ['user', 'admin'],
      },
      {
        label: 'My Trips',
        href: ROUTES.MY_TRIPS,
        icon: Plane,
        roles: ['user', 'admin'],
      },
    ],
  },
  {
    items: [
      {
        label: 'Payments & Earnings',
        href: ROUTES.PAYMENT_EARNINGS,
        icon: CreditCard,
        roles: ['user', 'admin'],
      },
      {
        label: 'Wallet',
        href: ROUTES.WALLET,
        icon: Wallet,
        roles: ['user', 'admin'],
      },
      {
        label: 'Ratings & Reviews',
        href: ROUTES.RATINGS_REVIEWS,
        icon: Star,
        roles: ['user', 'admin'],
      },
    ],
  },
  {
    items: [
      {
        label: 'Support',
        href: ROUTES.SUPPORT,
        icon: HelpCircle,
        roles: ['user', 'admin'],
      },
    ],
  },
  {
    label: 'Admin',
    items: [
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
      {
        label: 'KYC Verifications',
        href: ROUTES.ADMIN_KYC,
        icon: ShieldCheck,
        roles: ['admin'],
      },
      {
        label: 'Trips',
        href: ROUTES.ADMIN_TRIPS,
        icon: Plane,
        roles: ['admin'],
      },
    ],
  },
];

export const DASHBOARD_MENU_ITEMS: MenuItem[] = DASHBOARD_MENU_SECTIONS.flatMap(
  (section) => section.items
);
