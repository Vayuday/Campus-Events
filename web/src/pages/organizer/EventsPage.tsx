import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api, apiErrorMessage } from "../../api/client";
import type { Category, EventItem } from "../../api/types";
import { PageHeader } from "../../components/PageHeader";
import { StatusBadge } from "../../components/StatusBadge";
import { Modal } from "../../components/Modal";
import { EventForm, EventFormValues } from "../../components/EventForm";
import { fmtDate } from "../../lib/format";

function toPayload(v: EventFormValues) {
  return {
    title: v.title,
    description: v.description,
    category: v.category || null,
    venue: v.venue,
    startAt: new Date(v.startAt).toISOString(),
    endAt: new Date(v.endAt).toISOString(),
    capacity: Number(v.capacity),
    posterUrl: v.posterUrl || undefined,
  };
}

export default function OrganizerEventsPage() {
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<EventItem | null>(null);

  const eventsQ = useQuery({
    queryKey: ["organizer-events"],
    queryFn: async () =>
      (await api.get<{ events: EventItem[] }>("/events?mine=1")).data.events,
  });

  const catsQ = useQuery({
    queryKey: ["categories"],
    queryFn: async () =>
      (await api.get<{ categories: Category[] }>("/categories")).data.categories,
  });

  const createM = useMutation({
    mutationFn: async (values: EventFormValues) =>
      (await api.post("/events", toPayload(values))).data,
    onSuccess: () => {
      toast.success("Event submitted for approval");
      setCreating(false);
      qc.invalidateQueries({ queryKey: ["organizer-events"] });
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  });

  const updateM = useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id: string;
      values: EventFormValues;
    }) => (await api.put(`/events/${id}`, toPayload(values))).data,
    onSuccess: () => {
      toast.success("Event updated");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["organizer-events"] });
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  });

  const deleteM = useMutation({
    mutationFn: async (id: string) =>
      (await api.delete(`/events/${id}`)).data,
    onSuccess: () => {
      toast.success("Event deleted");
      qc.invalidateQueries({ queryKey: ["organizer-events"] });
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  });

  const events = eventsQ.data ?? [];
  const cats = catsQ.data ?? [];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <PageHeader
        title="My Events"
        subtitle="Create events, track approval, and manage participants"
        actions={
          <button className="btn-primary" onClick={() => setCreating(true)}>
            + New event
          </button>
        }
      />

      {eventsQ.isLoading ? (
        <div className="text-slate-500">Loading…</div>
      ) : events.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="text-slate-400 mb-4">No events yet.</div>
          <button className="btn-primary" onClick={() => setCreating(true)}>
            Create your first event
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {events.map((e) => (
            <div key={e.id} className="card p-5 flex gap-5">
              {e.posterUrl ? (
                <img
                  src={e.posterUrl}
                  alt=""
                  className="h-28 w-28 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="h-28 w-28 rounded-lg bg-slate-100 flex items-center justify-center text-slate-300 text-2xl flex-shrink-0">
                  {e.title[0]?.toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">
                      {e.title}
                    </h3>
                    <div className="text-sm text-slate-500 mt-0.5">
                      {fmtDate(e.startAt)} · {e.venue}
                    </div>
                  </div>
                  <StatusBadge status={e.status} />
                </div>
                <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                  {e.description}
                </p>
                {e.status === "rejected" && e.rejectionReason && (
                  <p className="text-xs text-rose-700 mt-2">
                    Rejection reason: {e.rejectionReason}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-slate-500 mt-3">
                  <span>
                    {e.registeredCount ?? 0} / {e.capacity} registered
                  </span>
                  {(e.category as Category | null)?.name && (
                    <span className="badge-gray">
                      {(e.category as Category).name}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <Link
                    to={`/organizer/events/${e.id}/participants`}
                    className="btn-secondary"
                  >
                    Participants
                  </Link>
                  <button
                    className="btn-secondary"
                    onClick={() => setEditing(e)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-danger"
                    onClick={() => {
                      if (confirm("Delete this event and all registrations?"))
                        deleteM.mutate(e.id);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="Create event"
        size="lg"
      >
        <EventForm
          categories={cats}
          onSubmit={(v) => createM.mutateAsync(v)}
          onCancel={() => setCreating(false)}
          submitLabel="Submit for approval"
        />
      </Modal>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Edit event"
        size="lg"
      >
        {editing && (
          <EventForm
            initial={editing}
            categories={cats}
            onSubmit={(v) =>
              updateM.mutateAsync({ id: editing.id, values: v })
            }
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>
    </div>
  );
}
