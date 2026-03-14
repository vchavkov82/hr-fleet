import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "@/api/client";

interface EmployeeListParams {
  page?: number;
  perPage?: number;
  search?: string;
  departmentId?: number;
  active?: boolean;
}

export function useEmployees(params: EmployeeListParams = {}) {
  const { page = 1, perPage = 20, search, departmentId, active } = params;
  return useQuery({
    queryKey: ["employees", { page, perPage, search, departmentId, active }],
    queryFn: async () => {
      const { data, error } = await client.GET("/employees", {
        params: {
          query: {
            page,
            per_page: perPage,
            search: search || undefined,
            department_id: departmentId,
            active,
          },
        },
      });
      if (error) throw new Error("Failed to fetch employees");
      return data;
    },
    placeholderData: (prev) => prev,
  });
}

export function useEmployee(id: number) {
  return useQuery({
    queryKey: ["employees", id],
    queryFn: async () => {
      const { data, error } = await client.GET("/employees/{id}", {
        params: { path: { id } },
      });
      if (error) throw new Error("Failed to fetch employee");
      return data;
    },
    enabled: id > 0,
  });
}

export function useCreateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      name: string;
      work_email: string;
      job_title?: string;
      department_id?: number;
      employee_type?: string;
    }) => {
      const { data, error } = await client.POST("/employees", {
        body,
      });
      if (error) throw new Error("Failed to create employee");
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

export function useUpdateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id: number; body: Record<string, unknown> }) => {
      const { data, error } = await client.PUT("/employees/{id}", {
        params: { path: { id } },
        body,
      });
      if (error) throw new Error("Failed to update employee");
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

export function useDeleteEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data, error } = await client.DELETE("/employees/{id}", {
        params: { path: { id } },
      });
      if (error) throw new Error("Failed to delete employee");
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}
