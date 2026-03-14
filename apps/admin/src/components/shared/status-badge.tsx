import { cn } from "@/lib/utils";

type BadgeVariant = "success" | "warning" | "error" | "info" | "neutral";

interface StatusBadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  error: "bg-red-100 text-red-800",
  info: "bg-blue-100 text-blue-800",
  neutral: "bg-gray-100 text-gray-800",
};

export function StatusBadge({ variant, children, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Map common status strings to badge variants. */
export function statusToVariant(status: string): BadgeVariant {
  switch (status.toLowerCase()) {
    case "active":
    case "approved":
    case "done":
      return "success";
    case "pending":
    case "draft":
      return "warning";
    case "inactive":
    case "rejected":
    case "cancelled":
      return "error";
    case "new":
    case "open":
      return "info";
    default:
      return "neutral";
  }
}
