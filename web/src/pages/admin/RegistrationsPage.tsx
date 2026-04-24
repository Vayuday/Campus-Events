import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/client";
import type { EventItem } from "../../api/types";
import { PageHeader } from "../../components/PageHeader";
import { StatusBadge } from "../../components/StatusBadge";
import { fmtDate } from "../../lib/format";

export default function RegistrationsPage() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const eventsQ = useQuery({
    queryKey: ["admin-all-events"],
    queryFn: async () =>
      (await api.get<{ events: EventItem[] }>("/events?status=approved")).data
        .events,
    refetchInterval: 20_000,
  });

  const cats = useMemo(() => {
    const set = new Map<string, string>();
    (eventsQ.data ?? []).forEach((e) => {
      const c: any = e.category;
      if (c && c.id) set.set(c.id, c.name);
    });
    return Array.from(set, ([id, name]) => ({ id, name }));
  }, [eventsQ.data]);

  const events = (eventsQ.data ?? []).filter((e) => {
    if (categoryId && (e.category as any)?.id !== categoryId) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      e.title.toLowerCase().includes(q) ||
      e.venue.toLowerCase().includes(q) ||
      (e.organizer as any)?.name?.toLowerCase?.().includes(q)
    );
  });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <PageHeader
        title="Registrations monitor"
        subtitle="Approved events with live registration counts"
      />

      <div className="card p-4">
        <div className="flex flex-wrap gap-3 mb-4">
          <input
            className="input flex-1 min-w-[200px]"
            placeholder="Search title, venue, organizer"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="input w-auto"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">All categories</option>
            {cats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {eventsQ.isLoading ? (
          <div className="text-slate-500">Loading…</div>
        ) : events.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            No approved events match.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-slate-500 border-b border-slate-100">
                  <th className="py-2 pr-4">Event</th>
                  <th className="py-2 pr-4">Organizer</th>
                  <th className="py-2 pr-4">Category</th>
                  <th className="py-2 pr-4">Start</th>
                  <th className="py-2 pr-4">Filled</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => {
                  const filled = e.registeredCount ?? 0;
                  const pct = Math.min(100, Math.round((filled / e.capacity) * 100));
                  return (
                    <tr
                      key={e.id}
                      className="border-b border-slate-50 hover:bg-slate-50 align-top"
                    >
                      <td className="py-3 pr-4 font-medium text-slate-800">
                        {e.title}
                        <div className="text-xs text-slate-500 font-normal">
                          {e.venue}
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-slate-600">
                        {(e.organizer as any)?.name}
                      </td>
                      <td className="py-3 pr-4">
                        {(e.category as any)?.name ? (
                          <span className="badge-gray">
                            {(e.category as any).name}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-slate-600">
                        {fmtDate(e.startAt, "MMM d, h:mm a")}
                      </td>
                      <td className="py-3 pr-4 min-w-[180px]">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full bg-brand-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500">
                            {filled}/{e.capacity}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <StatusBadge status={e.status} />
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
