import type { ReactNode } from "react";
import { useHasPermission } from "./hooks";

interface PermissionGateProps {
  permission: string;
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGate({
  permission,
  fallback = null,
  children,
}: PermissionGateProps) {
  const allowed = useHasPermission(permission);
  return allowed ? children : fallback;
}
