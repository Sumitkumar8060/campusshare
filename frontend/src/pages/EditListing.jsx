import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getItemById, updateItem } from "@/api/items";
import { useAuth } from "@/hooks/useAuth";
import { ListingForm } from "@/components/listings/ListingForm";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/EmptyState";

function toDateInputValue(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export default function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const {
    data: item,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["item", id],
    queryFn: () => getItemById(id),
  });

  const mutation = useMutation({
    mutationFn: (payload) => updateItem(id, payload),
    onSuccess: () => {
      toast.success("Listing updated!");
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: ["item", id] });
      navigate(`/listings/${id}`);
    },
    onError: (err) => toast.error(err.message || "Could not update listing"),
  });

  if (isLoading) {
    return (
      <div className="container-page max-w-3xl py-10">
        <Skeleton className="h-8 w-1/3" />
        <div className="mt-6 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !item) {
    return (
      <div className="container-page py-10">
        <ErrorState
          title="Couldn't load this listing"
          description="It may have been deleted, or the link is incorrect."
          onRetry={refetch}
        />
      </div>
    );
  }

  if (item.owner?._id !== user?._id) {
    return (
      <div className="container-page py-10">
        <ErrorState
          title="Not authorized"
          description="You can only edit listings that you own."
        />
      </div>
    );
  }

  const defaultValues = {
    name: item.name || "",
    category: item.category || "",
    description: item.description || "",
    condition: item.condition || "Good",
    listingType: item.listingType || "Sell",
    price: item.price || 0,
    rentPricePerDay: item.rentPricePerDay || 0,
    securityDeposit: item.securityDeposit || 0,
    availableFrom: toDateInputValue(item.availableFrom),
    availableUntil: toDateInputValue(item.availableUntil),
    quantity: item.quantity || 1,
    location: item.location || "",
    images: item.images?.length ? item.images.map((url) => ({ value: url })) : [{ value: "" }],
  };

  return (
    <div className="container-page max-w-3xl py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink-900 sm:text-3xl">Edit listing</h1>
        <p className="mt-1 text-ink-500">Update the details of "{item.name}".</p>
      </div>
      <Card>
        <CardContent className="p-6 sm:p-8">
          <ListingForm
            mode="edit"
            defaultValues={defaultValues}
            onSubmit={(payload) => mutation.mutate(payload)}
            submitLabel="Save changes"
            loading={mutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
