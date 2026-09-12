import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  MapPin,
  School,
  Pencil,
  Trash2,
  ImageOff,
  Package,
  CalendarDays,
  ShieldCheck,
} from "lucide-react";
import { getItemById, deleteItem } from "@/api/items";
import { createRequest } from "@/api/requests";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Badge, listingTypeMeta } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/EmptyState";
import { Dialog } from "@/components/ui/Dialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Textarea } from "@/components/ui/Textarea";
import { Label, FieldError } from "@/components/ui/Label";
import { Avatar } from "@/components/ui/Avatar";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ListingPrice } from "@/components/listings/ListingCard";

const requestSchema = z.object({
  message: z.string().max(500, "Message is too long").optional(),
});

export default function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();

  const [activeImage, setActiveImage] = useState(0);
  const [requestOpen, setRequestOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const {
    data: item,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["item", id],
    queryFn: () => getItemById(id),
  });

  const isOwner = isAuthenticated && item && item.owner?._id === user?._id;

  const requestMutation = useMutation({
    mutationFn: (payload) => createRequest(payload),
    onSuccess: () => {
      toast.success("Request sent to the owner!");
      setRequestOpen(false);
      queryClient.invalidateQueries({ queryKey: ["requests"] });
    },
    onError: (err) => toast.error(err.message || "Could not send request"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteItem(id),
    onSuccess: () => {
      toast.success("Listing deleted");
      queryClient.invalidateQueries({ queryKey: ["items"] });
      navigate("/my-listings");
    },
    onError: (err) => toast.error(err.message || "Could not delete listing"),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(requestSchema) });

  function handleRequestClick() {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/listings/${id}` } });
      return;
    }
    setRequestOpen(true);
  }

  function onSubmitRequest(values) {
    requestMutation.mutate({ itemId: id, message: values.message || "" });
  }

  if (isLoading) {
    return (
      <div className="container-page py-10">
        <div className="grid gap-8 lg:grid-cols-2">
          <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
          <div className="space-y-3">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !item) {
    return (
      <div className="container-page py-10">
        <ErrorState
          title="Listing not found"
          description="This listing may have been removed or the link is incorrect."
          onRetry={refetch}
        />
      </div>
    );
  }

  const { variant, label } = listingTypeMeta(item.listingType);
  const images = item.images?.length ? item.images : [];

  return (
    <div className="container-page py-10">
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-ink-100">
            {images.length > 0 ? (
              <img
                src={images[activeImage]}
                alt={item.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-ink-300">
                <ImageOff className="h-16 w-16" />
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={img + i}
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${
                    activeImage === i ? "border-brand-500" : "border-transparent"
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={variant}>{label}</Badge>
            <Badge variant="neutral">{item.condition}</Badge>
            {!item.isAvailable && <Badge variant="danger">Currently unavailable</Badge>}
          </div>

          <h1 className="mt-3 text-3xl font-bold text-ink-900">{item.name}</h1>
          <p className="mt-1 text-ink-500">{item.category}</p>

          <div className="mt-4">
            <ListingPrice item={item} />
            {item.listingType === "Rent" && item.securityDeposit > 0 && (
              <p className="mt-1 text-sm text-ink-500">
                + {formatCurrency(item.securityDeposit)} refundable security deposit
              </p>
            )}
          </div>

          <p className="mt-5 whitespace-pre-line text-ink-700">{item.description}</p>

          <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-ink-600">
              <MapPin className="h-4 w-4 text-ink-400" />
              {item.location}
            </div>
            <div className="flex items-center gap-2 text-ink-600">
              <Package className="h-4 w-4 text-ink-400" />
              Qty: {item.quantity ?? 1}
            </div>
            {item.availableFrom && (
              <div className="flex items-center gap-2 text-ink-600">
                <CalendarDays className="h-4 w-4 text-ink-400" />
                From {formatDate(item.availableFrom)}
              </div>
            )}
            {item.availableUntil && (
              <div className="flex items-center gap-2 text-ink-600">
                <CalendarDays className="h-4 w-4 text-ink-400" />
                Until {formatDate(item.availableUntil)}
              </div>
            )}
          </div>

          {/* Owner card */}
          <Card className="mt-6">
            <CardContent className="flex items-center gap-3 p-4">
              <Avatar name={item.owner?.name} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink-900">{item.owner?.name}</p>
                {item.owner?.college && (
                  <p className="flex items-center gap-1 truncate text-xs text-ink-500">
                    <School className="h-3.5 w-3.5" /> {item.owner.college}
                  </p>
                )}
              </div>
              <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-500" />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="mt-6 flex flex-wrap gap-3">
            {isOwner ? (
              <>
                <Link to={`/listings/${id}/edit`}>
                  <Button variant="secondary">
                    <Pencil className="h-4 w-4" /> Edit listing
                  </Button>
                </Link>
                <Button variant="outlineDanger" onClick={() => setDeleteOpen(true)}>
                  <Trash2 className="h-4 w-4" /> Delete
                </Button>
              </>
            ) : (
              <Button
                size="lg"
                disabled={!item.isAvailable}
                onClick={handleRequestClick}
                className="flex-1 sm:flex-none"
              >
                {item.isAvailable
                  ? item.listingType === "Rent"
                    ? "Request to rent"
                    : item.listingType === "GiveAway"
                    ? "Request this item"
                    : "Request to buy"
                  : "Currently unavailable"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Request modal */}
      <Dialog
        open={requestOpen}
        onClose={() => setRequestOpen(false)}
        title={`Send a request for "${item.name}"`}
        description="Let the owner know why you're interested — this helps them respond faster."
      >
        <form
          onSubmit={handleSubmit(onSubmitRequest)}
          onReset={() => reset()}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="message">Message (optional)</Label>
            <Textarea
              id="message"
              placeholder="Hi! I'm interested in this item — is it still available?"
              error={!!errors.message}
              {...register("message")}
            />
            <FieldError message={errors.message?.message} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setRequestOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={requestMutation.isPending}>
              Send request
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Delete this listing?"
        description="This action cannot be undone. The listing will be permanently removed."
        confirmLabel="Delete listing"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
