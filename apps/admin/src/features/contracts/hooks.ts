import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "@/api/client";

interface ContractsParams {
  page?: number;
  perPage?: number;
  employeeId?: number;
}

export function useContracts(params: ContractsParams = {}) {
  const { page = 1, perPage = 20, employeeId } = params;
  return useQuery({
    queryKey: ["contracts", { page, perPage, employeeId }],
    queryFn: async () => {
      const { data, error } = await client.GET("/contracts", {
        params: {
          query: {
            page,
            per_page: perPage,
            ...(employeeId ? { employee_id: employeeId } : {}),
          },
        },
      });
      if (error) throw new Error("Failed to fetch contracts");
      return data;
    },
  });
}

export function useContract(id: number) {
  return useQuery({
    queryKey: ["contracts", id],
    queryFn: async () => {
      const { data, error } = await client.GET("/contracts/{id}", {
        params: { path: { id } },
      });
      if (error) throw new Error("Failed to fetch contract");
      return data;
    },
    enabled: id > 0,
  });
}

export function useCreateContract() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      employee_id: number;
      name: string;
      date_start: string;
      date_end?: string;
      wage: number;
      department_id?: number;
      structure_type_id?: number;
    }) => {
      const { data, error } = await client.POST("/contracts", {
        body,
      });
      if (error) throw new Error("Failed to create contract");
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contracts"] }),
  });
}

export function useUpdateContract() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id: _id,
      ...body
    }: {
      id: number;
      employee_id?: number;
      name?: string;
      date_start?: string;
      date_end?: string;
      wage?: number;
      department_id?: number;
      structure_type_id?: number;
    }) => {
      // API doesn't have PUT /contracts/{id} yet — stub for future
      void _id;
      void body;
      throw new Error("Update not yet supported by API");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contracts"] }),
  });
}

export function useDeleteContract() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (_id: number) => {
      // API doesn't have DELETE /contracts/{id} yet — stub for future
      throw new Error("Delete not yet supported by API");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contracts"] }),
  });
}
