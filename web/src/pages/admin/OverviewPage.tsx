import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/client";
import { PageHeader } from "../../components/PageHeader";

interface Summary {
  totalEvents: number;
  pending: number;
  approved: number;
  rejected: number;
  totalUsers: number;
  totalRegistrations: number;
}

export default function OverviewPage() {
  const q = useQuery({
    queryKey: ["admin-summary"],
    queryFn: async () =>
      (await api.get<Summary>("/reports/summary")).data,
    refetchInterval: 15_000,
  });

  const cards = [
    { label: "Total events", value: q.data?.totalEvents, accent: "text-brand-700" },
    { label: "Pending", value: q.data?.pending, accent: "text-amber-700" },
    { label: "Approved", value: q.data?.approved, accent: "text-emerald-700" },
    { label: "Rejected", value: q.data?.rejected, accent: "text-rose-700" },
    { label: "Users", value: q.data?.totalUsers, accent: "text-slate-700" },
    {
      label: "Registrations",
      value: q.data?.totalRegistrations,
      accent: "text-brand-700",
    },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <PageHeader
        title="Overview"
        subtitle="Live view of platform activity"
      />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="card p-6">
            <div className="text-sm text-slate-500">{c.label}</div>
            <div className={`text-3xl font-semibold mt-2 ${c.accent}`}>
              {q.isLoading ? "—" : (c.value ?? 0)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
