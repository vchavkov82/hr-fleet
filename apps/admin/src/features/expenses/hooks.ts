import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "@/api/client";

interface ExpensesParams {
  page?: number;
  perPage?: number;
  employeeId?: number;
  state?: string;
}

export function useExpenses(params: ExpensesParams = {}) {
  const { page = 1, perPage = 50, employeeId, state } = params;
  return useQuery({
    queryKey: ["expenses", { page, perPage, employeeId, state }],
    queryFn: async () => {
      const { data, error } = await client.GET("/expenses", {
        params: {
          query: {
            page,
            per_page: perPage,
            ...(employeeId ? { employee_id: employeeId } : {}),
            ...(state ? { state } : {}),
          },
        },
      });
      if (error) throw new Error("Failed to fetch expenses");
      return data;
    },
  });
}

export function useApproveExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data, error } = await client.PATCH("/expenses/{id}", {
        params: { path: { id } },
        body: { state: "approved" } as unknown as Record<string, never>,
      });
      if (error) throw new Error("Failed to approve expense");
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["expenses"] }),
  });
}

export function useRejectExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data, error } = await client.PATCH("/expenses/{id}", {
        params: { path: { id } },
        body: { state: "refused" } as unknown as Record<string, never>,
      });
      if (error) throw new Error("Failed to reject expense");
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["expenses"] }),
  });
}
