import { useState, useMemo } from "react";
import { format, parseISO } from "date-fns";
import { Check, X, Receipt, DollarSign, Clock } from "lucide-react";
import { useExpenses, useApproveExpense, useRejectExpense } from "./hooks";

interface Expense {
  id: number;
  employee_id: { id: number; name: string };
  name: string;
  date: string;
  total_amount: number;
  state: string;
  product_id?: { id: number; name: string };
}

const STATE_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-700" },
  reported: { label: "Submitted", color: "bg-blue-100 text-blue-700" },
  approved: { label: "Approved", color: "bg-green-100 text-green-700" },
  done: { label: "Paid", color: "bg-green-100 text-green-700" },
  refused: { label: "Refused", color: "bg-red-100 text-red-700" },
};

export function ExpensesPage() {
  const [stateFilter, setStateFilter] = useState<string>("");

  const { data, isLoading } = useExpenses({
    perPage: 100,
    state: stateFilter || undefined,
  });

  const approveMutation = useApproveExpense();
  const rejectMutation = useRejectExpense();

  const expenses = ((data as { data?: Expense[] })?.data ?? []) as Expense[];

  const { totalPending, totalApproved, pendingAmount } = useMemo(() => {
    let pending = 0;
    let approved = 0;
    let amount = 0;

    expenses.forEach((e) => {
      if (e.state === "reported") {
        pending++;
        amount += e.total_amount;
      } else if (e.state === "approved" || e.state === "done") {
        approved++;
      }
    });

    return { totalPending: pending, totalApproved: approved, pendingAmount: amount };
  }, [expenses]);

  const handleApprove = (id: number) => {
    if (confirm("Approve this expense?")) {
      approveMutation.mutate(id);
    }
  };

  const handleReject = (id: number) => {
    if (confirm("Reject this expense?")) {
      rejectMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-gray-100" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="mt-1 text-sm text-gray-500">
            Review and approve employee expense reports
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalPending}</div>
              <div className="text-sm text-gray-500">Pending Approval</div>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalApproved}</div>
              <div className="text-sm text-gray-500">Approved</div>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                ${pendingAmount.toFixed(2)}
              </div>
              <div className="text-sm text-gray-500">Pending Amount</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <select
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">All States</option>
          <option value="draft">Draft</option>
          <option value="reported">Submitted</option>
          <option value="approved">Approved</option>
          <option value="refused">Refused</option>
        </select>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Employee</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Description</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Amount</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No expenses found
                </td>
              </tr>
            ) : (
              expenses.map((expense) => {
                const stateInfo = STATE_LABELS[expense.state] ?? { label: expense.state, color: "bg-gray-100 text-gray-700" };
                return (
                  <tr key={expense.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {expense.employee_id.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Receipt className="h-4 w-4 text-gray-400" />
                        {expense.name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {expense.date ? format(parseISO(expense.date), "MMM d, yyyy") : "-"}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                      ${expense.total_amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${stateInfo.color}`}>
                        {stateInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {expense.state === "reported" && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleApprove(expense.id)}
                            disabled={approveMutation.isPending}
                            className="rounded-md bg-green-50 p-1.5 text-green-600 hover:bg-green-100"
                            title="Approve"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleReject(expense.id)}
                            disabled={rejectMutation.isPending}
                            className="rounded-md bg-red-50 p-1.5 text-red-600 hover:bg-red-100"
                            title="Reject"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
