import { useState } from "react";
import { format } from "date-fns";
import { Trash2, Plus, Copy, Check, Key } from "lucide-react";
import { useApiKeys, useCreateApiKey, useRevokeApiKey, type CreateApiKeyResponse } from "./hooks";

const AVAILABLE_SCOPES = [
  "employees:read",
  "employees:write",
  "payroll:read",
  "contracts:read",
  "reports:read",
  "webhooks:manage",
] as const;

export function ApiKeysManager() {
  const { data, isLoading } = useApiKeys();
  const createMutation = useCreateApiKey();
  const revokeMutation = useRevokeApiKey();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [selectedScopes, setSelectedScopes] = useState<string[]>([]);
  const [revokeConfirm, setRevokeConfirm] = useState<string | null>(null);
  const [newKey, setNewKey] = useState<CreateApiKeyResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const keys = data?.keys ?? [];

  const handleCreate = () => {
    if (!name || selectedScopes.length === 0) return;
    createMutation.mutate(
      { name, scopes: selectedScopes },
      {
        onSuccess: (result) => {
          setNewKey(result);
          setName("");
          setSelectedScopes([]);
          setShowForm(false);
        },
      },
    );
  };

  const handleCopy = async (key: string) => {
    await navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleScope = (scope: string) => {
    setSelectedScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope],
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">API Keys</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Create Key
        </button>
      </div>

      {/* Show newly created key (only once) */}
      {newKey && (
        <div className="rounded-lg border border-green-300 bg-green-50 p-4">
          <div className="flex items-start gap-3">
            <Key className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">
                API Key Created: {newKey.name}
              </p>
              <p className="text-xs text-green-700 mt-1">
                Copy this key now. It will not be shown again.
              </p>
              <div className="mt-2 flex items-center gap-2">
                <code className="block rounded bg-white border border-green-200 px-3 py-1.5 text-xs font-mono text-gray-900 flex-1">
                  {newKey.key}
                </code>
                <button
                  onClick={() => handleCopy(newKey.key)}
                  className="p-1.5 rounded-md border border-green-300 hover:bg-green-100"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4 text-green-600" />
                  )}
                </button>
              </div>
            </div>
            <button
              onClick={() => setNewKey(null)}
              className="text-xs text-green-700 hover:underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-3">
          <input
            type="text"
            placeholder="Key name (e.g. CI Pipeline)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Scopes
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_SCOPES.map((scope) => (
                <label
                  key={scope}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs cursor-pointer ${
                    selectedScopes.includes(scope)
                      ? "border-blue-500 bg-blue-100 text-blue-800"
                      : "border-gray-300 bg-white text-gray-600"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedScopes.includes(scope)}
                    onChange={() => toggleScope(scope)}
                    className="sr-only"
                  />
                  {scope}
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={!name || selectedScopes.length === 0 || createMutation.isPending}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {createMutation.isPending ? "Creating..." : "Create Key"}
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
      ) : keys.length === 0 ? (
        <p className="text-sm text-gray-500 py-4">No API keys created.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Prefix</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Scopes</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Created</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Last Used</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {keys.map((key) => (
                <tr key={key.id}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{key.name}</td>
                  <td className="px-4 py-3">
                    <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{key.prefix}...</code>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {key.scopes.map((s) => (
                        <span key={s} className="inline-block rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-700">
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {format(new Date(key.created_at), "yyyy-MM-dd")}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {key.last_used ? format(new Date(key.last_used), "yyyy-MM-dd") : "Never"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {revokeConfirm === key.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            revokeMutation.mutate(key.id);
                            setRevokeConfirm(null);
                          }}
                          className="text-xs text-red-600 font-medium"
                        >
                          Confirm Revoke
                        </button>
                        <button
                          onClick={() => setRevokeConfirm(null)}
                          className="text-xs text-gray-500"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setRevokeConfirm(key.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Revoke key"
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
