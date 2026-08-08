import apiClient from '@/lib/api-client';

export interface RestrictedItem {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetRestrictedItemsParams {
  page?: number;
  limit?: number;
  search?: string;
  activeOnly?: boolean;
}

export interface RestrictedItemsApiResponse {
  success: boolean;
  message: string;
  data: RestrictedItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface SingleRestrictedItemApiResponse {
  success: boolean;
  message: string;
  data: RestrictedItem;
}

export async function getRestrictedItems(
  params?: GetRestrictedItemsParams
): Promise<RestrictedItemsApiResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.activeOnly) queryParams.append('activeOnly', 'true');

  const queryString = queryParams.toString();
  const url = `/restricted-items${queryString ? `?${queryString}` : ''}`;
  const response = await apiClient.get<RestrictedItemsApiResponse>(url);
  return response.data;
}

export async function createRestrictedItem(payload: {
  name: string;
  description?: string | null;
  isActive?: boolean;
}): Promise<RestrictedItem> {
  const response = await apiClient.post<SingleRestrictedItemApiResponse>(
    '/restricted-items',
    payload
  );
  return response.data.data;
}

export async function updateRestrictedItem(
  id: string,
  payload: { name?: string; description?: string | null; isActive?: boolean }
): Promise<RestrictedItem> {
  const response = await apiClient.patch<SingleRestrictedItemApiResponse>(
    `/restricted-items/${id}`,
    payload
  );
  return response.data.data;
}

export async function deleteRestrictedItem(id: string): Promise<void> {
  await apiClient.delete(`/restricted-items/${id}`);
}
