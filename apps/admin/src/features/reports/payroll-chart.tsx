import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatBGN } from "@/lib/format";
import type { PayrollMonth } from "./hooks";

interface Props {
  data: PayrollMonth[];
  isLoading: boolean;
}

function PayrollTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-white p-3 shadow-sm">
      <p className="mb-1 font-medium text-gray-900">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }} className="text-sm">
          {entry.name}: {formatBGN(entry.value)}
        </p>
      ))}
    </div>
  );
}

export function PayrollChart({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="flex h-80 items-center justify-center text-gray-500">
        Loading payroll data...
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex h-80 items-center justify-center text-gray-500">
        No payroll data for the selected period.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={380}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis tickFormatter={(v: number) => formatBGN(v)} width={100} />
        <Tooltip content={<PayrollTooltip />} />
        <Legend />
        <Bar dataKey="gross" name="Gross" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="net" name="Net" fill="#10b981" radius={[4, 4, 0, 0]} />
        <Bar
          dataKey="employer_cost"
          name="Employer Cost"
          fill="#f59e0b"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
