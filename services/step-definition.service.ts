import apiClient from '@/lib/api-client';

export interface StepDefinition {
  id: string;
  stage: string;
  label: string;
  order: number;
  description: string | null;
}

interface StepDefinitionsResponse {
  success: boolean;
  message: string;
  data: StepDefinition[];
}

export async function getStepDefinitions(): Promise<StepDefinition[]> {
  const { data } = await apiClient.get<StepDefinitionsResponse>('/shipments-steps');
  return data.data;
}

export async function updateStepDefinition(
  id: string,
  payload: { label?: string; description?: string | null }
): Promise<StepDefinition> {
  const { data } = await apiClient.patch<{ success: boolean; data: StepDefinition }>(
    `/shipments-steps/${id}`,
    payload
  );
  return data.data;
}
