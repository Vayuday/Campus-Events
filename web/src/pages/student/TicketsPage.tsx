import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { api } from "../../api/client";
import type { EventItem, Registration } from "../../api/types";
import { PageHeader } from "../../components/PageHeader";
import { fmtDate } from "../../lib/format";

interface TicketsResponse {
  upcoming: Registration[];
  past: Registration[];
}

export default function StudentTicketsPage() {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  const q = useQuery({
    queryKey: ["student-tickets"],
    queryFn: async () =>
      (await api.get<TicketsResponse>("/me/registrations")).data,
  });

  const upcomingCount = q.data?.upcoming.length ?? 0;
  const pastCount = q.data?.past.length ?? 0;
  const list = tab === "upcoming" ? q.data?.upcoming ?? [] : q.data?.past ?? [];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <PageHeader
        title="My tickets"
        subtitle="Your digital tickets with QR codes for entry"
      />

      <div className="flex bg-white border border-slate-200 rounded-lg p-1 text-sm mb-6 w-fit">
        <TabBtn
          label={`Upcoming (${upcomingCount})`}
          active={tab === "upcoming"}
          onClick={() => setTab("upcoming")}
        />
        <TabBtn
          label={`Past (${pastCount})`}
          active={tab === "past"}
          onClick={() => setTab("past")}
        />
      </div>

      {q.isLoading ? (
        <div className="text-slate-500">Loading…</div>
      ) : list.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="text-slate-400">
            {tab === "upcoming"
              ? "No upcoming tickets yet."
              : "No past events."}
          </div>
          {tab === "upcoming" && (
            <Link to="/student" className="btn-primary mt-4 inline-block">
              Browse events
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {list.map((r) => {
            const ev = r.event as EventItem;
            return (
              <Link
                key={r.id}
                to={`/student/tickets/${r.id}`}
                className="card p-5 hover:shadow-lg transition flex items-center gap-4"
              >
                {ev.posterUrl ? (
                  <img
                    src={ev.posterUrl}
                    alt=""
                    className="h-20 w-20 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-lg bg-brand-100 text-brand-600 grid place-items-center text-2xl font-bold flex-shrink-0">
                    {ev.title[0]?.toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 truncate">
                    {ev.title}
                  </h3>
                  <div className="text-sm text-slate-500 mt-0.5">
                    {fmtDate(ev.startAt)}
                  </div>
                  <div className="text-sm text-slate-500">{ev.venue}</div>
                  <div className="mt-2">
                    {r.checkedInAt ? (
                      <span className="badge-green">
                        Checked in · {fmtDate(r.checkedInAt, "MMM d, h:mm a")}
                      </span>
                    ) : tab === "upcoming" ? (
                      <span className="badge-blue">Tap to view QR</span>
                    ) : (
                      <span className="badge-gray">Did not check in</span>
                    )}
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

function TabBtn({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "px-4 py-1.5 rounded-md font-medium",
        active ? "bg-brand-600 text-white" : "text-slate-600 hover:text-slate-900"
      )}
    >
      {label}
    </button>
  );
}
