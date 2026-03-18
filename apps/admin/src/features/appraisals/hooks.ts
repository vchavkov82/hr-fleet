import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "@/api/client";

interface AppraisalsParams {
  page?: number;
  perPage?: number;
  employeeId?: number;
  state?: string;
}

export function useAppraisals(params: AppraisalsParams = {}) {
  const { page = 1, perPage = 50, employeeId, state } = params;
  return useQuery({
    queryKey: ["appraisals", { page, perPage, employeeId, state }],
    queryFn: async () => {
      const { data, error } = await client.GET("/appraisals", {
        params: {
          query: {
            page,
            per_page: perPage,
            ...(employeeId ? { employee_id: employeeId } : {}),
            ...(state ? { state } : {}),
          },
        },
      });
      if (error) throw new Error("Failed to fetch appraisals");
      return data;
    },
  });
}

export function useAppraisalTemplates() {
  return useQuery({
    queryKey: ["appraisal-templates"],
    queryFn: async () => {
      const { data, error } = await client.GET("/appraisals/templates", {
        params: { query: { per_page: 100 } },
      });
      if (error) throw new Error("Failed to fetch appraisal templates");
      return data;
    },
  });
}

export function useCreateAppraisal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      employee_id: number;
      date_close: string;
      appraisal_template_id?: number;
    }) => {
      const { data, error } = await client.POST("/appraisals", {
        body: body as unknown as Record<string, never>,
      });
      if (error) throw new Error("Failed to create appraisal");
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["appraisals"] }),
  });
}

export function useConfirmAppraisal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data, error } = await client.POST("/appraisals/{id}/confirm", {
        params: { path: { id } },
      });
      if (error) throw new Error("Failed to confirm appraisal");
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["appraisals"] }),
  });
}

export function useCompleteAppraisal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data, error } = await client.POST("/appraisals/{id}/complete", {
        params: { path: { id } },
      });
      if (error) throw new Error("Failed to complete appraisal");
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["appraisals"] }),
  });
}
