import { useState } from "react";
import { formatBGN } from "@/lib/format";
import { usePayrollRuns, type PayrollRun } from "./hooks";
import { NewPayrollRunButton } from "./run-form";
import { PayrollRunStatus } from "./run-status";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  processing: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-500",
};

export function PayrollPage() {
  const { data: runs, isLoading } = usePayrollRuns();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Payroll Runs</h1>
        <NewPayrollRunButton />
      </div>

      {isLoading ? (
        <p className="mt-4 text-sm text-gray-500">Loading payroll runs...</p>
      ) : !runs?.length ? (
        <p className="mt-4 text-sm text-gray-500">No payroll runs yet.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Period</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Employees</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Total Gross</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Total Net</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {runs.map((run: PayrollRun) => (
                <PayrollRunRow
                  key={run.id}
                  run={run}
                  isExpanded={expandedId === run.id}
                  onToggle={() =>
                    setExpandedId(expandedId === run.id ? null : run.id)
                  }
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {expandedId && (
        <div className="mt-4">
          <PayrollRunStatus runId={expandedId} />
        </div>
      )}
    </div>
  );
}

function PayrollRunRow({
  run,
  isExpanded,
  onToggle,
}: {
  run: PayrollRun;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <tr
      onClick={onToggle}
      className={`cursor-pointer hover:bg-gray-50 ${isExpanded ? "bg-blue-50" : ""}`}
    >
      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
        {run.month}/{run.year}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-sm">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[run.status] ?? "bg-gray-100 text-gray-700"}`}
        >
          {run.status}
        </span>
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900">
        {run.employee_count}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900">
        {formatBGN(run.total_gross)}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900">
        {formatBGN(run.total_net)}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
        {new Date(run.created_at).toLocaleDateString("bg-BG")}
      </td>
    </tr>
  );
}
