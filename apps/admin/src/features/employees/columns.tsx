import type { ColumnDef } from "@tanstack/react-table";
import type { components } from "@/api/generated/api";
import { StatusBadge, statusToVariant } from "@/components/shared/status-badge";
import { Pencil, Trash2 } from "lucide-react";

type Employee = components["schemas"]["odoo.Employee"];

interface ColumnActions {
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
  canWrite: boolean;
}

export function getEmployeeColumns({ onEdit, onDelete, canWrite }: ColumnActions): ColumnDef<Employee, unknown>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
      enableSorting: true,
    },
    {
      accessorKey: "work_email",
      header: "Email",
      enableSorting: false,
    },
    {
      accessorFn: (row) => row.department_id?.name ?? "-",
      id: "department",
      header: "Department",
      enableSorting: false,
    },
    {
      accessorKey: "job_title",
      header: "Position",
      enableSorting: false,
    },
    {
      accessorKey: "employee_type",
      header: "Type",
      enableSorting: false,
      cell: ({ getValue }) => {
        const val = (getValue() as string) ?? "employee";
        return <StatusBadge variant={statusToVariant(val === "employee" ? "active" : "neutral")}>{val}</StatusBadge>;
      },
    },
    {
      accessorFn: (row) => (row.active ? "Active" : "Inactive"),
      id: "status",
      header: "Status",
      enableSorting: false,
      cell: ({ getValue }) => {
        const val = getValue() as string;
        return <StatusBadge variant={statusToVariant(val)}>{val}</StatusBadge>;
      },
    },
    {
      accessorKey: "create_date",
      header: "Created",
      enableSorting: true,
      cell: ({ getValue }) => {
        const val = getValue() as string | undefined;
        if (!val) return "-";
        return new Date(val).toLocaleDateString("bg-BG");
      },
    },
    ...(canWrite
      ? [
          {
            id: "actions",
            header: "Actions",
            enableSorting: false,
            cell: ({ row }: { row: { original: Employee } }) => (
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(row.original);
                  }}
                  className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-blue-600"
                  title="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(row.original);
                  }}
                  className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-red-600"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ),
          } satisfies ColumnDef<Employee, unknown>,
        ]
      : []),
  ];
}
