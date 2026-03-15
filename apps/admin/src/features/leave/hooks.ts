import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "@/api/client";

interface LeaveRequestsParams {
  page?: number;
  perPage?: number;
  employeeId?: number;
  status?: string;
}

export function useLeaveRequests(params: LeaveRequestsParams = {}) {
  const { page = 1, perPage = 20, employeeId, status } = params;
  return useQuery({
    queryKey: ["leave-requests", { page, perPage, employeeId, status }],
    queryFn: async () => {
      const { data, error } = await client.GET("/leave/requests", {
        params: {
          query: {
            page,
            per_page: perPage,
            ...(employeeId ? { employee_id: employeeId } : {}),
            ...(status ? { status } : {}),
          },
        },
      });
      if (error) throw new Error("Failed to fetch leave requests");
      return data;
    },
  });
}

export function useApproveLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data, error } = await client.POST(
        "/leave/requests/{id}/approve",
        {
          params: { path: { id } },
        },
      );
      if (error) throw new Error("Failed to approve leave request");
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leave-requests"] }),
  });
}

export function useRejectLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason?: string }) => {
      const { data, error } = await client.POST(
        "/leave/requests/{id}/reject",
        {
          params: { path: { id } },
          body: reason ? ({ reason } as unknown as Record<string, never>) : {},
        },
      );
      if (error) throw new Error("Failed to reject leave request");
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leave-requests"] }),
  });
}
