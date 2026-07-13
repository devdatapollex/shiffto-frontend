import apiClient from '@/lib/api-client';
import type { CreateShipmentPayload } from '@/lib/validations/shipment';

export async function createShipment(payload: CreateShipmentPayload): Promise<{ id: string }> {
  const { data } = await apiClient.post<{ id: string }>('/shipments', payload);
  return data;
}

export async function sendShipmentOtp(): Promise<void> {
  await apiClient.post('/shipments/send-otp');
}
