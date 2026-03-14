import { createFileRoute } from "@tanstack/react-router";

function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-2 text-gray-600">
        Welcome to the HR Admin panel. KPI widgets coming in plan 03.
      </p>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/")({
  component: DashboardPage,
});
