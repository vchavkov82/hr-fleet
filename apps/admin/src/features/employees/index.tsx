import { useState, useMemo, useCallback } from "react";
import type { PaginationState, SortingState } from "@tanstack/react-table";
import type { components } from "@/api/generated/api";
import { DataTable } from "@/components/shared/data-table";
import { getEmployeeColumns } from "./columns";
import { EmployeeForm } from "./employee-form";
import { useEmployees, useCreateEmployee, useUpdateEmployee, useDeleteEmployee } from "./hooks";
import { useHasPermission } from "@/auth/hooks";
import { Plus } from "lucide-react";

type Employee = components["schemas"]["odoo.Employee"];

export function EmployeesPage() {
  const canWrite = useHasPermission("employees:write");

  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 });
  const [sorting, setSorting] = useState<SortingState>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const { data, isLoading } = useEmployees({
    page: pagination.pageIndex + 1,
    perPage: pagination.pageSize,
    search: search || undefined,
  });

  const listData = data as { data?: Employee[]; meta?: { total?: number; total_pages?: number } } | undefined;
  const employees = listData?.data ?? [];
  const pageCount = listData?.meta?.total_pages ?? 1;

  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();
  const deleteMutation = useDeleteEmployee();

  const handleEdit = useCallback((emp: Employee) => {
    setEditingEmployee(emp);
    setFormOpen(true);
  }, []);

  const handleDelete = useCallback(
    (emp: Employee) => {
      if (emp.id && confirm(`Deactivate ${emp.name}?`)) {
        deleteMutation.mutate(emp.id);
      }
    },
    [deleteMutation],
  );

  const handleFormSubmit = useCallback(
    (values: { name: string; work_email: string; job_title?: string; department_id?: number; employee_type?: string }) => {
      if (editingEmployee?.id) {
        updateMutation.mutate(
          { id: editingEmployee.id, body: values },
          {
            onSuccess: () => {
              setFormOpen(false);
              setEditingEmployee(null);
            },
          },
        );
      } else {
        createMutation.mutate(values, {
          onSuccess: () => {
            setFormOpen(false);
          },
        });
      }
    },
    [editingEmployee, createMutation, updateMutation],
  );

  const columns = useMemo(
    () => getEmployeeColumns({ onEdit: handleEdit, onDelete: handleDelete, canWrite }),
    [handleEdit, handleDelete, canWrite],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your organization's employees
          </p>
        </div>
        {canWrite && (
          <button
            onClick={() => {
              setEditingEmployee(null);
              setFormOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Employee
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={employees}
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={setPagination}
        sorting={sorting}
        onSortingChange={setSorting}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name or email..."
      />

      <EmployeeForm
        key={editingEmployee?.id ?? "new"}
        open={formOpen}
        onOpenChange={setFormOpen}
        employee={editingEmployee}
        onSubmit={handleFormSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
