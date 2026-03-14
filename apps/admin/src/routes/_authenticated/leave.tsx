import { createFileRoute } from "@tanstack/react-router";
import { LeavePage } from "@/features/leave";

export const Route = createFileRoute("/_authenticated/leave")({
  component: LeavePage,
});
