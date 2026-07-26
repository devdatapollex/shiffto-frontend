import apiClient from '@/lib/api-client';
import { DocumentType } from '@/services/profile.service';

export interface UserActivity {
  shipmentsCreated: number;
  tripsAdded: number;
  deliveriesCompleted: number;
}

export interface AdminUserListItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  image: string | null;
  createdAt: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED' | 'PENDING_KYC';
  trustScore: number;
  commissionRate: number;
  kycStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NOT_SUBMITTED';
  activity: UserActivity;
}

export interface PaginatedAdminUsers {
  data: AdminUserListItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface UserTimelineItem {
  id: string;
  type: string;
  title: string;
  description: string;
  date: string;
}

export interface UserTransaction {
  id: string;
  transactionId: string;
  shipmentId: string;
  offerId: string;
  senderId: string;
  travellerId: string;
  grossAmount: number;
  currency: string;
  status: string;
  createdAt: string;
  shipment: {
    itemName: string;
  };
}

export interface UserDetailData {
  profile: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    image: string | null;
    createdAt: string;
    status: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED' | 'PENDING_KYC';
    trustScore: number;
    commissionRate: number;
    isDeactivated: boolean;
    banned: boolean;
    role: string | null;
    kycStatus: string;
    activity: UserActivity;
  };
  kyc: {
    id: string;
    userId: string;
    documentType: DocumentType;
    documentNumber: string;
    nationality: string;
    phoneNumber: string;
    frontPhotoUrl: string;
    backPhotoUrl: string;
    status: string;
    rejectionReason: string | null;
    createdAt: string;
  } | null;
  reviews: {
    received: any[];
    given: any[];
  };
  transactions: UserTransaction[];
  tickets: any[];
  timeline: UserTimelineItem[];
}

const getAllUsers = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}): Promise<PaginatedAdminUsers> => {
  const { data } = await apiClient.get<PaginatedAdminUsers>('/admin-users', {
    params,
  });
  return data;
};

const getUserDetail = async (id: string): Promise<UserDetailData> => {
  const { data } = await apiClient.get<{ data: UserDetailData }>(`/admin-users/${id}`);
  return data.data;
};

const updateUser = async (
  id: string,
  updateData: {
    name?: string;
    email?: string;
    phone?: string;
    commissionRate?: number;
    status?: string;
  }
): Promise<any> => {
  const { data } = await apiClient.patch<{ data: any }>(`/admin-users/${id}`, updateData);
  return data.data;
};

const bulkAction = async (
  userIds: string[],
  action: 'SUSPEND' | 'DEACTIVATE' | 'DELETE'
): Promise<any> => {
  const { data } = await apiClient.post<{ data: any }>('/admin-users/bulk', {
    userIds,
    action,
  });
  return data.data;
};

export const userService = {
  getAllUsers,
  getUserDetail,
  updateUser,
  bulkAction,
};
