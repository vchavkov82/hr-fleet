import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "@/api/client";

export interface PayrollRun {
  id: string;
  organization_id: string;
  month: number;
  year: number;
  status: "draft" | "processing" | "completed" | "failed" | "cancelled";
  total_gross: number;
  total_net: number;
  employee_count: number;
  error_details?: string;
  created_at: string;
  updated_at: string;
}

export function usePayrollRuns() {
  return useQuery({
    queryKey: ["payroll-runs"],
    queryFn: async () => {
      const { data, error } = await client.GET("/payroll-runs" as never);
      if (error) throw error;
      return (data as { items: PayrollRun[] })?.items ?? [];
    },
  });
}

export function usePayrollRun(id: string | null) {
  return useQuery({
    queryKey: ["payroll-runs", id],
    enabled: !!id,
    refetchInterval: (query) => {
      const run = query.state.data as PayrollRun | undefined;
      return run?.status === "processing" ? 3000 : false;
    },
    queryFn: async () => {
      const { data, error } = await client.GET(
        "/payroll-runs/{id}" as never,
        { params: { path: { id } } } as never,
      );
      if (error) throw error;
      return data as PayrollRun;
    },
  });
}

export function useCreatePayrollRun() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { month: number; year: number }) => {
      const { data, error } = await client.POST("/payroll-runs" as never, {
        body: payload,
      } as never);
      if (error) throw error;
      return data as PayrollRun;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payroll-runs"] });
    },
  });
}

export function useConfirmPayrollRun() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await client.POST(
        "/payroll-runs/{id}/confirm" as never,
        { params: { path: { id } } } as never,
      );
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payroll-runs"] });
    },
  });
}

export function useCancelPayrollRun() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await client.POST(
        "/payroll-runs/{id}/cancel" as never,
        { params: { path: { id } } } as never,
      );
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payroll-runs"] });
    },
  });
}
