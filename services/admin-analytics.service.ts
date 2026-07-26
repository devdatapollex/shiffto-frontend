import apiClient from '@/lib/api-client';
import { DocumentType } from '@/services/profile.service';

export interface AdminStats {
  totalUsers: number;
  approvedKycUsers: number;
  totalShipments: number;
  activeShipments: number;
  deliveredShipments: number;
  totalTrips: number;
  activeTrips: number;
  completedTrips: number;
  pendingKycCount: number;
  pendingReleasesCount: number;
  pendingTripsCount: number;
  openTicketsCount: number;
  pendingWithdrawalsCount: number;
  totalVolume: number;
  totalCommission: number;
}

export interface AdminChartData {
  month: string;
  shipments: number;
  trips: number;
  volume: number;
}

export interface AdminRecentKyc {
  id: string;
  documentType: DocumentType;
  documentNumber: string;
  nationality: string;
  phoneNumber: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    phone: string | null;
  };
}

export interface AdminRecentTicket {
  id: string;
  ticketId: string;
  category: string;
  title: string;
  status: string;
  priority: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

export interface AdminRecentPayment {
  id: string;
  transactionId: string;
  grossAmount: number;
  currency: string;
  status: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    email: string;
  };
  traveller: {
    id: string;
    name: string;
    email: string;
  };
}

export interface AdminAnalyticsData {
  stats: AdminStats;
  chartData: AdminChartData[];
  recentKyc: AdminRecentKyc[];
  recentTickets: AdminRecentTicket[];
  recentPayments: AdminRecentPayment[];
}

export async function getAdminAnalytics(): Promise<AdminAnalyticsData> {
  const { data } = await apiClient.get<{ success: boolean; data: AdminAnalyticsData }>(
    '/admin/analytics'
  );
  return data.data;
}

export interface AdminSidebarCounts {
  pendingKycCount: number;
  openTicketsCount: number;
  pendingWithdrawalsCount: number;
}

export async function getAdminSidebarCounts(): Promise<AdminSidebarCounts> {
  const { data } = await apiClient.get<{ success: boolean; data: AdminSidebarCounts }>(
    '/admin/sidebar-counts'
  );
  return data.data;
}
