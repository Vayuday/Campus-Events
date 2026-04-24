import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api, apiErrorMessage } from "../../api/client";
import type { Category, EventItem } from "../../api/types";
import { fmtDate } from "../../lib/format";

interface DetailResponse {
  event: EventItem;
  alreadyRegistered: boolean;
}

export default function StudentEventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const nav = useNavigate();

  const q = useQuery({
    queryKey: ["student-event", id],
    queryFn: async () =>
      (await api.get<DetailResponse>(`/events/${id}`)).data,
    enabled: !!id,
  });

  const registerM = useMutation({
    mutationFn: async () =>
      (await api.post<{ registration: { id: string } }>(
        `/events/${id}/register`
      )).data,
    onSuccess: (d) => {
      toast.success("Registered! Your ticket is ready.");
      qc.invalidateQueries({ queryKey: ["student-event", id] });
      qc.invalidateQueries({ queryKey: ["student-tickets"] });
      nav(`/student/tickets/${d.registration.id}`);
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  });

  const cancelM = useMutation({
    mutationFn: async () =>
      (await api.delete(`/events/${id}/register`)).data,
    onSuccess: () => {
      toast.success("Registration cancelled");
      qc.invalidateQueries({ queryKey: ["student-event", id] });
      qc.invalidateQueries({ queryKey: ["student-tickets"] });
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  });

  if (q.isLoading) {
    return <div className="p-8 text-slate-500">Loading…</div>;
  }
  if (!q.data) {
    return (
      <div className="p-8">
        <p className="text-slate-500">Event not found.</p>
        <Link to="/student" className="text-brand-600 hover:text-brand-700">
          ← Back to events
        </Link>
      </div>
    );
  }

  const { event, alreadyRegistered } = q.data;
  const filled = event.registeredCount ?? 0;
  const spotsLeft = Math.max(0, event.capacity - filled);
  const isFull = filled >= event.capacity;
  const ended = new Date(event.endAt) < new Date();

  return (
    <div>
      {event.posterUrl ? (
        <img
          src={event.posterUrl}
          alt=""
          className="w-full h-64 object-cover"
        />
      ) : (
        <div className="w-full h-64 bg-gradient-to-br from-brand-100 to-brand-50 grid place-items-center text-brand-600 text-7xl font-bold">
          {event.title[0]?.toUpperCase()}
        </div>
      )}

      <div className="max-w-4xl mx-auto p-8 -mt-14">
        <div className="card p-8">
          <Link
            to="/student"
            className="text-sm text-brand-600 hover:text-brand-700"
          >
            ← Back to events
          </Link>

          {(event.category as Category | null)?.name && (
            <div className="text-xs font-bold uppercase tracking-wider text-brand-600 mt-4">
              {(event.category as Category).name}
            </div>
          )}
          <h1 className="text-3xl font-bold text-slate-900 mt-1">
            {event.title}
          </h1>
          <div className="mt-2 text-slate-600">
            <div>{fmtDate(event.startAt, "EEEE, MMM d · h:mm a")}</div>
            <div>{event.venue}</div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-6">
            <Stat label="Capacity" value={String(event.capacity)} />
            <Stat label="Registered" value={String(filled)} />
            <Stat label="Spots left" value={String(spotsLeft)} />
          </div>

          <div className="mt-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              About
            </h2>
            <p className="text-slate-700 whitespace-pre-line leading-relaxed">
              {event.description}
            </p>
          </div>

          <div className="mt-8 flex gap-3">
            {alreadyRegistered ? (
              <>
                <Link to="/student/tickets" className="btn-primary">
                  View my tickets
                </Link>
                <button
                  className="btn-secondary"
                  onClick={() => {
                    if (
                      confirm(
                        "Cancel registration? You can re-register if seats are still available."
                      )
                    )
                      cancelM.mutate();
                  }}
                  disabled={cancelM.isPending}
                >
                  Cancel registration
                </button>
              </>
            ) : ended ? (
              <button className="btn-primary" disabled>
                Event ended
              </button>
            ) : isFull ? (
              <button className="btn-primary" disabled>
                Event is full
              </button>
            ) : (
              <button
                className="btn-primary"
                onClick={() => registerM.mutate()}
                disabled={registerM.isPending}
              >
                {registerM.isPending ? "Registering…" : "Register for this event"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-xs text-slate-500 uppercase tracking-wide mt-0.5">
        {label}
      </div>
    </div>
  );
}
