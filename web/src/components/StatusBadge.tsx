import type { EventStatus } from "../api/types";

export function StatusBadge({ status }: { status: EventStatus }) {
  if (status === "approved") return <span className="badge-green">Approved</span>;
  if (status === "pending") return <span className="badge-yellow">Pending</span>;
  return <span className="badge-red">Rejected</span>;
}
