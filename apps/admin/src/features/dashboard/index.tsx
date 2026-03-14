import { Users, Clock, FileText, CalendarDays } from "lucide-react";
import { KPICard } from "@/components/shared/kpi-card";
import { useKPIData } from "./hooks";

export function Dashboard() {
  const { activeEmployees, totalEmployees, pendingLeaves, expiringContracts, isLoading } =
    useKPIData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your HR operations
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          icon={Users}
          label="Active Employees"
          value={activeEmployees}
          isLoading={isLoading}
        />
        <KPICard
          icon={Users}
          label="Total Employees"
          value={totalEmployees}
          isLoading={isLoading}
        />
        <KPICard
          icon={Clock}
          label="Pending Leave Requests"
          value={pendingLeaves}
          isLoading={isLoading}
        />
        <KPICard
          icon={FileText}
          label="Contracts"
          value={expiringContracts}
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <QuickAction icon={Users} label="Add Employee" href="/employees" />
            <QuickAction icon={CalendarDays} label="Leave Requests" href="/leave" />
            <QuickAction icon={FileText} label="Contracts" href="/contracts" />
            <QuickAction icon={Clock} label="Payroll" href="/payroll" />
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  icon: Icon,
  label,
  href,
}: {
  icon: typeof Users;
  label: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
    >
      <Icon className="h-4 w-4 text-gray-500" />
      {label}
    </a>
  );
}
