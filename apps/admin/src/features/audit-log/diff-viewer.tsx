import { cn } from "@/lib/utils";

interface DiffViewerProps {
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
}

type ChangeType = "added" | "removed" | "changed" | "unchanged";

interface DiffLine {
  key: string;
  type: ChangeType;
  oldVal?: unknown;
  newVal?: unknown;
}

function computeDiff(
  oldObj: Record<string, unknown> | null,
  newObj: Record<string, unknown> | null,
): DiffLine[] {
  const old = oldObj ?? {};
  const next = newObj ?? {};
  const allKeys = new Set([...Object.keys(old), ...Object.keys(next)]);
  const lines: DiffLine[] = [];

  for (const key of allKeys) {
    const hasOld = key in old;
    const hasNew = key in next;

    if (!hasOld && hasNew) {
      lines.push({ key, type: "added", newVal: next[key] });
    } else if (hasOld && !hasNew) {
      lines.push({ key, type: "removed", oldVal: old[key] });
    } else if (JSON.stringify(old[key]) !== JSON.stringify(next[key])) {
      lines.push({ key, type: "changed", oldVal: old[key], newVal: next[key] });
    }
  }

  return lines;
}

const typeStyles: Record<ChangeType, string> = {
  added: "bg-green-50 text-green-800",
  removed: "bg-red-50 text-red-800",
  changed: "bg-yellow-50 text-yellow-800",
  unchanged: "",
};

function formatValue(val: unknown): string {
  if (val === null || val === undefined) return "null";
  if (typeof val === "object") return JSON.stringify(val);
  return String(val);
}

export function DiffViewer({ oldValue, newValue }: DiffViewerProps) {
  const lines = computeDiff(oldValue, newValue);

  if (lines.length === 0) {
    return <p className="text-sm text-gray-500 italic">No changes detected</p>;
  }

  return (
    <div className="overflow-hidden rounded border border-gray-200 text-xs font-mono">
      {lines.map((line) => (
        <div
          key={line.key}
          className={cn("flex items-start gap-3 px-3 py-1.5", typeStyles[line.type])}
        >
          <span className="font-semibold min-w-[120px]">{line.key}</span>
          {line.type === "added" && (
            <span>+ {formatValue(line.newVal)}</span>
          )}
          {line.type === "removed" && (
            <span>- {formatValue(line.oldVal)}</span>
          )}
          {line.type === "changed" && (
            <span>
              {formatValue(line.oldVal)} {"->"} {formatValue(line.newVal)}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
