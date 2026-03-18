import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/attendance")({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/attendance"!</div>
}
