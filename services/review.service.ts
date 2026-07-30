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

export async function getUserReceivedReviews(
  userId: string,
  params?: { page?: number; limit?: number }
): Promise<PaginatedReviews> {
  const res = await apiClient.get<PaginatedReviews>(`/reviews/user/${userId}/received`, {
    params,
  });
  return res.data;
}

export async function getUserGivenReviews(
  userId: string,
  params?: { page?: number; limit?: number }
): Promise<PaginatedReviews> {
  const res = await apiClient.get<PaginatedReviews>(`/reviews/user/${userId}/given`, {
    params,
  });
  return res.data;
}
