import { PermissionGate } from "@/auth/guard";
import { formatBGN } from "@/lib/format";
import {
  usePayrollRun,
  useConfirmPayrollRun,
  useCancelPayrollRun,
} from "./hooks";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  processing: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-500",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[status] ?? "bg-gray-100 text-gray-700"}`}
    >
      {status}
    </span>
  );
}

export function PayrollRunStatus({ runId }: { runId: string }) {
  const { data: run, isLoading } = usePayrollRun(runId);
  const confirmRun = useConfirmPayrollRun();
  const cancelRun = useCancelPayrollRun();

  if (isLoading || !run) {
    return <div className="p-4 text-sm text-gray-500">Loading...</div>;
  }

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">
          Payroll Run &mdash; {run.month}/{run.year}
        </h3>
        <StatusBadge status={run.status} />
      </div>

      {run.status === "processing" && (
        <div className="mt-3">
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div className="h-full animate-pulse rounded-full bg-yellow-400" style={{ width: "60%" }} />
          </div>
          <p className="mt-1 text-xs text-gray-500">Processing payroll...</p>
        </div>
      )}

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-gray-500">Employees</dt>
          <dd className="font-medium text-gray-900">{run.employee_count}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Total Gross</dt>
          <dd className="font-medium text-gray-900">{formatBGN(run.total_gross)}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Total Net</dt>
          <dd className="font-medium text-gray-900">{formatBGN(run.total_net)}</dd>
        </div>
      </dl>

      {run.error_details && (
        <div className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-700">
          {run.error_details}
        </div>
      )}

      {(run.status === "draft" || run.status === "completed") && (
        <PermissionGate permission="payroll:approve">
          <div className="mt-4 flex gap-2">
            {run.status === "completed" && (
              <button
                onClick={() => confirmRun.mutate(run.id)}
                disabled={confirmRun.isPending}
                className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                {confirmRun.isPending ? "Confirming..." : "Confirm"}
              </button>
            )}
            <button
              onClick={() => cancelRun.mutate(run.id)}
              disabled={cancelRun.isPending}
              className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              {cancelRun.isPending ? "Cancelling..." : "Cancel Run"}
            </button>
          </div>
        </PermissionGate>
      )}
    </div>
  );
}
