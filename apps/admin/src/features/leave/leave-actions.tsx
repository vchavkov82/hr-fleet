import { useState } from "react";
import { useApproveLeave, useRejectLeave } from "./hooks";
import { useHasPermission } from "@/auth/hooks";

interface LeaveActionsProps {
  requestId: number;
  status?: string;
}

export function LeaveActions({ requestId, status }: LeaveActionsProps) {
  const canApprove = useHasPermission("leave:approve");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [reason, setReason] = useState("");
  const approve = useApproveLeave();
  const reject = useRejectLeave();

  if (!canApprove || status !== "confirm") return null;

  const handleApprove = () => {
    approve.mutate(requestId);
  };

  const handleReject = () => {
    reject.mutate({ id: requestId, reason: reason || undefined });
    setShowRejectDialog(false);
    setReason("");
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleApprove}
        disabled={approve.isPending}
        className="rounded-md bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
      >
        {approve.isPending ? "..." : "Approve"}
      </button>
      <button
        onClick={() => setShowRejectDialog(true)}
        disabled={reject.isPending}
        className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
      >
        Reject
      </button>

      {showRejectDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">
              Reject Leave Request
            </h3>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                Reason (optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                placeholder="Enter reason for rejection..."
              />
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRejectDialog(false);
                  setReason("");
                }}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={reject.isPending}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {reject.isPending ? "Rejecting..." : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
