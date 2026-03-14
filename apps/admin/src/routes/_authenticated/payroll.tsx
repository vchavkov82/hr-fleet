import { createFileRoute } from "@tanstack/react-router";
import { PayrollPage } from "@/features/payroll";

export const Route = createFileRoute("/_authenticated/payroll")({
  component: PayrollPage,
});
