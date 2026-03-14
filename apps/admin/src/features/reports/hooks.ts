import { useQuery } from "@tanstack/react-query";
import client from "@/api/client";

export interface DateRange {
  from: string; // YYYY-MM-DD
  to: string;
}

export interface PayrollMonth {
  month: string;
  gross: number;
  net: number;
  employer_cost: number;
}

export interface TaxBreakdown {
  category: string;
  amount: number;
}

export function usePayrollReport(dateRange: DateRange) {
  return useQuery({
    queryKey: ["reports", "payroll", dateRange.from, dateRange.to],
    queryFn: async () => {
      const { data, error } = await client.GET("/reports/payroll-summary", {
        params: { query: { from: dateRange.from, to: dateRange.to } },
      });
      if (error) throw new Error("Failed to fetch payroll report");
      return (data as { months: PayrollMonth[] })?.months ?? [];
    },
    enabled: !!dateRange.from && !!dateRange.to,
  });
}

export function useTaxReport(dateRange: DateRange) {
  return useQuery({
    queryKey: ["reports", "tax", dateRange.from, dateRange.to],
    queryFn: async () => {
      const { data, error } = await client.GET("/reports/tax-liabilities", {
        params: { query: { from: dateRange.from, to: dateRange.to } },
      });
      if (error) throw new Error("Failed to fetch tax report");
      return (data as { breakdown: TaxBreakdown[] })?.breakdown ?? [];
    },
    enabled: !!dateRange.from && !!dateRange.to,
  });
}

export function useExportReport(type: "payroll" | "tax", dateRange: DateRange) {
  const endpoint =
    type === "payroll"
      ? "/reports/payroll-summary/export"
      : "/reports/tax-liabilities/export";

  return async () => {
    const baseUrl = import.meta.env.VITE_API_URL ?? "/api/v1";
    const params = new URLSearchParams({
      from: dateRange.from,
      to: dateRange.to,
      format: "csv",
    });
    const url = `${baseUrl}${endpoint}?${params}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token") ?? ""}`,
      },
    });

    if (!response.ok) throw new Error("Export failed");

    const blob = await response.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${type}-report-${dateRange.from}-${dateRange.to}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
}
