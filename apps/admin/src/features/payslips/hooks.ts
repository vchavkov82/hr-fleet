import { useQuery, useMutation } from "@tanstack/react-query";
import client from "@/api/client";

export interface Payslip {
  id: string;
  employee_id: string;
  employee_name: string;
  month: number;
  year: number;
  gross: number;
  social_security: number;
  health_insurance: number;
  income_tax: number;
  net: number;
  status: "draft" | "final";
  created_at: string;
}

interface PayslipFilters {
  employee_id?: string;
  month?: number;
  year?: number;
}

export function usePayslips(filters: PayslipFilters = {}) {
  return useQuery({
    queryKey: ["payslips", filters],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (filters.employee_id) params.employee_id = filters.employee_id;
      if (filters.month) params.month = String(filters.month);
      if (filters.year) params.year = String(filters.year);

      const { data, error } = await client.GET("/payslips" as never, {
        params: { query: params },
      } as never);
      if (error) throw error;
      return (data as { items: Payslip[] })?.items ?? [];
    },
  });
}

export function usePayslip(id: string | null) {
  return useQuery({
    queryKey: ["payslips", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await client.GET(
        "/payslips/{id}" as never,
        { params: { path: { id } } } as never,
      );
      if (error) throw error;
      return data as Payslip;
    },
  });
}

export function useDownloadPayslip() {
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await client.GET(
        "/payslips/{id}/pdf" as never,
        {
          params: { path: { id } },
          parseAs: "blob",
        } as never,
      );
      if (error) throw error;
      const blob = data as unknown as Blob;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `payslip-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
  });
}
