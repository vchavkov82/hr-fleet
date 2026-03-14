import { createFileRoute } from "@tanstack/react-router";
import { PayslipsPage } from "@/features/payslips";

export const Route = createFileRoute("/_authenticated/payslips")({
  component: PayslipsPage,
});
