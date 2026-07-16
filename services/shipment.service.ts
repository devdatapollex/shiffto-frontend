import apiClient from '@/lib/api-client';
import type { CreateShipmentPayload } from '@/lib/validations/shipment';

export type ShipmentStatus = 'AWAITING_MATCH' | 'ACTIVE' | 'DELIVERED' | 'CANCELED';

export interface ShipmentCategory {
  id: string;
  name: string;
  slug: string;
  maxWeight: number | null;
  minPrice: number;
  maxPrice: number | null;
  maxQuantity: number | null;
}

export interface ShipmentStepDefinition {
  id: string;
  stage: string;
  label: string;
  order: number;
  description: string | null;
}

export interface ShipmentStep {
  id: string;
  shipmentId: string;
  stage: string;
  order: number;
  isCurrent: boolean;
  completedAt: string | null;
  notes: string | null;
  definition: ShipmentStepDefinition;
}

export interface ShipmentTripDetails {
  id: string;
  flightNumber: string;
  fromCountry: string;
  toCountry: string;
  flightDate: string;
  flightTime: string;
  airportArrivalTime: string | null;
  status: string;
  totalCapacity?: number;
  remainingCapacity?: number;
  user?: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    phone?: string | null;
  };
}

export interface ShipmentDetails extends Omit<Shipment, 'tripId'> {
  trip: ShipmentTripDetails | null;
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
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  tripId: string | null;
  bagType: string | null;
  createdAt?: string;
  updatedAt?: string;
  status: ShipmentStatus;
  userId: string;
  categoryId: string;
  category?: ShipmentCategory;
  shipmentSteps?: ShipmentStep[];
}

interface ShipmentsResponse {
  success: boolean;
  message: string;
  meta: {
    page: number;
    limit: number;
    total: number;
  };
  data: Shipment[];
}

export async function createShipment(payload: CreateShipmentPayload): Promise<{ id: string }> {
  const { data } = await apiClient.post<{ id: string }>('/shipments', payload);
  return data;
}

export async function getAvailableShipments(params?: {
  page?: number;
  limit?: number;
  fromCountry?: string;
  toCountry?: string;
}): Promise<ShipmentsResponse> {
  const { data } = await apiClient.get<ShipmentsResponse>('/trips/available-shipments', {
    params,
  });
  return data;
}

export async function sendShipmentOtp(): Promise<void> {
  await apiClient.post('/shipments/send-otp');
}

export async function getShipments(params?: {
  page?: number;
  limit?: number;
  search?: string;
  userId?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<ShipmentsResponse> {
  const { data } = await apiClient.get<ShipmentsResponse>('/shipments', { params });
  return data;
}

export async function getShipmentSteps(shipmentId: string): Promise<ShipmentStep[]> {
  const { data } = await apiClient.get<{ data: ShipmentStep[] }>(`/shipments/${shipmentId}/steps`);
  return data.data;
}

export async function getShipmentDetails(shipmentId: string): Promise<ShipmentDetails> {
  const { data } = await apiClient.get<{ data: ShipmentDetails }>(
    `/shipments/${shipmentId}/details`
  );
  return data.data;
}
