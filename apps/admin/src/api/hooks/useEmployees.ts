import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '../provider';
import type { EmployeeListParams } from '@hr/api-client/types';

export function useEmployees(params?: EmployeeListParams) {
  const api = useApiClient();
  return useQuery({
    queryKey: ['employees', params],
    queryFn: () => api.getEmployees(params),
  });
}

export function useEmployee(id: string) {
  const api = useApiClient();
  return useQuery({
    queryKey: ['employees', id],
    queryFn: () => api.getEmployee(id),
    enabled: !!id,
  });
}

export function useCreateEmployee() {
  const api = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof api.createEmployee>[0]) => api.createEmployee(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
  });
}

export function useUpdateEmployee() {
  const api = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof api.updateEmployee>[1] }) =>
      api.updateEmployee(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
  });
}

export function useDeleteEmployee() {
  const api = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteEmployee(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
  });
}
