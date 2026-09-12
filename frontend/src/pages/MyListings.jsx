import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Trash2, PlusCircle, ImageOff } from "lucide-react";
import { getItems, deleteItem } from "@/api/items";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, listingTypeMeta } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Spinner";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ListingPrice } from "@/components/listings/ListingCard";
import { timeAgo } from "@/lib/utils";

export default function MyListings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState(null);

  // The backend has no "my listings" endpoint — GET /api/items returns everything,
  // so we filter client-side by owner._id, which is populated on each item.
  const {
    data: allItems,
    isLoading,
    isError,
    refetch,
  } = useQuery({ queryKey: ["items", "mine-source"], queryFn: () => getItems({}) });

  const myItems = (allItems || []).filter((i) => i.owner?._id === user?._id);

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteItem(id),
    onSuccess: () => {
      toast.success("Listing deleted");
      queryClient.invalidateQueries({ queryKey: ["items"] });
      setDeleteTarget(null);
    },
    onError: (err) => toast.error(err.message || "Could not delete listing"),
  });

  return (
    <div className="container-page py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-900 sm:text-3xl">My listings</h1>
          <p className="mt-1 text-ink-500">Manage the items you've shared on CampusShare.</p>
        </div>
        <Link to="/listings/create">
          <Button>
            <PlusCircle className="h-4 w-4" /> Create listing
          </Button>
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
      ) : myItems.length === 0 ? (
        <EmptyState
          icon={PlusCircle}
          title="You haven't created any listings yet"
          description="Share something you no longer need — a book, a cycle, or spare electronics."
          actionLabel="Create your first listing"
          actionHref="/listings/create"
        />
      ) : (
        <div className="space-y-4">
          {myItems.map((item) => {
            const { variant, label } = listingTypeMeta(item.listingType);
            return (
              <Card key={item._id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                <Link
                  to={`/listings/${item._id}`}
                  className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-ink-100"
                >
                  {item.images?.[0] ? (
                    <img src={item.images[0]} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <ImageOff className="h-6 w-6 text-ink-300" />
                  )}
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link to={`/listings/${item._id}`} className="font-semibold text-ink-900 hover:text-brand-600">
                      {item.name}
                    </Link>
                    <Badge variant={variant}>{label}</Badge>
                    <Badge variant={item.isAvailable ? "success" : "neutral"}>
                      {item.isAvailable ? "Available" : "Unavailable"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-ink-500">{item.category}</p>
                  <div className="mt-1.5 flex items-center gap-3">
                    <ListingPrice item={item} />
                    <span className="text-xs text-ink-400">Listed {timeAgo(item.createdAt)}</span>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Link to={`/listings/${item._id}/edit`}>
                    <Button size="sm" variant="secondary">
                      <Pencil className="h-4 w-4" /> Edit
                    </Button>
                  </Link>
                  <Button size="sm" variant="outlineDanger" onClick={() => setDeleteTarget(item)}>
                    <Trash2 className="h-4 w-4" /> Delete
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
        title="Delete this listing?"
        description={`"${deleteTarget?.name}" will be permanently removed. This cannot be undone.`}
        confirmLabel="Delete listing"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
