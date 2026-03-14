import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface KPICardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: { value: number; direction: "up" | "down" };
  className?: string;
  isLoading?: boolean;
}

export function KPICard({ icon: Icon, label, value, trend, className, isLoading }: KPICardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-gray-200 bg-white p-6 shadow-sm",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="rounded-md bg-blue-50 p-2">
          <Icon className="h-5 w-5 text-blue-600" />
        </div>
        {trend && (
          <span
            className={cn(
              "text-xs font-medium",
              trend.direction === "up" ? "text-green-600" : "text-red-600",
            )}
          >
            {trend.direction === "up" ? "+" : "-"}
            {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      {isLoading ? (
        <div className="mt-4 space-y-2">
          <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
        </div>
      ) : (
        <>
          <p className="mt-4 text-2xl font-bold text-gray-900">{value}</p>
          <p className="mt-1 text-sm text-gray-500">{label}</p>
        </>
      )}
    </div>
  );
}
