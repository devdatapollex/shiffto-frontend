import apiClient from '@/lib/api-client';
import type { CreateShipmentPayload } from '@/lib/validations/shipment';

export interface ShipmentCategory {
  id: string;
  name: string;
  slug: string;
  maxWeight: number | null;
  minPrice: number;
  maxPrice: number | null;
  maxQuantity: number | null;
}

export interface Shipment {
  id: string;
  itemName: string;
  weight: number;
  quantity: number;
  description: string;
  itemPhotos: string[];
  instructions: string;
  fromCountry: string;
  toCountry: string;
  pricePerKg: number;
  status: string;
  userId: string;
  categoryId: string;
  category?: ShipmentCategory;
}

interface ShipmentsResponse {
  success: boolean;
  data: Shipment[];
  meta: { page: number; limit: number; total: number };
}

export async function createShipment(payload: CreateShipmentPayload): Promise<{ id: string }> {
  const { data } = await apiClient.post<{ id: string }>('/shipments', payload);
  return data;
}

export async function sendShipmentOtp(): Promise<void> {
  await apiClient.post('/shipments/send-otp');
}

export async function getShipments(): Promise<ShipmentsResponse> {
  const { data } = await apiClient.get<ShipmentsResponse>('/shipments');
  return data;
}
