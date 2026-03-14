import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { components } from "@/api/generated/api";

type Employee = components["schemas"]["odoo.Employee"];

const employeeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  work_email: z.string().email("Valid email required"),
  job_title: z.string().optional(),
  department_id: z.coerce.number().optional(),
  employee_type: z.string().default("employee"),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee | null;
  onSubmit: (values: EmployeeFormValues) => void;
  isSubmitting?: boolean;
}

export function EmployeeForm({
  open,
  onOpenChange,
  employee,
  onSubmit,
  isSubmitting,
}: EmployeeFormProps) {
  const isEdit = !!employee;

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: employee
      ? {
          name: employee.name ?? "",
          work_email: employee.work_email ?? "",
          job_title: employee.job_title ?? "",
          department_id: employee.department_id?.id ?? undefined,
          employee_type: employee.employee_type ?? "employee",
        }
      : {
          name: "",
          work_email: "",
          job_title: "",
          employee_type: "employee",
        },
  });

  const handleSubmit = form.handleSubmit((values) => {
    onSubmit(values);
  });

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              {isEdit ? "Edit Employee" : "Add Employee"}
            </Dialog.Title>
            <Dialog.Close className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <Field label="Full Name" error={form.formState.errors.name?.message}>
              <input
                {...form.register("name")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </Field>

            <Field label="Email" error={form.formState.errors.work_email?.message}>
              <input
                type="email"
                {...form.register("work_email")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </Field>

            <Field label="Job Title" error={form.formState.errors.job_title?.message}>
              <input
                {...form.register("job_title")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </Field>

            <Field label="Employee Type" error={form.formState.errors.employee_type?.message}>
              <select
                {...form.register("employee_type")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="employee">Employee</option>
                <option value="freelancer">Freelancer</option>
                <option value="student">Student</option>
              </select>
            </Field>

            <div className="flex justify-end gap-3 pt-2">
              <Dialog.Close className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Cancel
              </Dialog.Close>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : isEdit ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
