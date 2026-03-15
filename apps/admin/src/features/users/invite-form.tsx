import { useState } from "react";
import { z } from "zod";
import type { Role } from "@/auth/store";
import { useInviteUser } from "./hooks";

const ROLES: Role[] = [
  "super_admin",
  "org_admin",
  "hr_manager",
  "payroll_manager",
  "department_head",
  "manager",
  "employee",
];

const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  org_admin: "Org Admin",
  hr_manager: "HR Manager",
  payroll_manager: "Payroll Manager",
  department_head: "Department Head",
  manager: "Manager",
  employee: "Employee",
};

const inviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum([
    "super_admin",
    "org_admin",
    "hr_manager",
    "payroll_manager",
    "department_head",
    "manager",
    "employee",
  ]),
});

interface Props {
  open: boolean;
  onClose: () => void;
}

export function InviteForm({ open, onClose }: Props) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("employee");
  const [error, setError] = useState<string | null>(null);
  const invite = useInviteUser();

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = inviteSchema.safeParse({ email, role });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Validation failed");
      return;
    }

    try {
      await invite.mutateAsync({ email, role });
      setEmail("");
      setRole("employee");
      onClose();
    } catch {
      setError("Failed to send invitation. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Invite User
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="invite-email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@company.com"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="invite-role"
              className="block text-sm font-medium text-gray-700"
            >
              Role
            </label>
            <select
              id="invite-role"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={invite.isPending}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {invite.isPending ? "Sending..." : "Send Invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
