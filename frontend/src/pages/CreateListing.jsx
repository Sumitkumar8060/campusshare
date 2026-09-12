import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createItem } from "@/api/items";
import { ListingForm } from "@/components/listings/ListingForm";
import { Card, CardContent } from "@/components/ui/Card";

export default function CreateListing() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createItem,
    onSuccess: (item) => {
      toast.success("Listing created!");
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: ["my-items"] });
      navigate(`/listings/${item._id}`);
    },
    onError: (err) => toast.error(err.message || "Could not create listing"),
  });

  return (
    <div className="container-page max-w-3xl py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink-900 sm:text-3xl">Create a listing</h1>
        <p className="mt-1 text-ink-500">Share an item with students on your campus.</p>
      </div>
      <Card>
        <CardContent className="p-6 sm:p-8">
          <ListingForm
            onSubmit={(payload) => mutation.mutate(payload)}
            submitLabel="Publish listing"
            loading={mutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
