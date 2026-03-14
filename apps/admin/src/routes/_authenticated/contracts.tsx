import { createFileRoute } from "@tanstack/react-router";
import { ContractsPage } from "@/features/contracts";

export const Route = createFileRoute("/_authenticated/contracts")({
  component: ContractsPage,
});
