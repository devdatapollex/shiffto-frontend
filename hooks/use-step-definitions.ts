import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getStepDefinitions, updateStepDefinition } from '@/services/step-definition.service';

export function useStepDefinitions() {
  return useQuery({
    queryKey: ['step-definitions'],
    queryFn: () => getStepDefinitions(),
  });
}

export function useUpdateStepDefinition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { label?: string; description?: string | null };
    }) => updateStepDefinition(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['step-definitions'] });
    },
  });
}
