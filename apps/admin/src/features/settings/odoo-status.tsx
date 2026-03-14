import { format } from "date-fns";
import { CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { useOdooStatus } from "./hooks";

export function OdooStatusCard() {
  const { data: status, isLoading, refetch } = useOdooStatus();

  if (isLoading) {
    return (
      <div className="animate-pulse rounded-lg border border-gray-200 p-6">
        <div className="h-6 w-48 rounded bg-gray-200 mb-4" />
        <div className="h-4 w-32 rounded bg-gray-200" />
      </div>
    );
  }

  const connected = status?.connected ?? false;

  return (
    <div className="max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Odoo Connection</h3>
        <button
          onClick={() => refetch()}
          className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500"
          title="Refresh status"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center gap-3 mb-4">
        {connected ? (
          <CheckCircle className="h-6 w-6 text-green-500" />
        ) : (
          <XCircle className="h-6 w-6 text-red-500" />
        )}
        <span
          className={`text-sm font-medium ${connected ? "text-green-700" : "text-red-700"}`}
        >
          {connected ? "Connected" : "Disconnected"}
        </span>
      </div>

      <dl className="space-y-2 text-sm">
        {status?.version && (
          <div className="flex justify-between">
            <dt className="text-gray-500">Version</dt>
            <dd className="font-medium text-gray-900">{status.version}</dd>
          </div>
        )}
        {status?.last_sync && (
          <div className="flex justify-between">
            <dt className="text-gray-500">Last Sync</dt>
            <dd className="font-medium text-gray-900">
              {format(new Date(status.last_sync), "yyyy-MM-dd HH:mm")}
            </dd>
          </div>
        )}
        {status?.error && (
          <div className="mt-3 rounded-md bg-red-50 p-3 text-xs text-red-700">
            {status.error}
          </div>
        )}
      </dl>
    </div>
  );
}
