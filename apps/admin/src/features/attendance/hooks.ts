import { useQuery } from "@tanstack/react-query";
import client from "@/api/client";

interface AttendanceParams {
  page?: number;
  perPage?: number;
  employeeId?: number;
  dateFrom?: string;
  dateTo?: string;
}

export function useAttendance(params: AttendanceParams = {}) {
  const { page = 1, perPage = 50, employeeId, dateFrom, dateTo } = params;
  return useQuery({
    queryKey: ["attendance", { page, perPage, employeeId, dateFrom, dateTo }],
    queryFn: async () => {
      const { data, error } = await client.GET("/attendance", {
        params: {
          query: {
            page,
            per_page: perPage,
            ...(employeeId ? { employee_id: employeeId } : {}),
            ...(dateFrom ? { date_from: dateFrom } : {}),
            ...(dateTo ? { date_to: dateTo } : {}),
          },
        },
      });
      if (error) throw new Error("Failed to fetch attendance");
      return data;
    },
  });
}
