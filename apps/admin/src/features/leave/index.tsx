import { useState } from "react";
import { differenceInDays, parseISO } from "date-fns";
import { useLeaveRequests } from "./hooks";
import { LeaveActions } from "./leave-actions";

type ViewMode = "pending" | "all";

function StatusBadge({ status }: { status?: string }) {
  const colors: Record<string, string> = {
    confirm: "bg-yellow-100 text-yellow-700",
    validate: "bg-green-100 text-green-700",
    refuse: "bg-red-100 text-red-700",
    draft: "bg-gray-100 text-gray-600",
  };
  const labels: Record<string, string> = {
    confirm: "Pending",
    validate: "Approved",
    refuse: "Rejected",
    draft: "Draft",
  };
  const colorClass = colors[status ?? ""] ?? "bg-gray-100 text-gray-600";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colorClass}`}
    >
      {labels[status ?? ""] ?? status ?? "unknown"}
    </span>
  );
}

interface LeaveRequest {
  id?: number;
  employee_id?: { id?: number; name?: string };
  holiday_status_id?: { id?: number; name?: string };
  name?: string;
  date_from?: string;
  date_to?: string;
  number_of_days?: number;
  state?: string;
}

function computeDays(dateFrom?: string, dateTo?: string): number | null {
  if (!dateFrom || !dateTo) return null;
  return differenceInDays(parseISO(dateTo), parseISO(dateFrom)) + 1;
}

export function LeavePage() {
  const [view, setView] = useState<ViewMode>("pending");
  const [page, setPage] = useState(1);
  const statusFilter = view === "pending" ? "confirm" : undefined;
  const { data, isLoading, error } = useLeaveRequests({
    page,
    status: statusFilter,
  });

  const requests = (data?.data as LeaveRequest[] | undefined) ?? [];
  const meta = data?.meta;

  // Sort pending by oldest first
  const sorted =
    view === "pending"
      ? [...requests].sort(
          (a, b) =>
            new Date(a.date_from ?? 0).getTime() -
            new Date(b.date_from ?? 0).getTime(),
        )
      : requests;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setView("pending");
              setPage(1);
            }}
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              view === "pending"
                ? "bg-blue-600 text-white"
                : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Pending Approval
          </button>
          <button
            onClick={() => {
              setView("all");
              setPage(1);
            }}
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              view === "all"
                ? "bg-blue-600 text-white"
                : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            All Requests
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
          Failed to load leave requests.
        </div>
      )}

      {isLoading ? (
        <div className="mt-8 text-center text-gray-500">Loading...</div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Employee
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  From
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  To
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Days
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {sorted.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-sm text-gray-500"
                  >
                    {view === "pending"
                      ? "No pending leave requests."
                      : "No leave requests found."}
                  </td>
                </tr>
              ) : (
                sorted.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                      {r.employee_id?.name ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                      {r.holiday_status_id?.name ?? r.name ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                      {r.date_from ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                      {r.date_to ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                      {r.number_of_days ??
                        computeDays(r.date_from, r.date_to) ??
                        "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      <StatusBadge status={r.state} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      <LeaveActions
                        requestId={r.id ?? 0}
                        status={r.state}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {meta && (meta.total_pages ?? 0) > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Page {meta.page} of {meta.total_pages} ({meta.total} total)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() =>
                setPage((p) => Math.min(meta.total_pages ?? 1, p + 1))
              }
              disabled={page >= (meta.total_pages ?? 1)}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
