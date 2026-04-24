import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/client";
import { PageHeader } from "../../components/PageHeader";

interface TicketsSummary {
  upcoming: { id: string }[];
  past: { id: string }[];
}

export default function StudentProfilePage() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const ticketsQ = useQuery({
    queryKey: ["student-tickets"],
    queryFn: async () =>
      (await api.get<TicketsSummary>("/me/registrations")).data,
  });

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <PageHeader title="Profile" subtitle="Your account" />

      <div className="card p-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-brand-600 text-white grid place-items-center font-bold text-2xl">
            {user?.name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div>
            <div className="text-xl font-semibold text-slate-900">
              {user?.name}
            </div>
            <div className="text-sm text-slate-500">{user?.email}</div>
            <div className="mt-1">
              <span className="badge-blue capitalize">{user?.role}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-slate-100">
          <Stat
            label="Upcoming tickets"
            value={ticketsQ.data?.upcoming.length ?? 0}
          />
          <Stat
            label="Past events"
            value={ticketsQ.data?.past.length ?? 0}
          />
        </div>
      </div>

      <div className="card p-6 mt-6">
        <h2 className="font-semibold text-slate-900">Sign out</h2>
        <p className="text-sm text-slate-500 mt-1">
          You'll need to log in again to browse events or view tickets.
        </p>
        <button
          className="btn-danger mt-4"
          onClick={() => {
            if (confirm("Sign out of Campus Events?")) {
              logout();
              nav("/login", { replace: true });
            }
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-xs text-slate-500 uppercase tracking-wide mt-0.5">
        {label}
      </div>
    </div>
  );
}
