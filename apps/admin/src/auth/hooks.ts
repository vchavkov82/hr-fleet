import { useAuthStore } from "./store";
import type { Role } from "./store";

export type Permission =
  | "employees:read"
  | "employees:write"
  | "payroll:read"
  | "payroll:run"
  | "payroll:approve"
  | "leave:approve"
  | "contracts:write"
  | "reports:read"
  | "users:manage"
  | "audit:read"
  | "settings:write";

export const PERMISSION_MAP: Record<Permission, Role[]> = {
  "employees:read": [
    "super_admin",
    "org_admin",
    "hr_manager",
    "payroll_manager",
    "department_head",
    "manager",
  ],
  "employees:write": ["super_admin", "org_admin", "hr_manager"],
  "payroll:read": [
    "super_admin",
    "org_admin",
    "hr_manager",
    "payroll_manager",
  ],
  "payroll:run": ["super_admin", "org_admin", "payroll_manager"],
  "payroll:approve": ["super_admin", "org_admin"],
  "leave:approve": [
    "super_admin",
    "org_admin",
    "hr_manager",
    "department_head",
    "manager",
  ],
  "contracts:write": ["super_admin", "org_admin", "hr_manager"],
  "reports:read": [
    "super_admin",
    "org_admin",
    "hr_manager",
    "payroll_manager",
  ],
  "users:manage": ["super_admin", "org_admin"],
  "audit:read": ["super_admin", "org_admin"],
  "settings:write": ["super_admin"],
};

export function hasPermission(role: Role, permission: string): boolean {
  const allowed = PERMISSION_MAP[permission as Permission];
  if (!allowed) return false;
  return allowed.includes(role);
}

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  return { user, isAuthenticated, login, logout };
}

export function useRole(): Role | null {
  return useAuthStore((s) => s.user?.role ?? null);
}

export function useHasPermission(permission: string): boolean {
  const role = useAuthStore((s) => s.user?.role);
  if (!role) return false;
  return hasPermission(role, permission);
}
