import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Bell, Package, CheckCircle2, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { getNotifications, markNotificationRead } from "@/api/notifications";
import { Dropdown } from "@/components/ui/Dropdown";
import { timeAgo, cn } from "@/lib/utils";

const iconByType = {
  NEW_REQUEST: Package,
  REQUEST_ACCEPTED: CheckCircle2,
  REQUEST_REJECTED: XCircle,
};

export function NotificationBell() {
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    refetchInterval: 30000,
  });

  const markRead = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const recent = notifications.slice(0, 5);

  return (
    <Dropdown
      trigger={
        <button
          className="relative flex h-10 w-10 items-center justify-center rounded-lg text-ink-600 hover:bg-ink-100"
          aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      }
      className="w-80"
    >
      <div className="flex items-center justify-between px-3.5 py-2">
        <span className="text-sm font-semibold text-ink-900">Notifications</span>
        {unreadCount > 0 && <span className="text-xs text-brand-600">{unreadCount} new</span>}
      </div>
      <div className="max-h-80 overflow-y-auto">
        {recent.length === 0 ? (
          <p className="px-3.5 py-6 text-center text-sm text-ink-400">You're all caught up.</p>
        ) : (
          recent.map((n) => {
            const Icon = iconByType[n.type] || Bell;
            return (
              <button
                key={n._id}
                onClick={() => !n.isRead && markRead.mutate(n._id)}
                className={cn(
                  "flex w-full items-start gap-3 px-3.5 py-2.5 text-left hover:bg-ink-50",
                  !n.isRead && "bg-brand-50/50"
                )}
              >
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-100 text-ink-500">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm text-ink-700">{n.message}</p>
                  <p className="mt-0.5 text-xs text-ink-400">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" />}
              </button>
            );
          })
        )}
      </div>
      <div className="border-t border-ink-100 px-3.5 py-2">
        <Link to="/notifications" className="text-xs font-medium text-brand-600 hover:underline">
          View all notifications
        </Link>
      </div>
    </Dropdown>
  );
}
