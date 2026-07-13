import apiClient from '@/lib/api-client';
import type { CreateTripPayload } from '@/lib/validations/trip';

export async function createTrip(payload: CreateTripPayload): Promise<{ id: string }> {
  const { data } = await apiClient.post<{ id: string }>('/trips', payload);
  return data;
}
