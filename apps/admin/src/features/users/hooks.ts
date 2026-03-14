import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "@/api/client";
import type { Role } from "@/auth/store";

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: Role;
  last_login: string | null;
  status: "active" | "invited" | "revoked";
}

export function useUsers(page = 1, perPage = 25) {
  return useQuery({
    queryKey: ["users", page, perPage],
    queryFn: async () => {
      const { data, error } = await client.GET("/users", {
        params: { query: { page, per_page: perPage } },
      });
      if (error) throw new Error("Failed to fetch users");
      return data as { users: UserRecord[]; total: number };
    },
  });
}

export function useInviteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { email: string; role: Role }) => {
      const { data, error } = await client.POST("/users/invite", {
        body: payload,
      });
      if (error) throw new Error("Failed to invite user");
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: Role }) => {
      const { error } = await client.PUT("/users/{id}/role", {
        params: { path: { id } },
        body: { role },
      });
      if (error) throw new Error("Failed to update role");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useRevokeUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await client.PUT("/users/{id}/revoke", {
        params: { path: { id } },
      });
      if (error) throw new Error("Failed to revoke user");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}
