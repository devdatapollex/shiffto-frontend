import apiClient from '@/lib/api-client';

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface NotificationsResponse {
  success: boolean;
  message: string;
  data: Notification[];
}

export async function getMyNotifications(): Promise<Notification[]> {
  const { data } = await apiClient.get<NotificationsResponse>('/notifications');
  return data.data;
}

export async function markAsRead(id: string): Promise<Notification> {
  const { data } = await apiClient.patch<{ data: Notification }>(`/notifications/${id}/read`);
  return data.data;
}

export async function markAllAsRead(): Promise<{ count: number }> {
  const { data } = await apiClient.patch<{ data: { count: number } }>('/notifications/read-all');
  return data.data;
}
