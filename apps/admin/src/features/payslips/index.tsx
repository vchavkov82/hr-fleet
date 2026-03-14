import { useState } from "react";
import { formatBGN } from "@/lib/format";
import { usePayslips, type Payslip } from "./hooks";
import { PayslipDetail } from "./payslip-detail";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  final: "bg-green-100 text-green-700",
};

export function PayslipsPage() {
  const { data: payslips, isLoading } = usePayslips();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Payslips</h1>

      {selectedId ? (
        <div className="mt-4">
          <button
            onClick={() => setSelectedId(null)}
            className="mb-3 text-sm text-blue-600 hover:underline"
          >
            &larr; Back to list
          </button>
          <PayslipDetail payslipId={selectedId} />
        </div>
      ) : isLoading ? (
        <p className="mt-4 text-sm text-gray-500">Loading payslips...</p>
      ) : !payslips?.length ? (
        <p className="mt-4 text-sm text-gray-500">No payslips found.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Employee</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Period</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Gross</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Net</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {payslips.map((slip: Payslip) => (
                <tr key={slip.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                    {slip.employee_name}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                    {slip.month}/{slip.year}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900">
                    {formatBGN(slip.gross)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900">
                    {formatBGN(slip.net)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[slip.status] ?? "bg-gray-100 text-gray-700"}`}
                    >
                      {slip.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    <button
                      onClick={() => setSelectedId(slip.id)}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </button>
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
