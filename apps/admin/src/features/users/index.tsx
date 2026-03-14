import { useState } from "react";
import { useHasPermission } from "@/auth/hooks";
import type { Role } from "@/auth/store";
import { useUsers, useUpdateUserRole, useRevokeUser } from "./hooks";
import { InviteForm } from "./invite-form";

const ROLE_COLORS: Record<Role, string> = {
  super_admin: "bg-red-100 text-red-800",
  org_admin: "bg-purple-100 text-purple-800",
  hr_manager: "bg-blue-100 text-blue-800",
  payroll_manager: "bg-green-100 text-green-800",
  department_head: "bg-yellow-100 text-yellow-800",
  manager: "bg-indigo-100 text-indigo-800",
  employee: "bg-gray-100 text-gray-800",
};

const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  org_admin: "Org Admin",
  hr_manager: "HR Manager",
  payroll_manager: "Payroll Manager",
  department_head: "Dept Head",
  manager: "Manager",
  employee: "Employee",
};

const ALL_ROLES: Role[] = [
  "super_admin",
  "org_admin",
  "hr_manager",
  "payroll_manager",
  "department_head",
  "manager",
  "employee",
];

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  invited: "bg-yellow-100 text-yellow-800",
  revoked: "bg-red-100 text-red-800",
};

export function UsersPage() {
  const canManage = useHasPermission("users:manage");
  const [inviteOpen, setInviteOpen] = useState(false);
  const users = useUsers();
  const updateRole = useUpdateUserRole();
  const revoke = useRevokeUser();

  if (!canManage) {
    return (
      <div className="p-6 text-center text-gray-500">
        You do not have permission to manage users.
      </div>
    );
  }

  const handleRoleChange = (id: string, role: Role) => {
    updateRole.mutate({ id, role });
  };

  const handleRevoke = (id: string, name: string) => {
    if (window.confirm(`Revoke access for ${name}?`)) {
      revoke.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <button
          type="button"
          onClick={() => setInviteOpen(true)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Invite User
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Last Login
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {users.isLoading && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Loading users...
                </td>
              </tr>
            )}
            {users.data?.users?.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  {user.name}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {user.email}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <select
                    value={user.role}
                    onChange={(e) =>
                      handleRoleChange(user.id, e.target.value as Role)
                    }
                    className="rounded-md border border-gray-200 bg-transparent px-2 py-1 text-xs font-medium"
                  >
                    {ALL_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </option>
                    ))}
                  </select>
                  <span
                    className={`ml-2 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_COLORS[user.role]}`}
                  >
                    {ROLE_LABELS[user.role]}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {user.last_login
                    ? new Date(user.last_login).toLocaleDateString("bg-BG")
                    : "Never"}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[user.status] ?? "bg-gray-100 text-gray-800"}`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right">
                  {user.status !== "revoked" && (
                    <button
                      type="button"
                      onClick={() => handleRevoke(user.id, user.name)}
                      className="text-sm font-medium text-red-600 hover:text-red-800"
                    >
                      Revoke
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {!users.isLoading && !users.data?.users?.length && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <InviteForm open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </div>
  );
}
