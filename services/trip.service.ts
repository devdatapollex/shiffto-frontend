import apiClient from '@/lib/api-client';
import type { CreateTripPayload } from '@/lib/validations/trip';
import type { Shipment } from '@/services/shipment.service';

export interface Trip {
  id: string;
  fromCountry: string;
  toCountry: string;
  flightDate: string;
  flightTime: string;
  airportArrivalTime: string | null;
  flightNumber: string;
  cabinBagCapacity: number;
  checkInBagCapacity: number;
  remainingCabinCapacity: number;
  remainingCheckInCapacity: number;
  ticketPhoto: string;
  status: 'PENDING' | 'ACTIVE' | 'IN_TRANSIT' | 'ARRIVED' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    phone?: string | null;
  };
  shipments?: Shipment[];
}

interface TripsResponse {
  success: boolean;
  message: string;
  meta: {
    page: number;
    limit: number;
    total: number;
  };
  data: Trip[];
}

export async function createTrip(payload: CreateTripPayload): Promise<{ id: string }> {
  const { data } = await apiClient.post<{ id: string }>('/trips', payload);
  return data;
}

export async function getMyTrips(params?: {
  page?: number;
  limit?: number;
  status?: string;
  fromCountry?: string;
  toCountry?: string;
}): Promise<TripsResponse> {
  const { data } = await apiClient.get<TripsResponse>('/trips', {
    params: {
      type: 'my-trips',
      ...params,
    },
  });
  return data;
}

export async function cancelTrip(id: string): Promise<Trip> {
  const { data } = await apiClient.post<{ data: Trip }>(`/trips/${id}/cancel`);
  return data.data;
}

export async function completeTrip(id: string): Promise<Trip> {
  const { data } = await apiClient.post<{ data: Trip }>(`/trips/${id}/complete`);
  return data.data;
}

export async function acceptShipment(
  tripId: string,
  payload: { shipmentId: string; bagType: 'cabin' | 'checkIn' }
): Promise<Shipment> {
  const { data } = await apiClient.post<{ data: Shipment }>(
    `/trips/${tripId}/accept-shipment`,
    payload
  );
  return data.data;
}

export async function getAllTrips(params?: {
  page?: number;
  limit?: number;
  status?: string;
  searchTerm?: string;
}): Promise<TripsResponse> {
  const { data } = await apiClient.get<TripsResponse>('/trips', {
    params,
  });
  return data;
}

export async function verifyTrip(
  id: string,
  payload: { approved: boolean; rejectionReason?: string }
): Promise<Trip> {
  const { data } = await apiClient.post<{ data: Trip }>(`/trips/${id}/verify`, payload);
  return data.data;
}

export async function getTripById(id: string): Promise<Trip> {
  const { data } = await apiClient.get<{ data: Trip }>(`/trips/${id}`);
  return data.data;
}

export async function updateTrip(
  id: string,
  payload: Partial<{
    status: Trip['status'];
    flightNumber: string;
    fromCountry: string;
    toCountry: string;
    flightDate: string;
    flightTime: string;
    airportArrivalTime: string;
    cabinBagCapacity: number;
    checkInBagCapacity: number;
    ticketPhoto: string;
  }>
): Promise<Trip> {
  const { data } = await apiClient.patch<{ data: Trip }>(`/trips/${id}`, payload);
  return data.data;
}
