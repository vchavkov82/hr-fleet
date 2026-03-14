import { useQuery } from "@tanstack/react-query";
import client from "@/api/client";

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor_email: string;
  actor_id: string;
  action: "create" | "update" | "delete";
  entity_type: string;
  entity_id: string;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
}

interface AuditLogParams {
  page?: number;
  perPage?: number;
  actor?: string;
  action?: string;
  entityType?: string;
  dateFrom?: string;
  dateTo?: string;
}

export function useAuditLogs(params: AuditLogParams = {}) {
  const { page = 1, perPage = 50, actor, action, entityType, dateFrom, dateTo } = params;
  return useQuery({
    queryKey: ["audit-logs", { page, perPage, actor, action, entityType, dateFrom, dateTo }],
    queryFn: async () => {
      const { data, error } = await client.GET("/audit-logs", {
        params: {
          query: {
            page,
            per_page: perPage,
            actor: actor || undefined,
            action: action || undefined,
            entity_type: entityType || undefined,
            date_from: dateFrom || undefined,
            date_to: dateTo || undefined,
          },
        },
      });
      if (error) throw new Error("Failed to fetch audit logs");
      return data as { entries: AuditLogEntry[]; total: number };
    },
    placeholderData: (prev) => prev,
  });
}
