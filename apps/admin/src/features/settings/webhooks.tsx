import { useState } from "react";
import { format } from "date-fns";
import { Trash2, Plus } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { useWebhooks, useCreateWebhook, useDeleteWebhook } from "./hooks";

const WEBHOOK_EVENTS = [
  "employee.created",
  "employee.updated",
  "employee.deleted",
  "contract.created",
  "contract.updated",
  "payroll.completed",
  "leave.approved",
  "leave.rejected",
] as const;

export function WebhooksManager() {
  const { data, isLoading } = useWebhooks();
  const createMutation = useCreateWebhook();
  const deleteMutation = useDeleteWebhook();

  const [showForm, setShowForm] = useState(false);
  const [url, setUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const webhooks = data?.webhooks ?? [];

  const handleCreate = () => {
    if (!url || selectedEvents.length === 0) return;
    createMutation.mutate(
      { url, events: selectedEvents },
      {
        onSuccess: () => {
          setUrl("");
          setSelectedEvents([]);
          setShowForm(false);
        },
      },
    );
  };

  const toggleEvent = (event: string) => {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event],
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Webhooks</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Webhook
        </button>
      </div>

      {showForm && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-3">
          <input
            type="url"
            placeholder="https://example.com/webhook"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Events
            </label>
            <div className="flex flex-wrap gap-2">
              {WEBHOOK_EVENTS.map((event) => (
                <label
                  key={event}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs cursor-pointer ${
                    selectedEvents.includes(event)
                      ? "border-blue-500 bg-blue-100 text-blue-800"
                      : "border-gray-300 bg-white text-gray-600"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedEvents.includes(event)}
                    onChange={() => toggleEvent(event)}
                    className="sr-only"
                  />
                  {event}
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={!url || selectedEvents.length === 0 || createMutation.isPending}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {createMutation.isPending ? "Creating..." : "Create"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="animate-pulse space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 rounded bg-gray-200" />
          ))}
        </div>
      ) : webhooks.length === 0 ? (
        <p className="text-sm text-gray-500 py-4">No webhooks configured.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">URL</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Events</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Created</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {webhooks.map((wh) => (
                <tr key={wh.id}>
                  <td className="px-4 py-3 text-sm font-mono text-gray-900 max-w-[200px] truncate">
                    {wh.url}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {wh.events.map((ev) => (
                        <span key={ev} className="inline-block rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-700">
                          {ev}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge variant={wh.status === "active" ? "success" : "neutral"}>
                      {wh.status}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {format(new Date(wh.created_at), "yyyy-MM-dd")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {deleteConfirm === wh.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            deleteMutation.mutate(wh.id);
                            setDeleteConfirm(null);
                          }}
                          className="text-xs text-red-600 font-medium"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="text-xs text-gray-500"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(wh.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
