import apiClient from '@/lib/api-client';

export interface ReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  shipmentId: string;
  reviewerId: string;
  revieweeId: string;
  createdAt: string;
  reviewer?: {
    id: string;
    name: string;
    image: string | null;
  };
  reviewee?: {
    id: string;
    name: string;
    image: string | null;
  };
  shipment?: {
    id: string;
    itemName: string;
  };
}

export interface ReviewStats {
  averageRating: number;
  receivedCount: number;
  givenCount: number;
}

export interface PaginatedReviews {
  data: ReviewItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateReviewPayload {
  shipmentId: string;
  rating: number;
  comment?: string;
}

export interface PendingReviewItem {
  id: string;
  itemName: string;
  fromCountry?: string;
  toCountry?: string;
  deliveredAt: string;
  isSender: boolean;
  counterparty: {
    id: string;
    name: string;
    image: string | null;
    role: 'Traveler' | 'Sender';
  };
}

export interface PaginatedPendingReviews {
  data: PendingReviewItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ReviewFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  rating?: number;
}

export async function createReview(payload: CreateReviewPayload): Promise<ReviewItem> {
  const res = await apiClient.post<{ data: ReviewItem }>('/reviews', payload);
  return res.data.data;
}

export async function getShipmentReviews(shipmentId: string): Promise<ReviewItem[]> {
  const res = await apiClient.get<{ data: ReviewItem[] }>(`/reviews/shipment/${shipmentId}`);
  return res.data.data;
}

export async function getUserReviewStats(userId: string): Promise<ReviewStats> {
  const res = await apiClient.get<{ data: ReviewStats }>(`/reviews/user/${userId}/stats`);
  return res.data.data;
}

export async function getPendingReviewsCount(): Promise<number> {
  const res = await apiClient.get<{ data: { count: number } }>('/reviews/pending/count');
  return res.data.data.count;
}

export async function getPendingReviews(
  params?: ReviewFilterParams
): Promise<PaginatedPendingReviews> {
  const res = await apiClient.get<PaginatedPendingReviews>('/reviews/pending', {
    params,
  });
  return res.data;
}

export async function getUserReceivedReviews(
  userId: string,
  params?: ReviewFilterParams
): Promise<PaginatedReviews> {
  const res = await apiClient.get<PaginatedReviews>(`/reviews/user/${userId}/received`, {
    params,
  });
  return res.data;
}

export async function getUserGivenReviews(
  userId: string,
  params?: ReviewFilterParams
): Promise<PaginatedReviews> {
  const res = await apiClient.get<PaginatedReviews>(`/reviews/user/${userId}/given`, {
    params,
  });
  return res.data;
}
