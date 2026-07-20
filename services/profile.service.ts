import apiClient from '@/lib/api-client';

export interface KycDetails {
  id: string;
  userId: string;
  documentType: 'PASSPORT' | 'DRIVING_LICENSE' | 'NID';
  documentNumber: string;
  nationality: string;
  phoneNumber: string;
  frontPhotoUrl: string;
  frontPhotoKey: string;
  backPhotoUrl: string;
  backPhotoKey: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  phone: string | null;
  isDeactivated: boolean;
  role: 'user' | 'admin';
  kyc?: KycDetails | null;
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  data: UserProfile;
}

export interface KycResponse {
  success: boolean;
  message: string;
  data: KycDetails;
}

export interface KycSubmissionsResponse {
  success: boolean;
  message: string;
  meta: {
    page: number;
    limit: number;
    total: number;
  };
  data: (KycDetails & {
    user: { id: string; name: string; email: string; image: string | null; phone: string | null };
  })[];
}

export async function getProfile(): Promise<UserProfile> {
  const { data } = await apiClient.get<ProfileResponse>('/profile');
  return data.data;
}

export async function updateProfile(payload: {
  name?: string;
  phone?: string | null;
  image?: string | null;
}): Promise<UserProfile> {
  const { data } = await apiClient.patch<ProfileResponse>('/profile', payload);
  return data.data;
}

export async function changePassword(payload: Record<string, string>): Promise<void> {
  await apiClient.post('/profile/change-password', payload);
}

export async function submitKyc(payload: {
  documentType: 'PASSPORT' | 'DRIVING_LICENSE' | 'NID';
  documentNumber: string;
  nationality: string;
  phoneNumber: string;
  frontPhotoUrl: string;
  frontPhotoKey: string;
  backPhotoUrl: string;
  backPhotoKey: string;
}): Promise<KycDetails> {
  const { data } = await apiClient.post<KycResponse>('/profile/kyc', payload);
  return data.data;
}

export async function deactivateAccount(): Promise<UserProfile> {
  const { data } = await apiClient.post<ProfileResponse>('/profile/deactivate');
  return data.data;
}

export async function deleteAccount(payload: Record<string, string>): Promise<void> {
  await apiClient.post('/profile/delete', payload);
}

export interface UserAnalyticsData {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    trustScore: number;
    kycStatus: string;
  };
  stats: {
    shipmentsCreated: number;
    activeShipments: number;
    deliveredShipments: number;
    tripsAdded: number;
    activeTrips: number;
    completedTrips: number;
    totalEarnings: number;
    pendingEarnings: number;
    totalSpending: number;
    availableBalance: number;
    openTicketsCount: number;
    unreadNotificationsCount: number;
  };
  recentShipments: {
    id: string;
    itemName: string;
    status: string;
    fromCountry: string;
    toCountry: string;
    totalCost: number;
    createdAt: string;
  }[];
  recentTrips: {
    id: string;
    flightNumber: string;
    status: string;
    fromCountry: string;
    toCountry: string;
    flightDate: string;
    createdAt: string;
  }[];
}

export async function getUserAnalytics(): Promise<UserAnalyticsData> {
  const { data } = await apiClient.get<{ success: boolean; data: UserAnalyticsData }>('/profile/analytics');
  return data.data;
}

// Admin Services
export async function getKycSubmissions(params?: {
  page?: number;
  limit?: number;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}): Promise<KycSubmissionsResponse> {
  const { data } = await apiClient.get<KycSubmissionsResponse>('/admin/kyc', { params });
  return data;
}

export async function reviewKyc(
  kycId: string,
  payload: { status: 'APPROVED' | 'REJECTED'; rejectionReason?: string | null }
): Promise<KycDetails> {
  const { data } = await apiClient.patch<KycResponse>(`/admin/kyc/${kycId}`, payload);
  return data.data;
}

export async function reactivateUser(userId: string): Promise<void> {
  await apiClient.patch(`/admin/users/${userId}/reactivate`);
}
