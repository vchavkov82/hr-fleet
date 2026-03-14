import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  DollarSign,
  FileText,
  FileSignature,
  CalendarDays,
  BarChart3,
  UserCog,
  ShieldCheck,
  Settings,
} from "lucide-react";
import { useHasPermission } from "@/auth/hooks";

interface NavItem {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard },
  { label: "Employees", to: "/employees", icon: Users, permission: "employees:read" },
  { label: "Payroll", to: "/payroll", icon: DollarSign, permission: "payroll:read" },
  { label: "Payslips", to: "/payslips", icon: FileText, permission: "payroll:read" },
  { label: "Contracts", to: "/contracts", icon: FileSignature, permission: "employees:read" },
  { label: "Leave", to: "/leave", icon: CalendarDays, permission: "employees:read" },
  { label: "Reports", to: "/reports", icon: BarChart3, permission: "reports:read" },
  { label: "Users & Roles", to: "/users", icon: UserCog, permission: "users:manage" },
  { label: "Audit Log", to: "/audit", icon: ShieldCheck, permission: "audit:read" },
  { label: "Settings", to: "/settings", icon: Settings, permission: "settings:write" },
];

function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
        isActive
          ? "bg-blue-50 text-blue-700"
          : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {item.label}
    </Link>
  );
}

export function Sidebar() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r bg-white">
      <div className="flex h-14 items-center border-b px-4">
        <span className="text-lg font-bold text-gray-900">HR Admin</span>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV_ITEMS.map((item) => (
          <SidebarItem key={item.to} item={item} currentPath={currentPath} />
        ))}
      </nav>
    </aside>
  );
}

function SidebarItem({
  item,
  currentPath,
}: {
  item: NavItem;
  currentPath: string;
}) {
  const hasAccess = useHasPermission(item.permission ?? "");
  // Items without permission are visible to all authenticated users
  if (item.permission && !hasAccess) return null;

  const isActive =
    item.to === "/" ? currentPath === "/" : currentPath.startsWith(item.to);

  return <NavLink item={item} isActive={isActive} />;
}
