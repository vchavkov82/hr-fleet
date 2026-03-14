import { LogOut } from "lucide-react";
import { useAuthStore } from "@/auth/store";

export function Header() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  if (!user) return null;

  const roleBadgeColor: Record<string, string> = {
    super_admin: "bg-red-100 text-red-700",
    org_admin: "bg-purple-100 text-purple-700",
    hr_manager: "bg-blue-100 text-blue-700",
    payroll_manager: "bg-green-100 text-green-700",
    department_head: "bg-yellow-100 text-yellow-700",
    manager: "bg-orange-100 text-orange-700",
    employee: "bg-gray-100 text-gray-700",
  };

  const roleLabel = user.role.replace(/_/g, " ");

  return (
    <header className="flex h-14 items-center justify-end gap-4 border-b bg-white px-6">
      <span className="text-sm text-gray-700">{user.name}</span>
      <span
        className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${roleBadgeColor[user.role] ?? "bg-gray-100 text-gray-700"}`}
      >
        {roleLabel}
      </span>
      <button
        onClick={() => void logout()}
        className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
        title="Sign out"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    </header>
  );
}
