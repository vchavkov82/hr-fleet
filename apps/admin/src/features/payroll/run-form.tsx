import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { PermissionGate } from "@/auth/guard";
import { useCreatePayrollRun } from "./hooks";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function NewPayrollRunButton() {
  return (
    <PermissionGate permission="payroll:run">
      <NewPayrollRunDialog />
    </PermissionGate>
  );
}

function NewPayrollRunDialog() {
  const [open, setOpen] = useState(false);
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const createRun = useCreatePayrollRun();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createRun.mutate(
      { month, year },
      { onSuccess: () => setOpen(false) },
    );
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          New Payroll Run
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl">
          <Dialog.Title className="text-lg font-semibold text-gray-900">
            New Payroll Run
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-gray-500">
            Select the payroll period to process.
          </Dialog.Description>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Month
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                {MONTHS.map((m, i) => (
                  <option key={m} value={i + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Year
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                min={2020}
                max={2030}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={createRun.isPending}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {createRun.isPending ? "Creating..." : "Create Run"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
