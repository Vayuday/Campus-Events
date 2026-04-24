import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/client";
import type { EventItem, Registration } from "../../api/types";
import { fmtDate } from "../../lib/format";

interface TicketResponse {
  ticket: {
    token: string;
    qr: string;
    registration: Registration;
    event: EventItem;
  };
}

export default function StudentTicketDetailPage() {
  const { registrationId } = useParams<{ registrationId: string }>();

  const q = useQuery({
    queryKey: ["ticket", registrationId],
    queryFn: async () =>
      (await api.get<TicketResponse>(`/tickets/${registrationId}`)).data.ticket,
    enabled: !!registrationId,
  });

  if (q.isLoading) {
    return <div className="p-8 text-slate-500">Loading ticket…</div>;
  }
  if (!q.data) {
    return <div className="p-8 text-slate-500">Ticket not found.</div>;
  }

  const { event, registration, qr } = q.data;
  const isCheckedIn = !!registration.checkedInAt;
  const shortCode = registration.ticketCode.slice(0, 8).toUpperCase();

  return (
    <div className="min-h-full bg-slate-50 p-6 py-10">
      <div className="max-w-md mx-auto">
        <Link
          to="/student/tickets"
          className="text-sm text-brand-600 hover:text-brand-700 block mb-4"
        >
          ← Back to tickets
        </Link>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-brand-600 text-white p-6">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-brand-100">
              Campus Events · Ticket
            </div>
            <h1 className="text-xl font-bold mt-2 leading-tight">
              {event.title}
            </h1>
            <div className="text-sm text-brand-100 mt-2">
              {fmtDate(event.startAt, "EEE, MMM d · h:mm a")}
            </div>
            <div className="text-sm text-brand-100">{event.venue}</div>
          </div>

          <div className="relative">
            <div className="absolute left-0 -translate-x-1/2 top-0 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-50" />
            <div className="absolute right-0 translate-x-1/2 top-0 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-50" />
            <div className="border-t-2 border-dashed border-slate-200 mx-6" />
          </div>

          <div className="p-8 flex flex-col items-center">
            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <img src={qr} alt="Ticket QR code" className="w-60 h-60" />
            </div>
            <div className="mt-4 font-mono text-lg font-bold tracking-[0.3em] text-slate-900">
              {shortCode}
            </div>

            {isCheckedIn ? (
              <div className="mt-4 badge-green">
                Checked in · {fmtDate(registration.checkedInAt!, "MMM d, h:mm a")}
              </div>
            ) : (
              <div className="mt-4 text-sm text-slate-500 text-center">
                Show this at the event entrance
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
