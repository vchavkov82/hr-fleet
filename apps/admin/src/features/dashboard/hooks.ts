import { useQuery } from "@tanstack/react-query";
import client from "@/api/client";

interface KPIData {
  activeEmployees: number;
  totalEmployees: number;
  pendingLeaves: number;
  expiringContracts: number;
  isLoading: boolean;
}

export function useKPIData(): KPIData {
  const employeesQuery = useQuery({
    queryKey: ["kpi", "employees"],
    queryFn: async () => {
      const { data } = await client.GET("/employees", {
        params: { query: { active: true, per_page: 1 } },
      });
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const allEmployeesQuery = useQuery({
    queryKey: ["kpi", "employees-all"],
    queryFn: async () => {
      const { data } = await client.GET("/employees", {
        params: { query: { per_page: 1 } },
      });
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const leavesQuery = useQuery({
    queryKey: ["kpi", "leaves"],
    queryFn: async () => {
      const { data } = await client.GET("/leave/requests", {
        params: { query: { status: "pending", per_page: 1 } },
      });
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const contractsQuery = useQuery({
    queryKey: ["kpi", "contracts"],
    queryFn: async () => {
      const { data } = await client.GET("/contracts", {
        params: { query: { per_page: 1 } },
      });
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const getMeta = (data: unknown): number => {
    const d = data as { meta?: { total?: number } } | undefined;
    return d?.meta?.total ?? 0;
  };

  return {
    activeEmployees: getMeta(employeesQuery.data),
    totalEmployees: getMeta(allEmployeesQuery.data),
    pendingLeaves: getMeta(leavesQuery.data),
    expiringContracts: getMeta(contractsQuery.data),
    isLoading:
      employeesQuery.isLoading ||
      allEmployeesQuery.isLoading ||
      leavesQuery.isLoading ||
      contractsQuery.isLoading,
  };
}
