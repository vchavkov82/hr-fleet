import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/training")({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/training"!</div>
}
