import { useQuery } from "@tanstack/react-query";
import client from "@/api/client";

interface DepartmentsParams {
  page?: number;
  perPage?: number;
}

export function useDepartments(params: DepartmentsParams = {}) {
  const { page = 1, perPage = 100 } = params;
  return useQuery({
    queryKey: ["departments", { page, perPage }],
    queryFn: async () => {
      const { data, error } = await client.GET("/departments", {
        params: {
          query: {
            page,
            per_page: perPage,
          },
        },
      });
      if (error) throw new Error("Failed to fetch departments");
      return data;
    },
  });
}

export function useDepartment(id: number) {
  return useQuery({
    queryKey: ["department", id],
    queryFn: async () => {
      const { data, error } = await client.GET("/departments/{id}", {
        params: { path: { id } },
      });
      if (error) throw new Error("Failed to fetch department");
      return data;
    },
    enabled: !!id,
  });
}
