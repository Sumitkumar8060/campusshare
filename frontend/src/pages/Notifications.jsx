import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { getNotifications, markNotificationRead } from "@/api/notifications";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { Skeleton } from "@/components/ui/Spinner";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";

export default function Notifications() {
  const queryClient = useQueryClient();

  const {
    data: notifications,
    isLoading,
    isError,
    refetch,
  } = useQuery({ queryKey: ["notifications"], queryFn: getNotifications });

  const markRead = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  return (
    <div className="container-page max-w-3xl py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink-900 sm:text-3xl">Notifications</h1>
        <p className="mt-1 text-ink-500">Stay updated on requests and activity for your listings.</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : !notifications || notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="You don't have any notifications"
          description="You'll be notified here when someone requests your items or responds to your requests."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <NotificationItem
              key={n._id}
              notification={n}
              onMarkRead={(id) => markRead.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
