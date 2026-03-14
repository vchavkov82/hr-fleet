import { useState } from "react";
import { useHasPermission } from "@/auth/hooks";
import { usePayrollReport, useTaxReport, useExportReport } from "./hooks";
import { PayrollChart } from "./payroll-chart";
import { TaxChart } from "./tax-chart";

type Tab = "payroll" | "tax";

function getDefaultDateRange() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

export function ReportsPage() {
  const canView = useHasPermission("reports:read");
  const [tab, setTab] = useState<Tab>("payroll");
  const [dateRange, setDateRange] = useState(getDefaultDateRange);

  const payroll = usePayrollReport(dateRange);
  const tax = useTaxReport(dateRange);
  const exportPayroll = useExportReport("payroll", dateRange);
  const exportTax = useExportReport("tax", dateRange);

  if (!canView) {
    return (
      <div className="p-6 text-center text-gray-500">
        You do not have permission to view reports.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <button
          type="button"
          onClick={tab === "payroll" ? exportPayroll : exportTax}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Export CSV
        </button>
      </div>

      {/* Date range picker */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700">
          From
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, from: e.target.value }))
            }
            className="ml-2 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          />
        </label>
        <label className="text-sm font-medium text-gray-700">
          To
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, to: e.target.value }))
            }
            className="ml-2 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          />
        </label>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {(["payroll", "tax"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`border-b-2 px-1 py-3 text-sm font-medium ${
                tab === t
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              {t === "payroll" ? "Payroll Summary" : "Tax Liabilities"}
            </button>
          ))}
        </nav>
      </div>

      {/* Chart */}
      <div className="rounded-lg border bg-white p-6">
        {tab === "payroll" ? (
          <PayrollChart data={payroll.data ?? []} isLoading={payroll.isLoading} />
        ) : (
          <TaxChart data={tax.data ?? []} isLoading={tax.isLoading} />
        )}
      </div>
    </div>
  );
}
