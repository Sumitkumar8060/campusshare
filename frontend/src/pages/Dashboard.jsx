import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Package,
  CheckCircle2,
  SendHorizonal,
  Inbox,
  Clock,
  Bell,
  PlusCircle,
  ListChecks,
} from "lucide-react";
import { getItems } from "@/api/items";
import { getMyRequests, getIncomingRequests } from "@/api/requests";
import { getNotifications } from "@/api/notifications";
import { useAuth } from "@/hooks/useAuth";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Spinner";
import { Badge, listingTypeMeta, requestStatusMeta } from "@/components/ui/Badge";
import { timeAgo } from "@/lib/utils";

export default function Dashboard() {
  const { user } = useAuth();

  const { data: allItems, isLoading: itemsLoading } = useQuery({
    queryKey: ["items", "mine-source"],
    queryFn: () => getItems({}),
  });
  const { data: sentRequests, isLoading: sentLoading } = useQuery({
    queryKey: ["requests", "my"],
    queryFn: getMyRequests,
  });
  const { data: incomingRequests, isLoading: incomingLoading } = useQuery({
    queryKey: ["requests", "incoming"],
    queryFn: getIncomingRequests,
  });
  const { data: notifications, isLoading: notifLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
  });

  const myItems = (allItems || []).filter((i) => i.owner?._id === user?._id);
  const activeItems = myItems.filter((i) => i.isAvailable);
  const pendingIncoming = (incomingRequests || []).filter((r) => r.status === "PENDING");
  const unreadNotifications = (notifications || []).filter((n) => !n.isRead);

  const isLoading = itemsLoading || sentLoading || incomingLoading || notifLoading;

  return (
    <div className="container-page py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink-900 sm:text-3xl">
          Welcome back, {user?.name?.split(" ")[0] || "there"} 👋
        </h1>
        <p className="mt-1 text-ink-500">Here's what's happening with your CampusShare activity.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <StatCard icon={Package} label="Total listings" value={myItems.length} tone="brand" />
          <StatCard icon={CheckCircle2} label="Active listings" value={activeItems.length} tone="emerald" />
          <StatCard icon={SendHorizonal} label="Requests sent" value={sentRequests?.length || 0} tone="blue" />
          <StatCard icon={Inbox} label="Requests received" value={incomingRequests?.length || 0} tone="blue" />
          <StatCard icon={Clock} label="Pending on your items" value={pendingIncoming.length} tone="amber" />
          <StatCard icon={Bell} label="Unread notifications" value={unreadNotifications.length} tone="amber" />
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/listings/create">
          <Button>
            <PlusCircle className="h-4 w-4" /> Create listing
          </Button>
        </Link>
        <Link to="/my-listings">
          <Button variant="secondary">
            <ListChecks className="h-4 w-4" /> Manage my listings
          </Button>
        </Link>
        <Link to="/requests/received">
          <Button variant="secondary">
            <Inbox className="h-4 w-4" /> View received requests
          </Button>
        </Link>
        <Link to="/requests/sent">
          <Button variant="secondary">
            <SendHorizonal className="h-4 w-4" /> View sent requests
          </Button>
        </Link>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h2 className="font-semibold text-ink-900">Your recent listings</h2>
            <Link to="/my-listings" className="text-sm font-medium text-brand-600 hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent className="space-y-3 p-4">
            {myItems.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-ink-400">
                You haven't created any listings yet.
              </p>
            ) : (
              myItems.slice(0, 4).map((item) => {
                const { variant, label } = listingTypeMeta(item.listingType);
                return (
                  <Link
                    key={item._id}
                    to={`/listings/${item._id}`}
                    className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-ink-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink-900">{item.name}</p>
                      <p className="text-xs text-ink-400">{timeAgo(item.createdAt)}</p>
                    </div>
                    <Badge variant={variant}>{label}</Badge>
                  </Link>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <h2 className="font-semibold text-ink-900">Recent requests received</h2>
            <Link to="/requests/received" className="text-sm font-medium text-brand-600 hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent className="space-y-3 p-4">
            {(incomingRequests || []).length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-ink-400">
                No requests on your listings yet.
              </p>
            ) : (
              incomingRequests.slice(0, 4).map((r) => {
                const statusMeta = requestStatusMeta(r.status);
                return (
                  <div key={r._id} className="flex items-center justify-between rounded-lg px-2 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink-900">
                        {r.requester?.name} → {r.item?.name || "Item"}
                      </p>
                      <p className="text-xs text-ink-400">{timeAgo(r.createdAt)}</p>
                    </div>
                    <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
