import { FormEvent, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api, apiErrorMessage } from "../../api/client";
import type { EventItem } from "../../api/types";
import { PageHeader } from "../../components/PageHeader";

export default function NotifyPage() {
  const [eventId, setEventId] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const eventsQ = useQuery({
    queryKey: ["organizer-events"],
    queryFn: async () =>
      (await api.get<{ events: EventItem[] }>("/events?mine=1")).data.events,
  });

  const sendM = useMutation({
    mutationFn: async () =>
      (
        await api.post<{ delivered: number }>(
          `/events/${eventId}/notify`,
          { title, body }
        )
      ).data,
    onSuccess: (d) => {
      toast.success(`Delivered to ${d.delivered} registrant(s)`);
      setTitle("");
      setBody("");
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!eventId) {
      toast.error("Pick an event");
      return;
    }
    sendM.mutate();
  }

  const events = (eventsQ.data ?? []).filter((e) => e.status === "approved");

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <PageHeader
        title="Send notification"
        subtitle="Message all registrants of one of your events"
      />

      <form className="card p-6 space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="label">Event</label>
          <select
            className="input"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            required
          >
            <option value="">Select an event…</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title}
              </option>
            ))}
          </select>
          {events.length === 0 && (
            <p className="text-xs text-slate-400 mt-1">
              You need an approved event to send notifications.
            </p>
          )}
        </div>

        <div>
          <label className="label">Title</label>
          <input
            className="input"
            required
            maxLength={120}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Reminder: doors open at 9am"
          />
        </div>
        <div>
          <label className="label">Message</label>
          <textarea
            className="input min-h-[120px]"
            required
            maxLength={1000}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Please bring your ID and ticket QR code."
          />
        </div>

        <div className="flex justify-end">
          <button
            className="btn-primary"
            type="submit"
            disabled={sendM.isPending}
          >
            {sendM.isPending ? "Sending…" : "Send notification"}
          </button>
        </div>
      </form>
    </div>
  );
}
