import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/timesheets")({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/timesheets"!</div>
}
