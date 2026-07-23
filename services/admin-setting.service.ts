import apiClient from '@/lib/api-client';

export interface AdminSettingsMap {
  [key: string]: string;
  WITHDRAWAL_COMMISSION_RATE: string;
}

export interface AdminSettingsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: AdminSettingsMap;
}

export interface UpdateCommissionResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    id?: string;
    key: string;
    value: string;
    description?: string;
  };
}

const getAdminSettings = async (): Promise<AdminSettingsMap> => {
  const { data } = await apiClient.get<AdminSettingsResponse>('/admin/settings');
  return data.data;
};

const updateCommissionRate = async (rate: number): Promise<UpdateCommissionResponse['data']> => {
  const { data } = await apiClient.patch<UpdateCommissionResponse>(
    '/admin/settings/commission-rate',
    {
      commissionRate: rate,
    }
  );
  return data.data;
};

export const adminSettingService = {
  getAdminSettings,
  updateCommissionRate,
};
