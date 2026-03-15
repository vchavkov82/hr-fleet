import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "@/api/client";

// ── Organization Settings ──────────────────────────────────────────────────

export interface OrgSettings {
  name: string;
  address: string;
  tax_id: string;
  currency: string;
  timezone: string;
}

export function useOrgSettings() {
  return useQuery({
    queryKey: ["settings", "organization"],
    queryFn: async () => {
      const { data, error } = await client.GET("/settings/organization");
      if (error) throw new Error("Failed to fetch organization settings");
      return data as unknown as OrgSettings;
    },
  });
}

export function useUpdateOrgSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: OrgSettings) => {
      const { data, error } = await client.PUT("/settings/organization", { body: body as unknown as Record<string, unknown> });
      if (error) throw new Error("Failed to update organization settings");
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings", "organization"] }),
  });
}

// ── Odoo Status ────────────────────────────────────────────────────────────

export interface OdooStatus {
  connected: boolean;
  last_sync: string | null;
  version: string | null;
  error: string | null;
}

export function useOdooStatus() {
  return useQuery({
    queryKey: ["settings", "odoo-status"],
    queryFn: async () => {
      const { data, error } = await client.GET("/settings/odoo-status");
      if (error) throw new Error("Failed to fetch Odoo status");
      return data as unknown as OdooStatus;
    },
    refetchInterval: 30_000,
  });
}

// ── Webhooks ───────────────────────────────────────────────────────────────

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  status: "active" | "inactive";
  created_at: string;
}

export function useWebhooks() {
  return useQuery({
    queryKey: ["webhooks"],
    queryFn: async () => {
      const { data, error } = await client.GET("/webhooks");
      if (error) throw new Error("Failed to fetch webhooks");
      return data as { webhooks: Webhook[] };
    },
  });
}

export function useCreateWebhook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { url: string; events: string[] }) => {
      const { data, error } = await client.POST("/webhooks", { body });
      if (error) throw new Error("Failed to create webhook");
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["webhooks"] }),
  });
}

export function useDeleteWebhook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await client.DELETE("/webhooks/{id}", {
        params: { path: { id } },
      });
      if (error) throw new Error("Failed to delete webhook");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["webhooks"] }),
  });
}

// ── API Keys ───────────────────────────────────────────────────────────────

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  created_at: string;
  last_used: string | null;
}

export interface CreateApiKeyResponse {
  id: string;
  key: string;
  name: string;
  prefix: string;
}

export function useApiKeys() {
  return useQuery({
    queryKey: ["api-keys"],
    queryFn: async () => {
      const { data, error } = await client.GET("/auth/api-keys");
      if (error) throw new Error("Failed to fetch API keys");
      return data as { keys: ApiKey[] };
    },
  });
}

export function useCreateApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { name: string; scopes: string[] }) => {
      const { data, error } = await client.POST("/auth/api-keys", { body });
      if (error) throw new Error("Failed to create API key");
      return data as unknown as CreateApiKeyResponse;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["api-keys"] }),
  });
}

export function useRevokeApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await client.DELETE("/auth/api-keys/{id}", {
        params: { path: { id } },
      });
      if (error) throw new Error("Failed to revoke API key");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["api-keys"] }),
  });
}
