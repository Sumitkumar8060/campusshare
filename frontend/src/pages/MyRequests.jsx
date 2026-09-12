import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { SendHorizonal } from "lucide-react";
import { getMyRequests } from "@/api/requests";
import { RequestCard } from "@/components/requests/RequestCard";
import { Skeleton } from "@/components/ui/Spinner";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";

export default function MyRequests() {
  const {
    data: requests,
    isLoading,
    isError,
    refetch,
  } = useQuery({ queryKey: ["requests", "my"], queryFn: getMyRequests });

  return (
    <div className="container-page py-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-900 sm:text-3xl">Requests sent</h1>
          <p className="mt-1 text-ink-500">Track the items you've requested from other students.</p>
        </div>
        <Link
          to="/requests/received"
          className="hidden text-sm font-semibold text-brand-600 hover:underline sm:block"
        >
          View received requests →
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : !requests || requests.length === 0 ? (
        <EmptyState
          icon={SendHorizonal}
          title="You haven't sent any requests"
          description="Browse listings and request items you'd like to rent, buy, or receive."
          actionLabel="Browse listings"
          actionHref="/listings"
        />
      ) : (
        <div className="space-y-4">
          {requests.map((r) => (
            <RequestCard key={r._id} request={r} perspective="sent" />
          ))}
        </div>
      )}
    </div>
  );
}
