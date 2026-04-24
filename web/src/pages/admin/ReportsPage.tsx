import { api, getToken } from "../../api/client";
import { PageHeader } from "../../components/PageHeader";
import toast from "react-hot-toast";

interface ReportDef {
  path: string;
  title: string;
  description: string;
  filename: string;
}

const reports: ReportDef[] = [
  {
    path: "/reports/participation",
    title: "Participation by event",
    description:
      "Every event with capacity, registration count, check-in count, fill rate.",
    filename: "participation.csv",
  },
  {
    path: "/reports/categories",
    title: "Activity by category",
    description: "Events and registration totals grouped by category.",
    filename: "categories.csv",
  },
];

async function download(path: string, filename: string) {
  const token = getToken();
  try {
    const res = await fetch(`${api.defaults.baseURL}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Download failed (${res.status})`);
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success("Downloaded");
  } catch (e) {
    toast.error(e instanceof Error ? e.message : "Download failed");
  }
}

export default function ReportsPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <PageHeader
        title="Reports"
        subtitle="Download CSV reports for analysis"
      />

      <div className="grid md:grid-cols-2 gap-4">
        {reports.map((r) => (
          <div key={r.path} className="card p-6 flex flex-col">
            <h3 className="font-semibold text-slate-900">{r.title}</h3>
            <p className="text-sm text-slate-500 mt-1 flex-1">
              {r.description}
            </p>
            <button
              className="btn-primary mt-4 self-start"
              onClick={() => download(r.path, r.filename)}
            >
              Download CSV
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
