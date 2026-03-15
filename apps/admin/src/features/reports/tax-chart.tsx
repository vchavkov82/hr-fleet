import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatBGN } from "@/lib/format";
import type { TaxBreakdown } from "./hooks";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

interface Props {
  data: TaxBreakdown[];
  isLoading: boolean;
}

function TaxTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
}) {
  if (!active || !payload?.length) return null;
  const entry = payload?.[0];
  if (!entry) return null;
  return (
    <div className="rounded-lg border bg-white p-3 shadow-sm">
      <p className="font-medium text-gray-900">{entry.name}</p>
      <p className="text-sm text-gray-600">{formatBGN(entry.value)}</p>
    </div>
  );
}

export function TaxChart({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="flex h-80 items-center justify-center text-gray-500">
        Loading tax data...
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex h-80 items-center justify-center text-gray-500">
        No tax data for the selected period.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={380}>
      <PieChart>
        <Pie
          data={data}
          dataKey="amount"
          nameKey="category"
          cx="50%"
          cy="50%"
          outerRadius={140}
          label={({ category, percent }: { category: string; percent: number }) =>
            `${category} ${(percent * 100).toFixed(0)}%`
          }
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<TaxTooltip />} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
