import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import toast from "react-hot-toast";
import { api, apiErrorMessage } from "../../api/client";
import { PageHeader } from "../../components/PageHeader";
import { fmtDate } from "../../lib/format";

interface VerifyResult {
  valid: boolean;
  alreadyCheckedIn: boolean;
  checkedInAt: string | null;
  student: { id: string; name: string; email: string } | null;
  event: { id: string; title: string; venue: string };
}

export default function ScannerPage() {
  const [scanning, setScanning] = useState(true);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onToken(token: string) {
    if (busy) return;
    setBusy(true);
    setError(null);
    setResult(null);
    setScanning(false);
    try {
      const { data } = await api.post<VerifyResult>("/tickets/verify", {
        token,
      });
      setResult(data);
      toast.success(
        data.alreadyCheckedIn ? "Already checked in" : "Check-in successful"
      );
    } catch (e) {
      setError(apiErrorMessage(e));
      toast.error(apiErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setResult(null);
    setError(null);
    setScanning(true);
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <PageHeader
        title="Scan tickets"
        subtitle="Point the camera at a student's ticket QR code"
        actions={
          !scanning && (
            <button className="btn-primary" onClick={reset}>
              Scan another
            </button>
          )
        }
      />

      {scanning ? (
        <div className="card overflow-hidden">
          <div className="aspect-square bg-slate-900">
            <Scanner
              onScan={(codes) => {
                const text = codes?.[0]?.rawValue;
                if (text) onToken(text);
              }}
              onError={(err) => {
                console.warn("scanner error", err);
              }}
              allowMultiple={false}
              scanDelay={400}
              styles={{ container: { width: "100%", height: "100%" } }}
            />
          </div>
          <div className="p-4 text-center text-sm text-slate-500">
            Waiting for a QR code…
          </div>
        </div>
      ) : error ? (
        <div className="card p-8 text-center border-rose-200">
          <div className="text-5xl text-rose-500 mb-3">×</div>
          <div className="font-semibold text-rose-700">Invalid ticket</div>
          <div className="text-sm text-slate-600 mt-1">{error}</div>
          <button className="btn-primary mt-6" onClick={reset}>
            Try again
          </button>
        </div>
      ) : result ? (
        <div className="card p-8 text-center">
          <div
            className={`text-5xl mb-3 ${result.alreadyCheckedIn ? "text-amber-500" : "text-emerald-500"}`}
          >
            {result.alreadyCheckedIn ? "!" : "✓"}
          </div>
          <div className="text-xl font-semibold text-slate-900">
            {result.alreadyCheckedIn ? "Already checked in" : "Checked in"}
          </div>
          <div className="mt-4 space-y-1 text-sm text-slate-600">
            <div>
              <span className="text-slate-400">Student:</span>{" "}
              <span className="font-medium text-slate-800">
                {result.student?.name}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Email:</span>{" "}
              {result.student?.email}
            </div>
            <div>
              <span className="text-slate-400">Event:</span> {result.event.title}
            </div>
            {result.checkedInAt && (
              <div>
                <span className="text-slate-400">Check-in time:</span>{" "}
                {fmtDate(result.checkedInAt, "MMM d, h:mm a")}
              </div>
            )}
          </div>
          <button className="btn-primary mt-6" onClick={reset}>
            Scan another
          </button>
        </div>
      ) : null}
    </div>
  );
}
