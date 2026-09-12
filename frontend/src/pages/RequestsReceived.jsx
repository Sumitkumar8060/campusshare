import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Inbox } from "lucide-react";
import { getIncomingRequests, acceptRequest, rejectRequest } from "@/api/requests";
import { RequestCard } from "@/components/requests/RequestCard";
import { Skeleton } from "@/components/ui/Spinner";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";

export default function RequestsReceived() {
  const queryClient = useQueryClient();
  const [pendingAction, setPendingAction] = useState(null);

  const {
    data: requests,
    isLoading,
    isError,
    refetch,
  } = useQuery({ queryKey: ["requests", "incoming"], queryFn: getIncomingRequests });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["requests"] });
    queryClient.invalidateQueries({ queryKey: ["items"] });
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  }

  const accept = useMutation({
    mutationFn: acceptRequest,
    onMutate: (id) => setPendingAction(`accept-${id}`),
    onSuccess: () => {
      toast.success("Request accepted");
      invalidate();
    },
    onError: (err) => toast.error(err.message || "Could not accept request"),
    onSettled: () => setPendingAction(null),
  });

  const reject = useMutation({
    mutationFn: rejectRequest,
    onMutate: (id) => setPendingAction(`reject-${id}`),
    onSuccess: () => {
      toast.success("Request rejected");
      invalidate();
    },
    onError: (err) => toast.error(err.message || "Could not reject request"),
    onSettled: () => setPendingAction(null),
  });

  return (
    <div className="container-page py-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-900 sm:text-3xl">Requests received</h1>
          <p className="mt-1 text-ink-500">Review and respond to requests for your listings.</p>
        </div>
        <Link
          to="/requests/sent"
          className="hidden text-sm font-semibold text-brand-600 hover:underline sm:block"
        >
          View sent requests →
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
          icon={Inbox}
          title="No requests yet"
          description="Once you list an item, requests from interested students will appear here."
          actionLabel="Create a listing"
          actionHref="/listings/create"
        />
      ) : (
        <div className="space-y-4">
          {requests.map((r) => (
            <RequestCard
              key={r._id}
              request={r}
              perspective="received"
              onAccept={(id) => accept.mutate(id)}
              onReject={(id) => reject.mutate(id)}
              actionLoading={pendingAction}
            />
          ))}
        </div>
      )}
    </div>
  );
}
