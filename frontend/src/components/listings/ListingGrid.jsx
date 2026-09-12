import { PackageSearch } from "lucide-react";
import { ListingCard } from "@/components/listings/ListingCard";
import { Skeleton } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/EmptyState";

export function ListingSkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-5 w-1/3" />
      </div>
    </div>
  );
}

export function ListingGrid({ items, isLoading, isError, onRetry, emptyAction, onEmptyAction }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ListingSkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Couldn't load listings"
        description="We had trouble reaching the server. Please try again."
        onRetry={onRetry}
      />
    );
  }

  if (!items || items.length === 0) {
    return (
      <EmptyState
        icon={PackageSearch}
        title="No listings found"
        description="Try adjusting your search or filters, or check back later for new items."
        actionLabel={emptyAction?.label}
        actionHref={emptyAction?.href}
        onAction={onEmptyAction}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <ListingCard key={item._id} item={item} />
      ))}
    </div>
  );
}
