import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "@/api/client";

interface TimesheetsParams {
  page?: number;
  perPage?: number;
  employeeId?: number;
  projectId?: number;
  dateFrom?: string;
  dateTo?: string;
}

export function useTimesheets(params: TimesheetsParams = {}) {
  const { page = 1, perPage = 50, employeeId, projectId, dateFrom, dateTo } = params;
  return useQuery({
    queryKey: ["timesheets", { page, perPage, employeeId, projectId, dateFrom, dateTo }],
    queryFn: async () => {
      const { data, error } = await client.GET("/timesheets", {
        params: {
          query: {
            page,
            per_page: perPage,
            ...(employeeId ? { employee_id: employeeId } : {}),
            ...(projectId ? { project_id: projectId } : {}),
            ...(dateFrom ? { date_from: dateFrom } : {}),
            ...(dateTo ? { date_to: dateTo } : {}),
          },
        },
      });
      if (error) throw new Error("Failed to fetch timesheets");
      return data;
    },
  });
}

export function useCreateTimesheet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      employee_id: number;
      project_id: number;
      task_id?: number;
      date: string;
      unit_amount: number;
      name?: string;
    }) => {
      const { data, error } = await client.POST("/timesheets", {
        body: body as unknown as Record<string, never>,
      });
      if (error) throw new Error("Failed to create timesheet entry");
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["timesheets"] }),
  });
}

export function useUpdateTimesheet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id: number; body: Record<string, unknown> }) => {
      const { data, error } = await client.PUT("/timesheets/{id}", {
        params: { path: { id } },
        body: body as unknown as Record<string, never>,
      });
      if (error) throw new Error("Failed to update timesheet entry");
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["timesheets"] }),
  });
}
