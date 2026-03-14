import { useState, useRef, useCallback } from "react";
import { type ColumnDef, type PaginationState } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { format } from "date-fns";
import { ChevronRight, ChevronDown, Shield } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge, statusToVariant } from "@/components/shared/status-badge";
import { useHasPermission } from "@/auth/hooks";
import { useAuditLogs, type AuditLogEntry } from "./hooks";
import { DiffViewer } from "./diff-viewer";

const ACTION_OPTIONS = ["create", "update", "delete"] as const;
const ENTITY_OPTIONS = [
  "employee",
  "contract",
  "payroll_run",
  "payslip",
  "leave_request",
  "user",
  "webhook",
  "api_key",
  "settings",
] as const;

function AuditLogContent() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 50,
  });
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [actorFilter, setActorFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [entityTypeFilter, setEntityTypeFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const { data, isLoading } = useAuditLogs({
    page: pagination.pageIndex + 1,
    perPage: pagination.pageSize,
    actor: actorFilter,
    action: actionFilter,
    entityType: entityTypeFilter,
    dateFrom,
    dateTo,
  });

  const entries = data?.entries ?? [];
  const total = data?.total ?? 0;
  const pageCount = Math.ceil(total / pagination.pageSize);

  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: entries.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 10,
  });

  const toggleRow = useCallback((id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const actionVariant = (action: string) => {
    switch (action) {
      case "create":
        return "success";
      case "update":
        return "info";
      case "delete":
        return "error";
      default:
        return statusToVariant(action);
    }
  };

  const columns: ColumnDef<AuditLogEntry, unknown>[] = [
    {
      id: "expand",
      header: "",
      size: 40,
      cell: ({ row }) => (
        <button
          onClick={() => toggleRow(row.original.id)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          {expandedRows.has(row.original.id) ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
      ),
    },
    {
      accessorKey: "timestamp",
      header: "Timestamp",
      cell: ({ getValue }) =>
        format(new Date(getValue() as string), "yyyy-MM-dd HH:mm:ss"),
    },
    {
      accessorKey: "actor_email",
      header: "Actor",
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ getValue }) => {
        const action = getValue() as string;
        return <StatusBadge variant={actionVariant(action)}>{action}</StatusBadge>;
      },
    },
    {
      accessorKey: "entity_type",
      header: "Entity Type",
    },
    {
      accessorKey: "entity_id",
      header: "Entity ID",
      cell: ({ getValue }) => (
        <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
          {getValue() as string}
        </code>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
        <p className="mt-1 text-sm text-gray-500">
          Immutable history of all data mutations
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Filter by actor..."
          value={actorFilter}
          onChange={(e) => setActorFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        >
          <option value="">All actions</option>
          {ACTION_OPTIONS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <select
          value={entityTypeFilter}
          onChange={(e) => setEntityTypeFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        >
          <option value="">All entities</option>
          {ENTITY_OPTIONS.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        />
      </div>

      {/* Virtual scrolling wrapper */}
      <div ref={parentRef} className="max-h-[600px] overflow-auto">
        <DataTable
          columns={columns}
          data={entries}
          pageCount={pageCount}
          pagination={pagination}
          onPaginationChange={setPagination}
          isLoading={isLoading}
        />

        {/* Expanded diff rows rendered via virtualizer context */}
        {entries.map(
          (entry) =>
            expandedRows.has(entry.id) && (
              <div
                key={`diff-${entry.id}`}
                className="border-l-4 border-blue-300 bg-gray-50 px-6 py-4 mx-4 mb-2 rounded"
              >
                <h4 className="text-xs font-semibold text-gray-600 mb-2 uppercase">
                  Change Details
                </h4>
                <DiffViewer
                  oldValue={entry.old_value}
                  newValue={entry.new_value}
                />
              </div>
            ),
        )}
      </div>
    </div>
  );
}

export function AuditLogPage() {
  const canView = useHasPermission("audit:read");

  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <Shield className="h-12 w-12 mb-4" />
        <h2 className="text-lg font-semibold">Access Denied</h2>
        <p className="text-sm">You need the audit:read permission to view this page.</p>
      </div>
    );
  }

  return <AuditLogContent />;
}
