import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api, apiErrorMessage } from "../../api/client";
import type { Category, EventItem } from "../../api/types";
import { PageHeader } from "../../components/PageHeader";
import { StatusBadge } from "../../components/StatusBadge";
import { fmtDate } from "../../lib/format";
import { Modal } from "../../components/Modal";

export default function PendingEventsPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">(
    "pending"
  );
  const [rejecting, setRejecting] = useState<EventItem | null>(null);
  const [reason, setReason] = useState("");

  const q = useQuery({
    queryKey: ["admin-events", filter],
    queryFn: async () => {
      const params = filter === "all" ? "" : `?status=${filter}`;
      return (
        await api.get<{ events: EventItem[] }>(`/events${params}`)
      ).data.events;
    },
  });

  const reviewM = useMutation({
    mutationFn: async (args: {
      id: string;
      status: "approved" | "rejected";
      rejectionReason?: string;
    }) =>
      (
        await api.patch(`/events/${args.id}/review`, {
          status: args.status,
          rejectionReason: args.rejectionReason,
        })
      ).data,
    onSuccess: () => {
      toast.success("Decision recorded");
      setRejecting(null);
      setReason("");
      qc.invalidateQueries({ queryKey: ["admin-events"] });
      qc.invalidateQueries({ queryKey: ["admin-summary"] });
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  });

  const events = q.data ?? [];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <PageHeader
        title="Event approvals"
        subtitle="Review organizer submissions before they go live"
        actions={
          <div className="flex bg-white border border-slate-200 rounded-lg p-1 text-sm">
            {(["pending", "approved", "rejected", "all"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1 rounded-md capitalize ${
                  filter === s
                    ? "bg-brand-600 text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        }
      />

      {q.isLoading ? (
        <div className="text-slate-500">Loading…</div>
      ) : events.length === 0 ? (
        <div className="card p-10 text-center text-slate-400">
          No events in this view.
        </div>
      ) : (
        <div className="grid gap-4">
          {events.map((e) => {
            const org = e.organizer as { name: string; email: string };
            return (
              <div key={e.id} className="card p-5 flex gap-5">
                {e.posterUrl ? (
                  <img
                    src={e.posterUrl}
                    alt=""
                    className="h-24 w-24 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-lg bg-slate-100 flex items-center justify-center text-slate-300 flex-shrink-0">
                    —
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900">{e.title}</h3>
                      <div className="text-sm text-slate-500 mt-0.5">
                        {fmtDate(e.startAt)} · {e.venue}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        By {org?.name} ({org?.email})
                      </div>
                    </div>
                    <StatusBadge status={e.status} />
                  </div>
                  <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                    {e.description}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                    <span>Capacity {e.capacity}</span>
                    {(e.category as Category | null)?.name && (
                      <span className="badge-gray">
                        {(e.category as Category).name}
                      </span>
                    )}
                  </div>
                  {e.status === "rejected" && e.rejectionReason && (
                    <p className="text-xs text-rose-700 mt-2">
                      Reason: {e.rejectionReason}
                    </p>
                  )}
                  {e.status === "pending" && (
                    <div className="flex items-center gap-2 mt-4">
                      <button
                        className="btn-success"
                        onClick={() =>
                          reviewM.mutate({ id: e.id, status: "approved" })
                        }
                      >
                        Approve
                      </button>
                      <button
                        className="btn-danger"
                        onClick={() => setRejecting(e)}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={!!rejecting}
        onClose={() => setRejecting(null)}
        title="Reject event"
      >
        <div className="space-y-4">
          <div className="text-sm text-slate-600">
            Reason sent to organizer{rejecting ? `: ${rejecting.title}` : ""}.
          </div>
          <textarea
            className="input min-h-[100px]"
            placeholder="E.g., Venue conflict with another approved event"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <button className="btn-secondary" onClick={() => setRejecting(null)}>
              Cancel
            </button>
            <button
              className="btn-danger"
              onClick={() =>
                rejecting &&
                reviewM.mutate({
                  id: rejecting.id,
                  status: "rejected",
                  rejectionReason: reason,
                })
              }
            >
              Reject
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
