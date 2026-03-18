import { useState, useMemo } from "react";
import { format, parseISO } from "date-fns";
import { ClipboardCheck, Send, CheckCircle, Plus } from "lucide-react";
import { useAppraisals, useConfirmAppraisal, useCompleteAppraisal } from "./hooks";

interface Appraisal {
  id: number;
  employee_id: { id: number; name: string };
  manager_ids?: number[];
  date_close: string;
  state: string;
  department_id?: { id: number; name: string };
  job_id?: { id: number; name: string };
}

const STATE_CONFIG: Record<string, { label: string; color: string; icon: typeof ClipboardCheck }> = {
  "1_new": { label: "To Confirm", color: "bg-gray-100 text-gray-700", icon: ClipboardCheck },
  "2_pending": { label: "In Progress", color: "bg-blue-100 text-blue-700", icon: Send },
  "3_done": { label: "Completed", color: "bg-green-100 text-green-700", icon: CheckCircle },
};

export function AppraisalsPage() {
  const [stateFilter, setStateFilter] = useState<string>("");

  const { data, isLoading } = useAppraisals({
    perPage: 100,
    state: stateFilter || undefined,
  });

  const confirmMutation = useConfirmAppraisal();
  const completeMutation = useCompleteAppraisal();

  const appraisals = ((data as { data?: Appraisal[] })?.data ?? []) as Appraisal[];

  const { draft, pending, completed } = useMemo(() => {
    let d = 0, p = 0, c = 0;
    appraisals.forEach((a) => {
      if (a.state === "1_new") d++;
      else if (a.state === "2_pending") p++;
      else if (a.state === "3_done") c++;
    });
    return { draft: d, pending: p, completed: c };
  }, [appraisals]);

  const handleConfirm = (id: number) => {
    if (confirm("Send this appraisal to the employee?")) {
      confirmMutation.mutate(id);
    }
  };

  const handleComplete = (id: number) => {
    if (confirm("Mark this appraisal as completed?")) {
      completeMutation.mutate(id);
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appraisals</h1>
          <p className="mt-1 text-sm text-gray-500">
            Employee performance reviews and feedback
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          New Appraisal
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
              <ClipboardCheck className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{draft}</div>
              <div className="text-sm text-gray-500">To Confirm</div>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Send className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{pending}</div>
              <div className="text-sm text-gray-500">In Progress</div>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{completed}</div>
              <div className="text-sm text-gray-500">Completed</div>
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
          <option value="1_new">To Confirm</option>
          <option value="2_pending">In Progress</option>
          <option value="3_done">Completed</option>
        </select>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Employee</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Department</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Position</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Due Date</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {appraisals.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No appraisals found
                </td>
              </tr>
            ) : (
              appraisals.map((appraisal) => {
                const stateInfo = STATE_CONFIG[appraisal.state] ?? { label: appraisal.state, color: "bg-gray-100 text-gray-700" };
                return (
                  <tr key={appraisal.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {appraisal.employee_id.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {appraisal.department_id?.name ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {appraisal.job_id?.name ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {appraisal.date_close ? format(parseISO(appraisal.date_close), "MMM d, yyyy") : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${stateInfo.color}`}>
                        {stateInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        {appraisal.state === "1_new" && (
                          <button
                            onClick={() => handleConfirm(appraisal.id)}
                            disabled={confirmMutation.isPending}
                            className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100"
                          >
                            Send
                          </button>
                        )}
                        {appraisal.state === "2_pending" && (
                          <button
                            onClick={() => handleComplete(appraisal.id)}
                            disabled={completeMutation.isPending}
                            className="rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-600 hover:bg-green-100"
                          >
                            Complete
                          </button>
                        )}
                      </div>
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
