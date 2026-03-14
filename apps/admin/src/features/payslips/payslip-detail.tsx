import { formatBGN } from "@/lib/format";
import { usePayslip, useDownloadPayslip } from "./hooks";

export function PayslipDetail({ payslipId }: { payslipId: string }) {
  const { data: slip, isLoading } = usePayslip(payslipId);
  const download = useDownloadPayslip();

  if (isLoading || !slip) {
    return <div className="p-4 text-sm text-gray-500">Loading payslip...</div>;
  }

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {slip.employee_name}
          </h2>
          <p className="text-sm text-gray-500">
            Period: {slip.month}/{slip.year}
          </p>
        </div>
        <button
          onClick={() => download.mutate(payslipId)}
          disabled={download.isPending}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {download.isPending ? "Downloading..." : "Download PDF"}
        </button>
      </div>

      <dl className="mt-6 divide-y divide-gray-100">
        <Row label="Gross Salary" value={formatBGN(slip.gross)} />
        <Row label="Social Security" value={`-${formatBGN(slip.social_security)}`} negative />
        <Row label="Health Insurance" value={`-${formatBGN(slip.health_insurance)}`} negative />
        <Row label="Income Tax" value={`-${formatBGN(slip.income_tax)}`} negative />
        <Row label="Net Salary" value={formatBGN(slip.net)} bold />
      </dl>
    </div>
  );
}

function Row({
  label,
  value,
  negative = false,
  bold = false,
}: {
  label: string;
  value: string;
  negative?: boolean;
  bold?: boolean;
}) {
  return (
    <div className="flex justify-between py-3">
      <dt className={`text-sm ${bold ? "font-semibold text-gray-900" : "text-gray-500"}`}>
        {label}
      </dt>
      <dd
        className={`text-sm ${bold ? "font-semibold text-gray-900" : negative ? "text-red-600" : "text-gray-900"}`}
      >
        {value}
      </dd>
    </div>
  );
}
