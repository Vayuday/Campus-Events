import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { api } from "../../api/client";
import type { NotificationItem } from "../../api/types";
import { PageHeader } from "../../components/PageHeader";
import { fmtRel } from "../../lib/format";

interface InboxResponse {
  notifications: NotificationItem[];
  unread: number;
}

export default function StudentNotificationsPage() {
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: ["student-notifications"],
    queryFn: async () =>
      (await api.get<InboxResponse>("/notifications")).data,
    refetchInterval: 20_000,
  });

  const markM = useMutation({
    mutationFn: async (id: string) =>
      (await api.post(`/notifications/${id}/read`)).data,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["student-notifications"] }),
  });

  const markAllM = useMutation({
    mutationFn: async () => (await api.post("/notifications/read-all")).data,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["student-notifications"] }),
  });

  const list = q.data?.notifications ?? [];
  const unread = q.data?.unread ?? 0;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <PageHeader
        title="Inbox"
        subtitle={unread > 0 ? `${unread} unread` : "All caught up"}
        actions={
          unread > 0 && (
            <button
              className="btn-secondary"
              onClick={() => markAllM.mutate()}
              disabled={markAllM.isPending}
            >
              Mark all read
            </button>
          )
        }
      />

      {q.isLoading ? (
        <div className="text-slate-500">Loading…</div>
      ) : list.length === 0 ? (
        <div className="card p-10 text-center text-slate-400">
          No notifications yet. Register for events and organizers will be able
          to message you.
        </div>
      ) : (
        <div className="space-y-2">
          {list.map((n) => {
            const isUnread = !n.readAt;
            return (
              <button
                key={n.id}
                onClick={() => isUnread && markM.mutate(n.id)}
                className={clsx(
                  "card p-4 w-full text-left transition flex gap-3 items-start",
                  isUnread && "bg-brand-50 border-brand-200"
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-900">{n.title}</div>
                  <div className="text-sm text-slate-600 mt-1">{n.body}</div>
                  <div className="text-xs text-slate-400 mt-2">
                    {fmtRel(n.createdAt)}
                  </div>
                </div>
                {isUnread && (
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-600 mt-1.5 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
