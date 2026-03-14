import { useState } from "react";
import { differenceInDays, parseISO } from "date-fns";
import { useContracts } from "./hooks";
import { ContractForm } from "./contract-form";
import { useHasPermission } from "@/auth/hooks";
import { formatBGN } from "@/lib/format";

function ExpiryBadge({ dateEnd }: { dateEnd?: string }) {
  if (!dateEnd) return null;
  const days = differenceInDays(parseISO(dateEnd), new Date());
  if (days < 0) {
    return (
      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
        Expired
      </span>
    );
  }
  if (days <= 7) {
    return (
      <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
        Expires in {days}d
      </span>
    );
  }
  if (days <= 30) {
    return (
      <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
        Expires in {days}d
      </span>
    );
  }
  return null;
}

function StatusBadge({ status }: { status?: string }) {
  const colors: Record<string, string> = {
    open: "bg-green-100 text-green-700",
    draft: "bg-gray-100 text-gray-600",
    close: "bg-red-100 text-red-700",
    cancel: "bg-gray-100 text-gray-500",
  };
  const colorClass = colors[status ?? ""] ?? "bg-gray-100 text-gray-600";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colorClass}`}
    >
      {status ?? "unknown"}
    </span>
  );
}

interface Contract {
  id?: number;
  employee_id?: { id?: number; name?: string };
  name?: string;
  date_start?: string;
  date_end?: string;
  wage?: number;
  state?: string;
  department_id?: { id?: number; name?: string };
  structure_type_id?: { id?: number; name?: string };
}

export function ContractsPage() {
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const canWrite = useHasPermission("contracts:write");
  const { data, isLoading, error } = useContracts({ page });

  const contracts = (data?.data as Contract[] | undefined) ?? [];
  const meta = data?.meta;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Contracts</h1>
        {canWrite && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            {showForm ? "Close Form" : "New Contract"}
          </button>
        )}
      </div>

      {showForm && canWrite && (
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Create Contract
          </h2>
          <ContractForm
            onSuccess={() => setShowForm(false)}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
          Failed to load contracts.
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
                  Contract
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Start
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  End
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Salary
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Expiry
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {contracts.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-sm text-gray-500"
                  >
                    No contracts found.
                  </td>
                </tr>
              ) : (
                contracts.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                      {c.employee_id?.name ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                      {c.name ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                      {c.date_start ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                      {c.date_end ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                      {c.wage != null ? formatBGN(c.wage) : "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      <StatusBadge status={c.state} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      <ExpiryBadge dateEnd={c.date_end} />
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
