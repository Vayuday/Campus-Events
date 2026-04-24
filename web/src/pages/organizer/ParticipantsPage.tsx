import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api, getToken } from "../../api/client";
import type { EventItem, Registration, RegistrationStudent } from "../../api/types";
import { PageHeader } from "../../components/PageHeader";
import { fmtDate } from "../../lib/format";

export default function ParticipantsPage() {
  const { id } = useParams<{ id: string }>();
  const [search, setSearch] = useState("");

  const eventQ = useQuery({
    queryKey: ["event", id],
    queryFn: async () =>
      (await api.get<{ event: EventItem }>(`/events/${id}`)).data.event,
    enabled: !!id,
  });

  const partsQ = useQuery({
    queryKey: ["participants", id],
    queryFn: async () =>
      (
        await api.get<{ registrations: Registration[] }>(
          `/events/${id}/participants`
        )
      ).data.registrations,
    enabled: !!id,
  });

  const event = eventQ.data;
  const parts = partsQ.data ?? [];
  const filtered = parts.filter((p) => {
    if (!search) return true;
    const s = p.student as RegistrationStudent;
    const q = search.toLowerCase();
    return (
      s.name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      p.ticketCode.toLowerCase().includes(q)
    );
  });

  async function downloadCsv() {
    const token = getToken();
    const url = `${api.defaults.baseURL}/reports/events/${id}/registrations`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `event-${id}-registrations.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-2">
        <Link to="/organizer" className="text-sm text-brand-600 hover:text-brand-700">
          ← Back to events
        </Link>
      </div>
      <PageHeader
        title={event?.title ?? "Participants"}
        subtitle={
          event
            ? `${fmtDate(event.startAt)} · ${event.venue} · ${parts.length} / ${event.capacity} registered`
            : undefined
        }
        actions={
          <button className="btn-secondary" onClick={downloadCsv}>
            Download CSV
          </button>
        }
      />

      <div className="card p-4">
        <input
          className="input mb-4"
          placeholder="Search by name, email, or ticket code"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {partsQ.isLoading ? (
          <div className="text-slate-500">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            No participants yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-slate-500 border-b border-slate-100">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Ticket</th>
                  <th className="py-2 pr-4">Registered</th>
                  <th className="py-2 pr-4">Check-in</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const s = p.student as RegistrationStudent;
                  return (
                    <tr
                      key={p.id}
                      className="border-b border-slate-50 hover:bg-slate-50"
                    >
                      <td className="py-2 pr-4 font-medium text-slate-800">
                        {s.name}
                      </td>
                      <td className="py-2 pr-4 text-slate-600">{s.email}</td>
                      <td className="py-2 pr-4 font-mono text-xs text-slate-500">
                        {p.ticketCode.slice(0, 8)}…
                      </td>
                      <td className="py-2 pr-4 text-slate-600">
                        {fmtDate(p.createdAt, "MMM d, h:mm a")}
                      </td>
                      <td className="py-2 pr-4">
                        {p.checkedInAt ? (
                          <span className="badge-green">
                            {fmtDate(p.checkedInAt, "MMM d, h:mm a")}
                          </span>
                        ) : (
                          <span className="badge-gray">Not checked in</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
