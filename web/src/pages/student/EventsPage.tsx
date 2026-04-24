import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/client";
import type { Category, EventItem } from "../../api/types";
import { PageHeader } from "../../components/PageHeader";
import { fmtDate } from "../../lib/format";

export default function StudentEventsPage() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const eventsQ = useQuery({
    queryKey: ["student-events", search, categoryId],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (categoryId) params.category = categoryId;
      const res = await api.get<{ events: EventItem[] }>("/events", { params });
      return res.data.events;
    },
  });

  const catsQ = useQuery({
    queryKey: ["categories"],
    queryFn: async () =>
      (await api.get<{ categories: Category[] }>("/categories")).data
        .categories,
  });

  const events = eventsQ.data ?? [];
  const cats = catsQ.data ?? [];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <PageHeader
        title="Campus events"
        subtitle="Browse upcoming events and grab a digital ticket"
      />

      <div className="card p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <input
            className="input flex-1 min-w-[220px]"
            placeholder="Search events, venues…"
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
      </div>

      {eventsQ.isLoading ? (
        <div className="text-slate-500">Loading…</div>
      ) : events.length === 0 ? (
        <div className="card p-10 text-center text-slate-400">
          No events match your search.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {events.map((e) => {
            const filled = e.registeredCount ?? 0;
            const pct = Math.min(100, Math.round((filled / e.capacity) * 100));
            return (
              <Link
                key={e.id}
                to={`/student/events/${e.id}`}
                className="card overflow-hidden hover:shadow-lg transition block"
              >
                {e.posterUrl ? (
                  <img
                    src={e.posterUrl}
                    alt=""
                    className="h-40 w-full object-cover"
                  />
                ) : (
                  <div className="h-40 w-full bg-gradient-to-br from-brand-100 to-brand-50 grid place-items-center text-brand-600 text-4xl font-bold">
                    {e.title[0]?.toUpperCase()}
                  </div>
                )}
                <div className="p-5">
                  {(e.category as Category | null)?.name && (
                    <div className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-1">
                      {(e.category as Category).name}
                    </div>
                  )}
                  <h3 className="font-semibold text-slate-900 text-lg leading-tight">
                    {e.title}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {fmtDate(e.startAt)}
                  </p>
                  <p className="text-sm text-slate-500">{e.venue}</p>

                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-brand-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500">
                      {filled}/{e.capacity}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
